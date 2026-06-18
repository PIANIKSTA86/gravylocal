Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetAbsolutePathName(".")

' ─── 1. Verificar archivos clave ───────────────────────────────────────────
If Not fso.FileExists(currentDir & "\pocketbase.exe") Then
    MsgBox "No se encontró pocketbase.exe en " & currentDir & vbCrLf & _
           "Por favor, ejecute el script desde la carpeta raíz del proyecto.", _
           vbCritical, "GRAVY v2.0 - Error"
    WScript.Quit 1
End If

If Not fso.FileExists(currentDir & "\start-cloud.bat") Then
    MsgBox "No se encontró start-cloud.bat en " & currentDir & vbCrLf & _
           "Asegúrese de haber configurado el túnel de Cloudflare.", _
           vbCritical, "GRAVY v2.0 - Error"
    WScript.Quit 1
End If

' ─── 2. Cerrar procesos previos en puertos (silencioso) ────────────────────
WshShell.Run "powershell -NoProfile -ExecutionPolicy Bypass -File """ & currentDir & "\kill.ps1""", 0, True

' ─── 3. Esperar a que los puertos se liberen ───────────────────────────────
WshShell.Run "cmd /c timeout /t 2 /nobreak", 0, True

' ─── 4. Iniciar GRAVY HUB (localhost:8089) — sin ventana ──────────────────
WshShell.Run "pocketbase.exe serve --http=127.0.0.1:8089 --dir=""" & currentDir & "\hub\pb_data"" --hooksDir=""" & currentDir & "\hub\pb_hooks""", 0, False

' ─── 5. Iniciar GRAVY Orquestador (localhost:8088) — sin ventana ───────────
WshShell.Run "node """ & currentDir & "\hub\orchestrator.js""", 0, False

' ─── 6. Iniciar Empresa Demo (localhost:8090) — sin ventana ───────────────
WshShell.Run "pocketbase.exe serve --http=127.0.0.1:8090 --dir=""" & currentDir & "\pb_data"" --publicDir=""" & currentDir & "\pb_public"" --hooksDir=""" & currentDir & "\pb_hooks""", 0, False

' ─── 7. Esperar que PocketBase levante antes de abrir el túnel ─────────────
WshShell.Run "cmd /c timeout /t 4 /nobreak", 0, True

' ─── 8. Iniciar Cloudflare Tunnel — sin ventana ───────────────────────────
Dim cfgPath
cfgPath = WshShell.ExpandEnvironmentStrings("%USERPROFILE%") & "\.cloudflared\config.yml"
WshShell.Run "cloudflared tunnel --config """ & cfgPath & """ run", 0, False

' ─── 9. Abrir el navegador en la app pública ──────────────────────────────
WshShell.Run "cmd /c start https://app.gravy-ms.com", 0, False
