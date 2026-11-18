@echo off
chcp 65001 > nul
cls
echo ========================================================================
echo         GRAVY ERP — SANEAMIENTO DE AJUSTES EN FACTURAS DE VENTA
echo ========================================================================
echo.
echo Este script busca comprobantes de facturacion con lineas de ajuste en $0
echo o micro-decimales espurios (ej. cuenta 530535 con residuos de redondeo),
echo los elimina y reasigna su valor a la cuenta de ingreso principal (4135).
echo.

set SCRIPT_DIR=%~dp0
set DEFAULT_DB=%SCRIPT_DIR%..\pb_data\data.db

if not "%~1"=="" (
    set TARGET_DB=%~1
) else (
    set TARGET_DB=%DEFAULT_DB%
)

if not exist "%TARGET_DB%" (
    echo [ERROR] No se encontro la base de datos en: %TARGET_DB%
    echo Si deseas especificar otra empresa, pasa la ruta completa como parametro:
    echo    sanear_ajustes_contables.bat "C:\ruta\a\otra_empresa\pb_data\data.db"
    pause
    exit /b 1
)

echo Base de datos a procesar: %TARGET_DB%
echo.
echo Opciones:
echo   1. Simular verificacion (Dry-Run - No modifica la base de datos)
echo   2. Ejecutar Saneamiento Real (Aplica cambios con respaldo de seguridad)
echo   3. Salir
echo.
set /p OPT=Selecciona una opcion (1, 2 o 3): 

if "%OPT%"=="1" (
    echo.
    echo --- Ejecutando Simulacion ---
    node "%SCRIPT_DIR%sanear_ajustes_facturas.js" "%TARGET_DB%" --dry-run
    pause
    exit /b 0
)

if "%OPT%"=="2" (
    echo.
    echo Creando copia de seguridad previa de la base de datos...
    copy /y "%TARGET_DB%" "%TARGET_DB%.bak_%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%" > nul
    echo Respaldo creado exitosamente.
    echo.
    echo --- Ejecutando Saneamiento Real ---
    node "%SCRIPT_DIR%sanear_ajustes_facturas.js" "%TARGET_DB%"
    pause
    exit /b 0
)

echo Operacion cancelada.
exit /b 0
