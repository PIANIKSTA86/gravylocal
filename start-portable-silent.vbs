Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Obtener la ruta del script VBS en ejecución
scriptPath = WScript.ScriptFullName
currentDir = fso.GetParentFolderName(scriptPath)

batPath = currentDir & "\start-portable.bat"

' Verificar que el archivo batch exista
If Not fso.FileExists(batPath) Then
    MsgBox "No se encontró el archivo de servicios portátil: " & batPath, 16, "GRAVY v2.0 - Error de Arranque"
    WScript.Quit 1
End If

' Ejecutar el batch en segundo plano con ventana oculta (0) y sin esperar (False)
WshShell.Run "cmd /c """ & batPath & """", 0, False
