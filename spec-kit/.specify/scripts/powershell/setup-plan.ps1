param(
    [switch]$Json
)

# Get the feature directory from feature.json
$featureJsonPath = "spec-kit\.specify\feature.json"
if (-not (Test-Path $featureJsonPath)) {
    if ($Json) {
        Write-Output "{}"
    } else {
        Write-Error "feature.json not found. Run /speckit.specify first."
    }
    exit 1
}

$featureData = Get-Content $featureJsonPath | ConvertFrom-Json
$featureDir = $featureData.feature_directory

if (-not $featureDir) {
    if ($Json) {
        Write-Output "{}"
    } else {
        Write-Error "No feature directory found in feature.json"
    }
    exit 1
}

# Construct paths
$specFile = Join-Path $featureDir "spec.md"
$planFile = Join-Path $featureDir "plan.md"
$specsDir = Split-Path $featureDir -Parent

# Get current branch
$branch = git branch --show-current 2>$null
if (-not $branch) {
    $branch = "main"
}

# Output JSON if requested
if ($Json) {
    $output = @{
        FEATURE_SPEC = $specFile
        IMPL_PLAN = $planFile
        SPECS_DIR = $specsDir
        BRANCH = $branch
    } | ConvertTo-Json
    Write-Output $output
} else {
    Write-Output "FEATURE_SPEC=$specFile"
    Write-Output "IMPL_PLAN=$planFile"
    Write-Output "SPECS_DIR=$specsDir"
    Write-Output "BRANCH=$branch"
}
