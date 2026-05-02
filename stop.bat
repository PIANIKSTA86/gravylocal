@echo off
chcp 65001 >nul
title ContaCO — Detener servidor

echo.
echo  Deteniendo ContaCO...

:: Encontrar y matar procesos escuchando en el puerto 8090 (localhost o LAN)
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8090"') do (
    taskkill /PID %%a /F >nul 2>&1
    echo  Servidor detenido (PID %%a).
)

echo  ContaCO detenido correctamente.
echo.


timeout /t 1 >nul
