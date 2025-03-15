/*
  Warnings:

  - Added the required column `taskId` to the `Done` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Done" DROP CONSTRAINT "Done_id_fkey";

-- AlterTable
ALTER TABLE "Done" ADD COLUMN     "taskId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Done" ADD CONSTRAINT "Done_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
