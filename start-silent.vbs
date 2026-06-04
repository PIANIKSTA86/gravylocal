Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetAbsolutePathName(".")

' 1. Verificar existencia de archivos clave
If Not fso.FileExists(currentDir & "\pocketbase.exe") Then
    MsgBox "No se encontró pocketbase.exe en " & currentDir & vbCrLf & "Por favor, ejecute el script desde la carpeta raíz del proyecto.", vbCritical, "GRAVY v2.0 - Error"
    WScript.Quit 1
End If

If Not fso.FileExists(currentDir & "\mobile-propietarios-app\package.json") Then
    MsgBox "No se encontró la app móvil en: " & currentDir & "\mobile-propietarios-app", vbCritical, "GRAVY v2.0 - Error"
    WScript.Quit 1
End If

' 2. Cerrar procesos previos en puertos de interés (8088, 8089, 8090, 8085)
WshShell.Run "powershell -NoProfile -ExecutionPolicy Bypass -File """ & currentDir & "\kill.ps1""", 0, True

' 3. Configurar variable de entorno para Expo
Set colUserEnv = WshShell.Environment("Process")
colUserEnv("EXPO_PUBLIC_PB_URL") = "http://127.0.0.1:8090"

' 4. Iniciar GRAVY HUB (localhost:8089) de forma silenciosa
WshShell.Run "pocketbase.exe serve --http=127.0.0.1:8089 --dir=""" & currentDir & "\hub\pb_data"" --hooksDir=""" & currentDir & "\hub\pb_hooks""", 0, False

' 5. Iniciar GRAVY Orquestador (localhost:8088) de forma silenciosa
WshShell.Run "node """ & currentDir & "\hub\orchestrator.js""", 0, False

' 6. Iniciar Empresa Demo (localhost:8090) de forma silenciosa
WshShell.Run "pocketbase.exe serve --http=127.0.0.1:8090 --dir=""" & currentDir & "\pb_data"" --publicDir=""" & currentDir & "\pb_public"" --hooksDir=""" & currentDir & "\pb_hooks""", 0, False

' 7. Iniciar Expo (localhost:8085) de forma silenciosa
WshShell.Run "cmd /c cd /d """ & currentDir & "\mobile-propietarios-app"" && npx expo start --port 8085 --clear", 0, False

' 8. Abrir el navegador en la app principal
WshShell.Run "cmd /c start http://localhost:8090", 0, False
