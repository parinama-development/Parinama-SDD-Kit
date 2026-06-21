# Parinama-SDD Kit

Spec-Driven Development Kit for Parinama projects — configuration, workflows, and SDD artifacts for Devin Desktop, Claude Code, and Gemini CLI.

## Overview

This repository contains the spec-driven development (SDD) governance, workflows, and integration configurations for the Parinama development organization. It is **not deployed** — it holds the specifications, templates, and tooling that guide development across all Parinama projects.

## Supported IDE Integrations

This spec-kit is configured for the following AI coding agents:

| IDE | Integration | Status |
|-----|-------------|--------|
| **Devin Desktop** | Skills-based commands | ✅ Configured |
| **Claude Code** | Slash commands (`.claude/commands/`) | ✅ Configured |
| **Gemini CLI** | TOML command format | ✅ Configured |

## Getting Started

### 1. Clone this repo

```bash
git clone https://github.com/parinama-development/Parinama-SDD-Kit.git
cd Parinama-SDD-Kit
```

### 2. Use with your IDE

#### Claude Code
Launch Claude Code in any Parinama project directory. The spec-kit commands are available as `/speckit.*` slash commands.

```bash
# Create project constitution
/speckit.constitution Create principles focused on code quality, testing standards, and performance

# Create a spec
/speckit.specify Build a user authentication system with JWT tokens and role-based access control
```

#### Devin Desktop
Devin uses skills-based commands. Skills are in `.devin/skills/`.

#### Gemini CLI
Gemini uses TOML-formatted commands. Commands are in `.gemini/commands/`.

### 3. Establish project principles

Start by creating your project's governing constitution:

```bash
# Claude Code
/speckit.constitution Create principles for [your domain]

# This creates .specify/memory/constitution.md with your project's invariants
```

### 4. Create specs

Use the spec commands to describe what you want to build:

```bash
/speckit.specify [your feature description]
```

## Repository Structure

```
Parinama-SDD-Kit/
├── .claude/commands/       ← Claude Code slash commands
├── .devin/skills/          ← Devin Desktop skills
├── .gemini/commands/       ← Gemini CLI TOML commands
├── .specify/
│   ├── memory/
│   │   └── constitution.md ← Project invariants (created by /speckit.constitution)
│   └── templates/         ← Spec/plan/task templates
├── specs/                  ← Feature specifications (numbered folders)
├── workflows/              ← Reusable workflows
├── checklists/             ← Pre-commit checklists
├── templates/              ← Code scaffolding templates
├── docs/                   ← Documentation
└── scripts/                ← Utility scripts
```

## Learnings from AxisTechnologies spec-kit

This repo incorporates learnings from [axistechnologies-ai/spec-kit](https://github.com/axistechnologies-ai/spec-kit):

- **Canonical documentation pattern**: Single source of truth for architecture, operations, and engineering standards
- **Pre-commit checklists**: Language-specific checklists for Java and Angular
- **Launcher scripts**: Canonical PowerShell launchers for backend/frontend services
- **Knowledge governance**: Structured approach to RAG knowledge management
- **Agentic patterns**: Workflow execution, agent state management, and approval checkpoints

## License

Proprietary. © Parinama Development.
