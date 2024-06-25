/*
  Warnings:

  - Added the required column `userId` to the `TB_CART_PRODUCT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TB_CART_PRODUCT" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "TB_CART_PRODUCT" ADD CONSTRAINT "TB_CART_PRODUCT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TB_USER"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
