Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptPath = WScript.ScriptFullName
currentDir = fso.GetParentFolderName(scriptPath)

' Set working directory to project root
WshShell.CurrentDirectory = currentDir

' 1. Verificar existencia de archivos clave
If Not fso.FileExists("pocketbase.exe") Then
    MsgBox "No se encontró pocketbase.exe en " & currentDir & vbCrLf & "Por favor, ejecute el script desde la carpeta raíz del proyecto.", vbCritical, "GRAVY v2.0 - Error"
    WScript.Quit 1
End If

' 2. Cerrar procesos previos en puertos de interés (8088, 8089, 8090)
WshShell.Run "powershell -NoProfile -ExecutionPolicy Bypass -File ""kill.ps1""", 0, True

' 4. Iniciar GRAVY HUB (localhost:8089) de forma silenciosa
WshShell.Run "pocketbase.exe serve --http=127.0.0.1:8089 --dir=""hub\pb_data"" --hooksDir=""hub\pb_hooks""", 0, False

' 5. Iniciar GRAVY Orquestador (localhost:8088) de forma silenciosa
nodeExe = "node"
If fso.FileExists(currentDir & "\bin\node.exe") Then
    nodeExe = """" & currentDir & "\bin\node.exe"""
End If
WshShell.Run nodeExe & " """ & currentDir & "\hub\orchestrator.js""", 0, False

' 6. Iniciar Empresa Demo (localhost:8090) de forma silenciosa
 WshShell.Run "pocketbase.exe serve --http=127.0.0.1:8090 --dir=""pb_data"" --publicDir=""pb_public"" --hooksDir=""pb_hooks""", 0, False

' 6b. Iniciar Empresa: JULIAN ESPINOSA (localhost:8091) de forma silenciosa
 WshShell.Run "pocketbase.exe serve --http=127.0.0.1:8091 --dir=""empresas\empresa_8091\pb_data"" --publicDir=""pb_public"" --hooksDir=""empresas\empresa_8091\pb_hooks"" --migrationsDir=""pb_migrations""", 0, False

' 8. Abrir el navegador en la app principal
'WshShell.Run "cmd /c start http://localhost:8090", 0, False
