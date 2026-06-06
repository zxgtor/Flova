###############
# 1. Builder  #
###############
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps with the lockfile so the production image is reproducible.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time API base. Frontend bakes this into the client bundle, so it must
# be known at build (it's a NEXT_PUBLIC_* var). The compose file passes it in.
ARG NEXT_PUBLIC_API_BASE=http://localhost:8000
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE

RUN npm run build

###############
# 2. Runtime  #
###############
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Next.js standalone output bundles everything needed to run the server.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
