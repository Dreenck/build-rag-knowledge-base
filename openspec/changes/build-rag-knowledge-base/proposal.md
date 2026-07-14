## Why

To build a modern, personal knowledge base web application where users can write markdown notes and query them using natural language. This project will serve as a standout portfolio piece demonstrating full-stack proficiency, enterprise-ready data handling, and highly-demanded AI/RAG (Retrieval-Augmented Generation) capabilities.

## What Changes

- Implement a responsive UI for note management (create, view, edit, delete markdown notes).
- Implement user authentication and session management using Clerk, with Google and GitHub OAuth support.
- Implement RAG capability: whenever a note is created/updated, it is chunked, embedded, and stored.
- Add an AI Chat Interface where users can ask questions about their own notes.
- Integrate Neon PostgreSQL with pgvector for data storage.
- Integrate LLM APIs (Groq or Gemini) for text generation and free/open-source embedding models.
- Set up automated testing and linting pipelines via GitHub Actions.

## Capabilities

### New Capabilities
- `note-management`: Create, view, edit, and delete markdown notes with privacy scoping.
- `rag-embeddings`: Chunk and embed notes upon creation/update using pgvector and open-source models.
- `ai-chat`: Interface for asking questions about notes, using RAG to fetch context and an LLM to answer.
- `user-auth`: Authentication, session management, and resource protection using Clerk.

### Modified Capabilities

## Impact

- Introduces a new monorepo containing a React/Vite frontend and FastAPI backend.
- Sets up database schema for users, notes, note chunks, embeddings, chat sessions, and messages.
- Introduces GitHub Actions for CI/CD.
