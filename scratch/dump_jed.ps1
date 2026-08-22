Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('DatosReferencia\TERCEROS_JED.xlsx')

$ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
$ssXml = [xml](New-Object System.IO.StreamReader($ssEntry.Open())).ReadToEnd()
$strings = @($ssXml.sst.si | ForEach-Object { $_.t })

$sheetEntry = $zip.GetEntry('xl/worksheets/sheet1.xml')
$sheetXml = [xml](New-Object System.IO.StreamReader($sheetEntry.Open())).ReadToEnd()

Write-Host "Total rows in Sheet1:" $sheetXml.worksheet.sheetData.row.Count

# Show first 5 rows
$rowCount = 0
foreach ($row in $sheetXml.worksheet.sheetData.row) {
    $rowCount++
    if ($rowCount -gt 5) { break }
    $cells = @()
    foreach ($c in $row.c) {
        $val = $c.v
        if ($c.t -eq 's' -and $val) {
            $val = $strings[[int]$val]
        }
        $cells += "$($c.r): $val"
    }
    Write-Host "Row $($row.r):" ($cells -join " | ")
}

$zip.Dispose()
