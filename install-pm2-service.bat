@echo off
setlocal EnableExtensions
chcp 65001 >nul
title GRAVY v2.0 - Instalar PM2 como servicio de Windows

set "ROOT=%~dp0"
cd /d "%ROOT%"

echo.
echo  Instalando PM2 y registrandolo como servicio de Windows...
echo  (se solicitaran permisos de Administrador)
echo.

PowerShell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\install-pm2-service.ps1"

exit /b 0
