@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title GRAVY v2.0 - Servidores Web

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

if not exist "%ROOT%\pocketbase.exe" (
    echo.
    echo  [ERROR] No se encontró pocketbase.exe en %ROOT%
    echo  Presione cualquier tecla para salir...
    pause >nul
    exit /b 1
)

:: Procesar parámetro de modo si se pasa por comando
set "MODE=%~1"
if /i "!MODE!" == "--lan" set "MODE=lan"
if /i "!MODE!" == "-lan" set "MODE=lan"
if /i "!MODE!" == "--cloud" set "MODE=cloud"
if /i "!MODE!" == "-cloud" set "MODE=cloud"
if /i "!MODE!" == "--portable" set "MODE=portable"
if /i "!MODE!" == "-portable" set "MODE=portable"
if /i "!MODE!" == "--local" set "MODE=local"
if /i "!MODE!" == "-local" set "MODE=local"

:: Si no se pasó parámetro, mostrar menú interactivo
if "!MODE!" == "" (
    echo.
    echo  ===============================================
    echo   GRAVY v2.0 - Lanzador Unificado de Servicios
    echo  ===============================================
    echo   [1] Modo Local     (Solo esta PC - 127.0.0.1)
    echo   [2] Modo LAN       (Red Local / WiFi - 0.0.0.0)
    echo   [3] Modo Cloud     (Acceso Nube / Cloudflare Tunnel)
    echo   [4] Modo Portable  (Zero-Dependency / Node Local)
    echo  ===============================================
    echo.
    set /p "CHOICE= Seleccione una opción (1-4) [Por defecto: 1]: "
    if "!CHOICE!" == "2" set "MODE=lan"
    if "!CHOICE!" == "3" set "MODE=cloud"
    if "!CHOICE!" == "4" set "MODE=portable"
    if "!MODE!" == "" set "MODE=local"
)

echo.
echo  -----------------------------------------------
echo   Iniciando GRAVY v2.0 en Modo: !MODE!
echo  -----------------------------------------------

:: 1. Limpieza de procesos en puertos de GRAVY (8088, 8089, 8090, 8091)
echo  [1/5] Cerrando procesos anteriores en puertos 8088, 8089, 8090, 8091...
if exist "%ROOT%\kill.ps1" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\kill.ps1" >nul 2>&1
) else (
    where pm2 >nul 2>nul && pm2 stop gravy-orchestrator >nul 2>nul
    PowerShell -NoProfile -ExecutionPolicy Bypass -Command "$ports = 8088,8089,8090,8091; foreach ($p in $ports) { $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if ($pids) { $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } } }" >nul 2>&1
)

timeout /t 1 >nul

:: 2. Configuración de IP de enlace y Firewall
set "BIND_IP=127.0.0.1"
set "LOCAL_IP=localhost"

if /i "!MODE!" == "lan" (
    set "BIND_IP=0.0.0.0"
    for /f %%I in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "$ip=(Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -notlike '127.*' -and $_.InterfaceAlias -notmatch 'Loopback^|vEthernet^|WSL^|Hyper-V' } ^| Select-Object -First 1 -ExpandProperty IPAddress); if(-not $ip){$ip='localhost'}; Write-Output $ip"') do set "LOCAL_IP=%%I"
    
    echo  Configurando reglas de Firewall para acceso LAN...
    netsh advfirewall firewall add rule name="Gravy Orchestrator 8088" dir=in action=allow protocol=TCP localport=8088 >nul 2>&1
    netsh advfirewall firewall add rule name="Gravy Hub 8089" dir=in action=allow protocol=TCP localport=8089 >nul 2>&1
    netsh advfirewall firewall add rule name="Gravy PocketBase 8090" dir=in action=allow protocol=TCP localport=8090 >nul 2>&1
    netsh advfirewall firewall add rule name="Gravy PocketBase 8091" dir=in action=allow protocol=TCP localport=8091 >nul 2>&1
)

:: 3. Iniciar GRAVY HUB (Puerto 8089)
echo  [2/5] Iniciando GRAVY HUB (!BIND_IP!:8089)...
start "Gravy HUB" cmd /k "pocketbase.exe serve --http=!BIND_IP!:8089 --dir="%ROOT%\hub\pb_data" --hooksDir="%ROOT%\hub\pb_hooks""

:: 4. Iniciar Orquestador (Puerto 8088)
echo  [3/5] Iniciando Orquestador (Puerto 8088)...
set "GRAVY_BIND_IP=!BIND_IP!"
if /i "!MODE!" == "portable" (
    if exist "%ROOT%\bin\node.exe" (
        start "Gravy Orchestrator" /B cmd /c ""%ROOT%\bin\node.exe" hub\orchestrator.js"
    ) else (
        start "Gravy Orchestrator" /B cmd /c "node hub\orchestrator.js"
    )
) else (
    where pm2 >nul 2>nul
    if !ERRORLEVEL! == 0 (
        echo    - Supervisado por PM2 ^(auto-restart^)...
        pm2 start "%ROOT%\ecosystem.config.js" >nul 2>&1
        pm2 save >nul 2>&1
    ) else (
        if exist "%ROOT%\bin\node.exe" (
            start "Gravy Orchestrator" /B cmd /c ""%ROOT%\bin\node.exe" hub\orchestrator.js"
        ) else (
            start "Gravy Orchestrator" /B cmd /c "node hub\orchestrator.js"
        )
    )
)

:: 5. Iniciar Empresas PocketBase (8090, 8091)
echo  [4/5] Iniciando Empresa Demo (!BIND_IP!:8090)...
start "Gravy Empresa Demo" cmd /k "pocketbase.exe serve --http=!BIND_IP!:8090 --dir="%ROOT%\pb_data" --publicDir="%ROOT%\pb_public" --hooksDir="%ROOT%\pb_hooks""

echo  [4/5] Iniciando Empresa 4PATAS (!BIND_IP!:8091)...
start "Gravy Empresa 4PATAS" cmd /k "pocketbase.exe serve --http=!BIND_IP!:8091 --dir="%ROOT%\empresas\empresa_8091\pb_data" --publicDir="%ROOT%\pb_public" --hooksDir="%ROOT%\empresas\empresa_8091\pb_hooks" --migrationsDir="%ROOT%\pb_migrations""

:: 6. Si es modo Cloud, iniciar Cloudflare Tunnel
if /i "!MODE!" == "cloud" (
    echo  [5/5] Iniciando Cloudflare Tunnel...
    timeout /t 3 >nul
    
    set "CF_EXE="
    if exist "%ROOT%\bin\cloudflared.exe" (
        set "CF_EXE=%ROOT%\bin\cloudflared.exe"
    ) else (
        where cloudflared >nul 2>nul
        if !ERRORLEVEL! == 0 (
            set "CF_EXE=cloudflared"
        )
    )

    if "!CF_EXE!" == "" (
        echo.
        echo  [ADVERTENCIA] No se encontró cloudflared.exe en 'bin\' ni en el PATH del sistema.
        echo  Ejecute 'setup-cloudflare.bat' para descargar e instalar el túnel automáticamente.
        echo.
        pause
        exit /b 1
    )

    PowerShell -NoProfile -ExecutionPolicy Bypass -Command ^
        "$envFile = '%ROOT%\config\cloudflare.env';" ^
        "$userCfg = '$env:USERPROFILE\.cloudflared\config.yml';" ^
        "$cfBin = '!CF_EXE!';" ^
        "if (Test-Path $envFile) {" ^
        "    $raw = Get-Content $envFile | Where-Object { $_ -match '^CLOUDFLARE_TUNNEL_TOKEN=' };" ^
        "    if ($raw) {" ^
        "        $token = $raw.Split('=', 2)[1].Trim();" ^
        "        Write-Host '   [Modo] Usando Tunnel Token (Zero Trust)...' -ForegroundColor Green;" ^
        "        Start-Process cmd -ArgumentList '/k', """"$cfBin"" tunnel run --token $token"" -WindowStyle Normal;" ^
        "        exit 0;" ^
        "    }" ^
        "}" ^
        "if (Test-Path $userCfg) {" ^
        "    Write-Host '   [Modo] Usando archivo config.yml...' -ForegroundColor Yellow;" ^
        "    Start-Process cmd -ArgumentList '/k', """"$cfBin"" tunnel --config ""$userCfg"" run"" -WindowStyle Normal;" ^
        "    exit 0;" ^
        "}" ^
        "Write-Host '   [ERROR] No se encontró token ni config.yml.' -ForegroundColor Red;" ^
        "exit 1;"
)

echo.
echo  ================================================
echo   GRAVY v2.0 listo en modo: !MODE!
echo.
if /i "!MODE!" == "lan" (
    echo    - Web/Backend (PC Local):  http://localhost:8090
    echo    - Web/Backend (Red LAN):   http://!LOCAL_IP!:8090
    echo    - Hub (PC Local):          http://localhost:8089
    echo    - Hub (Red LAN):           http://!LOCAL_IP!:8089
) else if /i "!MODE!" == "cloud" (
    echo    - Web/App (Nube):          https://app.gravy-ms.com
    echo    - Hub (Nube):              https://hub.gravy-ms.com
    echo    - Local:                   http://localhost:8090
) else (
    echo    - Web/Backend:             http://localhost:8090
    echo    - Hub:                     http://localhost:8089
    echo    - Empresa 4PATAS:          http://localhost:8091
)
echo  ================================================
echo.

if /i "!MODE!" == "cloud" (
    timeout /t 4 >nul
    start "" https://app.gravy-ms.com
) else (
    start "" http://localhost:8090
)

exit /b 0
