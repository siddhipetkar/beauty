Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "   Lumiere Beauty - Smart Shade Shopping (Java Backend)" -ForegroundColor Magenta
Write-Host "   Starting server on http://localhost:8080 ..." -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot
Start-Process "http://localhost:8080"
java LumiereServer.java
