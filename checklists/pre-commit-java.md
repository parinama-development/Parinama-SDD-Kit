# Pre-Commit Checklist — Java / Spring Boot
**Version**: 2.6.0 | Run this before every commit that touches `.java` files.

Each item has a paste-able grep command. A passing gate returns **0 lines**.

---

## 1. Security — Authorization

**Gate 1a — Write endpoints must use hasAnyRole, not isAuthenticated**
```powershell
# Find all @PostMapping, @PutMapping, @PatchMapping, @DeleteMapping blocks
# and check the @PreAuthorize annotation on the method
$controllers = Get-ChildItem axistechnologies-api/src/main/java -Recurse -Filter "*Controller.java"
foreach ($f in $controllers) {
    $content = Get-Content $f.FullName -Raw
    if ($content -match '@(Post|Put|Patch|Delete)Mapping' -and
        $content -match 'isAuthenticated\(\)') {
        # Check if isAuthenticated is on a write endpoint (not a GET)
        Write-Output "REVIEW $($f.Name) — isAuthenticated() may be on a write endpoint"
    }
}
```

**Gate 1b — No @PreAuthorize("isAuthenticated()") on DELETE/POST/PUT/PATCH (manual review)**
```powershell
Select-String -Path "axistechnologies-api/src/main/java" -Pattern 'PreAuthorize.*isAuthenticated' -Recurse -Include "*Controller.java" |
  ForEach-Object {
    # Print 3 lines before to see the HTTP method annotation
    $lines = Get-Content $_.Path
    $lineNum = $_.LineNumber - 1
    $start = [Math]::Max(0, $lineNum - 3)
    $lines[$start..($lineNum)] -join "`n"
    Write-Output "---"
  }
# Verify every result is a @GetMapping, not a write endpoint.
# Documented exception: ServiceRequestController POST has no method-level @PreAuthorize
# — regular users intentionally submit service requests (URL pattern auth only).
# Every other write endpoint must use hasAnyRole — including sub-group member endpoints,
# platform test-connection endpoints, etc.
```

---

## 2. Dependency Injection

**Gate 2 — No @Autowired field injection in controllers**
```powershell
Select-String -Path "axistechnologies-api/src/main/java/com/axistechnologies/axis/controller" `
  -Pattern "@Autowired" -Recurse -Include "*.java"
# Must return nothing — use constructor injection only
```

**Gate 2b — Every write endpoint has a method-level @PreAuthorize (no controller relying solely on URL-pattern security)**
```powershell
# Find controllers with a write mapping that have NO @PreAuthorize anywhere in the file.
$controllers = Get-ChildItem axistechnologies-api/src/main/java -Recurse -Filter "*Controller.java"
foreach ($f in $controllers) {
    $content = Get-Content $f.FullName -Raw
    if ($content -match '@(Post|Put|Patch|Delete)Mapping' -and $content -notmatch '@PreAuthorize') {
        Write-Output "NO @PreAuthorize anywhere in: $($f.Name)"
    }
}
# Must return nothing — CustomerController had zero @PreAuthorize and relied only on SecurityConfig.
# Documented exception: ServiceRequestController POST (regular users submit requests).
```

**Gate 2c — No hand-rolled programmatic role checks; use @PreAuthorize**
```powershell
# Programmatic role enforcement is invisible to the security gates and inconsistent.
Select-String -Path "axistechnologies-api/src/main/java/com/axistechnologies/axis/controller" `
  -Pattern "getAuthorities\(\).*ROLE_|requireAdminRole|requireRole" -Recurse -Include "*.java"
# Must return nothing — use @PreAuthorize("hasAnyRole(...)") on the method instead.
```

---

## 3. Delete Validation

**Gate 3a — Delete endpoints return 409 CONFLICT, not 400 BAD REQUEST**
```powershell
# Find any "Cannot delete" message returned as badRequest (400)
Select-String -Path "axistechnologies-api/src/main/java" `
  -Pattern "badRequest\(\).*[Cc]annot delete|[Cc]annot delete.*badRequest\(\)" -Recurse -Include "*.java"
# Must return nothing — use ResponseEntity.status(HttpStatus.CONFLICT)
```

**Gate 3b — Every controller with @DeleteMapping checks FK dependents before deleting**
```powershell
# Manual review: for each @DeleteMapping method, verify there is at least one
# countBy/findBy call before the deleteById call
$controllers = Get-ChildItem axistechnologies-api/src/main/java -Recurse -Filter "*Controller.java"
foreach ($f in $controllers) {
    $content = Get-Content $f.FullName -Raw
    if ($content -match '@DeleteMapping' -and $content -notmatch 'countBy|findBy.*Id.*>.*0') {
        Write-Output "REVIEW $($f.Name) — DeleteMapping with no FK count check found"
    }
}
# Review each flagged file — simple entities with no FKs are OK to skip
```

**Gate 3c — GlobalExceptionHandler must contain a DataIntegrityViolationException handler**
```powershell
Select-String -Path "axistechnologies-api/src/main/java" `
  -Pattern "DataIntegrityViolationException" -Recurse -Include "GlobalExceptionHandler.java"
# Must return at least 1 line — without this handler, any unchecked FK violation on deleteById()
# falls through to the generic Exception handler and returns 500 instead of 409 CONFLICT.
# The handler is the safety net for controllers that call deleteById() without a prior FK count check.
```

---

## 4. Null Safety

**Gate 4 — Nullable Integer fields are never unboxed without null check**
```powershell
# Find patterns where a nullable Integer is unboxed: e.g., int x = entity.getField()
Select-String -Path "axistechnologies-api/src/main/java" `
  -Pattern "int \w+ = .*\.get[A-Z]\w*\(\)" -Recurse -Include "*.java" |
  Where-Object { $_.Line -notmatch "Integer\." -and $_.Line -notmatch "if \(" }
# Review each result — if the getter returns Integer (nullable), add a null check
```

---

## 5. API Prefix

**Gate 5 — All new controllers use /api/v1/ prefix**
```powershell
Select-String -Path "axistechnologies-api/src/main/java/com/axistechnologies/axis/controller" `
  -Pattern '@RequestMapping\("/api/' -Recurse -Include "*Controller.java" |
  Where-Object { $_.Line -notmatch "/api/v1/" }
# Must return nothing — /api/ without /v1/ is the legacy agentic exception, not the pattern
```

---

## 6. Logging

**Gate 6 — No [DEBUG] log statements at INFO level**
```powershell
Select-String -Path "axistechnologies-api/src/main/java" `
  -Pattern 'logger\.info\("?\[DEBUG\]' -Recurse -Include "*.java"
# Must return nothing — use logger.debug() for debug-level output
```

---

## 7. Startup Performance (2026-06-16)

**Gate 7a — No @PostConstruct with blocking I/O (database, API calls)**
```powershell
# Find @PostConstruct methods that perform blocking operations
Select-String -Path "axistechnologies-api/src/main/java" `
  -Pattern '@PostConstruct' -Recurse -Include "*.java" -A 5 |
  Where-Object { $_.Line -match 'jdbcTemplate|restTemplate|.save|.findAll|select|insert' }
# Must return nothing — use @Lazy or @EventListener(ApplicationReadyEvent.class) instead
```

**Gate 7b — External services must be @Lazy or @Async**
```powershell
# Find services that require external connectivity without @Lazy
Select-String -Path "axistechnologies-api/src/main/java" `
  -Pattern '@Service.*(?!@Lazy)' -Recurse -Include "*Service.java" |
  Where-Object { $_.Line -match 'RagService|NotificationService|VertexAi|ExternalApi' }
# Review each result — add @Lazy if not @Async
```

**Gate 7c — No synchronous embedding/LLM calls on startup**
```powershell
# Find any RAG or embedding generation in initialization code
Select-String -Path "axistechnologies-api/src/main/java" `
  -Pattern 'PostConstruct|{' -Recurse -Include "*.java" -A 10 |
  Select-String -Pattern 'generateEmbedding|textEmbedding|RagService'
# Must return nothing — embed asynchronously or on first use
```

**Gate 7d — Startup timeout values are documented and reasonable**
```powershell
# Backend should start in <30 seconds, including Maven compilation
# Frontend should start in <120 seconds, including Angular bundling
# No individual startup script should exceed component timeout
Select-String -Path "spec-kit/scripts" -Pattern 'AddSeconds\((\d+)\)' -Recurse
# Review: Backend <120s ✓, Frontend <120s ✓, Total <180s ✓
```

---

## 8. New Controller Checklist (run when adding a new *Controller.java file)

Check each item manually for new controllers:

- [ ] Constructor injection used — no `@Autowired` on fields
- [ ] All `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping` have `@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")`
- [ ] All `@GetMapping` have at minimum `@PreAuthorize("isAuthenticated()")`
- [ ] `@DeleteMapping` method checks all FK repositories for dependents; returns `HttpStatus.CONFLICT` (not 400) if any exist
- [ ] `GlobalExceptionHandler` contains a `DataIntegrityViolationException` handler returning 409 (Gate 3c — safety net for any missed FK checks)
- [ ] All entities use `@PrePersist`/`@PreUpdate` for timestamps — no `setCreatedAt()` / `setUpdatedAt()` calls
- [ ] No nullable `Integer` fields unboxed without null check
- [ ] Controller mapped under `/api/v1/` prefix
- [ ] `Logger` declared as `private static final Logger logger = LoggerFactory.getLogger(Xyz.class)`
- [ ] No `[DEBUG]` text in `logger.info()` calls
