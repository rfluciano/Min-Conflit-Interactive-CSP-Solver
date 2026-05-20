[CmdletBinding()]
param(
    [string]$ImageTag = "min-conflit:portable",
    [string]$ArchivePath = "X:\Projets\M2\ADOMC\docker-images\min-conflit-portable.tar"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$archiveDir = Split-Path -Parent $ArchivePath

if (-not (Test-Path -LiteralPath $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
}

Push-Location $projectRoot
try {
    docker build --tag $ImageTag .
    docker save --output $ArchivePath $ImageTag
}
finally {
    Pop-Location
}

$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $ArchivePath).Hash
$hashPath = "$ArchivePath.sha256.txt"
"SHA256  $hash" | Set-Content -Encoding ascii -LiteralPath $hashPath

Write-Host "Image Docker exportee vers: $ArchivePath"
Write-Host "Empreinte SHA256 ecrite dans: $hashPath"
Write-Host "Chargement sur une autre machine: docker load --input `"$ArchivePath`""
