## 1. Project Initialization

- [x] 1.1 Initialize monorepo directory structure
- [x] 1.2 Initialize React/Vite frontend with TailwindCSS
- [x] 1.3 Initialize FastAPI backend with SQLAlchemy and Alembic
- [x] 1.4 Set up GitHub Actions CI/CD workflows for linting and testing

## 2. Authentication & Database Setup

- [x] 2.1 Set up Clerk authentication in React frontend
- [x] 2.2 Configure FastAPI backend to verify Clerk JWTs
- [x] 2.3 Set up Neon PostgreSQL database and apply initial migrations for User table
- [x] 2.4 Create API route for syncing authenticated user data

## 3. Note Management Implementation

- [x] 3.1 Create database schema/migrations for Notes
- [x] 3.2 Implement backend CRUD API endpoints for Notes
- [x] 3.3 Build frontend UI for creating, viewing, editing, and deleting markdown notes
- [x] 3.4 Ensure notes are securely scoped to the authenticated user

## 4. RAG & Embeddings Implementation

- [x] 4.1 Set up pgvector extension in PostgreSQL and apply migrations for Chunks/Embeddings
- [x] 4.2 Implement text chunking logic for markdown notes
- [x] 4.3 Integrate open-source embedding model (e.g., BAAI/bge-small-en-v1.5)
- [x] 4.4 Update Note creation/editing API to generate and store embeddings

## 5. AI Chat Interface

- [x] 5.1 Create database schema for Chat Sessions and Messages
- [x] 5.2 Build frontend Chat Interface component
- [x] 5.3 Implement vector similarity search query against pgvector
- [x] 5.4 Integrate LLM API (Groq/Gemini) to generate answers based on context
- [x] 5.5 Implement backend chat API endpoint to handle queries, perform search, and invoke LLM

## 6. Testing

- [x] 6.1 Backend unit tests (pytest, mocking DB and LLM)
- [x] 6.2 Frontend unit tests (Vitest, mocking Clerk and API)
