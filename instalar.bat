@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title GRAVY v2.0 - Instalador

set "ROOT=%~dp0"
cd /d "%ROOT%"

echo.
echo  =====================================================
echo    GRAVY v2.0 - Instalador en Esta PC
echo  =====================================================
echo.

:: ─────────────────────────────────────────────
:: 1. VERIFICAR ARCHIVOS CRITICOS
:: ─────────────────────────────────────────────
echo  [1/5] Verificando archivos necesarios...

set "ERRORES=0"

if not exist "%ROOT%pocketbase.exe" (
    echo    [FALTA] pocketbase.exe
    set "ERRORES=1"
)
if not exist "%ROOT%bin\node.exe" (
    echo    [FALTA] bin\node.exe
    set "ERRORES=1"
)
if not exist "%ROOT%hub\orchestrator.js" (
    echo    [FALTA] hub\orchestrator.js
    set "ERRORES=1"
)
if not exist "%ROOT%hub\node_modules" (
    echo    [FALTA] hub\node_modules ^(intentando instalar dependencias...^)
    if exist "%ROOT%hub\package.json" (
        "%ROOT%bin\node.exe" "%ROOT%bin\node_modules\npm\bin\npm-cli.js" --prefix "%ROOT%hub" install >nul 2>&1
        if not exist "%ROOT%hub\node_modules" (
            echo    [ERROR] No se pudo instalar hub\node_modules
            set "ERRORES=1"
        ) else (
            echo    [OK] hub\node_modules instalado correctamente
        )
    ) else (
        set "ERRORES=1"
    )
)
if not exist "%ROOT%pb_public\index.html" (
    echo    [FALTA] pb_public\index.html ^(frontend^)
    set "ERRORES=1"
)
if not exist "%ROOT%pb_hooks" (
    echo    [FALTA] carpeta pb_hooks
    set "ERRORES=1"
)

if "!ERRORES!"=="1" (
    echo.
    echo  [ERROR] Faltan archivos criticos. Asegurate de haber extraido
    echo  el ZIP completo y ejecutar este instalador desde esa carpeta.
    echo.
    pause
    exit /b 1
)

echo    OK - Todos los archivos criticos presentes.
echo.

:: ─────────────────────────────────────────────
:: 2. CERRAR PROCESOS PREVIOS (por si hay otra instancia)
:: ─────────────────────────────────────────────
echo  [2/5] Liberando puertos de Gravy (8088-8091)...
PowerShell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%kill.ps1" >nul 2>&1
timeout /t 2 /nobreak >nul
echo    OK - Puertos liberados.
echo.

:: ─────────────────────────────────────────────
:: 3. CREAR REGLAS DE FIREWALL
:: ─────────────────────────────────────────────
echo  [3/5] Configurando firewall de Windows...
echo    ^(puede requerir confirmacion de administrador^)

netsh advfirewall firewall delete rule name="Gravy Orchestrator 8088" >nul 2>&1
netsh advfirewall firewall delete rule name="Gravy Hub 8089" >nul 2>&1
netsh advfirewall firewall delete rule name="Gravy PocketBase 8090" >nul 2>&1
netsh advfirewall firewall delete rule name="Gravy PocketBase 8091" >nul 2>&1

netsh advfirewall firewall add rule name="Gravy Orchestrator 8088" dir=in action=allow protocol=TCP localport=8088 >nul 2>&1
netsh advfirewall firewall add rule name="Gravy Hub 8089" dir=in action=allow protocol=TCP localport=8089 >nul 2>&1
netsh advfirewall firewall add rule name="Gravy PocketBase 8090" dir=in action=allow protocol=TCP localport=8090 >nul 2>&1
netsh advfirewall firewall add rule name="Gravy PocketBase 8091" dir=in action=allow protocol=TCP localport=8091 >nul 2>&1

echo    OK - Reglas de firewall aplicadas.
echo.

:: ─────────────────────────────────────────────
:: 4. CREAR ACCESO DIRECTO EN EL ESCRITORIO
:: ─────────────────────────────────────────────
echo  [4/5] Creando acceso directo en el Escritorio...

set "VBS_PATH=%ROOT%start-portable-silent.vbs"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\GRAVY v2.0.lnk"
set "ICON_PATH=%ROOT%gravy-Icono.ico"

powershell -NoProfile -Command ^
    "$ws = New-Object -COM WScript.Shell; " ^
    "$sc = $ws.CreateShortcut('%SHORTCUT_PATH%'); " ^
    "$sc.TargetPath = 'wscript.exe'; " ^
    "$sc.Arguments = '\""%VBS_PATH%\"\"'; " ^
    "$sc.WorkingDirectory = '%ROOT%'; " ^
    "$sc.Description = 'Iniciar GRAVY v2.0'; " ^
    "if (Test-Path '%ICON_PATH%') { $sc.IconLocation = '%ICON_PATH%' }; " ^
    "$sc.Save()"

if exist "%SHORTCUT_PATH%" (
    echo    OK - Acceso directo creado en el Escritorio.
) else (
    echo    AVISO - No se pudo crear acceso directo ^(opcional^).
)
echo.

:: ─────────────────────────────────────────────
:: 5. INICIAR GRAVY
:: ─────────────────────────────────────────────
echo  [5/5] Iniciando GRAVY...
echo.

start "" wscript.exe "%ROOT%start-portable-silent.vbs"

timeout /t 4 /nobreak >nul

echo  =====================================================
echo    INSTALACION COMPLETADA
echo  =====================================================
echo.
echo  Gravy se esta iniciando en segundo plano.
echo.
echo  Accesos:
echo    - Web local:  http://localhost:8090
echo    - Hub:        http://localhost:8089
echo    - Panel admin: http://localhost:8090/_/
echo.
echo  Acceso directo "GRAVY v2.0" creado en tu Escritorio.
echo  Usalo cada vez que quieras iniciar Gravy.
echo.
echo  Para detener Gravy, ejecuta: stop.bat
echo.

:: Abrir en navegador
timeout /t 2 /nobreak >nul
start "" http://localhost:8090

pause
exit /b 0
