/*
  Warnings:

  - You are about to drop the column `percent` on the `Loan` table. All the data in the column will be lost.
  - Added the required column `installment` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `months` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "percent",
ADD COLUMN     "installment" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "months" INTEGER NOT NULL;
