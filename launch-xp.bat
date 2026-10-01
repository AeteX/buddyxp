@echo off
setlocal enableextensions

title BuddyChat XP Launcher
color 1F

REM ================================================================
REM  BuddyChat XP launcher - Windows XP SP3 edition
REM
REM  Uses only commands that ship with Windows XP's cmd.exe.
REM  No PowerShell, no 'where', no 'timeout', no 'py' launcher.
REM
REM  If the window closes immediately when you double-click this:
REM    1. Make sure the file has CRLF line endings, not LF.
REM       Open it in Notepad, add a blank line, save as .bat.
REM    2. Make sure launch-xp.bat sits in the same folder as
REM       xp-common.js, index.html, legacy.html and ie.html.
REM
REM  Usage:
REM    Double-click launch-xp.bat
REM    or from cmd.exe:  launch-xp.bat
REM
REM  Environment variables (optional):
REM    set PORT=9000
REM    set VERSION=modern
REM    launch-xp.bat
REM ================================================================

REM -- Defaults --
if "%PORT%"=="" set PORT=8000
if "%BIND%"=="" set BIND=127.0.0.1
if "%VERSION%"=="" set VERSION=

REM -- Switch to the folder this batch file lives in --
pushd "%~dp0"
if errorlevel 1 goto :dir_error

REM -- Quick sanity check that we're in the right place --
if not exist "xp-common.js" goto :wrong_folder
if not exist "index.html"   goto :wrong_folder

REM ================================================================
REM  Detect Python
REM ================================================================

set PYEXE=
call :find_python
if defined PYEXE goto :got_python

REM ================================================================
REM  Detect Node.js
REM ================================================================

set NODEEXE=
call :find_node
if defined NODEEXE goto :got_node

goto :no_runtime

REM ================================================================
REM  Python found - pick a server
REM ================================================================

:got_python

REM -- Preferred: our custom launch-python.py (explicit MIME types) --
if not exist "launch-python.py" goto :try_python_builtin

"%PYEXE%" -c "import http.server" >nul 2>nul
if not errorlevel 1 (
    set SERVERTYPE=py3_custom
    goto :server_selected
)

"%PYEXE%" -c "import BaseHTTPServer" >nul 2>nul
if not errorlevel 1 (
    set SERVERTYPE=py2_custom
    goto :server_selected
)

:try_python_builtin

"%PYEXE%" -c "import http.server" >nul 2>nul
if not errorlevel 1 (
    set SERVERTYPE=py3_builtin
    goto :server_selected
)

"%PYEXE%" -c "import SimpleHTTPServer" >nul 2>nul
if not errorlevel 1 (
    set SERVERTYPE=py2_builtin
    goto :server_selected
)

goto :python_too_old

REM ================================================================
REM  Node found
REM ================================================================

:got_node
if not exist "launch-node.js" goto :node_no_script
set SERVERTYPE=node
goto :server_selected

:node_no_script
echo.
echo  ERROR: Found Node.js at "%NODEEXE%" but launch-node.js
echo         is missing from this folder.
echo.
goto :end

REM ================================================================
REM  Welcome to Setup
REM ================================================================

:server_selected

if not "%VERSION%"=="" goto :skip_menu

:menu
cls
echo.
echo  ============================================================
echo    BuddyChat XP  v0.1.0
echo    AeteX Interactive   Est. 2026   -   https://aetex.is-a.dev
echo  ============================================================
echo.
echo    Thank you for choosing BuddyChat XP.
echo.
echo    Setup will start a small local web server and open the
echo    version you select below.
echo.
echo       [1]  Automatic .......... Recommended.
echo                                 Let your browser pick.
echo.
echo       [2]  Modern ............. index.html
echo                                 Newest browsers. Streaming.
echo.
echo       [3]  Legacy ............. legacy.html
echo                                 Firefox 3.5+, Chrome 4+,
echo                                 MyPal, IE10 / IE11.
echo.
echo       [4]  Internet Explorer .. ie.html
echo                                 IE8 / IE9. Replies appear
echo                                 all at once.
echo.
echo       [Q]  Quit
echo.
set CHOICE=
set /p CHOICE=    Enter your choice [1]: 
if "%CHOICE%"=="" set CHOICE=1

if /i "%CHOICE%"=="1" (set VERSION=auto   & goto :skip_menu)
if /i "%CHOICE%"=="2" (set VERSION=modern & goto :skip_menu)
if /i "%CHOICE%"=="3" (set VERSION=legacy & goto :skip_menu)
if /i "%CHOICE%"=="4" (set VERSION=ie     & goto :skip_menu)
if /i "%CHOICE%"=="q"     goto :cancel
if /i "%CHOICE%"=="quit"  goto :cancel
if /i "%CHOICE%"=="exit"  goto :cancel

echo.
echo    Unrecognized choice. Using Automatic.
set VERSION=auto
goto :skip_menu

:skip_menu

REM ================================================================
REM  Map version to URL path
REM ================================================================

set URLPATH=/
set VERSIONLABEL=Automatic

if /i "%VERSION%"=="modern" set URLPATH=/index.html
if /i "%VERSION%"=="modern" set VERSIONLABEL=Modern - index.html
if /i "%VERSION%"=="legacy" set URLPATH=/legacy.html
if /i "%VERSION%"=="legacy" set VERSIONLABEL=Legacy - legacy.html
if /i "%VERSION%"=="ie"     set URLPATH=/ie.html
if /i "%VERSION%"=="ie"     set VERSIONLABEL=Internet Explorer - ie.html

set URL=http://%BIND%:%PORT%%URLPATH%

REM ================================================================
REM  Map server type to command line
REM ================================================================

set SERVERNAME=
set SERVEREXE=
set SERVERARGS=
set BINDLABEL=%BIND%
set PY2LIMIT=

if "%SERVERTYPE%"=="py3_custom" (
    set SERVERNAME=Python 3 - launch-python.py
    set SERVEREXE=%PYEXE%
    set SERVERARGS=launch-python.py %PORT% %BIND%
)
if "%SERVERTYPE%"=="py2_custom" (
    set SERVERNAME=Python 2 - launch-python.py
    set SERVEREXE=%PYEXE%
    set SERVERARGS=launch-python.py %PORT% %BIND%
)
if "%SERVERTYPE%"=="py3_builtin" (
    set SERVERNAME=Python 3 - http.server
    set SERVEREXE=%PYEXE%
    set SERVERARGS=-m http.server %PORT% --bind %BIND%
)
if "%SERVERTYPE%"=="py2_builtin" (
    set SERVERNAME=Python 2 - SimpleHTTPServer
    set SERVEREXE=%PYEXE%
    set SERVERARGS=-m SimpleHTTPServer %PORT%
    set BINDLABEL=0.0.0.0 - Python 2 limitation
    set PY2LIMIT=1
)
if "%SERVERTYPE%"=="node" (
    set SERVERNAME=Node.js - launch-node.js
    set SERVEREXE=%NODEEXE%
    set SERVERARGS=launch-node.js %PORT% %BIND% "%CD%"
)

REM ================================================================
REM  Final banner
REM ================================================================

cls
echo.
echo  ============================================================
echo    BuddyChat XP  v1.0.2  -  starting up
echo  ============================================================
echo.
echo    OS:        Windows XP
echo    Server:    %SERVERNAME%
echo    Version:   %VERSIONLABEL%
echo    URL:       %URL%
echo    Bind:      %BINDLABEL%
echo.
echo    Press Ctrl+C to stop the server and exit.
echo.

if defined PY2LIMIT (
    echo    NOTE: Python 2.7's SimpleHTTPServer always listens on
    echo          0.0.0.0, which means other machines on your LAN
    echo          can reach this page while it is running. If that
    echo          is a problem, stop the server when you are done.
    echo.
)

REM ================================================================
REM  Launch browser, then run server in foreground
REM ================================================================

start "" "%URL%"
echo.
"%SERVEREXE%" %SERVERARGS%

goto :end

REM ================================================================
REM  Subroutines
REM ================================================================

:find_python
REM 1. PATH
for %%i in (python.exe) do if not "%%~$PATH:i"=="" set PYEXE=%%~$PATH:i
if defined PYEXE goto :eof

REM 2. Common install paths
if exist "C:\Python27\python.exe"           set PYEXE=C:\Python27\python.exe
if defined PYEXE goto :eof
if exist "C:\Python26\python.exe"           set PYEXE=C:\Python26\python.exe
if defined PYEXE goto :eof
if exist "C:\Python25\python.exe"           set PYEXE=C:\Python25\python.exe
if defined PYEXE goto :eof
if exist "C:\Python24\python.exe"           set PYEXE=C:\Python24\python.exe
if defined PYEXE goto :eof
if exist "C:\Python34\python.exe"           set PYEXE=C:\Python34\python.exe
if defined PYEXE goto :eof
if exist "%ProgramFiles%\Python 2.7\python.exe" set PYEXE=%ProgramFiles%\Python 2.7\python.exe
if defined PYEXE goto :eof
if exist "%ProgramFiles%\Python 2.6\python.exe" set PYEXE=%ProgramFiles%\Python 2.6\python.exe
if defined PYEXE goto :eof
if exist "%ProgramFiles%\Python 2.5\python.exe" set PYEXE=%ProgramFiles%\Python 2.5\python.exe
goto :eof

:find_node
for %%i in (node.exe) do if not "%%~$PATH:i"=="" set NODEEXE=%%~$PATH:i
if defined NODEEXE goto :eof
if exist "C:\Program Files\nodejs\node.exe" set NODEEXE=C:\Program Files\nodejs\node.exe
goto :eof

REM ================================================================
REM  Error paths
REM ================================================================

:dir_error
echo.
echo  ERROR: Could not enter the folder this batch file lives in.
echo.
echo  If the file is on a network share or a removable drive with
echo  a path XP cannot cd into, copy the whole buddyxp folder to
echo  your Desktop and try again.
echo.
goto :end

:wrong_folder
echo.
echo  ERROR: xp-common.js and index.html were not found next to
echo         this batch file.
echo.
echo  Make sure launch-xp.bat sits in the SAME FOLDER as the
echo  BuddyChat XP HTML/CSS/JS files. If you only copied the .bat
echo  somewhere, copy the entire folder instead.
echo.
echo  Current folder: %CD%
echo.
goto :end

:no_runtime
echo.
echo  ============================================================
echo    BuddyChat XP Launcher
echo  ============================================================
echo.
echo    Neither Python nor Node.js was found on this system.
echo.
echo    Windows XP does not include a web server, so you need one
echo    of the following installed:
echo.
echo      * Python 2.7.18 - last Python 2 release, supports XP SP3
echo        https://www.python.org/download/releases/2.7.18/
echo.
echo      * Python 3.4.10 - last Python 3 release to support XP
echo        https://www.python.org/downloads/release/python-3410/
echo.
echo      * Node.js 4.x or 5.x - last versions supporting XP
echo        https://nodejs.org/dist/
echo.
echo    During Python install, tick "Add python.exe to Path" and
echo    leave the default install location alone.
echo.
goto :end

:python_too_old
echo.
echo  ERROR: Found Python at "%PYEXE%" but it does not have
echo         the http.server or SimpleHTTPServer module.
echo.
echo  This usually means a very old or broken Python install.
echo  Reinstall Python 2.7.18 from python.org.
echo.
goto :end

:cancel
echo.
echo    Setup cancelled. No files were changed.
echo.
goto :end

REM ================================================================
REM  End
REM ================================================================

:end
popd
endlocal
echo.
echo  Press any key to close this window.
pause >nul