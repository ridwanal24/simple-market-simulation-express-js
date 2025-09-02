/*
  Warnings:

  - You are about to drop the column `user_item_id` on the `marketlisting` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `marketlisting` DROP FOREIGN KEY `MarketListing_user_item_id_fkey`;

-- DropIndex
DROP INDEX `MarketListing_user_item_id_fkey` ON `marketlisting`;

-- AlterTable
ALTER TABLE `marketlisting` DROP COLUMN `user_item_id`,
    ADD COLUMN `item_id` INTEGER NULL,
    ADD COLUMN `seller_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MarketListing` ADD CONSTRAINT `MarketListing_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketListing` ADD CONSTRAINT `MarketListing_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
