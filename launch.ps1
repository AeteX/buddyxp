<#
.SYNOPSIS
    BuddyChat XP launcher for Windows.

.DESCRIPTION
    Detects Python 3, Python 2, or Node.js and starts a small static file
    server for the BuddyChat XP page. If -Version is not specified, shows
    a short AeteX-style setup prompt asking which version to launch.

    Prefers launch-python.py when present - it sends explicit MIME types
    and does not trust the Windows registry, which fixes "The webpage
    cannot be displayed" on machines where the .html association is broken.

.PARAMETER Port
    TCP port to listen on. Default: 8000.

.PARAMETER Bind
    Address to bind to. Default: 127.0.0.1 (only reachable from this PC).
    Use 0.0.0.0 to expose the site to other machines on your LAN.
    Note: the parameter is called "Bind" because PowerShell already uses
    $Host for the console UI object.

.PARAMETER NoBrowser
    Do not open the default browser automatically.

.PARAMETER Version
    Skip the setup prompt. One of: auto, modern, legacy, ie.

.EXAMPLE
    .\launch.ps1
    .\launch.ps1 -Version modern
    .\launch.ps1 -Port 9000 -Bind 0.0.0.0
    .\launch.ps1 -NoBrowser
#>

[CmdletBinding()]
param(
    [int]$Port = 8000,
    [string]$Bind = '127.0.0.1',
    [switch]$NoBrowser,
    [string]$Version = ''
)

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $ScriptDir

function Test-PythonModule {
    param([string]$Exe, [string[]]$PrefixArgs, [string]$ModuleName)
    try {
        & $Exe @PrefixArgs -c "import $ModuleName" 2>&1 | Out-Null
        return ($LASTEXITCODE -eq 0)
    } catch {
        return $false
    }
}

function Get-ToolVersion {
    param([string]$Exe, [string[]]$PrefixArgs)
    try {
        $out = & $Exe @PrefixArgs --version 2>&1
        return (($out | Out-String) -replace '\s+$', '')
    } catch {
        return $Exe
    }
}

function Test-IsStoreStub {
    param([string]$Path)
    if (-not $Path) { return $false }
    return ($Path -like '*\WindowsApps\*')
}

$pyScript = Join-Path $ScriptDir 'launch-python.py'
$hasPyScript = Test-Path -LiteralPath $pyScript

# -----------------------------------------------------------------
# Pick a server
# -----------------------------------------------------------------

$serverArgs = $null
$serverName = $null

# 0a. python3 + launch-python.py (preferred - explicit MIME types)
if (-not $serverArgs -and $hasPyScript) {
    $cmd = Get-Command python3 -ErrorAction SilentlyContinue
    if ($cmd -and -not (Test-IsStoreStub $cmd.Source)) {
        if (Test-PythonModule -Exe 'python3' -PrefixArgs @() -ModuleName 'http.server') {
            $serverArgs = @('python3', $pyScript, "$Port", $Bind, $ScriptDir)
            $serverName = "Python 3 (launch-python.py)"
        }
    }
}

# 0b. py launcher + launch-python.py
if (-not $serverArgs -and $hasPyScript) {
    $cmd = Get-Command py -ErrorAction SilentlyContinue
    if ($cmd) {
        if (Test-PythonModule -Exe 'py' -PrefixArgs @('-3') -ModuleName 'http.server') {
            $serverArgs = @('py', '-3', $pyScript, "$Port", $Bind, $ScriptDir)
            $serverName = "Python 3 via py launcher (launch-python.py)"
        }
    }
}

# 0c. python + launch-python.py (may be Python 3 or Python 2)
if (-not $serverArgs -and $hasPyScript) {
    $cmd = Get-Command python -ErrorAction SilentlyContinue
    if ($cmd -and -not (Test-IsStoreStub $cmd.Source)) {
        if (Test-PythonModule -Exe 'python' -PrefixArgs @() -ModuleName 'http.server') {
            $serverArgs = @('python', $pyScript, "$Port", $Bind, $ScriptDir)
            $serverName = "Python (launch-python.py)"
        } elseif (Test-PythonModule -Exe 'python' -PrefixArgs @() -ModuleName 'BaseHTTPServer') {
            $serverArgs = @('python', $pyScript, "$Port", $Bind, $ScriptDir)
            $serverName = "Python 2 (launch-python.py)"
        }
    }
}

# 1. python3 -m http.server
if (-not $serverArgs) {
    $cmd = Get-Command python3 -ErrorAction SilentlyContinue
    if ($cmd -and -not (Test-IsStoreStub $cmd.Source)) {
        if (Test-PythonModule -Exe 'python3' -PrefixArgs @() -ModuleName 'http.server') {
            $serverArgs = @('python3', '-m', 'http.server', "$Port", '--bind', $Bind)
            $serverName = "Python 3 ($(Get-ToolVersion -Exe 'python3' -PrefixArgs @()))"
        }
    }
}

# 2. py -3 -m http.server
if (-not $serverArgs) {
    $cmd = Get-Command py -ErrorAction SilentlyContinue
    if ($cmd) {
        if (Test-PythonModule -Exe 'py' -PrefixArgs @('-3') -ModuleName 'http.server') {
            $serverArgs = @('py', '-3', '-m', 'http.server', "$Port", '--bind', $Bind)
            $serverName = "Python 3 via py launcher ($(Get-ToolVersion -Exe 'py' -PrefixArgs @('-3')))"
        }
    }
}

# 3. python -m http.server / SimpleHTTPServer
if (-not $serverArgs) {
    $cmd = Get-Command python -ErrorAction SilentlyContinue
    if ($cmd -and -not (Test-IsStoreStub $cmd.Source)) {
        if (Test-PythonModule -Exe 'python' -PrefixArgs @() -ModuleName 'http.server') {
            $serverArgs = @('python', '-m', 'http.server', "$Port", '--bind', $Bind)
            $serverName = "Python ($(Get-ToolVersion -Exe 'python' -PrefixArgs @()))"
        } elseif (Test-PythonModule -Exe 'python' -PrefixArgs @() -ModuleName 'SimpleHTTPServer') {
            $serverArgs = @('python', '-m', 'SimpleHTTPServer', "$Port")
            $serverName = "Python 2 ($(Get-ToolVersion -Exe 'python' -PrefixArgs @()))"
        }
    }
}

# 4. node launch-node.js
if (-not $serverArgs) {
    $cmd = Get-Command node -ErrorAction SilentlyContinue
    if ($cmd) {
        $nodeScript = Join-Path $ScriptDir 'launch-node.js'
        if (Test-Path -LiteralPath $nodeScript) {
            $serverArgs = @('node', $nodeScript, "$Port", $Bind, $ScriptDir)
            $serverName = "Node.js ($(Get-ToolVersion -Exe 'node' -PrefixArgs @()))"
        }
    }
}

# -----------------------------------------------------------------
# Bail out with install hints if nothing works
# -----------------------------------------------------------------

if (-not $serverArgs) {
    Write-Host ""
    Write-Host "BuddyChat XP launcher" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Neither Python 3, Python 2, nor Node.js was found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Install one of them and try again."
    Write-Host ""
    Write-Host "  Python 3 - https://www.python.org/downloads/windows/" -ForegroundColor Yellow
    Write-Host "             Tick 'Add Python to PATH' during setup."
    Write-Host "             Or:  winget install Python.Python.3.12"
    Write-Host ""
    Write-Host "  Node.js  - https://nodejs.org/en/download/" -ForegroundColor Yellow
    Write-Host "             Or:  winget install OpenJS.NodeJS.LTS"
    Write-Host ""
    exit 1
}

# -----------------------------------------------------------------
# Welcome to Setup
# -----------------------------------------------------------------

if (-not $Version) {
    try { Clear-Host } catch { }

    Write-Host ""
    Write-Host "  ============================================================" -ForegroundColor White
    Write-Host "    BuddyChat XP  v0.1.2" -ForegroundColor White
    Write-Host "    AeteX Interactive   Est. 2026   -   https://aetex.is-a.dev" -ForegroundColor Gray
    Write-Host "  ============================================================" -ForegroundColor White
    Write-Host ""
    Write-Host "    Thank you for choosing BuddyChat XP."
    Write-Host ""
    Write-Host "    Setup will start a small local web server and open the"
    Write-Host "    version you select below."
    Write-Host ""
    Write-Host "       [1]  Automatic .......... Recommended."
    Write-Host "                                 Let your browser pick."
    Write-Host ""
    Write-Host "       [2]  Modern ............. index.html"
    Write-Host "                                 Newest browsers. Streaming."
    Write-Host ""
    Write-Host "       [3]  Legacy ............. legacy.html"
    Write-Host "                                 Firefox 3.5+, Chrome 4+,"
    Write-Host "                                 MyPal, IE10 / IE11."
    Write-Host ""
    Write-Host "       [4]  Internet Explorer .. ie.html"
    Write-Host "                                 IE8 / IE9. Replies appear"
    Write-Host "                                 all at once."
    Write-Host ""
    Write-Host "       [Q]  Quit"
    Write-Host ""

    $choice = Read-Host "    Enter your choice [1]"
    if ([string]::IsNullOrWhiteSpace($choice)) { $choice = '1' }

    switch ($choice.Trim().ToLower()) {
        '1' { $Version = 'auto' }
        '2' { $Version = 'modern' }
        '3' { $Version = 'legacy' }
        '4' { $Version = 'ie' }
        'q' { Write-Host ""; Write-Host "    Setup cancelled. No files were changed."; Write-Host ""; exit 0 }
        'quit'  { Write-Host ""; Write-Host "    Setup cancelled. No files were changed."; Write-Host ""; exit 0 }
        'exit'  { Write-Host ""; Write-Host "    Setup cancelled. No files were changed."; Write-Host ""; exit 0 }
        default {
            Write-Host ""
            Write-Host "    Unrecognized choice. Using Automatic."
            $Version = 'auto'
        }
    }
}

# -----------------------------------------------------------------
# Map version to a path
# -----------------------------------------------------------------

$urlPath = '/'
$versionLabel = 'Automatic'

switch ($Version.Trim().ToLower()) {
    'auto'   { $urlPath = '/';            $versionLabel = 'Automatic' }
    'modern' { $urlPath = '/index.html';  $versionLabel = 'Modern (index.html)' }
    'legacy' { $urlPath = '/legacy.html'; $versionLabel = 'Legacy (legacy.html)' }
    'ie'     { $urlPath = '/ie.html';     $versionLabel = 'Internet Explorer (ie.html)' }
    default  { $urlPath = '/';            $versionLabel = 'Automatic'; $Version = 'auto' }
}

$url = "http://${Bind}:${Port}${urlPath}"

# -----------------------------------------------------------------
# Final banner
# -----------------------------------------------------------------

$winVer = [System.Environment]::OSVersion.Version

Write-Host ""
Write-Host "  ============================================================" -ForegroundColor White
Write-Host "    BuddyChat XP  v0.1.2  -  starting up" -ForegroundColor White
Write-Host "  ============================================================" -ForegroundColor White
Write-Host ""
Write-Host "    OS:        Windows $winVer"
Write-Host "    Server:    $serverName"
Write-Host "    Version:   $versionLabel"
Write-Host "    URL:       $url"
Write-Host ""
Write-Host "    Press Ctrl+C to stop the server and exit."
Write-Host ""

# -----------------------------------------------------------------
# Optionally open the browser in a detached process
# -----------------------------------------------------------------

if (-not $NoBrowser) {
    $openCmd = "Start-Sleep -Milliseconds 1500; Start-Process '$url'"
    try {
        Start-Process -FilePath 'powershell.exe' `
            -ArgumentList @('-NoProfile', '-WindowStyle', 'Hidden', '-Command', $openCmd) `
            -WindowStyle Hidden | Out-Null
    } catch {
        # Not fatal - just skip the auto-open.
    }
}

# -----------------------------------------------------------------
# Run the server in the foreground so Ctrl+C reaches it
# -----------------------------------------------------------------

$exe  = $serverArgs[0]
$rest = @()
if ($serverArgs.Length -gt 1) {
    $rest = $serverArgs[1..($serverArgs.Length - 1)]
}

& $exe @rest