# PowerShell Script to automatically build and compile the Zero-Dependency Portable ZIP package.
# Run from PowerShell.

Clear-Host
$cyan = [ConsoleColor]::Cyan
$green = [ConsoleColor]::Green
$yellow = [ConsoleColor]::Yellow
$red = [ConsoleColor]::Red
$white = [ConsoleColor]::White

Write-Host "===================================================" -ForegroundColor $cyan
Write-Host "   GRAVY v2.0 - Generador de Paquete Portable ZIP  " -ForegroundColor $green
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host ""

$rootPath = Resolve-Path "$PSScriptRoot\.."
$zipPath = Join-Path $rootPath "GravyLocal-Portable.zip"
$stagingDir = Join-Path $rootPath "temp_staging"

# 1. Limpieza inicial si existe staging anterior
if (Test-Path $stagingDir) {
    Remove-Item -Recurse -Force $stagingDir -ErrorAction SilentlyContinue
}
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath -ErrorAction SilentlyContinue
}

Write-Host "[1/5] Creando directorio temporal de compilacion..." -ForegroundColor $cyan
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stagingDir "empresas") -Force | Out-Null
Write-Host "    [OK] Directorio temporal creado." -ForegroundColor $green

Write-Host ""
Write-Host "[2/5] Verificando y copiando Node.js portable (bin/)..." -ForegroundColor $cyan
$binStaging = Join-Path $stagingDir "bin"
New-Item -ItemType Directory -Path $binStaging -Force | Out-Null

$nodeSource = Join-Path $rootPath "bin\node.exe"
if (-not (Test-Path $nodeSource)) {
    # Si no existe en bin/, intentar copiarlo del sistema automaticamente
    Write-Host "    Node portable no encontrado en bin/. Intentando copiar del sistema..." -ForegroundColor $yellow
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $sysNode = (Get-Command node).Source
        Copy-Item -Path $sysNode -Destination (Join-Path $rootPath "bin\node.exe") -Force
        Write-Host "    [OK] Node.js copiado del sistema a bin/." -ForegroundColor $green
    } else {
        Write-Host "    [Error] Node.js no esta instalado en este sistema. No se puede generar el portable sin node.exe." -ForegroundColor $red
        Remove-Item -Recurse -Force $stagingDir -ErrorAction SilentlyContinue
        pause
        exit 1
    }
}
Copy-Item -Path $nodeSource -Destination (Join-Path $binStaging "node.exe") -Force
Write-Host "    [OK] Node.js copiado al paquete staging." -ForegroundColor $green

Write-Host ""
Write-Host "[3/5] Copiando archivos y directorios de produccion..." -ForegroundColor $cyan

$itemsToCopy = @(
    "DatosReferencia",
    "hub",
    "pb_data",
    "pb_hooks",
    "pb_public",
    "scripts",
    "pocketbase.exe",
    "start-portable.bat",
    "start-portable-silent.vbs",
    "kill.ps1",
    "stop.bat",
    "gravy-Icono.ico",
    "LICENSE.md",
    "CHANGELOG.md"
)

foreach ($item in $itemsToCopy) {
    $src = Join-Path $rootPath $item
    $dest = Join-Path $stagingDir $item
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dest -Recurse -Force
        Write-Host "    [OK] Copiado: $item" -ForegroundColor $green
    } else {
        Write-Host "    [X] No se encontro (omitido): $item" -ForegroundColor $yellow
    }
}

# Limpieza dentro de carpetas copiadas (ej. no empaquetar bases de datos temporales de empresas)
$stagingEmpresas = Join-Path $stagingDir "empresas"
if (Test-Path $stagingEmpresas) {
    # Asegurar que este vacio para una instalacion limpia
    Remove-Item -Recurse -Force "$stagingEmpresas\*" -ErrorAction SilentlyContinue
    Write-Host "    [OK] Carpeta 'empresas' limpiada para distribucion limpia." -ForegroundColor $green
}

# Limpieza de logs temporales o carpetas de desarrollo no deseadas en hub/
Remove-Item -Recurse -Force "$stagingDir\hub\pb_data\*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$stagingDir\hub\pb_hooks\zz_seed_user.pb.js" -ErrorAction SilentlyContinue
Write-Host "    [OK] Directorio de hub limpiado para distribucion." -ForegroundColor $green

Write-Host ""
Write-Host "[4/5] Comprimiendo archivos a GravyLocal-Portable.zip..." -ForegroundColor $cyan
Write-Host "    Creando archivo ZIP (esto puede demorar un momento)..." -ForegroundColor $yellow
Compress-Archive -Path "$stagingDir\*" -DestinationPath $zipPath -Force
Write-Host "    [OK] Compresion completada con exito." -ForegroundColor $green

Write-Host ""
Write-Host "[5/5] Limpiando archivos temporales..." -ForegroundColor $cyan
Remove-Item -Recurse -Force $stagingDir -ErrorAction SilentlyContinue
Write-Host "    [OK] Directorio temporal eliminado." -ForegroundColor $green

Write-Host ""
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host "      PAQUETE PORTABLE CREADO CON EXITO            " -ForegroundColor $green
Write-Host "===================================================" -ForegroundColor $cyan
Write-Host "Archivo generado en: $zipPath" -ForegroundColor $white
Write-Host "Tamano aproximado: $((Get-Item $zipPath).Length / 1MB -as [int]) MB" -ForegroundColor $white
Write-Host ""
Write-Host "Instrucciones de distribucion:" -ForegroundColor $yellow
Write-Host "1. Copia el archivo ZIP a cualquier maquina con Windows." -ForegroundColor $white
Write-Host "2. Descomprimelo en cualquier carpeta (ej. C:\GravyLocal)." -ForegroundColor $white
Write-Host "3. Abre PowerShell como administrador dentro de 'scripts' y ejecuta 'install-portable-service.ps1'." -ForegroundColor $white
Write-Host ""
pause
