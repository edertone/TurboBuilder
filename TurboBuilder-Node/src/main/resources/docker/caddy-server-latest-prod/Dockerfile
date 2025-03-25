FROM caddy:builder AS builder

# Build Caddy with Otter storage and cache handler
RUN xcaddy build \
  --with github.com/caddyserver/cache-handler \
  --with github.com/darkweak/storages/badger/caddy

FROM caddy:latest
COPY --from=builder /usr/bin/caddy /usr/bin/caddy