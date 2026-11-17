"""Local static server and Mureka proxy. Standard library only."""
import json
import os
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parent

def load_env(path=ROOT / '.env'):
    """Load simple KEY=value entries; existing environment values take priority."""
    if not path.exists():
        return
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        key, separator, value = line.partition('=')
        if separator and key.strip() in ('MUREKA_API_KEY', 'PORT'):
            os.environ.setdefault(key.strip(), value.strip().strip('"\''))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status, data):
        payload = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if self.path.startswith('/api/music/query/'):
            task_id = self.path.removeprefix('/api/music/query/')
            if not task_id or not all(c.isalnum() or c in '-_' for c in task_id):
                return self.send_json(400, {'error': {'message': 'Invalid task ID'}})
            return self.proxy('/query/' + task_id)
        # Serve only public assets; never expose environment files or source config.
        from urllib.parse import unquote, urlsplit
        path = unquote(urlsplit(self.path).path)
        if path not in ('/', '/index.html') and not path.startswith(('/css/', '/js/', '/images/', '/Instrument/')):
            return self.send_error(404)
        resolved = (ROOT / path.lstrip('/')).resolve()
        if not resolved.is_relative_to(ROOT) or any(p.startswith('.') for p in Path(path).parts):
            return self.send_error(404)
        if resolved.is_dir() and path != '/':
            return self.send_error(404)
        super().do_GET()

    def do_POST(self):
        if self.path != '/api/music/generate':
            return self.send_error(404)
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 16384:
                raise ValueError()
            data = json.loads(self.rfile.read(length))
            prompt = data.get('prompt')
            if not isinstance(prompt, str) or not prompt.strip() or len(prompt) > 4000:
                raise ValueError()
        except (ValueError, AttributeError):
            return self.send_json(400, {'error': {'message': 'Invalid music prompt'}})
        self.proxy('/generate', {'prompt': prompt, 'model': 'auto', 'lyrics': 'Instrumental only. No vocals.'})

    def proxy(self, endpoint, data=None):
        key = os.environ.get('MUREKA_API_KEY')
        if not key or key == 'replace_with_a_new_key':
            return self.send_json(503, {'error': {'message': 'Set MUREKA_API_KEY on the server to enable music generation.'}})
        request = Request('https://api.mureka.ai/v1/instrumental' + endpoint,
                          data=json.dumps(data).encode() if data is not None else None,
                          headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
        try:
            with urlopen(request, timeout=60) as response:
                result = json.loads(response.read())
            self.send_json(200, result)
        except HTTPError as error:
            messages = {
                400: 'Music provider rejected the request format. Check API compatibility.',
                401: 'Invalid or expired Mureka API key. Update .env and restart the server.',
                402: 'Music provider requires payment. Check your account balance or plan.',
                403: 'Music provider denied access. Check account and model permissions.',
                429: 'Music provider limit reached. Check quota and retry later.',
            }
            self.send_json(error.code, {'error': {'message': messages.get(error.code, 'Music provider error. Please retry later.')}})
        except (URLError, TimeoutError, ValueError):
            self.send_json(502, {'error': {'message': 'Music provider unavailable.'}})

if __name__ == '__main__':
    load_env()
    port = int(os.environ.get('PORT', '8000'))
    print(f'Open http://127.0.0.1:{port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
