/*
  Warnings:

  - A unique constraint covering the columns `[code,feature_id]` on the table `TestScenario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TestScenario_code_feature_id_key` ON `TestScenario`(`code`, `feature_id`);
