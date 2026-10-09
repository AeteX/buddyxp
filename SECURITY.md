# Security Policy

## Scope

BuddyChat XP is a **client-side only** project. It is a set of static HTML,
CSS, and JavaScript files plus three launcher scripts. There is no AeteX-run
backend, no user accounts, no telemetry, and no server infrastructure of ours
that could be compromised.

The chat requests go directly from your browser to **your own** llama.cpp
server. AeteX never sees them.

This narrows the security surface considerably. The categories below describe
what is in scope and what is out.

## Supported Versions

| Version | Supported |
|---------|-----------|
|  0.1.3  | Yes       |
|  0.1.2  | No        |
|  0.1.1  | No        |
|  0.1.0  | No        |

## In scope

Vulnerabilities in the following areas are worth reporting:

- **XSS in message rendering.** BuddyChat XP inserts model output into the
  page. All message bodies and metadata are HTML-escaped before display, and
  the emoji filter operates on already-escaped text. If you find a way to
  inject arbitrary HTML or script through a crafted model response, message
  body, or settings value, that is a real bug.
- **Escaping bypasses.** Anything that reaches `innerHTML` without going
  through `XP.esc()` or `XP.nl2br(XP.esc(...))` first.
- **The `text/plain` CORS behaviour being abusable.** The app deliberately
  sends `Content-Type: text/plain` on the POST to avoid a CORS preflight.
  If you find a way for a hostile third-party page to leverage this to
  silently talk to a user's local llama.cpp server, that is worth a report.
- **Path traversal in `launch-node.js`.** The static file server has a guard
  that rejects any request that would resolve outside the served directory.
  If you find a way past it, report it.
- **Open redirect or SSRF in the redirect chain.** The HTML files redirect
  between `index.html`, `legacy.html`, and `ie.html` based on browser feature
  detection. If a crafted URL could cause a redirect to an attacker-controlled
  origin, report it.
- **Command injection in the launcher scripts.** The `.sh`, `.ps1`, and
  `.bat` launchers take a port, host, and version as input. If any of those
  can be used to execute arbitrary commands, report it.
- **Any way a malicious clone could trick users.** For example, a modified
  copy of the files that renders the real AeteX branding but steals
  credentials or hijacks the connection. If there is a technical mitigation
  we can add, we will.

## Out of scope

The following are not considered vulnerabilities in this project:

- **"It talks to my local llama.cpp server."** That is the entire purpose
  of the app. Pointing it at a server you control is the intended use.
- **"It uses `localStorage`."** Settings persistence is a designed feature.
- **"Internet Explorer 8 has security flaws."** Yes, IE8 is an insecure
  browser. We support it for the nostalgia, not for its security model.
  If you run `ie.html` in IE8, you are accepting the security posture of
  running IE8.
- **"The model said something offensive."** Prompt engineering is not a
  security boundary. The default system prompt asks the model to stay
  friendly and PG, but it is a language model, not a filter.
- **"The launcher opens a port on `0.0.0.0`."** That is opt-in via the
  `HOST` environment variable or the `-Bind` parameter. The default is
  `127.0.0.1` (localhost only).
- **Denial of service against your own llama.cpp server.** Your server,
  your responsibility.

## Reporting a vulnerability

Please **do not open a public GitHub issue** for an active vulnerability.
Instead, email:

**aetexhq@proton.me**

Use the subject line `[SECURITY] BuddyChat XP`. Include:

- A description of the issue
- Steps to reproduce, with the smallest possible test case
- Which pipeline it affects (`index.html`, `legacy.html`, or `ie.html`)
- Which browser(s) you tested in
- Whether you would like to be credited in the fix

## What to expect

This is a small project maintained by one person. Response times are
best-effort, not contractual:

- **Acknowledgment:** within 7 days, usually sooner
- **Initial assessment:** within 14 days
- **Fix for confirmed issues:** as soon as reasonably possible, usually
  within 30 days for anything that impacts users

If the issue is in scope and reproducible, we will:

1. Confirm the vulnerability by email
2. Work on a fix without disclosing details publicly
3. Release the fix in a patch version
4. Publish a short security note in the release
5. Credit you by name, handle, or anonymously — your choice

## A note on trust

BuddyChat XP is MIT licensed and has no dependencies. You can read the whole
thing in an afternoon. If you are security-conscious, you should:

- **Read the source** before you run it. It is small.
- **Run it on localhost**, not on a public host. The launchers bind to
  `127.0.0.1` by default for exactly this reason.
- **Do not point it at a shared llama.cpp server** if the contents of your
  conversations matter to you. The app does not authenticate to the server;
  it relies on the server being yours.
- **Check the URL** before trusting a copy. The official copy lives at
  [aetex.is-a.dev/buddyxp](https://aetex.is-a.dev/buddyxp) and the canonical
  repository is [github.com/Aetex/buddyxp](https://github.com/Aetex/buddyxp).

Thank you for taking the time to look.