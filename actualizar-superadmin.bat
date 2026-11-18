@echo off
setlocal EnableExtensions
chcp 65001 >nul
title GRAVY v2.0 - Actualizar SuperAdministrador

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

set "NODE_EXE="
if exist "%ROOT%\bin\node.exe" (
    set "NODE_EXE=%ROOT%\bin\node.exe"
) else (
    where node >nul 2>nul
    if %ERRORLEVEL% == 0 set "NODE_EXE=node"
)

if "%NODE_EXE%" == "" (
    echo.
    echo  ======================================================
    echo   [ERROR] No se encontró bin\node.exe ni Node.js.
    echo   Instale Node.js o verifique la carpeta 'bin\'.
    echo  ======================================================
    echo.
    pause
    exit /b 1
)

"%NODE_EXE%" "%ROOT%\scripts\actualizar_superadmin.js" %*

echo.
echo Presione cualquier tecla para salir...
pause >nul
exit /b 0
