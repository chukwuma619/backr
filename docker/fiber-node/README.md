# Fiber Network Node (Docker)

Prebuilt image recipe for [FNN](https://github.com/nervosnetwork/fiber) (testnet config from upstream, JSON-RPC bound to `0.0.0.0:8227` for container networking). Use it for:

- **Platform fee node** — set `PLATFORM_FIBER_RPC_URL` in `apps/web` to this service’s public base URL (e.g. `https://…` behind a proxy).
- **Your own patron/creator node** — same image; you operate keys and liquidity.

Wallet setup, `ckb/key`, channels, and security are **your** responsibility. Follow [Run a Fiber Node](https://docs.fiber.world/docs/quick-start/run-a-node), then persist `/data` (volume) so keys and chain state survive restarts.

## Security

Do not expose JSON-RPC to the open internet without access controls (VPN, allowlist, mTLS). Treat the URL like a signing endpoint.

## Railway
1. Create a **new service** from this repo.
2. Set **Root Directory** to `docker/fiber-node` (or deploy only this folder).
3. Use **Dockerfile** build.
4. Add a **volume** mounted at `/data`.
5. Set variable **`FIBER_SECRET_KEY_PASSWORD`** (secret).
6. Expose **port 8227** (HTTP JSON-RPC) and **8228** (Fiber P2P) per Railway’s TCP/HTTP settings.
7. After the node is funded and peered, copy the **public base URL** for RPC into Vercel env `PLATFORM_FIBER_RPC_URL` (or per-user settings in Backr).

## Local

```bash
cd docker/fiber-node
cp .env.example .env
# edit .env — set FIBER_SECRET_KEY_PASSWORD
docker compose up --build
```

Initialize keys and channel data under the persisted volume as described in the official docs before expecting `new_invoice` / `send_payment` to succeed.
