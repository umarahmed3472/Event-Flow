/*
  Warnings:

  - A unique constraint covering the columns `[phoneE164]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneE164` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneE164" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneE164_key" ON "User"("phoneE164");
