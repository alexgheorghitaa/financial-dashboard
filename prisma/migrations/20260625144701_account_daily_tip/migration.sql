/*
  Warnings:

  - You are about to drop the column `tip` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `tipMonth` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "tip",
DROP COLUMN "tipMonth",
ADD COLUMN     "tipDate" TEXT,
ADD COLUMN     "tipMemory" TEXT,
ADD COLUMN     "tipText" TEXT;
