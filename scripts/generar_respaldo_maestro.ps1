param(
    [string]$Root = "",
    [switch]$ForceStop = $false
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Root)) {
    $Root = (Split-Path -Parent $PSScriptRoot)
}
$Root = $Root.TrimEnd('\')
Set-Location $Root

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   GRAVY v2.0 - GENERADOR DE RESPALDO MAESTRO INTEGRAL   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar binarios y dependencias
$nodeExe = Join-Path $Root "bin\node.exe"
if (-not (Test-Path $nodeExe)) {
    $nodeExe = "node"
}

# 2. Checkpoint WAL de SQLite
$checkpointScript = Join-Path $Root "scripts\sqlite_checkpoint.js"
if (Test-Path $checkpointScript) {
    Write-Host "[1/5] Ejecutando sincronización de diarios SQLite WAL..." -ForegroundColor Yellow
    try {
        & $nodeExe $checkpointScript
    } catch {
        Write-Host "  [!] Advertencia al sincronizar WAL: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
}

# 3. Preguntar si se detienen los servicios para máxima consistencia
if (-not $ForceStop) {
    Write-Host ""
    $resp = Read-Host "  ¿Deseas detener los servicios de GRAVY durante el empaquetado? (Recomendado S/N) [S]"
    if ([string]::IsNullOrWhiteSpace($resp) -or $resp.Trim().ToUpper() -eq "S") {
        $ForceStop = $true
    }
}

if ($ForceStop) {
    Write-Host "  Deteniendo servicios de GRAVY..." -ForegroundColor Yellow
    $killScript = Join-Path $Root "kill.ps1"
    if (Test-Path $killScript) {
        & powershell -NoProfile -ExecutionPolicy Bypass -File $killScript *> $null
    } else {
        $ports = 8080..8150
        foreach ($p in $ports) {
            $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
            if ($pids) {
                $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
            }
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "  Servicios detenidos." -ForegroundColor Green
}

# 4. Generar Manifest con metadatos del sistema y empresas
Write-Host ""
Write-Host "[2/5] Analizando estructura contable y generando manifest.json..." -ForegroundColor Yellow

$tempDir = Join-Path $Root "scratch\temp_manifest_$([Guid]::NewGuid().ToString('N').Substring(0,8))"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$manifestPath = Join-Path $tempDir "manifest.json"

# Extraer empresas del HUB
$companiesList = @()
$hubDb = Join-Path $Root "hub\pb_data\data.db"
if (Test-Path $hubDb) {
    $extractScript = @"
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('$($hubDb.Replace('\', '/'))', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log(JSON.stringify([]));
        process.exit(0);
    }
    db.all('SELECT id, name, nit, port, url, active FROM companies', (qErr, rows) => {
        db.close();
        if (qErr) {
            console.log(JSON.stringify([]));
        } else {
            console.log(JSON.stringify(rows || []));
        }
    });
});
"@
    try {
        $jsonOut = & $nodeExe -e $extractScript
        if ($jsonOut) {
            $companiesList = $jsonOut | ConvertFrom-Json
        }
    } catch {
        Write-Host "  [!] No se pudieron leer las empresas registradas en el HUB." -ForegroundColor DarkYellow
    }
}

# Hashes SHA-256 de las bases principales
$shaMain = ""
$mainDb = Join-Path $Root "pb_data\data.db"
if (Test-Path $mainDb) {
    $shaMain = (Get-FileHash -Path $mainDb -Algorithm SHA256).Hash
}

$shaHub = ""
if (Test-Path $hubDb) {
    $shaHub = (Get-FileHash -Path $hubDb -Algorithm SHA256).Hash
}

# Leer configuración de puertos actual si existe
$currentPorts = @{
    orchestrator = 8088
    hub = 8089
    main = 8090
}
$portsEnvFile = Join-Path $Root "config\ports.env"
if (Test-Path $portsEnvFile) {
    Get-Content $portsEnvFile | ForEach-Object {
        if ($_ -match '^\s*([A-Za-z0-9_]+)\s*=\s*(\d+)') {
            $k = $matches[1]
            $v = [int]$matches[2]
            if ($k -eq "GRAVY_MAIN_PORT") { $currentPorts.main = $v }
            if ($k -eq "GRAVY_HUB_PORT") { $currentPorts.hub = $v }
            if ($k -eq "GRAVY_ORCHESTRATOR_PORT") { $currentPorts.orchestrator = $v }
        }
    }
}

$manifestData = [PSCustomObject]@{
    system = "GRAVY Suite Contable v2.0"
    backup_type = "FULL_SYSTEM_STATE"
    created_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    machine_name = $env:COMPUTERNAME
    user_name = $env:USERNAME
    original_ports = $currentPorts
    main_db_sha256 = $shaMain
    hub_db_sha256 = $shaHub
    companies = $companiesList
}

$manifestJson = $manifestData | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($manifestPath, $manifestJson, [System.Text.Encoding]::UTF8)
Write-Host "  [OK] Manifest generado con $($companiesList.Count) empresas registradas." -ForegroundColor Green

# 5. Preparar lista de rutas a empaquetar
Write-Host ""
Write-Host "[3/5] Compilando elementos para el archivo consolidado..." -ForegroundColor Yellow

$respaldosDir = Join-Path $Root "respaldos"
if (-not (Test-Path $respaldosDir)) {
    New-Item -ItemType Directory -Path $respaldosDir -Force | Out-Null
}

$timestampStr = (Get-Date).ToString("yyyyMMdd_HHmmss")
$zipFilename = "GRAVY-RESPALDO-FULL-$timestampStr.zip"
$zipFullPath = Join-Path $respaldosDir $zipFilename

# Elementos a respaldar:
$itemsToInclude = @()
$sourceLabels = @()

# 1. Manifest
$itemsToInclude += $manifestPath
$sourceLabels += "manifest.json"

# 2. HUB pb_data
$hubData = Join-Path $Root "hub\pb_data"
if (Test-Path $hubData) {
    $itemsToInclude += $hubData
    $sourceLabels += "hub\pb_data (Directorio maestro)"
}

# 3. Empresa Principal pb_data
$mainData = Join-Path $Root "pb_data"
if (Test-Path $mainData) {
    $itemsToInclude += $mainData
    $sourceLabels += "pb_data (Empresa principal y storage)"
}

# 4. Empresas secundarias
$empresasDir = Join-Path $Root "empresas"
if (Test-Path $empresasDir) {
    $itemsToInclude += $empresasDir
    $sourceLabels += "empresas\ (Sub-empresas e inquilinos)"
}

# 5. Hooks del sistema contable
$hooksDir = Join-Path $Root "pb_hooks"
if (Test-Path $hooksDir) {
    $itemsToInclude += $hooksDir
    $sourceLabels += "pb_hooks\ (Lógica tributaria y contable)"
}

# 6. Carpeta config si existe
$cfgDir = Join-Path $Root "config"
if (Test-Path $cfgDir) {
    $itemsToInclude += $cfgDir
    $sourceLabels += "config\ (Configuración de entorno)"
}

foreach ($lbl in $sourceLabels) {
    Write-Host "  [+] $lbl" -ForegroundColor Gray
}

# 6. Comprimir archivo maestro usando .NET ZipArchive para alta confiabilidad
Write-Host ""
Write-Host "[4/5] Empaquetando en $zipFilename..." -ForegroundColor Yellow
Write-Host "      (Puede tomar unos instantes dependiendo del volumen de adjuntos/PDFs)..." -ForegroundColor Gray

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path $zipFullPath) {
    Remove-Item -Path $zipFullPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipFullPath, [System.IO.Compression.ZipArchiveMode]::Create)

try {
    # 1. Agregar manifest.json en la raíz del ZIP
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $manifestPath, "manifest.json", [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null

    # 2. Función helper para agregar carpetas completas respetando estructura relativa
    function Add-FolderToZip($zipArchive, $folderPath, $entryPrefix) {
        $allFiles = Get-ChildItem -Path $folderPath -Recurse -File -Force
        foreach ($file in $allFiles) {
            # Omitir archivos temporales de lock o wal vacíos si no son necesarios
            if ($file.Name.EndsWith("-shm")) { continue }
            
            $relative = $file.FullName.Substring($folderPath.Length).TrimStart('\', '/')
            $entryName = "$entryPrefix/$relative".Replace('\', '/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipArchive, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    }

    # Agregar carpetas
    if (Test-Path $hubData) {
        Add-FolderToZip $zip $hubData "hub/pb_data"
    }
    if (Test-Path $mainData) {
        Add-FolderToZip $zip $mainData "pb_data"
    }
    if (Test-Path $empresasDir) {
        Add-FolderToZip $zip $empresasDir "empresas"
    }
    if (Test-Path $hooksDir) {
        Add-FolderToZip $zip $hooksDir "pb_hooks"
    }
    if (Test-Path $cfgDir) {
        Add-FolderToZip $zip $cfgDir "config"
    }

} finally {
    $zip.Dispose()
    # Limpiar temp manifest
    if (Test-Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# 7. Resumen final
$zipSizeMb = [math]::Round((Get-Item $zipFullPath).Length / 1MB, 2)
Write-Host ""
Write-Host "[5/5] ¡RESPALDO MAESTRO COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Archivo : $zipFullPath" -ForegroundColor White
Write-Host " Tamaño  : $zipSizeMb MB" -ForegroundColor White
Write-Host " Fecha   : $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para trasladar la información a otro computador:" -ForegroundColor Yellow
Write-Host " 1. Copia este archivo ZIP a la PC destino (dentro de la carpeta C:\GravyLocal\respaldos\)."
Write-Host " 2. En la PC destino ejecuta: restaurar.bat"
Write-Host " 3. El asistente te permitirá elegir el puerto que desees y remapeará todo automáticamente."
Write-Host ""

# Abrir el explorador seleccionando el archivo generado
explorer.exe /select,"$zipFullPath"
exit 0
