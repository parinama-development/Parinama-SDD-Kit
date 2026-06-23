# API Contracts: PDS User Authentication and Workflow Assignment

**Feature:** 017 - PDS User Authentication and Workflow Assignment
**Date:** 2026-06-22

---

## Overview

This document defines the API contracts for user authentication, workflow assignment, and progress tracking. All APIs use the existing Google Sheets API integration via SheetsClient and Google Apps Script.

---

## Authentication API

### POST /api/auth/register

**Description:** Register a new user account and assign workflow based on age group.

**Request:**
```typescript
{
  email: string;           // Required, email format
  password: string;        // Required, min 8 characters
  full_name: string;       // Required, min 2 characters
  phone: string;           // Required, phone format
  age_group: "under18" | "18-24" | "25+";  // Required
  location: "austin" | "san-antonio";       // Required
  permit_status: "yes" | "no";              // Required
}
```

**Response (Success - 201):**
```typescript
{
  success: true;
  user_id: string;         // UUID
  workflow_id: string;     // UUID of assigned workflow
  message: string;
}
```

**Response (Error - 400):**
```typescript
{
  success: false;
  error: string;           // Validation error message
  field?: string;          // Field that caused error
}
```

**Response (Error - 409):**
```typescript
{
  success: false;
  error: "An account with this email already exists";
}
```

**Implementation Notes:**
- Hash password using bcryptjs (10+ rounds)
- Validate email uniqueness before creating user
- Assign workflow based on age_group
- Create user_progress record with current_step = 1
- Create session cookie after successful registration

---

### POST /api/auth/login

**Description:** Authenticate user and create session.

**Request:**
```typescript
{
  email: string;           // Required
  password: string;        // Required
}
```

**Response (Success - 200):**
```typescript
{
  success: true;
  user: {
    id: string;
    email: string;
    full_name: string;
    age_group: string;
    location: string;
    permit_status: string;
  };
  workflow: {
    id: string;
    name: string;
    steps: Array<{
      order: number;
      title: string;
      description: string;
      action_url?: string;
      action_label?: string;
    }>;
  };
  progress: {
    current_step: number;
    completed_steps: number[];
    total_steps: number;
  };
}
```

**Response (Error - 401):**
```typescript
{
  success: false;
  error: "Invalid email or password";
}
```

**Implementation Notes:**
- Hash password and compare with stored hash
- Create HttpOnly, Secure session cookie
- Fetch user's assigned workflow and progress
- Return user profile, workflow, and progress data

---

### POST /api/auth/logout

**Description:** Terminate user session.

**Request:** None (uses session cookie)

**Response (Success - 200):**
```typescript
{
  success: true;
  message: "Logged out successfully";
}
```

**Implementation Notes:**
- Clear session cookie
- Invalidate session on server

---

### POST /api/auth/reset-password

**Description:** Request password reset link via email.

**Request:**
```typescript
{
  email: string;           // Required
}
```

**Response (Success - 200):**
```typescript
{
  success: true;
  message: "Password reset link sent to your email";
}
```

**Response (Error - 404):**
```typescript
{
  success: false;
  error: "No account found with this email";
}
```

**Implementation Notes:**
- Generate reset token with 24-hour expiration
- Send email via Resend with reset link
- Store reset token in users table (new field: reset_token, reset_token_expires_at)

---

### POST /api/auth/reset-password/confirm

**Description:** Reset password using reset token.

**Request:**
```typescript
{
  token: string;           // Required (from email link)
  new_password: string;   // Required, min 8 characters
}
```

**Response (Success - 200):**
```typescript
{
  success: true;
  message: "Password reset successfully";
}
```

**Response (Error - 400):**
```typescript
{
  success: false;
  error: "Invalid or expired reset token";
}
```

**Implementation Notes:**
- Validate token and expiration
- Hash new password using bcryptjs
- Update password_hash in users table
- Clear reset_token and reset_token_expires_at
- Invalidate all existing sessions for user

---

## User Profile API

### GET /api/user/profile

**Description:** Get current user profile.

**Request:** None (uses session cookie)

**Response (Success - 200):**
```typescript
{
  id: string;
  email: string;
  full_name: string;
  phone: string;
  age_group: string;
  location: string;
  permit_status: string;
  created_at: string;
  updated_at: string;
}
```

**Response (Error - 401):**
```typescript
{
  success: false;
  error: "Not authenticated";
}
```

---

### PATCH /api/user/profile

**Description:** Update user profile (location only).

**Request:**
```typescript
{
  location: "austin" | "san-antonio";  // Required
}
```

**Response (Success - 200):**
```typescript
{
  success: true;
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    age_group: string;
    location: string;
    permit_status: string;
    updated_at: string;
  };
}
```

**Response (Error - 400):**
```typescript
{
  success: false;
  error: "Invalid location value";
}
```

**Implementation Notes:**
- Only location can be updated (FR-024)
- age_group cannot be changed (FR-025)
- Workflow is not re-assigned on location change (FR-026)

---

## Workflow API

### GET /api/workflow

**Description:** Get user's assigned workflow and progress.

**Request:** None (uses session cookie)

**Response (Success - 200):**
```typescript
{
  workflow: {
    id: string;
    name: string;
    age_group: string;
    steps: Array<{
      order: number;
      title: string;
      description: string;
      action_url?: string;
      action_label?: string;
    }>;
  };
  progress: {
    id: string;
    current_step: number;
    completed_steps: number[];
    total_steps: number;
    percent_complete: number;
  };
}
```

**Response (Error - 401):**
```typescript
{
  success: false;
  error: "Not authenticated";
}
```

---

### POST /api/workflow/step/complete

**Description:** Mark current workflow step as complete.

**Request:**
```typescript
{
  step_number: number;     // Required
}
```

**Response (Success - 200):**
```typescript
{
  success: true;
  progress: {
    current_step: number;
    completed_steps: number[];
    total_steps: number;
    percent_complete: number;
  };
  next_step?: {
    order: number;
    title: string;
    description: string;
    action_url?: string;
    action_label?: string;
  };
}
```

**Response (Error - 400):**
```typescript
{
  success: false;
  error: "Invalid step number or step already completed";
}
```

**Implementation Notes:**
- Validate step_number exists in workflow
- Validate step is not already completed
- Validate steps are completed in order
- Update user_progress record
- Increment current_step
- Add step to completed_steps array
- Return next step if available

---

## Data Access Layer Contracts

### SheetsClient Extensions

**New Methods:**

```typescript
// User operations
async createUser(user: User): Promise<User>;
async findUserByEmail(email: string): Promise<User | null>;
async updateUser(userId: string, updates: Partial<User>): Promise<User>;
async updateUserPassword(userId: string, newPasswordHash: string): Promise<void>;

// Workflow operations
async getWorkflowByAgeGroup(ageGroup: string): Promise<Workflow | null>;
async getAllWorkflows(): Promise<Workflow[]>;

// Progress operations
async createUserProgress(progress: UserProgress): Promise<UserProgress>;
async getUserProgress(userId: string, workflowId: string): Promise<UserProgress | null>;
async updateUserProgress(progressId: string, updates: Partial<UserProgress>): Promise<UserProgress>;
```

**Implementation:**
- Use existing SheetsClient for Google Sheets API calls
- Add new methods to framework/api/client.ts or create new auth-client.ts
- Leverage existing caching mechanism (45s TTL)
- Use Google Apps Script for write operations

---

## Session Management Contract

### Session Cookie

**Name:** `pds_session`

**Attributes:**
- HttpOnly: true (prevents XSS)
- Secure: true (HTTPS only)
- SameSite: strict (prevents CSRF)
- MaxAge: 7 days (session duration)
- Value: JWT token containing user_id

**JWT Payload:**
```typescript
{
  user_id: string;
  exp: number;            // Expiration timestamp
  iat: number;            // Issued at timestamp
}
```

**Implementation:**
- Use Next.js cookies API (next/headers)
- Sign JWT with secret key from environment variables
- Validate JWT on each authenticated request
- Refresh token on activity (optional)

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 404 | Not Found (user/email not found) |
| 409 | Conflict (duplicate email) |
| 500 | Internal Server Error |

---

## Rate Limiting

**Endpoints with rate limiting:**
- POST /api/auth/register: 5 requests per hour per IP
- POST /api/auth/login: 10 requests per minute per IP
- POST /api/auth/reset-password: 3 requests per hour per IP

**Implementation:**
- Use in-memory rate limiting (Redis recommended for production)
- Return 429 Too Many Requests with Retry-After header

---

## Security Headers

All API responses must include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
