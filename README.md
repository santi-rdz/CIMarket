# CIMarket

> Marketplace universitario para la comunidad UABC — compra, vende e intercambia de forma segura.

---
<img width="400" height="auto" alt="Screenshot 2026-05-27 at 4 57 03 p m" src="https://github.com/user-attachments/assets/a902aad6-ea6f-4c6a-a95e-c1d8807a0b29" />


---

## Stack

| Capa          | Tecnología                                         |
| ------------- | -------------------------------------------------- |
| Frontend      | Next.js 15, React 19, Tailwind CSS, TanStack Query |
| Backend       | Express, Prisma ORM, Socket.IO                     |
| Base de datos | MySQL 8                                            |
| Auth          | Google OAuth + JWT                                 |
| Push          | Web Push / VAPID                                   |
| Infra         | Docker Compose                                     |

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

| Variable                                 | Descripción                                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`                       | Credencial OAuth en [console.cloud.google.com](https://console.cloud.google.com/apis/credentials)   |
| `JWT_SECRET`                             | String aleatorio largo — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Generar con `npx web-push generate-vapid-keys`                                                      |

### 2. Levantar el proyecto

```bash
pnpm install
pnpm dev          # Docker (backend + MySQL) + Next.js local
```

El comando `dev` hace todo solo: levanta los containers, corre migraciones, seed, y arranca el frontend.

| Servicio    | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:3000 |
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
