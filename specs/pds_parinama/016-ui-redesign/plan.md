# 016 — PDS Parinama UI/UX Redesign — Implementation Plan

**Spec Number:** 016  
**Title:** PDS Parinama UI/UX Redesign  
**Status:** Draft  
**Created:** 2026-06-21  
**Branch:** Tousif  

---

## Technical Context

### Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Backend:** Google Sheets + Google Apps Script (unchanged)
- **Hosting:** Firebase (unchanged)
- **Testing:** Vitest

### Current Architecture
- **Marketing Site:** Workflow modal, lead capture, service cards
- **Member Area:** Parinama Framework (auth, profiles, booking, progress)
- **Data Flow:** Google Sheets API (read) + Apps Script (write)

### Dependencies
- Next.js 14.2.5
- React 18.3.1
- Framer Motion 11.3.19
- Tailwind CSS 3.4.7
- TypeScript 5.5.4

### Integration Points
- Google Sheets API (read-only)
- Apps Script Web App (write API)
- Firebase Hosting (static export)
- Calendly (lesson booking)
- Square (payment processing)
- Aceable (affiliate driver education)

---

## Constitution Check

### Principle Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| Spec-First | PASS | Feature spec (spec.md) created before implementation |
| TDD | PASS | Tests will be written before implementation |
| End-to-End Traceability | PASS | Every FR maps to file changes, every AC maps to test |
| Backward Compatibility | PASS | No breaking changes to APIs or data models |
| Single Source of Truth | PASS | No domain facts duplicated |
| No Secrets in Code | PASS | No credentials in code |
| Small, Reviewable Changes | PASS | Changes organized into focused phases |
| Acceptance Criteria Immutable | PASS | ACs preserved verbatim from analysis |
| Concrete References Only | PASS | Plan uses actual file paths and method names |
| Permanent Retention | PASS | All artifacts retained in spec-kit/ |
| No Invented Knowledge | PASS | All facts traced to analysis document |

### Quality Gates

| Gate | Status | Notes |
|------|--------|-------|
| Unit Tests | PASS | Will implement component tests |
| Lint / Format | PASS | ESLint configured |
| Type Check | PASS | TypeScript strict mode enabled |
| Build | PASS | Next.js build verified |
| Coverage | PASS | Target 80% coverage for new code |
| Traceability | PASS | FR → file change, AC → test case mapped |
| Open Questions | PASS | All OQs resolved in plan |
| Secrets Scan | PASS | No secrets in code |
| Constitution Compliance | PASS | All principles followed |

---

## Phase 0: Research

### Research Tasks

No research required - all technical decisions are based on existing codebase analysis and user feedback. The UI redesign uses existing technologies and patterns.

---

## Phase 1: Design & Contracts

### Data Model

No data model changes required. The redesign is purely UI/UX focused with no backend changes.

### UI Contracts

#### Component Contracts

**HeroSection Component**
- Props: `rating: number`, `reviewCount: number`
- Renders: Headline, subheadline, primary CTA, rating badge
- Location: `pds_parinama/components/HeroSection.tsx`

**ServiceOverview Component**
- Props: None
- Renders: 3 service cards (Driver Education, Driving Lessons, Road Testing)
- Location: `pds_parinama/components/ServiceOverview.tsx`

**ProgressCard Component**
- Props: `session: Session | null`, `hydrated: boolean`, `answers: WorkflowAnswers`
- Renders: Progress tracker card with milestones
- Location: `pds_parinama/components/ProgressCard.tsx`

**PackageTabs Component**
- Props: `defaultTab: 'lessons' | 'roadTests' | 'bundles' | 'addOns'`
- Renders: Tab navigation and tab content
- Location: `pds_parinama/components/PackageTabs.tsx`

**LicenseRoadmap Component** (FR-021)
- Props: None (reads ordered steps from `lib/constants.ts:LICENSE_ROADMAP`)
- Renders: 5 ordered, connected steps — Take Driver Education → Get Your Permit → Practice With Instructors → Pass Road Test → Receive Your License
- Location: `pds_parinama/components/LicenseRoadmap.tsx`

**TrustBadges Component** (FR-022)
- Props: None (reads `lib/constants.ts:TRUST_SIGNALS`)
- Renders: Credential grid — DPS Authorized Testing, TDLR Approved, Certified Instructors, Women Instructors Available, Multilingual Instructors, Open 7 Days, Austin & San Antonio Coverage, Adult Driver Specialists
- Location: `pds_parinama/components/TrustBadges.tsx`

**Instructors Component** (FR-023)
- Props: `instructors?: Instructor[]` (defaults to `lib/instructors.ts:INSTRUCTORS`)
- Renders: Instructor cards (headshot/avatar fallback, name, languages, years of experience, specialty)
- Location: `pds_parinama/components/Instructors.tsx`

**SuccessStories (GoogleReviews upgrade)** (FR-024)
- Props: existing review props + optional `photo`, `outcome`
- Renders: Student photo/avatar, star rating, short quote, outcome badge ("Passed on first attempt")
- Location: `pds_parinama/components/GoogleReviews.tsx`

**LocationPage Component** (FR-026/027)
- Props: `city: 'austin' | 'sanAntonio'`, `data: LocationContent`
- Renders: Hero, areas served, road-test info/routes, local instructors, CTAs; emits LocalBusiness JSON-LD
- Location: `pds_parinama/components/LocationPage.tsx`
- Pages: `app/locations/austin/page.tsx`, `app/locations/san-antonio/page.tsx`

#### Data Contracts

**`lib/instructors.ts`** (FR-032)
```ts
export interface Instructor {
  id: string;
  name: string;
  photo?: string;        // optional; avatar/initial fallback if absent
  languages: string[];
  yearsExperience: number;
  specialty: string;     // e.g., "Adult beginners", "Nervous drivers"
  locations: ('austin' | 'sanAntonio')[];
}
export const INSTRUCTORS: Instructor[];
```

**`lib/reviews.ts` (extended)** (FR-024)
```ts
export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  date?: string;
  photo?: string;        // NEW optional student photo
  outcome?: string;      // NEW e.g., "Passed on first attempt"
}
```

**`lib/constants.ts` (extended)** (FR-021/022/031)
```ts
export const LICENSE_ROADMAP: { step: number; title: string; desc: string }[]; // 5 ordered steps
export const TRUST_SIGNALS: { label: string; icon: string }[];                 // 8 credibility items
export const LOCATION_CONTENT: Record<'austin'|'sanAntonio', LocationContent>;  // areas served, road-test info
```

---

## Phase 2: Implementation

### Implementation Order (TDD)

#### Task 1: Create New Hero Components

**Test:** `pds_parinama/components/__tests__/HeroSection.test.tsx`
- Test: renders headline, subheadline, CTA, rating badge
- Test: rating badge displays correct rating and count

**Implement:** `pds_parinama/components/HeroSection.tsx`
- Extract hero logic from JourneyTracker lines 306-376
- Remove FlippingOffer, TwoStepLine, QuickPick components
- Add rating badge display
- Keep headline, subheadline, primary CTA

**Test:** `pds_parinama/components/__tests__/ServiceOverview.test.tsx`
- Test: renders 3 service cards
- Test: each card has correct icon, title, description

**Implement:** `pds_parinama/components/ServiceOverview.tsx`
- Create new component with 3 service cards
- Use Services.tsx data structure
- Simplified card design (no meta badges)

**Test:** `pds_parinama/components/__tests__/ProgressCard.test.tsx`
- Test: renders progress tracker for guests
- Test: renders ProgressTracker for logged-in users
- Test: displays correct percentage and milestones

**Implement:** `pds_parinama/components/ProgressCard.tsx`
- Extract progress card logic from JourneyTracker lines 412-514
- Keep session-based rendering logic
- Simplify to focus on progress display only

#### Task 2: Refactor JourneyTracker Component

**Test:** `pds_parinama/components/__tests__/JourneyTracker.test.tsx`
- Test: renders HeroSection, ServiceOverview, ProgressCard
- Test: maintains existing workflow integration

**Implement:** `pds_parinama/components/JourneyTracker.tsx`
- Replace hero section (lines 306-376) with HeroSection component
- Replace service overview with ServiceOverview component
- Replace progress card with ProgressCard component
- Remove ReviewTicker component (lines 204-262)
- Reduce from 520 lines to ~100 lines

#### Task 3: Update Homepage Layout

**Test:** `pds_parinama/app/__tests__/page.test.tsx`
- Test: renders simplified homepage
- Test: does not render HighlightStrip or PackagesTeaser
- Test: renders consolidated sections

**Implement:** `pds_parinama/app/page.tsx`
- Remove HighlightStrip import and render
- Remove PackagesTeaser import and render
- Update JourneyTracker usage
- Verify section order: HeroSection, Services, WhyChoose, GoogleReviews, FAQ, Contact

#### Task 4: Simplify WhyChoose Component

**Test:** `pds_parinama/components/__tests__/WhyChoose.test.tsx`
- Test: renders exactly 4-5 benefit cards
- Test: removed benefits are not rendered

**Implement:** `pds_parinama/components/WhyChoose.tsx`
- Reduce benefits array from 9 to 5 (keep: Experienced Instructors, Step-by-Step Guidance, Multilingual Instructors, Open 7 Days, TDLR & DPS Approved)
- Remove: Women Instructors Available, Texas-Focused Training, Road Test Support, Adult Driver Specialists

#### Task 5: Simplify GoogleReviews Component

**Test:** `pds_parinama/components/__tests__/GoogleReviews.test.tsx`
- Test: renders exactly 3-4 reviews
- Test: carousel pagination works correctly

**Implement:** `pds_parinama/components/GoogleReviews.tsx`
- Limit GOOGLE_REVIEWS to first 4 reviews
- Update pagination logic for 4 reviews
- Keep carousel functionality

#### Task 6: Update Workflow Modal Trigger

**Test:** `pds_parinama/components/workflow/__tests__/WorkflowProvider.test.tsx`
- Test: modal does not auto-open on page load
- Test: modal opens when open() is called

**Implement:** `pds_parinama/components/workflow/WorkflowProvider.tsx`
- Remove auto-open logic (useEffect with delay)
- Keep open() method for manual trigger
- Add autoShow flag (default: false)

**Implement:** `pds_parinama/components/workflow/WorkflowModal.tsx`
- Add trigger control via autoShow prop
- Keep existing modal functionality

#### Task 7: Create Package Tabs Component

**Test:** `pds_parinama/components/__tests__/PackageTabs.test.tsx`
- Test: renders 4 tabs
- Test: clicking tab switches content
- Test: default tab is 'lessons'

**Implement:** `pds_parinama/components/PackageTabs.tsx`
- Create tab state management
- Implement tab switching logic
- Create tab content components (LessonsTab, RoadTestsTab, BundlesTab, AddOnsTab)

#### Task 8: Refactor Packages Page

**Test:** `pds_parinama/app/packages/__tests__/page.test.tsx`
- Test: renders PackageTabs component
- Test: default tab is 'lessons'
- Test: tab content displays correctly

**Implement:** `pds_parinama/app/packages/page.tsx`
- Replace existing sections with PackageTabs component
- Move lesson packages to LessonsTab
- Move road test services to RoadTestsTab
- Move bundles to BundlesTab
- Move add-ons to AddOnsTab
- Remove WGS breakdown table (replace with accordion in BundlesTab)
- Simplify distance tier table to 3 tiers in AddOnsTab

#### Task 9: Create Parallel Parking Page

**Test:** `pds_parinama/app/parallel-parking/__tests__/page.test.tsx`
- Test: renders parallel parking content
- Test: displays technique steps
- Test: displays booking CTA

**Implement:** `pds_parinama/app/parallel-parking/page.tsx`
- Extract parallel parking content from packages page (lines 258-352)
- Create dedicated page with full layout
- Add metadata and SEO
- Link from packages page

#### Task 10: Simplify Navigation

**Test:** `pds_parinama/components/__tests__/Navbar.test.tsx`
- Test: renders 5 main navigation links
- Test: renders "My Progress" when logged in
- Test: does not render redundant links

**Implement:** `pds_parinama/components/Navbar.tsx`
- Update NAV_LINKS in constants.ts to: Home, Services, Packages, How It Works, Account
- Add conditional "My Progress" link for logged-in users
- Remove redundant navigation items

**Implement:** `pds_parinama/lib/constants.ts`
- Update NAV_LINKS array
- Update SERVICES_MENU if needed

#### Task 11: Delete Unused Components

**Implement:** Delete `pds_parinama/components/HighlightStrip.tsx`
**Implement:** Delete `pds_parinama/components/PackagesTeaser.tsx`

#### Task 12: Mobile Optimization

**Test:** `pds_parinama/components/__tests__/mobile.test.tsx`
- Test: all touch targets are minimum 44px
- Test: components stack vertically on mobile
- Test: accordions work on mobile

**Implement:** Update Tailwind classes for mobile
- Add min-h-[44px] to all interactive elements
- Use flex-col on mobile for stacked layouts
- Test on mobile viewport

#### Task 13: Performance Optimization

**Test:** Performance test with Lighthouse
- Test: LCP < 2.5s
- Test: bundle size reduced by 15%

**Implement:** Add lazy loading
- Add dynamic imports for below-fold components
- Optimize images
- Reduce animation complexity on mobile

---

## Phase 2b: Positioning & Conversion (New Direction)

> These tasks layer the "guided licensing journey" positioning on top of the simplified base. They reuse existing design tokens (orange palette) and follow the same TDD approach.

#### Task 14: Premium Hero with Dual CTAs (FR-019, FR-020)

**Test:** `components/__tests__/HeroSection.test.tsx`
- Test: renders two CTAs "Start My Driving Journey" and "Book a Road Test"
- Test: journey subheadline references Austin & San Antonio
- Test: primary CTA opens workflow; secondary routes to road-test booking

**Implement:** `components/HeroSection.tsx`
- Add dual-CTA layout; wire primary to workflow `open()`, secondary to road-test booking route/anchor
- Update subheadline copy per FR-020

#### Task 15: License Roadmap Section (FR-021)

**Test:** `components/__tests__/LicenseRoadmap.test.tsx`
- Test: renders exactly 5 steps in correct order

**Implement:** `lib/constants.ts:LICENSE_ROADMAP` + `components/LicenseRoadmap.tsx`
- Visual connected stepper (icons + labels), mobile-stacked, desktop horizontal
- Add to homepage between hero and services (or per final layout)

#### Task 16: Trust / Credentials Section (FR-022)

**Test:** `components/__tests__/TrustBadges.test.tsx`
- Test: renders all 8 credibility items

**Implement:** `lib/constants.ts:TRUST_SIGNALS` + `components/TrustBadges.tsx`
- Prominent grid near top of homepage; icons from existing icon set

#### Task 17: Meet Your Instructors Section (FR-023, FR-032)

**Test:** `components/__tests__/Instructors.test.tsx`
- Test: each card shows headshot/avatar, name, languages, years, specialty

**Implement:** `lib/instructors.ts` (placeholder data) + `components/Instructors.tsx`
- Avatar/initial fallback when `photo` absent
- Add section to homepage

#### Task 18: Success Stories (Reviews Upgrade) (FR-024, FR-032)

**Test:** `components/__tests__/GoogleReviews.test.tsx`
- Test: renders photo/avatar, rating, quote, outcome badge

**Implement:** extend `lib/reviews.ts` (add `photo`, `outcome`) + update `components/GoogleReviews.tsx`
- Rename presentation to "Success Stories"; keep 3–4 featured (FR-007)

#### Task 19: FAQ Enhancement (FR-025)

**Test:** FAQ test (existing or new)
- Test: renders answers to all 6 core licensing questions

**Implement:** FAQ source/component
- Add: lessons needed, permit-first, use-our-car, adults, nervous drivers, international students

#### Task 20: Location Landing Pages (FR-026, FR-027, FR-028, FR-031)

**Test:** `app/locations/__tests__/austin.test.tsx`, `app/locations/__tests__/san-antonio.test.tsx`
- Test: renders areas served, road-test info, local instructors
- Test: emits LocalBusiness JSON-LD; unique metadata

**Implement:**
- `lib/constants.ts:LOCATION_CONTENT` (areas served, road-test info per city)
- `components/LocationPage.tsx` (shared layout + JSON-LD)
- `app/locations/austin/page.tsx`, `app/locations/san-antonio/page.tsx`
- Add "Locations" nav entry (FR-031)

#### Task 21: Mobile-First Booking Affordances (FR-029)

**Test:** mobile test
- Test: click-to-call, WhatsApp/text, Calendly present and ≥44px on mobile

**Implement:** ensure hero/location/contact expose tel:, WhatsApp, and Calendly actions prominently on mobile

---

## Files NOT to Modify

- `pds_parinama/framework/**` - Framework backend unchanged
- `pds_parinama/lib/workflow.ts` - Workflow logic unchanged
- `pds_parinama/lib/lead.ts` - Lead capture unchanged
- `pds_parinama/google-apps-script/**` - Apps Script unchanged
- `pds_parinama/config/business.config.ts` - Business config unchanged
- `pds_parinama/app/account/**` - Account area unchanged
- `pds_parinama/app/curriculum/**` - Curriculum unchanged
- `pds_parinama/app/how-it-works/**` - How It Works unchanged
- `pds_parinama/firebase.json` - Firebase config unchanged
- `pds_parinama/next.config.mjs` - Next.js config unchanged
- `pds_parinama/tailwind.config.ts` - Tailwind config unchanged
- `pds_parinama/tsconfig.json` - TypeScript config unchanged
- `pds_parinama/package.json` - Dependencies unchanged

---

## Traceability Matrix

| Requirement | Code Location | Test Method | Status |
|-------------|--------------|-------------|--------|
| FR-001 | `components/HeroSection.tsx:HeroSection` | `components/__tests__/HeroSection.test.tsx:testHeroSectionRenders` | Planned |
| FR-002 | `components/JourneyTracker.tsx:JourneyTracker` | `components/__tests__/JourneyTracker.test.tsx:testRemovedComponents` | Planned |
| FR-003 | `components/ServiceOverview.tsx:ServiceOverview` | `components/__tests__/ServiceOverview.test.tsx:testServiceOverviewRenders` | Planned |
| FR-004 | `app/page.tsx:HomePage` | `app/__tests__/page.test.tsx:testRemovedSections` | Planned |
| FR-005 | `app/page.tsx:HomePage` | `app/__tests__/page.test.tsx:testPackagesLink` | Planned |
| FR-006 | `components/WhyChoose.tsx:benefits` | `components/__tests__/WhyChoose.test.tsx:testReducedBenefits` | Planned |
| FR-007 | `components/GoogleReviews.tsx:GOOGLE_REVIEWS` | `components/__tests__/GoogleReviews.test.tsx:testLimitedReviews` | Planned |
| FR-008 | `components/workflow/WorkflowProvider.tsx:useEffect` | `components/workflow/__tests__/WorkflowProvider.test.tsx:testNoAutoOpen` | Planned |
| FR-009 | `components/JourneyTracker.tsx:JourneyTracker` | `components/__tests__/JourneyTracker.test.tsx:testComponentSplit` | Planned |
| FR-010 | `components/PackageTabs.tsx:PackageTabs` | `components/__tests__/PackageTabs.test.tsx:testTabNavigation` | Planned |
| FR-011 | `components/PackageTabs.tsx:LessonsTab` | `components/__tests__/PackageTabs.test.tsx:testHighlightedPackages` | Planned |
| FR-012 | `app/packages/page.tsx:BundlesTab` | `app/packages/__tests__/page.test.tsx:testWgsAccordion` | Planned |
| FR-013 | `app/parallel-parking/page.tsx:ParallelParkingPage` | `app/parallel-parking/__tests__/page.test.tsx:testParallelParkingPage` | Planned |
| FR-014 | `app/packages/page.tsx:AddOnsTab` | `app/packages/__tests__/page.test.tsx:testDistanceTiers` | Planned |
| FR-015 | `components/Navbar.tsx:Navbar` | `components/__tests__/Navbar.test.tsx:testSimplifiedNav` | Planned |
| FR-016 | `components/Navbar.tsx:Navbar` | `components/__tests__/Navbar.test.tsx:testMyProgressLink` | Planned |
| FR-017 | Multiple components | `components/__tests__/mobile.test.tsx:testTouchTargets` | Planned |
| FR-018 | `app/page.tsx:HomePage` | Performance test | Planned |
| AC-001 | `components/HeroSection.tsx:HeroSection` | `components/__tests__/HeroSection.test.tsx:testHeroSectionRenders` | Planned |
| AC-002 | `components/JourneyTracker.tsx:JourneyTracker` | `components/__tests__/JourneyTracker.test.tsx:testRemovedComponents` | Planned |
| AC-003 | `components/ServiceOverview.tsx:ServiceOverview` | `components/__tests__/ServiceOverview.test.tsx:testServiceOverviewRenders` | Planned |
| AC-004 | `app/page.tsx:HomePage` | `app/__tests__/page.test.tsx:testRemovedSections` | Planned |
| AC-005 | `components/WhyChoose.tsx:benefits` | `components/__tests__/WhyChoose.test.tsx:testReducedBenefits` | Planned |
| AC-006 | `components/GoogleReviews.tsx:GOOGLE_REVIEWS` | `components/__tests__/GoogleReviews.test.tsx:testLimitedReviews` | Planned |
| AC-007 | `components/workflow/WorkflowProvider.tsx:useEffect` | `components/workflow/__tests__/WorkflowProvider.test.tsx:testNoAutoOpen` | Planned |
| AC-008 | `components/workflow/WorkflowProvider.tsx:open` | `components/workflow/__tests__/WorkflowProvider.test.tsx:testManualOpen` | Planned |
| AC-009 | `components/JourneyTracker.tsx:JourneyTracker` | `components/__tests__/JourneyTracker.test.tsx:testComponentSplit` | Planned |
| AC-010 | `components/PackageTabs.tsx:PackageTabs` | `components/__tests__/PackageTabs.test.tsx:testTabNavigation` | Planned |
| AC-011 | `components/PackageTabs.tsx:LessonsTab` | `components/__tests__/PackageTabs.test.tsx:testHighlightedPackages` | Planned |
| AC-012 | `app/packages/page.tsx:BundlesTab` | `app/packages/__tests__/page.test.tsx:testWgsAccordion` | Planned |
| AC-013 | `app/parallel-parking/page.tsx:ParallelParkingPage` | `app/parallel-parking/__tests__/page.test.tsx:testParallelParkingPage` | Planned |
| AC-014 | `app/packages/page.tsx:AddOnsTab` | `app/packages/__tests__/page.test.tsx:testDistanceTiers` | Planned |
| AC-015 | `components/Navbar.tsx:Navbar` | `components/__tests__/Navbar.test.tsx:testSimplifiedNav` | Planned |
| AC-016 | `components/Navbar.tsx:Navbar` | `components/__tests__/Navbar.test.tsx:testMyProgressLink` | Planned |
| AC-017 | Multiple components | `components/__tests__/mobile.test.tsx:testTouchTargets` | Planned |
| AC-018 | `app/page.tsx:HomePage` | Performance test | Planned |
| AC-019 | Multiple components | Regression tests | Planned |
| AC-020 | Performance test | Lighthouse audit | Planned |
| FR-019 / AC-021 | `components/HeroSection.tsx` | `components/__tests__/HeroSection.test.tsx:testDualCtas` | Planned |
| FR-020 | `components/HeroSection.tsx` | `components/__tests__/HeroSection.test.tsx:testJourneySubheadline` | Planned |
| FR-021 / AC-022 | `components/LicenseRoadmap.tsx`, `lib/constants.ts:LICENSE_ROADMAP` | `components/__tests__/LicenseRoadmap.test.tsx:testFiveSteps` | Planned |
| FR-022 / AC-023 | `components/TrustBadges.tsx`, `lib/constants.ts:TRUST_SIGNALS` | `components/__tests__/TrustBadges.test.tsx:testEightSignals` | Planned |
| FR-023 / AC-024 | `components/Instructors.tsx`, `lib/instructors.ts` | `components/__tests__/Instructors.test.tsx:testInstructorCard` | Planned |
| FR-024 / AC-025 | `components/GoogleReviews.tsx`, `lib/reviews.ts` | `components/__tests__/GoogleReviews.test.tsx:testSuccessStory` | Planned |
| FR-025 / AC-026 | FAQ component/source | `components/__tests__/FAQ.test.tsx:testCoreQuestions` | Planned |
| FR-026 / AC-027 | `app/locations/austin/page.tsx`, `components/LocationPage.tsx` | `app/locations/__tests__/austin.test.tsx:testAustinPage` | Planned |
| FR-027 / AC-028 | `app/locations/san-antonio/page.tsx`, `components/LocationPage.tsx` | `app/locations/__tests__/san-antonio.test.tsx:testSanAntonioPage` | Planned |
| FR-028 | `components/LocationPage.tsx` | `app/locations/__tests__/*.test.tsx:testJsonLd` | Planned |
| FR-029 / AC-029 | Hero/Location/Contact | `components/__tests__/mobile.test.tsx:testBookingAffordances` | Planned |
| FR-030 / AC-030 | All new components | Lint/style review of palette tokens | Planned |
| FR-031 / AC-031 | `components/Navbar.tsx`, `lib/constants.ts` | `components/__tests__/Navbar.test.tsx:testLocationsNav` | Planned |
| FR-032 / AC-032 | `lib/instructors.ts`, `lib/reviews.ts` | Consumed-by-component tests | Planned |

---

## Success Metrics Verification

### Pre-Implementation Baseline
- Homepage bounce rate: [To be measured]
- Packages page time-on-page: [To be measured]
- Workflow conversion rate: [To be measured]
- Lighthouse performance score: [To be measured]
- Initial bundle size: [To be measured]
- Mobile LCP: [To be measured]

### Post-Implementation Targets
- Homepage bounce rate: Decrease by 20%
- Packages page time-on-page: Increase by 30%
- Workflow conversion rate: Increase by 15%
- Lighthouse performance score: > 90
- Initial bundle size: Decrease by 15%
- Mobile LCP: Improve by 20%

---

## Risk Mitigation

### Risk: Oversimplification loses information
**Mitigation:** Use progressive disclosure (accordions, modals, "Learn more" links)

### Risk: Reduced SEO from less content
**Mitigation:** Keep detailed content on dedicated pages, maintain keyword density

### Risk: User confusion from layout changes
**Mitigation:** A/B test new design, gather user feedback, iterate based on data

### Risk: Breaking existing user flows
**Mitigation:** Maintain all existing URLs, implement redirects if needed, preserve framework integration

---

## Next Steps

1. Review and approve spec.md
2. Review and approve plan.md
3. Create feature branch: `016-ui-redesign`
4. Implement Task 1 (Create New Hero Components)
5. Implement remaining tasks in order
6. Run tests and verify acceptance criteria
7. Measure success metrics
8. Deploy to staging for A/B testing
9. Gather user feedback
10. Iterate based on data
11. Deploy to production
12. Document changes in change-summary.md
