## ADDED Requirements

### Requirement: Frontend can switch between mock and real API via environment variable
The system SHALL use VITE_USE_MOCK environment variable to select between mock data and real HTTP requests at build time.

#### Scenario: Development with mock
- **WHEN** VITE_USE_MOCK=true
- **THEN** all API calls return mock data without a running backend

#### Scenario: Production with real API
- **WHEN** VITE_USE_MOCK=false
- **THEN** all API calls go to VITE_API_BASE_URL

### Requirement: Mock and real implementations share the same type definitions
The system SHALL define shared TypeScript interfaces for all API request/response types, used by both mock and real implementations.

#### Scenario: Type consistency
- **WHEN** a new API endpoint is added
- **THEN** mock and real implementations both use the same request/response types

### Requirement: Mock data covers all appointment states
The system SHALL provide mock data covering all appointment statuses (pending, token_assigned, waiting, called, completed, cancelled) and edge cases.

#### Scenario: Mock queue with positions
- **WHEN** driver queries queue position with mock data
- **THEN** system returns realistic position numbers and waiting counts
