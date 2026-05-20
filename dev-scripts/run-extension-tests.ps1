[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

Push-Location "$PSScriptRoot\.."
try {
    node --test browser-extension\tests\solvers.test.js
}
finally {
    Pop-Location
}
