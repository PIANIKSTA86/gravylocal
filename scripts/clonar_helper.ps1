param(
    [Parameter(Mandatory=$true)]
    [string]$Root,
    [Parameter(Mandatory=$true)]
    [string]$ZipPath
)

$Root = $Root.TrimEnd('\')

# Lista explicita de archivos y carpetas a incluir en el clon
$include = @(
    'pocketbase.exe',
    'bin',
    'hub',
    'pb_data',
    'pb_hooks',
    'pb_migrations',
    'pb_public',
    'empresas',
    'gravy-Icono.ico',
    'kill.ps1',
    'stop.bat',
    'start-portable.bat',
    'start-portable-silent.vbs',
    'start-lan.bat',
    'start-silent-lan.vbs',
    'start.bat',
    'instalar.bat',
    'clonar.bat',
    'scripts\clonar_helper.ps1',
    'update-patch.bat',
    'reset.ps1',
    'LEEME-INSTALACION.txt',
    'CHANGELOG.md',
    'LICENSE.md'
)

$paths = @()
foreach ($item in $include) {
    $p = Join-Path $Root $item
    if (Test-Path $p) {
        $paths += $p
        Write-Host "  [+] $item"
    } else {
        Write-Host "  [?] $item (no encontrado, omitido)"
    }
}

Write-Host ""
Write-Host "  Total elementos: $($paths.Count)"
Write-Host "  Comprimiendo... (puede tardar unos minutos)"
Write-Host ""

try {
    Compress-Archive -Path $paths -DestinationPath $ZipPath -CompressionLevel Optimal -ErrorAction Stop
    $sizeMB = [math]::Round((Get-Item $ZipPath).Length / 1MB, 1)
    Write-Host ""
    Write-Host "  ZIP creado exitosamente." -ForegroundColor Green
    Write-Host "  Archivo : $ZipPath"
    Write-Host "  Tamanio : $sizeMB MB"
    exit 0
} catch {
    Write-Host ""
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
