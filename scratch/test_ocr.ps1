$winmdPath = "C:\Windows\System32\WinMetadata"
$references = @(
    "$winmdPath\Windows.Foundation.winmd",
    "$winmdPath\Windows.Graphics.winmd",
    "$winmdPath\Windows.Media.winmd",
    "$winmdPath\Windows.Storage.winmd"
)

$source = @"
using System;
using System.IO;
using System.Threading.Tasks;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage;

public class OcrService {
    public static string GetText(string imagePath) {
        try {
            var task = Task.Run(async () => {
                var file = await StorageFile.GetFileFromPathAsync(imagePath);
                using (var stream = await file.OpenAsync(FileAccessMode.Read)) {
                    var decoder = await BitmapDecoder.CreateAsync(stream);
                    var bitmap = await decoder.GetSoftwareBitmapAsync();
                    var engine = OcrEngine.TryCreateFromUserProfileLanguages();
                    if (engine == null) {
                        return "Error: Cannot create OcrEngine";
                    }
                    var result = await engine.RecognizeAsync(bitmap);
                    return result.Text;
                }
            });
            task.Wait();
            return task.Result;
        } catch (Exception ex) {
            return "Error: " + ex.Message;
        }
    }
}
"@

try {
    Add-Type -TypeDefinition $source -ReferencedAssemblies $references
    Write-Host "Compilation successful!"
    $file = "c:\Users\JULIAN\Desktop\GravyLocal2.0\Landing\screenshots\Captura de pantalla 2026-06-21 003845.png"
    $text = [OcrService]::GetText($file)
    Write-Host "OCR Text: $text"
} catch {
    Write-Host "Error compiling: $_"
}
