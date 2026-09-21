# Si el orquestador (8088) esta supervisado por PM2, detenerlo por PID no
# sirve: PM2 lo revive automaticamente (autorestart). Hay que pedirle a PM2
# que lo detenga explicitamente primero.
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    pm2 stop gravy-orchestrator 2>$null | Out-Null
}

$ports = [System.Collections.Generic.List[int]](8080..8150)
$envFile = Join-Path $PSScriptRoot "config\ports.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*GRAVY_MAIN_PORT\s*=\s*(\d+)') {
            $base = [int]$matches[1]
            (($base - 5)..($base + 30)) | ForEach-Object { if (-not $ports.Contains($_)) { $ports.Add($_) } }
        }
    }
}
foreach ($p in $ports) {
    $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($pids) {
        $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    }
}

# Detener procesos huérfanos de Cloudflare Tunnel si fueron iniciados manualmente
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
