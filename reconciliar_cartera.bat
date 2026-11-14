@echo off
setlocal
chcp 65001 > nul
title Reconciliador de Documentos de Cruce en Cartera PH

node "%~dp0scripts\reconcile_cruce_cartera.js" %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Ocurrio un error durante la ejecucion.
)

echo.
pause
