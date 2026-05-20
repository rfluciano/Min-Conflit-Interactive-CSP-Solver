[CmdletBinding()]
param(
    [string]$OutputDir = "$PSScriptRoot\..\browser-extension\icons"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$sizes = @(16, 32, 48, 128)
$bgTop = [System.Drawing.ColorTranslator]::FromHtml("#7867FF")
$bgBottom = [System.Drawing.ColorTranslator]::FromHtml("#19C2B0")
$ink = [System.Drawing.ColorTranslator]::FromHtml("#F6FAFF")

foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap $size, $size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#07111F"))

    $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
    $rectF = New-Object System.Drawing.RectangleF 0, 0, $size, $size
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $bgTop, $bgBottom, 45
    $graphics.FillEllipse($brush, 0, 0, $size - 1, $size - 1)

    $innerBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(22, 255, 255, 255))
    $graphics.FillEllipse($innerBrush, [int]($size * 0.1), [int]($size * 0.1), [int]($size * 0.8), [int]($size * 0.8))

    $fontSize = if ($size -le 16) { 7.5 } elseif ($size -le 32) { 12 } elseif ($size -le 48) { 18 } else { 44 }
    $font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $stringBrush = New-Object System.Drawing.SolidBrush $ink
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    $graphics.DrawString("MC", $font, $stringBrush, $rectF, $stringFormat)

    $path = Join-Path $OutputDir "icon-$size.png"
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

    $stringFormat.Dispose()
    $stringBrush.Dispose()
    $font.Dispose()
    $innerBrush.Dispose()
    $brush.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
}

Write-Host "Extension icons generated in $OutputDir"
