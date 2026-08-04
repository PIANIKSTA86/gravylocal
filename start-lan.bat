@echo off
setlocal
set "ROOT=%~dp0"
call "%ROOT%start.bat" lan %*
exit /b %ERRORLEVEL%
