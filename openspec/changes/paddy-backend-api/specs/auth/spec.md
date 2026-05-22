## ADDED Requirements

### Requirement: User can log in with username and password
The system SHALL authenticate users (operator/manager/admin) via username and password, returning a JWT access token and refresh token.

#### Scenario: Successful login
- **WHEN** user submits valid username and password
- **THEN** system returns accessToken (2h expiry), refreshToken (7d expiry), and user info (id, username, role)

#### Scenario: Invalid credentials
- **WHEN** user submits incorrect username or password
- **THEN** system returns 401 INVALID_CREDENTIALS error

### Requirement: User can refresh an expired access token
The system SHALL accept a valid refresh token and return a new accessToken + refreshToken pair.

#### Scenario: Successful token refresh
- **WHEN** user submits a valid, non-expired refresh token
- **THEN** system returns a new accessToken and refreshToken

#### Scenario: Expired refresh token
- **WHEN** user submits an expired refresh token
- **THEN** system returns 401 TOKEN_EXPIRED error
