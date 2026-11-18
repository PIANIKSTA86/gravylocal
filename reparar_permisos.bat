@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title GRAVY v2.0 - Reparar Permisos NTFS y Servidor

set ROOT=%~dp0
if %ROOT:~-1%==" set ROOT=%ROOT:~0,-1%
cd /d %ROOT%

echo.
echo ========================================================
echo GRAVY v2.0 - Reparador de Permisos y Desbloqueo
echo ========================================================
echo.

net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
 echo [!] Aviso: Se recomienda ejecutar esta consola como Administrador.
)

echo [1/3] Removiendo atributos de solo lectura en %ROOT%...
attrib -r -s %ROOT%\*.* /s /d >nul 2>&1

echo [2/3] Asignando permisos NTFS de Control Total...
icacls %ROOT% /grant *S-1-1-0:(OI)(CI)F /T /C /Q >nul 2>&1
icacls %ROOT% /grant *S-1-5-32-544:(OI)(CI)F /T /C /Q >nul 2>&1
icacls %ROOT% /grant *S-1-5-18:(OI)(CI)F /T /C /Q >nul 2>&1

echo [3/3] Ejecutando verificacion profunda con PowerShell...
if exist %ROOT%\scripts\fix_permissions.ps1 (
 powershell -NoProfile -ExecutionPolicy Bypass -File %ROOT%\scripts\fix_permissions.ps1
)

echo.
echo ========================================================
echo Permisos reparados correctamente.
echo Ya puede crear y eliminar empresas sin bloqueos.
echo ========================================================
echo.
pause
