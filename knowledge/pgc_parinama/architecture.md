# pgc_parinama — Architecture

## System Overview

Parinama Group of Companies Admin is a two-plane application:
1. **Control Plane** — PGC control sheet managing staff, companies, and OTPs
2. **Data Plane** — Individual company sheets (PDS, PA, PCC, AIBCG) managed through the admin

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Vite + React |
| Language | TypeScript |
| Routing | React Router DOM |
| Styling | Tailwind CSS |
| Backend | Google Sheets + Google Apps Script |
| Hosting | Firebase (parinama-pgc) |
| Image Optimization | Sharp |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Browser (Vite + React)                      │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │  Marketing Site (/)  │  │  Group Admin (/admin)       │  │
│  │  - Landing Page      │  │  - OTP Authentication      │  │
│  │  - Company Links     │  │  - Company Switcher        │  │
│  └──────────────────────┘  │  - Generic CRUD             │  │
│                            │  - Availability Manager     │  │
│                            │  - Booking Assignment       │  │
│                            │  - Staff Management         │  │
│                            └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ PGC Control     │  │ PDS Data Sheet  │  │ PA Data Sheet   │
│ Sheet           │  │ - Students     │  │ - Students     │
│ - Staff         │  │ - Instructors  │  │ - Instructors  │
│ - Companies     │  │ - Bookings     │  │ - Bookings     │
│ - OTPs          │  │ - Progress     │  │ - Progress     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│ PCC Data Sheet  │  │ AIBCG Data Sheet│
│ - Students     │  │ - Students     │
│ - Instructors  │  │ - Instructors  │
│ - Bookings     │  │ - Bookings     │
│ - Progress     │  │ - Progress     │
└─────────────────┘  └─────────────────┘
```

## Component Structure

### Admin App

```
src/admin/
  AdminApp.tsx              — OTP gate → AdminShell
  AdminAuthProvider.tsx     — Email OTP flow, Staff-based session
  AdminLogin.tsx            — Email → code entry UI
  AdminShell.tsx            — Company switcher, nav, workspace guard
  AdminBookingForm.tsx      — Assign student to instructor slot
  UnsavedModal.tsx          — Save & switch / Discard & switch / Cancel
  TabCrud.tsx               — Generic CRUD editor for control-plane tabs
  buildCompanyContext.ts    — Builds {config, sheets} from Companies row
  companyRegistry.ts        — Reads Companies tab, filters by allowedCompanies
  controlConfig.ts          — SheetsClient for the control sheet
  types.ts                  — CompanyRow type

src/framework/              — Vendored Parinama Framework (DO NOT EDIT)
```

### Marketing Site

```
src/
  data/site.ts              — Copy, contact details, company list
public/img/                — Optimized logos
```

## Data Flow

### Authentication Flow

1. User navigates to `/admin`
2. `AdminAuthProvider` checks session (localStorage)
3. If not authenticated → Email OTP flow
4. User enters email → OTP generated and stored in control sheet
5. User enters OTP → Validated against control sheet
6. Staff record loaded → Role and company access determined
7. Session stored in localStorage

### Company Switching Flow

1. User selects company from switcher
2. `buildCompanyContext()` reads Companies registry row
3. Constructs `config` and `sheets` for selected company
4. `AdminDashboard` and `AdminBookingForm` swap data source
5. Workspace guard checks for unsaved changes
6. If dirty → Show modal: Save & switch / Discard & switch / Cancel
7. If clean → Switch immediately

### Data CRUD Flow

1. User navigates to admin tab (e.g., Students)
2. `TabCrud` loads data from selected company's sheet
3. User edits/adds/deletes rows
4. Workspace marked dirty
5. User saves → POST to Apps Script `/exec`
6. Apps Script writes to sheet
7. Data re-read to confirm
8. Workspace marked clean

### Booking Assignment Flow

1. User navigates to Booking tab
2. `AdminBookingForm` loads available slots from company sheet
3. User selects student and slot
4. `createBooking` action called
5. Apps Script `LockService` prevents double-booking
6. Booking written to company sheet
7. Confirmation displayed

## Key Design Patterns

### Two-Plane Architecture

- **Control Plane** — PGC control sheet (Staff, Companies, OTPs)
- **Data Plane** — Individual company sheets (one per business)
- Same `Api.gs` runs on all sheets
- Control sheet just has extra entries in `TAB_HEADERS`

### Role-Based Access

- **Admin** — Sees all companies + Staff/Companies registry (control-plane access)
- **Manager** — Sees only assigned companies (no control-plane access)
- Determined by `role` field in Staff record

### Company Registry

Companies registry in control sheet contains:
- `companyId` — Unique identifier
- `name` — Display name
- `idPrefix` — ID prefix for records
- `spreadsheetId` — Data sheet ID
- `apiKey` — Sheets API key
- `appsScriptUrl` — Apps Script `/exec` URL
- `businessTimezone` — Business timezone
- `status` — Active/inactive

### Workspace Draft Guard

- Form input marks workspace dirty
- Switching company → Modal: Save & switch / Discard & switch / Cancel
- Switching tabs → Inline amber prompt with same options
- Browser `beforeunload` event fires on tab close

### Generic CRUD

`TabCrud` is a reusable component that:
- Reads tab schema from config
- Renders appropriate form fields
- Handles add/edit/delete operations
- Works with any sheet tab

## Security Considerations

### Public-Read Sheets

All sheets (control and data) are shared as "Anyone with the link: Viewer" for public read access.

### Unauthenticated Write Endpoint

The Apps Script `/exec` URL is unauthenticated. This is acceptable for non-sensitive data.

### Role-Based Access Control

Role-based access is UI-level, not real authorization. Manager role hides control-plane tabs but doesn't prevent direct access to control sheet.

### OTP Authentication

Email OTP provides UI-level authentication. Suitable for admin use cases.

## Environment Configuration

```bash
VITE_CONTROL_SHEET_ID=         # PGC control spreadsheet id
VITE_CONTROL_API_KEY=          # Sheets API key for control sheet
VITE_CONTROL_APPS_SCRIPT_URL=  # Control sheet Apps Script /exec URL
```

No per-company environment variables needed — all wiring read from Companies registry at runtime.

## Deployment

```bash
npm run build              # tsc + vite → dist/
firebase deploy --only hosting   # Firebase project: parinama-pgc
```

## Framework Sync

`src/framework/` is a vendored copy of `pds_parinama/framework`. To pull changes:

```bash
bash ../pds_parinama/scripts/sync-framework.sh
```

Never edit `src/framework/` directly. Make changes in `pds_parinama/framework/` and re-run sync.
