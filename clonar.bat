@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title GRAVY v2.0 - Crear Clon Completo

set "ROOT=%~dp0"
cd /d "%ROOT%"

:: ── Nombre del ZIP con fecha ──────────────────────────
for /f %%a in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd"') do set "FECHA=%%a"
set "ZIPNAME=GravyLocal-CLON-%FECHA%.zip"
set "ZIPPATH=%ROOT%%ZIPNAME%"

echo.
echo  =====================================================
echo    GRAVY v2.0 - Asistente de Clonacion Completa
echo  =====================================================
echo.
echo  Crea una copia exacta de Gravy con todos los datos.
echo  ZIP de salida: %ZIPNAME%
echo.
echo  Contenido del clon:
echo    [+] pocketbase.exe  (motor de base de datos)
echo    [+] bin\node.exe    (Node.js portable)
echo    [+] hub\            (orquestador + dependencias)
echo    [+] pb_data\        (BASE DE DATOS completa)
echo    [+] pb_public\      (frontend web compilado)
echo    [+] pb_hooks\       (logica del negocio)
echo    [+] pb_migrations\  (historial de migraciones)
echo    [+] empresas\       (datos de todas las empresas)
echo    [+] Scripts de inicio, parada e instalacion
echo.
echo  Excluido (innecesario para el clon):
echo    [-] frontend\node_modules  (codigo fuente dev)
echo    [-] mobile-propietarios-app
echo    [-] scratch, logs, temp_zips, .git
echo.

:: ── Verificar que el helper existe ───────────────────
if not exist "%ROOT%scripts\clonar_helper.ps1" (
    echo  [ERROR] No se encontro scripts\clonar_helper.ps1
    echo  Asegurate de ejecutar este .bat desde la carpeta raiz de GravyLocal.
    pause
    exit /b 1
)

:: ── Preguntar si detener Gravy ────────────────────────
set /p CONTINUAR="  ¿Deseas detener Gravy antes de clonar? (S/N): "
if /i "!CONTINUAR!"=="S" (
    echo  Deteniendo servicios Gravy...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%kill.ps1" >nul 2>&1
    timeout /t 3 /nobreak >nul
    echo  Servicios detenidos.
    echo.
)

:: ── Eliminar ZIP previo si existe ────────────────────
if exist "%ZIPPATH%" (
    echo  Eliminando version anterior: %ZIPNAME%
    del /f /q "%ZIPPATH%"
)

echo  ─────────────────────────────────────────────────
echo  Empaquetando... (puede tardar 2-5 minutos)
echo  ─────────────────────────────────────────────────
echo.

:: ── Llamar al helper PowerShell ──────────────────────
powershell -NoProfile -ExecutionPolicy Bypass ^
    -File "%ROOT%scripts\clonar_helper.ps1" ^
    -Root "%ROOT%" ^
    -ZipPath "%ZIPPATH%"

if errorlevel 1 (
    echo.
    echo  [ERROR] Fallo al crear el ZIP.
    echo  Verifica que tengas espacio suficiente en disco y permisos de escritura.
    pause
    exit /b 1
)

echo.
echo  =====================================================
echo    CLON CREADO EXITOSAMENTE
echo  =====================================================
echo.
echo  PASOS PARA INSTALAR EN LA PC DESTINO:
echo.
echo  1. Copia el archivo "%ZIPNAME%"
echo     a la PC destino (USB, red, Drive, etc)
echo.
echo  2. En la PC destino, extrae el ZIP en:
echo       C:\GravyLocal\
echo.
echo  3. Ejecuta:  instalar.bat
echo     Eso es todo. Gravy iniciara automaticamente.
echo.

:: ── Abrir explorador con el ZIP seleccionado ─────────
explorer /select,"%ZIPPATH%"

pause
exit /b 0
