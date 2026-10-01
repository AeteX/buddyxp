/* xp-common.js - shared helpers.
   Written in ES3-only syntax so IE8 can parse it.
   Loads a global `XP` namespace. */

var XP = {};

/* ---------- DOM / string helpers ---------- */

XP.$ = function (id) { return document.getElementById(id); };

XP.esc = function (s) {
	s = String(s);
	return s.replace(/&/g, '&amp;')
	        .replace(/</g, '&lt;')
	        .replace(/>/g, '&gt;')
	        .replace(/"/g, '&quot;');
};

XP.nl2br = function (s) { return String(s).replace(/\n/g, '<br>'); };

XP.trim  = function (s) { return String(s).replace(/^\s+|\s+$/g, ''); };

XP.numOr = function (v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; };
XP.intOr = function (v, d) { var n = parseInt(v, 10); return isNaN(n) ? d : n; };

XP.timeNow = function () {
	var d = new Date(), h = d.getHours(), m = d.getMinutes();
	var ap = (h < 12) ? 'AM' : 'PM';
	var hh = h % 12; if (hh === 0) { hh = 12; }
	if (m < 10) { m = '0' + m; }
	return hh + ':' + m + ' ' + ap;
};

XP.getServer = function (inputId) {
	var v = XP.trim(XP.$(inputId).value);
	if (!v) { v = 'http://localhost:8080'; }
	while (v.length && v.charAt(v.length - 1) === '/') {
		v = v.substring(0, v.length - 1);
	}
	return v;
};

XP.setStatus = function (id, s) { XP.$(id).innerHTML = XP.esc(s); };

XP.updateButtons = function (sendId, stopId, busy) {
	XP.$(sendId).disabled = busy;
	XP.$(stopId).disabled = !busy;
};

/* ---------- emoji filter ---------- */
/*
   Stage 1: replace common emoji with old-school ASCII equivalents.
   Stage 2: strip any remaining pictographs (surrogate pairs,
            variation selectors, ZWJ, BMP symbol blocks).
   The whole thing is applied to the accumulated reply after every
   streamed chunk, so a surrogate pair split across two chunks is
   still caught once both halves have arrived.
*/
XP.EMOJI_MAP = [
	['\uD83D\uDE00',':D'], ['\uD83D\uDE01',':D'], ['\uD83D\uDE02',':D'],
	['\uD83D\uDE03',':D'], ['\uD83D\uDE04',':D'], ['\uD83D\uDE05',';)'],
	['\uD83D\uDE06',':D'], ['\uD83D\uDE07',':)'], ['\uD83D\uDE09',';)'],
	['\uD83D\uDE0A',':)'], ['\uD83D\uDE0B',':P'], ['\uD83D\uDE0D',';)'],
	['\uD83D\uDE0E','B-)'],['\uD83D\uDE0F',';)'], ['\uD83D\uDE12',':|'],
	['\uD83D\uDE14',':('], ['\uD83D\uDE15','>:/'],['\uD83D\uDE16',':S'],
	['\uD83D\uDE17',':P'], ['\uD83D\uDE18',':P'], ['\uD83D\uDE1C',';)'],
	['\uD83D\uDE1D',':P'], ['\uD83D\uDE20','>:('],['\uD83D\uDE21','>:('],
	['\uD83D\uDE22',':('], ['\uD83D\uDE25',':('], ['\uD83D\uDE26',':('],
	['\uD83D\uDE27',':('], ['\uD83D\uDE28',':o'], ['\uD83D\uDE2D',':('],
	['\uD83D\uDE31',':o'], ['\uD83D\uDE32',':o'], ['\uD83D\uDE33',':S'],
	['\uD83D\uDE34',':|'], ['\uD83D\uDC40','O_O'],['\uD83D\uDC4B','o/'],
	['\uD83D\uDC4C','ok'], ['\uD83D\uDC4D','(y)'],['\uD83D\uDC4E','(n)'],
	['\uD83D\uDC4F','\\o/'],['\uD83D\uDCAA','(y)'],['\uD83D\uDE4F','m(_ _)m'],
	['\u2764\uFE0F','<3'], ['\u2764','<3'],       ['\uD83D\uDC94','</3'],
	['\uD83D\uDCA1','!'],  ['\uD83D\uDCA9',':P'], ['\uD83C\uDF89','\\o/'],
	['\uD83D\uDE80','=>'], ['\u2728','*'],        ['\u2B50','*'],
	['\u2705','[ok]'],     ['\u274C','[x]'],      ['\u274E','[x]'],
	['\u2714\uFE0F','[ok]'],['\u2714','[ok]'],    ['\u2716\uFE0F','[x]'],
	['\u2716','[x]']
];

XP.stripEmoji = function (s) {
	s = String(s);
	for (var i = 0; i < XP.EMOJI_MAP.length; i++) {
		s = s.split(XP.EMOJI_MAP[i][0]).join(XP.EMOJI_MAP[i][1]);
	}
	/* astral emoji: high surrogate \uD83C / \uD83D / \uD83E + low surrogate */
	s = s.replace(/[\uD83C\uD83D\uD83E][\uDC00-\uDFFF]/g, '');
	/* variation selectors, ZWJ, keycap */
	s = s.replace(/[\uFE0E\uFE0F\u200D\u20E3]/g, '');
	/* BMP pictographic blocks */
	s = s.replace(/[\u2600-\u26FF\u2700-\u27BF\u2B00-\u2BFF]/g, '');
	/* tidy spacing */
	s = s.replace(/  +/g, ' ').replace(/ ([.,!?;:])/g, '$1');
	return s;
};

/* ---------- message rendering ---------- */

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

/* ---------- default system prompt ---------- */

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

/* ---------- settings (localStorage) ---------- */

XP.SETTINGS_KEY = 'buddyChatXp.settings.v1';

XP.loadSettings = function () {
	var s = null;
	try { s = JSON.parse(localStorage.getItem(XP.SETTINGS_KEY) || 'null'); } catch (e) {}
	if (!s) { s = {}; }
	XP.$('server').value    = s.server || 'http://localhost:8080';
	XP.$('temp').value      = (s.temp   != null) ? s.temp   : '0.7';
	XP.$('maxtok').value    = (s.maxtok != null) ? s.maxtok : '512';
	XP.$('sysprompt').value = (s.sys    != null) ? s.sys    : XP.DEFAULT_SYS;
};

XP.saveSettings = function () {
	try {
		localStorage.setItem(XP.SETTINGS_KEY, JSON.stringify({
			server: XP.$('server').value,
			temp:   XP.$('temp').value,
			maxtok: XP.$('maxtok').value,
			sys:    XP.$('sysprompt').value
		}));
	} catch (e) {}
};

/* ---------- shared markup helpers ---------- */

/* Wire up the sidebar inputs so settings persist on change. */
XP.bindSettingsInputs = function () {
	XP.$('server').onchange    = XP.saveSettings;
	XP.$('temp').onchange      = XP.saveSettings;
	XP.$('maxtok').onchange    = XP.saveSettings;
	XP.$('sysprompt').onchange = XP.saveSettings;
};

/* ---------- menu handlers ---------- */

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
	      '  1. Start llama-server on port 8080.\n' +
	      '  2. Click Test Connection to verify.\n' +
	      '  3. Type a message below and press Enter.\n\n' +
	      'Keyboard shortcuts:\n' +
	      '  Enter        Send message\n' +
	      '  Shift+Enter  Insert new line\n' +
	      '  F11          Fullscreen\n\n' +
	      'Source and docs:\n' +
	      '  https://github.com/Aetex/buddyxp');
};

/* ---------- setStatus with state dot ---------- */

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

/* ---------- version / branding ---------- */

XP.VERSION = '0.1.0';
XP.BUILD   = '2026.01.10';

/* ---------- welcome message ---------- */

XP.welcome = function (extraNote) {
	var msg =
		'Welcome to BuddyChat XP v' + XP.VERSION + '\n' +
		'AeteX Interactive  \u2014  https://aetex.is-a.dev  \u2014  Est. 2026\n\n' +
		'This page talks to a llama.cpp server. Start it with:\n' +
		'    llama-server -m your-model.gguf --host 0.0.0.0 --port 8080\n\n';
	if (extraNote) { msg += extraNote + '\n\n'; }
	msg +=
		'Buddy is the default persona - a friendly 2007-era IM buddy. ' +
		'A client-side filter swaps any modern emoji for ASCII emoticons.\n\n' +
		'Type a message below and press Enter.';
	XP.addMessage('log', 'bot', msg);
};

/* ---------- about dialog ---------- */

XP.showAbout = function () {
	XP.$('about-overlay').className = 'visible';
	XP.$('about-dialog').className  = 'about-dialog visible';
};

XP.closeAbout = function () {
	XP.$('about-overlay').className = '';
	XP.$('about-dialog').className  = 'about-dialog';
};

XP.initAbout = function () {
	/* Escape closes the dialog */
	var oldKey = document.onkeydown;
	document.onkeydown = function (e) {
		e = e || window.event;
		if (e.keyCode === 27) { XP.closeAbout(); }
		if (oldKey) { return oldKey.call(document, e); }
		return true;
	};

	/* Click on the dim overlay closes the dialog */
	XP.$('about-overlay').onclick = XP.closeAbout;

	/* Clicks inside the dialog should not bubble to the overlay */
	XP.$('about-dialog').onclick = function (e) {
		e = e || window.event;
		if (e.stopPropagation) { e.stopPropagation(); }
		e.cancelBubble = true;
	};
};