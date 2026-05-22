## ADDED Requirements

### Requirement: Design tokens are defined as CSS custom properties
The system SHALL define all design tokens (colors, spacing, border radius) as CSS custom properties in a tokens.css file.

#### Scenario: Token definition
- **WHEN** tokens.css is loaded
- **THEN** all --color-*, --space-*, --radius-* variables are available on :root

### Requirement: Tailwind utility classes consume CSS variables
The system SHALL extend Tailwind theme config to map CSS variables into semantic utility classes.

#### Scenario: Using primary color
- **WHEN** developer uses bg-primary class
- **THEN** it resolves to var(--color-primary)

### Requirement: Driver and admin can have different color schemes
The system SHALL allow different CSS variable values for MobileLayout and DesktopLayout to support role-based theming.

#### Scenario: Different theme files
- **WHEN** MobileLayout loads
- **THEN** theme-mobile.css variables are applied

#### Scenario: Admin theme
- **WHEN** DesktopLayout loads
- **THEN** theme-admin.css variables are applied
