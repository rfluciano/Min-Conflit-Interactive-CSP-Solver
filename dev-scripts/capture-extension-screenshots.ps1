[CmdletBinding()]
param(
    [string]$BaseUrl = "http://127.0.0.1:5000",
    [string]$OutputDir = "$PSScriptRoot\..\browser-extension\store-assets\screenshots"
)

$ErrorActionPreference = "Stop"

function Get-ChromePath {
    $candidates = @(
        "C:\Program Files\Google\Chrome\Application\chrome.exe",
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    )

    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate) {
            return $candidate
        }
    }

    throw "Google Chrome est introuvable dans les chemins standards."
}

function Wait-ForUrl {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 30
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
                return $true
            }
        }
        catch {
            Start-Sleep -Milliseconds 500
        }
    }

    return $false
}

function Capture-Page {
    param(
        [string]$ChromePath,
        [string]$Url,
        [string]$OutputPath,
        [string]$WindowSize
    )

    if (Test-Path -LiteralPath $OutputPath) {
        Remove-Item -LiteralPath $OutputPath -Force
    }

    & $ChromePath `
        --headless=new `
        --disable-gpu `
        --disable-software-rasterizer `
        --disable-features=UseSkiaRenderer,Vulkan `
        --hide-scrollbars `
        --run-all-compositor-stages-before-draw `
        "--window-size=$WindowSize" `
        "--screenshot=$OutputPath" `
        $Url | Out-Null

    if (-not (Test-Path -LiteralPath $OutputPath)) {
        throw "Chrome n'a pas cree le screenshot attendu pour $Url."
    }
}

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$chromePath = Get-ChromePath
$projectRoot = "$PSScriptRoot\.."
$serverProcess = $null
$startedServer = $false

try {
    if (-not (Wait-ForUrl -Url "$BaseUrl/health" -TimeoutSeconds 2)) {
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "python"
        $processInfo.Arguments = "app.py"
        $processInfo.WorkingDirectory = $projectRoot
        $processInfo.UseShellExecute = $false
        $processInfo.CreateNoWindow = $true
        $processInfo.EnvironmentVariables["APP_DEBUG"] = "0"
        $processInfo.EnvironmentVariables["APP_HOST"] = "127.0.0.1"
        $processInfo.EnvironmentVariables["APP_PORT"] = "5000"
        $serverProcess = [System.Diagnostics.Process]::Start($processInfo)
        $startedServer = $true
    }

    if (-not (Wait-ForUrl -Url "$BaseUrl/health" -TimeoutSeconds 30)) {
        throw "Le serveur Flask n'a pas repondu sur $BaseUrl."
    }

    $captures = @(
        @{
            Url = "$BaseUrl/extension-showcase"
            Path = Join-Path $OutputDir "extension-showcase.png"
            WindowSize = "1440,2600"
        },
        @{
            Url = "$BaseUrl/extension"
            Path = Join-Path $OutputDir "extension-workspace.png"
            WindowSize = "1440,1800"
        },
        @{
            Url = "$BaseUrl/extension-popup"
            Path = Join-Path $OutputDir "extension-popup.png"
            WindowSize = "420,900"
        },
        @{
            Url = "$BaseUrl/extension-privacy"
            Path = Join-Path $OutputDir "extension-privacy.png"
            WindowSize = "1280,1800"
        }
    )

    foreach ($capture in $captures) {
        Capture-Page -ChromePath $chromePath -Url $capture.Url -OutputPath $capture.Path -WindowSize $capture.WindowSize
        Write-Host "Captured $($capture.Path)"
    }
}
finally {
    if ($startedServer -and $serverProcess -and -not $serverProcess.HasExited) {
        $serverProcess.Kill()
        $serverProcess.WaitForExit()
    }
}
