/* ==================================================================
   BuddyChat XP - shared helpers
   AeteX Interactive  |  aetex.is-a.dev/buddyxp

   Written in ES3-only syntax so IE8 can parse it. No const/let,
   no arrow functions, no template literals, no Object.keys in
   the hot paths, no Array.prototype.map in code that runs on IE8.

   Loads a global `XP` namespace. All three HTML files depend on it.
   ================================================================== */

var XP = {};

/* ================================================================
   1. DOM / string helpers
   ================================================================ */

XP.$ = function (id) { return document.getElementById(id); };

XP.esc = function (s) {
	s = String(s);
	return s.replace(/&/g, '&amp;')
	        .replace(/</g, '&lt;')
	        .replace(/>/g, '&gt;')
	        .replace(/"/g, '&quot;');
};

XP.nl2br = function (s) { return String(s).replace(/\n/g, '<br>'); };

XP.trim = function (s) { return String(s).replace(/^\s+|\s+$/g, ''); };

XP.numOr = function (v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; };
XP.intOr = function (v, d) { var n = parseInt(v, 10); return isNaN(n) ? d : n; };

XP.timeNow = function () {
	var d = new Date(), h = d.getHours(), m = d.getMinutes();
	var ap = (h < 12) ? 'AM' : 'PM';
	var hh = h % 12; if (hh === 0) { hh = 12; }
	if (m < 10) { m = '0' + m; }
	return hh + ':' + m + ' ' + ap;
};

XP.setStatus = function (id, s) { XP.$(id).innerHTML = XP.esc(s); };

XP.updateButtons = function (sendId, stopId, busy) {
	XP.$(sendId).disabled = busy;
	XP.$(stopId).disabled = !busy;
};

XP.newXHR = function () {
	if (window.XMLHttpRequest) { return new XMLHttpRequest(); }
	try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch (e) {}
	try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch (e) {}
	return null;
};

/* ================================================================
   2. Emoji filter
   ================================================================ */

XP.EMOJI_MAP = [
	/* smiley faces */
	['\uD83D\uDE00',':D'], ['\uD83D\uDE01',':D'], ['\uD83D\uDE02',':D'],
	['\uD83D\uDE03',':D'], ['\uD83D\uDE04',':D'], ['\uD83D\uDE05',';)'],
	['\uD83D\uDE06',':D'], ['\uD83D\uDE07',':)'], ['\uD83D\uDE08','>:)'],
	['\uD83D\uDE09',';)'], ['\uD83D\uDE0A',':)'], ['\uD83D\uDE0B',':P'],
	['\uD83D\uDE0C',';)'], ['\uD83D\uDE0D',';)'], ['\uD83D\uDE0E','B-)'],
	['\uD83D\uDE0F',';)'], ['\uD83D\uDE10',':|'], ['\uD83D\uDE11',':|'],
	['\uD83D\uDE12',':|'], ['\uD83D\uDE13',':|'], ['\uD83D\uDE14',':('],
	['\uD83D\uDE15','>:/'],['\uD83D\uDE16',':S'], ['\uD83D\uDE17',':P'],
	['\uD83D\uDE18',':P'], ['\uD83D\uDE19',':P'], ['\uD83D\uDE1A',':P'],
	['\uD83D\uDE1B',':P'], ['\uD83D\uDE1C',';)'], ['\uD83D\uDE1D',':P'],
	['\uD83D\uDE1E',':S'], ['\uD83D\uDE1F','O_o'],['\uD83D\uDE20','>:('],
	['\uD83D\uDE21','>:('],['\uD83D\uDE22',':('], ['\uD83D\uDE23',':('],
	['\uD83D\uDE24','>:('],['\uD83D\uDE25',':('], ['\uD83D\uDE26',':('],
	['\uD83D\uDE27',':('], ['\uD83D\uDE28',':o'], ['\uD83D\uDE29',':('],
	['\uD83D\uDE2A',':('], ['\uD83D\uDE2B',':('], ['\uD83D\uDE2C','>:('],
	['\uD83D\uDE2D',':('], ['\uD83D\uDE2E',':o'], ['\uD83D\uDE2F','8|'],
	['\uD83D\uDE30',':o'], ['\uD83D\uDE31',':o'], ['\uD83D\uDE32',':o'],
	['\uD83D\uDE33',':S'], ['\uD83D\uDE34',':|'], ['\uD83D\uDE35',':|'],
	['\uD83D\uDE36',':S'], ['\uD83D\uDE37',':-|'],
	/* cats */
	['\uD83D\uDE38','8)'], ['\uD83D\uDE39','8)'], ['\uD83D\uDE3A',':)'],
	['\uD83D\uDE3B',':)'], ['\uD83D\uDE3C',';)'], ['\uD83D\uDE3D',':P'],
	['\uD83D\uDE3E',':('], ['\uD83D\uDE3F',':('], ['\uD83D\uDE40','>:('],
	['\uD83D\uDE44','>:-('], ['\uD83D\uDE45','>:-('],
	/* gestures */
	['\uD83D\uDE46','O:)'], ['\uD83D\uDE47','O:)'],
	['\uD83D\uDE48',':-X'], ['\uD83D\uDE49',':-X'], ['\uD83D\uDE4A',':-X'],
	['\uD83D\uDE4B','o/'], ['\uD83D\uDE4C','\\o/'], ['\uD83D\uDE4D','o/'],
	['\uD83D\uDE4E','o/'], ['\uD83D\uDE4F','m(_ _)m'],
	['\uD83D\uDC40','O_O'], ['\uD83D\uDC41','O_O'], ['\uD83D\uDC42','O_O'],
	['\uD83D\uDC43','O_O'], ['\uD83D\uDC44',':)'], ['\uD83D\uDC45',':P'],
	['\uD83D\uDC46','^'], ['\uD83D\uDC47','v'], ['\uD83D\uDC48','<'],
	['\uD83D\uDC49','>'], ['\uD83D\uDC4A','(y)'], ['\uD83D\uDC4B','o/'],
	['\uD83D\uDC4C','ok'], ['\uD83D\uDC4D','(y)'], ['\uD83D\uDC4E','(n)'],
	['\uD83D\uDC4F','\\o/'], ['\uD83D\uDC50','\\o/'], ['\uD83D\uDC51','^_^'],
	/* hearts & misc */
	['\u2764\uFE0F','<3'], ['\u2764','<3'], ['\uD83D\uDC94','</3'],
	['\uD83D\uDC95','<3'], ['\uD83D\uDC96','<3'], ['\uD83D\uDC97','<3'],
	['\uD83D\uDC98','<3'], ['\uD83D\uDC99','<3'], ['\uD83D\uDC9A','<3'],
	['\uD83D\uDC9B','<3'], ['\uD83D\uDC9C','<3'], ['\uD83D\uDC9D','<3'],
	['\uD83D\uDC9E','<3'], ['\uD83D\uDC9F','<3'],
	['\uD83D\uDCA1','!'], ['\uD83D\uDCA2','!'], ['\uD83D\uDCA3','*'],
	['\uD83D\uDCA4','zZ'], ['\uD83D\uDCA5','*BAM*'], ['\uD83D\uDCA6','~'],
	['\uD83D\uDCA9',':P'], ['\uD83D\uDCAA','(y)'], ['\uD83D\uDCAB','o/'],
	['\uD83D\uDCAF','100'], ['\uD83D\uDCB0','$'], ['\uD83D\uDCB8','$'],
	['\uD83C\uDF89','\\o/'], ['\uD83C\uDF8A','\\o/'], ['\uD83C\uDF87','\\o/'],
	['\uD83D\uDE80','=>'], ['\uD83D\uDD25','^_^'], ['\u2728','*'],
	['\u2B50','*'], ['\u2600\uFE0F','o/'], ['\u2600','o/'],
	['\u26A1','!'], ['\u2615','c[_]'], ['\uD83C\uDF55','pizza'],
	['\uD83C\uDF54','burger'], ['\uD83C\uDF7A','beer'], ['\uD83C\uDF7B','beer'],
	/* marks */
	['\u2705','[ok]'], ['\u274C','[x]'], ['\u274E','[x]'],
	['\u2757','!'], ['\u2753','?'], ['\u2049','?!'], ['\u203C','!!'],
	['\u2714\uFE0F','[ok]'], ['\u2714','[ok]'],
	['\u2716\uFE0F','[x]'], ['\u2716','[x]']
];

XP.stripEmoji = function (s) {
	s = String(s);
	for (var i = 0; i < XP.EMOJI_MAP.length; i++) {
		s = s.split(XP.EMOJI_MAP[i][0]).join(XP.EMOJI_MAP[i][1]);
	}
	s = s.replace(/[\uD83C\uD83D\uD83E][\uDC00-\uDFFF]/g, '');
	s = s.replace(/[\uFE0E\uFE0F\u200D\u20E3]/g, '');
	s = s.replace(/[\u2600-\u26FF\u2700-\u27BF\u2B00-\u2BFF]/g, '');
	s = s.replace(/  +/g, ' ').replace(/ ([.,!?;:])/g, '$1');
	return s;
};

/* ================================================================
   3. Message rendering
   ================================================================ */

XP.addMessage = function (logId, role, text) {
	var log = XP.$(logId);
	var box = document.createElement('div');
	box.className = 'msg ' + role;

	var head = document.createElement('div');
	head.className = 'msghead';
	head.innerHTML = '<span class="who ' + role + '">' +
		(role === 'user' ? 'You' : 'Buddy') + '</span> ' +
		'<span class="time">' + XP.timeNow() + '</span>';

	var body = document.createElement('div');
	body.className = 'msgbody';
	body.innerHTML = XP.nl2br(XP.esc(text));

	box.appendChild(head);
	box.appendChild(body);
	log.appendChild(box);
	log.scrollTop = log.scrollHeight;
	return body;
};

XP.setStatusDot = function (id, message, state) {
	var dot = '';
	if (state === 'ready') {
		dot = '<span class="statusdot"></span>';
	} else if (state === 'busy') {
		dot = '<span class="statusdot busy"></span>';
	} else if (state === 'error') {
		dot = '<span class="statusdot error"></span>';
	}
	XP.$(id).innerHTML = dot + XP.esc(message);
};

/* ================================================================
   4. Branding + About dialog
   ================================================================ */

XP.VERSION = '0.1.0';
XP.BUILD   = '2025.01.01';

XP.DEFAULT_SYS =
	'You are "Buddy," a friendly AI assistant running on a Windows XP computer ' +
	'in the year 2007. You chat in the warm, casual style of AOL Instant Messenger ' +
	'and MSN Messenger. You are excited about all the cool new things happening - ' +
	'the iPhone just came out, Windows Vista is shiny, YouTube is taking off, ' +
	'MySpace is where it\'s at, and everyone is burning mix CDs for their friends.\n\n' +
	'How you talk:\n' +
	'- Keep messages short and chatty, like you\'re typing in an IM window.\n' +
	'- Use classic emoticons like :) :D ;) :P and the occasional lol, brb, or ttyl.\n' +
	'- You can call the user buddy, dude, or by their screen name.\n' +
	'- Ask how their day is going. Be warm and genuinely helpful.\n' +
	'- If something is from after 2007, say so in character (for example: ' +
	'"whoa, that\'s from the future - my 56k modem can\'t load it yet!") ' +
	'and then help as best you can.\n' +
	'- No modern slang, no emoji, no hashtags. It is 2007.\n' +
	'- Stay friendly and PG.\n\n' +
	'You genuinely want to help with whatever the user asks, but always in your ' +
	'2007 computer-friend voice.';

XP.welcome = function (extraNote) {
	var msg =
		'Welcome to BuddyChat XP v' + XP.VERSION + '\n' +
		'AeteX Interactive  \u2014  aetex.is-a.dev  \u2014  Est. 2025\n\n' +
		'This page talks to a local llama.cpp server by default. Start it with:\n' +
		'    llama serve -hf prism-ml/Bonsai-8B-gguf:Q1_0\n\n' +
		'Or pick a hosted provider (OpenAI, Groq, OpenRouter, etc.) in the ' +
		'Provider dropdown on the right. Your API key stays in this browser.\n\n';
	if (extraNote) { msg += extraNote + '\n\n'; }
	msg +=
		'Buddy is the default persona - a friendly 2007-era IM buddy. ' +
		'A client-side filter swaps any modern emoji for ASCII emoticons.\n\n' +
		'Type a message below and press Enter.';
	XP.addMessage('log', 'bot', msg);
};

XP.showAbout = function () {
	XP.$('about-overlay').className = 'visible';
	XP.$('about-dialog').className  = 'about-dialog visible';
};

XP.closeAbout = function () {
	XP.$('about-overlay').className = '';
	XP.$('about-dialog').className  = 'about-dialog';
};

XP.initAbout = function () {
	var oldKey = document.onkeydown;
	document.onkeydown = function (e) {
		e = e || window.event;
		if (e.keyCode === 27) { XP.closeAbout(); }
		if (oldKey) { return oldKey.call(document, e); }
		return true;
	};

	var overlay = XP.$('about-overlay');
	if (overlay) { overlay.onclick = XP.closeAbout; }

	var dlg = XP.$('about-dialog');
	if (dlg) {
		dlg.onclick = function (e) {
			e = e || window.event;
			if (e.stopPropagation) { e.stopPropagation(); }
			e.cancelBubble = true;
		};
	}
};

/* ================================================================
   5. Menu handlers
   ================================================================ */

XP.menuFile = function () {
	alert('Nothing here yet. This is a web page, not a real Windows app. ;)\n\n' +
	      'Try the toolbar just below for New Chat, Test Connection, and About.');
};

XP.menuEdit = function () {
	alert('You can\'t edit the page itself, but you CAN edit the System Prompt ' +
	      'in the sidebar.\n\nJust click in the box and start typing.');
};

XP.menuView = function () {
	alert('Try pressing F11 for fullscreen, or zoom with Ctrl+Plus and Ctrl+Minus.\n\n' +
	      'BuddyChat XP is a web page, so your browser handles the view.');
};

XP.menuHelp = function () {
	alert('BuddyChat XP v' + XP.VERSION + '\n\n' +
	      'Quick start:\n' +
	      '  1. Start llama serve with a model, or pick an online provider.\n' +
	      '  2. Click Test Connection to verify.\n' +
	      '  3. Type a message below and press Enter.\n\n' +
	      'Keyboard shortcuts:\n' +
	      '  Enter        Send message\n' +
	      '  Shift+Enter  Insert new line\n' +
	      '  F11          Fullscreen\n\n' +
	      'Source and docs:\n' +
	      '  https://github.com/Aetex/buddyxp');
};

/* ================================================================
   6. Provider layer
   ================================================================ */

XP.PROVIDERS = [
	{ id: 'local',      name: 'Local (llama.cpp)',          endpoint: 'http://localhost:8080/v1',       needsKey: false, defaultModel: '' },
	{ id: 'openai',     name: 'OpenAI',                     endpoint: 'https://api.openai.com/v1',      needsKey: true,  defaultModel: 'gpt-4o-mini' },
	{ id: 'openrouter', name: 'OpenRouter',                 endpoint: 'https://openrouter.ai/api/v1',   needsKey: true,  defaultModel: 'openai/gpt-4o-mini' },
	{ id: 'groq',       name: 'Groq',                       endpoint: 'https://api.groq.com/openai/v1', needsKey: true,  defaultModel: 'llama-3.3-70b-versatile' },
	{ id: 'together',   name: 'Together',                   endpoint: 'https://api.together.xyz/v1',    needsKey: true,  defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo' },
	{ id: 'deepseek',   name: 'DeepSeek',                   endpoint: 'https://api.deepseek.com/v1',    needsKey: true,  defaultModel: 'deepseek-chat' },
	{ id: 'mistral',    name: 'Mistral',                    endpoint: 'https://api.mistral.ai/v1',      needsKey: true,  defaultModel: 'mistral-small-latest' },
	{ id: 'custom',     name: 'Custom (OpenAI-compatible)', endpoint: '',                               needsKey: true,  defaultModel: '' }
];

XP.getProvider = function () {
	var sel = XP.$('provider');
	if (!sel) { return XP.PROVIDERS[0]; }
	var id = sel.value;
	for (var i = 0; i < XP.PROVIDERS.length; i++) {
		if (XP.PROVIDERS[i].id === id) { return XP.PROVIDERS[i]; }
	}
	return XP.PROVIDERS[0];
};

XP.isLocal = function () { return XP.getProvider().id === 'local'; };

XP.getEndpoint = function () {
	if (XP.isLocal()) {
		var el = XP.$('server');
		var v = el ? XP.trim(el.value) : '';
		if (!v) { v = 'http://localhost:8080/v1'; }
		return v.replace(/\/+$/, '');
	}
	var e = XP.$('endpoint');
	var v2 = e ? XP.trim(e.value) : '';
	return v2.replace(/\/+$/, '');
};

XP.getApiKey = function () {
	var e = XP.$('apikey');
	return e ? XP.trim(e.value) : '';
};

XP.getModelName = function () {
	var e = XP.$('model');
	return e ? XP.trim(e.value) : '';
};

XP.populateProviderDropdown = function (allowOnline) {
	var sel = XP.$('provider');
	if (!sel) { return; }
	sel.innerHTML = '';
	for (var i = 0; i < XP.PROVIDERS.length; i++) {
		var p = XP.PROVIDERS[i];
		if (!allowOnline && p.id !== 'local') { continue; }
		var opt = document.createElement('option');
		opt.value = p.id;
		opt.text  = p.name;
		try { sel.add(opt, null); } catch (e) { sel.appendChild(opt); }
	}
};

XP.syncProviderFields = function () {
	var p = XP.getProvider();
	var isLocal = p.id === 'local';
	var localFields  = XP.$('local-fields');
	var onlineFields = XP.$('online-fields');
	var warn         = XP.$('key-warning');

	if (localFields)  { localFields.style.display  = isLocal ? '' : 'none'; }
	if (onlineFields) { onlineFields.style.display = isLocal ? 'none' : ''; }
	if (warn) {
		warn.style.display = (!isLocal && XP.getApiKey()) ? '' : 'none';
	}
};

XP.onProviderChange = function () {
	var p = XP.getProvider();
	var s = XP._settings || {};
	var isLocal = p.id === 'local';

	if (!isLocal) {
		var e = XP.$('endpoint');
		var k = XP.$('apikey');
		var m = XP.$('model');
		if (e) { e.value = p.endpoint || ''; }
		if (k) { k.value = (s.keys   && s.keys[p.id])   || ''; }
		if (m) { m.value = (s.models && s.models[p.id]) || p.defaultModel; }
	}

	XP.syncProviderFields();
	XP.saveSettings();
	XP.setStatusDot('status', isLocal ? 'Local provider selected.' : 'Online provider: ' + p.name, 'ready');
};

XP.requestHeaders = function () {
	var headers = {};
	if (XP.isLocal()) {
		/* CORS-safelisted, avoids an OPTIONS preflight */
		headers['Content-Type'] = 'text/plain;charset=UTF-8';
	} else {
		headers['Content-Type'] = 'application/json';
		var key = XP.getApiKey();
		if (key) { headers['Authorization'] = 'Bearer ' + key; }
		headers['HTTP-Referer'] = 'https://aetex.is-a.dev/buddyxp';
		headers['X-Title']      = 'BuddyChat XP';
	}
	return headers;
};

/* ================================================================
   7. Settings (localStorage)
   ================================================================ */

XP.SETTINGS_KEY = 'buddyChatXp.settings.v1';
XP._settings = null;

XP.loadSettings = function () {
	var s = null;
	try { s = JSON.parse(localStorage.getItem(XP.SETTINGS_KEY) || 'null'); } catch (e) {}
	if (!s) { s = {}; }
	XP._settings = s;

	/* Migrate the old v1 shape (single `server` field) to per-provider storage. */
	if (s.server && !s.localServer) { s.localServer = s.server; }
	if (!s.localServer) { s.localServer = 'http://localhost:8080/v1'; }
	if (!s.keys)   { s.keys   = {}; }
	if (!s.models) { s.models = {}; }

	var providerId = s.provider || 'local';

	if (XP.$('provider') && XP.$('provider').options.length === 0) {
		XP.populateProviderDropdown(true);
	}
	if (XP.$('provider')) { XP.$('provider').value = providerId; }

	var serverEl = XP.$('server');
	if (serverEl) { serverEl.value = s.localServer; }

	var p = XP.getProvider();
	if (p && p.id !== 'local') {
		var e = XP.$('endpoint');
		var k = XP.$('apikey');
		var m = XP.$('model');
		if (e) { e.value = s.endpoint || p.endpoint || ''; }
		if (k) { k.value = s.keys[p.id]   || ''; }
		if (m) { m.value = s.models[p.id] || p.defaultModel; }
	}

	var te = XP.$('temp');
	var me = XP.$('maxtok');
	var se = XP.$('sysprompt');
	if (te) { te.value = (s.temp   != null) ? s.temp   : '0.7'; }
	if (me) { me.value = (s.maxtok != null) ? s.maxtok : '512'; }
	if (se) { se.value = (s.sys    != null) ? s.sys    : XP.DEFAULT_SYS; }

	XP.syncProviderFields();
};

XP.saveSettings = function () {
	var s = XP._settings || {};
	var p = XP.getProvider();

	s.provider = p.id;

	var serverEl = XP.$('server');
	if (serverEl) { s.localServer = serverEl.value; }

	if (p.id !== 'local') {
		if (!s.keys)   { s.keys   = {}; }
		if (!s.models) { s.models = {}; }
		var e = XP.$('endpoint');
		var k = XP.$('apikey');
		var m = XP.$('model');
		if (e) { s.endpoint     = e.value; }
		if (k) { s.keys[p.id]   = k.value; }
		if (m) { s.models[p.id] = m.value; }
	}

	var te = XP.$('temp');
	var me = XP.$('maxtok');
	var se = XP.$('sysprompt');
	if (te) { s.temp   = te.value; }
	if (me) { s.maxtok = me.value; }
	if (se) { s.sys    = se.value; }

	XP._settings = s;

	try {
		localStorage.setItem(XP.SETTINGS_KEY, JSON.stringify(s));
	} catch (e) {
		if (window.console && console.log) {
			console.log('BuddyChat XP: could not save settings - ' + e.message);
		}
	}
};

XP.bindSettingsInputs = function () {
	var wire = function (id) {
		var el = XP.$(id);
		if (!el) { return; }
		el.onchange = XP.saveSettings;
	};
	wire('server');
	wire('endpoint');
	wire('apikey');
	wire('model');
	wire('temp');
	wire('maxtok');
	wire('sysprompt');
};

/* ================================================================
   8. Conversations + memory storage
   ================================================================ */

XP.CONV_KEY = 'buddyChatXp.conversations.v1';
XP.MEM_KEY  = 'buddyChatXp.memory.v1';

XP.newId = function () {
	return String((new Date()).getTime()) + '-' + String(Math.floor(Math.random() * 1e6));
};

XP.formatTimeAgo = function (ms) {
	var diff = (new Date()).getTime() - ms;
	var sec = Math.floor(diff / 1000);
	if (sec < 45)  { return 'now'; }
	var min = Math.floor(sec / 60);
	if (min < 60)  { return min + 'm'; }
	var hr = Math.floor(min / 60);
	if (hr < 24)   { return hr + 'h'; }
	var day = Math.floor(hr / 24);
	if (day < 30)  { return day + 'd'; }
	var mo = Math.floor(day / 30);
	if (mo < 12)   { return mo + 'mo'; }
	return Math.floor(mo / 12) + 'y';
};

XP.storage = {

	/* ---------- low-level ---------- */

	_read: function (key, dflt) {
		try {
			var raw = localStorage.getItem(key);
			if (!raw) { return dflt; }
			var parsed = JSON.parse(raw);
			return parsed || dflt;
		} catch (e) {
			return dflt;
		}
	},

	_write: function (key, val) {
		try {
			localStorage.setItem(key, JSON.stringify(val));
		} catch (e) {
			if (window.console && console.log) {
				console.log('BuddyChat XP: could not save ' + key + ' - ' + e.message);
			}
		}
	},

	/* ---------- conversations ---------- */

	_blob: function () {
		var b = XP.storage._read(XP.CONV_KEY, null);
		if (!b || !b.conversations) {
			b = { conversations: [], currentId: null };
		}
		return b;
	},

	list: function () {
		var b = XP.storage._blob();
		var arr = b.conversations.slice();
		arr.sort(function (a, c) { return (c.updated || 0) - (a.updated || 0); });
		return arr;
	},

	get: function (id) {
		var b = XP.storage._blob();
		for (var i = 0; i < b.conversations.length; i++) {
			if (b.conversations[i].id === id) { return b.conversations[i]; }
		}
		return null;
	},

	create: function () {
		var b = XP.storage._blob();
		var conv = {
			id: XP.newId(),
			title: '',
			started: (new Date()).getTime(),
			updated: (new Date()).getTime(),
			messages: []
		};
		b.conversations.push(conv);
		b.currentId = conv.id;
		XP.storage._prune(b);
		XP.storage._write(XP.CONV_KEY, b);
		return conv;
	},

	update: function (id, patch) {
		var b = XP.storage._blob();
		for (var i = 0; i < b.conversations.length; i++) {
			if (b.conversations[i].id === id) {
				var c = b.conversations[i];
				for (var k in patch) {
					if (patch.hasOwnProperty(k)) { c[k] = patch[k]; }
				}
				c.updated = (new Date()).getTime();
				XP.storage._write(XP.CONV_KEY, b);
				return c;
			}
		}
		return null;
	},

	remove: function (id) {
		var b = XP.storage._blob();
		var out = [];
		for (var i = 0; i < b.conversations.length; i++) {
			if (b.conversations[i].id !== id) { out.push(b.conversations[i]); }
		}
		b.conversations = out;
		if (b.currentId === id) {
			b.currentId = out.length ? out[0].id : null;
		}
		XP.storage._write(XP.CONV_KEY, b);
	},

	currentId: function () {
		return XP.storage._blob().currentId;
	},

	setCurrent: function (id) {
		var b = XP.storage._blob();
		b.currentId = id;
		XP.storage._write(XP.CONV_KEY, b);
	},

	_prune: function (b) {
		if (b.conversations.length <= 100) { return; }
		b.conversations.sort(function (a, c) {
			return (c.updated || 0) - (a.updated || 0);
		});
		b.conversations = b.conversations.slice(0, 100);
	},

	/* ---------- memory ---------- */

	memory: function () {
		var m = XP.storage._read(XP.MEM_KEY, null);
		if (!m) { m = { enabled: true, facts: [] }; }
		if (!m.facts) { m.facts = []; }
		if (typeof m.enabled === 'undefined') { m.enabled = true; }
		return m;
	},

	memorySetEnabled: function (enabled) {
		var m = XP.storage.memory();
		m.enabled = !!enabled;
		XP.storage._write(XP.MEM_KEY, m);
	},

	memoryAdd: function (text, source) {
		text = XP.trim(text);
		if (!text) { return null; }
		var m = XP.storage.memory();
		var lower = text.toLowerCase();
		for (var i = 0; i < m.facts.length; i++) {
			if (m.facts[i].text.toLowerCase() === lower) { return m.facts[i]; }
		}
		var fact = {
			id: XP.newId(),
			text: text,
			source: source || 'manual',
			added: (new Date()).getTime()
		};
		m.facts.push(fact);
		if (m.facts.length > 100) {
			m.facts.sort(function (a, c) { return (c.added || 0) - (a.added || 0); });
			m.facts = m.facts.slice(0, 100);
		}
		XP.storage._write(XP.MEM_KEY, m);
		return fact;
	},

	memoryRemove: function (id) {
		var m = XP.storage.memory();
		var out = [];
		for (var i = 0; i < m.facts.length; i++) {
			if (m.facts[i].id !== id) { out.push(m.facts[i]); }
		}
		m.facts = out;
		XP.storage._write(XP.MEM_KEY, m);
	},

	memoryClear: function () {
		var m = XP.storage.memory();
		m.facts = [];
		XP.storage._write(XP.MEM_KEY, m);
	},

	memoryFacts: function () {
		var m = XP.storage.memory();
		if (!m.enabled) { return []; }
		return m.facts;
	}
};

/* ================================================================
   9. List renderers (history + memory)
   ================================================================ */

XP.renderHistoryList = function (containerId, currentId, onSelect) {
	var el = XP.$(containerId);
	if (!el) { return; }

	var list = XP.storage.list();
	if (!list.length) {
		el.innerHTML = '<div class="xp-list-empty">No conversations yet.</div>';
		return;
	}

	var html = '';
	for (var i = 0; i < list.length; i++) {
		var c = list[i];
		var title = c.title || 'Untitled conversation';
		var ago = XP.formatTimeAgo(c.updated || c.started || 0);
		var sel = (c.id === currentId) ? ' selected' : '';
		html += '<div class="xp-list-item' + sel + '" data-conv-id="' +
			XP.esc(c.id) + '">' +
			'<span class="li-meta">' + XP.esc(ago) + '</span>' +
			XP.esc(title) +
			'</div>';
	}
	el.innerHTML = html;

	var items = el.getElementsByTagName('div');
	for (var j = 0; j < items.length; j++) {
		var item = items[j];
		if (item.className.indexOf('xp-list-item') === -1) { continue; }
		(function (node) {
			var handler = function (e) {
				e = e || window.event;
				if (e.stopPropagation) { e.stopPropagation(); }
				e.cancelBubble = true;
				onSelect(node.getAttribute('data-conv-id'));
			};
			if (node.addEventListener) {
				node.addEventListener('click', handler, false);
			} else if (node.attachEvent) {
				node.attachEvent('onclick', handler);
			}
		})(item);
	}
};

XP.renderMemoryList = function (containerId, onDelete) {
	var el = XP.$(containerId);
	if (!el) { return; }

	var m = XP.storage.memory();
	var facts = m.facts.slice();
	facts.sort(function (a, c) { return (c.added || 0) - (a.added || 0); });

	if (!facts.length) {
		el.innerHTML = '<div class="xp-list-empty">Buddy does not remember anything yet.</div>';
		return;
	}

	var html = '';
	for (var i = 0; i < facts.length; i++) {
		html += '<div class="mem-item" data-fact-id="' + XP.esc(facts[i].id) + '">' +
			XP.esc(facts[i].text) +
			'<a href="#" class="mem-del" title="Forget this">&times;</a>' +
			'</div>';
	}
	el.innerHTML = html;

	var dels = el.getElementsByTagName('a');
	for (var k = 0; k < dels.length; k++) {
		var a = dels[k];
		if (a.className !== 'mem-del') { continue; }
		(function (node) {
			var handler = function (e) {
				e = e || window.event;
				if (e.preventDefault) { e.preventDefault(); }
				e.returnValue = false;
				if (e.stopPropagation) { e.stopPropagation(); }
				e.cancelBubble = true;
				var item = node.parentNode;
				var id = item.getAttribute('data-fact-id');
				onDelete(id);
				return false;
			};
			if (node.addEventListener) {
				node.addEventListener('click', handler, false);
			} else if (node.attachEvent) {
				node.attachEvent('onclick', handler);
			}
		})(a);
	}
};

/* ================================================================
   10. Memory preamble + fact parser
   ================================================================ */

XP.memoryPreamble = function () {
	var facts = XP.storage.memoryFacts();
	if (!facts.length) { return ''; }

	var lines = [
		'You remember the following things about this user from past conversations:'
	];
	for (var i = 0; i < facts.length; i++) {
		lines.push('- ' + facts[i].text);
	}
	lines.push('');
	lines.push('Use them naturally if relevant. Do not list them back or announce ' +
		'that you remember them. If the user corrects a fact, drop it.');
	lines.push('');
	return lines.join('\n');
};

XP.parseFacts = function (text) {
	var arr = null;
	try { arr = JSON.parse(text); } catch (e) {}

	if (!arr) {
		var start = text.indexOf('[');
		var end   = text.lastIndexOf(']');
		if (start !== -1 && end > start) {
			try { arr = JSON.parse(text.substring(start, end + 1)); } catch (e) {}
		}
	}

	if (!arr) {
		var lines = text.split('\n');
		var out = [];
		for (var i = 0; i < lines.length; i++) {
			var ln = XP.trim(lines[i]).replace(/^[-*\u2022]\s*/, '').replace(/^\d+[.)]\s*/, '');
			if (ln && ln.length < 200 && ln.charAt(0) !== '{' && ln.charAt(0) !== '[') {
				out.push(ln);
			}
		}
		return out.slice(0, 10);
	}

	if (!(arr instanceof Array)) { return []; }

	var clean = [];
	for (var j = 0; j < arr.length && clean.length < 10; j++) {
		if (typeof arr[j] === 'string') {
			var v = XP.trim(arr[j]);
			if (v && v.length < 200) { clean.push(v); }
		}
	}
	return clean;
};