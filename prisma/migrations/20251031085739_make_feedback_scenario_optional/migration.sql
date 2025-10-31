-- DropForeignKey
ALTER TABLE `feedback` DROP FOREIGN KEY `Feedback_test_scenario_id_fkey`;

-- DropIndex
DROP INDEX `Feedback_test_scenario_id_fkey` ON `feedback`;

-- DropIndex
DROP INDEX `TestScenario_code_feature_id_key` ON `testscenario`;

-- AlterTable
ALTER TABLE `feedback` MODIFY `test_scenario_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_test_scenario_id_fkey` FOREIGN KEY (`test_scenario_id`) REFERENCES `TestScenario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
