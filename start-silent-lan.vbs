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

' 3. Detectar la dirección IP local de forma silenciosa
tempFile = WshShell.ExpandEnvironmentStrings("%TEMP%") & "\gravy_ip.txt"
WshShell.Run "cmd /c powershell -NoProfile -ExecutionPolicy Bypass -Command ""$ip=(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.InterfaceAlias -notmatch 'Loopback|vEthernet|WSL|Hyper-V' } | Select-Object -First 1 -ExpandProperty IPAddress); if(-not $ip){$ip='localhost'}; [System.IO.File]::WriteAllText('" & tempFile & "', $ip)""", 0, True

localIp = "localhost"
If fso.FileExists(tempFile) Then
    Set objFile = fso.OpenTextFile(tempFile, 1)
    localIp = Trim(objFile.ReadLine)
    objFile.Close
    fso.DeleteFile tempFile
End If

pbUrl = "http://" & localIp & ":8090"

' 4. Intentar habilitar el firewall de forma silenciosa
WshShell.Run "netsh advfirewall firewall add rule name=""Gravy Orchestrator 8088"" dir=in action=allow protocol=TCP localport=8088", 0, True
WshShell.Run "netsh advfirewall firewall add rule name=""Gravy Hub 8089"" dir=in action=allow protocol=TCP localport=8089", 0, True
WshShell.Run "netsh advfirewall firewall add rule name=""Gravy PocketBase 8090"" dir=in action=allow protocol=TCP localport=8090", 0, True

' 6. Iniciar GRAVY HUB (LAN: 8089) de forma silenciosa
WshShell.Run "pocketbase.exe serve --http=0.0.0.0:8089 --dir=""hub\pb_data"" --hooksDir=""hub\pb_hooks""", 0, False

' 7. Iniciar GRAVY Orquestador (LAN: 8088) de forma silenciosa
nodeExe = "node"
If fso.FileExists(currentDir & "\bin\node.exe") Then
    nodeExe = """" & currentDir & "\bin\node.exe"""
End If
WshShell.Run nodeExe & " """ & currentDir & "\hub\orchestrator.js""", 0, False

' 8. Iniciar Empresa Demo (LAN: 8090) de forma silenciosa
WshShell.Run "pocketbase.exe serve --http=0.0.0.0:8090 --dir=""pb_data"" --publicDir=""pb_public"" --hooksDir=""pb_hooks""", 0, False

' 8b. Iniciar Empresa: JULIAN ESPINOSA (LAN: 8091) de forma silenciosa
 WshShell.Run "pocketbase.exe serve --http=0.0.0.0:8091 --dir=""empresas\empresa_8091\pb_data"" --publicDir=""pb_public"" --hooksDir=""empresas\empresa_8091\pb_hooks"" --migrationsDir=""pb_migrations""", 0, False

' 10. Abrir el navegador en la app principal
'WshShell.Run "cmd /c start http://localhost:8090", 0, False
