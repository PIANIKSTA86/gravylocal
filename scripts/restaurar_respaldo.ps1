param(
    [string]$Root = "",
    [string]$ZipFile = "",
    [int]$NewBasePort = 0,
    [switch]$NonInteractive = $false
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Root)) {
    $Root = (Split-Path -Parent $PSScriptRoot)
}
$Root = $Root.TrimEnd('\')
Set-Location $Root

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   GRAVY v2.0 - ASISTENTE DE RESTAURACIÓN INTELIGENTE    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$nodeExe = Join-Path $Root "bin\node.exe"
if (-not (Test-Path $nodeExe)) {
    $nodeExe = "node"
}

# 1. Localizar archivos de respaldo disponibles
$respaldosDir = Join-Path $Root "respaldos"
if (-not (Test-Path $respaldosDir)) {
    New-Item -ItemType Directory -Path $respaldosDir -Force | Out-Null
}

$selectedZip = $ZipFile

if ([string]::IsNullOrWhiteSpace($selectedZip)) {
    $availableZips = Get-ChildItem -Path $respaldosDir -Filter "*.zip" | Sort-Object LastWriteTime -Descending

    if ($availableZips.Count -gt 0) {
        Write-Host "Respaldos encontrados en la carpeta 'respaldos/':" -ForegroundColor Yellow
        for ($i = 0; $i -lt $availableZips.Count; $i++) {
            $z = $availableZips[$i]
            $sizeMb = [math]::Round($z.Length / 1MB, 2)
            $dateStr = $z.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
            Write-Host "  [$($i+1)] $($z.Name) ($sizeMb MB - $dateStr)"
        }
        Write-Host "  [0] Ingresar ruta manual de otro archivo ZIP"
        Write-Host ""

        if (-not $NonInteractive) {
            $choice = Read-Host "Seleccione un archivo (1-$($availableZips.Count)) [1]"
            if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }
            $num = 0
            if ([int]::TryParse($choice, [ref]$num) -and $num -ge 1 -and $num -le $availableZips.Count) {
                $selectedZip = $availableZips[$num - 1].FullName
            }
        } else {
            $selectedZip = $availableZips[0].FullName
        }
    }

    if ([string]::IsNullOrWhiteSpace($selectedZip)) {
        if (-not $NonInteractive) {
            $customPath = Read-Host "Ingrese la ruta completa del archivo .zip de respaldo"
            if ([string]::IsNullOrWhiteSpace($customPath) -or -not (Test-Path $customPath)) {
                Write-Host "[ERROR] El archivo especificado no existe." -ForegroundColor Red
                exit 1
            }
            $selectedZip = $customPath
        } else {
            Write-Host "[ERROR] No se especificó archivo de respaldo." -ForegroundColor Red
            exit 1
        }
    }
}

if (-not (Test-Path $selectedZip)) {
    Write-Host "[ERROR] El archivo de respaldo no existe: $selectedZip" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Archivo seleccionado: $selectedZip" -ForegroundColor Green

# 2. Abrir archivo ZIP y leer manifest.json
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$manifestContent = $null
$zipArchive = [System.IO.Compression.ZipFile]::OpenRead($selectedZip)
try {
    $manifestEntry = $zipArchive.GetEntry("manifest.json")
    if ($manifestEntry) {
        $reader = New-Object System.IO.StreamReader($manifestEntry.Open(), [System.Text.Encoding]::UTF8)
        $manifestContent = $reader.ReadToEnd()
        $reader.Close()
    }
} finally {
    $zipArchive.Dispose()
}

$originalMainPort = 8090
if ($manifestContent) {
    try {
        $manifestObj = $manifestContent | ConvertFrom-Json
        Write-Host ""
        Write-Host "----------------------------------------------------------" -ForegroundColor Gray
        Write-Host "  Metadatos del Respaldo:" -ForegroundColor Yellow
        Write-Host "    Sistema:       $($manifestObj.system)"
        Write-Host "    Fecha Creación:$($manifestObj.created_at)"
        Write-Host "    Equipo Origen: $($manifestObj.machine_name)"
        if ($manifestObj.original_ports) {
            $originalMainPort = [int]$manifestObj.original_ports.main
            Write-Host "    Puerto Orig.:  $($manifestObj.original_ports.main) (HUB: $($manifestObj.original_ports.hub))"
        }
        if ($manifestObj.companies) {
            Write-Host "    Empresas registradas en la copia:" -ForegroundColor Yellow
            foreach ($co in $manifestObj.companies) {
                Write-Host "      - $($co.name) (NIT: $($co.nit)) [Puerto: $($co.port)]"
            }
        }
        Write-Host "----------------------------------------------------------" -ForegroundColor Gray
    } catch {
        Write-Host "  [!] No se pudieron parsear los metadatos completos del manifest." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "  [!] El archivo no contiene manifest.json (respaldo estándar o legado)." -ForegroundColor DarkYellow
}

# 3. Solicitar el nuevo puerto base deseado
$targetBasePort = $NewBasePort

if ($targetBasePort -eq 0) {
    Write-Host ""
    Write-Host "OPCIONES DE PUERTO:" -ForegroundColor Yellow
    Write-Host "  [1] Conservar puerto original ($originalMainPort)"
    Write-Host "  [2] Cambiar a un puerto diferente (Ej: 9090, 8080, etc.)"
    Write-Host ""

    if (-not $NonInteractive) {
        $portChoice = Read-Host "Seleccione una opción (1-2) [1]"
        if ($portChoice -eq "2") {
            $inputPort = Read-Host "Ingrese el nuevo puerto para la Empresa Principal (Ej: 9090)"
            $parsedPort = 0
            if ([int]::TryParse($inputPort, [ref]$parsedPort) -and $parsedPort -ge 1024 -and $parsedPort -le 65535) {
                $targetBasePort = $parsedPort
            } else {
                Write-Host "  [!] Puerto no válido. Se conservará el puerto original $originalMainPort." -ForegroundColor DarkYellow
                $targetBasePort = $originalMainPort
            }
        } else {
            $targetBasePort = $originalMainPort
        }
    } else {
        $targetBasePort = $originalMainPort
    }
}

Write-Host ""
Write-Host "Puerto base seleccionado para la Empresa Principal: $targetBasePort" -ForegroundColor Green
$targetHubPort = $targetBasePort - 1
$targetOrchPort = $targetBasePort - 2
Write-Host "Puerto asignado para el HUB:                       $targetHubPort" -ForegroundColor Green
Write-Host "Puerto asignado para el Orquestador:               $targetOrchPort" -ForegroundColor Green

# 4. Comprobar si los puertos destino están en uso
$busyPorts = @()
foreach ($p in @($targetBasePort, $targetHubPort, $targetOrchPort)) {
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($conn) { $busyPorts += $p }
}

if ($busyPorts.Count -gt 0) {
    Write-Host ""
    Write-Host "  [ADVERTENCIA] Los siguientes puertos están actualmente ocupados por otros procesos: $($busyPorts -join ', ')" -ForegroundColor Red
    Write-Host "  Si son procesos anteriores de GRAVY, el asistente los cerrará automáticamente." -ForegroundColor Yellow
}

# 5. Detener servicios de GRAVY activos
Write-Host ""
Write-Host "[1/5] Deteniendo procesos existentes de GRAVY..." -ForegroundColor Yellow
$killScript = Join-Path $Root "kill.ps1"
if (Test-Path $killScript) {
    & powershell -NoProfile -ExecutionPolicy Bypass -File $killScript *> $null
} else {
    $portsToKill = 8080..8150
    if ($targetBasePort -gt 8150) {
        $portsToKill = ($targetBasePort - 5)..($targetBasePort + 20)
    }
    foreach ($p in $portsToKill) {
        $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        if ($pids) {
            $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
        }
    }
}
Start-Sleep -Seconds 2
Write-Host "  Servicios detenidos." -ForegroundColor Green

# 6. Crear copia de seguridad preventiva de los datos actuales si existen
$hasExistingData = (Test-Path (Join-Path $Root "pb_data")) -or (Test-Path (Join-Path $Root "hub\pb_data"))
if ($hasExistingData) {
    Write-Host ""
    Write-Host "[2/5] Creando copia preventiva de los datos actuales antes de sobrescribir..." -ForegroundColor Yellow
    $safetyBackupName = "pre_restore_backup_$((Get-Date).ToString('yyyyMMdd_HHmmss')).zip"
    $safetyBackupPath = Join-Path $respaldosDir $safetyBackupName
    
    $safetyPaths = @()
    foreach ($item in @('hub\pb_data', 'pb_data', 'empresas', 'pb_hooks', 'config')) {
        $p = Join-Path $Root $item
        if (Test-Path $p) { $safetyPaths += $p }
    }
    if ($safetyPaths.Count -gt 0) {
        try {
            Compress-Archive -Path $safetyPaths -DestinationPath $safetyBackupPath -CompressionLevel Fastest -ErrorAction SilentlyContinue
            Write-Host "  [OK] Copia de seguridad preventiva creada en: $safetyBackupName" -ForegroundColor Green
        } catch {
            Write-Host "  [!] No se pudo crear copia preventiva: $($_.Exception.Message)" -ForegroundColor DarkYellow
        }
    }
} else {
    Write-Host ""
    Write-Host "[2/5] No hay datos previos. Procediendo con instalación limpia..." -ForegroundColor Yellow
}

# 7. Extraer archivo de respaldo
Write-Host ""
Write-Host "[3/5] Extrayendo información contable y adjuntos..." -ForegroundColor Yellow
Write-Host "      (Extrayendo a $Root)..." -ForegroundColor Gray

# Usar .NET ZipArchive para extraer sobrescribiendo archivos existentes
$zipExtract = [System.IO.Compression.ZipFile]::OpenRead($selectedZip)
try {
    foreach ($entry in $zipExtract.Entries) {
        # Omitir manifest.json en la extracción directa a raíz
        if ($entry.FullName -eq "manifest.json") { continue }
        
        $destPath = Join-Path $Root ($entry.FullName.Replace('/', '\'))
        $destDir = Split-Path -Parent $destPath
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        # Si la entrada es un directorio
        if ([string]::IsNullOrEmpty($entry.Name)) {
            continue
        }
        
        # Extraer sobrescribiendo
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destPath, $true)
    }
} finally {
    $zipExtract.Dispose()
}
Write-Host "  [OK] Información extraída correctamente." -ForegroundColor Green

# 8. Ejecutar el remapeador dinámico de puertos
Write-Host ""
Write-Host "[4/5] Ejecutando remapeador dinámico de puertos en la base de datos..." -ForegroundColor Yellow

$remapperScript = Join-Path $Root "scripts\remapear_puertos.js"
if (Test-Path $remapperScript) {
    & $nodeExe $remapperScript --base-port $targetBasePort --hub-port $targetHubPort --orchestrator-port $targetOrchPort --root $Root
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Falló la reconfiguración de puertos." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  [!] No se encontró scripts\remapear_puertos.js. Omitiendo remapeo." -ForegroundColor DarkYellow
}

# 9. Configurar Reglas de Firewall de Windows para el nuevo rango
Write-Host ""
Write-Host "[5/5] Actualizando reglas en el Firewall de Windows..." -ForegroundColor Yellow
try {
    $firewallRuleName = "Gravy Suite Port Range ($targetOrchPort-$($targetBasePort + 20))"
    netsh advfirewall firewall delete rule name="Gravy Suite Port Range" > $null 2>&1
    netsh advfirewall firewall delete rule name="$firewallRuleName" > $null 2>&1
    netsh advfirewall firewall add rule name="$firewallRuleName" dir=in action=allow protocol=TCP localport="$targetOrchPort-$($targetBasePort + 20)" > $null 2>&1
    Write-Host "  [OK] Regla de Firewall creada para el rango $targetOrchPort-$($targetBasePort + 20)." -ForegroundColor Green
} catch {
    Write-Host "  [!] Nota: Se requieren permisos de Administrador para modificar el Firewall de Windows." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ¡RESTAURACIÓN Y REMAPEO COMPLETADOS CON ÉXITO!        " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar la suite GRAVY en el nuevo puerto, ejecuta:" -ForegroundColor White
Write-Host "   start.bat" -ForegroundColor Cyan
Write-Host ""
Write-Host "Accesos configurados:" -ForegroundColor Yellow
Write-Host "   - Empresa Principal : http://localhost:$targetBasePort" -ForegroundColor White
Write-Host "   - Directorio HUB    : http://localhost:$targetHubPort" -ForegroundColor White
Write-Host "   - Orquestador       : http://localhost:$targetOrchPort" -ForegroundColor White
Write-Host ""

if (-not $NonInteractive) {
    $iniciar = Read-Host " ¿Deseas iniciar GRAVY ahora mismo en el nuevo puerto? (S/N) [S]"
    if ([string]::IsNullOrWhiteSpace($iniciar) -or $iniciar.Trim().ToUpper() -eq "S") {
        $startBat = Join-Path $Root "start.bat"
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$startBat`"" -WorkingDirectory $Root
    }
}

exit 0
