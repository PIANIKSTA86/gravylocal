@echo off
chcp 65001 >nul
title ContaCO - Detener servidor

echo.
echo  Deteniendo ContaCO...

PowerShell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$connections = Get-NetTCPConnection -LocalPort 8090 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique;" ^
  "if (-not $connections) { Write-Output ' No se encontraron procesos activos en el puerto 8090.'; exit 0 }" ^
  "$connections | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue; Write-Output (' Servidor detenido (PID ' + $_ + ').') }"

echo  ContaCO detenido correctamente.
echo.
exit /b 0
