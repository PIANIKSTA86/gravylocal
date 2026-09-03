# PowerShell Script to install GravyLocal 2.0 Portable as a Windows background startup task (service).
# Run as Administrator.

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[-] Este instalador requiere privilegios de Administrador." -ForegroundColor Yellow
    Write-Host "[*] Solicitando elevacion de permisos..." -ForegroundColor Cyan
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
Write-Host "   GRAVY v2.0 - Instalador de Servicios Portable   " -ForegroundColor $green
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host ""

$rootPath = Resolve-Path "$PSScriptRoot\.."
$nodePath = Join-Path $rootPath "bin\node.exe"
$batPath = Join-Path $rootPath "start-portable.bat"
$vbsPath = Join-Path $rootPath "start-portable-silent.vbs"

Write-Host "[1/5] Verificando entorno portable..." -ForegroundColor $cyan
if (Test-Path $nodePath) {
    Write-Host "    [OK] Node.js portable detectado en $nodePath." -ForegroundColor $green
} else {
    Write-Host "    [Error] No se encontro node.exe en la carpeta bin/." -ForegroundColor $red
    Write-Host "    Asegurate de no haber borrado la carpeta bin/ con node.exe." -ForegroundColor $yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "[2/5] Habilitando Firewall de Windows para trafico local/LAN (Rango 8080-8150)..." -ForegroundColor $cyan
$ruleName = "Gravy Suite (8080-8150)"
netsh advfirewall firewall delete rule name="$ruleName" > $null 2>&1
netsh advfirewall firewall add rule name="$ruleName" dir=in action=allow protocol=TCP localport="8080-8150" > $null 2>&1
Write-Host "    [OK] Rango de puertos 8080-8150 permitido en el Firewall." -ForegroundColor $green

Write-Host ""
Write-Host "[3/5] Registrando servicio en el Programador de Tareas (Task Scheduler)..." -ForegroundColor $cyan
$taskName = "GravyLocalPortable"

# Eliminar tarea existente si la hay
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Definir la accion (ejecutamos cmd.exe /c start-portable.bat de forma directa en Session 0), disparador y credenciales
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$batPath`"" -WorkingDirectory $rootPath
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Ajustar configuraciones para que no se apague y permita bateria
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Days 365)

# Registrar la tarea
$task = New-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -Settings $settings
Register-ScheduledTask -TaskName $taskName -InputObject $task -Force | Out-Null

Write-Host "    [OK] Tarea programada '$taskName' creada (Arranca al iniciar Windows en segundo plano)." -ForegroundColor $green

Write-Host ""
Write-Host "[4/5] Creando accesos directos en el Escritorio..." -ForegroundColor $cyan
$desktopPath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath("Desktop"))
$wshShell = New-Object -ComObject WScript.Shell

# 1. Abrir Gravy (Enlace directo al navegador)
"[InternetShortcut]`nURL=http://localhost:8090" | Out-File "$desktopPath\Abrir GravyLocal.url" -Encoding ASCII
Write-Host "    [OK] Acceso directo 'Abrir GravyLocal' creado en el Escritorio." -ForegroundColor $green

# 2. Iniciar Servicio (Manual)
$initLnk = $wshShell.CreateShortcut("$desktopPath\Iniciar GravyLocal (Manual).lnk")
$initLnk.TargetPath = "wscript.exe"
$initLnk.Arguments = "`"$vbsPath`""
$initLnk.IconLocation = "shell32.dll,23"
$initLnk.Description = "Inicia manualmente los servicios portatiles de GravyLocal"
$initLnk.Save()
Write-Host "    [OK] Acceso directo 'Iniciar GravyLocal (Manual)' creado." -ForegroundColor $green

# 3. Detener Servicio (Manual)
$stopLnk = $wshShell.CreateShortcut("$desktopPath\Detener GravyLocal (Manual).lnk")
$stopLnk.TargetPath = "powershell.exe"
$stopLnk.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"`"$rootPath\kill.ps1`"`""
$stopLnk.IconLocation = "shell32.dll,27"
$stopLnk.Description = "Detiene todos los servicios portatiles de GravyLocal"
$stopLnk.Save()
Write-Host "    [OK] Acceso directo 'Detener GravyLocal (Manual)' creado." -ForegroundColor $green

Write-Host ""
Write-Host "[5/5] Iniciando servicios de inmediato..." -ForegroundColor $cyan
Start-ScheduledTask -TaskName $taskName
Write-Host "    Esperando a que los puertos respondan..." -ForegroundColor $yellow
Start-Sleep -Seconds 4

# Verificar puertos activos
$portsOk = $true
foreach ($port in @(8088, 8089, 8090)) {
    $conn = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -WarningAction SilentlyContinue
    if ($conn.TcpTestSucceeded) {
        Write-Host "    [OK] Servicio operativo en puerto $port." -ForegroundColor $green
    } else {
        Write-Host "    [X] Puerto $port no responde todavia (puede tardar unos segundos adicionales)." -ForegroundColor $yellow
        $portsOk = $false
    }
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor $cyan
if ($portsOk) {
    Write-Host "       GRAVYLOCAL PORTABLE SE INSTALO CON EXITO    " -ForegroundColor $green
} else {
    Write-Host "       INSTALACION REGISTRADA (Servicios cargando) " -ForegroundColor $green
}
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host "Los servicios correran solos cada vez que inicies Windows." -ForegroundColor $white
Write-Host "Usa 'Abrir GravyLocal' en el escritorio para ingresar." -ForegroundColor $white
Write-Host ""
pause
