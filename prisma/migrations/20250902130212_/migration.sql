/*
  Warnings:

  - Made the column `item_id` on table `marketlisting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `seller_id` on table `marketlisting` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `marketlisting` DROP FOREIGN KEY `MarketListing_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `marketlisting` DROP FOREIGN KEY `MarketListing_seller_id_fkey`;

-- DropIndex
DROP INDEX `MarketListing_item_id_fkey` ON `marketlisting`;

-- DropIndex
DROP INDEX `MarketListing_seller_id_fkey` ON `marketlisting`;

-- AlterTable
ALTER TABLE `marketlisting` MODIFY `item_id` INTEGER NOT NULL,
    MODIFY `seller_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `MarketListing` ADD CONSTRAINT `MarketListing_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketListing` ADD CONSTRAINT `MarketListing_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
