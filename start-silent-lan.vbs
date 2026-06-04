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
WshShell.Run "netsh advfirewall firewall add rule name=""Gravy Expo 8085"" dir=in action=allow protocol=TCP localport=8085", 0, True

' 5. Configurar variable de entorno para Expo
Set colUserEnv = WshShell.Environment("Process")
colUserEnv("EXPO_PUBLIC_PB_URL") = pbUrl

' 6. Iniciar GRAVY HUB (LAN: 8089) de forma silenciosa
WshShell.Run "pocketbase.exe serve --http=0.0.0.0:8089 --dir=""" & currentDir & "\hub\pb_data"" --hooksDir=""" & currentDir & "\hub\pb_hooks""", 0, False

' 7. Iniciar GRAVY Orquestador (LAN: 8088) de forma silenciosa
WshShell.Run "node """ & currentDir & "\hub\orchestrator.js""", 0, False

' 8. Iniciar Empresa Demo (LAN: 8090) de forma silenciosa
WshShell.Run "pocketbase.exe serve --http=0.0.0.0:8090 --dir=""" & currentDir & "\pb_data"" --publicDir=""" & currentDir & "\pb_public"" --hooksDir=""" & currentDir & "\pb_hooks""", 0, False

' 9. Iniciar Expo (LAN: 8085) de forma silenciosa
WshShell.Run "cmd /c cd /d """ & currentDir & "\mobile-propietarios-app"" && npx expo start --lan --port 8085 --clear", 0, False

' 10. Abrir el navegador en la app principal
WshShell.Run "cmd /c start http://localhost:8090", 0, False
