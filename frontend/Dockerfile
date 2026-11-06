# Multi-stage Dockerfile for Next.js Frontend
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy workspace configuration and package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies using frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy frontend source
COPY frontend ./frontend

# Accept build-time public API URL for Next.js client bundle
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js production bundle
RUN pnpm --filter frontend build

EXPOSE 3000

CMD ["pnpm", "--filter", "frontend", "start"]
