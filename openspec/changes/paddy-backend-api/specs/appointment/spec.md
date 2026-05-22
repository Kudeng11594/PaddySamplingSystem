## ADDED Requirements

### Requirement: Driver can create an appointment
The system SHALL accept driver-submitted appointments with driverName, phone, licensePlate, variety, appointmentDate, appointmentTime, and optional remark. Returns the created appointment with a system-generated appointmentNo (YYYYMMDD + 3-digit sequence).

#### Scenario: Successful appointment creation
- **WHEN** driver submits valid appointment data
- **THEN** system returns 201 with appointment object in pending status and a unique appointmentNo

#### Scenario: Invalid phone number
- **WHEN** driver submits appointment with invalid phone format
- **THEN** system returns 400 VALIDATION_ERROR

### Requirement: Operator can list appointments with filtering
The system SHALL return a paginated, filterable list of all appointments for authenticated operator/manager users.

#### Scenario: List with status filter
- **WHEN** operator requests appointments with status=pending
- **THEN** system returns only pending appointments with pagination metadata

#### Scenario: List with keyword search
- **WHEN** operator searches with keyword "张三"
- **THEN** system returns appointments matching driverName/phone/licensePlate containing "张三"

### Requirement: Driver can query their own appointment
The system SHALL allow drivers to retrieve their appointment details using phone + appointmentNo (no authentication required).

#### Scenario: Query existing appointment
- **WHEN** driver submits matching phone and appointmentNo
- **THEN** system returns full appointment details including queue position if queued

#### Scenario: Query non-existent appointment
- **WHEN** driver submits non-matching phone and appointmentNo
- **THEN** system returns 404 NOT_FOUND

### Requirement: Operator can assign a token number
The system SHALL allow operators to assign a token number to a pending appointment, transitioning it to token_assigned status.

#### Scenario: Assign token to pending appointment
- **WHEN** operator assigns token "A001" to a pending appointment
- **THEN** system updates status to token_assigned and records the token number

#### Scenario: Assign token to non-pending appointment
- **WHEN** operator attempts to assign token to an appointment not in pending status
- **THEN** system returns 409 INVALID_STATUS error

### Requirement: Operator can check in a driver
The system SHALL allow operators to confirm driver arrival by checking in a token_assigned appointment, moving it to waiting status and adding it to the queue.

#### Scenario: Successful check-in
- **WHEN** operator checks in a token_assigned appointment
- **THEN** system updates status to waiting, records queuedAt timestamp, and adds to waiting queue

### Requirement: Operator can call the next driver
The system SHALL allow operators to call a waiting appointment, transitioning it to called status.

#### Scenario: Call waiting driver
- **WHEN** operator calls a waiting appointment
- **THEN** system updates status to called and records calledAt timestamp

### Requirement: Operator can complete sampling results
The system SHALL allow operators to record moisture (%) and rice yield (%) for a called appointment, transitioning it to completed status.

#### Scenario: Complete with valid results
- **WHEN** operator submits moisture=14.5 and riceYield=60.2 for a called appointment
- **THEN** system updates status to completed and saves the sampling results

#### Scenario: Complete with out-of-range values
- **WHEN** operator submits moisture=25 or riceYield=70
- **THEN** system returns 400 VALIDATION_ERROR with range validation message

### Requirement: Operator can cancel an appointment
The system SHALL allow operators/admins to cancel any appointment with a required reason, transitioning it to cancelled status.

#### Scenario: Cancel appointment
- **WHEN** operator cancels an appointment with reason "司机迟到"
- **THEN** system updates status to cancelled with cancelReason and cancelBy=operator

### Requirement: Driver can cancel their own pending appointment
The system SHALL allow drivers to cancel their own pending appointment using phone verification.

#### Scenario: Driver cancels with correct phone
- **WHEN** driver submits valid appointmentNo and matching phone number
- **THEN** system cancels the appointment with cancelBy=driver

#### Scenario: Driver cancels with wrong phone
- **WHEN** driver submits valid appointmentNo but wrong phone number
- **THEN** system returns 403 FORBIDDEN

### Requirement: Operator can skip a waiting appointment
The system SHALL allow operators to move a waiting appointment to the end of the queue.

#### Scenario: Skip waiting appointment
- **WHEN** operator skips a waiting appointment
- **THEN** system moves it to the end of the queue without changing its waiting status
