@echo off
setlocal EnableExtensions
chcp 65001 >nul

:: Definir la ruta raiz del proyecto
set "ROOT=%~dp0"
cd /d "%ROOT%"

:: Determinar IP de enlace (por defecto 127.0.0.1)
if "%GRAVY_BIND_IP%"=="" (
    set "BIND_IP=127.0.0.1"
) else (
    set "BIND_IP=%GRAVY_BIND_IP%"
)

echo ===================================================
echo   GRAVY v2.0 - Servicios Portatiles (Zero-Dep)
echo   IP de Enlace: %BIND_IP%
echo   Ruta: %ROOT%
echo ===================================================
echo.

:: Limpiar puertos anteriores para evitar colisiones usando kill.ps1
echo [1/4] Cerrando procesos anteriores en puertos de Gravy...
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%kill.ps1"
timeout /t 2 /nobreak >nul

:: Iniciar PocketBase HUB
echo [2/4] Iniciando GRAVY HUB (Puerto 8089)...
start "Gravy Hub" /B pocketbase.exe serve --http=%BIND_IP%:8089 --dir="%ROOT%hub\pb_data" --hooksDir="%ROOT%hub\pb_hooks"

:: Iniciar PocketBase Empresa Demo
echo [3/4] Iniciando Empresa Demo (Puerto 8090)...
start "Gravy Empresa Demo" /B pocketbase.exe serve --http=%BIND_IP%:8090 --dir="%ROOT%pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%pb_hooks"

:: Iniciar Orquestador Node usando el ejecutable PORTABLE local
echo [4/4] Iniciando Orquestador (Puerto 8088)...
set "GRAVY_BIND_IP=%BIND_IP%"
if exist "%ROOT%bin\node.exe" (
    "%ROOT%bin\node.exe" hub\orchestrator.js
) else (
    echo [ERROR] No se encontro el ejecutable portable bin\node.exe.
    echo Intentando usar el node global de la maquina...
    node hub\orchestrator.js
)
