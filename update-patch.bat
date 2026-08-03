@echo off
setlocal EnableExtensions
chcp 65001 >nul

echo.
echo ===================================================
echo   GRAVY v2.0 - Parche: Fix Rol Cajero en POS
echo   Fecha: 2026-06-24
echo ===================================================
echo.
echo Este parche corrige el acceso de usuarios Cajero
echo al modulo POS (apertura de turno y caja).
echo.
pause

:: Raiz de la instalacion (carpeta donde esta este .bat)
set "ROOT=%~dp0"
cd /d "%ROOT%"

echo [1/3] Deteniendo servicios Gravy...
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%kill.ps1"
timeout /t 3 /nobreak >nul
echo     OK - Servicios detenidos.
echo.

echo [2/3] Verificando archivos del parche...

if not exist "%ROOT%pb_hooks\patch_collection_rules.pb.js" (
    echo     ERROR: No se encontro pb_hooks\patch_collection_rules.pb.js
    echo     Asegurate de ejecutar este .bat desde la carpeta raiz de GravyLocal.
    pause
    exit /b 1
)

if not exist "%ROOT%pb_hooks\migrate_ventas.pb.js" (
    echo     ERROR: No se encontro pb_hooks\migrate_ventas.pb.js
    pause
    exit /b 1
)

if not exist "%ROOT%pb_public\index.html" (
    echo     ERROR: No se encontro pb_public\index.html
    pause
    exit /b 1
)

echo     OK - Archivos del parche verificados.
echo.

echo [3/3] Reiniciando servicios Gravy...
echo     Los hooks se aplicaran automaticamente al arrancar.
echo.

:: Intentar iniciar con el script principal que exista
if exist "%ROOT%start-portable.bat" (
    start "" "%ROOT%start-portable.bat"
    echo     OK - Gravy iniciado via start-portable.bat
) else if exist "%ROOT%start-lan.bat" (
    start "" "%ROOT%start-lan.bat"
    echo     OK - Gravy iniciado via start-lan.bat
) else if exist "%ROOT%start.bat" (
    start "" "%ROOT%start.bat"
    echo     OK - Gravy iniciado via start.bat
) else (
    echo     AVISO: No se encontro script de inicio automatico.
    echo     Por favor inicia Gravy manualmente.
)

echo.
echo ===================================================
echo   PARCHE APLICADO CORRECTAMENTE
echo ===================================================
echo.
echo Los usuarios con rol Cajero ya podran:
echo   - Abrir turno de caja (POS)
echo   - Crear facturas POS
echo   - Cerrar turno de caja
echo.
echo Si el sistema ya estaba abierto en el navegador,
echo recarga la pagina (Ctrl+F5) para cargar el nuevo frontend.
echo.
pause
