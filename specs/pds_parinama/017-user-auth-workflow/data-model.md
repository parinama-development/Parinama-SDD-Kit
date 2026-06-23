# Data Model: PDS User Authentication and Workflow Assignment

**Feature:** 017 - PDS User Authentication and Workflow Assignment
**Date:** 2026-06-22

---

## Overview

This document defines the data model for user authentication, workflow assignment, and progress tracking. The data will be stored in Google Sheets using the existing SheetsClient infrastructure.

---

## Entities

### 1. User

**Table Name:** `users`

**Description:** Stores user account information and profile data.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | Primary key, auto-generated | Unique user identifier (UUID) |
| email | string | Unique, required, email format | User's email address |
| password_hash | string | Required, bcrypt hashed | Hashed password (bcryptjs, 10+ rounds) |
| full_name | string | Required, min 2 chars | User's full name |
| phone | string | Required, phone format | User's phone number |
| age_group | string | Required, enum: "under18", "18-24", "25+" | User's age group (fixed at registration) |
| location | string | Required, enum: "austin", "san-antonio" | User's preferred location (updatable) |
| permit_status | string | Required, enum: "yes", "no" | Whether user has learner permit |
| created_at | timestamp | Auto-generated | Account creation timestamp |
| updated_at | timestamp | Auto-updated | Last update timestamp |

**Validation Rules:**
- Email must be unique (FR-022)
- Email must match email format regex (FR-003)
- Password must be minimum 8 characters before hashing (FR-003)
- full_name must be minimum 2 characters
- phone must be valid phone number format
- age_group must be one of: "under18", "18-24", "25+"
- location must be one of: "austin", "san-antonio"
- permit_status must be one of: "yes", "no"

**State Transitions:**
- Created → Active (on successful registration)
- Active → Updated (on profile update - location only)

**Constraints:**
- age_group cannot be changed after creation (FR-025)
- location can be updated (FR-024)

---

### 2. Workflow

**Table Name:** `workflows`

**Description:** Stores workflow definitions for different age groups and license status.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | Primary key, auto-generated | Unique workflow identifier |
| name | string | Required | Display name (e.g., "Teen License Journey") |
| age_group | string | Required, enum: "under18", "18-24", "25+", "license-holder" | Target age group for this workflow |
| steps | JSON | Required | Array of step objects |

**Steps JSON Structure:**
```json
[
  {
    "order": 1,
    "title": "Step title",
    "description": "Step description",
    "action_url": "Optional URL for action",
    "action_label": "Optional button label"
  }
]
```

**Validation Rules:**
- age_group must be one of: "under18", "18-24", "25+", "license-holder"
- steps must be valid JSON array
- Each step must have: order (integer), title (string), description (string)
- order values must be sequential starting from 1
- action_url and action_label are optional

**Workflow Templates:**

**Teen Workflow (under18):**
1. Parent books DPS appointment at txdpsscheduler.com
2. Submit Verification of Enrollment (VOE) from school
3. Complete teen driver education course (Module 1 for DE-964)
4. Get learner permit (Restriction B)
5. Behind-the-wheel practice
6. Road test

**Young Adult Workflow (18-24):**
1. Complete 6-hour adult driver education course
2. Take written exam at DPS
3. Get learner permit
4. Behind-the-wheel practice
5. Road test

**Adult Workflow (25+):**
1. Take written exam at DPS (or complete course to skip line)
2. Get learner permit
3. Behind-the-wheel practice
4. Road test

**License Holder Workflow (license-holder):**
1. Review advanced driving techniques
2. Schedule refresher lessons
3. Practice parallel parking
4. Schedule road test refresh (if needed)

---

### 3. UserProgress

**Table Name:** `user_progress`

**Description:** Tracks user progress through their assigned workflow.

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | Primary key, auto-generated | Unique progress record identifier |
| user_id | string | Required, foreign key to users.id | Reference to user |
| workflow_id | string | Required, foreign key to workflows.id | Reference to assigned workflow |
| current_step | integer | Required, min 1 | Current step number in workflow |
| completed_steps | JSON | Required | Array of completed step numbers |
| updated_at | timestamp | Auto-updated | Last update timestamp |

**completed_steps JSON Structure:**
```json
[1, 2, 3]
```

**Validation Rules:**
- user_id must reference valid user in users table
- workflow_id must reference valid workflow in workflows table
- current_step must be >= 1 and <= total steps in workflow
- completed_steps must be valid JSON array of integers
- completed_steps values must be valid step numbers in workflow
- current_step must be greater than all values in completed_steps

**State Transitions:**
- Created → In Progress (on workflow assignment)
- In Progress → Updated (on step completion)
- Updated → Completed (when current_step > total steps)

**Business Rules:**
- User can only have one active progress record per workflow
- Steps must be completed in order (cannot skip steps)
- Once a step is completed, it cannot be uncompleted
- Workflow is not re-assigned when user updates location (FR-026)

---

## Relationships

### User → UserProgress
- **Relationship:** One-to-Many
- **Foreign Key:** user_progress.user_id → users.id
- **Cardinality:** One user can have multiple progress records (historical), but only one active per workflow

### Workflow → UserProgress
- **Relationship:** One-to-Many
- **Foreign Key:** user_progress.workflow_id → workflows.id
- **Cardinality:** One workflow can be assigned to many users

### User → Workflow (Assignment)
- **Relationship:** Many-to-One (via UserProgress)
- **Assignment Logic:** Based on user's age_group at registration (FR-006)
- **Assignment Rules:**
  - age_group "under18" → workflow with age_group "under18"
  - age_group "18-24" → workflow with age_group "18-24"
  - age_group "25+" → workflow with age_group "25+"
  - permit_status "yes" → workflow with age_group "license-holder" (if user already has license)

---

## Indexes

### users table
- **Unique index on email** (for duplicate prevention - FR-022)
- **Index on age_group** (for workflow assignment queries)
- **Index on location** (for location-based queries)

### workflows table
- **Unique index on age_group** (one workflow per age group)
- **Index on name** (for display queries)

### user_progress table
- **Unique index on (user_id, workflow_id)** (one active progress per workflow)
- **Index on user_id** (for user progress queries)
- **Index on workflow_id** (for workflow analytics)

---

## Data Migration

### Initial Seed Data

**workflows table seed:**
- 4 workflow records (teen, young-adult, adult, license-holder)
- Each with ~6-10 steps extracted from How-It-Works page

**users table:**
- No initial seed data (empty)

**user_progress table:**
- No initial seed data (empty)

---

## Security Considerations

### Password Storage
- Passwords are hashed using bcryptjs with minimum 10 rounds (NFR-001)
- Plain text passwords are never stored
- Password hash is only stored in users table

### Session Data
- Session tokens stored in HttpOnly, Secure cookies (NFR-002)
- No sensitive data in localStorage
- Session ID references user_id but does not contain user data

### Data at Rest
- User data in Google Sheets should be encrypted (NFR-003)
- Email addresses and phone numbers are PII
- Password hashes are sensitive but not reversible

---

## Performance Considerations

### Query Optimization
- Indexes on frequently queried fields (email, age_group, user_id)
- Cache workflow definitions (rarely change)
- Cache user session data (frequent access)

### API Call Optimization
- Batch reads where possible (NFR-006)
- Use existing SheetsClient caching (45s TTL)
- Minimize write operations to Google Sheets

---

## Data Integrity

### Constraints
- Email uniqueness enforced at application level (FR-022)
- Foreign key relationships maintained in application logic
- Enum values validated before storage
- JSON structure validated before storage

### Validation
- Email format validation (FR-003)
- Password strength validation (FR-003)
- Phone number format validation
- Age group enum validation
- Location enum validation
- Permit status enum validation
