@echo off
setlocal EnableExtensions
chcp 65001 >nul
title GRAVY v2.0 - Sincronizar Empresas con el HUB

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

echo.
echo  ======================================================
echo    GRAVY v2.0 - Sincronizador de Empresas con el HUB
echo  ======================================================
echo.

set "NODE_EXE="
if exist "%ROOT%\bin\node.exe" (
    set "NODE_EXE=%ROOT%\bin\node.exe"
) else (
    where node >nul 2>nul
    if %ERRORLEVEL% == 0 set "NODE_EXE=node"
)

if "%NODE_EXE%" == "" (
    echo  [ERROR] No se encontro bin\node.exe ni Node.js en el sistema.
    echo.
    pause
    exit /b 1
)

"%NODE_EXE%" "%ROOT%\scripts\sync_hub_tenants.js"

echo.
echo  Presione cualquier tecla para salir...
pause >nul
exit /b 0
