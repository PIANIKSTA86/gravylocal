@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title GRAVY v2.0 - Generador de Respaldo Maestro

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

echo.
echo  =====================================================
echo    GRAVY v2.0 - Respaldo Maestro Integral (Full Backup)
echo  =====================================================
echo.
echo  Este proceso consolida todas las bases de datos contables:
echo   - Base Maestra del HUB (Directorio de Empresas y Licencias)
echo   - Base de la Empresa Principal (Contabilidad, Terceros, PUC)
echo   - Bases de Sub-Empresas (Tenants independientes)
echo   - Adjuntos, Facturas Digitales, PDFs y XMLs DIAN
echo   - Reglas de negocio contable (pb_hooks)
echo.

if not exist "%ROOT%\scripts\generar_respaldo_maestro.ps1" (
    echo  [ERROR] No se encontro scripts\generar_respaldo_maestro.ps1
    pause
    exit /b 1
)

PowerShell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\scripts\generar_respaldo_maestro.ps1" -Root "%ROOT%"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [ERROR] Ocurrio un problema al generar el respaldo maestro.
    echo  Por favor verifica los mensajes anteriores.
    pause
    exit /b 1
)

echo.
echo  Presiona cualquier tecla para cerrar esta ventana...
pause >nul
exit /b 0
