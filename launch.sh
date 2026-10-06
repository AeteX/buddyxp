#!/usr/bin/env bash
#
# BuddyChat XP launcher for Linux and macOS.
#
# Detects the operating system (and, on Linux, the distribution), then
# starts a small static file server using the first of these that works:
#
#   1. python3 -m http.server
#   2. python  -m http.server        (Python 3 under the name "python")
#   3. python  -m SimpleHTTPServer   (Python 2)
#   4. node launch-node.js
#
# If none are available, it prints installation hints tailored to the
# detected distro (apt, dnf, pacman, zypper, apk, xbps, emerge, brew ...).
#
# Usage:
#   ./launch.sh                            # interactive menu
#   VERSION=modern ./launch.sh             # skip the menu
#   PORT=9000 ./launch.sh                  # custom port
#   HOST=0.0.0.0 ./launch.sh               # expose on the LAN
#   NO_BROWSER=1 ./launch.sh               # don't open the browser
#
# VERSION can be: auto, modern, legacy, ie
#

set -e

PORT="${PORT:-8000}"
HOST="${HOST:-127.0.0.1}"
NO_BROWSER="${NO_BROWSER:-0}"
VERSION="${VERSION:-}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ---------------------------------------------------------------
# Detect OS
# ---------------------------------------------------------------

UNAME_S="$(uname -s 2>/dev/null || echo unknown)"
case "$UNAME_S" in
  Darwin*)  OS_NAME="macOS" ;;
  Linux*)   OS_NAME="Linux" ;;
  FreeBSD*) OS_NAME="FreeBSD" ;;
  *)        OS_NAME="$UNAME_S" ;;
esac

# ---------------------------------------------------------------
# Detect Linux distribution
# ---------------------------------------------------------------

DISTRO_ID=""
DISTRO_PRETTY=""
DISTRO_FAMILY=""

detect_distro() {
  [ "$OS_NAME" = "Linux" ] || return 0

  if [ -r /etc/os-release ]; then
    . /etc/os-release
    DISTRO_ID="${ID:-}"
    DISTRO_PRETTY="${PRETTY_NAME:-${NAME:-$ID}}"
  elif [ -r /etc/lsb-release ]; then
    . /etc/lsb-release
    DISTRO_ID="${DISTRIB_ID:-}"
    DISTRO_PRETTY="${DISTRIB_DESCRIPTION:-$DISTRIB_ID}"
  elif [ -r /etc/debian_version ]; then
    DISTRO_ID="debian"
    DISTRO_PRETTY="Debian $(cat /etc/debian_version)"
  elif [ -r /etc/redhat-release ]; then
    DISTRO_ID="rhel"
    DISTRO_PRETTY="$(cat /etc/redhat-release)"
  elif [ -r /etc/arch-release ]; then
    DISTRO_ID="arch"
    DISTRO_PRETTY="Arch Linux"
  elif [ -r /etc/alpine-release ]; then
    DISTRO_ID="alpine"
    DISTRO_PRETTY="Alpine $(cat /etc/alpine-release)"
  elif [ -r /etc/gentoo-release ]; then
    DISTRO_ID="gentoo"
    DISTRO_PRETTY="$(cat /etc/gentoo-release)"
  else
    DISTRO_ID="unknown"
    DISTRO_PRETTY="unknown Linux distribution"
  fi

  case "$DISTRO_ID" in
    debian|ubuntu|linuxmint|pop|elementary|kali|raspbian|mx|deepin|zorin|neon|parrot)
      DISTRO_FAMILY="debian" ;;
    rhel|fedora|centos|rocky|almalinux|ol|amzn|scientific|oracle|virtuozzo)
      DISTRO_FAMILY="rhel" ;;
    arch|manjaro|endeavouros|garuda|artix|cachyos)
      DISTRO_FAMILY="arch" ;;
    opensuse*|sles|suse|tumbleweed|leap|sled)
      DISTRO_FAMILY="suse" ;;
    alpine)
      DISTRO_FAMILY="alpine" ;;
    void)
      DISTRO_FAMILY="void" ;;
    gentoo|funtoo)
      DISTRO_FAMILY="gentoo" ;;
    nixos)
      DISTRO_FAMILY="nix" ;;
    *)
      DISTRO_FAMILY="$DISTRO_ID" ;;
  esac
}

detect_distro

# ---------------------------------------------------------------
# Pick a server
# ---------------------------------------------------------------

SERVER_ARGS=()
SERVER_NAME=""

# 0. our custom server (preferred - explicit MIME types)
if [ ${#SERVER_ARGS[@]} -eq 0 ] && command -v python3 >/dev/null 2>&1; then
  if [ -f "$SCRIPT_DIR/launch-python.py" ]; then
    SERVER_ARGS=(python3 "$SCRIPT_DIR/launch-python.py" "$PORT" "$HOST" "$SCRIPT_DIR")
    SERVER_NAME="Python 3 (launch-python.py)"
  fi
fi

if [ ${#SERVER_ARGS[@]} -eq 0 ] && command -v python >/dev/null 2>&1; then
  if [ -f "$SCRIPT_DIR/launch-python.py" ]; then
    SERVER_ARGS=(python "$SCRIPT_DIR/launch-python.py" "$PORT" "$HOST" "$SCRIPT_DIR")
    SERVER_NAME="Python (launch-python.py)"
  fi
fi

# 1. python3 -m http.server
if [ ${#SERVER_ARGS[@]} -eq 0 ] && command -v python3 >/dev/null 2>&1; then
  if python3 -c 'import http.server' >/dev/null 2>&1; then
    SERVER_ARGS=(python3 -m http.server "$PORT" --bind "$HOST")
    SERVER_NAME="Python 3 ($(python3 --version 2>&1))"
  fi
fi

# 2. python -m http.server (Python 3)
if [ ${#SERVER_ARGS[@]} -eq 0 ] && command -v python >/dev/null 2>&1; then
  if python -c 'import http.server' >/dev/null 2>&1; then
    SERVER_ARGS=(python -m http.server "$PORT" --bind "$HOST")
    SERVER_NAME="Python ($(python --version 2>&1))"
  fi
fi

# 3. python -m SimpleHTTPServer (Python 2)
if [ ${#SERVER_ARGS[@]} -eq 0 ] && command -v python >/dev/null 2>&1; then
  if python -c 'import SimpleHTTPServer' >/dev/null 2>&1; then
    SERVER_ARGS=(python -m SimpleHTTPServer "$PORT")
    SERVER_NAME="Python 2 ($(python --version 2>&1))"
  fi
fi

# 4. node launch-node.js
if [ ${#SERVER_ARGS[@]} -eq 0 ] && command -v node >/dev/null 2>&1; then
  if [ -f "$SCRIPT_DIR/launch-node.js" ]; then
    SERVER_ARGS=(node "$SCRIPT_DIR/launch-node.js" "$PORT" "$HOST" "$SCRIPT_DIR")
    SERVER_NAME="Node.js ($(node --version 2>&1))"
  fi
fi

# ---------------------------------------------------------------
# Bail out with install hints if nothing works
# ---------------------------------------------------------------

if [ ${#SERVER_ARGS[@]} -eq 0 ]; then
  {
    echo "BuddyChat XP launcher"
    echo ""
    echo "Detected OS:     $OS_NAME"
    if [ "$OS_NAME" = "Linux" ]; then
      echo "Detected distro: $DISTRO_PRETTY"
    fi
    echo ""
    echo "Neither Python 3, Python 2, nor Node.js was found."
    echo "Install one of them and try again."
    echo ""
  } >&2

  case "$OS_NAME" in
    macOS)
      {
        echo "Install hints for macOS:"
        echo "  Python 3 ships with Xcode Command Line Tools:"
        echo "      xcode-select --install"
        echo "  Or use Homebrew:"
        echo "      brew install python3"
        echo "      # or"
        echo "      brew install node"
      } >&2 ;;
    Linux)
      case "$DISTRO_FAMILY" in
        debian)
          {
            echo "Install hints for Debian / Ubuntu family:"
            echo "  sudo apt update && sudo apt install python3"
            echo "  or: sudo apt install nodejs"
          } >&2 ;;
        rhel)
          {
            echo "Install hints for Fedora / RHEL family:"
            echo "  sudo dnf install python3"
            echo "  or: sudo dnf install nodejs"
          } >&2 ;;
        arch)
          {
            echo "Install hints for Arch family:"
            echo "  sudo pacman -S python"
            echo "  or: sudo pacman -S nodejs npm"
          } >&2 ;;
        suse)
          {
            echo "Install hints for openSUSE family:"
            echo "  sudo zypper install python3"
            echo "  or: sudo zypper install nodejs"
          } >&2 ;;
        alpine)
          {
            echo "Install hints for Alpine:"
            echo "  sudo apk add python3"
            echo "  or: sudo apk add nodejs"
          } >&2 ;;
        void)
          {
            echo "Install hints for Void Linux:"
            echo "  sudo xbps-install -S python3"
            echo "  or: sudo xbps-install -S nodejs"
          } >&2 ;;
        gentoo)
          {
            echo "Install hints for Gentoo:"
            echo "  sudo emerge --ask dev-lang/python"
            echo "  or: sudo emerge --ask net-libs/nodejs"
          } >&2 ;;
        nix)
          {
            echo "Install hints for NixOS:"
            echo "  nix-env -iA nixos.python3"
            echo "  or: nix-env -iA nixos.nodejs"
          } >&2 ;;
        *)
          echo "Install Python 3 or Node.js with your package manager." >&2 ;;
      esac ;;
    FreeBSD)
      {
        echo "Install hints for FreeBSD:"
        echo "  sudo pkg install python3"
        echo "  or: sudo pkg install node"
      } >&2 ;;
    *)
      echo "Install Python 3 or Node.js." >&2 ;;
  esac

  exit 1
fi

# ---------------------------------------------------------------
# Welcome to Setup
# ---------------------------------------------------------------

if [ -z "$VERSION" ]; then
  clear 2>/dev/null || true

  echo ""
  echo "  ============================================================"
  echo "    BuddyChat XP  v0.1.2"
  echo "    AeteX Interactive   Est. 2026   -   https://aetex.is-a.dev"
  echo "  ============================================================"
  echo ""
  echo "    Thank you for choosing BuddyChat XP."
  echo ""
  echo "    Setup will start a small local web server and open the"
  echo "    version you select below."
  echo ""
  echo "       [1]  Automatic .......... Recommended."
  echo "                                 Let your browser pick."
  echo ""
  echo "       [2]  Modern ............. index.html"
  echo "                                 Newest browsers. Streaming."
  echo ""
  echo "       [3]  Legacy ............. legacy.html"
  echo "                                 Firefox 3.5+, Chrome 4+,"
  echo "                                 MyPal, IE10 / IE11."
  echo ""
  echo "       [4]  Internet Explorer .. ie.html"
  echo "                                 IE8 / IE9. Replies appear"
  echo "                                 all at once."
  echo ""
  echo "       [Q]  Quit"
  echo ""
  printf "    Enter your choice [1]: "

  CHOICE=""
  read -r CHOICE || true
  CHOICE="${CHOICE:-1}"

  case "$CHOICE" in
    1) VERSION="auto"   ;;
    2) VERSION="modern" ;;
    3) VERSION="legacy" ;;
    4) VERSION="ie"     ;;
    q|Q|quit|exit)
      echo ""
      echo "    Setup cancelled. No files were changed."
      echo ""
      exit 0 ;;
    *)
      echo ""
      echo "    Unrecognized choice. Using Automatic."
      VERSION="auto" ;;
  esac
fi

# ---------------------------------------------------------------
# Map version to a path
# ---------------------------------------------------------------

case "$VERSION" in
  auto|"")  URL_PATH="/"            ; VERSION_LABEL="Automatic"            ;;
  modern)   URL_PATH="/index.html"  ; VERSION_LABEL="Modern (index.html)"  ;;
  legacy)   URL_PATH="/legacy.html" ; VERSION_LABEL="Legacy (legacy.html)" ;;
  ie)       URL_PATH="/ie.html"     ; VERSION_LABEL="Internet Explorer (ie.html)" ;;
  *)
    URL_PATH="/"
    VERSION_LABEL="Automatic"
    VERSION="auto" ;;
esac

URL="http://${HOST}:${PORT}${URL_PATH}"

# ---------------------------------------------------------------
# Final banner
# ---------------------------------------------------------------

echo ""
echo "  ============================================================"
echo "    BuddyChat XP  v0.1.2  -  starting up"
echo "  ============================================================"
echo ""
echo "    OS:        $OS_NAME"
if [ "$OS_NAME" = "Linux" ]; then
echo "    Distro:    $DISTRO_PRETTY"
fi
echo "    Server:    $SERVER_NAME"
echo "    Version:   $VERSION_LABEL"
echo "    Website:   https://aetex.is-a.dev"
echo "    URL:       $URL"
echo ""
echo "    Press Ctrl+C to stop the server and exit."
echo ""

# ---------------------------------------------------------------
# Optionally open the browser
# ---------------------------------------------------------------

if [ "$NO_BROWSER" != "1" ]; then
  (
    sleep 1
    case "$OS_NAME" in
      macOS)
        open "$URL" >/dev/null 2>&1 || true
        ;;
      Linux)
        if command -v xdg-open >/dev/null 2>&1; then
          xdg-open "$URL" >/dev/null 2>&1 || true
        elif command -v gio >/dev/null 2>&1; then
          gio open "$URL" >/dev/null 2>&1 || true
        elif command -v sensible-browser >/dev/null 2>&1; then
          sensible-browser "$URL" >/dev/null 2>&1 || true
        elif command -v x-www-browser >/dev/null 2>&1; then
          x-www-browser "$URL" >/dev/null 2>&1 || true
        fi
        ;;
    esac
  ) &
fi

# ---------------------------------------------------------------
# Run in the foreground so Ctrl+C stops the server
# ---------------------------------------------------------------

exec "${SERVER_ARGS[@]}"