FROM node:24-slim

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace manifests and lockfile
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Install with correct Linux binaries baked into the image
RUN pnpm install --frozen-lockfile

EXPOSE 5173

CMD ["pnpm", "exec", "next", "dev", "--hostname", "0.0.0.0", "--port", "5173"]
