## ADDED Requirements

### Requirement: Driver pages use MobileLayout
The system SHALL render all /driver/* routes inside a mobile-optimized layout with bottom tab navigation.

#### Scenario: Driver creates appointment
- **WHEN** driver navigates to /driver/create
- **THEN** page renders inside MobileLayout with max-width 480px and bottom tabs

### Requirement: Admin pages use DesktopLayout
The system SHALL render all /admin/* routes inside a desktop-optimized layout with sidebar navigation.

#### Scenario: Operator views appointment list
- **WHEN** operator navigates to /admin/appointments
- **THEN** page renders inside DesktopLayout with min-width 1024px and sidebar nav

### Requirement: Login page adapts to both layouts
The system SHALL render the login page in a layout that works on both mobile and desktop viewports.

#### Scenario: Login on mobile
- **WHEN** user opens /login on a phone
- **THEN** login form displays as full-screen centered card

#### Scenario: Login on desktop
- **WHEN** user opens /login on a PC browser
- **THEN** login form displays as centered card with wider form fields

### Requirement: Route guard redirects unauthenticated admin users
The system SHALL redirect /admin/* routes to /login when no valid auth token exists.

#### Scenario: Unauthenticated access
- **WHEN** user without token visits /admin/appointments
- **THEN** system redirects to /login
