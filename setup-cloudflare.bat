@echo off
setlocal EnableExtensions
chcp 65001 >nul
title GRAVY v2.0 - Configuración de Cloudflare Tunnel

set "ROOT=%~dp0"

if not exist "%ROOT%scripts\setup-cloudflare-tunnel.ps1" (
    echo  [ERROR] No se encontró scripts\setup-cloudflare-tunnel.ps1
    pause
    exit /b 1
)

PowerShell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\setup-cloudflare-tunnel.ps1" %*

exit /b %ERRORLEVEL%
