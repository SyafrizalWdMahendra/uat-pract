/*
  Warnings:

  - A unique constraint covering the columns `[title,project_id]` on the table `Feature` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `project` MODIFY `priority` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    MODIFY `status` ENUM('active', 'inactive', 'completed') NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX `Feature_title_project_id_key` ON `Feature`(`title`, `project_id`);
