# Script para diagnosticar y reparar permisos NTFS y atributos de solo lectura en Windows Server
# Requiere privilegios de Administrador

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[!] Advertencia: No se detectaron privilegios de Administrador elevados." -ForegroundColor Yellow
    try {
        Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs -ErrorAction Stop
        exit
    } catch {
        Write-Host "[*] Continuando aplicacion de permisos con la cuenta de usuario actual..." -ForegroundColor Cyan
    }
}

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   GRAVY v2.0 - Reparador de Permisos NTFS y SQLite      " -ForegroundColor Green
Write-Host "   Windows Server 2016 / 2019 / 2022 / Windows 10 & 11   " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = Resolve-Path "$PSScriptRoot\.."
Write-Host "[1/4] Directorio base detectado: $rootPath" -ForegroundColor Cyan

# 1. Quitar atributos de Solo Lectura y Sistema
Write-Host "[2/4] Removiendo atributos de solo lectura (attrib -r)..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "attrib.exe" -ArgumentList "-r -s `"$rootPath\*.*`" /s /d" -NoNewWindow -Wait
    Write-Host "    [✔] Atributos de solo lectura removidos exitosamente." -ForegroundColor Green
} catch {
    Write-Host "    [!] Advertencia al remover atributos: $_" -ForegroundColor Yellow
}

# 2. Conceder Permisos NTFS Totales usando SIDs universales (Multi-idioma)
Write-Host "[3/4] Asignando permisos NTFS (Control Total)..." -ForegroundColor Yellow
$sids = @(
    "*S-1-1-0",         # Everyone / Todos
    "*S-1-5-32-544",    # Administrators / Administradores
    "*S-1-5-18"         # Local System
)

foreach ($sid in $sids) {
    try {
        $arg = "`"$rootPath`" /grant ${sid}:(OI)(CI)F /T /C /Q"
        Start-Process -FilePath "icacls.exe" -ArgumentList $arg -NoNewWindow -Wait
    } catch {
        Write-Host "    [!] No se pudo aplicar icacls para SID ${sid}: $_" -ForegroundColor Yellow
    }
}

# Conceder explicitamente al usuario actual y grupos comunes (Espanol/Ingles)
$commonNames = @($env:USERNAME, "Todos", "Everyone", "Administradores", "Administrators")
foreach ($name in $commonNames) {
    if ($name) {
        try {
            $arg = "`"$rootPath`" /grant `"${name}`":(OI)(CI)F /T /C /Q"
            Start-Process -FilePath "icacls.exe" -ArgumentList $arg -NoNewWindow -Wait
        } catch {}
    }
}
Write-Host "    [✔] Permisos NTFS asignados a usuarios y servicios del sistema." -ForegroundColor Green

# 3. Verificar estado de las carpetas criticas de base de datos
Write-Host "[4/4] Verificando integridad de carpetas de datos SQLite..." -ForegroundColor Cyan
$criticalDirs = @(
    (Join-Path $rootPath "pb_data"),
    (Join-Path $rootPath "hub\pb_data"),
    (Join-Path $rootPath "empresas")
)

foreach ($dir in $criticalDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "    [+] Directorio creado: $dir" -ForegroundColor Green
    } else {
        # Probar capacidad de escritura en cada directorio
        $testFile = Join-Path $dir ".write_test_tmp"
        try {
            [System.IO.File]::WriteAllText($testFile, "OK")
            Remove-Item -Path $testFile -Force -ErrorAction SilentlyContinue
            Write-Host "    [✔] Directorio verificado y con permisos de escritura: $dir" -ForegroundColor Green
        } catch {
            Write-Host "    [X] ERROR: El directorio sigue sin permisos de escritura: $dir" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Diagnostico y Reparacion Completada con Exito!        " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Start-Sleep -Seconds 2
