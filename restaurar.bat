@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title GRAVY v2.0 - Asistente de Restauración Inteligente

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

echo.
echo  =====================================================
echo    GRAVY v2.0 - Asistente de Restauracion Inteligente
echo  =====================================================
echo.
echo  Restaura una copia de seguridad integral (bases de datos,
echo  inquilinos multi-empresa y soportes digitales) permitiendo
echo  elegir si deseas mantener los puertos originales o remapear
echo  a un puerto base diferente (ej. 9090, 8080, etc).
echo.

if not exist "%ROOT%\scripts\restaurar_respaldo.ps1" (
    echo  [ERROR] No se encontro scripts\restaurar_respaldo.ps1
    pause
    exit /b 1
)

PowerShell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\scripts\restaurar_respaldo.ps1" -Root "%ROOT%"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [ERROR] Ocurrio un problema durante la restauracion.
    pause
    exit /b 1
)

echo.
echo  Presiona cualquier tecla para cerrar esta ventana...
pause >nul
exit /b 0
