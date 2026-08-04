@echo off
setlocal
set ROOT=%~dp0
call %ROOT%start.bat portable %*
exit /b %ERRORLEVEL%
