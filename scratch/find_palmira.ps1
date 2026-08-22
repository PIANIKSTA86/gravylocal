$content = Get-Content 'frontend\src\geodata.ts' -Raw
if ($content -match 'PALMIRA') {
    Write-Host "Found PALMIRA in geodata.ts"
} else {
    Write-Host "PALMIRA not found by exact string in geodata.ts"
}

# Find all munis for dept 76
$matches = [regex]::Matches($content, '\{"dept_code":\s*"76",\s*"code":\s*"(\d+)",\s*"name":\s*"([^"]+)"')
Write-Host "Total munis for dept 76:" $matches.Count
foreach ($m in $matches) {
    if ($m.Groups[2].Value -like '*PALM*' -or $m.Groups[1].Value -like '76520*' -or $m.Groups[1].Value -like '76563*') {
        Write-Host "Muni 76:" $m.Groups[1].Value "-" $m.Groups[2].Value
    }
}
