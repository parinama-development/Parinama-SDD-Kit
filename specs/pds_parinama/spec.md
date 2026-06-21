# pds_parinama — Parinama Driving School

## Overview

Parinama Driving School is a premium, conversion-focused website for a driving school in Austin, Texas. It serves as both a marketing site and a full member platform, guiding visitors from learner permit to driver license while managing accounts, lesson booking, and student progress.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Backend**: Google Sheets + Google Apps Script (zero server, zero cost)
- **Hosting**: Firebase (parinama-pds)
- **Testing**: Vitest

## Architecture

### Two-Layer Architecture

#### 1. Marketing Site + Workflow Engine (Public Face)

- **Workflow Modal**: Fullscreen modal "Let's Build Your Driving Plan" appears after short delay
- **Lead Capture**: Questions → branches → personalized roadmap → contact capture → next action
- **Tech**: Pure functions in `lib/workflow.ts`, state in `components/workflow/WorkflowProvider.tsx`
- **Lead Storage**: POST to Google Apps Script Web App → Google Sheet → email team

**Key Files**:
- `lib/workflow.ts` — Pure functions: `computeFlow`, `computeNeeds`, `computeRoadmap`, `primaryOutcome`
- `components/workflow/WorkflowProvider.tsx` — State + localStorage persistence
- `components/workflow/steps.tsx` — Screen components
- `components/workflow/WorkflowModal.tsx` — Modal shell
- `lib/constants.ts` — Business config: contact info, Calendly URL, prices, road-test, affiliate
- `google-apps-script/Code.gs` — Lead capture Apps Script
- `lib/lead.ts` — Lead submission logic

#### 2. Member Area — Parinama Framework

Logged-in students get a full account experience driven by the **Parinama Framework** (vendored in `framework/`). The framework uses Google Sheets as its database and Apps Script as its write API.

**Account Routes**:
- `/account` — Account hub: greeting, upcoming lessons, navigation
- `/account/profile` — Edit profile fields (name, contact, DOB, etc.)
- `/account/book` — Book a lesson — TidyCal-style availability picker
- `/account/progress` — Journey progress tracker (stage by stage)

**Framework Capabilities**:
- **Auth** — Email OTP login/signup (`framework/auth/`)
- **Profiles** — Config-driven fields with derived values (age group from DOB) (`framework/profile/`)
- **Booking** — TidyCal-style scheduler: reusable availability profiles → days → windows, expanded into slots, overrides, LockService double-booking prevention (`framework/booking/`)
- **Progress** — Per-student journey tracker over configurable stages (`framework/progress/`)
- **Admin** — Generic per-tab CRUD + availability manager (not exposed on PDS — managed via PGC Group Admin)

**Framework Docs**:
- `framework/README.md` — Layout, data flow, one-time Google setup
- `framework/docs/ADOPTION.md` — Step-by-step guide to using the framework in a new project
- `framework/docs/BOOKING_AND_SLOTS.md` — Deep dive: modular availability model, slot engine, booking lifecycle
- `framework/docs/EXTRACTION_PLAN.md` — Plan to ship the framework as a standalone npm package

## Environment Variables

```bash
# .env (never commit)
NEXT_PUBLIC_SHEETS_SPREADSHEET_ID=   # PDS data sheet id
NEXT_PUBLIC_SHEETS_API_KEY=          # Google Sheets API key (public, referrer-restrictable)
NEXT_PUBLIC_FRAMEWORK_API_URL=       # PDS Apps Script /exec URL (write API)
NEXT_PUBLIC_AUTH_METHOD=otp          # password | otp | both | none
NEXT_PUBLIC_BUSINESS_TIMEZONE=America/Toronto
NEXT_PUBLIC_LEADS_SHEET_URL=         # Lead-capture Apps Script URL (separate script)
```

**Important**: Never put `NEXT_PUBLIC_LEADS_SHEET_URL` in `NEXT_PUBLIC_FRAMEWORK_API_URL` — they point to different Apps Script deployments on different sheets.

## Admin

PDS has **no standalone `/admin` route**. All student, instructor, availability, booking, and progress data is managed through the **PGC Group Admin** at `https://parinama-pgc.web.app/admin`. Select "Parinama Driving School" in the company switcher.

## Design System

- **Theme**: Light theme, white backgrounds, soft grays
- **Accent Color**: Professional orange (`#F97316`)
- **Typography**: Inter + Sora
- **Components**: Rounded cards, generous spacing
- **Mobile-First**: Responsive design
- **Accessibility**: Skip link, focus rings, `aria` states, reduced-motion
- **SEO**: Metadata, JSON-LD, robots, sitemap

## Build & Deploy

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production static export → out/
firebase deploy --only hosting   # project: parinama-pds
```

**Live**: https://parinama-pds.web.app

## Framework Sync

`pds_parinama/framework/` is the **canonical source** for the framework. Changes here are synced to PGC via `scripts/sync-framework.sh`. Never edit `pgc_parinama/src/framework/` by hand.

## Key Features

1. **Lead Generation**: Workflow modal captures leads and generates personalized roadmaps
2. **Member Platform**: Full account management for students
3. **Lesson Booking**: TidyCal-style availability picker with slot management
4. **Progress Tracking**: Journey tracker from learner permit to driver license
5. **Zero Infrastructure**: Google Sheets + Apps Script backend (no server costs)
