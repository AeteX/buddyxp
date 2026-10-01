<#
.SYNOPSIS
    BuddyChat XP one-line installer for Windows.

.DESCRIPTION
    Downloads the latest BuddyChat XP release, extracts it to a per-user
    location, and creates a `buddyxp` command that wraps the PowerShell
    launcher. Requires PowerShell 5.0 or newer (Windows 10, 11, or
    Windows 8.1 / 7 SP1 with PowerShell updated).

    Usage from PowerShell:
        irm https://raw.githubusercontent.com/Aetex/buddyxp/main/install.ps1 | iex

    Or download and run locally:
        .\install.ps1
#>

#Requires -Version 5.0

$ErrorActionPreference = 'Stop'

# TLS 1.2 for the GitHub download. Older Windows defaults to TLS 1.0,
# which GitHub has disabled.
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
} catch {
    # Old .NET, no TLS 1.2 support. Invoke-WebRequest will still try its best.
}

$Version    = '0.1.0'
$Repo       = 'Aetex/buddyxp'
$InstallDir = Join-Path $env:LOCALAPPDATA 'BuddyXP'
$BinDir     = Join-Path $InstallDir 'bin'
$ShimPath   = Join-Path $BinDir 'buddyxp.cmd'

Write-Host ""
Write-Host "  ============================================================" -ForegroundColor White
Write-Host "    BuddyChat XP Installer" -ForegroundColor White
Write-Host "    AeteX Interactive  -  Est. 2025" -ForegroundColor Gray
Write-Host "  ============================================================" -ForegroundColor White
Write-Host ""
Write-Host "    Install location:  $InstallDir"
Write-Host "    Version:           $Version"
Write-Host ""

# -----------------------------------------------------------------
# Check for a static-server runtime
# -----------------------------------------------------------------

function Test-Command($name) {
    $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

$hasPython = (Test-Command python) -or (Test-Command py) -or (Test-Command python3)
$hasNode   = Test-Command node

if (-not $hasPython -and -not $hasNode) {
    Write-Host "  WARNING: Neither Python nor Node.js was found." -ForegroundColor Yellow
    Write-Host "           BuddyChat XP needs one of them to serve files." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Install Python 3 first, then re-run this installer:" -ForegroundColor Yellow
    Write-Host "      winget install Python.Python.3.12" -ForegroundColor Yellow
    Write-Host "  Or continue and install Python later manually." -ForegroundColor Yellow
    Write-Host ""
    $answer = Read-Host "  Continue anyway? [y/N]"
    if ($answer -notmatch '^[Yy]') {
        Write-Host "  Install cancelled."
        exit 0
    }
    Write-Host ""
}

# -----------------------------------------------------------------
# Download and extract
# -----------------------------------------------------------------

$tmpDir = Join-Path $env:TEMP ("buddyxp-install-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmpDir | Out-Null

try {
    $url = "https://github.com/$Repo/archive/refs/tags/v$Version.zip"
    $zip = Join-Path $tmpDir "buddyxp.zip"

    Write-Host "  Downloading..." -NoNewline
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
        Write-Host " done."
    } catch {
        Write-Host " failed."
        Write-Host "  Could not download from $url" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

    Write-Host "  Extracting..." -NoNewline
    try {
        Expand-Archive -Path $zip -DestinationPath $tmpDir -Force
        Write-Host " done."
    } catch {
        Write-Host " failed."
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

    # GitHub archives wrap everything in a folder named "<repo>-<tag>".
    $extracted = Join-Path $tmpDir "buddyxp-$Version"
    if (-not (Test-Path $extracted)) {
        $found = Get-ChildItem -Path $tmpDir -Directory |
                 Where-Object { $_.Name -like 'buddyxp-*' } |
                 Select-Object -First 1
        if ($found) { $extracted = $found.FullName }
    }
    if (-not (Test-Path $extracted)) {
        Write-Host "  Could not find the extracted folder in $tmpDir" -ForegroundColor Red
        exit 1
    }

    # -----------------------------------------------------------------
    # Install
    # -----------------------------------------------------------------

    Write-Host "  Installing to $InstallDir..." -NoNewline

    # Preserve the bin dir across reinstalls so the shim path stays stable.
    $binBackup = $null
    if (Test-Path $BinDir) {
        $binBackup = Join-Path $tmpDir "bin-backup"
        Copy-Item -Path $BinDir -Destination $binBackup -Recurse -Force
    }

    if (Test-Path $InstallDir) {
        Remove-Item -Path $InstallDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $InstallDir | Out-Null
    Get-ChildItem -Path $extracted -Force | Copy-Item -Destination $InstallDir -Recurse -Force

    if ($binBackup) {
        New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
        Get-ChildItem -Path $binBackup -Force | Copy-Item -Destination $BinDir -Recurse -Force
    }
    Write-Host " done."

    # -----------------------------------------------------------------
    # Create the buddyxp shim
    # -----------------------------------------------------------------

    New-Item -ItemType Directory -Path $BinDir -Force | Out-Null

    $launchPath = Join-Path $InstallDir 'launch.ps1'
    $shimContent = @"
@echo off
REM BuddyChat XP shim - auto-generated by install.ps1
REM Do not edit this file. Re-run the installer to regenerate.
powershell -NoProfile -ExecutionPolicy Bypass -File "$launchPath" %*
"@
    Set-Content -Path $ShimPath -Value $shimContent -Encoding ASCII
    Write-Host "  Created $ShimPath"

    # -----------------------------------------------------------------
    # Add $BinDir to the user PATH
    # -----------------------------------------------------------------

    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if (-not $userPath) { $userPath = '' }

    $segments = $userPath -split ';' | Where-Object { $_ -ne '' }
    if ($segments -notcontains $BinDir) {
        $newPath = if ($userPath) { "$BinDir;$userPath" } else { $BinDir }
        [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
        Write-Host "  Added $BinDir to user PATH"
    } else {
        Write-Host "  $BinDir already in user PATH"
    }

    Write-Host ""
    Write-Host "  ============================================================" -ForegroundColor Green
    Write-Host "    Installation complete." -ForegroundColor Green
    Write-Host "  ============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Next steps:"
    Write-Host "    1. Close and reopen your terminal so PATH updates take effect."
    Write-Host "    2. Run:  buddyxp"
    Write-Host ""
    Write-Host "  To update later, re-run this installer."
    Write-Host ""
    Write-Host "  To uninstall:"
    Write-Host "    Remove-Item -Recurse -Force '$InstallDir'"
    Write-Host "    Then remove '$BinDir' from your user PATH."
    Write-Host ""

} finally {
    if (Test-Path $tmpDir) {
        Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}