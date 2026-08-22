Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('DatosReferencia\TERCEROS_JED.xlsx')
foreach ($entry in $zip.Entries) {
    Write-Host $entry.FullName
}

$workbookEntry = $zip.GetEntry('xl/workbook.xml')
if ($workbookEntry) {
    $stream = $workbookEntry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    Write-Host "`n--- WORKBOOK XML ---"
    Write-Host $xml
    $reader.Dispose()
}

$sharedStrings = $zip.GetEntry('xl/sharedStrings.xml')
if ($sharedStrings) {
    $stream = $sharedStrings.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    Write-Host "`n--- SHARED STRINGS (first 500 chars) ---"
    Write-Host $xml.Substring(0, [Math]::Min(500, $xml.Length))
    $reader.Dispose()
}

$zip.Dispose()
