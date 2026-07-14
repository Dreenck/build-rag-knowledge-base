## ADDED Requirements

### Requirement: Manage Markdown Notes
The system SHALL allow users to create, view, edit, and delete their own markdown notes.

#### Scenario: Create Note
- **WHEN** user submits a new note with title and markdown content
- **THEN** system saves the note to the database and sets the `created_at` and `updated_at` timestamps

#### Scenario: View Notes
- **WHEN** user requests their notes list
- **THEN** system returns only notes that belong to the authenticated user

#### Scenario: Edit Note
- **WHEN** user updates an existing note
- **THEN** system updates the note in the database and modifies the `updated_at` timestamp

#### Scenario: Delete Note
- **WHEN** user requests deletion of a note
- **THEN** system deletes the note and all associated chunks/embeddings
