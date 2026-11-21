@echo off
setlocal
chcp 65001 > nul
title GRAVY v2.0 - Reclasificación de Conceptos de Cartera PH por Cuenta Contable

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH del sistema.
    echo Por favor instale Node.js para ejecutar esta herramienta.
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0"

node "%~dp0scripts\reacomodar_conceptos_cartera_ph.js" %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [AVISO] El proceso finalizo con codigo de error o fue cancelado.
)

echo.
echo Presione cualquier tecla para cerrar esta ventana...
pause > nul
