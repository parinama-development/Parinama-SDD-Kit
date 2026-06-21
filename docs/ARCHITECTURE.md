# Architecture

**Status**: Canonical (supersedes everything in `ai/knowledge/*-spec.md`, `AGENTIC_FRAMEWORK_SPECIFICATION.md`, `AGENTIC_API_DOCUMENTATION.md`, `UI_DESIGN_SYSTEM_SPECIFICATION.md`).
**Scope**: System overview, layered breakdown, integration points. Implementation details live in the per-spec folders.

---

## 1. System overview

AxisTechnologies is a service-marketplace + workflow-execution platform with an embedded agentic layer. There are three deployable pieces:

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser (any modern, evergreen)                                 │
└────────────┬─────────────────────────────────────────────────────┘
             │ HTTPS
             ▼
┌──────────────────────────────────────────────────────────────────┐
│  Frontend (Angular 19 SPA)             axistechnologies-web-shell │
│   - Node 24 LTS, npm 10+                                           │
│   - Lazy-loaded feature modules (Admin, Auth, Public, Workflow,   │
│     IntegrationHub, ServiceHub)                                    │
│   - DTO pattern: all endpoints return typed DTO objects           │
│   - AuthInterceptor + TimeoutInterceptor wrap every HTTP call     │
│   - Chat widget calls GenieChatService                            │
│   - Builds via npm only (npm start, npm build, npm test)          │
└────────────┬─────────────────────────────────────────────────────┘
             │ /api/v1/...
             ▼
┌──────────────────────────────────────────────────────────────────┐
│  Backend (Spring Boot 3.x, Java 17)        axistechnologies-api   │
│   - Maven 3.9+ (builds via mvn only; no gradle, java -jar, etc)  │
│   - 40 controllers / 45 services / 53 repositories / 55 entities  │
│   - DTO pattern: all endpoints return typed DTO objects           │
│   - JWT auth (HMAC HS256, key in env / props)                     │
│   - AES-256 secret-encryption via SecretEncryptionService         │
│   - Agentic layer (spec 013, 014)                                 │
└────┬──────────────────┬─────────────────┬────────────────────────┘
     │                  │                 │
     ▼                  ▼                 ▼
┌──────────┐      ┌──────────┐      ┌────────────────┐
│ Postgres │      │  Redis   │      │ Vertex AI      │
│ (GCP)    │      │ (Upstash │      │ Gemini (GCP)   │
│          │      │  or local)│     │ Embeddings + LLM│
└──────────┘      └──────────┘      └────────────────┘
                                            │
                                            ▼
                                    ┌────────────────┐
                                    │  Qdrant        │
                                    │ (RAG vectors)  │
                                    └────────────────┘

Optional async path:
   Backend ↔ RabbitMQ ↔ async workers (same JVM today; could be split later)
```

The spec-kit repo (`spec-kit/`) is **not deployed** — it holds specs, scripts, and governance docs.

---

## 2. Backend API surface

(Folded in from `ai/knowledge/api-spec.md`.)

### Public endpoints (no JWT)

- `GET  /actuator/health` — liveness (Spring Boot default)
- `GET  /api/v1/public/coming-soon` — product marketing teasers
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh`

### Authenticated endpoints (JWT Bearer required)

Grouped by domain. The full list is in the OpenAPI spec served at `/swagger-ui.html` when the backend is running.

| Domain | Path prefix | Controllers |
|--------|-------------|-------------|
| Auth & users | `/api/v1/auth`, `/api/v1/users`, `/api/v1/user-groups` | `Auth*`, `User*`, `UserGroup*` |
| Service hub | `/api/v1/services`, `/api/v1/service-requests`, `/api/v1/categories` | `Service*`, `Category*` |
| Workflows | `/api/v1/workflows`, `/api/v1/executions` | `Workflow*`, `WorkflowExecution*` |
| Agents | `/api/v1/agents` | `Agent*` |
| Knowledge / Genie | `/api/v1/genie`, `/api/v1/chat` | `Genie*`, `Chat*` |
| Integration hub | `/api/v1/integrations`, `/api/v1/api-manager`, `/api/v1/mq` | `ApiManager*`, `Mq*`, `Kafka*` |
| MCP | `/api/v1/mcp` | `Mcp*` (spec 013) |
| Admin | `/api/v1/admin` | `Admin*` |

**Known issue**: 40 controllers for ~12 user-visible feature areas is too many — spec 015 P2-1 acknowledges this and defers consolidation to a future spec.

### Conventions

- All responses are JSON.
- All `POST`/`PUT` accept and return DTOs (never entities directly).
- All error responses follow `{ "error": "...", "details": "...", "traceId": "..." }`.
- Pagination via `?page=N&size=M`; defaults page=0 size=20.

---

## 3. Agentic layer

(Folded in from `AGENTIC_FRAMEWORK_SPECIFICATION.md`, `AGENTIC_API_DOCUMENTATION.md`, `ai/knowledge/agentic-spec.md`, and specs 013/014.)

### Components

- **Agent**: a JPA entity (`Agent`) with `name`, `description`, `systemPrompt`, `tools[]`, `model`, owner.
- **AgentStateManager**: persists per-execution state to disk (path configured via `agent.state.persistence.path`).
- **WorkflowExecutionService**: orchestrates multi-step agent runs, manages routing decisions.
- **MCP tool surface** (spec 013): unified `/api/v1/mcp/invoke` exposing internal capabilities to LLMs.
- **GenieKnowledgeService**: ingests existing service-hub assets (services, workflows, agents) into Qdrant for RAG retrieval. Runs **after** `ApplicationReadyEvent` via `@Async` (spec 014 fix).

### Execution flow

```
1. Client → POST /api/v1/agents/{id}/execute  with { input, sessionId }
2. AgentController loads Agent, validates, delegates to AgentExecutorService
3. AgentExecutorService:
   a. Builds system prompt + retrieves RAG context (if RAG enabled for this agent)
   b. Calls Vertex AI Gemini (lazy-init client — spec 015 P0-2)
   c. Parses tool-calls from LLM response
   d. For each tool call, dispatches to MCP tool surface
   e. Feeds tool results back to LLM, loops until LLM returns a final answer
   f. Persists execution record + final result
4. Returns { executionId, status, output } to client
```

For long-running agents, the async variant (`/execute-async`) returns immediately with `executionId`; the client polls `/executions/{executionId}`.

### Routing

`WorkflowExecutionService.executeNextStep` (the file the user was reading at line 206) implements **AI-driven routing**: at each branch point in a workflow, the LLM picks the next path based on current state + branch criteria, and the chosen path is appended to `execution_path` in the state JSON for audit.

### Persistence

- Agents, executions, chat messages → Postgres
- RAG vectors → Qdrant
- Agent intermediate state (large blobs) → local FS at `agent.state.persistence.path`
- Redis caches frequent reads (workflows, categories, user lookups)

---

## 4. Data model

(Folded in from `ai/knowledge/data-model-spec.md`.)

55 entities. Highlights:

| Aggregate root | Owns | Notes |
|----------------|------|-------|
| `User` | `UserGroupMembership`, `UserGroupSecret`, `ChatMessage` | JWT subject; role enum |
| `UserGroup` | members, group-scoped secrets | Tenancy boundary |
| `Service` | `Product`, `ServiceRequest`, `Category` | Marketplace listing |
| `Workflow` | `WorkflowStep`, `WorkflowExecution` | Versioned; immutable once published |
| `Agent` | `AgentExecution`, `AgentTool` | Owned by a `User` or `UserGroup` |
| `ApiManager*` | published APIs, subscriptions, tenants | Integration hub |

ID strategy: UUIDv4 strings (`@Id String id = UUID.randomUUID().toString();`). Foreign keys are explicit `String`-typed columns; no `@ManyToOne` lazy proxy nightmares.

Audit columns (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`) are populated by JPA listeners via `AuditableEntity` superclass.

Schema management: **manual SQL migrations**, not Hibernate `ddl-auto`. `spring.jpa.hibernate.ddl-auto=none`. Migrations live in `src/main/resources/db/migration/V*__*.sql` (Flyway-style naming, run manually for now — Flyway integration is a P2 item).

---

## 5. Frontend

(Folded in from `ai/knowledge/frontend-spec.md`, `UI_DESIGN_SYSTEM_SPECIFICATION.md`.)

### Module structure

```
src/app/
├── app.module.ts            ← root; declares shell components, imports lazy-load roots
├── app-routing.module.ts    ← top-level routes (all lazy except auth)
├── components/              ← shared / shell components (Navbar, Footer, ChatWidget)
├── services/                ← cross-cutting (Api, Auth, Storage)
├── interceptors/            ← AuthInterceptor, TimeoutInterceptor
├── guards/                  ← route guards
├── admin/                   ← lazy-loaded feature: Admin
├── auth/                    ← lazy-loaded feature: Auth flows
├── public/                  ← lazy-loaded feature: marketing pages
├── workflow/                ← lazy-loaded feature: workflow management
├── integration-hub/         ← lazy-loaded feature: integrations
└── service-hub/             ← lazy-loaded feature: marketplace
```

### Component model

Mixed today (NgModule-based + 3 standalone components). Going forward all new components are standalone (`ENGINEERING_STANDARDS.md` §4). Migration of existing is opportunistic.

### State

- Component-local: fields + Angular signals where available
- Cross-component: service-backed `BehaviorSubject` (e.g. `AuthService.currentUser$`)
- No NgRx today; the cost of adding it has not been justified

### HTTP

Every request goes through:

1. `AuthInterceptor` — attaches JWT
2. `TimeoutInterceptor` — wraps with RxJS `timeout()` operator (configurable per request)

Direct `HttpClient` calls outside services are not permitted (spec 015 § 4).

### Design tokens

(Captured from old `UI_DESIGN_SYSTEM_SPECIFICATION.md` — to be migrated to a real SCSS tokens file in a future spec.)

Primary palette, typography scale, spacing scale, breakpoints — these need to be moved out of prose into actual `src/styles/_tokens.scss`. Tracked as future debt.

---

## 6. External integrations

(Folded in from `ai/knowledge/integration-spec.md`.)

| System | Direction | Protocol | Why |
|--------|-----------|----------|-----|
| GCP Cloud SQL Postgres | Backend → DB | JDBC | Primary persistence |
| GCP Vertex AI Gemini | Backend → LLM | gRPC (via langchain4j) | All LLM inference |
| Qdrant | Backend → vector store | HTTP | RAG retrieval |
| Redis (Upstash) | Backend → cache | RESP over TLS | Caching frequent reads |
| RabbitMQ (optional) | Backend ↔ broker | AMQP | Async agentic execution |
| GitHub | Backend → API | HTTPS REST | Repo analysis (spec 008 agents) |
| OpenTelemetry | Backend + Frontend → collector | OTLP | Tracing |

All outbound credentials are loaded from env vars / properties; never hardcoded.

---

## 7. Cross-cutting concerns

### AuthN / AuthZ

- JWT (HS256), 10-minute access tokens, refresh-token flow
- `JwtService` signs/verifies; `SecurityConfig` wires the filter chain
- Role enum on `User` drives `@PreAuthorize("hasRole('...')")` annotations on controllers

### Secret encryption

- `SecretEncryptionService` (AES-256-GCM) for at-rest sensitive fields
- Key sourced from `secrets.encryption.key` property (env-var `SECRETS_ENCRYPTION_KEY`)
- 32-byte base64-decoded length is validated at boot (spec 015 P0-4)

### Telemetry

- OpenTelemetry tracing via the Spring Boot starter
- Logs include `traceId` / `spanId` MDC fields (visible in every log line)
- No metrics export today — to be added in OPERATIONS.md follow-up

### Caching

- Redis-backed `@Cacheable` on read-heavy methods
- TTL configured per cache name in `application.properties`

---

## 8. Where this document does NOT go

- **Per-feature behaviour** — that's in `specs/<NNN>-*/spec.md`
- **How to run locally** — `LOCAL_DEV.md`
- **How to deploy** — `OPERATIONS.md`
- **Coding standards** — `ENGINEERING_STANDARDS.md`
