## ADDED Requirements

### Requirement: User Login and Registration
The system SHALL support user registration and authentication via Google and GitHub OAuth using Clerk.

#### Scenario: Authenticate via OAuth
- **WHEN** user logs in with Google or GitHub
- **THEN** a valid session is created and a JWT is issued

### Requirement: API Security
All API endpoints (except public auth) MUST require a valid Clerk session JWT.

#### Scenario: Protected Endpoint Access
- **WHEN** user makes a request with a valid JWT
- **THEN** the request proceeds and user identity is verified server-side

#### Scenario: Unauthorized Access
- **WHEN** request is made without a valid JWT
- **THEN** the system rejects the request with a 401 Unauthorized error
