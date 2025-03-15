/*
  Warnings:

  - You are about to drop the column `amount` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_id_fkey";

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_id_fkey";

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_supplier_uuid_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_id_fkey";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "amount",
DROP COLUMN "date";

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "Bill";

-- CreateTable
CREATE TABLE "DoneActivity" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "begin_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "hourly_rate" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "DoneActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoneExpense" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "supplier_uuid" UUID NOT NULL,

    CONSTRAINT "DoneExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoneActivity_uuid_key" ON "DoneActivity"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "DoneExpense_uuid_key" ON "DoneExpense"("uuid");

-- AddForeignKey
ALTER TABLE "DoneActivity" ADD CONSTRAINT "DoneActivity_id_fkey" FOREIGN KEY ("id") REFERENCES "Done"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoneExpense" ADD CONSTRAINT "DoneExpense_supplier_uuid_fkey" FOREIGN KEY ("supplier_uuid") REFERENCES "Supplier"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoneExpense" ADD CONSTRAINT "DoneExpense_id_fkey" FOREIGN KEY ("id") REFERENCES "Done"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_id_fkey" FOREIGN KEY ("id") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
