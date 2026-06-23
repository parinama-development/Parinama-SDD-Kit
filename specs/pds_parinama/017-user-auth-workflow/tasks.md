# Tasks: PDS User Authentication and Workflow Assignment

**Feature:** PDS User Authentication and Workflow Assignment
**Spec Number:** 017
**Branch:** Tousif
**Generated:** 2026-06-22

---

## Phase 1: Setup

**Goal:** Initialize project structure, dependencies, and configuration

- [X] T001 Install new dependencies (bcryptjs, jsonwebtoken, resend) in pds_parinama/package.json
- [X] T002 Add environment variables (JWT_SECRET, RESEND_API_KEY, SESSION_MAX_AGE) to pds_parinama/.env.example
- [ ] T003 Create users tab in Google Sheets with headers: id, email, password_hash, full_name, phone, age_group, location, permit_status, created_at, updated_at, reset_token, reset_token_expires_at
- [ ] T004 Create workflows tab in Google Sheets with headers: id, name, age_group, steps
- [ ] T005 Create user_progress tab in Google Sheets with headers: id, user_id, workflow_id, current_step, completed_steps, updated_at
- [ ] T006 Seed workflows table with 4 workflow templates (teen, young-adult, adult, license-holder) with ~6-10 steps each
- [X] T007 Update pds_parinama/google-apps-script/Code.gs to handle user write operations (createUser, updateUser, createUserProgress, updateUserProgress)
- [ ] T008 Deploy updated Google Apps Script

---

## Phase 2: Foundational

**Goal:** Implement core authentication utilities and data access layer

- [X] T009 Create pds_parinama/lib/password.ts with hashPassword and verifyPassword functions using bcryptjs
- [X] T010 Create pds_parinama/lib/session.ts with createSession, verifySession, and deleteSession functions using Next.js cookies
- [X] T011 Create pds_parinama/lib/auth.ts with authentication helper functions and JWT token generation
- [X] T012 Create pds_parinama/framework/api/auth-client.ts with user and progress data access methods (createUser, findUserByEmail, updateUser, updateUserPassword, getWorkflowByAgeGroup, getAllWorkflows, createUserProgress, getUserProgress, updateUserProgress)
- [X] T013 Create pds_parinama/lib/workflow-assignment.ts with assignWorkflow function and age_group to workflow mapping
- [X] T014 Create pds_parinama/lib/email.ts with sendPasswordResetEmail function using Resend

---

## Phase 3: User Story 1 - User Registration

**Goal:** Enable users to register accounts with workflow assignment

**Independent Test Criteria:**
- User can register with valid data
- Workflow is automatically assigned based on age group
- User progress record is created
- Duplicate email registration is prevented

**Tasks:**
- [X] T015 [US1] Create pds_parinama/app/api/auth/register/route.ts with registration logic, validation, and workflow assignment
- [X] T016 [US1] Create pds_parinama/components/auth/RegisterForm.tsx with form fields (email, password, full_name, phone, age_group, location, permit_status) and validation
- [X] T017 [US1] Integrate registration form into pds_parinama/app/page.tsx
- [X] T018 [US1] Integrate registration form into pds_parinama/components/workflow/WorkflowModal.tsx

---

## Phase 4: User Story 2 - User Login

**Goal:** Enable users to log in with session creation

**Independent Test Criteria:**
- User can log in with valid credentials
- Session is created with HttpOnly, Secure cookie
- User profile, workflow, and progress are returned
- Invalid credentials are rejected

**Tasks:**
- [X] T019 [US2] Create pds_parinama/app/api/auth/login/route.ts with login logic and session creation
- [X] T020 [US2] Create pds_parinama/app/api/auth/logout/route.ts with logout logic
- [X] T021 [US2] Create pds_parinama/components/auth/LoginForm.tsx with email/password fields and validation
- [X] T022 [US2] Integrate login form into pds_parinama/app/page.tsx
- [X] T023 [US2] Integrate login form into pds_parinama/components/workflow/WorkflowModal.tsx

---

## Phase 5: User Story 3 - Password Reset

**Goal:** Enable users to reset forgotten passwords via email

**Independent Test Criteria:**
- User can request password reset
- Reset email is sent with valid link
- Reset link expires after 24 hours
- User can set new password via reset link

**Tasks:**
- [X] T024 [US3] Create pds_parinama/app/api/auth/reset-password/route.ts with reset request logic and email sending
- [X] T025 [US3] Create pds_parinama/app/api/auth/reset-password/confirm/route.ts with reset confirmation logic
- [X] T026 [US3] Create pds_parinama/components/auth/PasswordResetRequest.tsx with email input
- [X] T027 [US3] Create pds_parinama/components/auth/PasswordResetConfirm.tsx with new password input
- [X] T028 [US3] Add "Forgot Password" link to pds_parinama/components/auth/LoginForm.tsx

---

## Phase 6: User Story 4 - Profile Management

**Goal:** Enable users to update their profile (location only)

**Independent Test Criteria:**
- User can view their profile
- User can update location
- Age group cannot be changed
- Workflow is not re-assigned on location change

**Tasks:**
- [X] T029 [US4] Create pds_parinama/app/api/user/profile/route.ts with GET profile logic
- [X] T030 [US4] Create pds_parinama/app/api/user/profile/update/route.ts with PATCH profile logic (location only, prevent age_group changes)
- [X] T031 [US4] Create pds_parinama/components/profile/ProfileEditor.tsx with profile display and location update form
- [X] T032 [US4] Create pds_parinama/app/dashboard/page.tsx for logged-in user dashboard
- [X] T033 [US4] Integrate profile editor into pds_parinama/app/dashboard/page.tsx

---

## Phase 7: User Story 5 - Workflow Display

**Goal:** Display user's workflow and progress

**Independent Test Criteria:**
- User can view their assigned workflow
- Current step is highlighted
- Completed steps show checkmarks
- Progress indicator shows completion percentage

**Tasks:**
- [X] T034 [US5] Create pds_parinama/app/api/workflow/route.ts with GET workflow logic
- [X] T035 [US5] Create pds_parinama/app/api/workflow/step/complete/route.ts with POST step completion logic (validation, no skipping)
- [X] T036 [US5] Create pds_parinama/components/workflow/WorkflowDisplay.tsx with workflow steps display
- [X] T037 [US5] Create pds_parinama/components/workflow/ProgressIndicator.tsx with progress bar and step count
- [X] T038 [US5] Create pds_parinama/components/workflow/StepCard.tsx with individual step display
- [X] T039 [US5] Integrate workflow display into pds_parinama/app/dashboard/page.tsx

---

## Phase 8: User Story 6 - UI Integration

**Goal:** Update UI for logged-in users

**Independent Test Criteria:**
- Homepage shows logged-in user state
- Current workflow step displayed on homepage
- Progress indicator displayed on homepage
- Logout button added to navigation
- Navigation updated for logged-in users

**Tasks:**
- [X] T040 [US6] Update pds_parinama/app/page.tsx to show logged-in user state, current workflow step, and progress indicator
- [X] T041 [US6] Update pds_parinama/components/Navbar.tsx with logout button and navigation links for logged-in users (My Progress, Profile)
- [X] T042 [US6] Add navigation links for logged-in users in pds_parinama/components/Navbar.tsx

---

## Phase 9: Polish & Cross-Cutting

**Goal:** Testing, documentation, and final validation

- [X] T043 Write unit tests for pds_parinama/lib/password.ts (hashPassword, verifyPassword)
- [X] T044 Write unit tests for pds_parinama/lib/session.ts (createSession, verifySession)
- [X] T045 Write unit tests for pds_parinama/lib/workflow-assignment.ts (assignWorkflow)
- [ ] T046 Write integration tests for pds_parinama/app/api/auth/register/route.ts
- [ ] T047 Write integration tests for pds_parinama/app/api/auth/login/route.ts
- [ ] T048 Write integration tests for pds_parinama/app/api/auth/reset-password/route.ts
- [ ] T049 Write component tests for pds_parinama/components/auth/RegisterForm.tsx
- [ ] T050 Write component tests for pds_parinama/components/auth/LoginForm.tsx
- [ ] T051 Update pds_parinama/README.md with authentication information
- [ ] T052 Update documentation in pds_parinama/docs/

---

## Dependencies

**Phase Dependencies:**
- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phase 3-8
- Phases 3-8 can execute in parallel (independent user stories)
- Phase 9 must complete after Phases 3-8

**User Story Dependencies:**
- US1 (Registration) → US2 (Login) - Login requires registered users
- US2 (Login) → US4 (Profile) - Profile requires logged-in user
- US2 (Login) → US5 (Workflow) - Workflow display requires logged-in user
- US2 (Login) → US6 (UI Integration) - UI integration requires login

**Parallel Execution Opportunities:**
- T016, T021, T026, T031, T036, T037, T038 can be done in parallel (component creation)
- T043, T044, T045 can be done in parallel (unit tests)
- T046, T047, T048 can be done in parallel (integration tests)
- T049, T050 can be done in parallel (component tests)

---

## Implementation Strategy

**MVP Scope:** Phases 1-3 (Setup, Foundational, User Registration)

**Incremental Delivery:**
1. MVP: Registration + basic workflow assignment
2. Add: Login + session management
3. Add: Password reset
4. Add: Profile management
5. Add: Workflow display
6. Add: UI integration
7. Polish: Testing + documentation

**Testing Strategy:**
- Unit tests for utilities (password, session, workflow assignment)
- Integration tests for API endpoints
- Component tests for forms
- Manual testing for end-to-end flows
