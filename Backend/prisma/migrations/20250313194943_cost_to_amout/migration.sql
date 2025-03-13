/*
  Warnings:

  - You are about to drop the column `cost` on the `TaskExpense` table. All the data in the column will be lost.
  - Added the required column `amount` to the `TaskExpense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskExpense" DROP COLUMN "cost",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL;
