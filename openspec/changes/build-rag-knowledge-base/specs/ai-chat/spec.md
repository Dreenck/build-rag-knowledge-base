## ADDED Requirements

### Requirement: Contextual AI Chat
The system SHALL provide a chat interface where users can ask questions about their notes.

#### Scenario: Perform Semantic Search
- **WHEN** user submits a question
- **THEN** system generates an embedding for the query and retrieves the most relevant note chunks from pgvector

#### Scenario: Generate Answer
- **WHEN** relevant note chunks are retrieved
- **THEN** system builds a context window, sends it along with the user's question to the LLM, and returns the response with citations
