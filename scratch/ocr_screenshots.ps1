[void][Windows.Security.Cryptography.CryptographicBuffer, Windows.Security.Cryptography, ContentType=WindowsRuntime]
[void][Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
[void][Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType=WindowsRuntime]

function Get-OcrText {
    param([string]$imagePath)
    try {
        $file = Get-Item $imagePath
        $asyncOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($file.FullName)
        while ($asyncOp.Status -eq "Started") { Start-Sleep -Milliseconds 10 }
        $storageFile = $asyncOp.GetResults()

        $streamOp = $storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)
        while ($streamOp.Status -eq "Started") { Start-Sleep -Milliseconds 10 }
        $stream = $streamOp.GetResults()
        
        $decoderOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
        while ($decoderOp.Status -eq "Started") { Start-Sleep -Milliseconds 10 }
        $decoder = $decoderOp.GetResults()
        
        $bitmapOp = $decoder.GetSoftwareBitmapAsync()
        while ($bitmapOp.Status -eq "Started") { Start-Sleep -Milliseconds 10 }
        $bitmap = $bitmapOp.GetResults()
        
        $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
        if ($null -eq $engine) {
            $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("es-CO"))
        }
        if ($null -eq $engine) {
            return "Error: Cannot create OcrEngine"
        }
        
        $recognizeOp = $engine.RecognizeAsync($bitmap)
        while ($recognizeOp.Status -eq "Started") { Start-Sleep -Milliseconds 10 }
        $result = $recognizeOp.GetResults()
        
        return $result.Text
    } catch {
        return "Error: $_"
    }
}

$screenshotsDir = "c:\Users\JULIAN\Desktop\GravyLocal2.0\Landing\screenshots"
$files = Get-ChildItem -Path $screenshotsDir -Filter "*.png"

foreach ($file in $files) {
    Write-Host "========================================"
    Write-Host "FILE: $($file.Name)"
    Write-Host "----------------------------------------"
    $text = Get-OcrText -imagePath $file.FullName
    Write-Host $text
    Write-Host "========================================`n"
}
