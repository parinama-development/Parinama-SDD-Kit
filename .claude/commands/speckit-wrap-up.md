---
description: Post-implementation wrap-up — generates change-summary.md, creates knowledge-stale markers, and updates workspace context files.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before wrap-up)**:
- Check if `spec-kit/.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_wrap_up` key
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

### 1. Locate Feature Directory

Determine the current feature directory:

- **If `$ARGUMENTS` specifies a feature directory or number**: Resolve it to `spec-kit/specs/NNN-slug/`.
- **Otherwise**: Run `spec-kit/.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` from repo root and parse FEATURE_DIR from JSON output.
- All paths must be absolute.
- For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

Abort with an error if FEATURE_DIR cannot be determined.

### 2. Verify Implementation Completeness

Read `FEATURE_DIR/tasks.md` and verify all tasks are complete:

- Parse all lines matching `- [ ]` (unchecked) and `- [X]` or `- [x]` (checked).
- Count total tasks and completed tasks.

**If any unchecked tasks remain:**

```
## Implementation Incomplete

**Total tasks:** {total}
**Completed:** {completed}
**Remaining:** {remaining}

### Unchecked Tasks:
- [ ] {task_id}: {task_description}
- [ ] {task_id}: {task_description}
...

**ACTION REQUIRED:** All tasks must be checked [X] before wrap-up can proceed.
Run `/speckit-implement` to complete the remaining tasks.
```

**STOP execution.** Do not proceed to step 3.

**If all tasks are checked:** Continue to step 3.

### 3. Load Feature Context

Read the following artifacts from FEATURE_DIR:

- **REQUIRED**: `spec.md` — for functional requirements (FR-###) and acceptance criteria (AC-###)
- **REQUIRED**: `plan.md` — for planned file changes and architecture decisions
- **REQUIRED**: `tasks.md` — for complete task list (all checked)
- **IF EXISTS**: `data-model.md` — for entity/schema changes
- **IF EXISTS**: `contracts/` — for API contract definitions
- **IF EXISTS**: `checklists/` — for checklist completion status

### 4. Generate change-summary.md

Create `FEATURE_DIR/change-summary.md` with the following structure:

#### 4a. Capture Changed Files

Run `git diff --stat` against the appropriate base (e.g., `main` or the branch point) to capture all changed files:

```sh
git diff --stat main..HEAD
```

If git is not available or the diff fails, manually list files known to have been modified based on `tasks.md` file references.

Organize changed files by project:

```markdown
## Change Summary

### Feature: {feature_name}
**Feature Directory:** {FEATURE_DIR}
**Date:** {YYYY-MM-DD}
**Status:** Complete

---

### Files Changed

#### {project_name} (e.g., axistechnologies-api)

| File | Change Type | Description |
|------|-------------|-------------|
| `src/main/java/.../SomeService.java` | Modified | Added {description} |
| `src/main/java/.../NewEntity.java` | Added | New entity for {purpose} |
...

#### {project_name} (e.g., axistechnologies-web-shell/frontend)

| File | Change Type | Description |
|------|-------------|-------------|
...
```

#### 4b. FR-to-File Traceability

Map each Functional Requirement from `spec.md` to the files that implement it:

```markdown
### Requirement Traceability

| Requirement | Files Modified | Status |
|-------------|---------------|--------|
| FR-001: {description} | `path/to/file1.java`, `path/to/file2.ts` | Implemented |
| FR-002: {description} | `path/to/file3.java` | Implemented |
...
```

#### 4c. AC-to-Test Traceability Matrix

Map each Acceptance Criterion to the test(s) that verify it:

```markdown
### Acceptance Criteria Verification

| Acceptance Criterion | Test File(s) | Test Method(s) | Status |
|---------------------|-------------|----------------|--------|
| AC-001: {description} | `src/test/.../SomeTest.java` | `testSomeBehavior()` | PASS |
| AC-002: {description} | `src/app/.../some.spec.ts` | `should do something` | PASS |
...
```

If a test cannot be identified for an AC, mark it as `NO TEST FOUND` and flag it in the summary.

#### 4c-post. Traceability Verification Table

Generate a consolidated verification table confirming every FR was implemented and every AC was tested:

```markdown
### Traceability Verification

| Requirement | Implemented? | Evidence |
|-------------|-------------|----------|
| FR-001      | YES/NO      | {file}:{method} -- commit {hash} |
| FR-002      | YES/NO      | {file}:{method} -- commit {hash} |

| Acceptance Criterion | Tested? | Evidence |
|---------------------|---------|----------|
| AC-001              | YES/NO  | {testFile}:{testMethod} -- PASSED |
| AC-002              | YES/NO  | {testFile}:{testMethod} -- PASSED |
```

**All rows must show YES.** Any NO is a blocking issue -- flag it prominently in the completion summary and recommend re-running `/speckit-implement` to address gaps. This table satisfies Constitution SS16 (Traceability Matrices).

#### 4d. Build and Test Status

Record the build/test pass status:

```markdown
### Build & Test Results

| Project | Build | Unit Tests | Integration Tests | E2E Tests |
|---------|-------|------------|-------------------|-----------|
| axistechnologies-api | PASS | PASS (N/N) | PASS (N/N) | N/A |
| axistechnologies-web-shell | PASS | PASS (N/N) | N/A | PASS (N/N) |
```

#### 4e. Commit History

List commit hashes relevant to this feature:

```markdown
### Commits

| Hash | Message | Date |
|------|---------|------|
| `abc1234` | feat(scope): description | YYYY-MM-DD |
...
```

Run `git log --oneline` with appropriate filtering to capture relevant commits.

### 5. Create Knowledge-Stale Markers

Analyze the changed files to determine which knowledge documents in `spec-kit/ai/knowledge/` are affected:

| Changed File Pattern | Affected Knowledge Doc |
|---------------------|----------------------|
| `**/controllers/**`, `**/dto/**`, `**/routes/**` | `api-spec.md` |
| `**/entities/**`, `**/repositories/**`, `**/migrations/**` | `data-model-spec.md` |
| `**/config/**`, `**/security/**`, `**/auth/**` | `security-spec.md` |
| `**/services/**`, `**/modules/**` | `architecture.md` |
| `src/app/**` (frontend), `**/*.component.*`, `**/*.module.*` | `frontend-spec.md` |
| `**/agents/**`, `**/workflow-executions/**`, `**/langchain4j/**` | `agentic-spec.md` |
| `**/rabbitmq/**`, `**/kafka/**`, `**/external/**` | `integration-spec.md` |
| `**/docker/**`, `**/k8s/**`, `**/ci/**`, `**/deploy/**` | `deployment-spec.md` |

For each affected knowledge doc, create a marker file:

```
spec-kit/ai/knowledge/.knowledge-stale.{doc-name}
```

Example: `spec-kit/ai/knowledge/.knowledge-stale.api-spec`

Each marker file contains:
```
stale_reason: Feature {NNN-slug} delivered
feature_dir: {FEATURE_DIR}
date: {YYYY-MM-DD}
affected_files: {comma-separated list of changed files that triggered this}
```

### 6. Update AGENTS.md (If Needed)

Check if any architecture-level changes were made:
- New controllers or endpoint prefixes
- New database tables or major schema changes
- New infrastructure dependencies
- New build commands or configuration changes

If architecture-level changes are detected, append or update the relevant sections in `spec-kit/AGENTS.md`:
- Add new tables to the Database Schema Overview
- Add new endpoints to the API Endpoint Prefixes
- Update Technology Stack if new dependencies were introduced
- Update Build & Test Reference if commands changed

**If no architecture-level changes:** Skip this step.

### 7. Update LEARNINGS.md

Scan the implementation for patterns, gotchas, or workarounds that should be preserved for future sessions:

- Unexpected API behaviors encountered
- Workarounds for framework limitations
- Non-obvious configuration requirements
- Performance optimizations discovered
- Testing patterns that proved effective

Append new entries to `spec-kit/LEARNINGS.md` in the existing format. Do not duplicate entries already present.

**If no new learnings:** Skip this step.

### 8. Issue Tracker Integration (Optional)

If `spec-kit/local.config` contains `JIRA_PAT` and spec.md header contains a JIRA issue ID:

1. Run: `python spec-kit/.specify/scripts/python/jira_ops.py transition <ISSUE_ID> "Complete"`
2. Generate a structured summary comment from change-summary.md highlights:
   - Files changed count, tests passed count, MR/PR links (if any)
   - Key FRs implemented, ACs verified
3. Run: `python spec-kit/.specify/scripts/python/jira_ops.py comment <ISSUE_ID> "<summary_text>"`
4. If either call fails: log warning (`JIRA update failed: {error}`), do not block wrap-up (Constitution SS17)
5. If JIRA_PAT not configured: skip silently

### 9. Documentation Publishing (Optional)

If `spec-kit/local.config` contains `CONFLUENCE_PAT` and `CONFLUENCE_PARENT`:

1. Run: `python spec-kit/.specify/scripts/python/confluence_ops.py publish <FEATURE_DIR>`
   - Script reads spec.md, plan.md, change-summary.md from the feature directory
   - Generates a Confluence page with 10+ sections: Overview, Functional Requirements, Acceptance Criteria, Technical Design, Implementation Details, API Changes, Data Model Changes, Test Coverage, Deployment Notes, Change Summary
   - Creates the page under the configured parent page
2. If publishing succeeds: record Confluence page URL in the completion summary
3. If publishing fails: log warning (`Confluence publishing failed: {error}`), do not block wrap-up (Constitution SS17)
4. If CONFLUENCE_PAT not configured: skip silently

### 10. Report Completion Summary

Display the final wrap-up report:

```
## Wrap-Up Complete

**Feature:** {feature_name}
**Directory:** {FEATURE_DIR}

### Summary
- **Files changed:** {count}
- **Tests added/modified:** {count}
- **Knowledge docs marked stale:** {list of doc names}
- **AGENTS.md updated:** {Yes/No}
- **LEARNINGS.md updated:** {Yes/No}

### Generated Artifacts
- [X] change-summary.md
- [X] .knowledge-stale markers ({count} docs)

### Integration Status
- **JIRA updated:** {Yes/No/Skipped}
- **Confluence published:** {Yes/No/Skipped}

### Next Recommended Action
Run `/speckit-update-knowledge` to integrate this feature's changes into the knowledge base.
```

### 9. Check for Extension Hooks

After wrap-up, check if `spec-kit/.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.after_wrap_up` key
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

### Wrap-Up Guidelines

- **Completeness gate**: Never generate change-summary.md if tasks are incomplete — this is a hard blocker.
- **Traceability is mandatory**: Every FR must map to files, every AC must map to tests. Gaps are flagged, not silently ignored.
- **Knowledge staleness is proactive**: Mark knowledge docs stale immediately so the next `/speckit-update-knowledge` run knows what to refresh.
- **AGENTS.md updates are conservative**: Only update for architecture-level changes (new tables, new endpoints, new infrastructure). Do not update for routine file modifications.
- **LEARNINGS.md updates are additive**: Never remove existing learnings. Only append genuinely new patterns or gotchas.
- **Constitution compliance**: All outputs must comply with `speckit.constitution`, particularly the Permanent Retention principle (all feature documents are retained permanently).

## Context

$ARGUMENTS
