# Changelog

All notable changes to BuddyChat XP are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [0.1.3] — 2026-10-09

### Added
- Full IM-era sound kit, synthesized on the fly with the Web Audio API.
  No external audio files, no licensing questions, no bandwidth cost
- MSN-style login chime (E5 → G5 → C6 rising arpeggio) that plays on
  first user interaction
- Nudge button in the toolbar that shakes the whole app window and plays
  a low-frequency buzzing rumble. Falls back to a JavaScript-driven shake
  loop on IE8/IE9 where CSS keyframe animations aren't supported
- Door open whoosh when starting or loading a conversation
- Door close whoosh when clearing or deleting a conversation
- Subtle rising two-tone blip when sending a message
- AIM-style two-tone ding (D5 → A5 → D6) when the first token arrives
- AIM-style typing indicator with an animated pencil bobbing next to
  "Buddy is typing" and three pulsing dots. Replaced by the streamed
  reply as soon as the first token arrives
- Sound On / Sound Off toggle in the toolbar. Setting persists across
  reloads in `localStorage` under `buddyChatXp.sound`
- Autoplay policy handling: the login chime is deferred until the first
  user gesture if the audio context is still suspended

### Changed
- Toolbar now has six buttons: New Chat, Nudge, Test Connection, About,
  Help, and Sound toggle
- Version bumped to 0.1.3 in the About dialog, status bar, sidebar
  product mark, and README

### Notes
- IE8 and IE9 silently skip all sounds since they lack the Web Audio API.
  The nudge visual, typing indicator, and sound toggle still function so
  the UI is consistent across pipelines.
- Every sound is generated from oscillators and white noise at the moment
  it plays. The whole audio engine is about 150 lines of JavaScript with
  no dependencies.

## [0.1.2] — 2026-10-06

### Added
- Provider dropdown in the Connection pane with support for hosted
  OpenAI-compatible APIs alongside the existing local llama.cpp server
- Eight built-in providers: Local (llama.cpp), OpenAI, OpenRouter, Groq,
  Together, DeepSeek, Mistral, and Custom
- Per-provider API key and model name storage — switching between
  providers preserves each one's configuration
- `XP.requestHeaders()` which sends `Content-Type: text/plain` for local
  requests (to avoid a CORS preflight) and `application/json` with an
  `Authorization: Bearer` header for online providers
- `XP.getEndpoint()`, `XP.isLocal()`, `XP.getProvider()`,
  `XP.populateProviderDropdown()`, `XP.syncProviderFields()`, and
  `XP.onProviderChange()` helpers
- Red warning under the API Key field when an online provider is active,
  explaining that keys are stored in `localStorage` and are not encrypted
- "Online Models" section on the landing page with a provider table
- "Online API providers" section in the README

### Changed
- `XP.getServer()` renamed to `XP.getEndpoint()` to reflect that it
  returns either a local or a remote URL
- `XP.loadSettings()` and `XP.saveSettings()` migrated to a per-provider
  settings shape. The old v1 `server` field is auto-migrated to the new
  `localServer` key on first load, so existing users lose nothing
- `testConnection()` now reports which provider it is checking and
  distinguishes between "bad API key" and "cannot connect"
- Status bar and About dialog now show v0.1.2

### Fixed
- Corrected llama.cpp repository links from `ggerganov/llama.cpp` to
  `ggml-org/llama.cpp` throughout the README and landing page

### Notes
- Online providers are not available in `ie.html`. IE8/IE9's
  `XDomainRequest` cannot send `Authorization` headers, so
  authenticated cross-origin requests are impossible without a proxy.
  The IE pipeline continues to work with the local server.

## [0.1.1] — 2026-10-04

### Added
- Automatic conversation persistence. Every chat is saved to
  `localStorage` and listed in a new History pane in the sidebar
- History pane with the most recent 100 conversations, sortable by
  recency, click to reload any past conversation
- "Buddy's Memory" pane: a list of facts the model has learned about
  the user across conversations, prepended to the system prompt on
  every request
- "Remember this" button which sends the current transcript back to
  the model with a prompt asking it to extract durable facts about
  the user
- "Forget all" button and per-fact delete buttons
- "Remember across chats" checkbox to disable memory without clearing
  stored facts
- `XP.storage` object with methods for reading, writing, listing,
  creating, updating, and removing conversations and memory facts
- `XP.renderHistoryList()` and `XP.renderMemoryList()` for rendering
  the two sidebar lists
- `XP.memoryPreamble()` which builds the preamble string sent with
  every request
- `XP.parseFacts()` with three fallback parsing strategies for models
  that don't produce clean JSON when asked to extract facts
- New Chat, Delete, and Test Connection buttons in the toolbar
- Toolbar row with dot indicators and shortcuts to the main actions
- XP-styled scrollbars in WebKit/Blink browsers
- Menu bar handlers: File, Edit, View, and Help now show period-correct
  humor messages instead of doing nothing
- Title bar icon using the project favicon
- App icon in the title bar and About dialog now matches the favicon

### Changed
- Menu bar's dead Connect item now triggers `testConnection()` and the
  Help item shows a keyboard-shortcut dialog
- Status bar now has three cells: status message, live model name, and
  version/copyright
- `XP.addMessage()` accepts a `role` argument and applies the correct
  styling for user vs. bot messages
- System prompt shortened to the classic Buddy persona after testing
  showed smaller quantized models handled the shorter version better

### Fixed
- Status bar dot now correctly reflects busy, ready, and error states
  via the new `XP.setStatusDot()` helper

## [0.1.0] — 2026-09-30

### Added
- Initial release
- Three browser pipelines (`index.html`, `legacy.html`, `ie.html`)
  with auto-redirect routing between them
- Shared XP Luna theme (`xp.css`) and helpers (`xp-common.js`)
- About dialog with AeteX Interactive branding
- Launcher setup prompt (Automatic / Modern / Legacy / Internet Explorer)
- Emoji filter that converts modern emoji to 2007-era ASCII emoticons
- Windows XP, Windows Vista+, macOS, and Linux launchers
- `launch-python.py` with explicit MIME types for XP
- Landing page at https://aetex.is-a.dev/buddyxp