# sheetsu — Architecture

## System Overview

sheetsu is a backendless framework that uses Google Sheets as the database and Google Apps Script as the write API. It provides drop-in auth, profiles, booking, progress tracking, and a generic admin dashboard for React applications (Next.js or Vite).

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18+ (Next.js or Vite) |
| Language | TypeScript |
| Styling | Tailwind CSS (with preset) |
| Database | Google Sheets |
| Write API | Google Apps Script (Web App) |
| Read API | Google Sheets API v4 |
| Testing | Vitest |
| Package | npm (ESM) |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Browser (React Application)                   │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │  Public Pages        │  │  Authenticated Area         │  │
│  │  - Landing           │  │  - AuthPanel (OTP/Password) │  │
│  │  - Marketing         │  │  - ProfileForm              │  │
│  └──────────────────────┘  │  - Scheduler (Booking)      │  │
│                            │  - ProgressTracker           │  │
│                            │  - AdminDashboard            │  │
│                            └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Google Sheets   │  │ Google Sheets   │  │ Google Apps     │
│ API v4 (Read)   │  │ (Database)      │  │ Script (Write)  │
│ - Public read   │  │ - Users         │  │ - /exec API     │
│ - Cached (TTL)  │  │ - Profiles      │  │ - LockService   │
│                 │  │ - Bookings      │  │ - Email         │
│                 │  │ - Progress      │  │ - Validation    │
│                 │  │ - Availability  │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Package Structure

```
sheetsu/
  src/
    auth/                    — Authentication (OTP, password)
    profile/                 — Profile management
    booking/                 — Booking/scheduling system
    progress/                — Progress tracking
    admin/                   — Generic admin dashboard
    client/                  — SheetsClient (read/write)
    types/                   — TypeScript types
  dist/                     — Compiled ESM output
  apps-script/              — Google Apps Script backend
  tailwind/                 — Tailwind preset
  styles/                   — Component CSS
  bin/                      — CLI tools (init-backend)
```

## Data Flow

### Read Flow (Public)

1. Component needs data (e.g., user profile)
2. `SheetsClient.get()` called with sheet name and query
3. Request to Google Sheets API v4 with `?key=API_KEY`
4. Sheet must be shared as "Anyone with the link: Viewer"
5. Data returned with TTL cache
6. Component renders data

### Write Flow (Authenticated)

1. User action (e.g., update profile, book slot)
2. Component calls action (e.g., `updateProfile()`, `createBooking()`)
3. Action POSTs to Apps Script `/exec` URL
4. Apps Script validates request
5. `LockService` acquires lock (for booking)
6. Mutation written to Google Sheet
7. Data re-read to confirm
8. Lock released
9. Response returned to browser

### Authentication Flow (OTP)

1. User enters email in `AuthPanel`
2. `sendOTP()` called → POST to Apps Script
3. Apps Script generates 6-digit code
4. Code stored in sheet with expiry
5. Email sent via `MailApp`
6. User enters code
7. `verifyOTP()` called → POST to Apps Script
8. Apps Script validates code
9. If valid → User record returned
10. Session stored in localStorage

### Booking Flow

1. User opens `Scheduler`
2. `SheetsClient.get()` loads availability from sheet
3. Availability structured: profiles → days → windows → slots
4. User selects slot
5. `createBooking()` called → POST to Apps Script
6. Apps Script `LockService` acquires lock
7. Checks slot availability
8. Writes booking to sheet
9. Releases lock
10. Confirmation returned

## Key Design Patterns

### Backendless Architecture

- No server to run
- Google Sheets as database
- Apps Script as write API
- Browser does everything else

### Public-Read, Unauthenticated-Write

- Sheet shared as "Anyone with the link: Viewer"
- Apps Script `/exec` URL unauthenticated
- UI-level auth only (not real authorization)
- Suitable for non-sensitive data

### Modular Availability Model

Availability structured hierarchically:
1. **Profiles** — Reusable templates (e.g., "Weekday Mornings")
2. **Days** — Specific dates with assigned profiles
3. **Windows** — Time ranges within days
4. **Slots** — Expanded windows with instructor assignment
5. **Overrides** — One-off exceptions

### LockService (Double-Booking Prevention)

Apps Script `LockService` ensures atomic operations:
- Acquires lock before write
- Checks availability
- Writes mutation
- Releases lock

### Config-Driven

Single `BusinessConfig` object adapts framework to any business:
- `idPrefix` — ID prefix for records
- `profileFields` — Config-driven profile fields
- `journeyStages` — Configurable progress stages
- `booking` — Booking configuration (labels, timezone, horizon)
- `adminTabs` — Tabs to manage in admin

### Derived Fields

Profile fields can be derived (computed, not asked):
- Age group from DOB
- School grade from graduation year
- Computed in Apps Script, never stored

### Generic Admin Dashboard

`AdminDashboard` works with any sheet tab:
- Reads tab schema from config
- Renders CRUD interface
- Includes availability manager
- Includes journey editor
- Workspace draft guard

### Multi-Tenant Ready

One admin can manage multiple businesses:
- Each business has its own sheet
- `AdminDashboard` supports company switching
- `onDirtyChange`/`onFlushReady` for workspace isolation

## Security Model

⚠️ **Deliberately Low-Security**

- Data sheet is **public-read**
- Apps Script write endpoint is **unauthenticated**
- Auth is **UI-level**, not real authorization
- Suitable for non-sensitive data (schedules, bookings, progress)
- **Do not store** secrets, payment data, or regulated PII

### Hardening Path

Server-side authorization hardening is possible:
- Add Firebase Auth to Apps Script
- Validate Firebase ID token in Apps Script
- Restrict sheet access to authenticated users
- Documented in `docs/ARCHITECTURE.md`

## Package Exports

| Export | What |
|--------|------|
| `sheetsu` | React components + `SheetsClient` + types |
| `sheetsu/styles.css` | Component CSS classes |
| `sheetsu/tailwind-preset` | Tailwind preset with design tokens |
| `sheetsu/apps-script/*` | Apps Script backend assets |
| `npx sheetsu init-backend` | CLI to copy backend |

## Component API

### Core Components

- `FrameworkProvider` — Root provider with config
- `AuthProvider` — Authentication context
- `AuthPanel` — Login/signup UI
- `ProfileForm` — Profile editing
- `Scheduler` — Booking/scheduling UI
- `ProgressTracker` — Journey progress UI
- `AdminDashboard` — Generic admin UI

### Hooks

- `useAuth()` — Authentication state
- `useProfile()` — Profile data
- `useBooking()` — Booking state
- `useProgress()` — Progress data

### Client

- `SheetsClient` — Read/write API to Google Sheets + Apps Script

## Environment Configuration

```bash
VITE_SHEET_ID=              # Google Sheet ID
VITE_SHEETS_API_KEY=        # Sheets API key (public)
VITE_APPS_SCRIPT_URL=       # Apps Script /exec URL
```

## Build Process

```bash
npm run build              # tsc → dist/ (ESM + .d.ts)
npm test                   # vitest — pure logic units
npm run typecheck          # type-only check
```

TypeScript compilation preserves `"use client"` directive for Next.js compatibility.

## Key Features

1. **Zero Infrastructure** — No server to run
2. **Auth Options** — OTP, password, both, or none
3. **Config-Driven** — Single config adapts to any business
4. **Derived Fields** — Computed fields (age from DOB)
5. **Modular Booking** — Profiles → days → windows → slots
6. **Double-Booking Prevention** — LockService
7. **Timezone Aware** — All booking respects timezone
8. **Generic Admin** — CRUD for any sheet tab
9. **Multi-Tenant** — One admin, multiple businesses
10. **Tailwind Preset** — Design tokens included

## Documentation

- `docs/USAGE.md` — Full walkthrough
- `docs/ARCHITECTURE.md` — Internal architecture
- `CHANGELOG.md` — Version history
