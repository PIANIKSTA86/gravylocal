@echo off
chcp 65001 >nul
title ContaCO v2.0 — Servidor Local

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║        ContaCO v2.0 — Iniciando         ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Verificar si pocketbase.exe existe
if not exist "%~dp0pocketbase.exe" (
    echo  [ERROR] No se encontro pocketbase.exe
    echo  Asegurate de que el archivo este en esta carpeta.
    pause
    exit /b 1
)

:: Modo de arranque:
:: - Por defecto: solo localhost (seguro)
:: - LAN explícita: start.bat --lan
set "BIND_ADDR=127.0.0.1:8090"
set "ACCESS_LOCAL=http://localhost:8090"
set "ACCESS_LAN=(deshabilitado)"

if /I "%~1"=="--lan" (
    set "BIND_ADDR=0.0.0.0:8090"
    set "ACCESS_LAN=http://%COMPUTERNAME%:8090"
)

:: Verificar si ya hay una instancia corriendo en el puerto 8090
netstat -ano | find ":8090" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo  [AVISO] El puerto 8090 ya esta en uso.
    echo  Si ContaCO ya esta corriendo, abre tu navegador en:
    echo.
    echo         http://localhost:8090
    echo.
    pause
    exit /b 0
)

echo  Iniciando servidor en %ACCESS_LOCAL%
if /I "%~1"=="--lan" (
    echo  Acceso desde red local habilitado: %ACCESS_LAN%
) else (
    echo  Modo seguro: solo acceso local (use --lan para habilitar LAN)
)
echo.
echo  Para detener el servidor, cierra esta ventana o ejecuta stop.bat
echo  ─────────────────────────────────────────────────────────────────
echo.

:: Abrir el navegador despues de 2 segundos
start "" cmd /c "timeout /t 2 >nul & start %ACCESS_LOCAL%"

:: Iniciar PocketBase sirviendo desde pb_public
"%~dp0pocketbase.exe" serve --http="%BIND_ADDR%" --dir="%~dp0pb_data" --publicDir="%~dp0pb_public" --hooksDir="%~dp0pb_hooks"
