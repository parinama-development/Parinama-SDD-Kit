# 017 — PDS User Authentication and Workflow Assignment

## Header

**Spec Number:** 017  
**Title:** PDS User Authentication and Workflow Assignment  
**Status:** Draft  
**Created:** 2026-06-22  
**Priority:** High  
**Author:** Tousif  
**Related Issues:** None  

---

## Overview

This feature introduces user registration and basic authentication to the PDS Parinama platform, enabling personalized workflow tracking for users on their Texas driver license journey. Currently, the workflow system provides guidance without user accounts, limiting the ability to track progress over time. This feature will:

- Allow users to register with their age group, location, and permit status
- Provide basic login functionality for returning users
- Automatically assign a personalized workflow based on user profile (age group)
- Externalize workflow definitions into a separate data table for easier maintenance
- Track user progress through their assigned workflow from first task to completion

The workflow data will be extracted from the existing How-It-Works page content, which already defines age-specific licensing steps for teens (15-17), young adults (18-24), and adults (25+).

### Strategic Value

By introducing user accounts and workflow assignment, the platform can:
- Provide persistent progress tracking across sessions
- Deliver personalized recommendations based on user's current stage
- Enable follow-up communications and reminders
- Build a user base for future features (booking history, payments, etc.)
- Improve conversion by guiding users through their specific licensing path

---

## Background

The current PDS Parinama website has a workflow system that:
- Collects user information (age, location, permit status) through a multi-step modal
- Generates personalized recommendations without requiring account creation
- Displays workflow steps based on the How-It-Works page content
- Does not persist user data or progress across sessions

The workflow steps are currently embedded in the UI code (`components/workflow/steps.tsx`) and the How-It-Works page (`app/how-it-works/page.tsx`), making them difficult to maintain and update. The age groups and their corresponding workflows are:

- **Teens (15-17)**: Parent books DPS appointment → Submit VOE → Complete teen driver education → Get permit → Behind-the-wheel practice → Road test
- **Young Adults (18-24)**: Complete 6-hour adult driver education → Take written exam → Get permit → Behind-the-wheel practice → Road test
- **Adults (25+)**: Take written exam at DPS (or complete course to skip line) → Get permit → Behind-the-wheel practice → Road test

---

## Scope

### In Scope

**User Registration:**
- Registration form collecting: email, password, full name, phone number, age group, location, permit status
- Age group options: under 18, 18-24, 25+
- Location options: Austin (Leander), San Antonio
- Permit status options: Yes, No
- Email validation and password strength requirements
- Account creation in Google Sheets (users table)
- Age group is fixed at registration and cannot be changed

**User Authentication:**
- Login form with email and password
- Session management
- Password reset functionality (email-based)
- Logout functionality

**Profile Management:**
- Users can update their location after registration
- Users cannot change their age group after registration

**Workflow Assignment:**
- Automatic workflow assignment based on age group at registration
- Workflow definitions stored in separate Google Sheets table (workflows table)
- Four workflow templates: teen (under 18), young-adult (18-24), adult (25+), license-holder (for users who already have license)
- Each workflow contains ordered steps with descriptions (~10 steps per workflow based on How-It-Works content)

**User Progress Tracking:**
- Track current step in assigned workflow
- Mark steps as completed
- Display progress indicator to logged-in users
- Persist progress in Google Sheets (user_progress table)

**Data Model:**
- Users table: id, email, password_hash, full_name, phone, age_group, location, permit_status, created_at, updated_at
- Workflows table: id, name, age_group, steps (JSON array of step objects with title, description, order)
- User_progress table: id, user_id, workflow_id, current_step, completed_steps (JSON array), updated_at

### Out of Scope

- Social login (Google, Facebook, etc.)
- Two-factor authentication
- Email verification during registration
- Age group change after registration (age group is fixed at registration)
- Workflow re-assignment after registration
- Workflow customization by users
- Admin dashboard for managing users and workflows
- Integration with existing booking system (future scope)
- Payment integration (future scope)

---

## Functional Requirements

| ID | Requirement | Source |
|-----|------------|--------|
| FR-001 | System shall provide a user registration form accessible from the homepage and workflow modal | User request |
| FR-002 | Registration form shall collect: email, password, full name, phone number, age group, location, permit status | User request |
| FR-003 | Registration form shall validate email format and password strength (minimum 8 characters) | Industry standard |
| FR-004 | System shall hash passwords before storing in database | Security best practice |
| FR-005 | System shall create a user record in the users table upon successful registration | User request |
| FR-006 | System shall automatically assign a workflow based on the user's age group at registration | User request |
| FR-007 | System shall provide a login form accessible from the homepage and workflow modal | User request |
| FR-008 | Login form shall accept email and password for authentication | User request |
| FR-009 | System shall create a session upon successful login and maintain it across page navigation | User request |
| FR-010 | System shall provide a logout function that terminates the session | User request |
| FR-011 | System shall provide a password reset function that sends a reset link via email | Industry standard |
| FR-012 | System shall store workflow definitions in a separate workflows table in Google Sheets | User request |
| FR-013 | Workflows table shall contain four workflow templates: teen (under 18), young-adult (18-24), adult (25+), license-holder | User request |
| FR-014 | Each workflow shall contain ordered steps with title, description, and sequence number | User request |
| FR-015 | Workflow steps shall be extracted from the How-It-Works page content (~10 steps per workflow) | User request |
| FR-016 | System shall create a user_progress record when a user is assigned a workflow | User request |
| FR-017 | User_progress table shall track: user_id, workflow_id, current_step, completed_steps | User request |
| FR-018 | System shall allow users to mark workflow steps as completed | User request |
| FR-019 | System shall display a progress indicator showing completed steps vs total steps | User request |
| FR-020 | System shall persist user progress in the user_progress table | User request |
| FR-021 | System shall display the current workflow step to logged-in users on the homepage | User request |
| FR-022 | System shall prevent duplicate registration with the same email address | Data integrity |
| FR-023 | System shall provide appropriate error messages for registration and login failures | UX requirement |
| FR-024 | System shall allow users to update their location after registration | User request |
| FR-025 | System shall prevent users from changing their age group after registration | User request |
| FR-026 | System shall not re-assign workflow when user updates their location | User request |

---

## Non-Functional Requirements

| ID | Requirement | Priority |
|-----|------------|----------|
| NFR-001 | Password hashing shall use bcrypt or similar secure algorithm with minimum 10 rounds | High |
| NFR-002 | Session tokens shall be stored securely with HttpOnly and Secure flags | High |
| NFR-003 | User data shall be encrypted at rest in Google Sheets | Medium |
| NFR-004 | Registration and login pages shall load within 2 seconds | Medium |
| NFR-005 | System shall handle 100 concurrent user registrations without performance degradation | Medium |
| NFR-006 | API calls to Google Sheets for user operations shall complete within 500ms | Medium |
| NFR-007 | System shall log all authentication attempts for security monitoring | High |
| NFR-008 | Password reset links shall expire after 24 hours | High |

---

## User Scenarios & Testing

### Scenario 1: New User Registration

**Given** a new user visits the PDS Parinama homepage
**When** they click "Start My Driving Journey" and are prompted to register
**And** they enter valid email, password, full name, phone, select age group "18-24", location "Austin", and permit status "No"
**Then** the system creates a user account
**And** assigns the "young-adult" workflow
**And** creates a user_progress record with current_step = 1
**And** displays a success message and redirects to the dashboard

### Scenario 2: User Login

**Given** a registered user visits the PDS Parinama homepage
**When** they click "Log In" and enter their email and password
**Then** the system authenticates the user
**And** creates a session
**And** displays their personalized dashboard with current workflow step
**And** shows progress indicator (e.g., "Step 2 of 6 completed")

### Scenario 3: Workflow Progress Tracking

**Given** a logged-in user with an assigned workflow
**When** they complete a workflow step and click "Mark as Complete"
**Then** the system updates the user_progress record
**And** increments current_step
**And** adds the step to completed_steps array
**And** displays the next step in the workflow

### Scenario 4: Password Reset

**Given** a registered user forgets their password
**When** they click "Forgot Password" and enter their email
**Then** the system sends a password reset link to their email
**And** the link expires after 24 hours
**When** they click the link and set a new password
**Then** the system updates their password hash
**And** allows them to log in with the new password

### Scenario 5: Duplicate Registration Prevention

**Given** a user with email "user@example.com" is already registered
**When** a new user attempts to register with the same email
**Then** the system displays an error message "An account with this email already exists"
**And** does not create a duplicate account

### Scenario 6: Location Update

**Given** a logged-in user with location "Austin"
**When** they navigate to their profile and update their location to "San Antonio"
**Then** the system updates their location in the users table
**And** does not re-assign their workflow
**And** their progress remains unchanged

---

## Key Entities

### User
- **id**: Unique identifier
- **email**: User's email address (unique)
- **password_hash**: Hashed password
- **full_name**: User's full name
- **phone**: User's phone number
- **age_group**: "under18", "18-24", or "25+"
- **location**: "austin" or "san-antonio"
- **permit_status**: "yes" or "no"
- **created_at**: Timestamp of account creation
- **updated_at**: Timestamp of last update

### Workflow
- **id**: Unique identifier
- **name**: Display name (e.g., "Teen License Journey")
- **age_group**: "under18", "18-24", or "25+"
- **steps**: JSON array of step objects:
  - **title**: Step title
  - **description**: Step description
  - **order**: Sequence number (1, 2, 3, ...)

### UserProgress
- **id**: Unique identifier
- **user_id**: Reference to User
- **workflow_id**: Reference to Workflow
- **current_step**: Current step number in the workflow
- **completed_steps**: JSON array of completed step numbers
- **updated_at**: Timestamp of last update

---

## Success Criteria

- Users can successfully register and create accounts within 2 minutes
- Registration form validation prevents invalid data submission
- Login success rate exceeds 95% for valid credentials
- Workflow assignment accuracy is 100% based on age group
- User progress persists correctly across sessions
- Password reset flow completes successfully within 5 minutes
- System handles 100 concurrent registrations without errors
- Average page load time for auth pages is under 2 seconds
- User satisfaction score for registration flow is 4+ out of 5

---

## Assumptions

- Google Sheets will be used as the database (consistent with existing architecture)
- Firebase Authentication will not be used; custom auth implementation with Google Sheets
- Email service for password reset is available (can use existing business email)
- Workflow step content will be manually extracted from How-It-Works page
- Age group definitions match existing workflow logic (under 18, 18-24, 25+)
- Location options match existing LOCATIONS constant (Austin, San Antonio)
- Password hashing will use bcrypt via a suitable library for the tech stack

---

## Dependencies

- Existing Google Sheets API integration (framework/api/client.ts)
- Existing location constants (lib/constants.ts)
- Existing workflow logic (lib/workflow.ts)
- How-It-Works page content for workflow step definitions
- Email service for password reset notifications

---

## Open Questions

None - all open questions have been resolved.

---

## Definition of Done

- [ ] User registration form implemented and functional
- [ ] User login form implemented and functional
- [ ] Password reset flow implemented and functional
- [ ] Users table created in Google Sheets with required fields
- [ ] Workflows table created in Google Sheets with three workflow templates
- [ ] User_progress table created in Google Sheets with required fields
- [ ] Workflow assignment logic implemented based on age group
- [ ] Progress tracking implemented with step completion
- [ ] Progress indicator displayed to logged-in users
- [ ] Session management implemented
- [ ] Password hashing implemented with bcrypt
- [ ] All functional requirements met
- [ ] All non-functional requirements met
- [ ] User scenarios tested and passing
- [ ] Success criteria met
- [ ] Documentation updated (README, API docs)
- [ ] Code reviewed and approved
