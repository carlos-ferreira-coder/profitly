-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "original_task_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_original_task_id_fkey" FOREIGN KEY ("original_task_id") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
