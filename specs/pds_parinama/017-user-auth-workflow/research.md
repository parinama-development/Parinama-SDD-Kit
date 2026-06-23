# Research: PDS User Authentication and Workflow Assignment

**Date:** 2026-06-22
**Feature:** 017 - PDS User Authentication and Workflow Assignment

---

## Research Topic 1: Password Hashing Library for Next.js/TypeScript

### Options Evaluated

1. **bcryptjs**
   - Pure JavaScript implementation of bcrypt
   - Widely used, well-maintained
   - Works in both Node.js and browser environments
   - No native dependencies (easier deployment)
   - Performance: Slower than native implementations but acceptable for web apps

2. **argon2**
   - Modern password hashing algorithm
   - More secure against GPU/ASIC attacks
   - Requires native bindings (node-argon2)
   - More complex setup
   - Better security but higher complexity

3. **bcrypt (native)**
   - Native C++ bindings
   - Faster performance
   - Requires compilation (can be problematic in some environments)
   - Not compatible with browser-side operations

### Decision

**Selected: bcryptjs**

**Rationale:**
- Pure JavaScript implementation eliminates build complexity
- Works seamlessly with Next.js (both server and client components)
- Sufficient security for web application use case
- Well-established library with strong community support
- No native compilation required (simpler deployment)
- Meets NFR-001 requirement (bcrypt with minimum 10 rounds)

**Alternatives Considered:**
- argon2: More secure but adds complexity with native bindings
- bcrypt (native): Faster but requires compilation, not ideal for Next.js

---

## Research Topic 2: Session Management for Next.js

### Options Evaluated

1. **Next.js built-in cookies (next/headers)**
   - Native Next.js 14 API
   - Server-side only
   - HttpOnly and Secure flags supported
   - Simple API, no additional dependencies
   - Works with App Router

2. **js-cookie**
   - Client-side cookie library
   - Widely used
   - Client-side only (not HttpOnly)
   - Less secure for authentication tokens

3. **cookie (universal-cookie)**
   - Universal cookie library (works on both client and server)
   - Additional dependency
   - More complex API

4. **localStorage/sessionStorage**
   - Browser storage APIs
   - Not HttpOnly (XSS vulnerable)
   - Not suitable for authentication tokens (violates NFR-002)

### Decision

**Selected: Next.js built-in cookies (next/headers)**

**Rationale:**
- Native Next.js 14 API (no additional dependencies)
- Supports HttpOnly and Secure flags (meets NFR-002)
- Server-side only (more secure)
- Simple API
- Works seamlessly with App Router
- No external dependencies to maintain

**Alternatives Considered:**
- js-cookie: Client-side only, not HttpOnly (security risk)
- universal-cookie: Additional dependency, more complex
- localStorage: Not HttpOnly, XSS vulnerable (violates NFR-002)

---

## Research Topic 3: Email Service for Password Reset

### Options Evaluated

1. **SendGrid**
   - Industry standard for transactional emails
   - Reliable delivery
   - Good API documentation
   - Free tier available (100 emails/day)
   - Requires API key configuration

2. **Resend**
   - Modern email service
   - Developer-friendly API
   - Free tier available (3,000 emails/month)
   - Simple setup
   - Good documentation

3. **Nodemailer with existing SMTP**
   - Use existing business email SMTP
   - No additional service cost
   - Requires SMTP configuration
   - Delivery depends on SMTP provider reputation
   - More complex setup

4. **AWS SES**
   - AWS native service
   - Cost-effective at scale
   - Complex setup
   - Requires AWS account
   - Overkill for simple use case

### Decision

**Selected: Resend**

**Rationale:**
- Modern, developer-friendly API
- Generous free tier (3,000 emails/month)
- Simple setup and configuration
- Good documentation
- Reliable delivery
- No AWS dependency (simpler than SES)
- Better free tier than SendGrid for this use case

**Alternatives Considered:**
- SendGrid: Industry standard but lower free tier
- Nodemailer/SMTP: No service cost but more complex setup, delivery depends on SMTP provider
- AWS SES: Cost-effective at scale but complex setup, overkill for this use case

---

## Research Topic 4: Workflow Step Content Extraction from How-It-Works Page

### Analysis

The How-It-Works page (`app/how-it-works/page.tsx`) contains age-specific licensing steps. The workflow steps need to be extracted and structured for the workflows table.

### Age Groups and Steps (from How-It-Works)

**Teens (15-17):**
1. Parent books DPS appointment at txdpsscheduler.com
2. Submit Verification of Enrollment (VOE) from school
3. Complete teen driver education course (Module 1 for DE-964)
4. Get learner permit (Restriction B)
5. Behind-the-wheel practice
6. Road test

**Young Adults (18-24):**
1. Complete 6-hour adult driver education course
2. Take written exam at DPS
3. Get learner permit
4. Behind-the-wheel practice
5. Road test

**Adults (25+):**
1. Take written exam at DPS (or complete course to skip line)
2. Get learner permit
3. Behind-the-wheel practice
4. Road test

**License Holder (already has license):**
1. Review advanced driving techniques
2. Schedule refresher lessons
3. Practice parallel parking
4. Schedule road test refresh (if needed)

### Decision

**Approach: Manual extraction and JSON structure**

**Rationale:**
- Workflow steps are well-defined in How-It-Works page
- Manual extraction ensures accuracy
- JSON structure allows flexibility for step descriptions
- Can be easily updated in Google Sheets without code changes
- ~10 steps per workflow as specified in spec

**Structure:**
```json
{
  "steps": [
    {
      "order": 1,
      "title": "Step title",
      "description": "Step description",
      "action_url": "Optional URL for action",
      "action_label": "Optional button label"
    }
  ]
}
```

---

## Summary

All unknowns from Technical Context have been resolved:

1. **Password hashing:** bcryptjs (pure JS, no native dependencies)
2. **Session management:** Next.js built-in cookies (next/headers)
3. **Email service:** Resend (modern, generous free tier)
4. **Workflow steps:** Manual extraction from How-It-Works, JSON structure

These decisions align with:
- Tech stack (Next.js 14, TypeScript)
- Security requirements (NFR-001, NFR-002)
- Performance requirements (NFR-004, NFR-006)
- Project simplicity (minimal dependencies)
