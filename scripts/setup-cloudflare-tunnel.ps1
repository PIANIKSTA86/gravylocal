<#
.SYNOPSIS
    Gravy v2.0 - Asistente de Configuración de Cloudflare Tunnel
.DESCRIPTION
    Script profesional para la instalación, descarga portable, configuración (Token o Config.yml),
    ejecución y diagnóstico de Cloudflare Tunnels para GRAVY.
#>

[CmdletBinding()]
param (
    [string]$Mode = "",
    [string]$Token = ""
)

$ErrorActionPreference = "Stop"

# Directorio raíz del proyecto
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

$BinDir = Join-Path $ProjectRoot "bin"
$CloudflaredBin = Join-Path $ProjectRoot "bin\cloudflared.exe"
$ConfigDir = Join-Path $ProjectRoot "config"
$TokenFile = Join-Path $ConfigDir "cloudflare.env"
$UserProfileDir = [System.Environment]::GetFolderPath("UserProfile")
$CloudflaredUserDir = Join-Path $UserProfileDir ".cloudflared"
$UserConfigFile = Join-Path $CloudflaredUserDir "config.yml"

# --- FUNCIONES ---
function Log-Info([string]$msg) { Write-Host " [*] $msg" -ForegroundColor Cyan }
function Log-Success([string]$msg) { Write-Host " [OK] $msg" -ForegroundColor Green }
function Log-Warn([string]$msg) { Write-Host " [WARN] $msg" -ForegroundColor Yellow }
function Log-Err([string]$msg) { Write-Host " [ERROR] $msg" -ForegroundColor Red }

function Show-Header {
    Clear-Host
    Write-Host '==================================================================' -ForegroundColor Cyan
    Write-Host '         GRAVY v2.0 - CONFIGURACIÓN DE CLOUDFLARE TUNNEL          ' -ForegroundColor Yellow
    Write-Host '==================================================================' -ForegroundColor Cyan
    Write-Host ''
}

function Test-CloudflaredBinary {
    if (Test-Path $CloudflaredBin) {
        return $CloudflaredBin
    }
    $systemCloudflared = Get-Command "cloudflared" -ErrorAction SilentlyContinue
    if ($systemCloudflared) {
        return $systemCloudflared.Source
    }
    return $null
}

function Install-CloudflaredBinary {
    Log-Info 'Verificando ejecutable de cloudflared...'
    $exePath = Test-CloudflaredBinary
    if ($exePath) {
        Log-Success "Detectado cloudflared en: $exePath"
        return $exePath
    }

    Log-Warn 'cloudflared.exe no encontrado en bin\ ni en el PATH del sistema.'
    Log-Info 'Descargando cloudflared.exe portable desde GitHub oficial...'

    if (-not (Test-Path $BinDir)) {
        New-Item -ItemType Directory -Path $BinDir | Out-Null
    }

    $downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $downloadUrl -OutFile $CloudflaredBin -UseBasicParsing
        Log-Success "Descarga completada exitosamente en $CloudflaredBin"
        return $CloudflaredBin
    }
    catch {
        Log-Err "Falló la descarga de cloudflared: $_"
        Log-Warn 'Por favor descargue cloudflared-windows-amd64.exe de Cloudflare y colóquelo como:'
        Write-Host "    $CloudflaredBin" -ForegroundColor White
        return $null
    }
}

function Start-CloudflaredTunnel {
    $exe = Install-CloudflaredBinary
    if (-not $exe) {
        Log-Err 'No se pudo localizar ni descargar cloudflared.exe'
        exit 1
    }

    if (Test-Path $TokenFile) {
        $raw = Get-Content $TokenFile | Where-Object { $_ -match "^CLOUDFLARE_TUNNEL_TOKEN=" }
        if ($raw) {
            $token = $raw.Split("=", 2)[1].Trim()
            Log-Success 'Iniciando Cloudflare Tunnel con Token...'
            Start-Process cmd -ArgumentList "/k", "`"$exe`" tunnel run --token $token" -WindowStyle Normal
            exit 0
        }
    }

    if (Test-Path $UserConfigFile) {
        Log-Success "Iniciando Cloudflare Tunnel con config.yml ($UserConfigFile)..."
        Start-Process cmd -ArgumentList "/k", "`"$exe`" tunnel --config `"$UserConfigFile`" run" -WindowStyle Normal
        exit 0
    }

    Log-Err 'No se encontró token guardado en config\cloudflare.env ni config.yml en %USERPROFILE%\.cloudflared'
    Log-Warn 'Ejecute setup-cloudflare.bat para configurar su túnel.'
    exit 1
}

function Configure-TokenMode {
    param([string]$InputToken)

    Show-Header
    Write-Host '--- MODO 1: TUNNEL TOKEN (REMOTE MANAGED / ZERO TRUST) ---' -ForegroundColor Yellow
    Write-Host 'Este modo es el recomendado por Cloudflare. Utiliza un Token de Túnel' -ForegroundColor Gray
    Write-Host 'generado desde el Dashboard de Cloudflare Zero Trust (Tunnels).' -ForegroundColor Gray
    Write-Host ''

    if ([string]::IsNullOrWhiteSpace($InputToken)) {
        Log-Info 'Pegue a continuación su TUNNEL TOKEN de Cloudflare:'
        $InputToken = Read-Host "Token"
    }

    if ([string]::IsNullOrWhiteSpace($InputToken)) {
        Log-Err 'El token no puede estar vacío.'
        return
    }

    if (-not (Test-Path $ConfigDir)) {
        New-Item -ItemType Directory -Path $ConfigDir | Out-Null
    }

    $envContent = "# GRAVY Cloudflare Tunnel Configuration`nCLOUDFLARE_TUNNEL_TOKEN=$InputToken`n"
    Set-Content -Path $TokenFile -Value $envContent -Encoding UTF8
    Write-Host ''
    Log-Success "Token guardado exitosamente en: $TokenFile"
}

function Configure-LocalConfigMode {
    Show-Header
    Write-Host '--- MODO 2: ARCHIVO CONFIG.YML LOCAL (CLI / CERT) ---' -ForegroundColor Yellow
    Write-Host 'Este modo utiliza un archivo config.yml en %USERPROFILE%\.cloudflared' -ForegroundColor Gray
    Write-Host ''

    if (-not (Test-Path $CloudflaredUserDir)) {
        New-Item -ItemType Directory -Path $CloudflaredUserDir | Out-Null
    }

    Log-Info 'Ingrese el UUID de su Túnel de Cloudflare (ej: 788fa41a-371a-44df-96e4-ddbc2527451f):'
    $tunnelId = Read-Host "Tunnel ID"

    if ([string]::IsNullOrWhiteSpace($tunnelId)) {
        Log-Err 'El Tunnel ID no puede estar vacío.'
        return
    }

    $jsonCredPath = Join-Path $CloudflaredUserDir "$tunnelId.json"

    Log-Info 'Ingrese el dominio principal de la App (Default: app.gravy-ms.com):'
    $appDomain = Read-Host "Dominio App [app.gravy-ms.com]"
    if ([string]::IsNullOrWhiteSpace($appDomain)) { $appDomain = "app.gravy-ms.com" }

    Log-Info 'Ingrese el dominio del Hub (Default: hub.gravy-ms.com):'
    $hubDomain = Read-Host "Dominio Hub [hub.gravy-ms.com]"
    if ([string]::IsNullOrWhiteSpace($hubDomain)) { $hubDomain = "hub.gravy-ms.com" }

    $line1 = "tunnel: " + $tunnelId
    $line2 = "credentials-file: " + $jsonCredPath
    $line3 = ""
    $line4 = "ingress:"
    $line5 = "  # App principal (PocketBase empresa + frontend web)"
    $line6 = "  - hostname: " + $appDomain
    $line7 = "    service: http://127.0.0.1:8090"
    $line8 = ""
    $line9 = "  # Hub central de Gravy"
    $line10 = "  - hostname: " + $hubDomain
    $line11 = "    service: http://127.0.0.1:8089"
    $line12 = ""
    $line13 = "  # Regla catch-all obligatoria (siempre al final)"
    $line14 = "  - service: http_status:404"

    $ymlLines = @($line1, $line2, $line3, $line4, $line5, $line6, $line7, $line8, $line9, $line10, $line11, $line12, $line13, $line14)
    $ymlContent = $ymlLines -join "`n"
    Set-Content -Path $UserConfigFile -Value $ymlContent -Encoding UTF8

    if (Test-Path $TokenFile) {
        Remove-Item -Path $TokenFile -Force -ErrorAction SilentlyContinue
    }

    Write-Host ''
    Log-Success 'Archivo config.yml generado dinámicamente en:'
    Write-Host "     $UserConfigFile" -ForegroundColor White
    Log-Warn 'Asegúrese de que la clave JSON exista en:'
    Write-Host "     $jsonCredPath" -ForegroundColor White
}

function Test-Diagnostics {
    Show-Header
    Write-Host '--- DIAGNÓSTICO Y PRUEBA DE CONEXIÓN ---' -ForegroundColor Yellow
    Write-Host ''

    # 1. Ejecutable
    $exe = Test-CloudflaredBinary
    if ($exe) {
        Log-Success "Ejecutable cloudflared: $exe"
    } else {
        Log-Err 'No se encontró cloudflared.exe'
    }

    # 2. Configuración
    if (Test-Path $TokenFile) {
        Log-Success "Modo de inicio: TUNNEL TOKEN ($TokenFile)"
    } elseif (Test-Path $UserConfigFile) {
        Log-Success "Modo de inicio: CONFIG.YML LOCAL ($UserConfigFile)"
    } else {
        Log-Err 'No se encontró token ni config.yml configurado.'
    }

    # 3. Puertos locales
    $conn8090 = Get-NetTCPConnection -LocalPort 8090 -State Listen -ErrorAction SilentlyContinue
    if ($conn8090) {
        $pid8090 = ($conn8090 | Select-Object -ExpandProperty OwningProcess -Unique) -join ', '
        Log-Success "Puerto 8090 (GRAVY App Empresa): Escuchando (PID $pid8090)"
    } else {
        Log-Warn 'Puerto 8090 (GRAVY App Empresa): Inactivo (inicie GRAVY primero con start-cloud.bat)'
    }

    $conn8089 = Get-NetTCPConnection -LocalPort 8089 -State Listen -ErrorAction SilentlyContinue
    if ($conn8089) {
        $pid8089 = ($conn8089 | Select-Object -ExpandProperty OwningProcess -Unique) -join ', '
        Log-Success "Puerto 8089 (GRAVY HUB Central): Escuchando (PID $pid8089)"
    } else {
        Log-Warn 'Puerto 8089 (GRAVY HUB Central): Inactivo (inicie GRAVY primero con start-cloud.bat)'
    }

    $conn8088 = Get-NetTCPConnection -LocalPort 8088 -State Listen -ErrorAction SilentlyContinue
    if ($conn8088) {
        $pid8088 = ($conn8088 | Select-Object -ExpandProperty OwningProcess -Unique) -join ', '
        Log-Success "Puerto 8088 (GRAVY Orquestador / Firma DIAN): Escuchando (PID $pid8088)"
    } else {
        Log-Warn 'Puerto 8088 (GRAVY Orquestador / Firma DIAN): Inactivo (verifique el servicio PM2 o start-cloud.bat)'
    }

    # 4. Prueba rápida de versión
    if ($exe) {
        Write-Host ''
        Log-Info 'Versión de cloudflared:'
        & $exe --version
    }
}

function Manage-WindowsService {
    Show-Header
    Write-Host '--- ADMINISTRAR SERVICIO DE WINDOWS ---' -ForegroundColor Yellow
    Write-Host 'Instalar Cloudflare Tunnel como un servicio de fondo nativo de Windows.' -ForegroundColor Gray
    Write-Host ''

    $exe = Install-CloudflaredBinary
    if (-not $exe) { return }

    Write-Host '1. Instalar Servicio con Tunnel Token'
    Write-Host '2. Desinstalar Servicio Cloudflare'
    Write-Host '3. Volver al menú principal'
    Write-Host ''
    $op = Read-Host "Elija una opción (1-3)"

    switch ($op) {
        "1" {
            $token = ""
            if (Test-Path $TokenFile) {
                $raw = Get-Content $TokenFile | Where-Object { $_ -match "^CLOUDFLARE_TUNNEL_TOKEN=" }
                if ($raw) { $token = $raw.Split("=")[1].Trim() }
            }
            if ([string]::IsNullOrWhiteSpace($token)) {
                $token = Read-Host "Ingrese su Cloudflare Tunnel Token"
            }
            if ([string]::IsNullOrWhiteSpace($token)) {
                Log-Err 'Token no proporcionado.'
                return
            }

            Log-Info 'Instalando servicio con token...'
            try {
                & $exe service install $token
                Log-Success 'Servicio instalado exitosamente.'
            } catch {
                Log-Err "Error al instalar el servicio (requiere permisos de Administrador): $_"
            }
        }
        "2" {
            Log-Info 'Desinstalando servicio...'
            try {
                & $exe service uninstall
                Log-Success 'Servicio desinstalado exitosamente.'
            } catch {
                Log-Err "Error al desinstalar el servicio: $_"
            }
        }
    }
}

# --- EJECUCIÓN PRINCIPAL ---
if ($Mode -eq "run") {
    Start-CloudflaredTunnel
    exit 0
}

if ($Mode -eq "diag" -or $Mode -eq "test") {
    Test-Diagnostics
    exit 0
}

if ($Mode -eq "token" -and $Token) {
    Configure-TokenMode -InputToken $Token
    exit 0
}

$exe = Install-CloudflaredBinary

while ($true) {
    Show-Header
    Write-Host 'Elija una opción de configuración:' -ForegroundColor White
    Write-Host ''
    Write-Host '  1. Configurar por Tunnel Token (Recomendado / Cloudflare Zero Trust)' -ForegroundColor Green
    Write-Host '  2. Configurar por archivo local config.yml (Modo CLI Tradicional)' -ForegroundColor Yellow
    Write-Host '  3. Ejecutar Diagnóstico de Túnel y Conectividad' -ForegroundColor Cyan
    Write-Host '  4. Administrar Servicio de Windows (Autostart)' -ForegroundColor Magenta
    Write-Host '  5. Descargar / Actualizar cloudflared.exe portable' -ForegroundColor Blue
    Write-Host '  0. Salir' -ForegroundColor Gray
    Write-Host ''

    $choice = Read-Host "Opción (0-5)"

    switch ($choice) {
        "1" { Configure-TokenMode; Write-Host "Presione Enter para continuar..."; [void][System.Console]::ReadLine() }
        "2" { Configure-LocalConfigMode; Write-Host "Presione Enter para continuar..."; [void][System.Console]::ReadLine() }
        "3" { Test-Diagnostics; Write-Host "Presione Enter para continuar..."; [void][System.Console]::ReadLine() }
        "4" { Manage-WindowsService; Write-Host "Presione Enter para continuar..."; [void][System.Console]::ReadLine() }
        "5" { Install-CloudflaredBinary; Write-Host "Presione Enter para continuar..."; [void][System.Console]::ReadLine() }
        "0" { exit 0 }
        default { Write-Host 'Opción inválida.' -ForegroundColor Red; Start-Sleep -Seconds 1 }
    }
}
