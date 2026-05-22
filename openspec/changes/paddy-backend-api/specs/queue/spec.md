## ADDED Requirements

### Requirement: Operator can view the current queue
The system SHALL display the current waiting queue with position numbers, showing who is currently being served and how many are waiting.

#### Scenario: View queue with waiting drivers
- **WHEN** operator requests the queue
- **THEN** system returns ordered queue with position numbers, waitingCount, and currentServing info

#### Scenario: Empty queue
- **WHEN** operator requests the queue with no waiting appointments
- **THEN** system returns empty queue array, waitingCount=0, currentServing=null

### Requirement: Driver can check their queue position
The system SHALL allow drivers to check their current queue position using their appointmentNo.

#### Scenario: Driver in queue
- **WHEN** driver submits appointmentNo of a waiting appointment
- **THEN** system returns position, waitingAhead count, and current queue

#### Scenario: Driver not in queue
- **WHEN** driver submits appointmentNo not in the waiting queue
- **THEN** system returns 404 NOT_FOUND
