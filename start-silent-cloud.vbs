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

' ─── 2. Cerrar procesos previos en puertos (silencioso) ────────────────────
WshShell.Run "powershell -NoProfile -ExecutionPolicy Bypass -File """ & currentDir & "\kill.ps1""", 0, True

' ─── 3. Esperar a que los puertos se liberen ───────────────────────────────
WshShell.Run "cmd /c timeout /t 2 /nobreak", 0, True

' ─── 4. Iniciar GRAVY HUB (localhost:8089) — sin ventana ──────────────────
WshShell.Run "pocketbase.exe serve --http=127.0.0.1:8089 --dir=""" & currentDir & "\hub\pb_data"" --hooksDir=""" & currentDir & "\hub\pb_hooks""", 0, False

' ─── 5. Iniciar GRAVY Orquestador (localhost:8088) — sin ventana ───────────
nodeExe = "node"
If fso.FileExists(currentDir & "\bin\node.exe") Then
    nodeExe = """" & currentDir & "\bin\node.exe"""
End If
WshShell.Run nodeExe & " """ & currentDir & "\hub\orchestrator.js""", 0, False

' ─── 6. Iniciar Empresa Demo (localhost:8090) — sin ventana ───────────────
WshShell.Run "pocketbase.exe serve --http=127.0.0.1:8090 --dir=""" & currentDir & "\pb_data"" --publicDir=""" & currentDir & "\pb_public"" --hooksDir=""" & currentDir & "\pb_hooks""", 0, False

' 6b. Iniciar Empresa 4PATAS (localhost:8091) sin ventana
WshShell.Run "pocketbase.exe serve --http=127.0.0.1:8091 --dir=""" & currentDir & "\empresas\empresa_8091\pb_data"" --publicDir=""" & currentDir & "\pb_public"" --hooksDir=""" & currentDir & "\empresas\empresa_8091\pb_hooks"" --migrationsDir=""" & currentDir & "\pb_migrations""", 0, False

' ─── 7. Esperar que PocketBase levante antes de abrir el túnel ─────────────
WshShell.Run "cmd /c timeout /t 4 /nobreak", 0, True

' ─── 8. Resolver binario de Cloudflare Tunnel ──────────────────────────────
Dim cfBin
If fso.FileExists(currentDir & "\bin\cloudflared.exe") Then
    cfBin = """" & currentDir & "\bin\cloudflared.exe"""
Else
    cfBin = "cloudflared"
End If

' ─── 9. Detectar método de configuración (Token vs Config.yml) ──────────────
Dim token, envPath, cfCmd
token = ""
envPath = currentDir & "\config\cloudflare.env"

If fso.FileExists(envPath) Then
    Set envFile = fso.OpenTextFile(envPath, 1)
    Do Until envFile.AtEndOfStream
        line = Trim(envFile.ReadLine())
        If Left(line, 24) = "CLOUDFLARE_TUNNEL_TOKEN=" Then
            token = Trim(Mid(line, 25))
        End If
    Loop
    envFile.Close
End If

If token <> "" Then
    cfCmd = cfBin & " tunnel run --token " & token
Else
    Dim cfgPath
    cfgPath = WshShell.ExpandEnvironmentStrings("%USERPROFILE%") & "\.cloudflared\config.yml"
    If fso.FileExists(cfgPath) Then
        cfCmd = cfBin & " tunnel --config """ & cfgPath & """ run"
    Else
        MsgBox "No se encontró token ni archivo de configuración para Cloudflare Tunnel." & vbCrLf & _
               "Por favor ejecute setup-cloudflare.bat primero.", vbExclamation, "GRAVY v2.0 - Advertencia"
        WScript.Quit 1
    End If
End If

' ─── 10. Iniciar Cloudflare Tunnel — sin ventana ──────────────────────────
WshShell.Run cfCmd, 0, False

' ─── 11. Abrir el navegador en la app pública ─────────────────────────────
WshShell.Run "cmd /c start https://app.gravy-ms.com", 0, False
