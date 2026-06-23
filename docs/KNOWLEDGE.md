# Knowledge Base

**Status:** Living document (updated 2026-06-18)  
**Owner:** Platform / DevEx  
**Purpose:** Single source of truth for platform knowledge, learnings, and standards.

This document mirrors key insights from the Claude Code local memory system into the repository, making knowledge discoverable and version-controlled.

---

## 1. Recent Major Work (2026-06-16 to 2026-06-22)

### PDS Parinama UI/UX Redesign (Spec 016 - 2026-06-22)

**What changed:**
- Comprehensive visual polish and UX improvements inspired by modern SaaS companies (Stripe, Linear, Calendly, Airbnb)
- Enhanced hero section with social proof badge (5-star rating, review count)
- Redesigned package cards with premium styling (rounded-3xl, gradients, enhanced hover effects)
- Added live stats banner showing: Rating (5.0), Reviews (54+), Pass Rate (98%), Students (500+)
- Improved typography and spacing with premium shadow utilities
- Added micro-interactions (scale effects on buttons, smoother transitions)
- Reorganized packages page with services overview as hero section
- Renamed "Services & Pricing" to "Services & Plans" globally
- Left-aligned services overview section heading

**Why:**
- Reposition brand as a guided Texas licensing journey ("Uber meets Apple" aesthetic)
- Increase conversions for lesson bookings, road tests, and WhatsApp engagement
- Maintain trust signals while adding premium, modern visual polish
- Make the licensing process feel easy and predictable

**Design Principles:**
- Mobile-first design with 44px minimum touch targets
- Clean, modern aesthetic with generous whitespace
- Conversion-focused CTAs and social proof
- Retained orange brand palette and design tokens

**Files Modified:**
- `components/HeroSection.tsx` - Enhanced with social proof, improved hierarchy
- `components/PackageCard.tsx` - Premium redesign with better styling
- `components/TrustBadges.tsx` - Added live stats banner
- `app/globals.css` - Added premium shadow utilities
- `components/ui.tsx` - Added micro-interactions to StartJourneyButton
- `app/packages/page.tsx` - Reorganized layout, added services overview
- `lib/constants.ts` - Renamed "Services & Pricing" to "Services & Plans" in NAV_LINKS

**Reference:** `specs/pds_parinama/016-ui-redesign/spec.md`, `knowledge/pds_parinama/architecture.md`

---

### Angular 19 & Node 24 Upgrade

**What changed:**
- Frontend upgraded from Angular 17 → 18 → 19.2.25
- Node version requirement: 20 LTS → 24 LTS (strict enforcement)
- npm requirement: 10+
- All with `.nvmrc`, `.node-version`, and `package.json` `engines` enforcement

**Why:**
- Angular 17 had proxy middleware incompatibility with Node 24
- Node 24 LTS is the forward-proof runtime for 2026+
- npm 10+ has better semver handling

**Impact:**
- Zero breaking changes to code
- All components still use `standalone: false` (consistency)
- Package-lock.json regenerated (lockfileVersion 3)
- CI updated to Node 24

**Reference:** `ARCHITECTURE.md` (line 19), `ENGINEERING_STANDARDS.md` §4, `LOCAL_DEV.md` §0

---

### NPM/MVN-Only Startup Enforcement

**What changed:**
- Strict policy: all builds/launches through `npm` (frontend) or `mvn` (backend)
- Prohibited: direct `ng serve`, `java -jar`, `gradle`, `node`, `./mvnw`
- Pre-commit hooks block non-compliant commits
- Validator script scans all 9 startup scripts before each commit

**Why:**
1. **One toolchain, one behavior** — Dev and CI run identical configs
2. **No stale artifacts** — `mvn spring-boot:run` always builds from source
3. **Config in one place** — Dev-server flags in `package.json`, not duplicated
4. **Auditability** — Single linter proves compliance

**Enforcement Mechanisms:**
1. `Resolve-NpmCommand` / `Resolve-MavenCommand` — validate tools before launch
2. Pre-commit hook (`.githooks/pre-commit`) — blocks commits if violations found
3. `validate-startup-scripts.ps1` — linter; scans all 9 scripts
4. `package.json` `scripts` / `pom.xml` goals — source of truth

**How this affects you:**
- On first commit: pre-commit hook runs automatically
- If scripts are non-compliant: commit is **blocked**
- Fix violations and commit again
- Emergency bypass: `git commit --no-verify` (NOT RECOMMENDED)

**Reference:** `scripts/STARTUP_SCRIPT_POLICY.md`, `ENGINEERING_STANDARDS.md` §5, `.githooks/README.md`

---

### DTO Pattern (Spec 015)

**What changed:**
- All endpoints returning entities now wrap them in Data Transfer Objects (DTOs)
- 20 DTOs implemented protecting 90+ endpoints
- Backend eager-loads only DTO fields (eliminates N+1 queries)
- Frontend receives typed DTO contracts

**Why:**
- Avoids lazy-loading errors (backend sends only requested fields)
- Prevents N+1 query chains
- Type-safe frontend (DTO types = API contract)
- Safe refactoring (renaming a column doesn't break API if not in DTO)

**Pattern:**
```java
// Service: eager-load only DTO fields
List<WorkflowDTO> findByCategory(String category) {
    return repo.findByCategory(category).stream()
        .map(w -> new WorkflowDTO(w.id, w.name, w.description))
        .collect(toList());
}

// Controller: return DTO, never entity
@GetMapping("/workflows")
public List<WorkflowDTO> list() { return service.findByCategory(...); }

// Frontend: typed DTO contracts
interface WorkflowDTO { id: string; name: string; description: string; }
```

**Phase Progress:**
- Phase 1 (2026-06-16): 11 DTOs, 9 services, 10 controllers — COMPLETE
- Phase 2 (2026-06-16): 7 DTOs, 3 services, 2 controllers — COMPLETE
- Phase 3 (2026-06-17): 2 shared DTOs — COMPLETE

**Reference:** `specs/015-end-to-end-review/spec.md`, `ENGINEERING_STANDARDS.md` §4

---

### Code Review Guardrails (14 Rules)

**Backend (7 rules):**
1. **DTO protection** — endpoints return DTO, never bare entity
2. **Constructor injection** — no `@Autowired` field injection (breaks Spring test)
3. **Eager loading** — services use `@EntityGraph` / `select new` (prevents N+1)
4. **@Transactional scope** — never wraps `@PostConstruct` or async work
5. **Null handling** — NPE-proof entity navigation (`.orElse(null)` / `.ifPresent()`)
6. **Error handling** — try/catch in critical paths (DataInitializer pattern)
7. **Query count** — heavy endpoints don't trigger 10+ DB queries

**Frontend (7 rules):**
1. **Code-splitting** — features in lazy modules, not AppModule
2. **Bundle size** — main bundle < 100 KB (after minification)
3. **Lazy routes** — features use `loadComponent` / `loadChildren`
4. **Template logic** — no complex `*ngIf` / calculations (move to component)
5. **DTO usage** — never navigate entity graph; use API contract
6. **HTTP calls** — always via `ApiService` (with `AuthInterceptor`)
7. **Subscribe management** — component unsubscribes (no memory leaks)

**Enforcement:** Violations escalated to founder; mandatory code review checklist.

**Reference:** `ENGINEERING_STANDARDS.md` §6

---

### ExecutionType Enum Removal

**What changed:**
- Removed ExecutionType enum entirely (simplification)
- Updated MCPToolImplementation, MCPToolDefinition, 27 tool implementations
- WorkflowCategory, WorkflowService refactored
- Execution type now implicit from CategoryType

**Why:**
- Simplified the mental model (fewer abstractions)
- CategoryType already carries the information
- Reduced coupling in tool implementations

**Status:** COMPLETE, backend verified, production-ready

**Reference:** Memory file: `execution_type_removal_complete.md`

---

### Pre-Commit Hook System

**What changed:**
- Automated pre-commit hooks in all 3 repos (.githooks/pre-commit)
- Git configured to use `.githooks` directory
- Validator runs before every commit

**How it works:**
1. You run `git commit`
2. Hook automatically executes `validate-startup-scripts.ps1`
3. If scripts are compliant → commit proceeds (silent)
4. If non-compliant → commit is **BLOCKED** with error message

**Setup:**
- Already configured: `git config core.hooksPath .githooks`
- Developers get hooks automatically on clone/pull
- No additional setup needed

**Bypass (emergency only):**
```sh
git commit --no-verify
```

**Reference:** `.githooks/README.md`, `scripts/STARTUP_SCRIPT_POLICY.md` §4

---

### Documentation Consolidation (2026-06-18)

**What changed:**
- Audited 109 .md files in spec-kit
- Consolidated script docs: 3 files → 2 (STARTUP_SCRIPT_POLICY.md)
- Created SPECKIT_COMMANDS_REFERENCE.md (21-command index)
- Deleted 5 stale workspace files
- Enhanced ARCHITECTURE.md, ENGINEERING_STANDARDS.md, LOCAL_DEV.md

**High-priority gaps fixed:**
- ✅ Angular version stale (18→19)
- ✅ Node 24 requirement missing
- ✅ NPM/MVN-only policy buried
- ✅ Pre-commit hooks undocumented
- ✅ DTO pattern guidelines missing
- ✅ Code review guardrails not codified

**Impact:**
- ~35-45 files consolidated across codebase
- Codebase cleaner and leaner
- Governance clarity improved
- New developers have single discovery path

**Reference:** `ENGINEERING_STANDARDS.md`, commit `da51121`

---

## 2. Architecture Overview

See `ARCHITECTURE.md` for complete system design. Key points:

**Frontend:** Angular 19 SPA (Node 24, npm 10+)
- Lazy-loaded feature modules
- DTO pattern: all endpoints return typed objects
- Code-splitting: core shell + deferred features
- Builds via `npm` only

**Backend:** Spring Boot 3.x (Java 17)
- 40 controllers / 45 services / 53 repositories / 55 entities
- JWT auth (HMAC HS256)
- AES-256 secret encryption
- Agentic layer (MCP tools, workflows)
- Builds via `mvn` only

**Database:** GCP Cloud SQL (Postgres) + Redis + Qdrant (RAG)

---

## 3. Engineering Standards

**All standards live in:** `ENGINEERING_STANDARDS.md`

Quick reference:

| Area | Standard | Reference |
|------|----------|-----------|
| **SDD** | Spec-driven development mandatory | §1 |
| **Git** | Branch model, commit messages, pre-commit hooks | §2 |
| **Backend** | Layering, bean lifecycle, @PostConstruct rules | §3 |
| **Frontend** | Angular 19, Node 24, component declaration | §4 |
| **DTO Pattern** | Every endpoint returns DTO (spec 015) | §4 |
| **Build Enforcement** | NPM/MVN only, 6 guardrails, pre-commit hooks | §5 |
| **Code Review** | 14 rules (7 backend, 7 frontend) | §6 |
| **Scripts** | PowerShell template, ASCII-only, shared helpers | §8 |
| **Dependencies** | Maven/npm as single source of truth | §10 |
| **Secrets** | Never commit credentials; use env vars | §11 |
| **AI Agents** | SDD workflow, allowed agents, prohibited behaviors | §12 |
| **Lessons Learned** | 10 durable patterns from past incidents | §13 |

---

## 4. Startup & Deployment

**See:** `LOCAL_DEV.md` for full setup guide

**Quick start (≤15 minutes):**
```powershell
cd AxisTechnologies
& .\spec-kit\scripts\start-all.ps1
# Backend on :8080, Frontend on :4200
```

**Key points:**
- Node 24 LTS (required; enforced via .nvmrc)
- Maven 3.9+ on PATH (required; enforced via validator)
- application-local.properties (gitignored; use .example template)
- Pre-commit hooks run automatically (no setup needed)

**Startup times (optimized):**
- Backend: 36s (was 120s)
- Frontend: 15-25s (was 60s)
- Total: ~51-61s (was ~180s)

---

## 5. Key Patterns & Solutions

### DTO Pattern (Anti-Lazy-Loading)
See `ENGINEERING_STANDARDS.md` §4 + spec 015.
- Eager-load in services
- DTO wraps entities before return
- Frontend navigates DTO graph only

### Code Review Guardrails
14 rules enforced on every PR. See `ENGINEERING_STANDARDS.md` §6.
- 7 backend rules (DTO, injection, loading, transactions, null-safety, errors, queries)
- 7 frontend rules (splitting, bundle, routing, logic, DTOs, HTTP, subscriptions)

### Pre-Commit Hook Enforcement
Automatic validation before each commit. See `.githooks/README.md`.
- Blocks non-compliant startup scripts
- All 9 scripts must use only npm or mvn
- Emergency bypass: `git commit --no-verify`

### Agentic Workflows
3-task pattern: AI Analysis → Human Approval → Conditional Execution
- Spec 013: Unified MCP tool registry (21 tools)
- Spec 014: Startup + MCP review fixes
- Spec 015: DTO pattern + end-to-end review

---

## 6. Debugging Red Flags

### Backend Issues
- **N+1 queries**: Missing `@EntityGraph` / `select new` in query methods
- **LazyInitializationException**: Entity navigation outside session (use DTOs)
- **@PostConstruct + network I/O**: Use `@EventListener(ApplicationReadyEvent.class) + @Async`
- **@Autowired fields in services**: Use constructor injection instead
- **Stale env vars**: `Remove-Item Env:SECRETS_ENCRYPTION_KEY` then retry

### Frontend Issues
- **Bundle size > 100 KB**: Feature code in AppModule instead of lazy modules
- **Slow dev server**: Proxy not configured; ensure `--proxy-config proxy.conf.json` in npm start
- **API requests hit :4200**: Proxy not working; check Node 24 + proxy.conf.json
- **Memory leaks**: Component subscribes but never unsubscribes
- **Entity graph navigation**: Endpoint expects `owner.profile.avatar` but DTO only has `id, name`

---

## 7. Important Files & Their Purpose

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | System overview, layered design, tech stack |
| `ENGINEERING_STANDARDS.md` | All standards (SDD, backend, frontend, scripts, guardrails, lessons) |
| `LOCAL_DEV.md` | Setup guide, startup commands, troubleshooting |
| `scripts/STARTUP_SCRIPT_POLICY.md` | NPM/MVN enforcement, guardrails, script manifest, hook setup |
| `.githooks/README.md` | Pre-commit hook setup, bypass instructions, troubleshooting |
| `SPECKIT_COMMANDS_REFERENCE.md` | Index of all 21 Claude Code commands |
| `specs/015-end-to-end-review/spec.md` | DTO pattern specification + 20 DTOs |
| `specs/013-unified-mcp-tools/spec.md` | MCP tool registry (21 tools) |

---

## 8. Knowledge System

### Local Memory (Claude Code)
- Persistent across conversations
- File-based: `~/.claude/projects/.../memory/MEMORY.md`
- Contains: recent work, learnings, decisions, architectural notes
- **Not version-controlled** (local to machine)

### Repository Knowledge (spec-kit)
- This file (`KNOWLEDGE.md`)
- Mirrors key insights from memory into the repo
- Version-controlled (git history)
- Discoverable by all developers

### Documentation (spec-kit)
- `ARCHITECTURE.md` — system design
- `ENGINEERING_STANDARDS.md` — all standards
- `LOCAL_DEV.md` — setup & operations
- Spec folders — feature specifications (015, 013, etc.)

---

## 9. Recent Commits

| Commit | Message | Impact |
|--------|---------|--------|
| `da51121` | docs: comprehensive documentation consolidation | Unified standards, consolidated scripts, deleted stale files |
| `ea353b8` | docs: add .githooks README | Pre-commit hook documentation |
| `ef68f94` | fix(validator): improve false-positive handling | Pre-commit validator updated |
| `580270c` | feat: add automated pre-commit hook | Pre-commit enforcement in all repos |
| `7593752` | chore: Angular 19 upgrade complete | Angular 17→19, Node 24 support |

---

## 10. Next Steps & Open Items

**Infrastructure:**
- Feature 012 database credentials (blocked on ops)
- MCP migration to production

**Deferred (Low Priority):**
- Schema waves 3-4 (architectural cleanup)
- Stack upgrades (Java 17→21, Spring 3.5)
- Component cleanup (remaining NgModule→standalone)

**No blocking issues for deployment.**

---

## 11. How to Use This Document

- **New developers**: Start here, then read ARCHITECTURE.md → ENGINEERING_STANDARDS.md → LOCAL_DEV.md
- **Before coding**: Check ENGINEERING_STANDARDS.md §6 (code review guardrails)
- **Setting up locally**: Read LOCAL_DEV.md (updated 2026-06-18)
- **Debugging issues**: Check §6 "Red Flags" above
- **Questions about standards**: This document or ENGINEERING_STANDARDS.md
- **Questions about startup/deployment**: LOCAL_DEV.md or scripts/STARTUP_SCRIPT_POLICY.md

---

**Last updated:** 2026-06-18  
**By:** Claude Code + OPUS  
**Status:** COMPLETE & READY FOR PRODUCTION
