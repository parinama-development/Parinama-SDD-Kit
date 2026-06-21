# Pre-Commit Checklist — Angular / TypeScript
**Version**: 2.6.0 | Run this before every commit that touches `.ts`, `.html`, or `.css` files.

Each item below has a paste-able grep command. A passing gate returns **0 lines**. A failing gate
returns file + line numbers — fix those before committing.

---

## 1. Subscription Lifecycle

**Gate 1a — Every file with `.subscribe(` must also have `takeUntil`**
```powershell
# Files that subscribe but are missing takeUntil
$files = Get-ChildItem frontend/src/app -Recurse -Filter "*.ts" |
  Where-Object { (Get-Content $_.FullName -Raw) -match '\.subscribe\(' -and
                 (Get-Content $_.FullName -Raw) -notmatch 'takeUntil' }
$files.FullName
# Must return nothing
```

**Gate 1b — Files with subscriptions inside forEach must have takeUntil on the inner call**
```powershell
# Manually review any file that has both forEach and .subscribe(
Select-String -Path "frontend/src/app/**/*.ts" -Pattern "forEach" -Recurse |
  Select-Object -ExpandProperty Filename | Sort-Object -Unique
# For each file listed, open it and confirm every .subscribe( inside a forEach
# has .pipe(takeUntil(this.destroy$)) immediately before it
```

**Gate 1d — Every .subscribe() must have an error handler, not just `next:`**
```powershell
# Find subscribe() calls without an error handler — common with raw HttpClient bypass of ApiService.
# This is a structural check: a .subscribe(()=>{}) or .subscribe({next:()=>{}}) with no error block
# fails silently on every 4xx/5xx, including 409 CONFLICT FK violations.
Select-String -Path "frontend/src/app" -Pattern '\.subscribe\(\(\)\s*=>' -Recurse -Include "*.ts" |
  Where-Object { $_.Line -notmatch "^\s*//" }
# Review each result — the next-only form is fine for fire-and-forget actions but
# any user-visible operation (save, delete, load) must also have `error: (err) => { ... }`
# that sets errorMessage or deleteErrorMessage.
```

**Gate 1c — Every component class that implements OnInit must also implement OnDestroy**
```powershell
$files = Get-ChildItem frontend/src/app -Recurse -Filter "*.ts" |
  Where-Object { (Get-Content $_.FullName -Raw) -match 'implements OnInit' -and
                 (Get-Content $_.FullName -Raw) -notmatch 'OnDestroy' }
$files.Name
# Must return nothing
```

---

## 2. Error Handling

**Gate 2a — No `alert()` in committed TypeScript**
```powershell
Select-String -Path "frontend/src/app" -Pattern "alert\(" -Recurse -Include "*.ts" |
  Where-Object { $_.Line -notmatch "^\s*//" }
# Must return nothing
```

**Gate 2b — No `console.log` / `console.error` / `console.warn` in committed TypeScript**
```powershell
Select-String -Path "frontend/src/app" -Pattern "console\.(log|error|warn)" -Recurse -Include "*.ts" |
  Where-Object { $_.Line -notmatch "^\s*//" -and $_.Path -notmatch "chat-widget" }
# Must return nothing — users never see the console. Error handlers must set errorMessage state
# (surfacing err?.error?.message), not write to console. console.error is as banned as console.log.
```

**Gate 2f — Every component with an errorMessage field must render it in the template**
```powershell
# A field set but never displayed = silent failures. For each component .ts that declares
# errorMessage / deleteErrorMessage, the sibling .html must reference it.
Get-ChildItem frontend/src/app -Recurse -Filter "*.component.ts" |
  Where-Object { (Get-Content $_.FullName -Raw) -match 'errorMessage' } |
  ForEach-Object {
    $html = $_.FullName -replace '\.ts$', '.html'
    if ((Test-Path $html) -and ((Get-Content $html -Raw) -notmatch 'errorMessage')) {
      Write-Output "errorMessage set but never rendered: $($_.Name)"
    }
  }
# Must return nothing — wire an .error-banner that displays the message (global styles exist).
```

**Gate 2c — No silently-swallowed error callbacks**
```powershell
Select-String -Path "frontend/src/app" -Pattern "Silently handle error" -Recurse -Include "*.ts"
# Must return nothing — every error callback must set errorMessage or log
```

**Gate 2d — No `localStorage` access in component TypeScript (use `authService.currentUser`)**
```powershell
Select-String -Path "frontend/src/app" -Pattern "localStorage" -Recurse -Include "*.ts" |
  Where-Object { $_.Path -notmatch "auth\.service\.ts" -and $_.Line -notmatch "^\s*//" }
# Must return nothing — auth stores the user in sessionStorage under the AuthService key.
# Role and user data must always be read from authService.currentUser, never from any storage directly.
# Reading from localStorage will always return null because auth never writes there.
# chatWidget.component.ts has a legitimate localStorage use for session IDs — exclude if needed.
```

**Gate 2e — Role checks use `authService.currentUser`, not raw storage**
```powershell
# Manual check — scan component files that contain isAdmin/isSuperAdmin/role checks
Select-String -Path "frontend/src/app" -Pattern "isAdmin|isSuperAdmin|\.role\b" -Recurse -Include "*.ts" |
  Where-Object { $_.Line -notmatch "authService|auth\.currentUser|this\.auth\." -and
                 $_.Line -notmatch "^\s*//" -and $_.Line -notmatch "= false|= true" }
# For each result, verify the role is being READ from authService, not from storage or a hardcoded string
```

---

## 3. CSS Quality

**Gate 3a — No hardcoded hex colours in component CSS**
```powershell
Select-String -Path "frontend/src/app" -Pattern "#[0-9a-fA-F]{3,6}" -Recurse -Include "*.css" |
  Where-Object { $_.Line -notmatch "^\s*/\*" }
# Review each result — any hex that has an equivalent design token must use the token
```

**Gate 3b — `var(--color-background)` is not a real token — use `var(--color-background-alt)`**
```powershell
Select-String -Path "frontend/src/app" -Pattern "var\(--color-background\)" -Recurse -Include "*.css" |
  Where-Object { $_.Line -notmatch "color-background-alt" }
# Must return nothing
```

**Gate 3c — No CSS gradients**
```powershell
Select-String -Path "frontend/src/app" -Pattern "linear-gradient|radial-gradient" -Recurse -Include "*.css"
# Must return nothing
```

**Gate 3d — SVG stroke-width must be "1.75" not "2" or "2.5"**
```powershell
Select-String -Path "frontend/src/app" -Pattern 'stroke-width="2"' -Recurse -Include "*.html"
Select-String -Path "frontend/src/app" -Pattern 'stroke-width="2.5"' -Recurse -Include "*.html"
Select-String -Path "frontend/src/app" -Pattern 'stroke-width="2"' -Recurse -Include "*.ts"
# Must all return nothing
```

**Gate 3f — No `&#9776;` / `&#x2630;` / Unicode hamburger / arrow characters as icons**
```powershell
# Banned: Unicode symbols as icons (☰, ▸, ▾, ★, ✓, →)
Select-String -Path "frontend/src/app" -Pattern '&#(9776|9656|9662|9733|10003|8594);|☰|▸|▾|★|✓|→' -Recurse -Include "*.html"
# Must return nothing — use inline SVG Feather-style icons instead.
```

**Gate 3g — No duplicate `.error-banner` declarations in component CSS (global only)**
```powershell
# .error-banner / .error-banner-close / .success-banner are defined globally in src/styles.css.
# Components should not redeclare them — drift was found in May 2026 across 4+ files.
Select-String -Path "frontend/src/app" -Pattern '^\.error-banner\s*\{|^\.success-banner\s*\{' -Recurse -Include "*.css"
# Must return nothing — if a component needs these styles, they inherit from styles.css already.
```

**Gate 3e — No CSS fallback hex values `var(--token, #hex)` in component CSS**
```powershell
Select-String -Path "frontend/src/app" -Pattern "var\(--[^,)]+,\s*#[0-9a-fA-F]" -Recurse -Include "*.css" |
  Where-Object { $_.Line -notmatch "^\s*/\*" }
# Must return nothing — fallback hex values silently apply wrong brand colors when the token exists.
# If a token is missing from styles.css, ADD it there; never add a hex fallback in component CSS.
#
# Common fallback mistakes caught by this gate:
#   var(--color-success, #22c55e)  → #22c55e ≠ --color-success (#16A34A)  — wrong green
#   var(--color-warning, #f59e0b)  → #f59e0b ≠ --color-warning (#D97706)  — wrong amber
#   var(--color-white, #fff)       → technically same hex but use var(--color-white) directly
```

---

## 4. Module & Import Hygiene

**Gate 4a — ReactiveFormsModule only imported where reactive forms are actually used**
```powershell
# Find modules that import ReactiveFormsModule
$modulesWithRFM = Select-String -Path "frontend/src/app" -Pattern "ReactiveFormsModule" -Recurse -Include "*.module.ts"
# For each module listed, verify at least one component in that module uses FormGroup or FormControl
$modulesWithRFM | ForEach-Object {
  $moduleDir = Split-Path $_.Path
  $hasFormGroup = Select-String -Path $moduleDir -Pattern "FormGroup|FormControl" -Recurse -Include "*.ts"
  if (-not $hasFormGroup) { Write-Output "UNUSED ReactiveFormsModule: $($_.Path)" }
}
```

---

## 5. Template Correctness

**Gate 5a — Breadcrumbs use `path` key not `url`**
```powershell
Select-String -Path "frontend/src/app" -Pattern "breadcrumbItems" -Recurse -Include "*.ts" -l |
  ForEach-Object { Select-String -Path $_ -Pattern "url:" | Where-Object { $_.Line -match "label" } }
# Must return nothing — breadcrumb nav uses `path:` not `url:`
```

**Gate 5b — No stub buttons without disabled attribute**
```powershell
# Buttons with no (click) handler and no [disabled] are likely stubs
# This is a manual review — scan new HTML for <button> tags missing both
Select-String -Path "frontend/src/app/integration-hub" -Pattern "<button" -Recurse -Include "*.html" |
  Where-Object { $_.Line -notmatch "\(click\)" -and $_.Line -notmatch "disabled" -and $_.Line -notmatch "type=" }
# Review each result — placeholder buttons must have disabled + title="Coming soon"
```

---

## 6. Backend API Alignment

**Gate 6a — Every new `api.service.ts` method maps to a real backend endpoint**
```powershell
# Manual step: for each new method added to api.service.ts in this commit,
# verify the HTTP path exists in a controller file
$newMethods = git diff HEAD frontend/src/app/services/api.service.ts | Select-String "^\+" | Select-String "http\.(get|post|put|delete|patch)"
$newMethods | ForEach-Object {
  Write-Output "Verify endpoint exists: $($_.Line)"
  # Extract the URL and grep for it in the backend
}
```

---

## 7. Startup Performance (2026-06-16)

**Gate 7a — Node.js version is 24.x LTS**
```powershell
# Angular 19 requires Node 24 LTS for full compatibility
node --version
# Must output v24.x.x (Angular 19 is tested and verified with Node 24 LTS)
```

**Gate 7b — Angular CLI version matches Angular version**
```powershell
# In package.json, @angular/cli and @angular/core must have matching major versions
Select-String -Path "frontend/package.json" -Pattern '"@angular/cli"|"@angular/core"'
# Both must be 18.x.x or both 17.x.x (mixed versions cause build slowdown)
```

**Gate 7c — No heavy dependencies in main bundle**
```powershell
# Check bundle size after build
npm run build
# Review dist/axistechnologies-web-shell/browser/main.js size — should be <2MB
du -h dist/axistechnologies-web-shell/browser/main.js
```

**Gate 7d — Lazy-loading configured for feature modules**
```powershell
# Routes using loadChildren are lazy-loaded (don't block initial app startup)
Select-String -Path "frontend/src/app" -Pattern "loadChildren" -Recurse -Include "*.ts"
# Review: Most feature routes should use loadChildren for faster initial load
```

**Gate 7e — Proxy configuration exists and is valid**
```powershell
# proxy.conf.json must exist and be referenced in angular.json
Test-Path "frontend/proxy.conf.json"
Select-String -Path "frontend/angular.json" -Pattern '"proxyConfig"'
# Both must return success — missing proxy causes API requests to fail silently
```

---

## 8. New Component Checklist (run when adding a new .ts component file)

Check each item manually for new components:

- [ ] Class implements `OnInit, OnDestroy`
- [ ] Field `private destroy$ = new Subject<void>()` declared
- [ ] `ngOnDestroy()` calls `this.destroy$.next()` and `this.destroy$.complete()`
- [ ] Every `.subscribe()` has `.pipe(takeUntil(this.destroy$))` — including any inside `forEach` loops
- [ ] No `alert()` anywhere in the file
- [ ] No `console.log` anywhere in the file
- [ ] `errorMessage: string = ''` field for user-facing errors
- [ ] `breadcrumbItems` uses `path:` not `url:`
- [ ] All SVG icons use `stroke-width="1.75"`
- [ ] All action buttons have SVG icons and `display: inline-flex; align-items: center; gap: 0.375rem`
- [ ] `open*Modal()` methods reset all related state before opening
- [ ] Entity IDs captured in `const` before any `close*Modal()` call
- [ ] Component `.ts` started from `spec-kit/templates/angular-component.scaffold.ts`
- [ ] Component `.css` started from `spec-kit/templates/angular-component.scaffold.css` — never blank
- [ ] No `var(--token, #hex)` fallback values in component CSS (Gate 3e)

> Start every new component from **both** scaffold files — the `.ts` pre-wires lifecycle/error/modal patterns,
> the `.css` pre-wires token-correct button, table, modal, form, and error-banner styles so you never reach
> for a hex value by reflex.
