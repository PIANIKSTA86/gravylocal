@echo off
setlocal EnableExtensions
chcp 65001 >nul

:: Definir ruta raíz relativa al script
set "ROOT=%~dp0..\"
cd /d "%ROOT%"

:: Determinar IP de escucha
if "%GRAVY_BIND_IP%"=="" (
    set "BIND_IP=127.0.0.1"
) else (
    set "BIND_IP=%GRAVY_BIND_IP%"
)

echo ===================================================
echo   GRAVY v2.0 - Iniciando Servicios de Fondo
echo   IP de Enlace: %BIND_IP%
echo ===================================================
echo.

:: Limpiar puertos anteriores para evitar colisiones (8088 se excluye si PM2
:: ya administra el orquestador; ver mas abajo).
echo [1/4] Cerrando procesos anteriores en puertos de Gravy...
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%kill.ps1"
timeout /t 2 /nobreak >nul

:: Iniciar PocketBase HUB
echo [2/4] Iniciando GRAVY HUB (Puerto 8089)...
start "Gravy Hub" /B pocketbase.exe serve --http=%BIND_IP%:8089 --dir="%ROOT%hub\pb_data" --hooksDir="%ROOT%hub\pb_hooks"

:: Iniciar PocketBase Empresa Demo
echo [3/4] Iniciando Empresa Demo (Puerto 8090)...
start "Gravy Empresa Demo" /B pocketbase.exe serve --http=%BIND_IP%:8090 --dir="%ROOT%pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%pb_hooks"

:: Iniciar Orquestador (Puerto 8088)
:: Si PM2 esta instalado, el orquestador debe correr supervisado por PM2
:: (auto-restart en caso de crash). En ese caso NO lo lanzamos aqui como
:: proceso suelto: solo nos aseguramos de que este arriba. Si PM2 no esta
:: disponible, usamos el metodo clasico (node directo, sin supervision).
echo [4/4] Iniciando Orquestador (Puerto 8088)...
set "GRAVY_BIND_IP=%BIND_IP%"
where pm2 >nul 2>nul
if %ERRORLEVEL%==0 (
    echo     PM2 detectado: iniciando orquestador supervisado por PM2...
    pm2 start "%ROOT%ecosystem.config.js" >nul 2>nul
    pm2 save >nul 2>nul
) else (
    echo     PM2 no detectado: iniciando orquestador sin supervision ^(node directo^)...
    node hub\orchestrator.js
)
