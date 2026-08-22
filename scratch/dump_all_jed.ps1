Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('DatosReferencia\TERCEROS_JED.xlsx')

$ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
$ssXml = [xml](New-Object System.IO.StreamReader($ssEntry.Open())).ReadToEnd()
$strings = @($ssXml.sst.si | ForEach-Object { 
    if ($_.t) { $_.t } 
    elseif ($_.r) { ($_.r | ForEach-Object { $_.t }) -join "" }
    else { "" }
})

$sheetEntry = $zip.GetEntry('xl/worksheets/sheet1.xml')
$sheetXml = [xml](New-Object System.IO.StreamReader($sheetEntry.Open())).ReadToEnd()

$headers = @{}
$rows = @()

foreach ($row in $sheetXml.worksheet.sheetData.row) {
    $rowNum = [int]$row.r
    $rowObj = [ordered]@{}
    foreach ($c in $row.c) {
        $colName = ($c.r -replace '\d+','')
        $val = $c.v
        if ($c.t -eq 's' -and $val) {
            $val = $strings[[int]$val]
        }
        if ($rowNum -eq 1) {
            $headers[$colName] = $val
        } else {
            $h = $headers[$colName]
            if ($h) {
                $rowObj[$h] = $val
            }
        }
    }
    if ($rowNum -gt 1) {
        $rows += (New-Object PSObject -Property $rowObj)
    }
}

Write-Host "Total data rows:" $rows.Count
$rows | Format-Table doc_type, doc_number, person_type, type, nombres, apellidos, city_code, dept_code, tax_regime, responsabilidades -AutoSize

$zip.Dispose()
