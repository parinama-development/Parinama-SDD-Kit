# Local Development Guide

**Status**: Canonical (supersedes `LOCAL_DEV_QUICKSTART.md`, `SERVICE_STARTUP_GUIDE.md`, `guides/STARTUP_OPTIMIZATION_GUIDE.md`, `guides/JAR_DEPLOYMENT_PATTERN.md`, `guides/SECRETS_ENCRYPTION_KEY_SETUP.md`, `guides/RABBITMQ_DEPLOYMENT_POLICY.md`, `guides/DEPENDENCY_MANAGEMENT_GUIDE.md`).
**Audience**: A developer (human or AI) cloning the repos for the first time.
**Goal**: Backend on `:8080` and frontend on `:4200` in ≤ 15 minutes on a clean machine.

---

## 0. Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| Git | 2.40+ | Submodule clone |
| JDK | 17 (Temurin) | Backend runtime |
| Maven | 3.9+ on PATH | Backend build |
| Node | 24 LTS | Frontend toolchain |
| PowerShell | 5.1+ (Windows) or 7 (cross-platform) | Launchers |
| GCP `gcloud` CLI | latest | ADC for Vertex AI (optional locally) |

**Optional**: RabbitMQ (Windows service or Docker), Redis (or use the committed Upstash dev instance), Postgres (or use the committed GCP UAT instance).

---

## 1. First-time setup

### 1.1 Clone

```bash
git clone --recurse-submodules https://github.com/axistechnologies-ai/AxisTechnologies.git
cd AxisTechnologies
```

If you forgot `--recurse-submodules`:

```bash
git submodule update --init --recursive
```

### 1.2 Local properties

The backend reads `axistechnologies-api/src/main/resources/application-local.properties` (gitignored). The `.example` sibling is committed.

**Easy path**: just run the launcher (next section). It auto-copies the template on first run.

**Manual path**: copy and edit the file yourself:

```powershell
cd axistechnologies-api/src/main/resources
Copy-Item application-local.properties.example application-local.properties
notepad application-local.properties
```

Fill in:

- `spring.datasource.*` — DB host/user/password (ask the platform team for UAT creds, or point at a local Postgres)
- `spring.data.redis.*` — Redis host/password (or set host to `localhost` and remove password if running locally)
- `secrets.encryption.key` — the template value is a non-secret 32-byte dev key; OK to leave for local dev

### 1.3 Pre-commit hooks (automatic)

When you cloned the repo, git automatically configured pre-commit hooks:

```powershell
git config --get core.hooksPath
# Should print: .githooks
```

**What happens:** Before each commit, `validate-startup-scripts.ps1` runs automatically. If any startup scripts violate the strict NPM/MVN policy (e.g., direct `ng serve`, `java -jar`, `gradle`), the commit is **blocked** with a clear error.

**Normal case (compliant scripts):** You won't see anything; the commit proceeds.

**Non-compliant scripts:** Fix the violations and commit again.

**Emergency bypass:** `git commit --no-verify` (NOT RECOMMENDED)

See `scripts/STARTUP_SCRIPT_POLICY.md` or `.githooks/README.md` for complete documentation.

### 1.4 Frontend dependencies

```powershell
cd axistechnologies-web-shell/frontend
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is required until spec 015 P2-7 lands (`ng-packagr@17` peer-dep mismatch with Angular 19). This is documented as known debt, not improvisation.

**Note:** Angular was upgraded to 19.2+ to support Node 24 LTS. If you see version mismatches, ensure Node is ≥24.0.0: `node --version`.

### 1.5 GCP credentials (only if you want Vertex AI / Genie working locally)

```powershell
gcloud auth application-default login
```

Without ADC the Vertex-AI-backed features (Genie chat, product marketing AI content) **degrade gracefully** — they log a warning and return empty results, but the rest of the app works. This is by design (spec 015 P0-2).

---

## 2. Start the stack

### 2.1 The one-liner

```powershell
cd c:\Users\Tousif\AxisTechnologies        # or wherever you cloned
& '.\spec-kit\scripts\start-all.ps1'
```

This orchestrator:

1. Verifies infra (RabbitMQ, Qdrant) — starts what isn't running
2. Builds the backend JAR if it's stale (or absent), then launches it
3. Installs frontend deps if missing, then launches `ng serve`
4. Tails status to your console

Expected end state: `[Backend] Ready on :8080` + `[Frontend] Ready on :4200`.

### 2.2 Per-layer launchers (when you only need one)

```powershell
& '.\spec-kit\scripts\launchers\infra.ps1'      # just RabbitMQ + Qdrant
& '.\spec-kit\scripts\launchers\backend.ps1'    # just the API on :8080
& '.\spec-kit\scripts\launchers\frontend.ps1'   # just the SPA on :4200
```

### 2.3 Per-repo launchers (back-compat wrappers)

```powershell
& '.\axistechnologies-api\scripts\start-backend.ps1'
& '.\axistechnologies-web-shell\scripts\start-frontend.ps1'
```

These are 3-line wrappers around the canonical launchers. Identical behaviour; existed for muscle-memory.

---

## 3. Build modes

The backend supports two launch modes. The launcher picks one for you, but you can override.

| Mode | When to use | How fast does change-rebuild-restart cycle? | How to invoke |
|------|-------------|--------------------------------------------|---------------|
| JAR (default) | Demos, clean clone, start-all | Slow (~30-45 s full rebuild) but **deterministic** | `start-backend.ps1` |
| Maven (hot-reload) | Active coding | Fast (~3-5 s incremental via Spring DevTools) but Maven must be on PATH | `start-backend.ps1 -Mode maven` or `$env:BACKEND_LAUNCH_MODE = "maven"` |

The JAR is built into `axistechnologies-api/target/axis-marketing-website-1.0.0.jar`. It is gitignored.

**Staleness check**: the launcher rebuilds the JAR when `pom.xml`, anything under `src/`, or `application-local.properties` is newer than the JAR. You should never see "but I changed the code and it didn't reflect" — if you do, file a bug against the launcher.

---

## 4. Stopping things

```powershell
Get-Process java,node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Or `Ctrl+C` in the launcher window. The backend `Start-Process -WindowStyle Minimized` java process survives shell death; the brute-force command above is the reliable kill.

---

## 5. Optional services

### 5.1 RabbitMQ

Spec 014 made RabbitMQ **optional** for local dev. The agentic loop falls back to direct thread invocation when `rabbitmq.enabled=false` in `application-local.properties` (which the template sets to `false`).

You only need RabbitMQ if you're testing the full async messaging path. To enable:

1. Install RabbitMQ via [the Windows installer](https://www.rabbitmq.com/install-windows.html) — installs as a Windows Service
2. Set `rabbitmq.enabled=true` in `application-local.properties`
3. Confirm the service is running: `Get-Service RabbitMQ`
4. Restart the backend

### 5.2 Qdrant (vector store for RAG)

Used by `GenieKnowledgeService` for retrieval. Default endpoint: `http://localhost:6333`.

```powershell
# Download & extract Qdrant binary to a known location, then:
.\qdrant.exe
```

The infra launcher checks `:6333` and skips if already running.

### 5.3 Redis

Two options:

- **Use the committed Upstash dev instance**: works out of the box, no local install (the example properties point at it)
- **Run a local Redis**: install via WSL or Docker, set `spring.data.redis.host=localhost`, remove password, `ssl.enabled=false`

---

## 6. Common issues & fixes

### Backend exits with `SECRETS_ENCRYPTION_KEY must be exactly 32 bytes`

A stale env var is overriding your properties file. Spec 015 P0-4 hardened `config.ps1` to detect and overwrite this, but if you're not going through the launcher:

```powershell
Remove-Item Env:SECRETS_ENCRYPTION_KEY
```

Then re-run.

### Frontend timeout on port `:4200` but `ng serve` shows "compiled successfully"

Angular dev server binds IPv6-only (`[::1]:4200`) on Windows. Browsers handle dual-stack — just open `http://localhost:4200` in a browser and it'll work. The launcher's port-check uses IPv4 and times out spuriously; this is spec 015 P2-6 (to be fixed by passing `--host 127.0.0.1`).

### `npm install` fails with `ETARGET No matching version found`

Pre-spec-015 `package.json` had `"@angular-devkit/architect": "18"` which npm 11+ rejects as invalid semver. Pull latest; spec 015 W2 commit `cfeff2d` fixed this.

### `npm install` fails with `ERESOLVE could not resolve ng-packagr`

Add `--legacy-peer-deps`. This is documented known debt; see `spec-kit/specs/015-end-to-end-review/findings.md` P2-7.

### Maven not found

```
.githooks/pre-commit: line 43: mvn: command not found
```

Install Maven (`winget install Apache.Maven` or extract to `%LOCALAPPDATA%\Programs\Apache-Maven\`) and ensure it's on User PATH. The launcher also tries `axistechnologies-api/mvnw.cmd` if present, so you can commit an `mvnw` wrapper as a workaround.

### Backend starts then immediately disappears

You probably ran a `Stop-Process java` somewhere that killed it. The IDE's Java Language Server also shows up as `java` in process lists — be specific: `Get-Process java | Where-Object { $_.WS -gt 200MB }` usually picks the backend.

### Where are the logs?

Log files are written to `%LOCALAPPDATA%\AxisTechnologies\logs\` (not the working tree). This keeps the git status clean and puts logs in a standard Windows location. If you need to capture logs from a specific run, redirect manually:

```powershell
& spec-kit/scripts/launchers/backend.ps1 2>&1 | Tee-Object -FilePath "$env:LOCALAPPDATA\AxisTechnologies\logs\my-run.log"
```

---

## 7. Using the agentic loop locally

(Folded in from old `AGENTIC_USER_GUIDE.md`.)

The agentic backend exposes:

- `POST /api/v1/agents/{agentId}/execute` — synchronous execution
- `POST /api/v1/agents/{agentId}/execute-async` — async, returns `executionId`
- `GET  /api/v1/agents/{agentId}/executions/{executionId}` — poll status
- MCP tool surface at `POST /api/v1/mcp/invoke` (spec 013)

The frontend's chat widget (spec 010) talks to `GenieChatService` which uses the lazy-init Vertex AI client (spec 015 P0-2). If GCP ADC is missing, you get a graceful empty response, not a crash.

For the full agentic protocol see `ARCHITECTURE.md` §3.

---

## 8. Where else to look

| Topic | Doc |
|-------|-----|
| What the system is | `ARCHITECTURE.md` |
| How to ship to prod | `OPERATIONS.md` |
| Coding conventions | `ENGINEERING_STANDARDS.md` |
| Active spec | `specs/<NNN>-*/spec.md` |
| Invariants | `.specify/memory/constitution.md` |
