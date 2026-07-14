## 1. Project Initialization

- [x] 1.1 Initialize monorepo directory structure
- [x] 1.2 Initialize React/Vite frontend with TailwindCSS
- [x] 1.3 Initialize FastAPI backend with SQLAlchemy and Alembic
- [x] 1.4 Set up GitHub Actions CI/CD workflows for linting and testing

## 2. Authentication & Database Setup

- [ ] 2.1 Set up Clerk authentication in React frontend
- [ ] 2.2 Configure FastAPI backend to verify Clerk JWTs
- [ ] 2.3 Set up Neon PostgreSQL database and apply initial migrations for User table
- [ ] 2.4 Create API route for syncing authenticated user data

## 3. Note Management Implementation

- [ ] 3.1 Create database schema/migrations for Notes
- [ ] 3.2 Implement backend CRUD API endpoints for Notes
- [ ] 3.3 Build frontend UI for creating, viewing, editing, and deleting markdown notes
- [ ] 3.4 Ensure notes are securely scoped to the authenticated user

## 4. RAG & Embeddings Implementation

- [ ] 4.1 Set up pgvector extension in PostgreSQL and apply migrations for Chunks/Embeddings
- [ ] 4.2 Implement text chunking logic for markdown notes
- [ ] 4.3 Integrate open-source embedding model (e.g., BAAI/bge-small-en-v1.5)
- [ ] 4.4 Update Note creation/editing API to generate and store embeddings

## 5. AI Chat Interface

- [ ] 5.1 Create database schema for Chat Sessions and Messages
- [ ] 5.2 Build frontend Chat Interface component
- [ ] 5.3 Implement vector similarity search query against pgvector
- [ ] 5.4 Integrate LLM API (Groq/Gemini) to generate answers based on context
- [ ] 5.5 Implement backend chat API endpoint to handle queries, perform search, and invoke LLM
