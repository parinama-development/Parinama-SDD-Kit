# Spec-Kit Commands Reference

**Status:** Complete  
**Scope:** All 21 custom Claude Code commands available in this project.  
**Last updated:** 2026-06-18

All commands are invoked via `/command-name` in the Claude Code interface. Individual command definitions live in `.claude/commands/*.md`.

---

## Core Commands (Spec-Driven Development)

| Command | Purpose | Usage |
|---------|---------|-------|
| `/speckit-plan` | Plan a new feature (architecture, file structure, acceptance criteria) | `/speckit-plan` |
| `/speckit-specify` | Write a specification (detailed requirements, data model, acceptance criteria) | `/speckit-specify` |
| `/speckit-specify-guided` | Guided specification wizard (step-by-step prompts) | `/speckit-specify-guided` |
| `/speckit-implement` | Implement a spec (code changes, file creation, etc.) | `/speckit-implement` |

---

## Analysis & Auditing

| Command | Purpose | Usage |
|---------|---------|-------|
| `/speckit-analyze` | Analyze codebase, dependencies, or architecture | `/speckit-analyze` |
| `/speckit-analyze-graph` | Visualize entity relationships and dependency graphs | `/speckit-analyze-graph` |
| `/speckit-audit-knowledge` | Audit what's documented vs. what exists in code | `/speckit-audit-knowledge` |
| `/speckit-query` | Query the knowledge base (DTO patterns, standards, etc.) | `/speckit-query` |

---

## Development Workflow

| Command | Purpose | Usage |
|---------|---------|-------|
| `/speckit-tasks` | Break a spec into concrete tasks (for teams) | `/speckit-tasks` |
| `/speckit-checklist` | Generate pre-commit/pre-push checklist | `/speckit-checklist` |
| `/speckit-sdlc` | Run full spec-driven development cycle | `/speckit-sdlc` |

---

## Git & Versioning

| Command | Purpose | Usage |
|---------|---------|-------|
| `/speckit-git-initialize` | Initialize git repository with spec-kit structure | `/speckit-git-initialize` |
| `/speckit-git-feature` | Create a feature branch matching a spec | `/speckit-git-feature NNN` (spec number) |
| `/speckit-git-commit` | Commit with spec-driven message formatting | `/speckit-git-commit` |
| `/speckit-git-validate` | Validate git history against spec conventions | `/speckit-git-validate` |
| `/speckit-git-remote` | Manage remote repositories and push/pull | `/speckit-git-remote` |

---

## Knowledge Management

| Command | Purpose | Usage |
|---------|---------|-------|
| `/speckit-generate-knowledge` | Generate documentation from code/specs | `/speckit-generate-knowledge` |
| `/speckit-update-knowledge` | Update knowledge base with delivered features | `/speckit-update-knowledge` |
| `/speckit-constitution` | View/update non-negotiable invariants | `/speckit-constitution` |

---

## Session Management

| Command | Purpose | Usage |
|---------|---------|-------|
| `/speckit-clarify` | Clarify ambiguous requirements or designs | `/speckit-clarify` |
| `/speckit-wrap-up` | Wrap up a session (document changes, commit, push) | `/speckit-wrap-up` |

---

## Architecture & Design

| Command | Purpose | Usage |
|---------|---------|-------|
| `Constitution` | Non-negotiable system invariants (read-only reference) | See `.specify/memory/constitution.md` |

---

## How to Use a Command

1. Type the command in your Claude Code message (e.g., `/speckit-plan`)
2. Claude will run the command and guide you through it
3. Follow the prompts and provide input when requested
4. The command completes and returns results (spec, tasks, commits, etc.)

---

## Related Documentation

- **`ENGINEERING_STANDARDS.md`** — Working with this codebase (standards, guardrails, patterns)
- **`ARCHITECTURE.md`** — System overview and architectural decisions
- **`.specify/memory/constitution.md`** — Non-negotiable invariants and principles
- **`.claude/commands/`** — Individual command definitions (technical reference)

---

## Notes

- All commands follow spec-driven development (SDD) conventions
- Commands validate prerequisites before running (e.g., git config, file structure)
- Commands are non-destructive; they generate output or stage changes without committing
- To undo: use git to discard uncommitted changes or revert commits
