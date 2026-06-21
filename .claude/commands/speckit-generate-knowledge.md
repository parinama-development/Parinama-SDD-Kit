---
description: Generate or regenerate the 10 knowledge spec documents from the actual codebase, preserving steward-authored sections.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before knowledge generation)**:
- Check if `spec-kit/.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_generate_knowledge` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Execution Steps.
    ```
- If no hooks are registered or `spec-kit/.specify/extensions.yml` does not exist, skip silently

## Execution Steps

### 1. Load Workspace Context

Read the following foundational documents:

- **REQUIRED**: `spec-kit/AGENTS.md` — workspace overview, project list, technology stack, architecture patterns, database schema, build commands
- **REQUIRED**: `spec-kit/speckit.constitution` — governance rules, quality gates, coding standards
- **IF EXISTS**: `spec-kit/LEARNINGS.md` — persistent cross-session learnings and gotchas

Extract from AGENTS.md:
- Project list with paths, languages, and frameworks
- Technology stack details (backend and frontend)
- Architecture patterns (API prefixes, database access, security, LLM integration)
- Database schema overview (all tables and their purposes)
- Build and test commands

### 2. Incremental Processing (Change Detection)

Before scanning the codebase, check for fingerprints from the last generation:

1. Read `spec-kit/ai/knowledge/.generation-fingerprint.yaml` (if exists)
   - Contains SHA-256 hashes of source directories from the last generation run
2. Compute current directory content hashes (recursive file listing + modification dates)
3. Compare: identify directories/modules that have changed since last generation
4. For each knowledge document:
   - Determine which source modules feed into it (using dependency-graph.yaml module mapping)
   - If NONE of those source modules changed: skip regeneration, log "No changes detected for {doc}"
   - If ANY source module changed: regenerate that document
5. After generation completes: write updated `.generation-fingerprint.yaml`

**Override:** If user passes `--full` argument or `.generation-fingerprint.yaml` does not exist, regenerate all documents (full mode).

### 3. Scan Backend Codebase

For the backend project listed in AGENTS.md (e.g., `axistechnologies-api`):

- **Controllers**: Scan `src/main/java/**/controller/` and `src/main/java/**/rest/` for REST controllers. Extract endpoint mappings (`@GetMapping`, `@PostMapping`, etc.), request/response DTOs, and security annotations.
- **Services**: Scan `src/main/java/**/service/` for service classes. Extract public method signatures, dependencies (`@Autowired` / constructor injection), and business logic summaries.
- **Entities**: Scan `src/main/java/**/entity/` and `src/main/java/**/model/` for JPA entities. Extract table names, column definitions, relationships (`@ManyToOne`, `@OneToMany`, etc.), and constraints.
- **Repositories**: Scan `src/main/java/**/repository/` for Spring Data repositories. Extract custom query methods and their return types.
- **Configuration**: Scan `src/main/java/**/config/` and `src/main/resources/` for configuration classes and properties files. Extract security config, database config, and integration config.
- **DTOs**: Scan `src/main/java/**/dto/` for data transfer objects. Extract field definitions and validation annotations.

### 4. Scan Frontend Codebase

For the frontend project listed in AGENTS.md (e.g., `axistechnologies-web-shell/frontend`):

- **Modules**: Scan `src/app/` for `*.module.ts` files. Extract module declarations, imports, and providers.
- **Components**: Scan `src/app/` for `*.component.ts` files. Extract component selectors, inputs/outputs, and service injections.
- **Services**: Scan `src/app/` for `*.service.ts` files. Extract API call methods, base URLs, and HTTP methods used.
- **Routes**: Scan `src/app/` for routing modules (`*-routing.module.ts` or `app.routes.ts`). Extract route paths, guards, and lazy-loaded modules.
- **Models/Interfaces**: Scan `src/app/` for `*.model.ts` and `*.interface.ts` files. Extract TypeScript interfaces and type definitions.

### 5. Read Raw Documentation

Scan `spec-kit/ai/raw/` directory for any human-authored domain documentation:
- Read all `.md` files in the directory
- Extract domain concepts, business rules, and architectural decisions
- These serve as authoritative input for knowledge generation

If `spec-kit/ai/raw/` does not exist or is empty, note this and proceed with codebase-only generation.

### 6. Multi-Source Document Ingestion

After reading markdown files from `spec-kit/ai/raw/`, also process:

**Binary documents:**
- Scan `spec-kit/ai/raw/` for .pdf, .docx, .pptx files
- For each: run `python spec-kit/.specify/scripts/python/extract_text.py <file_path>`
- Capture extracted text and incorporate into knowledge generation context
- If extraction scripts are not installed or fail: log warning, skip file

**Confluence pages:**
- Read `spec-kit/ai/raw/sources.yaml` (if exists):
  ```yaml
  confluence_pages:
    - url: "https://confluence.example.com/pages/viewpage.action?pageId=12345"
      label: "Architecture Overview"
  ```
- For each URL: run `python spec-kit/.specify/scripts/python/confluence_ops.py fetch <url>`
- Capture page content and incorporate into knowledge generation context
- If CONFLUENCE_PAT not configured or fetch fails: log warning, skip (graceful degradation)

**Graceful degradation:** If extraction scripts are not installed or fail, log warning and continue with codebase-only analysis. Missing external content never blocks knowledge generation.

### 7. Generate/Update Knowledge Documents

For each of the 10 knowledge documents in `spec-kit/ai/knowledge/`, generate or update content:

#### 7a. Preservation Rules

- **`<!-- steward-authored -->` sections**: These are human-written and MUST NOT be modified, deleted, or overwritten. Preserve them exactly as-is, including all content between `<!-- steward-authored -->` and `<!-- /steward-authored -->` markers.
- **`<!-- ai-synthesized -->` sections**: These are AI-generated and CAN be replaced with updated content. Mark all new AI-generated sections with `<!-- ai-synthesized -->` and `<!-- /ai-synthesized -->` markers.
- **If a knowledge doc does not exist**: Create it from scratch with all sections marked `<!-- ai-synthesized -->`.

#### 7b. Document Generation

**architecture.md** — Application Architecture Specification:
- System overview and high-level architecture
- Project structure (from AGENTS.md project list)
- Technology stack summary
- Key architectural patterns (API prefixes, database access, security, LLM integration)
- Module/component dependency overview
- Cross-cutting concerns (logging, error handling, caching)

**api-spec.md** — API Specification:
- All REST endpoints organized by controller
- Request/response DTOs with field definitions
- Authentication and authorization requirements per endpoint
- API versioning strategy
- Error response formats

**data-model-spec.md** — Data Model Specification:
- All database tables with column definitions
- Entity relationships (FKs, join tables)
- Constraints and indexes
- Migration history summary
- Data access patterns (repository methods)

**agentic-spec.md** — Agentic System Specification:
- AI agent types and responsibilities
- Workflow execution lifecycle
- LLM integration patterns (LangChain4j)
- Agent decision flow
- Approval checkpoint mechanism
- RAG integration

**frontend-spec.md** — Frontend Specification:
- Application structure (modules, components)
- Routing architecture
- State management patterns
- API integration layer
- Design system summary (from UI_DESIGN_SYSTEM_SPECIFICATION.md if available)
- Component hierarchy

**integration-spec.md** — Integration Specification:
- External system integrations (RabbitMQ, Qdrant, Ollama)
- Message broker configuration and patterns
- Vector database integration
- Inter-service communication
- Event-driven architecture patterns

**security-spec.md** — Security Specification:
- Authentication mechanism (JWT)
- Authorization model (role hierarchy)
- Security configuration (Spring Security)
- Endpoint security matrix
- Secrets management approach

**deployment-spec.md** — Deployment Specification:
- Local development setup
- Infrastructure requirements
- Port allocations
- Environment configuration
- Build and deploy procedures
- Infrastructure startup scripts

**9. POD.md -- Executive Summary (Business Audience)**

Generate `spec-kit/ai/knowledge/POD.md` -- a business-audience executive summary:

**Sections (zero technology terms in sections 1-8):**
1. Purpose -- What does this system do, for whom, and why?
2. Business Capabilities -- What business outcomes does it enable?
3. Business Entities -- What are the key domain concepts?
4. Business Flows -- How do users interact with the system? (narrative descriptions, no code)
5. Key Business Rules -- What rules govern system behavior?
6. Business Interactions -- Who/what interacts with this system?
7. Glossary -- Key business terms (extracted from glossary.yaml, business definitions only)
8. Constraints -- Business constraints and boundaries
9. Technical Reference -- Technology stack summary (technology terms allowed ONLY here)

**Language rules for sections 1-8:**
- NO framework names (Spring Boot, Angular, React)
- NO database names (PostgreSQL, MongoDB, Qdrant)
- NO infrastructure terms (Docker, Kubernetes, AWS)
- NO protocol names (REST, gRPC, AMQP)
- Use business terms: "stores data" not "persists to PostgreSQL", "processes requests" not "handles HTTP endpoints"

**10. nfr-spec.md -- Non-Functional Requirements**

Generate `spec-kit/ai/knowledge/nfr-spec.md`:

**Sections:**
1. Performance -- Response times, throughput targets, Core Web Vitals
2. Scalability -- Concurrent user limits, data volume limits, growth strategy
3. Availability -- Uptime targets, redundancy, failover
4. Reliability -- Error rates, retry policies, data durability
5. Security NFRs -- Authentication response times, token expiry, encryption standards
6. Observability -- Logging, monitoring, alerting standards
7. Deployment NFRs -- Build times, deployment frequency, rollback capability

Source data from: speckit.constitution (section 8.6 Performance Requirements), AGENTS.md (infrastructure), existing knowledge docs, and any NFR-related content from ai/raw/ documents.

### 8. Update knowledge-scores.yaml

Create or update `spec-kit/ai/knowledge/knowledge-scores.yaml` with quality scores for each knowledge doc:

```yaml
# Knowledge Base Quality Scores
# Generated: {YYYY-MM-DD}
# Source: /speckit-generate-knowledge

documents:
  architecture.md:
    completeness: {0.0-1.0}    # Proportion of expected sections filled
    freshness: {0.0-1.0}       # 1.0 = just generated, decays per feature
    confidence: {0.0-1.0}      # Based on codebase evidence strength
    last_generated: "{YYYY-MM-DD}"
    last_feature_sync: "{NNN-slug or 'initial'}"
  api-spec.md:
    completeness: {0.0-1.0}
    freshness: {0.0-1.0}
    confidence: {0.0-1.0}
    last_generated: "{YYYY-MM-DD}"
    last_feature_sync: "{NNN-slug or 'initial'}"
  # ... repeat for all 10 documents
```

**Scoring heuristics:**
- **completeness**: Count non-empty sections / total expected sections
- **freshness**: 1.0 for freshly generated; deduct 0.1 per unintegrated feature
- **confidence**: Based on how much codebase evidence supports the content (1.0 = every claim verified in code, 0.5 = some claims from docs only)

### 9. Update CHANGELOG.md

Append a generation entry to `spec-kit/ai/knowledge/CHANGELOG.md`:

```markdown
## [{YYYY-MM-DD}] Knowledge Generation

- **Trigger:** Manual generation via /speckit-generate-knowledge
- **Documents updated:** {list of 10 docs}
- **Steward sections preserved:** {count}
- **AI sections regenerated:** {count}
- **Codebase scan coverage:**
  - Backend controllers: {count}
  - Backend services: {count}
  - Backend entities: {count}
  - Frontend components: {count}
  - Frontend services: {count}
```

If `CHANGELOG.md` does not exist, create it with a header:

```markdown
# Knowledge Base Changelog

This file tracks all changes to the knowledge base documents in `spec-kit/ai/knowledge/`.

---
```

### 10. Update glossary.yaml

Create or update `spec-kit/ai/knowledge/glossary.yaml` with terms discovered during codebase scanning:

```yaml
# Knowledge Base Glossary
# Generated: {YYYY-MM-DD}

terms:
  - term: "{Term Name}"
    definition: "{Clear, concise definition}"
    source: "{Where this term is used: e.g., 'architecture.md', 'codebase: SomeService.java'}"
    aliases: ["{alternative names if any}"]
  # ... additional terms
```

Discover terms by:
- Extracting class names and their purposes from entity/service/controller names
- Identifying domain-specific terminology from AGENTS.md and raw docs
- Recording acronyms and their expansions (e.g., RAG, JWT, DTO, FR, AC)
- Capturing business domain terms from spec files

If `glossary.yaml` already exists, merge new terms without removing existing ones.

### 11. Report Generation Summary

Display the generation report:

```
## Knowledge Generation Complete

### Documents Generated/Updated
| Document | Sections | Steward Preserved | AI Regenerated | Completeness |
|----------|----------|-------------------|----------------|--------------|
| architecture.md | {N} | {N} | {N} | {score} |
| api-spec.md | {N} | {N} | {N} | {score} |
| data-model-spec.md | {N} | {N} | {N} | {score} |
| agentic-spec.md | {N} | {N} | {N} | {score} |
| frontend-spec.md | {N} | {N} | {N} | {score} |
| integration-spec.md | {N} | {N} | {N} | {score} |
| security-spec.md | {N} | {N} | {N} | {score} |
| deployment-spec.md | {N} | {N} | {N} | {score} |
| POD.md | {N} | {N} | {N} | {score} |
| nfr-spec.md | {N} | {N} | {N} | {score} |

### Codebase Scan Results
- **Backend classes scanned:** {count}
- **Frontend files scanned:** {count}
- **Raw docs incorporated:** {count}
- **Glossary terms:** {count} ({new_count} new)

### Updated Artifacts
- [X] knowledge-scores.yaml
- [X] CHANGELOG.md
- [X] glossary.yaml
- [X] 10 knowledge documents
```

### 12. Check for Extension Hooks

After generation, check if `spec-kit/.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.after_generate_knowledge` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}
    ```
- If no hooks are registered or `spec-kit/.specify/extensions.yml` does not exist, skip silently

## Operating Principles

### Knowledge Generation Guidelines

- **Codebase is truth**: All generated content must be backed by evidence from the actual codebase or authoritative documentation. Never invent or assume facts (Constitution Principle 11).
- **Steward authority**: `<!-- steward-authored -->` sections are human-controlled and inviolable. AI generation works around them, never through them.
- **Incremental generation**: If a knowledge doc already exists with valid content, prefer targeted updates over full regeneration.
- **Single Source of Truth**: Knowledge docs in `spec-kit/ai/knowledge/` are the canonical source for domain knowledge (Constitution Principle 5). Do not duplicate facts across documents.
- **Marker discipline**: Every AI-generated section must have `<!-- ai-synthesized -->` / `<!-- /ai-synthesized -->` markers. This enables future selective updates.
- **Glossary consistency**: Terms used in knowledge docs must match `glossary.yaml` definitions. If a new term is introduced, add it to the glossary.

## Context

$ARGUMENTS
