# Deploying Flova

Two flavours:

1. **Local docker compose** — full stack on your machine. Zero config.
2. **Single-VPS production** — Docker + Nginx + Let's Encrypt. ~15 min from
   blank Ubuntu to live site.

---

## 1. Local

```bash
cd Flova
docker compose up -d
# open http://localhost:3000
```

All providers default to stub mode — no Stripe, no Replicate, no R2 needed.

Stop / wipe:

```bash
docker compose down            # stop
docker compose down -v         # stop + drop volumes
```

---

## 2. Single VPS (Ubuntu / Debian)

### 2.1 Prerequisites

- A domain pointing at the server's public IP (e.g. `flova.example.com`).
- Docker Engine + the `docker compose` plugin.
- A copy of this repo on the server.

```bash
# One-shot Docker install if you don't have it
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker
```

### 2.2 Configure secrets

```bash
cp .env.example .env  # create one at the repo root
nano .env
```

Required for a real prod run:

```
ENV=prod

# Database — defaults are fine; change passwords if exposing.
POSTGRES_USER=flova
POSTGRES_PASSWORD=<strong>
POSTGRES_DB=flova

AUTH_SECRET=<openssl rand -hex 32>

# Public-facing URLs (used for CORS and billing redirects)
WEB_ORIGIN=https://flova.example.com
API_ORIGIN=https://flova.example.com
NEXT_PUBLIC_API_BASE=https://flova.example.com
BILLING_SUCCESS_URL=https://flova.example.com/account/billing?upgraded=1
BILLING_CANCEL_URL=https://flova.example.com/account/billing?canceled=1

# Real providers (optional; defaults are stubs)
VIDEO_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_...
REPLICATE_MODEL=minimax/video-01

STORAGE_BACKEND=r2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_PUBLIC_URL=https://cdn.example.com   # or pub-<bucket>.r2.dev

BILLING_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2.3 First boot (no TLS yet)

Temporarily edit `deploy/nginx.conf`: comment out the `listen 443 ssl;` server
block. We need port 80 working first so Let's Encrypt can answer the HTTP-01
challenge.

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Check:

```bash
curl http://flova.example.com/api/health
# {"status":"ok","version":"0.1.0"}
```

### 2.4 Issue a TLS certificate

```bash
sudo apt-get install -y certbot
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d flova.example.com
```

Restore the 443 block in `deploy/nginx.conf` and reload:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
```

### 2.5 Stripe webhook

Stripe dashboard → Webhooks → Add endpoint
`https://flova.example.com/api/billing/webhook`. Subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the signing secret into `.env` (`STRIPE_WEBHOOK_SECRET=whsec_...`),
restart the api:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d api
```

### 2.6 Auto-renew cert

```bash
echo '0 3 * * * certbot renew --quiet && docker compose -f /path/to/Flova/docker-compose.yml -f /path/to/Flova/docker-compose.prod.yml restart nginx' \
  | sudo crontab -
```

### 2.7 Updating

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Alembic migrations run automatically on api startup.

---

## Operations

| Action | Command |
|---|---|
| Logs (all) | `docker compose logs -f` |
| Logs (one) | `docker compose logs -f api` |
| Shell into api | `docker compose exec api bash` |
| Run a migration manually | `docker compose exec api alembic upgrade head` |
| psql | `docker compose exec postgres psql -U flova flova` |
| Restart api | `docker compose restart api` |
| Backup DB | `docker compose exec postgres pg_dump -U flova flova > flova.sql` |

---

## Out of scope (deliberately)

- Multi-node orchestration (Kubernetes / Swarm).
- Blue/green deploys, zero-downtime migrations.
- Centralised logging + metrics (Sentry / Prometheus).
- WAF / DDoS protection.
- Read replicas.

These earn their place when traffic justifies them.
