# oxzoo-bun-vue

An [ox](https://github.com/saurav-codes/ox) deploy example: a Bun + Hono API serving a Vite-built Vue 3 SPA, with one environment variable (`GREETING_TAG`) flowing to the backend at **runtime** and to the frontend at **build time**, deployed by ox onto a single Ubuntu VPS (systemd + nginx).

## Stack

| Layer    | Tool                  | Version |
| -------- | --------------------- | ------- |
| Runtime  | Bun                   | 1.x     |
| API      | Hono                  | 4       |
| Frontend | Vue                   | 3       |
| Bundler  | Vite                  | 5       |
| Deploy   | ox (`ox.toml`)        | -       |

## Environment flow

One variable, two paths:

- **Runtime (API)**: `src/index.ts` reads `process.env.GREETING_TAG` on every request to `/api/greeting`. ox injects the value from `/etc/ox/apps/oxzoo-bun-vue.env` into the systemd unit, so changing it in the ox Environment editor and redeploying is enough.
- **Build time (SPA)**: `client/src/App.vue` reads `import.meta.env.GREETING_TAG`. Vite exposes only variables matching `envPrefix` (`GREETING_`, `VITE_`) and bakes them into the bundle during `bun run build`. The value is frozen into `dist/assets/*.js` until the next build.

Set `GREETING_TAG` in the ox Environment editor **before the first deploy**: the build hook runs with that environment, so the SPA bundle gets the value on the very first deploy.

## Deploy with ox

1. Push this repo, then connect it as a project in the ox dashboard using the clone URL:
   ```
   https://github.com/saurav-codes/oxzoo-bun-vue.git
   ```
2. In the project's Environment editor, set:
   ```
   GREETING_TAG=demo-1
   ```
3. Press **Deploy**. On the first deploy ox:
   - installs `nodejs` (from the NodeSource apt repo, bundling npm),
   - runs `npm install`: bun is pinned as a local devDependency (Ubuntu has no bun apt package, and deploy hooks run as the unprivileged project user, so a global install is impossible), so this bootstraps `node_modules/.bin/bun` plus every dependency; exact pins in `package.json` keep it deterministic,
   - runs `npm run build`, which produces `dist/`,
   - starts `node_modules/.bin/bun src/index.ts` as a systemd unit on `127.0.0.1:9105`.

nginx serves `dist/` with an SPA fallback and proxies only `/api` and `/health` to the Bun process (see `api_paths` in `ox.toml`); everything else is static.

## Local development

```sh
bun install
GREETING_TAG=localtest bun run build   # SPA with the tag baked in
GREETING_TAG=localtest PORT=9105 bun src/index.ts
```

## Expected output

Visiting the site shows the project heading plus two lines (tag value depends on the environment you set):

```
frontend: hello world oxzoo-bun-vue_change-me
backend: hello world oxzoo-bun-vue_change-me
```

`curl http://<host>/api/greeting` returns `hello world oxzoo-bun-vue_change-me` and `curl http://<host>/health` returns `ok`.
