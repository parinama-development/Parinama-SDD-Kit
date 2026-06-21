---
description: Analyze the dependency graph for criticality rankings, blast radius, and architectural anti-patterns.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before graph analysis)**:
- Check if `spec-kit/.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_analyze_graph` key
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

    Wait for the result of the hook command before proceeding to the Outline.
    ```
- If no hooks are registered or `spec-kit/.specify/extensions.yml` does not exist, skip silently

## Outline

### 1. Load Dependency Graph

- Read `spec-kit/ai/knowledge/dependency-graph.yaml`
- If the file does not exist: **ERROR** — output "dependency-graph.yaml not found. Run /speckit-generate-knowledge first." and abort.
- Parse the YAML structure: extract `modules`, `sub_modules`, `depends_on`, and `depended_on_by` relationships for every entry.
- Build an adjacency list representation in working memory (two maps: outbound edges and inbound edges).
- Count total modules and sub_modules. If the graph contains fewer than 3 modules, output a **WARNING**: "Insufficient data for meaningful analysis. The dependency graph has fewer than 3 modules." and continue with reduced analysis (skip anti-pattern detection).
- If `dependency-graph.yaml` exists but is empty (no modules defined), output the same warning and abort.

### 2. Criticality Ranking

For each module and sub_module in the graph:

1. Count **inbound dependencies** — the number of entries in `depended_on_by`, including transitive inbound edges inherited from parent modules (i.e., if module A depends on module B, then all sub_modules of B also inherit that inbound dependency for ranking purposes).
2. Classify each module/sub_module into a criticality tier:

   | Tier | Label | Criteria |
   |------|-------|----------|
   | **Tier 1** | Critical | 5 or more inbound dependencies |
   | **Tier 2** | Important | 3–4 inbound dependencies |
   | **Tier 3** | Supporting | 1–2 inbound dependencies |
   | **Isolated** | Isolated | 0 inbound dependencies |

3. Sort all modules by inbound dependency count in descending order.
4. For each entry, record its top 3 most significant dependents (the modules that depend on it most directly).

### 3. Blast Radius Analysis

For each **Tier 1** and **Tier 2** module identified in step 2:

1. Compute the **transitive closure** of `depended_on_by` — recursively follow all downstream dependents to find every module that would be affected if this module changed or broke.
2. Calculate the **blast radius** = total count of transitively affected modules (excluding the module itself).
3. Record the full dependency chain paths (e.g., A → B → C → D) for the longest chain.
4. Handle disconnected subgraphs: ensure traversal does not assume a single connected component. Each subgraph is traversed independently.
5. Detect and handle cycles during traversal (mark visited nodes to prevent infinite loops).

Output: A blast radius table sorted by impact (highest blast radius first), limited to the **top 10** entries.

### 4. Anti-Pattern Detection

Run the following four anti-pattern detectors against the full dependency graph. Each detector assigns a severity level and produces structured findings.

#### 4a. Circular Dependencies

- Run **depth-first search (DFS) cycle detection** on the full directed dependency graph.
- For each cycle found, report the complete path: e.g., `A → B → C → A`
- If multiple cycles share edges, report each unique cycle separately.
- **Severity: CRITICAL**
- **Recommendation:** "Break the cycle by introducing an interface or event-driven decoupling between {module} and {module}."

#### 4b. God Modules

- Identify any module with **8 or more inbound dependencies** OR **8 or more outbound dependencies**.
- Report the module name, inbound count, and outbound count.
- **Severity: HIGH**
- **Recommendation:** "Consider decomposing into smaller, focused modules with single responsibilities."

#### 4c. Tight Coupling Clusters

- Identify groups of **3 or more modules** where every pair within the group has `coupling: "tight"` in the dependency graph.
- Report the full list of cluster members.
- Use the `coupling` field from `dependency-graph.yaml` (values: `"tight"`, `"moderate"`, `"loose"`).
- **Severity: MEDIUM**
- **Recommendation:** "Consider introducing interface abstractions between these modules to reduce coupling."

#### 4d. Orphan Modules

- Identify modules with **zero inbound AND zero outbound** dependencies.
- These may be intentional leaf nodes (standalone utilities, entry points) or genuinely disconnected.
- Report as informational rather than actionable.
- **Severity: LOW**
- **Recommendation:** "Verify whether this module is intentionally standalone or should declare dependencies."

### 5. Generate Report

Output the full analysis report to the user in the following Markdown format. Do **not** write the report to a file unless the user explicitly requests it via `$ARGUMENTS`.

```markdown
## Graph Intelligence Report

**Generated:** {YYYY-MM-DD}
**Source:** spec-kit/ai/knowledge/dependency-graph.yaml
**Modules analyzed:** {count} modules, {count} sub-modules

---

### Criticality Ranking

| Tier | Module | Inbound Deps | Key Dependents |
|------|--------|-------------|----------------|
| 1 — Critical | {module_name} | {count} | {dep1}, {dep2}, {dep3} |
| 2 — Important | {module_name} | {count} | {dep1}, {dep2} |
| 3 — Supporting | {module_name} | {count} | {dep1} |
| Isolated | {module_name} | 0 | — |

### Blast Radius (Top 10)

| Rank | Module | Blast Radius | Longest Chain | Affected Modules |
|------|--------|-------------|---------------|-----------------|
| 1 | {module_name} | {count} | {A → B → C → D} | {list} |
| 2 | {module_name} | {count} | {A → B → C} | {list} |

### Anti-Patterns Detected

| # | Type | Severity | Details | Recommendation |
|---|------|----------|---------|----------------|
| 1 | Circular Dependency | CRITICAL | {A → B → C → A} | Break cycle by introducing interface between {X} and {Y} |
| 2 | God Module | HIGH | {module}: {in} inbound, {out} outbound | Decompose into smaller modules |
| 3 | Tight Coupling Cluster | MEDIUM | Cluster: {A, B, C} | Introduce interface abstractions |
| 4 | Orphan Module | LOW | {module}: no dependencies | Verify if intentionally standalone |

### Summary Statistics

- **Critical modules (Tier 1):** {count}
- **Important modules (Tier 2):** {count}
- **Supporting modules (Tier 3):** {count}
- **Isolated modules:** {count}
- **Anti-patterns found:** {total_count} ({critical_count} critical, {high_count} high, {medium_count} medium, {low_count} low)
- **Maximum blast radius:** {module_name} ({count} affected modules)
- **Average inbound dependencies:** {avg}

### Recommendations

1. {Actionable recommendation based on highest-severity finding}
2. {Actionable recommendation based on second finding}
3. {Actionable recommendation based on structural observation}
4. {Actionable recommendation for improving modularity}
5. {Actionable recommendation for reducing risk}
```

### 6. Post-Execution Hooks

After the report, check if `spec-kit/.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.after_analyze_graph` key
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

## Key Rules

- **READ-ONLY**: This skill does not modify any files. It reads `dependency-graph.yaml` and outputs analysis to the user. No files are created, updated, or deleted unless the user explicitly requests the report be saved via `$ARGUMENTS`.
- **Minimum data threshold**: If `dependency-graph.yaml` is empty or has fewer than 3 modules, output "Insufficient data for meaningful analysis" as a warning. Criticality ranking and blast radius may still be shown, but anti-pattern detection is skipped.
- **Disconnected subgraphs**: All graph traversal algorithms (DFS, transitive closure, cycle detection) must handle disconnected subgraphs. Never assume the graph is a single connected component.
- **Cycle-safe traversal**: All recursive traversals must track visited nodes to prevent infinite loops when circular dependencies exist.
- **Coupling strength awareness**: The `coupling` field in `dependency-graph.yaml` uses three values: `"tight"`, `"moderate"`, and `"loose"`. Only the tight coupling cluster detector (4c) uses this field. Other detectors operate purely on structural edges.
- **No invented findings**: Report only findings backed by concrete graph data. Never fabricate dependencies or anti-patterns not present in the actual `dependency-graph.yaml` structure.
- **Deterministic output**: Rerunning the analysis without changes to `dependency-graph.yaml` should produce identical findings and rankings.

## Context

$ARGUMENTS
