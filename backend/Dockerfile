# Multi-stage Dockerfile for NestJS Backend & Seed Runner
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

# Copy backend source
COPY backend ./backend

# Build NestJS backend
RUN pnpm --filter backend build

EXPOSE 4000

CMD ["pnpm", "--filter", "backend", "start"]
