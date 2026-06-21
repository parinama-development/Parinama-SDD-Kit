# Engineering Standards

**Status**: Canonical (supersedes `.speckit-constitution`, `AGENTS.md`, `LEARNINGS.md`, scattered convention notes).
**Owner**: Tousif (founder) + spec-kit governance.
**Version**: 1.0 (2026-06-16, ratified under spec 015).

This document is the single source of truth for *how we work* on the AxisTechnologies stack. The companion documents are:

- `ARCHITECTURE.md` — what the system **is**
- `LOCAL_DEV.md` — how to **run it locally**
- `OPERATIONS.md` — how to **deploy and operate it**
- `.specify/memory/constitution.md` — non-negotiable invariants

If those four documents and this one disagree, this one yields to `constitution.md`, but otherwise wins against any older `.md` you may find elsewhere in the repos.

---

## 1. Spec-Driven Development (SDD) is non-negotiable

Every non-trivial change starts as a spec under `spec-kit/specs/<NNN>-<slug>/`. "Non-trivial" means anything that:

- Changes a public API, data-model, or user-visible behaviour
- Adds/removes a service, controller, or feature module
- Crosses repo boundaries (api ↔ web-shell ↔ spec-kit)
- Introduces a new dependency
- Modifies the build, launcher, or CI pipeline

Trivial changes (typo, log-level tweak, doc clarification) may go in a single commit without a spec. When in doubt, write the spec — it is cheaper than the post-hoc archaeology we've been doing.

### Spec numbering

- Sequential. `max(existing) + 1`. No exceptions.
- The number is fixed once assigned. If a spec is abandoned, the number is **retired**, not reused.
- Slug is kebab-case, ≤ 6 words.
- Folder layout: `spec.md` (mandatory), then optionally `findings.md`, `plan.md`, `tasks.md`, `data-model.md`, `quickstart.md`, `checklists/`, `contracts/`.

### Spec lifecycle

```
Draft → Active → Implemented → Archived
```

Move a spec to **Archived** only when its content has been folded into one of the canonical docs (this one, `ARCHITECTURE.md`, etc.). Never delete a spec folder — git history is the audit trail.

---

## 2. Repository discipline

### Branch model

- `main` (api repo: `Tousif`, web-shell repo: `Tousif`, spec-kit repo: `main`) is always deployable.
- Feature work uses a topic branch named `<NNN>-<short-slug>` matching the active spec.
- Merge via fast-forward / squash; rebase if the branch is short-lived.

### Commit messages

Conventional Commits, with the spec number in the subject when relevant:

```
type(scope): short summary in imperative mood
type(NNN): short summary when a spec drives the change

Optional body explaining WHY (not what — git diff shows that).
References: spec NNN section X.
```

Types we use: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `perf`, `revert`.

### Pre-commit (`.githooks/pre-commit`)

The hook **must fail closed**, never open. If Maven is missing it must `exit 1` with an install hint, not pretend the compile succeeded (this was the spec 015 P1-5 bug).

### Stale agent worktrees

`*/.claude/worktrees/*` directories are scratch space for AI-coding-agent sessions. Policy:

- Auto-expire after 7 days
- Cleanup script: `spec-kit/scripts/cleanup-worktrees.ps1`
- Never commit content from inside a worktree directly to `main` — promote it to a topic branch first

---

## 3. Backend (Spring Boot) standards

### Bean lifecycle — the `@PostConstruct` rule

**Do not perform network I/O or any operation that may block for >100 ms in `@PostConstruct`.** Spec 014 and spec 015 P0-2 both bit us on this. The rules:

| Where? | What's OK | What's NOT |
|--------|-----------|------------|
| `@PostConstruct` | In-memory init, validation, file-system bootstrap | Network calls, LLM clients, GCP/AWS SDK init that touches credentials |
| `@EventListener(ApplicationReadyEvent.class)` + `@Async` | Anything that should run *after* the app is up. **Use this for ingestion, warmup, indexing.** | (Reminder: `@Async` on `@PostConstruct` is a SILENT NO-OP because PostConstruct bypasses the AOP proxy.) |
| Lazy getter (`private synchronized X getX()`) | Expensive clients that can fail late and that are not needed for `/actuator/health` | Anything required for request-handling correctness — those need eager init |

### Layering

```
Controller → Service → Repository → DB
```

- Controllers contain **no business logic** beyond mapping HTTP ↔ DTO and delegating to a service.
- Services own transactions (`@Transactional`) and orchestrate repositories.
- Repositories are Spring Data interfaces; custom queries via `@Query` or a separate `*RepositoryImpl`.
- No service calls a controller. No repository calls a service. No entity has Spring annotations beyond JPA.

### Configuration

- All externally-tunable knobs live in `application.properties` with `${ENV_VAR:default}` syntax.
- Local overrides live in `application-local.properties` (gitignored). A committed `application-local.properties.example` is the contract.
- Profiles: `local`, `uat`, `prod`. Never branch on `if (env.equals("prod"))` in code — drive everything from properties.

### Logging

- `private static final Logger logger = LoggerFactory.getLogger(MyClass.class);` — exactly this idiom, every class.
- Log levels: `ERROR` for things a human needs to act on; `WARN` for degraded but recoverable; `INFO` for state transitions; `DEBUG` for everything else.
- Never `e.printStackTrace()`. Always `logger.error("context", e)`.

### Testing minimum (registered as spec 016)

Every PR that adds a `*Service.java` must add a `*ServiceTest.java`. Every controller that handles a state-mutating verb (POST/PUT/PATCH/DELETE) gets a `*ControllerTest.java` using `@WebMvcTest`. Test names follow `methodName_condition_expectedOutcome` (e.g. `createUser_whenEmailExists_throwsConflict`).

---

## 4. Frontend (Angular 19) standards

### Environment

- **Angular 19.2+** (not 17, not 18).
- **Node 24 LTS** (enforced via `.nvmrc` and `package.json` `engines.node`). Why: Earlier Angular+Node pairs have proxy middleware incompatibilities.
- **npm 10+** (enforced via `package.json` `engines.npm`).

### Component declaration model

**New components are `standalone: false` if using NgModule, `standalone: true` if standalone.** Spec 015 established `standalone: false` as the default for consistency. Standalone components must be **imported**, never declared (this was spec 015 P0-1).

### State

- Component state in component fields when local; service-backed `BehaviorSubject` when shared across components; route data when navigation-driven.
- No `localStorage` writes outside `services/` — the auth token boundary lives in `AuthService`.

### HTTP

- Always via `ApiService` (or a domain-specific service that wraps `HttpClient`).
- All requests go through `AuthInterceptor` + `TimeoutInterceptor`. Don't bypass with direct `HttpClient` calls.

### Forms

- Reactive Forms for anything non-trivial. `[(ngModel)]` is fine for single-field interactions but requires `FormsModule` in the host module's `imports` (spec 015 P0-1 caught this).

### Bundle hygiene

- Lazy-load feature modules. Initial bundle should stay below 1.5 MB gzipped.
- No `console.log` in committed code. Use the structured logger when one exists; otherwise remove.

### DTO pattern (spec 015)

**Every endpoint returning entities must wrap them in a Data Transfer Object (DTO).** Why:

- Avoids lazy-loading errors: backend sends only the fields the frontend asked for.
- Breaks N+1 query chains: service layer eager-loads the DTO graph.
- Type-safe frontend: DTO types = contract between frontend and backend.
- Safe refactoring: renaming a column doesn't break the API if it's not in the DTO.

**Pattern:**

```java
// Backend service eager-loads only the DTO fields
List<WorkflowDTO> findByCategory(String category) {
    return repo.findByCategory(category).stream()
        .map(w -> new WorkflowDTO(w.id, w.name, w.description))
        .collect(toList());
}

// Controller returns the DTO, never the entity
@GetMapping("/workflows")
public List<WorkflowDTO> list() { return service.findByCategory(...); }

// Frontend receives typed DTOs
interface WorkflowDTO { id: string; name: string; description: string; }
```

See `specs/015-end-to-end-review/spec.md` for the complete pattern, guardrails, and all 20 DTOs currently in use.

---

## 5. Build & Startup Enforcement

### NPM/MVN-only policy (strict)

**Absolute rule: All builds and service launches go through exactly one of two entry points:**

| Layer | Entry Point | Examples | Prohibited |
|-------|-------------|----------|-----------|
| Frontend | `npm` | `npm start`, `npm run build`, `npm run test`, `npm run lint` | Direct `ng serve`, `ng build`, `node`, any `node_modules/.bin` path |
| Backend | `mvn` | `mvn spring-boot:run`, `mvn clean install`, `mvn test` | Direct `java -jar`, `gradle`, `./mvnw`, `java` process launch |

**Why:**

- One toolchain, one behavior: dev machines and CI run identical configs
- No stale artifacts: `mvn spring-boot:run` always builds from source
- Configuration in one place: `package.json` scripts, `pom.xml` goals — not duplicated in launchers
- Auditability: validator can prove compliance

**Enforcement:**

1. **Pre-commit hook** (`.githooks/pre-commit`): Validates all startup scripts before each commit. Violations **block** the commit.
2. **Validator script** (`scripts/validate-startup-scripts.ps1`): Scans code and exits 1 on prohibited patterns.
3. **Manual validation**: `& scripts/validate-startup-scripts.ps1 -Quiet` before pushing.

See `scripts/STARTUP_SCRIPTS_ENFORCEMENT.md` for complete policy, guardrails, and how to add new operations.

### Pre-commit hook setup

**Automatic.** Every clone/pull gets the hook via:

```powershell
git config core.hooksPath .githooks
```

To bypass (emergency only): `git commit --no-verify` (NOT RECOMMENDED).

See `.githooks/README.md` for setup, troubleshooting, and bypass instructions.

---

## 6. Code Review Guardrails

Every PR is checked against these 14 rules. Violations require justification and are escalated to the founder.

### Backend (7 rules)

| Rule | What it catches | Red flag |
|------|---|---|
| **DTO protection** | Endpoint returns bare entity instead of DTO | `@GetMapping public List<Entity>` without DTO |
| **Constructor injection** | Service uses `@Autowired` field injection (spring test blocker) | `@Autowired private MyRepo repo;` |
| **Eager loading** | Service queries without `@EntityGraph` / `select new` cause N+1 | LazyInitializationException in the wild |
| **@Transactional scope** | Transactional wraps a `@PostConstruct` or spawns async work (Spec 015 P0-2) | `@PostConstruct @Transactional` or `@Transactional @Async` |
| **Null handling** | NPE from entity navigation without `.orElse(null)` / `.ifPresent()` | null-pointer crashes in test |
| **Error handling** | `DataInitializer` errors silently because try/catch is missing | Agent seeding fails but app starts; user discovers it in test |
| **Query count** | Heavy endpoint triggers 10+ DB queries (N+1 symptom) | Each entity access does a fresh `select` |

### Frontend (7 rules)

| Rule | What it catches | Red flag |
|------|---|---|
| **Code-splitting** | Feature bundled into `AppModule` instead of lazy-loaded (startup time bloat) | Build: initial bundle > 200 KB unpacked |
| **Bundle size** | Main bundle after minification > 100 KB (breakage on slow networks) | Slow dev-server startup, slow CI builds |
| **Lazy routes** | Feature route not wrapped in `loadComponent` / `loadChildren` | Feature loaded on app-init instead of on-demand |
| **Template logic** | Complex `*ngIf` / calculations in template instead of component | Unmaintainable templates; change detection thrashing |
| **DTO usage** | Component tries to navigate entity graph (API mismatch) | `entity.owner.profile.avatar` breaks when backend removes `profile` |
| **HTTP calls** | Direct `HttpClient` instead of `ApiService`; no `AuthInterceptor` | Requests without auth token |
| **Subscribe management** | Component never unsubscribes; memory leak | Observable still firing after component destroyed |

---

## 8. Scripts (PowerShell)

### ASCII-only

`.ps1` files contain **only ASCII characters**. No em-dashes (`—`), en-dashes (`–`), smart quotes (`""''`), or right-arrow Unicode (`→`). Reason: PS 5.1 with mixed file-encoding heuristics misparses non-ASCII, producing confusing "Try statement is missing its Catch or Finally block" errors (spec 014).

### Layout

- Canonical orchestrator: `spec-kit/scripts/start-all.ps1`
- Per-layer launchers: `spec-kit/scripts/launchers/{backend,frontend,infra}.ps1`
- Per-repo scripts are **thin wrappers** that call the canonical launchers; no duplicated logic.
- Shared helpers in `spec-kit/scripts/lib/*.ps1`.

### Header convention

Every script starts with:

```powershell
#Requires -Version 5.1
<#
.SYNOPSIS
    One-line purpose.
.DESCRIPTION
    Longer description if needed.
.PARAMETER Force
    Document each switch/parameter.
.EXAMPLE
    .\my-script.ps1 -Force
#>
```

### Output

- Use `Write-Host` with explicit `-ForegroundColor` for human-facing messages.
- Prefix every line with the component name: `[Backend]`, `[Frontend]`, etc.
- Never `Write-Output` (it pollutes the pipeline and breaks composability).
- Errors go to `Write-Host -ForegroundColor Red`; always `exit 1` immediately after.

---

## 10. Dependency management

### Backend

- `pom.xml` is the only build descriptor. No `build.gradle`, no `BUILD.bazel`.
- Add a dependency only when it earns its weight. Prefer the smallest scope (`<scope>test</scope>` etc.).
- Spring Boot version bumps go in their own PR.

### Frontend

- `package.json` is the only manifest. `package-lock.json` is committed and authoritative.
- Use exact-match (`"^X.Y.Z"`) — no bare major (`"18"` is invalid; spec 015 P2-7 caught this).
- Peer-dep conflicts go in their own PR, with `--legacy-peer-deps` allowed only when the conflict is documented in a spec.

### Lockfile policy

- `package-lock.json` is committed.
- Maven uses `mvnw` (when present) so the wrapper version is consistent across machines.

---

## 11. Secrets & credentials

- **Never commit a real credential.** Templates use `<PLACEHOLDER>` syntax.
- `application-local.properties` is gitignored. The `.example` sibling is committed.
- Production secrets live in GCP Secret Manager / the env-var injection on the runtime; never in any `.properties` file in the repo.
- The `secrets.encryption.key` dev value is *non-secret-by-design* (decodes to readable ASCII) but should still be regenerated with `openssl rand -base64 32` whenever a developer wants peace of mind. The production key is unrelated and rotated independently.
- Logs must never echo passwords, JWTs, or API keys. Use `***` masking.

---

## 12. Working with AI agents in this repo

(Folded in from the old `AGENTS.md`.)

### Operating principles

- AI agents follow the same SDD workflow as humans. A spec is a spec regardless of who wrote it.
- An agent that modifies code without a spec, or against an existing spec, gets the change reverted.
- Every commit by an agent is signed (Conventional-Commit subject line includes the spec number).

### Allowed agents

- Cascade (Windsurf, this assistant)
- Claude Code
- Anything else: needs explicit founder approval

### Prohibited behaviours

- Disabling tests to make a build green
- Committing credentials of any kind
- Pushing to `main` without a passing CI build (once CI is reinstated under spec 015 P1-7)
- Creating new top-level `.md` files outside `spec-kit/specs/<NNN>-*/`

---

## 13. Lessons learned (curated from old `LEARNINGS.md`)

The chronological story is in git; only durable lessons stay here.

1. **`@PostConstruct + @Async` is a silent no-op.** Use `@EventListener(ApplicationReadyEvent.class)` + `@Async` instead.
2. **Stale env vars survive shells.** Always validate, never just check "is it set".
3. **Em-dashes break PowerShell 5.1 parsing.** ASCII-only in `.ps1`.
4. **JAR launchers must check staleness.** A JAR built before today's source changes is worse than no JAR at all — it runs old code without warning.
5. **Pre-commit hooks must fail closed.** A hook that says "✓ Compilation successful" because `mvn: command not found` is worse than no hook.
6. **Two of anything (constitutions, knowledge bases, launchers) is one too many.** Pick a canonical location and delete the rest.
7. **Standalone vs NgModule components have different declaration semantics.** Imports, not declarations.
8. **Angular `ng serve` binds IPv6-only by default on Windows.** Test-NetConnection lies about it. Use `--host 127.0.0.1`.
9. **NPM peer-dep conflicts need `--legacy-peer-deps` until the underlying mismatch is fixed.** Don't just paper over it; track the fix in a spec.
10. **Two test files for 272 production Java files is not "we have tests".** It's a debt to repay.

---

## 14. Governance

- Changes to this file require a spec.
- The 8 P0/P1 items in spec 015 findings.md must be reflected here before this version is ratified.
- Quarterly review: founder + maintainers re-read this top-to-bottom and prune what's no longer true.
