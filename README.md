# downdetector

Small Next.js status page for `ostider.se` backed by a VPS uptime API.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API Proxy Configuration

The frontend calls `/api/*`, and Next.js rewrites that path to your backend.

Set `API_BASE_URL` to control the backend target:

```bash
API_BASE_URL=https://api.ostiderdowndetector.se
```

If `API_BASE_URL` is not set, it falls back to the current VPS IP target.

On Vercel, set `API_BASE_URL` in Project Settings -> Environment Variables, then redeploy.
