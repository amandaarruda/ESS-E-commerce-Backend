/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `TB_CART` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TB_CART_userId_key" ON "TB_CART"("userId");
