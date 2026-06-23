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
  constants.ts             — Business config (prices, contact info, location content)
  lead.ts                  — Lead submission logic
  reviews.ts               — Google reviews data with photo/outcome fields
  packages.ts             — Package and add-on data
  licensing.ts             — Licensing guide data
  instructors.ts           — Instructor profiles
components/
  HeroSection.tsx          — Homepage hero with dual CTAs and rating badge
  ServiceOverview.tsx      — 3 service cards (Driver Ed, Lessons, Road Test)
  ProgressCard.tsx         — Progress tracker for guests and logged-in users
  LicenseRoadmap.tsx       — 5-step visual licensing journey
  TrustBadges.tsx          — 8 credibility signals
  Instructors.tsx          — Instructor profiles with avatars
  PackageTabs.tsx          — Tab-based packages navigation (Lessons, Road Tests, Bundles, Add-ons)
  LocationPage.tsx         — Shared location page layout with JSON-LD
  GoogleReviews.tsx        — Success stories carousel with photos/outcomes
  Contact.tsx              — Contact section with CTA buttons
  Footer.tsx               — Compact footer with Contact column (phone/email/social)
  Navbar.tsx               — Simplified navigation (5 main links + Locations dropdown)
  FAQ.tsx                  — FAQ accordion with 6 core licensing Q&As
  WhyChoose.tsx            — 5 benefit cards (reduced from 9)
  Services.tsx             — Services section
components/workflow/
  WorkflowProvider.tsx     — State + localStorage persistence
  WorkflowModal.tsx        — Modal shell with autoShow prop (default false)
  steps.tsx                — Screen components with "Start My Driving Journey" labels
google-apps-script/
  Code.gs                  — Lead capture Apps Script
app/
  page.tsx                 — Homepage with dynamic imports for below-fold components
  how-it-works/page.tsx     — Licensing guide page with dynamic import
  packages/page.tsx         — Packages page with dynamic import
  reviews/page.tsx          — Success stories page with dynamic import
  locations/austin/page.tsx — Austin location page with JSON-LD
  locations/san-antonio/page.tsx — San Antonio location page with JSON-LD
  parallel-parking/page.tsx — Dedicated parallel parking page
  contact/page.tsx          — Contact page
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

## UI/UX Redesign (Spec 016)

### Overview
Completed comprehensive UI/UX redesign to reposition the site as a guided Texas licensing journey with premium, trust-building, conversion-focused sections. Design inspiration drawn from modern SaaS companies (Stripe, Linear, Calendly, Airbnb) while maintaining driving school trust signals.

### Key Changes (Phase 1 - 2026-06-22)

**Homepage Hero:**
- Added prominent social proof badge with 5-star rating and review count
- Changed headline to "Get Your Texas License In Simple Steps"
- Increased spacing and improved visual hierarchy
- Dual CTAs: "Start My Driving Journey" (opens workflow) and "Book a Road Test" (routes to road-test booking)
- Guided-journey subheadline referencing Austin & San Antonio
- Removed quick steps preview per user feedback

**Package Cards Redesign:**
- Upgraded to rounded-3xl corners for premium feel
- Added gradient backgrounds for featured cards
- Increased padding and spacing throughout
- Enhanced badges with sparkle icon for featured packages
- Improved hover effects with shadow-xl
- Larger price display (text-4xl) and better save badges

**Trust Signals Amplification:**
- Added live stats banner showing: Rating (5.0), Reviews (54+), Pass Rate (98%), Students (500+)
- Enhanced trust badge cards with hover effects
- Added gradient background to stats banner

**Typography & Spacing:**
- Added premium shadow utilities (shadow-card, shadow-lift)
- Improved spacing consistency across components

**Animations & Micro-interactions:**
- Added scale effects to StartJourneyButton (hover: 1.02, tap: 0.98)
- Smoother transitions with better easing

**Packages Page Reorganization:**
- Renamed eyebrow from "Services & Plans" to "What We Offer"
- Added services overview section with three service cards (Driver Education, Driving Lessons, Road Testing)
- Moved services overview to hero section position with hero styling
- Combined pricing header and package tabs into single section
- Left-aligned services overview section heading

**Navigation:**
- Simplified to 5 main links: Home, Services & Plans, How It Works, Reviews, Contact Us
- Locations dropdown with Austin & San Antonio
- Renamed "Services & Pricing" to "Services & Plans" globally

**Mobile Optimization:**
- All interactive elements have min-h-[44px] touch targets
- Components stack vertically on mobile
- Mobile menu button increased to h-11 w-11

**Performance:**
- Dynamic imports for below-fold components (LicenseRoadmap, TrustBadges, Instructors, FAQ)
- Dynamic imports on all pages (how-it-works, packages, reviews, locations)
- Loading states for all dynamic components

**Previous Changes (Earlier Phases):**
- LicenseRoadmap: 5-step visual licensing journey stepper
- TrustBadges: 8 credibility signals (TDLR approved, certified instructors, etc.)
- Instructors: Instructor profiles with avatar/initial fallback
- PackageTabs: Tab-based navigation (Lessons, Road Tests, Bundles, Add-ons)
- LocationPage: Shared layout with LocalBusiness JSON-LD for SEO
- Footer: Compact design with Contact column, Parinama Group logo
- CTA Standardization: "Start My Driving Journey" label consistency
- WhyChoose reduced from 9 to 5 benefit cards
- GoogleReviews limited to 3-4 featured reviews
- FAQ enhanced with 6 core licensing Q&As

**New Pages:**
- /locations/austin - Austin location page with unique metadata and JSON-LD
- /locations/san-antonio - San Antonio location page with unique metadata and JSON-LD
- /parallel-parking - Dedicated parallel parking page with technique steps
- /reviews - Success stories page with rating badge and CTA section
- /contact - Contact page with CTA buttons

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
