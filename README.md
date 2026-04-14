# Backr

Creator memberships on Nervos CKB using [Fiber](https://docs.fiber.world/). This repo is a **pnpm monorepo**:

| Path | Purpose |
|------|--------|
| `apps/web` | Next.js app (deploy to **Vercel** or any Node host) |
| `docker/fiber-node` | **Docker** image for a Fiber Network Node (e.g. **Railway** for the platform fee node) |

## Requirements

- Node20+, [pnpm](https://pnpm.io/) 9+
- PostgreSQL (`DATABASE_URL`)
- Optional: local or hosted Fiber nodes for development and production (see `apps/web/app/fiber-setup`)

## Develop

```bash
pnpm install
pnpm dev
```

Runs the Next app in `apps/web` (http://localhost:3000). Put local env in **`apps/web/.env`** (copy from repo-root `.env.example`).

Database migrations and Drizzle commands:

```bash
pnpm db:generate
pnpm db:push
```

## Deploy your own instance

### Vercel (web)

1. Import the Git repository.
2. Set **Root Directory** to `apps/web`.
3. Configure **Environment variables** (see `.env.example` at repo root — variables apply to the web app).
4. Cron: `vercel.json` in `apps/web` schedules `/api/cron/renewals`; set `CRON_SECRET` and match Vercel cron auth if required.

### Railway (platform Fiber node)

Use `docker/fiber-node` so Backr can collect the configured platform fee via `PLATFORM_FIBER_RPC_URL`. See `docker/fiber-node/README.md`.

### Environment

Copy `.env.example` to `apps/web/.env` locally (or set vars in the host UI). Patrons and creators should each run or point to **their own** Fiber nodes; see the in-app **Fiber setup** guide at `/fiber-setup`.

## License

Open source — deploy and modify for your community. Ensure compliance with Fiber and CKB network terms for your deployment.
