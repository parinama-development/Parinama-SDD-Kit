# 016 — PDS Parinama UI/UX Redesign

## Header

**Spec Number:** 016  
**Title:** PDS Parinama UI/UX Redesign  
**Status:** Draft  
**Created:** 2026-06-21  
**Priority:** High  
**Author:** Tousif  
**Related Issues:** None  

---

## Overview

This feature redesigns the PDS Parinama website to address significant content overload and to reposition the brand as a **guided Texas licensing journey** — helping users move from *"I don't know where to start"* to *"I have my Texas license."* The current homepage contains 9+ stacked sections with a monolithic 520-line JourneyTracker component, creating cognitive friction for users. The redesign simplifies the UI **and** layers in conversion- and trust-focused sections (a visual licensing roadmap, prominent credentials, instructor profiles, success stories, and local SEO landing pages) while preserving all core functionality including service offerings, user registration, subscription system, lifecycle tracking, and the framework backend.

### Strategic Positioning

In a market where most driving schools look nearly identical, Parinama differentiates by presenting the licensing process as a **clear, predictable, premium journey** rather than a generic "driving school." The existing tagline *"Get Your Texas Driver License With Confidence"* already hints at this; the redesign builds the entire site around it.

Design quality should borrow visual polish from modern service businesses (Stripe, Linear, Calendly, Airbnb — clean, modern, mobile-first) while keeping the trust signals of a driving school (certifications, real instructors, real student outcomes). The guiding concept is **"Uber meets Apple"**: clean, modern, mobile-first, with a visual step-by-step licensing journey that makes the process feel easy and predictable.

### Brand & Palette Decision

The existing **orange brand palette** (`#F97316` and the `brand.*` scale in `tailwind.config.ts`) is **retained**. All new sections and pages must use the established design tokens and color themes. No site-wide re-theme is in scope for this iteration.

---

## Background

The PDS Parinama website currently suffers from content overload across all pages:

- **Homepage:** 9+ stacked sections, redundant review elements, auto-popup workflow modal, complex JourneyTracker with 5 sub-components
- **Packages Page:** 487 lines with exhaustive detail, too many package options, complex tables
- **How It Works:** Multiple card sections creating visual fatigue

User feedback indicates the UI is "too overloaded with content" and needs simplification without losing functionality. The business offers Driving Lessons, Road Tests, and Driver Education with various plans and packages, all tied to a payment gateway for subscription activation. Users go through a specific lifecycle explained in the How It Works section, with progress tracking available.

---

## Scope

### In Scope

**Original simplification work:**
- Homepage simplification (reduce from 9+ to a focused, intentional set of sections)
- JourneyTracker component refactoring (break into smaller components)
- Workflow modal change from auto-popup to on-demand
- Packages page streamlining with tab-based navigation
- Consolidation of redundant sections
- Reduction of WhyChoose benefits from 9 to 4-5
- Removal of redundant review elements
- Simplified navigation structure
- Mobile optimization improvements

**New positioning & conversion work:**
- Premium hero with dual CTAs ("Start My Driving Journey" + "Book a Road Test")
- Visual "Your Path to a Texas License" roadmap section (Driver Ed → Permit → Lessons → Road Test → License)
- Prominent trust/credentials section (DPS Authorized, TDLR Approved, certified/women/multilingual instructors, open 7 days, two-city coverage, adult specialists)
- "Meet Your Instructors" section with headshots, languages, experience, and specialty
- "Success Stories" reviews upgrade (student photo, rating, short quote, "Passed on first attempt")
- Enhanced FAQ section answering common licensing questions
- Local SEO landing pages for Austin and San Antonio (areas served, road-test info, local instructors)
- Mobile-first booking affordances (large CTAs, one-click calling, WhatsApp/text, Calendly)
- Retain existing orange brand palette and design tokens

### Out of Scope

- Framework backend changes (Google Sheets + Apps Script)
- Data model changes
- API endpoint modifications
- Booking system logic changes
- Progress tracking logic changes
- Admin functionality changes
- Payment gateway integration changes
- Service offering changes (Driving Lessons, Road Tests, Driver Education remain unchanged)
- Site-wide color palette re-theme (orange brand palette retained)
- New booking/calendar backend (continue using existing Calendly/Square integrations)

---

## Functional Requirements

| ID | Requirement | Source |
|-----|------------|--------|
| FR-001 | Homepage shall display a simplified hero section with headline, subheadline, primary CTA, and rating badge | User feedback |
| FR-002 | Homepage shall remove FlippingOffer, TwoStepLine, QuickPick, and ReviewTicker from hero section | Analysis |
| FR-003 | Homepage shall consolidate Services and ExploreBand sections into a single "Our Services" section | Analysis |
| FR-004 | Homepage shall remove HighlightStrip section | Analysis |
| FR-005 | Homepage shall remove PackagesTeaser section and replace with link to packages page | Analysis |
| FR-006 | Homepage shall reduce WhyChoose benefits from 9 to 4-5 key benefits | Analysis |
| FR-007 | Homepage shall remove review ticker from hero and keep GoogleReviews section with 3-4 featured reviews | Analysis |
| FR-008 | Workflow modal shall change from auto-popup to on-demand triggered by CTA button | Analysis |
| FR-009 | JourneyTracker component shall be refactored into smaller components: HeroSection, ServiceOverview, ProgressCard | Analysis |
| FR-010 | Packages page shall implement tab-based navigation with tabs: Lessons, Road Tests, Bundles, Add-ons | Analysis |
| FR-011 | Packages page shall display 3 highlighted packages (single, 6-hour, 10-hour) with "View all packages" link | Analysis |
| FR-012 | Packages page shall remove WGS breakdown table and replace with accordion | Analysis |
| FR-013 | Packages page shall move parallel parking section to dedicated page or modal | Analysis |
| FR-014 | Packages page shall simplify distance tier table to 3 tiers (0-5mi, 5-15mi, 15+mi) | Analysis |
| FR-015 | Navigation shall be simplified to: Home, Services, Packages, How It Works, Account | Analysis |
| FR-016 | For logged-in users, navigation shall include "My Progress" link | Analysis |
| FR-017 | All components shall be mobile-first with touch targets minimum 44px | Analysis |
| FR-018 | Below-fold sections shall be lazy-loaded for performance | Analysis |
| FR-019 | Hero section shall present two primary CTAs: "Start My Driving Journey" (opens workflow) and "Book a Road Test" (routes to road-test booking) | Design direction |
| FR-020 | Hero subheadline shall communicate the guided journey across Austin & San Antonio (e.g., "Professional driving lessons, road tests, and step-by-step guidance in Austin & San Antonio") | Design direction |
| FR-021 | Homepage shall include a "Your Path to a Texas License" roadmap section visualizing 5 ordered steps: Take Driver Education, Get Your Permit, Practice With Instructors, Pass Road Test, Receive Your License | Design direction |
| FR-022 | Homepage shall include a prominent trust/credentials section surfacing at minimum: DPS Authorized Testing, TDLR Approved, Certified Instructors, Women Instructors Available, Multilingual Instructors, Open 7 Days, Austin & San Antonio Coverage, Adult Driver Specialists | Design direction |
| FR-023 | Homepage shall include a "Meet Your Instructors" section; each instructor card shall display a headshot, name, languages spoken, years of experience, and specialty | Design direction |
| FR-024 | Reviews shall be presented as "Success Stories" with student photo (or avatar fallback), star rating, short quote, and an outcome badge (e.g., "Passed on first attempt") | Design direction |
| FR-025 | Homepage FAQ shall answer the core licensing questions: how many lessons are needed, whether a permit is required first, whether the school's car can be used for the test, whether adults are taught, whether nervous drivers are supported, and whether international students are supported | Design direction |
| FR-026 | The site shall provide an Austin location landing page (`/locations/austin`) with areas served, Austin road-test routes/info, and local instructors | Design direction |
| FR-027 | The site shall provide a San Antonio location landing page (`/locations/san-antonio`) with areas served, San Antonio road-test info, and local instructors | Design direction |
| FR-028 | Location pages shall include unique SEO metadata and LocalBusiness JSON-LD structured data per city | Design direction |
| FR-029 | Mobile layouts shall expose one-click calling, WhatsApp/text, and Calendly booking as primary, easily tappable actions | Design direction |
| FR-030 | All new sections and pages shall use the existing orange brand palette and design tokens (no new color system) | Brand decision |
| FR-031 | Navigation shall provide access to location pages (Austin, San Antonio), either as top-level links or within a Services/Locations menu | Design direction |
| FR-032 | Instructor and success-story content shall be defined in a single source-of-truth data module (e.g., `lib/instructors.ts`, extend `lib/reviews.ts`) consumed by the components | Constitution |

---

## Acceptance Criteria

| ID | Criterion | Source |
|-----|-----------|--------|
| AC-001 | Homepage loads with a focused hero section containing headline, subheadline, two CTAs, and a rating badge (no FlippingOffer/TwoStepLine/QuickPick/ReviewTicker clutter) | User feedback |
| AC-002 | Hero section does not contain FlippingOffer, TwoStepLine, QuickPick, or ReviewTicker components | Analysis |
| AC-003 | Homepage displays single "Our Services" section with 3 service cards | Analysis |
| AC-004 | Homepage does not contain HighlightStrip or PackagesTeaser sections | Analysis |
| AC-005 | Homepage displays 4-5 WhyChoose benefit cards (reduced from 9) | Analysis |
| AC-006 | Homepage displays GoogleReviews section with exactly 3-4 featured reviews | Analysis |
| AC-007 | Workflow modal does not auto-popup on page load | Analysis |
| AC-008 | Workflow modal opens when user clicks "Build Your Plan" CTA button | Analysis |
| AC-009 | JourneyTracker component is split into HeroSection, ServiceOverview, and ProgressCard components | Analysis |
| AC-010 | Packages page displays tab-based navigation with 4 tabs: Lessons, Road Tests, Bundles, Add-ons | Analysis |
| AC-011 | Lessons tab displays 3 highlighted packages with "View all packages" link | Analysis |
| AC-012 | WGS breakdown is displayed in accordion format (not table) | Analysis |
| AC-013 | Parallel parking section is accessible via modal or dedicated page from packages page | Analysis |
| AC-014 | Distance tier table displays exactly 3 tiers | Analysis |
| AC-015 | Navigation displays exactly 5 links: Home, Services, Packages, How It Works, Account | Analysis |
| AC-016 | Navigation displays "My Progress" link when user is logged in | Analysis |
| AC-017 | All interactive elements have minimum touch target size of 44px on mobile | Analysis |
| AC-018 | Below-fold sections load lazily (verified via network waterfall) | Analysis |
| AC-019 | All existing functionality remains intact (booking, progress tracking, auth, payment) | Analysis |
| AC-020 | Lighthouse performance score remains above 90 | Analysis |
| AC-021 | Hero displays two CTAs labeled "Start My Driving Journey" and "Book a Road Test"; the first opens the workflow, the second routes to road-test booking | Design direction |
| AC-022 | Homepage renders a "Your Path to a Texas License" roadmap with exactly 5 ordered steps in the specified order | Design direction |
| AC-023 | Homepage renders a trust/credentials section displaying all eight specified credibility items | Design direction |
| AC-024 | Homepage renders a "Meet Your Instructors" section; each card shows headshot, name, languages, years of experience, and specialty | Design direction |
| AC-025 | Reviews render as "Success Stories" with photo/avatar, star rating, quote, and outcome badge | Design direction |
| AC-026 | FAQ renders answers to all six specified licensing questions | Design direction |
| AC-027 | `/locations/austin` renders with areas served, Austin road-test info, local instructors, unique metadata, and LocalBusiness JSON-LD | Design direction |
| AC-028 | `/locations/san-antonio` renders with areas served, San Antonio road-test info, local instructors, unique metadata, and LocalBusiness JSON-LD | Design direction |
| AC-029 | On mobile viewports, click-to-call, WhatsApp/text, and Calendly actions are present and meet the 44px touch-target rule | Design direction |
| AC-030 | All new sections/pages use only existing `brand.*`/design-token classes (no hard-coded non-palette colors) | Brand decision |
| AC-031 | Navigation exposes Austin and San Antonio location pages | Design direction |
| AC-032 | Instructor and success-story data are sourced from dedicated data modules, not hard-coded in components | Constitution |

---

## Non-Functional Requirements

| ID | Requirement | Source |
|-----|------------|--------|
| NFR-001 | Homepage bounce rate shall decrease by 20% | Analysis |
| NFR-002 | Packages page time-on-page shall increase by 30% | Analysis |
| NFR-003 | Workflow conversion rate shall increase by 15% | Analysis |
| NFR-004 | Lighthouse performance score shall remain above 90 | Analysis |
| NFR-005 | Initial bundle size shall decrease by 15% | Analysis |
| NFR-006 | Mobile LCP shall improve by 20% | Analysis |
| NFR-007 | All changes shall maintain WCAG 2.1 AA compliance | Constitution |
| NFR-008 | All changes shall maintain SEO metadata and JSON-LD structured data | Analysis |

---

## Impacted Areas

| Area | Files | Type of Change |
|------|-------|----------------|
| Homepage Components | `pds_parinama/components/JourneyTracker.tsx` | Refactor - split into smaller components |
| Homepage Components | `pds_parinama/components/Services.tsx` | Modify - merge with ExploreBand |
| Homepage Components | `pds_parinama/components/WhyChoose.tsx` | Modify - reduce benefits from 9 to 4-5 |
| Homepage Components | `pds_parinama/components/GoogleReviews.tsx` | Modify - limit to 3-4 reviews |
| Homepage Components | `pds_parinama/components/HighlightStrip.tsx` | Delete |
| Homepage Components | `pds_parinama/components/PackagesTeaser.tsx` | Delete |
| Homepage Page | `pds_parinama/app/page.tsx` | Modify - update component imports and layout |
| Workflow Components | `pds_parinama/components/workflow/WorkflowProvider.tsx` | Modify - remove auto-popup logic |
| Workflow Components | `pds_parinama/components/workflow/WorkflowModal.tsx` | Modify - add trigger control |
| Packages Page | `pds_parinama/app/packages/page.tsx` | Refactor - add tab navigation |
| Navigation | `pds_parinama/components/Navbar.tsx` | Modify - simplify links |
| Navigation | `pds_parinama/lib/constants.ts` | Modify - update NAV_LINKS |
| New Components | `pds_parinama/components/HeroSection.tsx` | Create - extracted from JourneyTracker |
| New Components | `pds_parinama/components/ServiceOverview.tsx` | Create - extracted from JourneyTracker |
| New Components | `pds_parinama/components/ProgressCard.tsx` | Create - extracted from JourneyTracker |
| New Components | `pds_parinama/components/PackageTabs.tsx` | Create - tab navigation for packages |
| New Page | `pds_parinama/app/parallel-parking/page.tsx` | Create - dedicated parallel parking page |
| New Components | `pds_parinama/components/LicenseRoadmap.tsx` | Create - "Your Path to a Texas License" 5-step roadmap (FR-021) |
| New Components | `pds_parinama/components/TrustBadges.tsx` | Create - credentials/trust section (FR-022) |
| New Components | `pds_parinama/components/Instructors.tsx` | Create - "Meet Your Instructors" section (FR-023) |
| Homepage Components | `pds_parinama/components/GoogleReviews.tsx` | Modify - upgrade to "Success Stories" presentation (FR-024) |
| Homepage Components | `pds_parinama/components/HeroSection.tsx` | Modify - dual CTAs + journey subheadline (FR-019, FR-020) |
| Content / FAQ | `pds_parinama/components/FAQ.tsx` (or existing FAQ source) | Modify - add the six core licensing questions (FR-025) |
| New Page | `pds_parinama/app/locations/austin/page.tsx` | Create - Austin local SEO landing page (FR-026, FR-028) |
| New Page | `pds_parinama/app/locations/san-antonio/page.tsx` | Create - San Antonio local SEO landing page (FR-027, FR-028) |
| New Component | `pds_parinama/components/LocationPage.tsx` | Create - shared layout for location landing pages |
| Data | `pds_parinama/lib/instructors.ts` | Create - instructor source-of-truth data (FR-032) |
| Data | `pds_parinama/lib/reviews.ts` | Modify - add success-story fields (photo, outcome badge) (FR-024, FR-032) |
| Data | `pds_parinama/lib/constants.ts` | Modify - add roadmap steps, trust items, location data, nav entries (FR-021/022/031) |
| Navigation | `pds_parinama/components/Navbar.tsx` | Modify - expose Austin & San Antonio locations (FR-031) |

---

## Open Questions

| ID | Question | Status |
|-----|----------|--------|
| OQ-001 | Should the parallel parking section be a dedicated page or a modal? | Resolved — dedicated page (`/parallel-parking`) |
| OQ-002 | Which 4-5 WhyChoose benefits should be prioritized for retention? | Resolved — see research.md |
| OQ-003 | Should the workflow modal trigger be a button in the hero or a floating action button? | Resolved — hero button |
| OQ-004 | What should the default tab be on the packages page? | Resolved — 'lessons' |
| OQ-005 | Should location pages live at `/locations/{city}` or top-level `/austin` and `/san-antonio`? | Open — proposed `/locations/{city}` |
| OQ-006 | Should the trust/credentials section be its own section or merged into WhyChoose? | Open — proposed dedicated `TrustBadges` section, WhyChoose stays benefit-focused |
| OQ-007 | What real instructor data (names, photos, languages, experience) is available to populate `lib/instructors.ts`? | Open — needs business input; placeholder data until provided |
| OQ-008 | Are student photos available/consented for Success Stories, or should avatar fallbacks be used? | Open — default to avatar/initial fallback until photos provided |
| OQ-009 | Should Austin/San Antonio appear as top-level nav links or under a "Locations" dropdown? | Open — proposed "Locations" grouping |

---

## Definition of Done

- [ ] All functional requirements implemented
- [ ] All acceptance criteria met with traceable test evidence
- [ ] All NFRs verified (performance metrics, accessibility, SEO)
- [ ] Code review completed by at least one team member
- [ ] Lighthouse audit passes with score > 90
- [ ] Mobile responsiveness verified on multiple devices
- [ ] All existing functionality regression tested
- [ ] Documentation updated (README, component docs)
- [ ] Change summary documented
- [ ] Git commits follow conventional commit format with spec number
