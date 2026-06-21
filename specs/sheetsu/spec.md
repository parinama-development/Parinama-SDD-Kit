# sheetsu — Google Sheets Backend Framework

## Overview

**Google Sheets as your backend.** Drop-in **auth, profiles, booking, progress tracking, and a generic admin dashboard** into any React app (Next.js or Vite) — with **no server to run**. One Google Sheet is the database, one Apps Script web app is the write API, and the browser does the rest. Adapt it to a business with a single config object.

Built for small businesses and side projects that need accounts + scheduling without standing up (and paying for) a backend.

## Architecture

```
READS   browser ──► Google Sheets API v4 (?key=API_KEY) ──► public-read sheet   (cached, TTL)
WRITES  browser ──► Apps Script /exec (no-cors POST) ──► sheet mutation ──► re-read to confirm
```

## Technology Stack

- **Platform**: Google Apps Script + Google Sheets
- **Language**: TypeScript
- **Framework**: React 18+ (Next.js or Vite)
- **Styling**: Tailwind CSS (with preset)
- **Testing**: Vitest
- **License**: MIT

## Features

- **Auth** — Email OTP and/or password login + signup (`auth.method`). No backend session store.
- **Profiles** — Config-driven fields, including derived fields (age group from DOB, school grade from graduation year) that are computed, never asked.
- **Booking** — Calendly-style, timezone-aware scheduler. Modular availability model (reusable profiles → weekday windows → one-off overrides), `LockService` double-booking prevention, timezone-aware display.
- **Progress** — Per-user journey tracker over configurable stages.
- **Admin** — Generic per-tab CRUD + TidyCal-style availability manager + journey editor. Workspace draft guard: unsaved form input blocks tab switching (inline prompt) and company switching (modal).
- **Notifications** — Event/audit log with optional email (Apps Script `MailApp`).
- **Multi-tenant ready** — One admin can manage many businesses (each its own sheet). `AdminDashboard` exposes `onDirtyChange`/`onFlushReady` for per-company workspace isolation.

## Requirements

- React 18+ app (Next.js App Router or Vite)
- Tailwind CSS (sheetsu ships a preset with design tokens + component classes)
- Google account: one Sheet + Sheets API key + Apps Script web app

## Quickstart

```bash
npm install sheetsu
npx sheetsu init-backend     # copies Apps Script backend to ./sheetsu-apps-script
```

### 1. Backend Setup (~3 min)

1. Create a Google Sheet → Share *Anyone with the link: Viewer*
2. In Extensions → Apps Script, paste `Api.gs` + `appsscript.json` (and `Seed.gs`, `test.gs`)
3. Run `seedAll()`, authorize
4. Deploy → **Web app** (Execute as: Me · Access: Anyone)
5. Copy the `/exec` URL
6. Grab a **Sheets API key** from Google Cloud Console

### 2. Tailwind Configuration

Add the preset and include sheetsu's dist in `content`:

```ts
// tailwind.config.ts
import preset from "sheetsu/tailwind-preset";
export default {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx}", "./node_modules/sheetsu/dist/**/*.js"],
};
```

```ts
import "sheetsu/styles.css"; // once, at your app root
```

### 3. Configure + Mount

```tsx
import { FrameworkProvider, AuthProvider, SheetsClient, type BusinessConfig } from "sheetsu";

const config: BusinessConfig = {
  idPrefix: "ACME", name: "Acme Tutoring", shortName: "Acme", brandToken: "brand",
  sheets: {
    spreadsheetId: import.meta.env.VITE_SHEET_ID,
    apiKey:        import.meta.env.VITE_SHEETS_API_KEY,
    appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL,
  },
  auth: { method: "otp" },                 // "password" | "otp" | "both" | "none"
  profileFields: [
    { key: "name",  label: "Full name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", readOnly: true },
  ],
  journeyStages: [
    { key: "enrolled", label: "Enrolled" },
    { key: "active", label: "In Progress" },
    { key: "complete", label: "Completed" },
  ],
  booking: { instructorLabel: "Tutor", sessionLabel: "Session", horizonDays: 14,
             businessTimezone: "America/Toronto" },
  adminTabs: [ /* one entry per sheet tab you want to manage */ ],
};
const sheets = new SheetsClient(config.sheets);

export function AppRoot({ children }: { children: React.ReactNode }) {
  return (
    <FrameworkProvider config={config} sheets={sheets}>
      <AuthProvider>{children}</AuthProvider>
    </FrameworkProvider>
  );
}
```

### 4. Use Components

```tsx
import { AuthPanel, ProfileForm, Scheduler, ProgressTracker, AdminDashboard, useAuth } from "sheetsu";

function Account() {
  const { user } = useAuth();
  if (!user) return <AuthPanel />;
  return (<><ProfileForm /><Scheduler /><ProgressTracker /></>);
}
function Admin() { return <AdminDashboard />; }
```

## Security Model

⚠️ **Read this carefully**

sheetsu is **deliberately backendless and low-security**: the data sheet is **public-read** and the Apps Script write endpoint is **unauthenticated** (anyone with the `/exec` URL can POST). Auth is **UI-level**, not real authorization.

This is the right trade-off for non-sensitive data (class schedules, sample profiles, lesson bookings). **Do not store secrets, payment data, or regulated/PII-heavy data in these sheets.**

A server-side authorization hardening path is noted in `docs/ARCHITECTURE.md`.

## Package Exports

| Import | What |
|--------|------|
| `sheetsu` | React components + `SheetsClient` + `BusinessConfig` types (`dist/`) |
| `sheetsu/styles.css` | Component classes (`card`, `btn-*`, …) — import once |
| `sheetsu/tailwind-preset` | Design tokens (brand/ink/surface) for Tailwind config |
| `sheetsu/apps-script/*` | Google Apps Script backend assets |
| `npx sheetsu init-backend` | Copy backend out for pasting/clasp |

## Development

```bash
npm install        # dev deps (typescript, vitest, react types)
npm run build      # tsc → dist/ (ESM + .d.ts, preserves "use client")
npm test           # vitest — pure logic units (slots, grade derivation)
npm run typecheck  # type-only check
```

## Documentation

- `docs/USAGE.md` — Full walkthrough
- `docs/ARCHITECTURE.md` — How it works inside
- `CHANGELOG.md` — Version history

## Key Features

1. **Zero Infrastructure** — No server to run, Google Sheets as database
2. **Auth Options** — OTP, password, both, or none
3. **Config-Driven** — Single config object adapts to any business
4. **Derived Fields** — Computed fields (age from DOB, grade from graduation year)
5. **Modular Booking** — Reusable availability profiles → windows → slots
6. **Double-Booking Prevention** — LockService guards
7. **Timezone Aware** — All booking respects business timezone
8. **Generic Admin** — CRUD for any sheet tab
9. **Multi-Tenant** — One admin manages multiple businesses
10. **Tailwind Preset** — Design tokens included
