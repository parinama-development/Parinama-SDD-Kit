# Implementation Plan: PDS User Authentication and Workflow Assignment

## Header

**Spec Number:** 017
**Feature:** PDS User Authentication and Workflow Assignment
**Branch:** Tousif
**Created:** 2026-06-22
**Status:** Draft

---

## Technical Context

**Tech Stack:**
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS
- Backend: Google Sheets API v4, Google Apps Script
- Authentication: Custom implementation with password hashing
- Session Management: Cookie-based sessions with HttpOnly and Secure flags

**Dependencies:**
- Existing Google Sheets API integration (framework/api/client.ts)
- Existing location constants (lib/constants.ts)
- Existing workflow logic (lib/workflow.ts)
- How-It-Works page content for workflow step definitions
- Email service for password reset notifications

**Integrations:**
- Google Sheets API for data persistence (reads)
- Google Apps Script for write operations (writes)
- Email service for password reset (SendGrid or similar)

**Unknowns:**
- Password hashing library choice (bcryptjs vs argon2 vs others)
- Session management implementation details (cookie library choice)
- Email service provider for password reset
- Specific workflow step content extraction from How-It-Works page

---

## Constitution Check

### SS1: Specification Quality
- [X] Specification is complete and unambiguous
- [X] Requirements are testable
- [X] No implementation details in specification

### SS2: Traceability
- [ ] Traceability matrix will be generated
- [ ] All requirements will map to code locations
- [ ] All acceptance criteria will map to tests

### SS4: Security
- [X] Passwords will be hashed before storage (FR-004, NFR-001)
- [X] Session tokens will be secure (HttpOnly, Secure flags) (NFR-002)
- [X] User data will be encrypted at rest (NFR-003)

### SS10: Data Integrity
- [X] No duplicate email addresses (FR-022)
- [X] Foreign key relationships maintained (data model design)
- [X] Data validation enforced (FR-003, FR-025)

### SS16: Requirement Coverage
- [X] All functional requirements will be implemented (26 FRs defined)
- [X] No requirements skipped without justification

---

## Phase 0: Research

**Status:** Completed

**Research Tasks:**
- [X] Research password hashing libraries for Next.js/TypeScript
- [X] Research session management patterns for Next.js
- [X] Research email service options for password reset
- [X] Extract workflow steps from How-It-Works page

**Output:** research.md

**Decisions:**
- Password hashing: bcryptjs (pure JS, no native dependencies)
- Session management: Next.js built-in cookies (next/headers)
- Email service: Resend (modern, generous free tier)
- Workflow steps: Manual extraction from How-It-Works, JSON structure

---

## Phase 1: Design

**Status:** Completed

**Design Artifacts:**
- [X] data-model.md - Entity definitions and relationships
- [X] contracts/ - API contracts and interfaces
- [X] quickstart.md - Development setup guide

**Output:** data-model.md, contracts/api-contracts.md, quickstart.md

---

## Phase 2: Implementation

**Status:** Pending

### 2.1 Data Model Setup

**Tasks:**
- [ ] Create users tab in Google Sheets with headers: id, email, password_hash, full_name, phone, age_group, location, permit_status, created_at, updated_at, reset_token, reset_token_expires_at
- [ ] Create workflows tab in Google Sheets with headers: id, name, age_group, steps
- [ ] Create user_progress tab in Google Sheets with headers: id, user_id, workflow_id, current_step, completed_steps, updated_at
- [ ] Seed workflows table with 4 workflow templates (teen, young-adult, adult, license-holder) with ~6-10 steps each
- [ ] Update google-apps-script/Code.gs to handle user write operations (createUser, updateUser, createUserProgress, updateUserProgress)
- [ ] Deploy updated Google Apps Script

**Files:**
- `google-apps-script/Code.gs` (MODIFY)

### 2.2 Authentication Utilities

**Tasks:**
- [ ] Create lib/password.ts with hashPassword and verifyPassword functions using bcryptjs
- [ ] Create lib/session.ts with createSession, verifySession, and deleteSession functions using Next.js cookies
- [ ] Create lib/auth.ts with authentication helper functions
- [ ] Add JWT token generation and validation
- [ ] Add environment variable validation for JWT_SECRET

**Files:**
- `lib/password.ts` (NEW)
- `lib/session.ts` (NEW)
- `lib/auth.ts` (NEW)

### 2.3 Data Access Layer

**Tasks:**
- [ ] Create framework/api/auth-client.ts with user and progress data access methods
- [ ] Implement createUser method
- [ ] Implement findUserByEmail method
- [ ] Implement updateUser method
- [ ] Implement updateUserPassword method
- [ ] Implement getWorkflowByAgeGroup method
- [ ] Implement getAllWorkflows method
- [ ] Implement createUserProgress method
- [ ] Implement getUserProgress method
- [ ] Implement updateUserProgress method

**Files:**
- `framework/api/auth-client.ts` (NEW)

### 2.4 Authentication API Endpoints

**Tasks:**
- [ ] Create app/api/auth/register/route.ts with registration logic
- [ ] Create app/api/auth/login/route.ts with login logic
- [ ] Create app/api/auth/logout/route.ts with logout logic
- [ ] Create app/api/auth/reset-password/route.ts with reset request logic
- [ ] Create app/api/auth/reset-password/confirm/route.ts with reset confirmation logic
- [ ] Add error handling and validation
- [ ] Add rate limiting for sensitive endpoints

**Files:**
- `app/api/auth/register/route.ts` (NEW)
- `app/api/auth/login/route.ts` (NEW)
- `app/api/auth/logout/route.ts` (NEW)
- `app/api/auth/reset-password/route.ts` (NEW)
- `app/api/auth/reset-password/confirm/route.ts` (NEW)

### 2.5 User Profile API Endpoints

**Tasks:**
- [ ] Create app/api/user/profile/route.ts with GET profile logic
- [ ] Create app/api/user/profile/update/route.ts with PATCH profile logic
- [ ] Implement location update validation
- [ ] Prevent age_group changes in update logic
- [ ] Add authentication middleware

**Files:**
- `app/api/user/profile/route.ts` (NEW)
- `app/api/user/profile/update/route.ts` (NEW)

### 2.6 Workflow API Endpoints

**Tasks:**
- [ ] Create app/api/workflow/route.ts with GET workflow logic
- [ ] Create app/api/workflow/step/complete/route.ts with POST step completion logic
- [ ] Implement step validation (order, existence)
- [ ] Implement step completion validation (no skipping)
- [ ] Add authentication middleware

**Files:**
- `app/api/workflow/route.ts` (NEW)
- `app/api/workflow/step/complete/route.ts` (NEW)

### 2.7 Workflow Assignment Logic

**Tasks:**
- [ ] Create lib/workflow-assignment.ts with assignWorkflow function
- [ ] Implement age_group to workflow mapping
- [ ] Handle permit_status "yes" for license-holder workflow
- [ ] Add workflow assignment to registration flow

**Files:**
- `lib/workflow-assignment.ts` (NEW)

### 2.8 Registration Form Component

**Tasks:**
- [ ] Create components/auth/RegisterForm.tsx
- [ ] Implement form fields: email, password, full_name, phone, age_group, location, permit_status
- [ ] Add form validation (email format, password strength, required fields)
- [ ] Connect to /api/auth/register endpoint
- [ ] Handle success/error states
- [ ] Redirect to dashboard on success
- [ ] Add to homepage and workflow modal

**Files:**
- `components/auth/RegisterForm.tsx` (NEW)
- `app/page.tsx` (MODIFY - add registration link)
- `components/workflow/WorkflowModal.tsx` (MODIFY - add registration option)

### 2.9 Login Form Component

**Tasks:**
- [ ] Create components/auth/LoginForm.tsx
- [ ] Implement form fields: email, password
- [ ] Add form validation
- [ ] Connect to /api/auth/login endpoint
- [ ] Handle success/error states
- [ ] Add "Forgot Password" link
- [ ] Add to homepage and workflow modal

**Files:**
- `components/auth/LoginForm.tsx` (NEW)
- `app/page.tsx` (MODIFY - add login link)
- `components/workflow/WorkflowModal.tsx` (MODIFY - add login option)

### 2.10 Password Reset Components

**Tasks:**
- [ ] Create components/auth/PasswordResetRequest.tsx
- [ ] Create components/auth/PasswordResetConfirm.tsx
- [ ] Implement email input and validation
- [ ] Connect to /api/auth/reset-password endpoint
- [ ] Implement new password input and validation
- [ ] Connect to /api/auth/reset-password/confirm endpoint
- [ ] Add to login form as "Forgot Password" link

**Files:**
- `components/auth/PasswordResetRequest.tsx` (NEW)
- `components/auth/PasswordResetConfirm.tsx` (NEW)

### 2.11 Profile Management Component

**Tasks:**
- [ ] Create components/profile/ProfileEditor.tsx
- [ ] Display current user profile
- [ ] Implement location update form
- [ ] Prevent age_group field from being editable
- [ ] Connect to /api/user/profile/update endpoint
- [ ] Add to user dashboard

**Files:**
- `components/profile/ProfileEditor.tsx` (NEW)
- `app/dashboard/page.tsx` (NEW - user dashboard)

### 2.12 Workflow Display Components

**Tasks:**
- [ ] Create components/workflow/WorkflowDisplay.tsx
- [ ] Display workflow steps in order
- [ ] Show current step highlighted
- [ ] Show completed steps with checkmarks
- [ ] Add action buttons for steps with action_url
- [ ] Create components/workflow/ProgressIndicator.tsx
- [ ] Display progress bar (completed/total)
- [ ] Display step count (e.g., "Step 2 of 6")
- [ ] Create components/workflow/StepCard.tsx
- [ ] Display individual step with title, description, action button

**Files:**
- `components/workflow/WorkflowDisplay.tsx` (NEW)
- `components/workflow/ProgressIndicator.tsx` (NEW)
- `components/workflow/StepCard.tsx` (NEW)

### 2.13 UI Integration

**Tasks:**
- [ ] Update app/page.tsx to show logged-in user state
- [ ] Display current workflow step on homepage
- [ ] Display progress indicator on homepage
- [ ] Add logout button to Navbar
- [ ] Update navigation for logged-in users (My Progress, Profile)
- [ ] Create app/dashboard/page.tsx for logged-in user dashboard
- [ ] Add workflow display to dashboard
- [ ] Add profile editor to dashboard

**Files:**
- `app/page.tsx` (MODIFY)
- `components/Navbar.tsx` (MODIFY)
- `app/dashboard/page.tsx` (NEW)

### 2.14 Email Service Integration

**Tasks:**
- [ ] Install Resend SDK
- [ ] Create lib/email.ts with sendPasswordResetEmail function
- [ ] Implement email template with reset link
- [ ] Add environment variable for RESEND_API_KEY
- [ ] Test email delivery

**Files:**
- `lib/email.ts` (NEW)
- `package.json` (MODIFY - add resend dependency)

### 2.15 Environment Configuration

**Tasks:**
- [ ] Add JWT_SECRET to .env.example
- [ ] Add RESEND_API_KEY to .env.example
- [ ] Add SESSION_MAX_AGE to .env.example
- [ ] Update env.example with all new variables
- [ ] Document environment variables in README

**Files:**
- `.env.example` (MODIFY)
- `README.md` (MODIFY)

### 2.16 Testing

**Tasks:**
- [ ] Write unit tests for lib/password.ts (hashPassword, verifyPassword)
- [ ] Write unit tests for lib/session.ts (createSession, verifySession)
- [ ] Write unit tests for lib/workflow-assignment.ts (assignWorkflow)
- [ ] Write integration tests for /api/auth/register
- [ ] Write integration tests for /api/auth/login
- [ ] Write integration tests for /api/auth/logout
- [ ] Write integration tests for /api/auth/reset-password
- [ ] Write integration tests for /api/user/profile
- [ ] Write integration tests for /api/workflow
- [ ] Write component tests for RegisterForm
- [ ] Write component tests for LoginForm
- [ ] Write component tests for WorkflowDisplay

**Files:**
- `lib/__tests__/password.test.ts` (NEW)
- `lib/__tests__/session.test.ts` (NEW)
- `lib/__tests__/workflow-assignment.test.ts` (NEW)
- `app/api/auth/__tests__/register.test.ts` (NEW)
- `app/api/auth/__tests__/login.test.ts` (NEW)
- `components/auth/__tests__/RegisterForm.test.tsx` (NEW)
- `components/auth/__tests__/LoginForm.test.tsx` (NEW)

### 2.17 Documentation

**Tasks:**
- [ ] Update README.md with authentication information
- [ ] Document API endpoints in API documentation
- [ ] Document data model in README
- [ ] Update knowledge base with authentication workflows
- [ ] Add troubleshooting section to quickstart.md

**Files:**
- `README.md` (MODIFY)
- `docs/api.md` (NEW or MODIFY)

---

## Phase 3: Testing & Validation

**Status:** Pending

**Tasks:**
- [ ] Run all tests
- [ ] Manual testing of registration flow
- [ ] Manual testing of login flow
- [ ] Manual testing of password reset
- [ ] Manual testing of workflow assignment
- [ ] Manual testing of progress tracking
- [ ] Performance testing
- [ ] Security testing

---

## Phase 4: Deployment

**Status:** Pending

**Tasks:**
- [ ] Code review
- [ ] Merge to main branch
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Update documentation

---

## Traceability Matrix

| Requirement | Code Location | Test Method | Status |
|-------------|--------------|-------------|--------|
| FR-001      | components/auth/RegisterForm.tsx (NEW) | components/auth/__tests__/RegisterForm.test.tsx (NEW) | Planned |
| FR-002      | components/auth/RegisterForm.tsx (NEW) | components/auth/__tests__/RegisterForm.test.tsx (NEW) | Planned |
| FR-003      | app/api/auth/register/route.ts (NEW) | app/api/auth/__tests__/register.test.ts (NEW) | Planned |
| FR-004      | lib/password.ts:hashPassword (NEW) | lib/__tests__/password.test.ts (NEW) | Planned |
| FR-005      | app/api/auth/register/route.ts (NEW) | app/api/auth/__tests__/register.test.ts (NEW) | Planned |
| FR-006      | lib/workflow-assignment.ts:assignWorkflow (NEW) | lib/__tests__/workflow-assignment.test.ts (NEW) | Planned |
| FR-007      | components/auth/LoginForm.tsx (NEW) | components/auth/__tests__/LoginForm.test.tsx (NEW) | Planned |
| FR-008      | app/api/auth/login/route.ts (NEW) | app/api/auth/__tests__/login.test.ts (NEW) | Planned |
| FR-009      | lib/session.ts:createSession (NEW) | lib/__tests__/session.test.ts (NEW) | Planned |
| FR-010      | app/api/auth/logout/route.ts (NEW) | app/api/auth/__tests__/login.test.ts (NEW) | Planned |
| FR-011      | app/api/auth/reset-password/route.ts (NEW) | app/api/auth/__tests__/register.test.ts (NEW) | Planned |
| FR-012      | google-apps-script/Code.gs (MODIFY) | Manual verification | Planned |
| FR-013      | google-apps-script/Code.gs (MODIFY) | Manual verification | Planned |
| FR-014      | data-model.md (DESIGN) | Manual verification | Planned |
| FR-015      | data-model.md (DESIGN) | Manual verification | Planned |
| FR-016      | app/api/auth/register/route.ts (NEW) | app/api/auth/__tests__/register.test.ts (NEW) | Planned |
| FR-017      | data-model.md (DESIGN) | Manual verification | Planned |
| FR-018      | app/api/workflow/step/complete/route.ts (NEW) | app/api/auth/__tests__/login.test.ts (NEW) | Planned |
| FR-019      | components/workflow/ProgressIndicator.tsx (NEW) | components/auth/__tests__/RegisterForm.test.tsx (NEW) | Planned |
| FR-020      | framework/api/auth-client.ts:updateUserProgress (NEW) | app/api/auth/__tests__/login.test.ts (NEW) | Planned |
| FR-021      | app/page.tsx (MODIFY) | Manual verification | Planned |
| FR-022      | app/api/auth/register/route.ts (NEW) | app/api/auth/__tests__/register.test.ts (NEW) | Planned |
| FR-023      | app/api/auth/register/route.ts (NEW) | app/api/auth/__tests__/register.test.ts (NEW) | Planned |
| FR-024      | app/api/user/profile/update/route.ts (NEW) | app/api/auth/__tests__/login.test.ts (NEW) | Planned |
| FR-025      | app/api/user/profile/update/route.ts (NEW) | app/api/auth/__tests__/login.test.ts (NEW) | Planned |
| FR-026      | app/api/user/profile/update/route.ts (NEW) | app/api/auth/__tests__/login.test.ts (NEW) | Planned |

**User Scenarios:**
| Scenario | Test Method | Status |
|----------|-------------|--------|
| Scenario 1: New User Registration | app/api/auth/__tests__/register.test.ts (NEW) | Planned |
| Scenario 2: User Login | app/api/auth/__tests__/login.test.ts (NEW) | Planned |
| Scenario 3: Workflow Progress Tracking | app/api/auth/__tests__/login.test.ts (NEW) | Planned |
| Scenario 4: Password Reset | app/api/auth/__tests__/register.test.ts (NEW) | Planned |
| Scenario 5: Duplicate Registration Prevention | app/api/auth/__tests__/register.test.ts (NEW) | Planned |
| Scenario 6: Location Update | app/api/auth/__tests__/login.test.ts (NEW) | Planned |

**Non-Functional Requirements:**
| Requirement | Code Location | Test Method | Status |
|-------------|--------------|-------------|--------|
| NFR-001     | lib/password.ts:hashPassword (NEW) | lib/__tests__/password.test.ts (NEW) | Planned |
| NFR-002     | lib/session.ts:createSession (NEW) | lib/__tests__/session.test.ts (NEW) | Planned |
| NFR-003     | Google Sheets encryption (CONFIG) | Manual verification | Planned |
| NFR-004     | Performance testing (MANUAL) | Manual verification | Planned |
| NFR-005     | Load testing (MANUAL) | Manual verification | Planned |
| NFR-006     | framework/api/auth-client.ts (NEW) | Performance tests | Planned |
| NFR-007     | app/api/auth/login/route.ts (NEW) | Logging verification | Planned |
| NFR-008     | app/api/auth/reset-password/route.ts (NEW) | app/api/auth/__tests__/register.test.ts (NEW) | Planned |

---

## Notes

- This plan will be updated during Phase 0 research
- Implementation tasks will be broken down further
- Traceability matrix will be populated during implementation
