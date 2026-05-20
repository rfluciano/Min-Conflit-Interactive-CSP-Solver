[CmdletBinding()]
param(
    [string]$ImageTag = "min-conflit:portable",
    [string]$ArchivePath = "X:\Projets\M2\ADOMC\docker-images\min-conflit-portable.tar",
    [string]$ContainerName = "min-conflit-isolated",
    [int]$HostPort = 5000,
    [switch]$Detach
)

$ErrorActionPreference = "Stop"

$imagePresent = $true
try {
    docker image inspect $ImageTag | Out-Null
}
catch {
    $imagePresent = $false
}

if (-not $imagePresent) {
    if (-not (Test-Path -LiteralPath $ArchivePath)) {
        throw "Image introuvable. Lance d'abord scripts/export-docker-image.ps1 ou place l'archive a $ArchivePath."
    }

    Write-Host "Chargement de l'image depuis $ArchivePath"
    docker load --input $ArchivePath | Out-Host
}

$existingContainer = docker ps -aq --filter "name=^${ContainerName}$"
if ($existingContainer) {
    throw "Le conteneur '$ContainerName' existe deja. Supprime-le avec: docker rm -f $ContainerName"
}

Write-Host "Demarrage du conteneur isole sur http://127.0.0.1:$HostPort"
Write-Host "Aucun dossier du projet n'est monte dans le conteneur."

if ($Detach) {
    docker run `
        -d `
        --rm `
        --name $ContainerName `
        --publish "${HostPort}:5000" `
        --read-only `
        --tmpfs /tmp:rw,noexec,nosuid,size=64m `
        --security-opt no-new-privileges `
        --cap-drop ALL `
        --pids-limit 100 `
        --memory 512m `
        --cpus 1.0 `
        --pull never `
        --env APP_HOST=0.0.0.0 `
        --env APP_PORT=5000 `
        --env APP_DEBUG=0 `
        $ImageTag
} else {
    docker run `
        --rm `
        --name $ContainerName `
        --publish "${HostPort}:5000" `
        --read-only `
        --tmpfs /tmp:rw,noexec,nosuid,size=64m `
        --security-opt no-new-privileges `
        --cap-drop ALL `
        --pids-limit 100 `
        --memory 512m `
        --cpus 1.0 `
        --pull never `
        --env APP_HOST=0.0.0.0 `
        --env APP_PORT=5000 `
        --env APP_DEBUG=0 `
        $ImageTag
}

