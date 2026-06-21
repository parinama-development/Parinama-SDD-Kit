# Operations

**Status**: Canonical (supersedes `ai/knowledge/deployment-spec.md`, `ai/knowledge/nfr-spec.md`, `ai/knowledge/security-spec.md`, `ai/knowledge/POD.md`, parts of `guides/STARTUP_OPTIMIZATION_GUIDE.md` and `guides/RABBITMQ_DEPLOYMENT_POLICY.md`).
**Audience**: Anyone deploying, monitoring, or incident-responding for the AxisTechnologies stack.

---

## 1. Deployment

(Folded in from `ai/knowledge/deployment-spec.md` and `axistechnologies-api/.deployment-checklist.md`.)

### Environments

| Environment | Backend | Frontend | DB | Notes |
|-------------|---------|----------|-----|-------|
| `local` | `java -jar` or `mvn spring-boot:run` | `ng serve` | GCP UAT Cloud SQL (shared) | Spec 015 P0-5 template auto-copied |
| `uat` | GCP Cloud Run | Firebase Hosting | GCP UAT Cloud SQL | Promotion from `main` after manual smoke test |
| `prod` | GCP Cloud Run | Firebase Hosting | GCP PROD Cloud SQL | Tagged release only; manual approval gate |

### Backend container

`axistechnologies-api/Dockerfile` is a 14-line multi-stage:

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
COPY . .
RUN mvn package -DskipTests -q

FROM eclipse-temurin:17-jre
COPY --from=build target/axis-marketing-website-*.jar /app.jar
ENTRYPOINT ["java","-jar","/app.jar","--spring.profiles.active=prod"]
```

Build + push:

```powershell
cd axistechnologies-api
docker build -t gcr.io/axistechnologies-uat/api:$(git rev-parse --short HEAD) .
docker push gcr.io/axistechnologies-uat/api:$(git rev-parse --short HEAD)
```

### Frontend

```powershell
cd axistechnologies-web-shell/frontend
npm ci --legacy-peer-deps
ng build --configuration production
firebase deploy --only hosting --project axistechnologies-uat
```

### Pre-deploy checklist

Replaces `axistechnologies-api/.deployment-checklist.md`:

- [ ] Local smoke test passes (`./spec-kit/scripts/start-all.ps1` + manual login + key user flows)
- [ ] CI green on `main` (once CI is reinstated — spec 015 P1-7)
- [ ] All P0 items in the active spec are closed
- [ ] Database migrations applied to target environment
- [ ] Secrets present in Secret Manager (no env-var-only config in prod)
- [ ] Rollback plan written (previous image tag noted)
- [ ] Tag the release: `git tag -a v<MAJOR>.<MINOR>.<PATCH> -m "..."` and push

---

## 2. Non-functional requirements

(Folded in from `ai/knowledge/nfr-spec.md`.)

### Cold-start budget

- Backend boot to `/actuator/health` returning 401 (auth-enforced): **≤ 45 s** on standard Cloud Run (2 vCPU, 2 GiB).
- Genie knowledge-base ingestion runs async post-boot; does not count against cold-start.
- Frontend first paint: **≤ 2 s** on a 10 Mbps connection (cache-cold).

If a deploy regresses these, file a perf spec.

### Latency targets

| Endpoint class | p50 | p95 |
|----------------|-----|-----|
| Cache-hit reads | < 50 ms | < 150 ms |
| DB-backed reads | < 200 ms | < 500 ms |
| Agent execute (sync, no LLM) | < 300 ms | < 1 s |
| Agent execute (sync, with LLM) | < 5 s | < 15 s |

### Throughput

Not load-tested. We're a small-user product; today's bottleneck is the LLM, not the JVM. A real load test is a P3 spec when traffic warrants.

### Availability

- UAT: best-effort, no SLA
- Prod: 99.5% monthly (single-region for now)

---

## 3. Team & ownership

(Folded in from `ai/knowledge/POD.md`.)

| Area | Primary | Backup |
|------|---------|--------|
| Backend (Spring Boot) | Tousif | (none yet) |
| Frontend (Angular) | Tousif | (none yet) |
| Spec-kit / governance | Tousif | (none yet) |
| GCP infrastructure | Tousif | (none yet) |

Single-driver project today. The standards in `ENGINEERING_STANDARDS.md` are designed to make handoff fast when the team grows.

### Incident response

1. **Detect**: Cloud Run errors → alert email; manual user reports → Slack
2. **Triage**: check `/actuator/health`, recent deploy, recent commits
3. **Rollback**: re-deploy the previous image tag (recorded in `Pre-deploy checklist` step 6)
4. **Root cause**: open an incident-NNN spec with timeline + fix

---

## 4. Security posture

(Folded in from `ai/knowledge/security-spec.md`.)

### Authentication

- JWT HS256, 10-minute access, refresh-token rotation
- Refresh tokens stored hashed in `RefreshToken` entity
- Tokens revoked on logout, password change, suspicious activity

### Authorisation

- Role-based (USER, ADMIN, SYSTEM) on `User`
- `@PreAuthorize` at the controller layer for coarse-grained checks
- Service-layer entitlement checks for fine-grained (e.g. user can only edit their own workflows)

### Secret management

- **Prod**: GCP Secret Manager, injected as env vars by Cloud Run
- **UAT**: same
- **Local**: `application-local.properties` (gitignored). Template in `application-local.properties.example` uses placeholders. Spec 015 P0-5.

### Data at rest

- DB: Cloud SQL encryption at rest (GCP-managed keys)
- Sensitive entity fields (e.g. `UserGroupSecret.secretValue`) wrapped via `SecretEncryptionService` (AES-256-GCM)
- Encryption key: env var `SECRETS_ENCRYPTION_KEY`, base64 of 32 bytes. Validated at boot (spec 015 P0-4).

### Data in transit

- HTTPS everywhere (Cloud Run + Firebase enforce it)
- Internal service-to-service traffic in GCP also TLS

### Audit & compliance

- All state-mutating endpoints log `userId`, `action`, `resourceType`, `resourceId`, `timestamp`
- Logs retained 90 days (UAT) / 1 year (prod)
- No PII in URL paths or query strings

### Known gaps (registered as future specs)

- No CSP headers on the frontend
- No rate-limiting on auth endpoints (brute-force exposure)
- No automated dependency vulnerability scanning
- Penetration test not performed

---

## 5. Message broker policy (RabbitMQ)

(Folded in from `guides/RABBITMQ_DEPLOYMENT_POLICY.md`.)

### When required

RabbitMQ is **mandatory in prod** for the async agentic execution path. It is **optional in local/UAT** — the backend falls back to direct thread invocation when `rabbitmq.enabled=false`.

### Topology

- One exchange `axis.agent.exchange` (direct)
- Queue `axis.agent.execution` bound with routing-key `agent.execute`
- DLQ `axis.agent.execution.dlq` after 3 failed deliveries

### Provisioning

Prod: managed RabbitMQ (CloudAMQP or self-hosted on GCE). Confirm `RABBITMQ_HOST`, `RABBITMQ_USERNAME`, `RABBITMQ_PASSWORD` are set in env.

### Local

Windows installer (`https://www.rabbitmq.com/install-windows.html`) — runs as Service. Default `guest`/`guest` works.

---

## 6. Cold-start performance notes

(Folded in from `guides/STARTUP_OPTIMIZATION_GUIDE.md`.)

What we've done so far:

- `GenieKnowledgeService` initialisation moved off the main thread (spec 014 — `@EventListener(ApplicationReadyEvent)` + `@Async`)
- Vertex AI client construction made lazy (spec 015 P0-2)
- JAR-mode launcher avoids per-start Maven build (spec 014)

What we haven't done:

- Spring AOT / native-image (would shave 5-10 s but breaks Hibernate proxy generation)
- Lazy initialisation for all beans (`spring.main.lazy-initialization=true`) — risky, surfaces wiring bugs at first-request time
- Application-class component scanning narrowed (currently scans the whole `com.axistechnologies.axis` tree)

If cold-start becomes a customer-visible problem, those are the levers in order of risk.

---

## 7. Observability

### Tracing

OpenTelemetry auto-instrumentation via `spring-boot-starter-actuator` + `opentelemetry-spring-boot-starter`. Traces exported to GCP Cloud Trace.

### Logging

- Structured JSON logs in `prod`/`uat` (one event per line, includes `traceId`)
- Human-readable text in `local`
- Log levels per package in `application-{profile}.properties`

### Metrics

Not exported today. Spring Boot Actuator's `/actuator/metrics` is enabled but unscraped. Adding Prometheus or GCP Managed Service for Prometheus is a tracked-but-unscheduled item.

---

## 8. Cost posture

- GCP Cloud Run: scale-to-zero, pay per request. Today's monthly bill is < $20.
- Cloud SQL: smallest available instance, ~$30/month.
- Vertex AI: usage-based, current burn negligible.
- Firebase Hosting: free tier.
- Total infra cost today: under $100/month. Headroom is significant.

---

## 9. Where this document does NOT go

- **What the system is** — `ARCHITECTURE.md`
- **How to run it locally** — `LOCAL_DEV.md`
- **How we engineer** — `ENGINEERING_STANDARDS.md`
- **Per-feature operational quirks** — the relevant `specs/<NNN>-*/spec.md`
