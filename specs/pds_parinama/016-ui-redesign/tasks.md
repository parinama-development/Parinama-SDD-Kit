# Tasks — 016 PDS Parinama UI/UX Redesign

**Feature:** PDS Parinama UI/UX Redesign  
**Spec Number:** 016  
**Branch:** Tousif  
**Total Tasks:** 72 base + 23 positioning (T073–T095) = 95  

> **Update (Opus revision):** The original simplification scope (Phases 1–9) is largely implemented. Phase 10 below adds the **"guided licensing journey" positioning & conversion** work (premium hero, roadmap, trust, instructors, success stories, FAQ, location pages, mobile booking). All new work retains the existing **orange brand palette**.

---

## Phase 1: Homepage Hero Components (Foundation)

**Goal:** Create simplified hero components to replace monolithic JourneyTracker

**Independent Test Criteria:**
- HeroSection renders with headline, subheadline, CTA, and rating badge
- ServiceOverview renders 3 service cards
- ProgressCard renders progress tracker for both guests and logged-in users
- All components pass TypeScript compilation
- All components pass ESLint

**Implementation Tasks:**

- [ ] T001 Create HeroSection component in pds_parinama/components/HeroSection.tsx with headline, subheadline, primary CTA, and rating badge props
- [ ] T002 [P] Create HeroSection test file in pds_parinama/components/__tests__/HeroSection.test.tsx with tests for rendering headline, subheadline, CTA, and rating badge
- [ ] T003 Create ServiceOverview component in pds_parinama/components/ServiceOverview.tsx with 3 service cards (Driver Education, Driving Lessons, Road Testing)
- [ ] T004 [P] Create ServiceOverview test file in pds_parinama/components/__tests__/ServiceOverview.test.tsx with tests for rendering 3 service cards with correct icons, titles, and descriptions
- [ ] T005 Create ProgressCard component in pds_parinama/components/ProgressCard.tsx extracted from JourneyTracker lines 412-514
- [ ] T006 [P] Create ProgressCard test file in pds_parinama/components/__tests__/ProgressCard.test.tsx with tests for guest progress tracker and logged-in ProgressTracker rendering
- [ ] T007 Update JourneyTracker component in pds_parinama/components/JourneyTracker.tsx to use HeroSection, ServiceOverview, and ProgressCard components
- [ ] T008 [P] Update JourneyTracker test file in pds_parinama/components/__tests__/JourneyTracker.test.tsx to test component composition and workflow integration
- [ ] T009 Remove ReviewTicker component code from pds_parinama/components/JourneyTracker.tsx (lines 204-262)
- [ ] T010 Remove FlippingOffer, TwoStepLine, and QuickPick component code from pds_parinama/components/JourneyTracker.tsx

---

## Phase 2: Homepage Layout Simplification

**Goal:** Simplify homepage by removing redundant sections and consolidating components

**Independent Test Criteria:**
- Homepage renders without HighlightStrip and PackagesTeaser
- Homepage renders consolidated Services section
- Homepage renders reduced WhyChoose benefits (5 instead of 9)
- Homepage renders limited GoogleReviews (3-4 instead of all)
- All sections render in correct order

**Implementation Tasks:**

- [ ] T011 Update homepage in pds_parinama/app/page.tsx to remove HighlightStrip import and render
- [ ] T012 Update homepage in pds_parinama/app/page.tsx to remove PackagesTeaser import and render
- [ ] T013 Update homepage in pds_parinama/app/page.tsx to replace Services component with ServiceOverview component
- [ ] T014 [P] Update homepage test file in pds_parinama/app/__tests__/page.test.tsx to test removed sections and new component composition
- [ ] T015 Update WhyChoose component in pds_parinama/components/WhyChoose.tsx to reduce benefits array from 9 to 5 (keep: Experienced Instructors, Step-by-Step Guidance, Multilingual Instructors, Open 7 Days, TDLR & DPS Approved)
- [ ] T016 [P] Update WhyChoose test file in pds_parinama/components/__tests__/WhyChoose.test.tsx to test exactly 5 benefit cards render
- [ ] T017 Update GoogleReviews component in pds_parinama/components/GoogleReviews.tsx to limit GOOGLE_REVIEWS to first 4 reviews
- [ ] T018 [P] Update GoogleReviews test file in pds_parinama/components/__tests__/GoogleReviews.test.tsx to test exactly 4 reviews render with correct pagination
- [ ] T019 Delete HighlightStrip component file pds_parinama/components/HighlightStrip.tsx
- [ ] T020 Delete PackagesTeaser component file pds_parinama/components/PackagesTeaser.tsx

---

## Phase 3: Workflow Modal Trigger Update

**Goal:** Change workflow modal from auto-popup to on-demand trigger

**Independent Test Criteria:**
- Workflow modal does not auto-open on page load
- Workflow modal opens when open() method is called
- Workflow modal maintains existing functionality

**Implementation Tasks:**

- [ ] T021 Update WorkflowProvider in pds_parinama/components/workflow/WorkflowProvider.tsx to remove auto-open useEffect logic
- [ ] T022 [P] Update WorkflowProvider test file in pds_parinama/components/workflow/__tests__/WorkflowProvider.test.tsx to test modal does not auto-open
- [ ] T023 Update WorkflowProvider test file in pds_parinama/components/workflow/__tests__/WorkflowProvider.test.tsx to test modal opens when open() is called
- [ ] T024 Update WorkflowModal in pds_parinama/components/workflow/WorkflowModal.tsx to add autoShow prop (default: false)
- [ ] T025 [P] Update WorkflowModal test file in pds_parinama/components/workflow/__tests__/WorkflowModal.test.tsx to test autoShow prop controls modal display

---

## Phase 4: Packages Page Tab Navigation

**Goal:** Implement tab-based navigation for packages page

**Independent Test Criteria:**
- PackageTabs component renders 4 tabs (Lessons, Road Tests, Bundles, Add-ons)
- Clicking tabs switches content correctly
- Default tab is 'lessons'
- Each tab displays correct content

**Implementation Tasks:**

- [ ] T026 Create PackageTabs component in pds_parinama/components/PackageTabs.tsx with tab state management and 4 tabs
- [ ] T027 [P] Create PackageTabs test file in pds_parinama/components/__tests__/PackageTabs.test.tsx with tests for tab rendering and switching
- [ ] T028 Create LessonsTab component in pds_parinama/components/PackageTabs/LessonsTab.tsx with 3 highlighted packages (single, 6-hour, 10-hour) and "View all packages" link
- [ ] T029 [P] Create LessonsTab test file in pds_parinama/components/__tests__/LessonsTab.test.tsx with tests for highlighted packages rendering
- [ ] T030 Create RoadTestsTab component in pds_parinama/components/PackageTabs/RoadTestsTab.tsx with road test services and booking steps
- [ ] T031 [P] Create RoadTestsTab test file in pds_parinama/components/__tests__/RoadTestsTab.test.tsx with tests for road test services rendering
- [ ] T032 Create BundlesTab component in pds_parinama/components/PackageTabs/BundlesTab.tsx with bundle packages and WGS accordion
- [ ] T033 [P] Create BundlesTab test file in pds_parinama/components/__tests__/BundlesTab.test.tsx with tests for bundles and WGS accordion
- [ ] T034 Create AddOnsTab component in pds_parinama/components/PackageTabs/AddOnsTab.tsx with add-ons and simplified distance tier table (3 tiers)
- [ ] T035 [P] Create AddOnsTab test file in pds_parinama/components/__tests__/AddOnsTab.test.tsx with tests for add-ons and distance tiers
- [ ] T036 Update packages page in pds_parinama/app/packages/page.tsx to use PackageTabs component instead of existing sections
- [ ] T037 [P] Update packages page test file in pds_parinama/app/packages/__tests__/page.test.tsx to test PackageTabs rendering and default tab

---

## Phase 5: Parallel Parking Dedicated Page

**Goal:** Create dedicated page for parallel parking content

**Independent Test Criteria:**
- Parallel parking page renders with full layout
- Page displays technique steps
- Page displays booking CTA
- Page has correct metadata and SEO

**Implementation Tasks:**

- [ ] T038 Create parallel parking page in pds_parinama/app/parallel-parking/page.tsx with content extracted from packages page lines 258-352
- [ ] T039 [P] Create parallel parking page test file in pds_parinama/app/parallel-parking/__tests__/page.test.tsx with tests for content rendering and CTA
- [ ] T040 Add metadata and SEO to parallel parking page in pds_parinama/app/parallel-parking/page.tsx
- [ ] T041 Update packages page in pds_parinama/app/packages/page.tsx to add link to parallel parking page
- [ ] T042 [P] Update packages page test file in pds_parinama/app/packages/__tests__/page.test.tsx to test parallel parking link

---

## Phase 6: Navigation Simplification

**Goal:** Simplify navigation to 5 main links and add My Progress for logged-in users

**Independent Test Criteria:**
- Navbar renders exactly 5 main navigation links (Home, Services, Packages, How It Works, Account)
- Navbar renders "My Progress" link when user is logged in
- Navbar does not render redundant links

**Implementation Tasks:**

- [ ] T043 Update NAV_LINKS in pds_parinama/lib/constants.ts to: Home, Services, Packages, How It Works, Account
- [ ] T044 Update Navbar component in pds_parinama/components/Navbar.tsx to add conditional "My Progress" link for logged-in users
- [ ] T045 [P] Update Navbar test file in pds_parinama/components/__tests__/Navbar.test.tsx to test simplified navigation and My Progress link
- [ ] T046 Update SERVICES_MENU in pds_parinama/lib/constants.ts if needed for simplified navigation

---

## Phase 7: Mobile Optimization

**Goal:** Ensure mobile-first design with proper touch targets

**Independent Test Criteria:**
- All interactive elements have minimum touch target size of 44px
- Components stack vertically on mobile
- Accordions work correctly on mobile

**Implementation Tasks:**

- [ ] T047 Update HeroSection component in pds_parinama/components/HeroSection.tsx to add min-h-[44px] to all interactive elements
- [ ] T048 [P] Update ServiceOverview component in pds_parinama/components/ServiceOverview.tsx to add min-h-[44px] to all interactive elements
- [ ] T049 Update PackageTabs component in pds_parinama/components/PackageTabs.tsx to add min-h-[44px] to all interactive elements
- [ ] T050 [P] Update Navbar component in pds_parinama/components/Navbar.tsx to add min-h-[44px] to all interactive elements
- [ ] T051 Create mobile test file in pds_parinama/components/__tests__/mobile.test.tsx with tests for touch targets and vertical stacking
- [ ] T052 Update components to use flex-col on mobile for stacked layouts (HeroSection, ServiceOverview, PackageTabs)

---

## Phase 8: Performance Optimization

**Goal:** Improve performance through lazy loading and optimization

**Independent Test Criteria:**
- Below-fold sections load lazily (verified via network waterfall)
- Lighthouse performance score > 90
- Initial bundle size reduced by 15%
- Mobile LCP improved by 20%

**Implementation Tasks:**

- [ ] T053 Add dynamic imports for below-fold components in pds_parinama/app/page.tsx (WhyChoose, GoogleReviews, FAQ, Contact)
- [ ] T054 [P] Run Lighthouse audit and measure baseline performance metrics
- [ ] T055 Optimize images in pds_parinama/public/ directory
- [ ] T056 [P] Reduce animation complexity in pds_parinama/components/ for mobile (simplify Framer Motion animations)
- [ ] T057 [P] Run Lighthouse audit again and verify performance improvements
- [ ] T058 Update package.json scripts in pds_parinama/package.json to include build analysis if needed

---

## Phase 9: Final Polish & Testing

**Goal:** Complete testing, documentation, and verification

**Independent Test Criteria:**
- All acceptance criteria met
- All functional requirements implemented
- Lighthouse score > 90
- Mobile responsiveness verified
- All existing functionality regression tested
- Documentation updated

**Implementation Tasks:**

- [ ] T059 Run all tests in pds_parinama/ with npm test
- [ ] T060 [P] Run ESLint in pds_parinama/ with npm run lint
- [ ] T061 Run TypeScript type check in pds_parinama/ with npx tsc --noEmit
- [ ] T062 [P] Build project in pds_parinama/ with npm run build
- [ ] T063 Verify all acceptance criteria from spec.md are met
- [ ] T064 [P] Verify all functional requirements from spec.md are implemented
- [ ] T065 Run regression tests for existing functionality (booking, progress tracking, auth, payment)
- [ ] T066 [P] Test mobile responsiveness on multiple viewports (375px, 768px, 1024px)
- [ ] T067 Update README.md in pds_parinama/README.md with UI redesign notes
- [ ] T068 [P] Create change summary in c:\Users\Tousif\ParinamaProjects\Parinama-SDD-Kit\specs\pds_parinama\016-ui-redesign\change-summary.md
- [ ] T069 Commit changes with conventional commit format: feat(pds): implement UI/UX redesign (spec 016)

---

## Dependencies

**Phase Completion Order:**
1. Phase 1 (Foundation) → Must complete before Phase 2
2. Phase 2 (Homepage Layout) → Can run in parallel with Phase 3
3. Phase 3 (Workflow Modal) → Can run in parallel with Phase 2
4. Phase 4 (Packages Tabs) → Independent of Phases 1-3
5. Phase 5 (Parallel Parking) → Depends on Phase 4 completion
6. Phase 6 (Navigation) → Independent of Phases 1-5
7. Phase 7 (Mobile) → Depends on Phases 1-6 completion
8. Phase 8 (Performance) → Depends on Phases 1-7 completion
9. Phase 10 (Positioning & Conversion) → Depends on Phase 1 (HeroSection exists); otherwise independent and parallelizable. Should complete before Phase 9 final polish so new sections are covered by tests/Lighthouse.
10. Phase 9 (Polish) → Must complete after all other phases (including Phase 10)

**Parallel Execution Opportunities:**
- Phase 2 and Phase 3 can run in parallel
- Phase 4, Phase 5, and Phase 6 can run in parallel
- Within each phase, tasks marked [P] can run in parallel

---

## Implementation Strategy

**MVP Scope (First Increment):**
- Phase 1: Homepage Hero Components (Tasks T001-T010)
- Phase 2: Homepage Layout Simplification (Tasks T011-T020)
- Phase 9: Final Polish & Testing (Tasks T059-T069)

**Incremental Delivery:**
1. **Increment 1:** Simplified homepage with new hero components
2. **Increment 2:** Workflow modal trigger update
3. **Increment 3:** Packages page tab navigation
4. **Increment 4:** Parallel parking dedicated page
5. **Increment 5:** Navigation simplification
6. **Increment 6:** Mobile optimization
7. **Increment 7:** Performance optimization
8. **Increment 8:** Final polish and testing

**Testing Strategy:**
- Write tests before implementation (TDD) for all new components
- Run tests after each task completion
- Run full test suite after each phase completion
- Run regression tests before final deployment

---

## Success Metrics Tracking

**Pre-Implementation Baseline (to be measured):**
- Homepage bounce rate: [To be measured]
- Packages page time-on-page: [To be measured]
- Workflow conversion rate: [To be measured]
- Lighthouse performance score: [To be measured]
- Initial bundle size: [To be measured]
- Mobile LCP: [To be measured]

**Post-Implementation Targets:**
- Homepage bounce rate: Decrease by 20%
- Packages page time-on-page: Increase by 30%
- Workflow conversion rate: Increase by 15%
- Lighthouse performance score: > 90
- Initial bundle size: Decrease by 15%
- Mobile LCP: Improve by 20%

**Measurement Tasks:**
- [ ] T070 Measure baseline metrics before implementation
- [ ] T071 Measure post-implementation metrics after deployment
- [ ] T072 Compare metrics and document results in change-summary.md

---

## Phase 10: Positioning & Conversion (Opus Revision — New Direction)

**Goal:** Reposition the site as a guided Texas licensing journey with premium, trust-building, conversion-focused sections and local SEO pages. Retain the orange brand palette.

**Independent Test Criteria:**
- Hero shows two CTAs and the journey subheadline
- Roadmap shows 5 ordered steps; Trust section shows 8 credibility items
- Instructors and Success Stories render from data modules
- FAQ answers all 6 core questions
- Austin & San Antonio pages render with JSON-LD and unique metadata
- Mobile exposes call/WhatsApp/Calendly actions at ≥44px

**Implementation Tasks:**

### Premium Hero (FR-019, FR-020 / AC-021)
- [ ] T073 Update `components/HeroSection.tsx` to render dual CTAs: "Start My Driving Journey" (opens workflow) and "Book a Road Test" (routes to road-test booking)
- [ ] T074 Update `components/HeroSection.tsx` subheadline to the guided-journey copy referencing Austin & San Antonio
- [ ] T075 [P] Update `components/__tests__/HeroSection.test.tsx` to test dual CTAs and subheadline

### License Roadmap (FR-021 / AC-022)
- [ ] T076 Add `LICENSE_ROADMAP` (5 ordered steps) to `lib/constants.ts`
- [ ] T077 Create `components/LicenseRoadmap.tsx` visual stepper (mobile-stacked, desktop horizontal)
- [ ] T078 [P] Create `components/__tests__/LicenseRoadmap.test.tsx` testing 5 ordered steps
- [ ] T079 Add `LicenseRoadmap` to `app/page.tsx`

### Trust / Credentials (FR-022 / AC-023)
- [ ] T080 Add `TRUST_SIGNALS` (8 items) to `lib/constants.ts`
- [ ] T081 Create `components/TrustBadges.tsx` and add to `app/page.tsx`
- [ ] T082 [P] Create `components/__tests__/TrustBadges.test.tsx` testing all 8 items

### Meet Your Instructors (FR-023, FR-032 / AC-024)
- [ ] T083 Create `lib/instructors.ts` with `Instructor` interface and placeholder profiles (flag for real data)
- [ ] T084 Create `components/Instructors.tsx` with avatar/initial fallback; add to `app/page.tsx`
- [ ] T085 [P] Create `components/__tests__/Instructors.test.tsx`

### Success Stories (FR-024, FR-032 / AC-025)
- [ ] T086 Extend `lib/reviews.ts` `GoogleReview` with optional `photo` and `outcome`
- [ ] T087 Update `components/GoogleReviews.tsx` to "Success Stories" presentation (photo/avatar, rating, quote, outcome badge); keep 3–4 featured
- [ ] T088 [P] Update `components/__tests__/GoogleReviews.test.tsx` for success-story fields

### FAQ Enhancement (FR-025 / AC-026)
- [ ] T089 Add the 6 core licensing Q&As to the FAQ source/component and test they render

### Location Pages (FR-026, FR-027, FR-028, FR-031 / AC-027, AC-028, AC-031)
- [ ] T090 Add `LOCATION_CONTENT` (areas served, road-test info per city) to `lib/constants.ts`
- [ ] T091 Create `components/LocationPage.tsx` shared layout emitting LocalBusiness JSON-LD
- [ ] T092 Create `app/locations/austin/page.tsx` and `app/locations/san-antonio/page.tsx` with unique metadata
- [ ] T093 [P] Create `app/locations/__tests__/austin.test.tsx` and `.../san-antonio.test.tsx` (content + JSON-LD)
- [ ] T094 Update `components/Navbar.tsx` + `lib/constants.ts` to expose Austin & San Antonio (Locations grouping)

### Mobile Booking Affordances (FR-029 / AC-029)
- [ ] T095 Ensure hero/location/contact expose click-to-call, WhatsApp/text, and Calendly as ≥44px tappable actions on mobile; cover in mobile test
