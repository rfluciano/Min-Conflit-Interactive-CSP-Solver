[CmdletBinding()]
param(
    [string]$ContainerName = "min-conflit-isolated"
)

$ErrorActionPreference = "Stop"

$containerJson = docker inspect $ContainerName | ConvertFrom-Json
$container = $containerJson[0]

$ports = @()
foreach ($property in $container.NetworkSettings.Ports.PSObject.Properties) {
    if ($property.Value) {
        foreach ($binding in $property.Value) {
            $ports += "$($property.Name) -> $($binding.HostIp):$($binding.HostPort)"
        }
    }
}

$browserCheck = docker exec $ContainerName sh -lc "command -v firefox chromium chromium-browser google-chrome google-chrome-stable >/dev/null 2>&1"
$browserPresent = $LASTEXITCODE -eq 0

$report = [pscustomobject]@{
    container = $container.Name.TrimStart('/')
    image = $container.Config.Image
    running = $container.State.Running
    read_only_rootfs = $container.HostConfig.ReadonlyRootfs
    mount_count = $container.Mounts.Count
    published_ports = ($ports -join ', ')
    security_options = ($container.HostConfig.SecurityOpt -join ', ')
    dropped_capabilities = ($container.HostConfig.CapDrop -join ', ')
    browser_found_in_container = $browserPresent
}

$report | Format-List

if ($container.Mounts.Count -eq 0) {
    Write-Host "Preuve 1: aucun dossier du projet n'est monte dans le conteneur."
}

if ($container.HostConfig.ReadonlyRootfs) {
    Write-Host "Preuve 2: le systeme de fichiers du conteneur est en lecture seule."
}

if (-not $browserPresent) {
    Write-Host "Preuve 3: aucun navigateur connu n'est installe dans l'image."
}
