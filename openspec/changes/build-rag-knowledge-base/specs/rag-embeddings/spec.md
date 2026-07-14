## ADDED Requirements

### Requirement: Note Embeddings Generation
The system SHALL chunk note content and generate embeddings when notes are created or updated.

#### Scenario: Process New Note
- **WHEN** a note is created
- **THEN** system chunks the content, generates vector embeddings using the configured embedding model, and stores them in pgvector

#### Scenario: Process Updated Note
- **WHEN** a note is updated
- **THEN** system removes old chunks/embeddings, and processes the new content into fresh embeddings

### Requirement: Data Isolation
Vector searches MUST be scoped strictly to the authenticated user's vectors.

#### Scenario: Embeddings Isolation
- **WHEN** a vector search is performed
- **THEN** the system only searches across vectors belonging to the user making the request
