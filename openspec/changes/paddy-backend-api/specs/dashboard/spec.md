## ADDED Requirements

### Requirement: Manager can view today's dashboard
The system SHALL provide a dashboard with today's appointment statistics for manager role users.

#### Scenario: View today's statistics
- **WHEN** manager requests today's dashboard
- **THEN** system returns totalAppointments, waitingCount, completedCount, cancelledCount, and lastUpdated timestamp
