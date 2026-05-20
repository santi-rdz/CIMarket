-- AlterTable
ALTER TABLE `conversations` ADD COLUMN `buyer_archived_at` DATETIME(3) NULL,
    ADD COLUMN `buyer_deleted_at` DATETIME(3) NULL,
    ADD COLUMN `seller_archived_at` DATETIME(3) NULL,
    ADD COLUMN `seller_deleted_at` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reason` ENUM('SPAM', 'ACOSO', 'FRAUDE', 'CONTENIDO_INAPROPIADO', 'OTRO') NOT NULL,
    `detail` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reporter_id` VARCHAR(191) NOT NULL,
    `reported_id` VARCHAR(191) NOT NULL,

    INDEX `reports_reporter_id_idx`(`reporter_id`),
    INDEX `reports_reported_id_idx`(`reported_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_reviewer_id_fkey` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reported_id_fkey` FOREIGN KEY (`reported_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
