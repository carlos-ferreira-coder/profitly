/*
  Warnings:

  - You are about to drop the column `task_activity_uuid` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `task_expense_uuid` on the `Expense` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_task_activity_uuid_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_task_expense_uuid_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "task_activity_uuid";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "task_expense_uuid";

-- AddForeignKey
ALTER TABLE "Done" ADD CONSTRAINT "Done_id_fkey" FOREIGN KEY ("id") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
