ALTER TABLE `products` ADD COLUMN `slug` VARCHAR(300) NOT NULL;
CREATE UNIQUE INDEX `products_slug_key` ON `products`(`slug`);
