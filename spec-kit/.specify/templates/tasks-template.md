# Tasks: {FEATURE_NAME}

**Feature:** {FEATURE_NAME}
**Spec Number:** {SPEC_NUMBER}
**Branch:** {BRANCH}
**Generated:** {DATE}

---

## Phase 1: Setup

**Goal:** Initialize project structure, dependencies, and configuration

- [ ] T001 Install new dependencies (bcryptjs, jsonwebtoken, resend)
- [ ] T002 Add environment variables to .env.example
- [ ] T003 Create Google Sheets tabs (users, workflows, user_progress)
- [ ] T004 Seed workflows table with 4 workflow templates
- [ ] T005 Update Google Apps Script for user operations
- [ ] T006 Deploy updated Google Apps Script

---

## Phase 2: Foundational

**Goal:** Implement core authentication utilities and data access layer

- [ ] T007 Create lib/password.ts with hashPassword and verifyPassword
- [ ] T008 Create lib/session.ts with session management
- [ ] T009 Create lib/auth.ts with authentication helpers
- [ ] T010 Create framework/api/auth-client.ts with data access methods
- [ ] T011 Create lib/workflow-assignment.ts with workflow assignment logic
- [ ] T012 Create lib/email.ts with password reset email function

---

## Phase 3: User Story 1 - User Registration

**Goal:** Enable users to register accounts with workflow assignment

**Independent Test Criteria:**
- User can register with valid data
- Workflow is automatically assigned based on age group
- User progress record is created
- Duplicate email registration is prevented

**Tasks:**
- [ ] T013 [US1] Create app/api/auth/register/route.ts
- [ ] T014 [US1] Create components/auth/RegisterForm.tsx
- [ ] T015 [US1] Integrate registration form into homepage
- [ ] T016 [US1] Integrate registration form into workflow modal

---

## Phase 4: User Story 2 - User Login

**Goal:** Enable users to log in with session creation

**Independent Test Criteria:**
- User can log in with valid credentials
- Session is created with HttpOnly, Secure cookie
- User profile, workflow, and progress are returned
- Invalid credentials are rejected

**Tasks:**
- [ ] T017 [US2] Create app/api/auth/login/route.ts
- [ ] T018 [US2] Create app/api/auth/logout/route.ts
- [ ] T019 [US2] Create components/auth/LoginForm.tsx
- [ ] T020 [US2] Integrate login form into homepage
- [ ] T021 [US2] Integrate login form into workflow modal

---

## Phase 5: User Story 3 - Password Reset

**Goal:** Enable users to reset forgotten passwords via email

**Independent Test Criteria:**
- User can request password reset
- Reset email is sent with valid link
- Reset link expires after 24 hours
- User can set new password via reset link

**Tasks:**
- [ ] T022 [US3] Create app/api/auth/reset-password/route.ts
- [ ] T023 [US3] Create app/api/auth/reset-password/confirm/route.ts
- [ ] T024 [US3] Create components/auth/PasswordResetRequest.tsx
- [ ] T025 [US3] Create components/auth/PasswordResetConfirm.tsx
- [ ] T026 [US3] Add "Forgot Password" link to login form

---

## Phase 6: User Story 4 - Profile Management

**Goal:** Enable users to update their profile (location only)

**Independent Test Criteria:**
- User can view their profile
- User can update location
- Age group cannot be changed
- Workflow is not re-assigned on location change

**Tasks:**
- [ ] T027 [US4] Create app/api/user/profile/route.ts
- [ ] T028 [US4] Create app/api/user/profile/update/route.ts
- [ ] T029 [US4] Create components/profile/ProfileEditor.tsx
- [ ] T030 [US4] Create app/dashboard/page.tsx
- [ ] T031 [US4] Integrate profile editor into dashboard

---

## Phase 7: User Story 5 - Workflow Display

**Goal:** Display user's workflow and progress

**Independent Test Criteria:**
- User can view their assigned workflow
- Current step is highlighted
- Completed steps show checkmarks
- Progress indicator shows completion percentage

**Tasks:**
- [ ] T032 [US5] Create app/api/workflow/route.ts
- [ ] T033 [US5] Create app/api/workflow/step/complete/route.ts
- [ ] T034 [US5] Create components/workflow/WorkflowDisplay.tsx
- [ ] T035 [US5] Create components/workflow/ProgressIndicator.tsx
- [ ] T036 [US5] Create components/workflow/StepCard.tsx
- [ ] T037 [US5] Integrate workflow display into dashboard

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
- [ ] T038 [US6] Update app/page.tsx for logged-in users
- [ ] T039 [US6] Update components/Navbar.tsx with logout button
- [ ] T040 [US6] Add navigation links for logged-in users

---

## Phase 9: Polish & Cross-Cutting

**Goal:** Testing, documentation, and final validation

- [ ] T041 Write unit tests for password utilities
- [ ] T042 Write unit tests for session utilities
- [ ] T043 Write unit tests for workflow assignment
- [ ] T044 Write integration tests for registration
- [ ] T045 Write integration tests for login
- [ ] T046 Write integration tests for password reset
- [ ] T047 Write component tests for RegisterForm
- [ ] T048 Write component tests for LoginForm
- [ ] T049 Update README with authentication info
- [ ] T050 Update documentation

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
- T014, T019, T024, T029, T034, T035, T036 can be done in parallel (component creation)
- T041, T042, T043 can be done in parallel (unit tests)
- T044, T045, T046 can be done in parallel (integration tests)
- T047, T048 can be done in parallel (component tests)

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
