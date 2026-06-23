param(
    [switch]$Json
)

# Get repository root first
$repoRoot = $PSScriptRoot
for ($i = 0; $i -lt 4; $i++) {
    $repoRoot = Split-Path $repoRoot -Parent
}

# Get the feature directory from feature.json
$featureJsonPath = Join-Path $repoRoot "spec-kit\.specify\feature.json"
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
$featureDirAbsolute = Join-Path $repoRoot $featureDir
$featureDirAbsolute = Resolve-Path $featureDirAbsolute

$tasksTemplatePath = Join-Path $repoRoot "spec-kit\.specify\templates\tasks-template.md"
if (Test-Path $tasksTemplatePath) {
    $tasksTemplateAbsolute = Resolve-Path $tasksTemplatePath
} else {
    $tasksTemplateAbsolute = ""
}

# Check for available docs
$availableDocs = @()
$docsToCheck = @("research.md", "data-model.md", "quickstart.md", "contracts/")
foreach ($doc in $docsToCheck) {
    $docPath = Join-Path $featureDirAbsolute $doc
    if (Test-Path $docPath) {
        $availableDocs += $doc
    }
}

# Output JSON if requested
if ($Json) {
    $output = @{
        FEATURE_DIR = $featureDirAbsolute
        TASKS_TEMPLATE = $tasksTemplateAbsolute
        AVAILABLE_DOCS = $availableDocs
    } | ConvertTo-Json
    Write-Output $output
} else {
    Write-Output "FEATURE_DIR=$featureDirAbsolute"
    Write-Output "TASKS_TEMPLATE=$tasksTemplateAbsolute"
    Write-Output "AVAILABLE_DOCS=$($availableDocs -join ',')"
}
