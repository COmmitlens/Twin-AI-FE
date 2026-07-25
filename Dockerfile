# ---- Stage 1: Install dependencies ----
FROM node:22-alpine AS deps
RUN npm install -g pnpm@9
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Stage 2: Build the application ----
FROM node:22-alpine AS builder
RUN npm install -g pnpm@9
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js inlines NEXT_PUBLIC_* vars into the client bundle right here, at build
# time — it can't be changed later via `docker run -e` or compose `environment:`.
# So we bake a placeholder instead of a real URL, and swap it for the real
# value at container start (see docker-entrypoint.sh).
ENV NEXT_PUBLIC_API_URL=__RUNTIME_NEXT_PUBLIC_API_URL__

RUN pnpm build

# ---- Stage 3: Production runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
