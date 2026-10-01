#!/usr/bin/env node
/*
 * launch-node.js - tiny static file server for BuddyChat XP.
 *
 * Used as the fallback when neither Python 3 nor Python is available.
 * No npm dependencies - only Node's built-in modules.
 *
 * Usage:
 *   node launch-node.js [port] [host] [root]
 */

'use strict';

var http = require('http');
var fs   = require('fs');
var path = require('path');
var url  = require('url');

var PORT = parseInt(process.argv[2] || '8000', 10);
var HOST = process.argv[3] || '127.0.0.1';
var ROOT = path.resolve(process.argv[4] || process.cwd());

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm':  'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.map':  'application/json; charset=utf-8',
  '.pdf':  'application/pdf',
  '.wasm': 'application/wasm'
};

function send(res, status, body, type) {
  res.writeHead(status, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

var server = http.createServer(function (req, res) {
  var parsed;
  try { parsed = url.parse(req.url); }
  catch (e) { send(res, 400, 'Bad request'); return; }

  var pathname;
  try { pathname = decodeURIComponent(parsed.pathname || '/'); }
  catch (e) { send(res, 400, 'Bad request'); return; }

  if (pathname === '/') { pathname = '/index.html'; }

  var filePath = path.join(ROOT, pathname);

  /* Path-traversal guard */
  var rel = path.relative(ROOT, filePath);
  if (rel === '..' || rel.split(path.sep)[0] === '..' || path.isAbsolute(rel)) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, function (err, stat) {
    if (err || !stat || !stat.isFile()) {
      send(res, 404, 'Not found: ' + pathname);
      return;
    }

    var ext = path.extname(filePath).toLowerCase();
    var type = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache'
    });

    var stream = fs.createReadStream(filePath);
    stream.on('error', function () {
      if (!res.headersSent) { send(res, 500, 'Read error'); }
      else { res.end(); }
    });
    stream.pipe(res);
  });
});

server.on('error', function (err) {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' is already in use.');
  } else if (err.code === 'EACCES') {
    console.error('Permission denied binding to ' + HOST + ':' + PORT + '.');
  } else {
    console.error('Server error: ' + err.message);
  }
  process.exit(1);
});

server.listen(PORT, HOST, function () {
  console.log('Serving ' + ROOT);
  console.log('Listening on http://' + HOST + ':' + PORT + '/');
});

function shutdown() {
  console.log('');
  console.log('Shutting down.');
  server.close(function () { process.exit(0); });
  setTimeout(function () { process.exit(0); }, 1500).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);