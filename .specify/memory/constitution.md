# Spec-Kit Constitution

## Purpose
This document defines the non-negotiable engineering principles, quality gates, conventions, and governance rules for this workspace. All AI agents and human developers must comply with these rules when generating specs, plans, or code.

**Scope:** Applies to every feature delivered in this workspace and all projects cloned under it.

**Precedence:** If anything in a feature spec, implementation plan, or code conflicts with this document, this document wins. Violations block plan generation.

**Technology Stack:** Technology stack is not governed here — it is captured in AGENTS.md (auto-generated from the actual codebase).

---

## 1. Core Principles

Numbered, non-negotiable rules. Each principle must be testable and enforceable.

1. **Spec-First** — No production code is written without an approved feature spec (spec.md) and implementation plan (plan.md). Exploratory spikes are fine, but must be discarded or re-implemented under a spec before merging.

2. **TDD (Test-Driven Development)** — Tests are written before the implementation they verify. Every functional requirement (FR) and acceptance criterion (AC) must map to at least one automated test.

3. **End-to-End Traceability** — Every FR maps to a concrete file change in the plan; every AC maps to a test case. The full chain is: Issue → Feature Spec → Implementation Plan → Commits → Tests → Change Summary. Gaps at any link are blockers, not warnings.

4. **Backward Compatibility** — Public APIs, DTOs, and persisted data schemas evolve additively. Breaking changes require an explicit, documented migration plan and stakeholder sign-off.

5. **Single Source of Truth** — Shared knowledge lives in `spec-kit/ai/knowledge/` and is updated by the knowledge integration workflow. Do not duplicate domain facts across feature specs.

6. **No Secrets in Code** — Credentials, tokens, and PII never enter Git. Use local.config (gitignored) or the approved secrets manager.

7. **Small, Reviewable Changes** — A Merge Request addresses one issue. Prefer multiple focused MRs over one large MR.

8. **Acceptance Criteria are Immutable** — ACs in feature specs must be preserved verbatim from the issue tracker. Never rephrased, reordered, or summarized.

9. **Concrete References Only** — Implementation plans must contain actual file paths, exact method names, and approximate line numbers. No placeholders (TBD, {path}, etc.).

10. **Permanent Retention** — All feature documents (spec.md, plan.md, change-summary.md) and change-log entries are retained permanently in the `spec-kit/` repository.

11. **No Invented Knowledge** — An agent shall not invent or assume any knowledge. If gaps, ambiguities, or contradictions are identified, the agent must ask a clarifying question and never assume or invent the answer. All facts must be traced to and backed by objective evidence.

---

## 2. Quality Gates

Hard gates. CI and/or the implementation workflow must verify these before an MR is eligible for merge.

| Gate | Check | Blocking? |
|------|-------|----------|
| Unit Tests | All unit tests pass locally and in CI | YES |
| E2E / Integration Tests | All E2E tests pass where applicable | YES |
| Cross-Project Verification | Full test suite across all impacted projects passes | YES |
| Lint / Format | Project linter and formatter pass with zero errors | YES |
| Type Check | Static type check passes (where the language supports it) | YES |
| Build | Project builds cleanly with no new warnings introduced by the change | YES |
| Coverage | New/changed code meets the project's coverage threshold | YES |
| Traceability | Every FR → file change, every AC → test case | YES |
| Open Questions | No unresolved open questions, unverified assumptions, or invented facts in spec/plan — every claim traces to objective evidence | YES |
| Secrets Scan | No secrets, tokens, or credentials committed | YES |
| Post-Implementation Validation | Every FR is implemented, every AC is met with traceable test evidence, scope boundaries respected, NFRs satisfied, Definition of Done checklist passes | YES |
| Automated Self-Review | Git diff reviewed for unintended changes, secrets, and debug code | YES |
| Constitution Compliance | Plan and code comply with every principle above | YES |

---

## 3. Workspace Standards

Every workspace must contain the following. The `spec-kit/` directory is the
self-contained SDD framework repository — it holds the `.specify/` engine,
IDE configs (`.windsurf/`, `.claude/`), the constitution, knowledge base, and
all feature artifacts.

| Requirement | Path | Purpose |
|-------------|------|---------|
| SDD Framework Repository | spec-kit/ (Git submodule) | Self-contained spec-driven development framework: `.specify/` engine, `.windsurf/` + `.claude/` IDE configs, constitution, knowledge base, feature specs |
| AI Knowledge Repository | spec-kit/ai/ | Structured knowledge base: domain docs, AI-generated specs, feature artifacts |
| Workspace Context File | spec-kit/AGENTS.md | Full project context for AI agents (tech stack, build commands, DB schema, API prefix rules) |
| Secondary Memory | spec-kit/LEARNINGS.md | Persistent cross-session AI memory — gotchas, recipes, learnings |
| Personal Access Tokens | local.config (workspace root, gitignored) | Issue tracker PAT, Git PAT, optional documentation PAT and parent page URL |
| Human Domain Docs | spec-kit/ai/raw/ | Human-authored domain documentation (input to knowledge generation) |
| AI-Generated Specs | spec-kit/ai/knowledge/ | 8 application spec documents — regenerated quarterly or after major changes |

After every feature merge, `spec-kit/AGENTS.md`, `spec-kit/ai/knowledge/`, and
`spec-kit/LEARNINGS.md` must be updated (via knowledge integration workflow).

---

## 4. Feature Development Standards

### 4.1 Feature Artifacts

Every feature must produce its documents in `spec-kit/specs/NNN-slug/` (zero-padded
sequential number + kebab-case slug, e.g. `spec-kit/specs/011-share-feedback-agentic/`):

| Document | Path | Contents |
|----------|------|----------|
| spec.md | spec-kit/specs/NNN-slug/spec.md | 10 mandatory sections: Header, Overview, Background, Scope, Functional Requirements, Acceptance Criteria, NFRs, Impacted Areas, Open Questions, Definition of Done |
| plan.md | spec-kit/specs/NNN-slug/plan.md | Actual file paths, exact method names, approximate line numbers, TDD implementation order, "Files NOT to Modify" section |
| change-summary.md | spec-kit/specs/NNN-slug/change-summary.md | Per-project impact tables, test results, commit hashes, verification checklists, and PR links (project + URL + status) |

The primary spec file is named `spec.md` (not `specs.md`). Both `spec.md` and
`plan.md` must be reviewed and approved before coding begins.

### 4.2 Issue Tracker Integration

Issues follow a 5-state workflow: Proposed → Defining Details → Ready for Dev → In Development → Complete.

Structured summary comments must be posted at pre-implementation and post-implementation milestones.

### 4.3 Human Review Checkpoints

The development workflow must pause at exactly 3 checkpoints:

| # | After | Reviewer | Purpose |
|---|-------|----------|---------|
| 1 | Feature spec generation | Team Lead | Reviews and approves specs.md — validates scope aligns with feature intent and spec is ready for development |
| 2 | Implementation plan generation | Developer (author) | Reviews and approves plan.md — confirms file changes, TDD order, and traceability |
| 3 | MR creation | At least one team member (not the author) | Reviews code diffs in Git hosting platform |

Before Checkpoint 1, the AI agent must attempt up to 3 iterations of autonomous clarification to self-resolve ambiguities.

### 4.4 Spec Requirements

#### 4.4.1 Quality Rules

- **Functional Requirements:** Atomic (one testable behavior per row), testable (clear pass/fail outcome), traceable (source column references issue tracker or app-spec), implementation-free (no code-level constructs)
- **Acceptance Criteria:** Preserved verbatim from issue tracker, never rephrased, reordered, or summarized
- **Success Criteria:** User-focused, technology-agnostic (no database/framework names), measurable and verifiable, business-oriented
- **Scope:** Both "In Scope" and "Out of Scope" lists must be non-empty

#### 4.4.2 Quality Validation

Before proceeding to implementation, all 8 checks must pass:

| # | Check | PASS Criteria |
|---|-------|--------------|
| 1 | No implementation details leaked | No code-level constructs in requirement statements; code references only in Impacted Areas |
| 2 | All FRs are testable | Every FR has a clear pass/fail outcome — no vague language |
| 3 | Success criteria are technology-agnostic | No database, framework, or infrastructure names in NFRs |
| 4 | Scope is clearly bounded | Both In Scope and Out of Scope lists are non-empty |
| 5 | All FRs have sources | Every FR row has a traceable Source column |
| 6 | Acceptance criteria preserved | Issue tracker acceptance criteria appear verbatim (not paraphrased) |
| 7 | No orphan requirements | Every FR maps to at least one entry in the Impacted Areas table |
| 8 | Open questions are genuinely open | No question can be answered from existing issue/codebase/spec evidence; no facts are invented or assumed — agent must surface gaps as clarifying questions |

---

## 5. Agentic Workflow Standards

### 5.0 Agentic Task & Workflow Patterns

| Pattern | Rule |
|---------|------|
| **3-Task Architecture** | Agentic workflows typically follow: Task 1 (Review/Analyze) → Task 2 (Act/Execute) → Task 3 (Notify/Thank). All three tasks are automatically created in sequence; agents are assigned to each. Confidence thresholds (85%, 85%, 1%) control auto-progression. |
| **Approval Checkpoints** | Store in `approvalCheckpoints` field as JSON: `[{"taskId":"uuid","minConfidence":85}]`. Confidence > threshold = auto-proceed; confidence ≤ threshold = human intervention required. Default minimum confidence: 99% (conservative; override per task). |
| **Confidence-Based Routing** | When a task is completed, `resumeAgenticLoopAfterCheckpoint()` re-enters the agent to evaluate the next task. If agent confidence exceeds checkpoint threshold, skip human review. Otherwise, task remains open for human action. |
| **Agent Assignment** | Use explicit agent creation with `.orElseGet()` fallback (never assume agents exist). Assign to all workflow tasks in `ensureAgenticTasksHaveAgents()` before any workflow execution. Agents must be saved `@Transactional` before referencing in collections. |
| **Task Completion Trigger** | When a task reaches terminal status (COMPLETED, APPROVED, CLOSED), call `startNextTask()` and `resumeAgenticLoopIfCheckpoint()` to advance the workflow and optionally re-enter the agentic loop. |

---

## 6. Version Control Conventions

### 6.1 Branching

- Default branch: `main` (release/protected)
- Active development branch: `agentic` — all features are developed on this long-lived branch
- No per-feature branches are required; features are sequenced on `agentic`
- Never force-push to `main` or `agentic`
- Never commit directly to `main`
- Hosting: GitHub (`github.com/axistechnologies-ai`)
- A pre-push hook enforces pull-before-push on all three repos. If a push is blocked because the remote is ahead, run `git pull --rebase origin <branch>` then push again

### 6.2 Commit Messages

- Format: `type(scope): description` (Conventional Commits), e.g. `feat(spec-kit): self-contained restructure`
- When the change is AI-assisted, append a trailer:
  `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
- Operational commits outside a feature workflow use the `chore` type

### 6.3 Pull Requests

- Title format: `type(scope): summary`
- PRs target `main` from the `agentic` branch — never the reverse
- Wrap-up must verify every PR is merged before considering a feature complete — open PRs halt the workflow

### 6.4 Code & Design

- Follow existing patterns in the target project. Prefer extending over rewriting
- Public APIs (REST, gRPC, DTOs) are documented in `spec-kit/ai/knowledge/api-spec.md`
- Data model changes are reflected in `spec-kit/ai/knowledge/data-model-spec.md` before implementation

### 6.5 Documentation Paths

- Feature specs: `spec-kit/specs/NNN-slug/spec.md`
- Implementation plans: `spec-kit/specs/NNN-slug/plan.md`
- Change summaries: `spec-kit/specs/NNN-slug/change-summary.md`

---

## 7. Documentation & Publishing Standards

A documentation page (13 sections, standardized structure) must be published for every completed feature (when documentation platform is configured via local.config).

Every documentation page must include a sequence diagram showing the primary happy-path flow with real class names.

---

## 8. Error Handling Standards

| Category | Behavior |
|----------|----------|
| **Blocking** | Build failures, test failures (after 3 retries), open MRs during wrap-up, missing specs — halts the workflow |
| **Non-Blocking** | Issue tracker API failures, documentation platform API failures, Git hosting MR creation failures, knowledge update failures — logs a warning and continues |

---

## 9. Code Quality Standards

### 8.1 Code Organization
- **Modularity**: Code must be organized into logical, reusable modules with clear responsibilities
- **Naming Conventions**: Use descriptive, consistent naming for variables, functions, and classes
- **File Structure**: Maintain a hierarchical directory structure that reflects the logical organization of the codebase
- **Documentation**: All public APIs must include inline documentation explaining purpose, parameters, and return values

### 8.2 Code Style & Linting
- **Automated Formatting**: All code must pass automated linting and formatting tools
- **Style Guides**: Adhere to language-specific style guides (e.g., PEP 8 for Python, ESLint for JavaScript)
- **Complexity Limits**: Functions should be concise (max 50 lines without comments); break complex logic into smaller functions
- **DRY Principle**: Eliminate code duplication; extract common patterns into reusable utilities

### 8.3 Code Review Standards
- **Peer Review Required**: All code changes must be reviewed by at least one other developer
- **Review Checklist**: Reviewers must verify code quality, test coverage, documentation, and adherence to standards
- **Comment Resolution**: All review comments must be addressed before merge
- **Approval Threshold**: Code cannot be merged without explicit approval from assigned reviewers

### 8.4 Technical Debt Management
- **Tracking**: Use issue tracking to document and prioritize technical debt
- **Regular Refactoring**: Dedicate 20% of sprint capacity to addressing technical debt
- **Deprecation Policy**: Follow semantic versioning; clearly mark deprecated features with a 2-release deprecation window
- **Architecture Reviews**: Conduct quarterly architecture reviews to identify and address systemic issues

### 8.5 Testing Standards
- **Minimum Coverage**: Maintain a minimum of 80% code coverage across all projects
- **Critical Path Coverage**: 100% coverage for security, authentication, and payment-related code
- **Branch Coverage**: Test both success and failure paths for conditional logic
- **Test Types**: Unit tests (70%), Integration tests (20%), E2E tests (10%)
- **Test Quality**: Tests must be clear, independent, reliable, and fast

### 8.6 Performance Requirements
- **Core Web Vitals**: LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1
- **API Performance**: 95th percentile response time ≤ 200ms for read operations
- **Database Performance**: 95th percentile query execution ≤ 100ms
- **Frontend Performance**: Initial JS bundle ≤ 170KB gzipped, CSS bundle ≤ 50KB gzipped

### 8.7 Accessibility Standards
- **WCAG 2.1 AA Compliance**: All public-facing interfaces must meet or exceed WCAG 2.1 AA
- **Keyboard Navigation**: Full functionality must be accessible via keyboard alone
- **Screen Reader Support**: All content must be properly labeled and structured for screen readers
- **Color Contrast**: Minimum 4.5:1 contrast ratio for text; 3:1 for graphics

---

## 10. Technology-Specific Coding Standards

These rules are non-negotiable for this workspace. Violating them causes runtime errors or build failures that require a cleanup pass.

### 10.1 Java / Spring Boot

| Rule | Detail |
|------|--------|
| **JPA derived query naming** | Use underscore `_` notation to traverse `@ManyToOne` relationships: `findByUser_Id()` not `findByUserId()`. The latter causes `Unable to locate Attribute` at runtime. |
| **No @Value in constructors** | `@Value` fields are null during constructor execution. Always move initialization logic that needs `@Value` fields to a `@PostConstruct` method. |
| **Entity timestamps** | All entities manage `createdAt`/`updatedAt` via `@PrePersist`/`@PreUpdate`. Never call `setCreatedAt()` or `setUpdatedAt()` from services or controllers — the setters do not exist. |
| **API endpoint prefix** | All new REST controllers must be under `/api/v1/`. The agentic controllers (`/api/agents`, `/api/workflow-executions`) are a legacy exception — do not replicate this pattern. |
| **Task completion endpoint** | Task status updates use `PUT /api/v1/task-instances/{id}/status` with JSON body `{"status":"COMPLETED"}`. Calling `PUT /api/v1/task-instances/{id}` returns 405 Method Not Allowed. Always verify the full endpoint path in the controller `@PutMapping` annotation before testing. See `TaskInstanceController.java` line 59. |
| **Spring Security 401 vs 403** | Spring Security 6 returns 403 by default for unauthenticated requests. Always add an explicit `AuthenticationEntryPoint` returning `SC_UNAUTHORIZED (401)` in `SecurityConfig`. |
| **NoResourceFoundException → 404** | Spring 6 throws `NoResourceFoundException` for unmatched routes. Without an explicit handler in `GlobalExceptionHandler`, it falls to the catch-all and returns 500. Add `@ExceptionHandler(NoResourceFoundException.class)` returning 404. |
| **Nullable Integer unboxing** | JPA nullable `Integer` fields (e.g., `sequenceOrder`) must never be unboxed to `int` without a null check — it throws `NullPointerException` at runtime. Always check `if (field == null)` first. |
| **Delete validation — 409 CONFLICT** | Before deleting any entity, query for all referencing records across every FK relationship. If any exist, throw `ResponseStatusException(HttpStatus.CONFLICT, descriptiveMessage)` listing entity names. Never silently cascade-delete data the user didn't intend to remove. See LEARNINGS.md for the full pattern. |
| **Agent assignment persistence** | When assigning agents to workflow tasks, use explicit creation logic with fallback (`.orElseGet()` pattern). Agent creation must happen within `@Transactional` boundaries and saved before reference. Never rely on transitive saves through collections. See `DataInitializer.ensureAgenticTasksHaveAgents()` for the canonical pattern. |
| **Approval checkpoints with confidence** | Store approval checkpoint configuration as JSON array `[{"taskId":"uuid","minConfidence":85}]` in the `approvalCheckpoints` field. Minimum confidence values (1-100) determine auto-resolution thresholds. Task completion triggers `resumeAgenticLoopAfterCheckpoint()` which resumes the agentic decision loop. See `ApprovalCheckpointConfig.java` and `TaskInstanceService.performUpdateTaskStatus()`. |
| **LangChain4j OllamaChatModel** | Use `OllamaChatModel.builder().baseUrl(...).modelName(...).temperature(...).build()`. Cache the model instance — do not create a new one per request. For conversation history, use `model.generate(List<ChatMessage>)` with `SystemMessage.from()`, `UserMessage.from()`, `AiMessage.from()`. |
| **Qdrant Java Client 1.7.1** | Factory method is `QdrantGrpcClient.newBuilder(host, port, useTls)`. API key is `builder.withApiKey(apiKey)`. Do not use `QdrantOuterClass.*` — these classes do not exist in this version. |
| **No Spring AI dependency** | `spring-ai-*` milestone artifacts are not on Maven Central. Use LangChain4j for all LLM integration. Do not add Spring AI unless the Spring Milestone repo is explicitly configured. |
| **RabbitMQ + Erlang** | RabbitMQ 4.3.x requires Erlang 27.x. Erlang 29.x is incompatible. Startup script at `C:\Users\Tousif\tools\start-infra.ps1` handles this. |
| **@PreAuthorize on write endpoints** | All POST, PUT, PATCH, and DELETE endpoints must use `@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")`. Using `isAuthenticated()` on write endpoints allows any logged-in user to mutate data. Read-only GET endpoints may use `isAuthenticated()`. Verify: `grep -B2 "@DeleteMapping\|@PostMapping\|@PutMapping" axistechnologies-api/src/main/java --include="*.java" -r \| grep "PreAuthorize"` — all results must contain `hasAnyRole`. |
| **Constructor injection — no @Autowired** | All Spring components (controllers, services) must use constructor injection. `@Autowired` on fields is banned — it hides dependencies, prevents `final` fields, and breaks unit tests. Verify: `grep -rn "@Autowired" axistechnologies-api/src/main/java/com/axistechnologies/axis/controller/ --include="*.java"` must return 0 lines. |
| **Delete returns 409 CONFLICT, not 400** | The HTTP status for a referential integrity delete block is `HttpStatus.CONFLICT` (409), not `badRequest()` (400). 400 implies a malformed request; 409 correctly signals a state conflict. Verify: `grep -rn "badRequest().*Cannot delete" axistechnologies-api/src/main/java --include="*.java"` must return 0 lines. |

### 10.2 Angular / TypeScript

| Rule | Detail |
|------|--------|
| **No CSS gradients** | `linear-gradient` and `radial-gradient` are banned in component CSS. Use flat design tokens. `--color-primary-gradient` is deprecated. |
| **CSS design token names** | Always use fully namespaced `--color-*` tokens. Old shorthands (`--primary`, `--card-bg`, `--bg-secondary`, `--text-secondary`, `--border-color`, `--text-primary`) do not exist — they silently fall back to browser defaults. Correct names: `--color-primary`, `--color-white`, `--color-background-alt`, `--color-text-secondary`, `--color-text-primary`, `--color-border`. |
| **CSS class coverage** | Before committing, verify every CSS class referenced in HTML is defined in the component's CSS. Missing classes render as raw browser-default unstyled elements with no compile-time error. |
| **Page banners** | Always use `<app-page-banner>` (in `SharedModule`). Never create custom `.page-header` div elements. |
| **Icons — SVG attributes** | All buttons, nav links, and interactive elements must have inline Feather-style SVG icons. No emoji, no Unicode arrows, no icon fonts. All SVGs: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `stroke-width="1.75"`. |
| **SVG stroke-width** | Must be `"1.75"` everywhere — never `"2"`. Applies to card icons, button icons, close buttons, and nav icons. |
| **Button icon requirement** | Every action button (create, edit, delete, cancel, save, execute) must contain an SVG icon. Text-only buttons are not acceptable. Buttons must use `display: inline-flex; align-items: center; gap: 0.375rem`. |
| **Button color semantics** | Add/Create/New/Save buttons → primary blue (`--button-primary-background`). Green (`--color-success`) is only for Execute/Run/AI Routing actions and status indicators. Never use green for add/save. |
| **Delete error pattern** | Store server-side delete validation errors in `deleteErrorMessage: string` component state. Display as a dismissible inline banner using the pattern in LEARNINGS.md. Never use `alert()` for server validation errors. |
| **AutomationType dropdown** | Always hardcode the dropdown options with backend enum string values (`GITLAB_PIPELINE`, `REST_API`, `SFTP`, `DB_ENDPOINT`, `SHELL_SCRIPT`, `PYTHON_SCRIPT`). Never populate from category names — `AutomationType.valueOf(displayName)` throws on the backend. |
| **Task field naming** | Task API response uses `taskCategoryId` and `taskCategoryName` — not `taskType`. When binding task category display in templates, use `task.taskCategoryName`. |
| **Task ID references in tables** | Display task reference numbers (`TK-STD-###`, `TK-AGENTIC-###`) in task lists using `task.referenceNumber`. Do not use sequence numbers. Format: `{{ task.referenceNumber \|\| '—' }}` for null safety. Allows users to track tasks across their lifecycle. |
| **Tools Required multi-select UI** | Replace manual JSON text input with checkbox interface. Load agentic tools dynamically from `/api/v1/categories/AGENTIC_TOOLS`. Preserve existing tool selections bidirectionally: parse JSON to checkbox state on open, stringify checkbox selections back to JSON on save. Use CSS pattern: `.tools-required-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 200px; overflow-y: auto; }`. See `workflow-management.component.ts` for the canonical pattern (`loadAgenticTools()`, `isToolSelected()`, `toggleTool()`). |
| **Card hover pattern** | Use the canonical `::after` accent bar pattern from LEARNINGS.md. Do not invent new hover styles. |
| **Standalone components** | Standalone components must declare `SharedModule` in their own `@Component imports` array — they cannot inherit from AppModule. Do not add standalone components to `AppModule.declarations`. |
| **SVG via innerHTML** | Use `DomSanitizer.bypassSecurityTrustHtml()` for SVG strings rendered via `[innerHTML]`. Only for trusted static SVG strings — never for user-supplied content. |
| **Build verification** | Always run `ng build` (not `tsc --noEmit`) to verify Angular templates. `tsc` does not catch template errors like unknown selectors or missing structural directives. |
| **ApiService base constants** | Standard endpoints: `this.BASE = ${environment.apiUrl}/api/v1`. Agentic endpoints (legacy): `this.AGENTIC = ${environment.apiUrl}/api`. Use the correct base when adding new API calls. |
| **Chat widget** | Genie chatbot is live — do not revert to "coming soon" state. Session ID key in `localStorage`: `genie_session_id`. |
| **Pending Approvals** | Human-in-the-loop panel lives in Task Management — do not create a separate route. |
| **OnDestroy + takeUntil** | Every component that holds subscriptions must implement `OnDestroy`. All `.subscribe()` calls must be wrapped with `.pipe(takeUntil(this.destroy$))`. See `spec-kit/templates/angular-component.scaffold.ts` for the canonical pattern. Verify: every `.ts` file containing `.subscribe(` must also contain `takeUntil(this.destroy$)`. Missing `OnDestroy` is a memory leak. |
| **No alert() in components** | `alert()` is banned. Replace with an inline `errorMessage: string` field and a dismissible HTML banner. Verify: `grep -rn "alert(" frontend/src/app --include="*.ts" \| grep -v "//.*alert("` must return 0 lines. |
| **No console.log in committed code** | `console.log` is banned from committed `.ts` files. Use temporary local-branch logging only; always remove before PR. Verify: `grep -rn "console\.log" frontend/src/app --include="*.ts" \| grep -v "//.*console"` must return 0 lines. |
| **Modal state reset before open** | Always reset all filter/data arrays and selection state at the top of an `open*Modal()` method before assigning the new context. Never rely on prior state carrying over. See LEARNINGS.md "Modal State Reset Before Open" for the pattern. |
| **Capture entity ID before async** | When iterating and firing HTTP calls, capture `const id = this.selectedEntity?.id` before any `.close*Modal()` call. HTTP callbacks fire after modal-close nulls the reference. See LEARNINGS.md "Capture Entity ID Before Async Operations". |
| **Separate loading flags per section** | Use a dedicated `xxxLoading: boolean` flag per independent data section (tabs, panels). Using the global `loading` flag for section refreshes causes full-page spinner flicker. See LEARNINGS.md "Separate Loading Flags Per Data Section". |
| **No ReactiveFormsModule unless used** | Do not import `ReactiveFormsModule` in a component's module unless the component actually uses `FormGroup`/`FormControl`. Unused imports bloat the bundle and mislead reviewers. |
| **Breadcrumb path key** | `breadcrumbItems` entries must use `path` (not `url`) for the navigation property. `BreadcrumbComponent` reads `item.path`. |
| **takeUntil in forEach loops** | Having `destroy$` at the component level is NOT sufficient for subscriptions opened inside `forEach` loops. Each iteration creates an independent subscription that must also pipe through `takeUntil(this.destroy$)`. See LEARNINGS.md "takeUntil Inside forEach Loops". |
| **Frontend-backend endpoint alignment** | Every `api.service.ts` method must call a real backend endpoint. Before adding a new service method, verify the corresponding `@RequestMapping` path exists in a controller. Phantom methods that call 404 endpoints silently return empty data. See LEARNINGS.md "Frontend-Backend Endpoint Alignment". |
| **Stub buttons must be disabled** | Any button that renders in the UI but has no `(click)` handler must carry `disabled` attribute and `title="Coming soon"`. Clickable-looking buttons that do nothing are worse than not showing them. |
| **Shared service cache** | Components must call shared service methods (e.g. `IntegrationHubService.checkProductSubscription()`) rather than the underlying API directly. Direct API calls bypass `shareReplay` caches and duplicate HTTP calls. |
| **var(--color-background) does not exist** | The documented background token is `var(--color-background-alt)`. The token `var(--color-background)` is undefined — it silently falls back to transparent/browser default. Verify: `grep -rn "var(--color-background)" frontend/src/app --include="*.css" \| grep -v "color-background-alt"` must return 0 lines. |

### 10.3 Database / Flyway

| Rule | Detail |
|------|--------|
| **Migration naming** | Format: `V{major}.{minor}.{patch}__{description}.sql`. Current sequence: V1–V7.0.x (pre-agentic), V8.0.0 (agentic tables), V8.0.1 (chat_messages). Next migration must be V8.0.2 or higher. |
| **Local dev** | Flyway is disabled locally (`spring.flyway.enabled=false`). Hibernate `ddl-auto=update` handles schema. Flyway only runs on Neon (dev/UAT/prod). |
| **H2 compatibility** | Migration SQL must be compatible with both H2 (local) and PostgreSQL (Neon). Avoid PostgreSQL-only functions (e.g., `gen_random_uuid()` works in H2 2.x and PostgreSQL 14+). |

---

## 11. Amendment Process

This constitution changes only via an explicit, reviewable process.

1. Open an issue proposing the amendment (rationale, impact, migration)
2. Update `speckit.constitution` on the `agentic` branch
3. Create a PR targeting `main`. Reviewers: Team lead + at least one senior engineer
4. On merge, run the knowledge integration workflow so downstream skills pick up the change
5. Mirror the updated constitution into `.specify/memory/constitution.md` so plan-time constitution checks stay in sync

---

**Last Updated**: 2026-06-09
**Version**: 3.1.0
**Repository**: https://github.com/axistechnologies-ai/spec-kit

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.1.0 | 2026-06-09 | **MINOR**: Added Section 5 (Agentic Workflow Standards), new task completion endpoint standard, agent assignment persistence pattern, approval checkpoint configuration, Tools Required multi-select UI pattern, Task ID reference display standard. Includes learnings from comprehensive agentic workflow validation and testing (2026-06-09). |
| 3.0.0 | 2026-06-04 | Full code quality standards, authorization, caching, performance, accessibility standards |
| 2.4.0 | Earlier | Core principles, quality gates, feature development workflow |
