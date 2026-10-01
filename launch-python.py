#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
launch-python.py - static file server for BuddyChat XP.

Works on Python 2.6, 2.7, 3.4+ - including the versions that run on
Windows XP SP3 (Python 2.7.18 and Python 3.4.10).

Unlike `python -m SimpleHTTPServer` or `python -m http.server`, this
script does not trust the system MIME type registry. On some Windows XP
installs, .html maps to a MIME type IE will not render, which causes
"The webpage cannot be displayed" even though the file opens fine when
you double-click it. This script always sends the correct Content-Type.

Also:
  * Sends Content-Length on every response (IE6/IE7 need it).
  * Uses HTTP/1.1 with proper keep-alive handling.
  * Threads so IE's parallel requests don't block each other.
  * Binds to 127.0.0.1 by default. Python 2.7's SimpleHTTPServer
    always binds to 0.0.0.0, exposing the folder to your LAN.

Usage:
    python launch-python.py [port] [host] [root]
"""

from __future__ import print_function

import os
import sys
import posixpath

try:
    from http.server import HTTPServer, BaseHTTPRequestHandler
    from socketserver import ThreadingMixIn
    from urllib.parse import unquote
    PY3 = True
except ImportError:
    from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
    from SocketServer import ThreadingMixIn
    from urllib import unquote
    PY3 = False


PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
HOST = sys.argv[2] if len(sys.argv) > 2 else '127.0.0.1'
ROOT = os.path.abspath(sys.argv[3] if len(sys.argv) > 3 else os.getcwd())


# ---------------------------------------------------------------------
# Explicit MIME map. Do NOT fall back to mimetypes.guess_type() on
# Windows - it reads the registry and can return garbage on XP.
# ---------------------------------------------------------------------

MIME = {
    '.html':  'text/html; charset=utf-8',
    '.htm':   'text/html; charset=utf-8',
    '.css':   'text/css; charset=utf-8',
    '.js':    'application/javascript; charset=utf-8',
    '.mjs':   'application/javascript; charset=utf-8',
    '.json':  'application/json; charset=utf-8',
    '.xml':   'application/xml; charset=utf-8',
    '.txt':   'text/plain; charset=utf-8',
    '.md':    'text/plain; charset=utf-8',
    '.png':   'image/png',
    '.jpg':   'image/jpeg',
    '.jpeg':  'image/jpeg',
    '.gif':   'image/gif',
    '.svg':   'image/svg+xml',
    '.ico':   'image/x-icon',
    '.webp':  'image/webp',
    '.woff':  'font/woff',
    '.woff2': 'font/woff2',
    '.ttf':   'font/ttf',
    '.otf':   'font/otf',
    '.pdf':   'application/pdf',
    '.wasm':  'application/wasm',
}


def guess_mime(path):
    ext = os.path.splitext(path)[1].lower()
    return MIME.get(ext, 'application/octet-stream')


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


class Handler(BaseHTTPRequestHandler):

    protocol_version = 'HTTP/1.1'

    def log_message(self, fmt, *args):
        sys.stderr.write('%s - %s\n' % (self.address_string(), fmt % args))

    def do_HEAD(self):
        self._serve(head_only=True)

    def do_GET(self):
        self._serve(head_only=False)

    def _serve(self, head_only=False):
        path = unquote(self.path.split('?', 1)[0])
        path = posixpath.normpath(path)
        parts = [p for p in path.split('/') if p and p != '.']

        for part in parts:
            if part == '..':
                self._send_error(403, 'Forbidden')
                return

        if not parts or path.endswith('/'):
            parts.append('index.html')

        file_path = os.path.join(ROOT, *parts)
        real_path = os.path.realpath(file_path)
        real_root = os.path.realpath(ROOT)

        if not real_path.startswith(real_root + os.sep) and real_path != real_root:
            self._send_error(403, 'Forbidden')
            return

        if not os.path.exists(file_path):
            self._send_error(404, 'Not Found')
            return

        if os.path.isdir(file_path):
            self.send_response(301)
            self.send_header('Location', self.path.rstrip('/') + '/')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return

        try:
            f = open(file_path, 'rb')
            data = f.read()
            f.close()
        except IOError:
            self._send_error(500, 'Internal Server Error')
            return

        self.send_response(200)
        self.send_header('Content-Type', guess_mime(file_path))
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()

        if not head_only:
            self.wfile.write(data)

    def _send_error(self, code, message):
        body = ('<!DOCTYPE html><html><head><meta charset="utf-8">'
                '<title>%d %s</title></head><body>'
                '<h1>%d %s</h1></body></html>'
                % (code, message, code, message)).encode('utf-8')

        self.send_response(code)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    print('BuddyChat XP launcher - Python static file server')
    print('  Root: %s' % ROOT)
    print('  URL:  http://%s:%d/' % (HOST, PORT))
    print('')
    print('Press Ctrl+C to stop.')
    print('')

    server = ThreadingHTTPServer((HOST, PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('')
        print('Shutting down.')
        server.shutdown()
        sys.exit(0)


if __name__ == '__main__':
    main()