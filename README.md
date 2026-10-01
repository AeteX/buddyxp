# BuddyChat XP

A Windows XP-era chat front end for [llama.cpp](https://github.com/ggml-org/llama.cpp),
made by [AeteX Interactive](https://aetex.is-a.dev).

Three browser pipelines auto-detect your environment and route you to the one
that works. The default persona is **Buddy**, a friendly 2007-era IM buddy who
avoids emoji and talks like it is still AIM and MSN Messenger.

<p align="center">
  <img src="docs/screenshot-xp.png" alt="BuddyChat XP running in Internet Explorer on Windows XP" width="48%">
  &nbsp;
  <img src="docs/screenshot-modern.png" alt="BuddyChat XP running in a modern browser" width="48%">
</p>

<p align="center">
  <em>Left: the <code>ie.html</code> pipeline in IE8 on Windows XP. Right: the <code>index.html</code> pipeline in a modern browser.</em>
</p>

[**Live landing page**](https://aetex.is-a.dev/buddyxp) &nbsp;&bull;&nbsp;
[**Report a bug**](https://github.com/Aetex/buddyxp/issues) &nbsp;&bull;&nbsp;
[**MIT License**](LICENSE)

---

## Quick start

Three commands get you from nothing to chatting. Each is copy-paste ready.

### Step 1 — Install llama.cpp

**Windows (PowerShell):**

```powershell
irm https://llama.app/install.ps1 | iex
```

**macOS / Linux:**

```sh
curl -LsSf https://llama.app/install.sh | sh
```

This installs the `llama` command. If you already have `llama-server` or a
built copy of llama.cpp, you can skip this step — anything that speaks the
OpenAI-compatible API works.

### Step 2 — Download and run a model

```sh
llama serve -hf prism-ml/Bonsai-8B-gguf:Q1_0
```

The `-hf` flag pulls the model straight from Hugging Face on first run and
caches it locally afterwards. The `:Q1_0` suffix selects the 1-bit
quantization this model is published in — without it, `llama serve` may not
know which file to fetch.

Bonsai-8B is an 8-billion-parameter 1-bit model that fits in about 1.15 GB of
memory and runs on almost any device with a GPU. That makes it an
unusually good match for this project — you can run it on the same ancient
hardware you'd use to view the XP-era UI.

The server listens on `http://localhost:8080` by default — the same URL
BuddyChat XP expects.

To use a different model, swap in any Hugging Face GGUF repo and its
quantization tag:

```sh
llama serve -hf unsloth/Qwen3-4B-GGUF:Q4_0
llama serve -hf bartowski/Llama-3.2-3B-Instruct-GGUF:Q4_K_M
```

Verify the server is up by opening `http://localhost:8080/v1/models` in a
browser — you should see a JSON response listing your model.

### Step 3 — Install BuddyChat XP

**Windows (PowerShell):**

```powershell
irm https://aetex.is-a.dev/buddyxp/install.ps1 | iex
```

**macOS / Linux:**

```sh
curl -fsSL https://aetex.is-a.dev/buddyxp/install.sh | sh
```

The installer downloads a tagged release, extracts it to a per-user location,
and creates a `buddyxp` command that wraps the platform launcher. No admin
rights needed. No build step.

### Step 4 — Run it

Open a new terminal so your PATH updates take effect, then:

```sh
buddyxp
```

The launcher shows a Windows XP-style setup prompt asking which browser
pipeline to use, then starts a local server and opens your browser.

---

## What the BuddyChat XP installer needs

One of the following must be on your system for the launcher to serve files:

| Runtime | Notes |
|---|---|
| Python 3 | Any version from 3.6 up. Recommended. |
| Python 2 | Python 2.7 works, but is EOL. Only needed for old systems. |
| Node.js | Any LTS. Used as a fallback when Python isn't installed. |

If none are found, the installer prints install hints and lets you continue
anyway. You can install the runtime later and `buddyxp` will pick it up.

### Installer requirements by platform

| Platform | Installer | Requirement |
|---|---|---|
| Windows 10 / 11 | `install.ps1` | PowerShell 5.0+ (included) |
| Windows 8.1 / 7 SP1 | `install.ps1` | PowerShell updated to 5.0+ |
| Windows XP SP3 | — | See the Windows XP section below |
| macOS | `install.sh` | `curl` (included), any shell |
| Linux | `install.sh` | `curl` or `wget`, any POSIX shell |

### Where things get installed

| Platform | Install location | Shim |
|---|---|---|
| Windows | `%LOCALAPPDATA%\BuddyXP` | `%LOCALAPPDATA%\BuddyXP\bin\buddyxp.cmd` |
| macOS / Linux | `${XDG_DATA_HOME:-$HOME/.local/share}/buddyxp` | `$HOME/.local/bin/buddyxp` |

### Updating

Re-run the installer. It overwrites the install directory and leaves your
settings untouched — those live in your browser's `localStorage`, not in the
install folder.

### Uninstalling

**Windows:**

```powershell
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\BuddyXP"
# Then remove "$env:LOCALAPPDATA\BuddyXP\bin" from your user PATH.
```

**macOS / Linux:**

```sh
rm -rf "${XDG_DATA_HOME:-$HOME/.local/share}/buddyxp"
rm -f  "$HOME/.local/bin/buddyxp"
# Then remove the "buddyxp-PATH" block from your shell rc file
# (~/.bashrc, ~/.zshrc, or ~/.profile).
```

---

## Windows XP SP3

Windows XP doesn't have PowerShell 5.0 or modern `curl`, so the one-line
installers don't apply. XP users should:

1. [Download the repo as a ZIP](https://github.com/Aetex/buddyxp/archive/refs/heads/main.zip)
   and extract it.
2. Install **Python 2.7.18** — the last Python release that supports XP SP3.
   [python.org/download/releases/2.7.18](https://www.python.org/download/releases/2.7.18/).
   During setup, tick **Add python.exe to Path**.
3. Double-click `launch-xp.bat`.

`launch-xp.bat` uses only commands that ship with XP's `cmd.exe` — no
PowerShell, no `where`, no `timeout`. It searches the PATH and the usual
`C:\PythonXX` locations for `python.exe`.

Bonsai-8B is unusually friendly to old hardware. At 1.15 GB for the model
itself, it runs on machines that would struggle with almost any other 8B
model. If you're on something older still, try a smaller GGUF like Bonsai-4B, Bonsai-1.7B or any other GGUF from Hugging Face.

One thing to know: Python 2.7's built-in `SimpleHTTPServer` always binds to
`0.0.0.0`, not localhost. While the launcher is running, other machines on
your LAN can reach the page. Stop the server with `Ctrl+C` when you're done.

---

## Manual install

If you'd rather install by hand, or you're on an unsupported platform:

```bash
git clone https://github.com/Aetex/buddyxp.git
cd buddyxp
```

Then run the launcher for your OS:

| Platform | Command |
|---|---|
| Windows Vista+ | `.\launch.ps1` or double-click `launch.bat` |
| Windows XP SP3 | `launch-xp.bat` |
| Linux / macOS | `chmod +x launch.sh && ./launch.sh` |

The launchers pick the best available static server (Python 3 → Python 2 →
Node.js) and show a Windows XP-style setup prompt asking which version to
launch. If nothing is installed, they print install hints tailored to your OS
and, on Linux, your distribution's package manager.

---

## Using a different model server

BuddyChat XP talks to anything that exposes the OpenAI chat completions
endpoint. The default setup uses `llama serve`, but you can point it at
whatever you like by changing the **Server URL** in the sidebar.

Common alternatives:

| Server | Default URL | Start command |
|---|---|---|
| llama.cpp | `http://localhost:8080` | `llama serve -hf prism-ml/Bonsai-8B-gguf:Q1_0` |
| Ollama | `http://localhost:11434` | `ollama serve` |
| LM Studio | `http://localhost:1234` | GUI — enable the local server |
| text-generation-webui | `http://localhost:5000` | `python server.py --api` |

For Ollama, use the URL `http://localhost:11434/v1` since Ollama nests its
OpenAI-compatible endpoints under `/v1`.

---

## Recommended generation settings

Bonsai-8B's own model card suggests the following, which you can enter into
the sidebar's **Generation** pane:

| Setting | Suggested value |
|---|---|
| Temperature | `0.5` (range `0.5` – `0.7`) |
| Top-p | `0.85` (range `0.85` – `0.95`) |
| Top-k | `20` (range `20` – `40`) |

BuddyChat XP only exposes temperature directly in the UI, so `0.5` is the
easy value to set there. Top-p and top-k aren't sent by the client, so the
server's defaults apply unless you change them in your `llama serve` command.

---

## Repository layout

| File | Purpose |
|---|---|
| `index.html` | Modern browsers. `fetch` + `ReadableStream` + `AbortController`. Streams replies. Auto-redirects if the modern pipeline is unavailable. |
| `legacy.html` | Firefox 3.5+, Chrome 4+, Safari 4+, MyPal/Goanna, IE10/11. `XMLHttpRequest` with `Content-Type: text/plain` (no CORS preflight). Streams via `readyState === 3`. Auto-redirects IE8/9 to `ie.html`. |
| `ie.html` | IE8 / IE9. Uses `XDomainRequest` for cross-origin POST. No streaming — the reply appears all at once. |
| `xp.css` | Shared XP Luna theme. IE8-safe: no flexbox, no grid, no CSS custom properties. |
| `xp-common.js` | Shared helpers, emoji filter, settings persistence, About dialog, menu handlers. ES3-only syntax so IE8 can parse it. |
| `launch-node.js` | Tiny static file server used as the Node fallback. Zero npm dependencies. |
| `launch-python.py` | Static file server with explicit MIME types. Fixes the "webpage cannot be displayed" bug on XP machines where the `.html` registry entry is broken. |
| `launch.sh` | Linux / macOS launcher. Detects OS and Linux distro, picks Python 3 → Python 2 → Node. |
| `launch.ps1` | Windows Vista+ launcher. Detects Python 3, Python 2, or Node, including the `py` launcher and MS Store stubs. |
| `launch-xp.bat` | Windows XP SP3 launcher. Uses only commands that ship with XP's `cmd.exe`. |
| `launch.bat` | Thin wrapper that runs `launch.ps1` with `-ExecutionPolicy Bypass`. |
| `install.sh` | macOS / Linux one-line installer. |
| `install.ps1` | Windows one-line installer. |

The three HTML files share the same `<body>` markup and the same CSS, so
changing the layout only requires editing one place.

---

## How it works

### Three browser pipelines

Each HTML file detects what the browser supports and hands off to the next
one down if it can't do the job.

| Browser opens | `index.html` | `legacy.html` | `ie.html` |
|---|---|---|---|
| Modern (fetch) | runs | runs | redirects → `index.html` |
| MyPal 29.3, FF 3.5+, Chrome 4+ | runs | runs | redirects → `index.html` |
| IE10 / IE11 | runs | runs | redirects → `index.html` |
| IE8 / IE9 | redirects → `legacy.html` → `ie.html` | redirects → `ie.html` | runs |

### No CORS preflight

The chat request sends `Content-Type: text/plain;charset=UTF-8` instead of
`application/json`. This is a CORS-safelisted content type, so the browser
doesn't send an `OPTIONS` preflight first. llama.cpp parses the body as JSON
regardless of the declared Content-Type, so the payload arrives intact.

Without this, llama.cpp's server (which doesn't always answer preflights)
silently fails the POST and `XMLHttpRequest.status` comes back as `0`.

### Emoji filter

The default persona asks the model to stick to ASCII emoticons, but LLMs are
statistically biased toward modern emoji. A client-side filter runs on every
streamed chunk and:

- Converts common emoji to their old-school equivalents:
  😊 → `:)`, 😂 → `:D`, 😉 → `;)`, ❤️ → `<3`, 👍 → `(y)`, 🎉 → `\o/`
- Strips any remaining pictographs (astral emoji, variation selectors,
  zero-width joiners, BMP symbol blocks)
- Tidies up any double spaces left behind

Because it operates on the accumulated reply after every chunk, a surrogate
pair split across two chunks is still caught correctly.

### Settings persistence

Server URL, temperature, max tokens, and system prompt persist in
`localStorage` under the key `buddyChatXp.settings.v1`. To reset, clear
site data for the origin.

---

## Configuration

| Setting | Default | Notes |
|---|---|---|
| Server URL | `http://localhost:8080` | Point this at wherever `llama serve` is running |
| Temperature | `0.7` | Bonsai-8B suggests `0.5`; see the model card |
| Max tokens | `512` | Upper bound on reply length |
| System prompt | Buddy persona | Edit or clear in the sidebar |

---

## Testing tips

- **Real IE8** — spin up a Windows XP VM, drop the folder on a shared drive,
  run `launch-xp.bat`, and open the URL it prints. You'll see `ie.html` and
  replies that appear all at once.
- **Force legacy in a modern browser** — open `/legacy.html` directly, or
  pick option **3** from the setup prompt. You'll see streaming via
  `XMLHttpRequest`.
- **Force IE mode without a VM** — open IE11, press **F12**, set
  **Emulation → Document mode** to **8** or **9**, and reload. The redirect
  chain will take you to `ie.html`.
- **Test the installer on Linux** — a fresh `ubuntu:22.04` Docker container
  works. Run the one-liner, open a new shell, and type `buddyxp`.

---

## About AeteX Interactive

AeteX Interactive is a small open-source studio founded in 2025. We make
tools we want to use ourselves, ship them under permissive licenses, and
have a soft spot for the software aesthetics of the early 2000s.

- Website: [aetex.is-a.dev](https://aetex.is-a.dev)
- GitHub: [github.com/Aetex](https://github.com/Aetex)

---

## Contributing

Bug reports and pull requests are welcome. Before you open a PR:

- Test your change in all three pipelines if it touches shared code
  (`xp.css`, `xp-common.js`, or the shared body markup).
- Don't introduce a build step. The whole point is that you can open the
  files and read them.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

For security issues, please **do not** open a public issue. See
[SECURITY.md](SECURITY.md) for the disclosure process.

---

## Credits

- **Front end, XP theme, launchers:** AeteX Interactive
- **Model server:** [llama.cpp](https://github.com/ggml-org/llama.cpp) by
  Georgi Gerganov and contributors
- **Default model:** [prism-ml/Bonsai-8B-gguf](https://huggingface.co/prism-ml/Bonsai-8B-gguf)
  on Hugging Face — a 1-bit 8B model that fits in ~1.15 GB
- **Default persona:** Buddy, a fictional 2007-era IM buddy

---

## License

MIT © 2025 AeteX Interactive. See [LICENSE](LICENSE).