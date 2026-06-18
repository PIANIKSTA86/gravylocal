@echo off
setlocal EnableExtensions
chcp 65001 >nul
title GRAVY v2.0 - Cloud (Cloudflare Tunnel)

set "ROOT=%~dp0"

echo.
echo  ===============================================
echo   GRAVY v2.0 - Inicio con Cloudflare Tunnel
echo  ===============================================
echo.

if not exist "%ROOT%pocketbase.exe" (
    echo  [ERROR] No se encontro pocketbase.exe en %ROOT%
    pause
    exit /b 1
)

echo  Cerrando procesos anteriores en puertos 8088, 8089, 8090...
PowerShell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ports = 8088, 8089, 8090;" ^
    "foreach ($p in $ports) {" ^
    "  $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique;" ^
    "  if ($pids) { $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }" ^
    "}"

timeout /t 2 >nul

echo  Iniciando GRAVY HUB (localhost:8089)...
start "Gravy HUB" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=127.0.0.1:8089 --dir="%ROOT%hub\pb_data" --hooksDir="%ROOT%hub\pb_hooks""

echo  Iniciando GRAVY Orquestador (localhost:8088)...
start "Gravy Orchestrator" /B cmd /c "cd /d "%ROOT%" && node hub\orchestrator.js"

echo  Iniciando Empresa Demo (localhost:8090)...
start "Gravy Empresa Demo" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=127.0.0.1:8090 --dir="%ROOT%pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%pb_hooks""

echo  Esperando que los servicios arranquen...
timeout /t 4 >nul

echo  Iniciando Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --config C:\Users\JULIAN\.cloudflared\config.yml run gravy-tunnel"

echo.
echo  ================================================
echo   GRAVY esta disponible en:
echo.
echo    Web/App:  https://app.gravy-ms.com
echo    Hub:      https://hub.gravy-ms.com
echo    Local:    http://localhost:8090
echo  ================================================
echo.

timeout /t 6 >nul
start "" https://app.gravy-ms.com
exit /b 0
