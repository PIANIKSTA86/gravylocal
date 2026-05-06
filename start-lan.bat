@echo off
chcp 65001 >nul
title GRAVY v2.0 — Servidor LAN

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║     GRAVY v2.0 — Modo Red Local         ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Obtener la IP local automáticamente
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R "IPv4.*192\."') do (
    set "LOCAL_IP=%%A"
    goto :found
)
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R "IPv4.*10\."') do (
    set "LOCAL_IP=%%A"
    goto :found
)
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R "IPv4.*172\."') do (
    set "LOCAL_IP=%%A"
    goto :found
)
set "LOCAL_IP= (no detectada)"

:found
:: Quitar espacio inicial de la IP
set "LOCAL_IP=%LOCAL_IP: =%"

if not exist "%~dp0pocketbase.exe" (
    echo  [ERROR] No se encontro pocketbase.exe
    pause
    exit /b 1
)

:: Abrir firewall si no está abierto (requiere admin)
netsh advfirewall firewall show rule name="ContaCO PocketBase" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  Abriendo puerto 8090 en el firewall de Windows...
    netsh advfirewall firewall add rule name="ContaCO PocketBase" dir=in action=allow protocol=TCP localport=8090 >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo  [AVISO] No se pudo abrir el firewall automaticamente.
        echo  Ejecuta este archivo como Administrador, o abre el puerto 8090 manualmente.
        echo.
    )
)

netstat -ano | find ":8090" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo  [AVISO] El puerto 8090 ya esta en uso. GRAVY ya puede estar corriendo.
    echo.
    echo  Acceso local:       http://localhost:8090
    echo  Acceso desde movil: http://%LOCAL_IP%:8090
    echo.
    pause
    exit /b 0
)

echo  Servidor escuchando en TODAS las interfaces (red local habilitada)
echo.
echo  ┌─────────────────────────────────────────────────────┐
echo  │  Acceso desde este PC:    http://localhost:8090     │
echo  │  Acceso desde la red:     http://%LOCAL_IP%:8090    │
echo  │                                                     │
echo  │  Abre esa URL en el navegador del movil             │
echo  │  (misma red WiFi)                                   │
echo  └─────────────────────────────────────────────────────┘
echo.
echo  Para detener el servidor cierra esta ventana.
echo  ─────────────────────────────────────────────────────────

:: Abrir navegador local
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8090"

:: Iniciar PocketBase en todas las interfaces
"%~dp0pocketbase.exe" serve --http="0.0.0.0:8090" --dir="%~dp0pb_data" --publicDir="%~dp0pb_public" --hooksDir="%~dp0pb_hooks"
