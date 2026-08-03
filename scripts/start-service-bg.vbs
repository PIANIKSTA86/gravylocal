Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Obtener la ruta del script VBS en ejecución
scriptPath = WScript.ScriptFullName
scriptDir = fso.GetParentFolderName(scriptPath)

batPath = scriptDir & "\start-services.bat"

' Verificar que el archivo batch de inicio exista
If Not fso.FileExists(batPath) Then
    MsgBox "No se encontró el archivo de servicios: " & batPath & vbCrLf & _
           "Por favor, reinstale los servicios o verifique la carpeta.", _
           16, "GRAVY v2.0 - Error de Arranque"
    WScript.Quit 1
End If

' Ejecutar el batch en segundo plano con ventana oculta (0) y sin esperar (False)
WshShell.Run "cmd /c """ & batPath & """", 0, False
