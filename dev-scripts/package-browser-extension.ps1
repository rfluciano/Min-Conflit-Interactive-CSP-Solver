[CmdletBinding()]
param(
    [string]$ExtensionRoot = "$PSScriptRoot\..\browser-extension",
    [string]$OutputDir = "$PSScriptRoot\..\dist\browser-extension"
)

$ErrorActionPreference = "Stop"

$manifestPath = Join-Path $ExtensionRoot "manifest.json"
if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "manifest.json introuvable dans $ExtensionRoot"
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
$packageName = "min-conflit-solver-chrome-v$version.zip"
$packagePath = Join-Path $OutputDir $packageName
$stageDir = Join-Path $env:TEMP "min-conflit-solver-stage"

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

& "$PSScriptRoot\generate-extension-icons.ps1" | Out-Host

if (Test-Path -LiteralPath $packagePath) {
    Remove-Item -LiteralPath $packagePath -Force
}

if (Test-Path -LiteralPath $stageDir) {
    Remove-Item -LiteralPath $stageDir -Recurse -Force
}

New-Item -ItemType Directory -Path $stageDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stageDir "icons") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stageDir "lib") -Force | Out-Null

Copy-Item -LiteralPath (Join-Path $ExtensionRoot "manifest.json") -Destination $stageDir
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "app.html") -Destination $stageDir
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "app.css") -Destination $stageDir
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "app.js") -Destination $stageDir
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "popup.html") -Destination $stageDir
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "popup.css") -Destination $stageDir
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "popup.js") -Destination $stageDir
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "worker.js") -Destination $stageDir
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "icons\icon-16.png") -Destination (Join-Path $stageDir "icons")
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "icons\icon-32.png") -Destination (Join-Path $stageDir "icons")
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "icons\icon-48.png") -Destination (Join-Path $stageDir "icons")
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "icons\icon-128.png") -Destination (Join-Path $stageDir "icons")
Copy-Item -LiteralPath (Join-Path $ExtensionRoot "lib\solvers.js") -Destination (Join-Path $stageDir "lib")

Compress-Archive -Path (Join-Path $stageDir "*") -DestinationPath $packagePath

Write-Host "Extension package created: $packagePath"
