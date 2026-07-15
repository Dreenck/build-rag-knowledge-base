import pytest
from fastapi.testclient import TestClient
from main import app, get_current_user, get_db

class MockDB:
    def __init__(self):
        self.added = []
    def query(self, model):
        return self
    def filter(self, *args):
        return self
    def first(self):
        return None
    def all(self):
        return []
    def add(self, instance):
        self.added.append(instance)
    def commit(self):
        pass
    def refresh(self, instance):
        instance.id = "mock_id"
    def delete(self):
        pass
    def order_by(self, *args):
        return self
    def limit(self, *args):
        return self
    def join(self, *args):
        return self

def override_get_db():
    yield MockDB()

def override_get_current_user():
    return "test_user_123"

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

def test_get_notes():
    response = client.get("/api/notes")
    assert response.status_code == 200
    assert response.json() == []

def test_create_note(mocker):
    mocker.patch("main.get_embedding", return_value=[0.1]*384)
    response = client.post("/api/notes", json={"title": "Test", "content": "Test note\n\nChunk 2"})
    assert response.status_code == 200
    assert response.json()["title"] == "Test"

def test_chat(mocker):
    mocker.patch("main.get_embedding", return_value=[0.1]*384)
    mocker.patch("os.getenv", return_value="") # mock no groq API key
    response = client.post("/api/chat", json={"content": "Hello"})
    assert response.status_code == 200
    assert "GROQ_API_KEY is not set" in response.json()["reply"]
