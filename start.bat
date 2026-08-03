@echo off
setlocal EnableExtensions
chcp 65001 >nul
title GRAVY v2.0 - Start Local

set "ROOT=%~dp0"
set "PB_URL=http://127.0.0.1:8090"

echo.
echo  ===============================================
echo   GRAVY v2.0 - Inicio Local (Servidores Web)
echo  ===============================================
echo.

if not exist "%ROOT%pocketbase.exe" (
    echo  [ERROR] No se encontro pocketbase.exe en %ROOT%
    pause
    exit /b 1
)

echo  Cerrando procesos anteriores en puertos 8088, 8089, 8090, 8091...
where pm2 >nul 2>nul && pm2 stop gravy-orchestrator >nul 2>nul
PowerShell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 8088,8089,8090,8091 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"

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

:: echo  Iniciando Empresa: JULIAN ESPINOSA (localhost:8091)...

echo  Iniciando Empresa: 4PATAS (localhost:8091)...
start "Gravy Empresa 4PATAS" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=127.0.0.1:8091 --dir="%ROOT%empresas\empresa_8091\pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%empresas\empresa_8091\pb_hooks" --migrationsDir="%ROOT%pb_migrations""

echo  Iniciando Empresa: TEST_AISLAMIENTO_CO (localhost:8092)...
echo start "Gravy Empresa 8092" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=127.0.0.1:8092 --dir="%ROOT%empresas\empresa_8092\pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%empresas\empresa_8092\pb_hooks" --migrationsDir="%ROOT%pb_migrations""

echo  Iniciando Empresa: TEST_AISLAMIENTO_CO (localhost:8093)...
echo start "Gravy Empresa 8093" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=127.0.0.1:8093 --dir="%ROOT%empresas\empresa_8093\pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%empresas\empresa_8093\pb_hooks" --migrationsDir="%ROOT%pb_migrations""

echo.
echo  URLs locales:
echo    - Web/Backend:  http://localhost:8090
echo.
echo  Nota: para probar desde celular en la misma red, usa start-lan.bat
echo.

start "" http://localhost:8090
exit /b 0
