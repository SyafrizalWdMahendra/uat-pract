/*
  Warnings:

  - A unique constraint covering the columns `[project_id]` on the table `TestScenarioDocs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TestScenarioDocs_project_id_key` ON `TestScenarioDocs`(`project_id`);
