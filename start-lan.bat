@echo off
setlocal EnableExtensions
chcp 65001 >nul
title GRAVY v2.0 - Start LAN

set "ROOT=%~dp0"

echo.
echo  ===============================================
echo   GRAVY v2.0 - Inicio LAN (Servidores Web)
echo  ===============================================
echo.

if not exist "%ROOT%pocketbase.exe" (
  echo  [ERROR] No se encontro pocketbase.exe en %ROOT%
  pause
  exit /b 1
)

for /f %%I in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "$ip=(Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -notlike '127.*' -and $_.InterfaceAlias -notmatch 'Loopback^|vEthernet^|WSL^|Hyper-V' } ^| Select-Object -First 1 -ExpandProperty IPAddress); if(-not $ip){$ip='localhost'}; Write-Output $ip"') do set "LOCAL_IP=%%I"

set "PB_URL=http://%LOCAL_IP%:8090"

echo  IP detectada: %LOCAL_IP%
echo  Backend URL:  %PB_URL%
echo.

echo  Cerrando procesos anteriores en puertos 8080-8150...
if exist "%ROOT%kill.ps1" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%kill.ps1" >nul 2>&1
) else (
  PowerShell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort (8080..8150) -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
)

echo  Intentando habilitar firewall para rango 8080-8150...
netsh advfirewall firewall add rule name="Gravy Suite (8080-8150)" dir=in action=allow protocol=TCP localport=8080-8150 >nul 2>&1

echo  Iniciando GRAVY HUB (LAN: 8089)...
start "Gravy HUB LAN" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=0.0.0.0:8089 --dir="%ROOT%hub\pb_data" --hooksDir="%ROOT%hub\pb_hooks""

echo  Iniciando GRAVY Orquestador (LAN: 8088)...
set "GRAVY_BIND_IP=0.0.0.0"
start "Gravy Orchestrator LAN" /B cmd /c "cd /d "%ROOT%" && node hub\orchestrator.js"

echo  Iniciando Empresa Principal (LAN: 8090)...
start "Gravy Empresa Principal LAN" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=0.0.0.0:8090 --dir="%ROOT%pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%pb_hooks""
echo    - Las demas empresas registradas se inician automaticamente via Orquestador.

echo.
echo  Accesos:
echo    - Web/Backend (PC):  http://localhost:8090
echo    - Web/Backend (LAN): %PB_URL%
echo    - Hub (PC):          http://localhost:8089
echo    - Hub (LAN):         http://%LOCAL_IP%:8089
echo.

start "" http://localhost:8090
exit /b 0
