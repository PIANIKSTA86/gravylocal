@echo off
setlocal EnableExtensions
chcp 65001 >nul
title GRAVY v2.0 - Start LAN

set "ROOT=%~dp0"
set "MOBILE_DIR=%ROOT%mobile-propietarios-app"
set "EXPO_PORT=8085"

echo.
echo  ===============================================
echo   GRAVY v2.0 - Inicio LAN (Web + Movil)
echo  ===============================================
echo.

if not exist "%ROOT%pocketbase.exe" (
  echo  [ERROR] No se encontro pocketbase.exe en %ROOT%
  pause
  exit /b 1
)

if not exist "%MOBILE_DIR%\package.json" (
  echo  [ERROR] No se encontro la app movil en:
  echo         %MOBILE_DIR%
  pause
  exit /b 1
)

for /f %%I in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "$ip=(Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -notlike '127.*' -and $_.InterfaceAlias -notmatch 'Loopback^|vEthernet^|WSL^|Hyper-V' } ^| Select-Object -First 1 -ExpandProperty IPAddress); if(-not $ip){$ip='localhost'}; Write-Output $ip"') do set "LOCAL_IP=%%I"

set "PB_URL=http://%LOCAL_IP%:8090"

echo  IP detectada: %LOCAL_IP%
echo  Backend URL:  %PB_URL%
echo.

echo  Cerrando procesos anteriores en puertos 8090 y %EXPO_PORT%...
PowerShell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ports = 8090,%EXPO_PORT%;" ^
  "foreach ($p in $ports) {" ^
  "  $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue ^| Select-Object -ExpandProperty OwningProcess -Unique;" ^
  "  if ($pids) { $pids ^| ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }" ^
  "}"

echo  Intentando habilitar firewall para 8090 y %EXPO_PORT%...
netsh advfirewall firewall add rule name="Gravy PocketBase 8090" dir=in action=allow protocol=TCP localport=8090 >nul 2>&1
netsh advfirewall firewall add rule name="Gravy Expo 8085" dir=in action=allow protocol=TCP localport=%EXPO_PORT% >nul 2>&1

echo  Iniciando PocketBase (LAN)...
start "Gravy PocketBase LAN" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=0.0.0.0:8090 --dir="%ROOT%pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%pb_hooks""

echo  Iniciando Expo (LAN)...
start "Gravy Mobile LAN" cmd /k "cd /d "%MOBILE_DIR%" && set EXPO_PUBLIC_PB_URL=%PB_URL% && npx expo start --lan --port %EXPO_PORT% --clear"

echo.
echo  Accesos:
echo    - Web/Backend (PC):  http://localhost:8090
echo    - Web/Backend (LAN): %PB_URL%
echo    - Expo QR/Dev:       exp://%LOCAL_IP%:%EXPO_PORT%
echo.
echo  Abre Expo Go en el movil y escanea el QR de la ventana "Gravy Mobile LAN".
echo.

start "" http://localhost:8090
exit /b 0
