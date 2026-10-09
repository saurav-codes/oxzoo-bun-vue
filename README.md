# oxzoo-bun-vue

Deployed with [ox](https://deploywithox.com): deploy a repo to your own server with one command, no Docker. [Docs](https://deploywithox.com/docs) · [Guide for this stack](https://deploywithox.com/docs/guides/hono-bun)

An [ox](https://deploywithox.com) deploy example: a Bun + Hono API serving a Vite-built Vue 3 SPA, with one variable (`GREETING_TAG`) read by the API at **run time** and baked into the SPA at **build time**. ox deploys it to your own Ubuntu server with systemd and Caddy.

## Stack

| Layer    | Tool | Version |
| -------- | ---- | ------- |
| Runtime  | Bun  | 1.3 (ox's default) |
| API      | Hono | 4 |
| Frontend | Vue  | 3 |
| Bundler  | Vite | 5 |

## ox.toml

```toml
# Bun + Hono API serving a Vite/Vue SPA; bun comes from detection (bun.lock).

[app]
health = "/health"

[static]
dir = "dist"
spa = true
api = ["/api", "/health"]
```

ox detects the rest from the repo: `bun install --frozen-lockfile` from `bun.lock`, and `bun run build` and `bun run start` from `package.json`. Caddy serves `dist/` with the SPA fallback and sends only `/api` and `/health` to the Bun process on `$PORT`.

## Environment flow

- **Run time (API):** `src/index.ts` reads `process.env.GREETING_TAG` on every request to `/api/greeting`.
- **Build time (SPA):** `client/src/App.vue` reads `import.meta.env.GREETING_TAG`. Vite exposes only variables matching `envPrefix` (`GREETING_`, `VITE_`) and bakes them into the bundle during `bun run build`.

ox sets your variables before the build runs, so the first deploy already bakes the value in. Changing it with `ox vars set` redeploys, which rebuilds the SPA.

## Deploy with ox

```sh
curl -fsSL https://deploywithox.com/install.sh | sh
ox login
ox new https://github.com/saurav-codes/oxzoo-bun-vue
ox review oxzoo-bun-vue --from-file .env.example --wait
```

`ox review` sets `GREETING_TAG` from `.env.example` (edit the value first) and streams the first deploy. `ox status oxzoo-bun-vue` prints the URL. Run `ox check` in a clone to see the plan offline:

```console
$ ox check .
ox check . (manifest: ox.toml)

  app.start                  bun run start                                        detected:package.json
  app.health                 /health                                              declared
  static.dir                 dist                                                 declared
  static.spa                 true                                                 declared
  static.api                 /api, /health                                        declared
  build.install              bun install --frozen-lockfile                        detected:bun.lock
  build.commands[0]          bun run build                                        detected:package.json
  tools.bun                  1.3                                                  default

  Provided by ox: PORT, HOST, OX_ENV, OX_PROJECT, OX_RELEASE, OX_DATA_DIR, PUBLIC_URL, PUBLIC_HOST
  Set on the dashboard before the first deploy: GREETING_TAG

Ready to deploy.
```

## Local development

```sh
bun install
GREETING_TAG=localtest bun run build   # SPA with the tag baked in
GREETING_TAG=localtest PORT=9105 bun src/index.ts
```

## Expected output

The page shows the project heading and two lines:

```
frontend: hello world oxzoo-bun-vue_<GREETING_TAG>
backend: hello world oxzoo-bun-vue_<GREETING_TAG>
```

`/api/greeting` returns `hello world oxzoo-bun-vue_<GREETING_TAG>` and `/health` returns `ok`.
