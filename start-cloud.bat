@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title GRAVY v2.0 - Cloud (Cloudflare Tunnel)

set "ROOT=%~dp0"

echo.
echo  ===============================================
echo   GRAVY v2.0 - Inicio con Cloudflare Tunnel
echo  ===============================================
echo.

if not exist "%ROOT%pocketbase.exe" (
    echo  [ERROR] No se encontrý pocketbase.exe en %ROOT%
    echo  Presione cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo  Cerrando procesos anteriores en puertos 8088, 8089, 8090, 8091...
where pm2 >nul 2>nul && pm2 stop gravy-orchestrator >nul 2>nul
PowerShell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ports = 8088, 8089, 8090, 8091;" ^
    "foreach ($p in $ports) {" ^
    "  $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique;" ^
    "  if ($pids) { $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }" ^
    "}"

timeout /t 2 >nul

echo  Iniciando GRAVY HUB (localhost:8089)...
start "Gravy HUB" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=127.0.0.1:8089 --dir="%ROOT%hub\pb_data" --hooksDir="%ROOT%hub\pb_hooks""

echo  Iniciando GRAVY Orquestador (localhost:8088)...
where pm2 >nul 2>nul
if %ERRORLEVEL%==0 (
    echo    PM2 detectado: iniciando orquestador supervisado por PM2 ^(auto-restart^)...
    pm2 start "%ROOT%ecosystem.config.js"
    pm2 save >nul 2>nul
) else (
    start "Gravy Orchestrator" /B cmd /c "cd /d "%ROOT%" && node hub\orchestrator.js"
)

echo  Iniciando Empresa Demo (localhost:8090)...
start "Gravy Empresa Demo" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=127.0.0.1:8090 --dir="%ROOT%pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%pb_hooks""

echo  Esperando que los servicios arranquen...
timeout /t 4 >nul

:: Resolviendo ejecutable de Cloudflare Tunnel
set "CF_EXE="
if exist "%ROOT%bin\cloudflared.exe" (
    set "CF_EXE=%ROOT%bin\cloudflared.exe"
) else (
    where cloudflared >nul 2>nul
    if !ERRORLEVEL!==0 (
        set "CF_EXE=cloudflared"
    )
)

if "%CF_EXE%"=="" (
    echo.
    echo  [ADVERTENCIA] No se encontrý cloudflared.exe en 'bin\' ni en el PATH del sistema.
    echo  Ejecute 'setup-cloudflare.bat' para descargar e instalar el týnel automýticamente.
    echo.
    pause
    exit /b 1
)

echo  Iniciando Cloudflare Tunnel...

:: Usamos PowerShell para extraer el token exacto o ejecutar el týnel sin errores de parseo de CMD
PowerShell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$envFile = '%ROOT%config\cloudflare.env';" ^
    "$userCfg = '$env:USERPROFILE\.cloudflared\config.yml';" ^
    "$cfBin = '%CF_EXE%';" ^
    "if (Test-Path $envFile) {" ^
    "    $raw = Get-Content $envFile | Where-Object { $_ -match '^CLOUDFLARE_TUNNEL_TOKEN=' };" ^
    "    if ($raw) {" ^
    "        $token = $raw.Split('=', 2)[1].Trim();" ^
    "        Write-Host '   [Modo] Usando Tunnel Token (Zero Trust)...' -ForegroundColor Green;" ^
    "        Start-Process cmd -ArgumentList '/k', """"$cfBin"" tunnel run --token $token"" -WindowStyle Normal;" ^
    "        exit 0;" ^
    "    }" ^
    "}" ^
    "if (Test-Path $userCfg) {" ^
    "    Write-Host '   [Modo] Usando archivo config.yml...' -ForegroundColor Yellow;" ^
    "    Start-Process cmd -ArgumentList '/k', """"$cfBin"" tunnel --config ""$userCfg"" run" -WindowStyle Normal;" ^
    "    exit 0;" ^
    "}" ^
    "Write-Host '   [ERROR] No se encontrý token ni config.yml.' -ForegroundColor Red;" ^
    "exit 1;"

if %ERRORLEVEL% neq 0 (
    echo.
    echo  [ERROR] No se pudo iniciar el týnel de Cloudflare.
    echo  Por favor ejecute 'setup-cloudflare.bat' para configurar su týnel.
    echo.
    pause
    exit /b 1
)

echo.
echo  ================================================
echo   GRAVY estý disponible en Cloud:
echo.
echo    Web/App:  https://app.gravy-ms.com
echo    Hub:      https://hub.gravy-ms.com
echo    Local:    http://localhost:8090
echo  ================================================
echo.

timeout /t 6 >nul
start "" https://app.gravy-ms.com
exit /b 0
