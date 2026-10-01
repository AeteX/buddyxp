@echo off
REM Double-click wrapper for launch.ps1.
REM -ExecutionPolicy Bypass is required on systems where PowerShell
REM script execution is disabled by policy (the default on Windows).

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1" %*
if errorlevel 1 pause