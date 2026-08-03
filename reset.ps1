$ports = 8089, 8090, 8085
foreach ($p in $ports) {
    $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($pids) {
        $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    }
}
Start-Sleep -Seconds 2
Remove-Item -Recurse -Force "c:\Users\JULIAN\Desktop\GravyLocal2.0\hub\pb_data" -ErrorAction SilentlyContinue
Write-Host "HUB reset completado"
