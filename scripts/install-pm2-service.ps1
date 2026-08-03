# =====================================================================
# GRAVY v2.0 - Instalador de PM2 como servicio de arranque de Windows
# =====================================================================
# Este script:
#   1. Verifica que Node.js/npm estén disponibles.
#   2. Instala PM2 y pm2-windows-service de forma global (si faltan).
#   3. Configura PM2_HOME y PM2_SERVICE_SCRIPTS como variables de
#      entorno de MÁQUINA (persisten para el servicio de Windows).
#   4. Registra PM2 como servicio de Windows (arranca solo con el
#      sistema, incluso sin sesión de usuario iniciada).
#   5. Arranca el orquestador GRAVY (ecosystem.config.js) bajo PM2
#      y guarda la lista de procesos con `pm2 save` para que el
#      servicio los reviva automáticamente al iniciar.
#
# Ejecutar como Administrador. Doble clic o:
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\install-pm2-service.ps1
# =====================================================================

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[-] Este instalador requiere privilegios de Administrador." -ForegroundColor Yellow
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
Write-Host "   GRAVY v2.0 - Instalador de PM2 (Servicio Windows) " -ForegroundColor $green
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host ""

$rootPath = Resolve-Path "$PSScriptRoot\.."
$ecosystemPath = Join-Path $rootPath "ecosystem.config.js"
$pm2Home = Join-Path $env:ProgramData "pm2"

if (-not (Test-Path $ecosystemPath)) {
    Write-Host "[Error] No se encontró ecosystem.config.js en: $ecosystemPath" -ForegroundColor $red
    pause
    exit 1
}

# ─────────────────────────────────────────────
# 1. Verificar Node.js / npm
# ─────────────────────────────────────────────
Write-Host "[1/6] Verificando Node.js..." -ForegroundColor $cyan
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVer = node -v
    Write-Host "    [OK] Node.js detectado ($nodeVer)." -ForegroundColor $green
} else {
    Write-Host "    [!] Node.js no está instalado. Iniciando instalación vía Winget..." -ForegroundColor $yellow
    winget install OpenJS.NodeJS --silent --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "    [Error] Node.js se instaló pero requiere reiniciar la consola. Vuelve a ejecutar este script." -ForegroundColor $red
        pause
        exit 1
    }
    Write-Host "    [OK] Node.js instalado correctamente." -ForegroundColor $green
}

# ─────────────────────────────────────────────
# 2. Instalar PM2
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "[2/6] Instalando PM2 (global)..." -ForegroundColor $cyan
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    Write-Host "    [OK] PM2 ya está instalado ($(pm2 -v))." -ForegroundColor $green
} else {
    npm install -g pm2
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
        Write-Host "    [Error] No se pudo instalar PM2." -ForegroundColor $red
        pause
        exit 1
    }
    Write-Host "    [OK] PM2 instalado correctamente." -ForegroundColor $green
}

# ─────────────────────────────────────────────
# 3. Instalar pm2-windows-service
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "[3/6] Instalando pm2-windows-service (global)..." -ForegroundColor $cyan
$pm2ServiceInstalled = npm list -g pm2-windows-service --depth=0 2>$null | Select-String "pm2-windows-service"
if ($pm2ServiceInstalled) {
    Write-Host "    [OK] pm2-windows-service ya está instalado." -ForegroundColor $green
} else {
    npm install -g pm2-windows-service
    Write-Host "    [OK] pm2-windows-service instalado correctamente." -ForegroundColor $green
}

# ─────────────────────────────────────────────
# 4. Configurar variables de entorno de MÁQUINA
#    (necesarias para que el servicio de Windows encuentre PM2_HOME
#    y sepa qué procesos re-arrancar al iniciar el sistema)
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "[4/6] Configurando variables de entorno de sistema..." -ForegroundColor $cyan
[System.Environment]::SetEnvironmentVariable("PM2_HOME", $pm2Home, "Machine")
[System.Environment]::SetEnvironmentVariable("PM2_SERVICE_SCRIPTS", $ecosystemPath, "Machine")
$env:PM2_HOME = $pm2Home
$env:PM2_SERVICE_SCRIPTS = $ecosystemPath
Write-Host "    [OK] PM2_HOME = $pm2Home" -ForegroundColor $green
Write-Host "    [OK] PM2_SERVICE_SCRIPTS = $ecosystemPath" -ForegroundColor $green

# ─────────────────────────────────────────────
# 5. Registrar PM2 como servicio de Windows
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "[5/6] Registrando PM2 como servicio de Windows..." -ForegroundColor $cyan
Write-Host "    Se abrirá un asistente interactivo (pm2-service-install)." -ForegroundColor $yellow
Write-Host "    Responde 'Y' a las preguntas para aceptar la configuración." -ForegroundColor $yellow
Write-Host ""

# Detener/limpiar un registro previo del servicio si existiera, para permitir re-instalar sin conflicto.
try {
    $existingService = Get-Service -Name "PM2" -ErrorAction SilentlyContinue
    if ($existingService) {
        Write-Host "    [!] Ya existe un servicio 'PM2'. Se eliminará antes de reinstalar." -ForegroundColor $yellow
        Stop-Service -Name "PM2" -Force -ErrorAction SilentlyContinue
        & pm2-service-uninstall -n PM2 2>$null
        Start-Sleep -Seconds 2
    }
} catch {}

& pm2-service-install -n PM2

Write-Host ""
Write-Host "    [OK] Servicio PM2 registrado. Verifica con: Get-Service PM2" -ForegroundColor $green

# ─────────────────────────────────────────────
# 6. Arrancar el orquestador bajo PM2 y guardar el estado
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "[6/6] Arrancando el orquestador GRAVY bajo PM2..." -ForegroundColor $cyan

# Liberar el puerto 8088 si algo ya lo está usando (arranque previo sin PM2).
Get-NetTCPConnection -LocalPort 8088 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

Push-Location $rootPath
pm2 delete gravy-orchestrator 2>$null | Out-Null
pm2 start ecosystem.config.js
pm2 save
Pop-Location

Write-Host "    [OK] Orquestador arrancado y guardado en PM2 (pm2 save)." -ForegroundColor $green

Write-Host ""
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host "   INSTALACIÓN COMPLETADA" -ForegroundColor $green
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host "El orquestador ahora corre supervisado por PM2 y PM2 arrancará" -ForegroundColor $white
Write-Host "solo con Windows (servicio 'PM2'), incluso sin iniciar sesión." -ForegroundColor $white
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor $white
Write-Host "  pm2 status                     - ver estado del orquestador" -ForegroundColor $white
Write-Host "  pm2 logs gravy-orchestrator     - ver logs en vivo" -ForegroundColor $white
Write-Host "  pm2 restart gravy-orchestrator  - reiniciar manualmente" -ForegroundColor $white
Write-Host "  Get-Service PM2                 - ver estado del servicio de Windows" -ForegroundColor $white
Write-Host ""
pause
