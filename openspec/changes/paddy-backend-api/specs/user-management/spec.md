## ADDED Requirements

### Requirement: Admin can list all users
The system SHALL allow admin users to view all registered operator and manager accounts.

#### Scenario: List users
- **WHEN** admin requests user list
- **THEN** system returns all users with id, username, role, and createdAt

### Requirement: Admin can create a new user
The system SHALL allow admin users to create new operator or manager accounts.

#### Scenario: Create user successfully
- **WHEN** admin creates a new user with unique username and valid role
- **THEN** system returns 201 with user info (excluding password)

#### Scenario: Duplicate username
- **WHEN** admin creates a user with an existing username
- **THEN** system returns 409 DUPLICATE_USERNAME error

### Requirement: Admin can delete a user
The system SHALL allow admin users to delete existing operator or manager accounts.

#### Scenario: Delete existing user
- **WHEN** admin deletes an existing user
- **THEN** system returns success message

### Requirement: Admin can reset a user's password
The system SHALL allow admin users to reset the password of any operator or manager account.

#### Scenario: Reset password
- **WHEN** admin submits newPassword for a user
- **THEN** system updates the user's password and returns success message
