# pds_parinama — Architecture

## System Overview

Parinama Driving School is a two-layer application:
1. **Marketing Site + Workflow Engine** — Public-facing lead capture and personalized roadmap generation
2. **Member Area** — Parinama Framework-powered account management for students

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Backend | Google Sheets + Google Apps Script |
| Hosting | Firebase (parinama-pds) |
| Testing | Vitest |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Next.js)                        │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │  Marketing Site      │  │  Member Area (Framework)   │  │
│  │  - Workflow Modal    │  │  - Auth (OTP)              │  │
│  │  - Lead Capture      │  │  - Profile Management      │  │
│  │  - Roadmap Gen       │  │  - Booking System          │  │
│  └──────────────────────┘  │  - Progress Tracking       │  │
│                            └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Google Sheets   │  │ Google Sheets   │  │ Google Apps     │
│ (Data Sheet)    │  │ (Leads Sheet)   │  │ Script (Write)  │
│ - Students      │  │ - Leads         │  │ - /exec API     │
│ - Instructors   │  │ - Roadmaps      │  │ - LockService   │
│ - Bookings      │  │                 │  │ - Email         │
│ - Progress      │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Component Structure

### Marketing Site

```
lib/
  workflow.ts              — Pure functions for flow computation
  constants.ts             — Business config (prices, contact info)
  lead.ts                  — Lead submission logic
components/workflow/
  WorkflowProvider.tsx     — State + localStorage persistence
  WorkflowModal.tsx        — Modal shell
  steps.tsx                — Screen components
google-apps-script/
  Code.gs                  — Lead capture Apps Script
```

### Member Area (Parinama Framework)

```
framework/
  auth/                    — Email OTP authentication
  profile/                 — Config-driven profile fields
  booking/                 — TidyCal-style scheduler
  progress/                — Journey progress tracker
  admin/                   — Generic CRUD + availability manager
```

## Data Flow

### Lead Capture Flow

1. User visits site → Workflow modal appears after delay
2. User answers questions → `computeFlow()` determines path
3. `computeNeeds()` extracts user needs
4. `computeRoadmap()` generates personalized roadmap
5. User contact captured → POST to Apps Script Web App
6. Apps Script appends to Google Sheet
7. Email sent to team

### Member Authentication Flow

1. User navigates to `/account`
2. `AuthProvider` checks session (localStorage)
3. If not authenticated → Email OTP flow
4. User enters email → OTP generated and sent
5. User enters OTP → Validated against Google Sheet
6. Session stored in localStorage

### Booking Flow

1. User navigates to `/account/book`
2. `Scheduler` loads availability from Google Sheet
3. Availability profiles → days → windows → slots
4. User selects slot → `createBooking` action called
5. Apps Script `LockService` prevents double-booking
6. Booking written to Google Sheet
7. Confirmation displayed

## Key Design Patterns

### Pure Functions (Workflow)

All workflow logic is in pure functions in `lib/workflow.ts`:
- `computeFlow(answers)` → Determines user's path
- `computeNeeds(answers)` → Extracts user needs
- `computeRoadmap(needs)` → Generates roadmap
- `primaryOutcome(roadmap)` → Determines primary action

### State Management (Framework)

- `WorkflowProvider` — React Context for workflow state
- LocalStorage persistence for resume capability
- Framework uses React Context for auth, profile, booking state

### Modular Availability (Booking)

Availability is structured hierarchically:
1. **Profiles** — Reusable availability templates (e.g., "Weekday Mornings")
2. **Days** — Specific dates with assigned profiles
3. **Windows** — Time ranges within days
4. **Slots** — Expanded windows with instructor assignment
5. **Overrides** — One-off exceptions

### LockService (Double-Booking Prevention)

Apps Script `LockService` ensures atomic booking operations:
- Acquires lock before writing
- Checks slot availability
- Writes booking
- Releases lock

## Security Considerations

### Public-Read Sheet

The data sheet is shared as "Anyone with the link: Viewer" for public read access via Sheets API v4.

### Unauthenticated Write Endpoint

The Apps Script `/exec` URL is unauthenticated (anyone with URL can POST). This is acceptable for non-sensitive data (lesson bookings, student progress).

### OTP Authentication

Email OTP provides UI-level authentication, not real authorization. Suitable for non-sensitive use cases.

## Environment Configuration

```bash
NEXT_PUBLIC_SHEETS_SPREADSHEET_ID=   # PDS data sheet id
NEXT_PUBLIC_SHEETS_API_KEY=          # Google Sheets API key (public)
NEXT_PUBLIC_FRAMEWORK_API_URL=       # PDS Apps Script /exec URL
NEXT_PUBLIC_AUTH_METHOD=otp          # password | otp | both | none
NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Toronto
NEXT_PUBLIC_LEADS_SHEET_URL=         # Lead-capture Apps Script URL
```

## Deployment

```bash
npm run build              # Next.js static export → out/
firebase deploy --only hosting   # Firebase project: parinama-pds
```

Static export means no server — all logic runs in the browser.

## Framework Sync

`pds_parinama/framework/` is the canonical source for the Parinama Framework. Changes are synced to PGC via `scripts/sync-framework.sh`. Never edit `pgc_parinama/src/framework/` directly.
