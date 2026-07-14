## Context

To demonstrate full-stack proficiency, enterprise-ready data handling, and AI/RAG capabilities, we are building a personal knowledge base web application where users can write markdown notes and query them using natural language. The system must support user authentication, securely scoped resources, vector-based similarity search using LLMs, and be visually appealing.

## Goals / Non-Goals

**Goals:**
- A clean, responsive UI for users to manage markdown notes.
- RAG Capabilities: chunking, embedding, and vector storage of notes upon creation/update.
- AI Chat Interface for querying notes contextually.
- Premium aesthetics using TailwindCSS.
- Secure Auth and OAuth login using Clerk.
- GitHub Actions CI/CD for linting, testing, and verifying DB migrations.

**Non-Goals:**
- Production deployment or scaling (it's 100% for development/portfolio showcasing).
- Multi-user collaboration (strictly private notes).
- Complex rich text features (focus on standard markdown).

## Decisions

- **Monorepo Architecture:** Frontend (React/Vite) and Backend (FastAPI) will live in the same repository for better developer experience and unified CI/CD.
- **PostgreSQL with pgvector:** Instead of a dedicated vector database (Pinecone, Chroma, etc.), Neon PostgreSQL + pgvector will serve as both the primary relational DB and the vector DB. This simplifies architecture and reduces dependencies.
- **Clerk for Authentication:** Clerk will handle auth (Google/GitHub OAuth). The backend will verify JWTs issued by Clerk to secure endpoints.
- **Groq or Gemini for LLM:** We will use free-tier friendly APIs (Groq for Llama-3 or Gemini) instead of OpenAI.
- **Open-source Embeddings:** BAAI/bge-small-en-v1.5 or bge-base-en-v1.5 (via HuggingFace or free API tier) will be used to generate note embeddings to store in pgvector.

## Risks / Trade-offs

- **[Risk] RAG retrieval accuracy:** Using a simple chunking logic might miss semantic context. -> **Mitigation**: Start with simple static chunking; use LangChain/LlamaIndex if needed to refine chunking/retrieval strategy, but avoid over-engineering.
- **[Risk] Free API rate limits:** Groq or Gemini might rate-limit if usage spikes. -> **Mitigation**: Add rate-limit handling and graceful degradation in the backend.
