ALTER DATABASE cimarket_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Dar permisos completos al usuario para Prisma Migrate
GRANT ALL PRIVILEGES ON *.* TO 'cimarket_user'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
