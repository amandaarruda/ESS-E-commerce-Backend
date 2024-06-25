/*
  Warnings:

  - Changed the type of `userId` on the `TB_CART` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TB_CART" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TB_CART_userId_key" ON "TB_CART"("userId");
