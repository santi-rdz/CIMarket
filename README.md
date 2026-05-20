# CIMarket

> Marketplace universitario para la comunidad UABC — compra, vende e intercambia de forma segura.

---
<img width="500" height="auto" alt="Productos Campus 2 (1)" src="https://github.com/user-attachments/assets/a63add13-1a14-4c24-8232-3ae23e30b226" />
<img width="500" height="auto" alt="Teclado Casio CT-S300" src="https://github.com/user-attachments/assets/1dfd8895-9f30-4d8d-aa71-cf36741f0143" />

---


## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS, TanStack Query |
| Backend | Express, Prisma ORM, Socket.IO |
| Base de datos | MySQL 8 |
| Auth | Google OAuth + JWT |
| Push | Web Push / VAPID |
| Infra | Docker Compose |

## Estructura

```
CIMarket/
├── frontend/      # Next.js app
├── backend/       # Express API
├── shared/        # Schemas Zod y constantes comunes
└── docker/        # Init SQL
```

## Requisitos

- Node.js 20+
- pnpm 10+
- Docker + Docker Compose

## Setup

### 1. Variables de entorno

```bash
cp backend/.env.example backend/.env
```

Completa los valores requeridos:

| Variable | Descripción |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Credencial OAuth en [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) |
| `JWT_SECRET` | String aleatorio largo — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Generar con `npx web-push generate-vapid-keys` |

### 2. Levantar el proyecto

```bash
pnpm install
pnpm dev          # Docker (backend + MySQL) + Next.js local
```

El comando `dev` hace todo solo: levanta los containers, corre migraciones, seed, y arranca el frontend.

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |

## Scripts

```bash
pnpm dev          # Desarrollo completo
pnpm up           # Solo Docker (backend + DB)
pnpm stop         # Detener containers
pnpm down         # Bajar containers
pnpm fresh        # Reset total (borra volúmenes y rebuild)
pnpm logs         # Seguir logs de containers
pnpm be           # Shell en container backend
pnpm sql          # Consola MySQL
pnpm lint         # Lint en todos los paquetes
pnpm format       # Formatear código
```

## Backend (solo)

```bash
cd backend
pnpm db:seed           # Poblar base de datos
pnpm db:reset          # Reset + migraciones
pnpm prisma:migrate    # Nueva migración
```
