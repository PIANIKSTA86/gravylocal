# PowerShell Script to install GravyLocal 2.0 as a Windows background startup task (service).
# Run as Administrator.

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[-] Este instalador requiere privilegios de Administrador." -ForegroundColor Yellow
    Write-Host "[*] Solicitando elevación de permisos..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Clear-Host
$cyan = [ConsoleColor]::Cyan
$green = [ConsoleColor]::Green
$yellow = [ConsoleColor]::Yellow
$red = [ConsoleColor]::Red
$white = [ConsoleColor]::White

Write-Host "===================================================" -ForegroundColor $cyan
Write-Host "   GRAVY v2.0 - Instalador de Servicios de Fondo   " -ForegroundColor $green
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host ""

$rootPath = Resolve-Path "$PSScriptRoot\.."
$scriptsPath = Join-Path $rootPath "scripts"
$vbsPath = Join-Path $scriptsPath "start-service-bg.vbs"
$hubPath = Join-Path $rootPath "hub"

Write-Host "[1/6] Verificando entorno e instalando Node.js si falta..." -ForegroundColor $cyan
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVer = node -v
    Write-Host "    [✔] Node.js detectado ($nodeVer)." -ForegroundColor $green
} else {
    Write-Host "    [!] Node.js no está instalado. Iniciando instalación vía Winget..." -ForegroundColor $yellow
    winget install OpenJS.NodeJS --silent --accept-package-agreements --accept-source-agreements
    
    # Intentar refrescar la variable PATH del proceso
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "    [Error] Node.js se instaló pero requiere reiniciar la consola." -ForegroundColor $red
        Write-Host "    Por favor, cierra esta ventana y vuelve a ejecutar el instalador." -ForegroundColor $yellow
        pause
        exit 1
    }
    $nodeVer = node -v
    Write-Host "    [✔] Node.js instalado correctamente ($nodeVer)." -ForegroundColor $green
}

Write-Host ""
Write-Host "[2/6] Instalando dependencias en la carpeta HUB..." -ForegroundColor $cyan
if (Test-Path "$hubPath\package.json") {
    Push-Location $hubPath
    Write-Host "    Ejecutando 'npm install --omit=dev' (esto puede tardar unos segundos)..." -ForegroundColor $yellow
    npm install --omit=dev --no-audit --no-fund
    Pop-Location
    Write-Host "    [✔] Dependencias instaladas con éxito." -ForegroundColor $green
} else {
    Write-Host "    [Error] No se encontró package.json en: $hubPath" -ForegroundColor $red
    pause
    exit 1
}

Write-Host ""
Write-Host "[3/6] Habilitando Firewall de Windows para tráfico local/LAN (Rango 8080-8150)..." -ForegroundColor $cyan
$ruleName = "Gravy Suite (8080-8150)"
netsh advfirewall firewall delete rule name="$ruleName" > $null 2>&1
netsh advfirewall firewall add rule name="$ruleName" dir=in action=allow protocol=TCP localport="8080-8150" > $null 2>&1
Write-Host "    [✔] Rango de puertos 8080-8150 permitido en el Firewall." -ForegroundColor $green

Write-Host ""
Write-Host "[4/6] Registrando servicio en el Programador de Tareas (Task Scheduler)..." -ForegroundColor $cyan
$taskName = "GravyLocalServices"

# Eliminar tarea existente si la hay
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Definir la acción, disparador y credenciales del servicio
$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$vbsPath`"" -WorkingDirectory $scriptsPath
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Ajustar configuraciones para que no se apague y permita batería
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Days 365)

# Registrar la tarea
$task = New-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -Settings $settings
Register-ScheduledTask -TaskName $taskName -InputObject $task -Force | Out-Null

Write-Host "    [✔] Tarea programada '$taskName' creada (Arranca al iniciar Windows en segundo plano)." -ForegroundColor $green

Write-Host ""
Write-Host "[5/6] Creando accesos directos en el Escritorio..." -ForegroundColor $cyan
$desktopPath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath("Desktop"))
$wshShell = New-Object -ComObject WScript.Shell

# 1. Abrir Gravy (Enlace directo al navegador)
"[InternetShortcut]`nURL=http://localhost:8090" | Out-File "$desktopPath\Abrir GravyLocal.url" -Encoding ASCII
Write-Host "    [✔] Acceso directo 'Abrir GravyLocal' creado en el Escritorio." -ForegroundColor $green

# 2. Iniciar Servicio (Manual)
$initLnk = $wshShell.CreateShortcut("$desktopPath\Iniciar GravyLocal (Manual).lnk")
$initLnk.TargetPath = "wscript.exe"
$initLnk.Arguments = "`"$vbsPath`""
$initLnk.IconLocation = "shell32.dll,23"
$initLnk.Description = "Inicia manualmente los servicios de fondo de GravyLocal"
$initLnk.Save()
Write-Host "    [✔] Acceso directo 'Iniciar GravyLocal (Manual)' creado." -ForegroundColor $green

# 3. Detener Servicio (Manual)
$stopLnk = $wshShell.CreateShortcut("$desktopPath\Detener GravyLocal (Manual).lnk")
$stopLnk.TargetPath = "powershell.exe"
$stopLnk.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"`"$rootPath\kill.ps1`"`""
$stopLnk.IconLocation = "shell32.dll,27"
$stopLnk.Description = "Detiene todos los servicios de fondo de GravyLocal"
$stopLnk.Save()
Write-Host "    [✔] Acceso directo 'Detener GravyLocal (Manual)' creado." -ForegroundColor $green

Write-Host ""
Write-Host "[6/6] Iniciando servicios de inmediato..." -ForegroundColor $cyan
Start-ScheduledTask -TaskName $taskName
Write-Host "    Esperando a que los puertos respondan..." -ForegroundColor $yellow
Start-Sleep -Seconds 4

# Verificar puertos activos
$portsOk = $true
foreach ($port in @(8088, 8089, 8090)) {
    $conn = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -WarningAction SilentlyContinue
    if ($conn.TcpTestSucceeded) {
        Write-Host "    [✔] Servicio operativo en puerto $port." -ForegroundColor $green
    } else {
        Write-Host "    [X] Puerto $port no responde todavía (puede tardar unos segundos adicionales)." -ForegroundColor $yellow
        $portsOk = $false
    }
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor $cyan
if ($portsOk) {
    Write-Host "       ¡GRAVYLOCAL SE INSTALÓ CON ÉXITO!           " -ForegroundColor $green
} else {
    Write-Host "       INSTALACIÓN REGISTRADA (Servicios cargando) " -ForegroundColor $green
}
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host "Los servicios correrán solos cada vez que inicies Windows." -ForegroundColor $white
Write-Host "Usa 'Abrir GravyLocal' en el escritorio para ingresar." -ForegroundColor $white
Write-Host ""
pause
