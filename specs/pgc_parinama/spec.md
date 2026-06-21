# pgc_parinama — Parinama Group of Companies Admin

## Overview

This repo hosts two things in one Vite/React app deployed to Firebase:
- **Marketing landing page** (`/`) — Links to the four Parinama companies
- **PGC Group Admin** (`/admin`) — OTP-gated, role-scoped control plane for all companies

Live at **https://parinama-pgc.web.app**

## Technology Stack

- **Framework**: Vite + React
- **Language**: TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Backend**: Google Sheets + Google Apps Script
- **Hosting**: Firebase (parinama-pgc)
- **Image Optimization**: Sharp

## Architecture

### Two-Plane Architecture

#### Control Plane (PGC Control Sheet)
- **Staff** — staffId, email, name, role, companies, status
- **Companies** — companyId, name, idPrefix, spreadsheetId, apiKey, appsScriptUrl, businessTimezone, status
- **OTPs** — Login codes

#### Data Plane (One Sheet Per Company)
- PDS sheet, PA sheet, PCC sheet, AIBCG sheet
- Each row in Companies points at one of these
- The same framework Api.gs runs on every data sheet

The control sheet runs the same `Api.gs` as the data sheets — `Companies` and `Staff` are just two extra entries in `TAB_HEADERS`.

## Companies Managed

| Company | ID |
|---------|-----|
| Parinama Driving School | pds |
| Parinama Academy | pa |
| Parinama College Counseling | pcc |
| AI Business Consulting Group | aibcg |

## Group Admin Features

### Authentication & Authorization
- **OTP login** — Admin staff enter email, receive 6-digit code, authenticate. No passwords.
- **Role-based access** — `admin` sees and manages all companies + Staff/Companies registry; `manager` sees only assigned companies, no control-plane access.

### Company Management
- **Company switcher** — Select any company from top bar; framework's `AdminDashboard` and `AdminBookingForm` swap data source to that company's sheet.
- **Workspace draft guard** — Filling form row marks workspace dirty. Switching company or navigating away shows modal: Save & switch / Discard & switch / Cancel. Browser's `beforeunload` event also fires on tab close.
- **Inline unsaved prompt** — Switching admin tabs while form unsaved shows amber prompt with same three options.

### Data Management
- **Generic CRUD** — Per-tab CRUD for Students, Instructors, Bookings, etc.
- **Availability manager** — TidyCal-style: profiles → days → windows → overrides → instructor assignment
- **Journey Progress editor** — Edit student progress stages
- **Assign booking** — Pick student and open instructor slot; same `createBooking` action (LockService-guarded) prevents double-booking
- **Staff management** (admin only) — Add/edit admins and managers, assign company access
- **Companies registry** (admin only) — Register each company's sheet wiring: spreadsheetId, apiKey, appsScriptUrl, idPrefix, timezone

## Source Layout

```
src/
  admin/                  ← Group Admin app (PGC-specific)
    AdminApp.tsx          — OTP gate → AdminShell
    AdminAuthProvider.tsx — Email OTP flow, Staff-based session, role/company lookup
    AdminLogin.tsx        — Email → code entry UI
    AdminShell.tsx        — Company switcher, nav, workspace guard, modal
    AdminBookingForm.tsx  — Assign any student to open instructor slot
    UnsavedModal.tsx      — Save & switch / Discard & switch / Cancel modal
    TabCrud.tsx           — Generic CRUD editor for control-plane tabs (Staff, Companies)
    buildCompanyContext.ts — Builds {config, sheets} from Companies registry row
    companyRegistry.ts    — Reads Companies tab, filters by allowedCompanies
    controlConfig.ts      — SheetsClient for the control sheet
    types.ts              — CompanyRow type

  framework/              ← Vendored copy of pds_parinama/framework (DO NOT edit here)
                          — Edit in pds_parinama/framework, then run scripts/sync-framework.sh
```

## Environment Variables

The Group Admin reads all wiring at runtime from the Companies registry — no per-company env vars needed. Only control sheet credentials:

```bash
# .env (never commit)
VITE_CONTROL_SHEET_ID=         # PGC control spreadsheet id
VITE_CONTROL_API_KEY=          # Sheets API key for the control sheet
VITE_CONTROL_APPS_SCRIPT_URL=  # Control sheet Apps Script /exec URL
```

Set in `src/admin/controlConfig.ts`.

## Build & Deploy

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite → dist/
firebase deploy --only hosting   # Firebase project: parinama-pgc
```

Navigate to `/admin` to use Group Admin. First login requires Staff row in control sheet with your email and `role=admin`.

## Marketing Site (/)

The landing page links to all four companies. All copy + contact details + company list live in `src/data/site.ts`. Logos are in `./logos/`; auto-trimmed/compressed PNGs output to `public/img/` by:

```bash
npm run optimize:logos   # requires sharp (devDependency)
```

## Framework Sync

`src/framework/` is a vendored copy. To pull changes from canonical source:

```bash
bash ../pds_parinama/scripts/sync-framework.sh
```

**Never edit `src/framework/` directly.** Make changes in `pds_parinama/framework/` and re-run sync.

## Key Features

1. **Centralized Admin** — Single dashboard for all Parinama companies
2. **Role-Based Access** — Admin (all companies) vs Manager (assigned companies)
3. **OTP Authentication** — Passwordless login with 6-digit codes
4. **Company Switcher** — Seamlessly switch between company data sources
5. **Workspace Guard** — Prevents data loss with unsaved changes detection
6. **Generic CRUD** — Reusable CRUD editor for any tab
7. **Availability Management** — TidyCal-style slot management
8. **Zero Infrastructure** — Google Sheets + Apps Script backend
