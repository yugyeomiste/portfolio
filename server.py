#!/usr/bin/env python3
"""Back-end du portfolio (bibliothèque standard uniquement, aucune dépendance).

    python3 server.py            -> http://localhost:8000
    PORT=3000 python3 server.py  -> autre port

Routes :
    GET  /api/portfolio          tous les projets + outils
    GET  /api/projects/<slug>    un projet
    POST /api/contact            enregistre un message dans data/messages.json
    GET  /*                      fichiers statiques (HTML, CSS, JS, médias)
"""
import json
import os
import re
import threading
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(ROOT, "data", "portfolio.json")
MESSAGES_FILE = os.path.join(ROOT, "data", "messages.json")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
lock = threading.Lock()


def load_portfolio():
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Le navigateur revalide chaque fichier : les modifications s'affichent tout de suite
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/portfolio":
            return self.send_json(200, load_portfolio())
        if path.startswith("/api/projects/"):
            slug = path.rsplit("/", 1)[-1]
            project = next((p for p in load_portfolio()["projects"] if p["slug"] == slug), None)
            if project:
                return self.send_json(200, project)
            return self.send_json(404, {"error": "Projet introuvable"})
        if path.startswith("/data/messages"):
            return self.send_json(403, {"error": "Interdit"})
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/contact":
            return self.send_json(404, {"error": "Route inconnue"})
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length > 20_000:
                return self.send_json(413, {"error": "Message trop long"})
            data = json.loads(self.rfile.read(length) or b"{}")
        except (ValueError, json.JSONDecodeError):
            return self.send_json(400, {"error": "JSON invalide"})

        if data.get("website"):  # champ piège anti-spam
            return self.send_json(200, {"ok": True})
        name = str(data.get("name", "")).strip()[:200]
        email = str(data.get("email", "")).strip()[:200]
        message = str(data.get("message", "")).strip()[:5000]
        if not name or not message or not EMAIL_RE.match(email):
            return self.send_json(400, {"error": "Champs invalides"})

        entry = {
            "date": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "name": name,
            "email": email,
            "message": message,
        }
        with lock:
            messages = []
            if os.path.exists(MESSAGES_FILE):
                with open(MESSAGES_FILE, encoding="utf-8") as f:
                    messages = json.load(f)
            messages.append(entry)
            with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
                json.dump(messages, f, ensure_ascii=False, indent=2)
        print(f"Nouveau message de {name} <{email}>")
        return self.send_json(201, {"ok": True})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    server = ThreadingHTTPServer(("", port), partial(Handler, directory=ROOT))
    print(f"Portfolio en ligne sur http://localhost:{port}  (Ctrl+C pour arrêter)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
