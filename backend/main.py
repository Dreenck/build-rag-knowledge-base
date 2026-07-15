from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
from sqlalchemy import create_engine
from models import NoteChunk
from models import Note
from datetime import datetime
from typing import List
from models import User
from sqlalchemy.orm import sessionmaker
import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
from dotenv import load_dotenv

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

CLERK_ISSUER_URL = os.getenv("CLERK_ISSUER_URL")
jwks_url = f"{CLERK_ISSUER_URL}/.well-known/jwks.json" if CLERK_ISSUER_URL else ""
jwk_client = PyJWKClient(jwks_url) if CLERK_ISSUER_URL else None


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        if not jwk_client:
            raise Exception("CLERK_ISSUER_URL not configured")
        # verify token using PyJWKClient cache
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        data = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER_URL,
            options={"verify_aud": False},
            leeway=60
        )
        return data.get("sub")
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


engine = create_engine(os.getenv("DATABASE_URL"))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/me")
def read_users_me(user_id: str = Depends(get_current_user)):
    return {"user_id": user_id}


@app.post("/api/sync-user")
def sync_user(user_id: str = Depends(get_current_user), db=Depends(get_db)):
    if not db.query(User).filter(User.id == user_id).first():
        db.add(User(id=user_id))
        db.commit()
    return {"status": "ok", "user_id": user_id}


class NoteCreate(BaseModel):
    title: str
    content: str


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class NoteOut(BaseModel):
    id: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@app.get("/api/notes", response_model=List[NoteOut])
def get_notes(user_id: str = Depends(get_current_user), db=Depends(get_db)):
    return db.query(Note).filter(Note.user_id == user_id).order_by(Note.updated_at.desc()).all()


embedding_model = SentenceTransformer('BAAI/bge-small-en-v1.5')


def chunk_text(text: str):
    return [c.strip() for c in text.split('\n\n') if c.strip()]


def get_embedding(text: str):
    return embedding_model.encode(text).tolist()


@app.post("/api/notes", response_model=NoteOut)
def create_note(note: NoteCreate, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    db_note = Note(user_id=user_id, title=note.title, content=note.content)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)

    chunks = chunk_text(note.content)
    for idx, c in enumerate(chunks):
        emb = get_embedding(c)
        db.add(NoteChunk(note_id=db_note.id,
               chunk_index=idx, content=c, embedding=emb))
    db.commit()

    return db_note


@app.put("/api/notes/{note_id}", response_model=NoteOut)
def update_note(note_id: str, note: NoteUpdate, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id,
                                    Note.user_id == user_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.title is not None:
        db_note.title = note.title
    if note.content is not None:
        db_note.content = note.content

        db.query(NoteChunk).filter(NoteChunk.note_id == note_id).delete()
        chunks = chunk_text(note.content)
        for idx, c in enumerate(chunks):
            emb = get_embedding(c)
            db.add(NoteChunk(note_id=note_id,
                   chunk_index=idx, content=c, embedding=emb))

    db.commit()
    db.refresh(db_note)
    return db_note

from models import ChatSession, ChatMessage
from groq import Groq
import os

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", "dummy_key"))

class ChatMessageCreate(BaseModel):
    content: str

@app.post("/api/chat")
def chat(message: ChatMessageCreate, user_id: str = Depends(get_current_user), db = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.user_id == user_id).first()
    if not session:
        session = ChatSession(user_id=user_id)
        db.add(session)
        db.commit()
    
    user_msg = ChatMessage(session_id=session.id, role="user", content=message.content)
    db.add(user_msg)
    
    query_emb = get_embedding(message.content)
    results = db.query(NoteChunk).join(Note).filter(Note.user_id == user_id).order_by(NoteChunk.embedding.cosine_distance(query_emb)).limit(5).all()
    
    context = "\n".join([r.content for r in results])
    system_prompt = f"You are a helpful assistant. Use the following context from the user's notes to answer their question:\n\n{context}"
    
    if not os.getenv("GROQ_API_KEY"):
        bot_reply = "I found relevant notes, but GROQ_API_KEY is not set.\n\nContext:\n" + context
    else:
        try:
            completion = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message.content}
                ]
            )
            bot_reply = completion.choices[0].message.content
        except Exception as e:
            bot_reply = f"Error generating response: {str(e)}"
            
    bot_msg = ChatMessage(session_id=session.id, role="assistant", content=bot_reply)
    db.add(bot_msg)
    db.commit()
    
    return {"reply": bot_reply}

@app.get("/api/chat/history")
def get_chat_history(user_id: str = Depends(get_current_user), db = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.user_id == user_id).first()
    if not session:
        return []
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc()).all()
    return [{"role": m.role, "content": m.content} for m in messages]

@app.delete("/api/chat/history")
def clear_chat_history(user_id: str = Depends(get_current_user), db = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.user_id == user_id).first()
    if session:
        db.query(ChatMessage).filter(ChatMessage.session_id == session.id).delete()
        db.commit()
    return {"status": "ok"}



@app.delete("/api/notes/{note_id}")
def delete_note(note_id: str, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id,
                                    Note.user_id == user_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(db_note)
    db.commit()
    return {"status": "ok"}
