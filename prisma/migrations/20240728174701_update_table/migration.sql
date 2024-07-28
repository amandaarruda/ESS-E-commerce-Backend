/*
  Warnings:

  - Added the required column `quantity` to the `TB_ORDER_PRODUCT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TB_ORDER_PRODUCT" ADD COLUMN     "quantity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TB_PRODUCT" ALTER COLUMN "stock" SET DEFAULT 0;
