@echo off
setlocal EnableExtensions
chcp 65001 >nul
title GRAVY v2.0 - Start Local

set "ROOT=%~dp0"
set "MOBILE_DIR=%ROOT%mobile-propietarios-app"
set "PB_URL=http://127.0.0.1:8090"
set "EXPO_PORT=8085"

echo.
echo  ===============================================
echo   GRAVY v2.0 - Inicio Local (Web + Movil)
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

echo  Cerrando procesos anteriores en puertos 8090 y %EXPO_PORT%...
PowerShell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ports = 8090,%EXPO_PORT%;" ^
    "foreach ($p in $ports) {" ^
    "  $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue ^| Select-Object -ExpandProperty OwningProcess -Unique;" ^
    "  if ($pids) { $pids ^| ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }" ^
    "}"

echo  Iniciando PocketBase (localhost)...
start "Gravy PocketBase Local" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=127.0.0.1:8090 --dir="%ROOT%pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%pb_hooks""

echo  Iniciando Expo (localhost)...
start "Gravy Mobile Local" cmd /k "cd /d "%MOBILE_DIR%" && set EXPO_PUBLIC_PB_URL=%PB_URL% && npx expo start --port %EXPO_PORT% --clear"

echo.
echo  URLs locales:
echo    - Web/Backend:  http://localhost:8090
echo    - Expo Dev:     http://localhost:%EXPO_PORT%
echo.
echo  Nota: para probar desde celular en la misma red, usa start-lan.bat
echo.

start "" http://localhost:8090
exit /b 0
