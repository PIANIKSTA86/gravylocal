@echo off
chcp 65001 >nul
title GRAVY - Detener servicios

echo.
echo  Deteniendo servicios de GRAVY (PocketBase + Orquestador + Expo)...

PowerShell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ports = 8088,8089,8090,8085,19000,19001,19002;" ^
  "$stopped = @();" ^
  "foreach ($p in $ports) {" ^
  "  $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique;" ^
  "  if ($pids) {" ^
  "    foreach ($procId in $pids) {" ^
  "      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue;" ^
  "      $stopped += [PSCustomObject]@{ Port = $p; PID = $procId };" ^
  "    }" ^
  "  }" ^
  "}" ^
  "if ($stopped.Count -eq 0) { Write-Output ' No se encontraron procesos activos de GRAVY en puertos conocidos.' }" ^
  "else { $stopped | Sort-Object Port,PID | ForEach-Object { Write-Output (' Proceso detenido: puerto ' + $_.Port + ' (PID ' + $_.PID + ').') } }"

echo  Limpieza completada.
echo.
exit /b 0
