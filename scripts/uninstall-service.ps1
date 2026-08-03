# PowerShell Script to cleanly uninstall GravyLocal 2.0 background services.
# Run as Administrator.

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[-] Este desinstalador requiere privilegios de Administrador." -ForegroundColor Yellow
    Write-Host "[*] Solicitando elevación de permisos..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Clear-Host
$cyan = [ConsoleColor]::Cyan
$green = [ConsoleColor]::Green
$yellow = [ConsoleColor]::Yellow
$red = [ConsoleColor]::Red
$white = [ConsoleColor]::White

Write-Host "===================================================" -ForegroundColor $cyan
Write-Host "   GRAVY v2.0 - Desinstalador de Servicios          " -ForegroundColor $red
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host ""

$rootPath = Resolve-Path "$PSScriptRoot\.."

Write-Host "[1/4] Deteniendo y eliminando Tarea Programada..." -ForegroundColor $cyan
$taskName = "GravyLocalServices"

# Detener si está corriendo
Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
# Desregistrar
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
Write-Host "    [✔] Tarea '$taskName' eliminada con éxito." -ForegroundColor $green

Write-Host ""
Write-Host "[2/4] Deteniendo procesos activos de base de datos..." -ForegroundColor $cyan
if (Test-Path "$rootPath\kill.ps1") {
    powershell -NoProfile -ExecutionPolicy Bypass -File "$rootPath\kill.ps1"
    Write-Host "    [✔] Procesos en puertos finalizados." -ForegroundColor $green
} else {
    Write-Host "    [X] No se encontró kill.ps1, saltando detención de puertos." -ForegroundColor $yellow
}

Write-Host ""
Write-Host "[3/4] Eliminando reglas del Firewall..." -ForegroundColor $cyan
$ports = @(8088, 8089, 8090, 8091)
foreach ($port in $ports) {
    $ruleName = "Gravy Port $port"
    netsh advfirewall firewall delete rule name="$ruleName" > $null 2>&1
    Write-Host "    [✔] Regla de firewall para puerto $port eliminada." -ForegroundColor $green
}

Write-Host ""
Write-Host "[4/4] Limpiando accesos directos del Escritorio..." -ForegroundColor $cyan
$desktopPath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath("Desktop"))
$shortcuts = @(
    "Abrir GravyLocal.url",
    "Iniciar GravyLocal (Manual).lnk",
    "Detener GravyLocal (Manual).lnk"
)

foreach ($sc in $shortcuts) {
    $filePath = Join-Path $desktopPath $sc
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        Write-Host "    [✔] Eliminado acceso directo: $sc" -ForegroundColor $green
    }
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host "   DESINSTALACIÓN COMPLETADA CON ÉXITO             " -ForegroundColor $green
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host "Los servicios automáticos han sido completamente removidos." -ForegroundColor $white
Write-Host ""
pause
