# Docker Setup - CIMarket

## Requisitos

- Docker Desktop instalado y corriendo
- `docker-compose` disponible

## 🚀 Inicio rápido

```bash
docker-compose up -d
```

¡Eso es! Se ejecutará automáticamente:

- ✅ MySQL inicia
- ✅ Backend se construye e instala dependencias
- ✅ Migraciones se aplican
- ✅ Seed carga los datos
- ✅ Backend listo en `http://localhost:3000`

---

## 📋 Puertos

- **Backend**: `http://localhost:3000`
- **MySQL**: `localhost:3306`
- **Prisma Studio**: `http://localhost:5555` (si ejecutas `pnpm studio`)

---

## 🛠️ Comandos principales

### Levantar todo

```bash
docker-compose up -d
```

### Ver logs

```bash
# Backend
docker-compose logs -f backend

# MySQL
docker-compose logs -f mysql

# Ambos
docker-compose logs -f
```

### Detener (mantiene datos)

```bash
docker-compose down
```

### Detener y limpiar TODO

```bash
docker-compose down -v
```

### Acceder a MySQL directamente

```bash
docker-compose exec mysql mysql -u cimarket_user -p cimarket_db
# Contraseña: cimarket_password
```

### Ver Prisma Studio (backend corriendo)

```bash
pnpm exec prisma studio
# Abre: http://localhost:5555
```

---

## 🔄 Resetear base de datos

```bash
# Opción 1: Limpia volúmenes y reinicia
docker-compose down -v
docker-compose up -d

# Opción 2: Con Makefile
make db-reset
```

---

## 🔧 Variables de entorno

Backend usa:

- `DATABASE_URL`: `mysql://cimarket_user:cimarket_password@mysql:3306/cimarket_db`
- `NODE_ENV`: `development`

MySQL usa:

- **User**: `cimarket_user`
- **Password**: `cimarket_password`
- **Database**: `cimarket_db`
- **Root Password**: `root_password`

---

## ⚠️ Troubleshooting

### Error: "Port 3000 / 3306 already in use"

```bash
# Matar procesos existentes
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
lsof -i :3306 | grep LISTEN | awk '{print $2}' | xargs kill -9

# O cambiar puertos en docker-compose.yml
```

### Backend no conecta a MySQL

```bash
# Verificar que MySQL esté "healthy"
docker-compose ps

# Ver logs
docker-compose logs mysql
docker-compose logs backend
```

### Migraciones fallan

```bash
# Resetear todo
docker-compose down -v
docker-compose up -d

# O manualmente en el contenedor
docker-compose exec backend pnpm exec prisma migrate dev --name init
```

### Seed no se ejecuta

```bash
docker-compose exec backend pnpm run db:seed
```
