import { updateDetailsSchema } from "../dto/feedbackDetailUpdateDto.js";
import { responses } from "../../../utils/responses.js";
import { prisma } from "../../../prisma/client.js";
const getFeedHistoryDetails = async (req, res) => {
    const feedHistoryId = Number(req.params.id);
    if (isNaN(feedHistoryId)) {
        return responses(res, 400, "Invalid feedback ID", null);
    }
    const feedHistories = await prisma.feedback.findUnique({
        where: { id: feedHistoryId },
        select: {
            id: true,
            user_id: true,
            test_scenario_id: true,
            feature_id: true,
            project_id: true,
            description: true,
            status: true,
            priority: true,
            created_at: true,
            updated_at: true,
            user: { select: { id: true, name: true } },
            testScenario: { select: { id: true, code: true, test_case: true } },
            feature: { select: { id: true, title: true } },
        },
    });
    if (!feedHistories) {
        return responses(res, 404, "Feedback not found!", null);
    }
    return responses(res, 200, "Feedback detail successfully retrieved", feedHistories);
};
const updateFeedHistoryDetails = async (req, res) => {
    const feedHistoryId = Number(req.params.id);
    if (isNaN(feedHistoryId)) {
        return responses(res, 400, "Invalid feedback ID", null);
    }
    const validation = updateDetailsSchema.safeParse(req.body);
    if (!validation.success) {
        return responses(res, 400, "Validation error", {
            errors: validation.error.flatten().fieldErrors,
        });
    }
    const { feature_title, test_scenario_code, test_scenario_test_case, feedback_priority, feedback_status, feedback_description, } = validation.data;
    const existingFeedback = await prisma.feedback.findUnique({
        where: { id: feedHistoryId },
        select: { id: true, project_id: true, feature_id: true },
    });
    if (!existingFeedback) {
        return responses(res, 404, "Feedback not found!", null);
    }
    // Typed update object
    const updateData = {};
    if (feedback_priority !== undefined) {
        updateData.priority = feedback_priority;
    }
    if (feedback_status !== undefined) {
        updateData.status = feedback_status;
    }
    if (feedback_description !== undefined) {
        updateData.description = feedback_description;
    }
    if (feature_title) {
        const feature = await prisma.feature.findFirst({
            where: {
                title: feature_title,
                project_id: existingFeedback.project_id,
            },
            select: { id: true },
        });
        if (!feature) {
            return responses(res, 404, `Feature with title "${feature_title}" not found`, null);
        }
        updateData.feature = { connect: { id: feature.id } };
    }
    const hasScenarioUpdate = (test_scenario_code && test_scenario_code.trim() !== "") ||
        (test_scenario_test_case && test_scenario_test_case.trim() !== "");
    if (hasScenarioUpdate) {
        const targetFeatureId = Number(updateData.feature) || existingFeedback.feature_id;
        const whereClause = {
            feature_id: targetFeatureId,
        };
        if (test_scenario_code) {
            whereClause.code = test_scenario_code;
        }
        if (test_scenario_test_case) {
            whereClause.test_case = test_scenario_test_case;
        }
        const testScenario = await prisma.testScenario.findFirst({
            where: whereClause,
            select: { id: true },
        });
        if (!testScenario) {
            return responses(res, 404, "Test scenario not found with given criteria", null);
        }
        updateData.testScenario = { connect: { id: testScenario.id } };
    }
    if (Object.keys(updateData).length === 0) {
        return responses(res, 400, "No valid fields to update", null);
    }
    const updatedFeedback = await prisma.feedback.update({
        where: { id: feedHistoryId },
        data: updateData,
        select: {
            id: true,
            user_id: true,
            test_scenario_id: true,
            feature_id: true,
            project_id: true,
            description: true,
            status: true,
            priority: true,
            created_at: true,
            updated_at: true,
            user: { select: { id: true, name: true } },
            testScenario: { select: { id: true, code: true, test_case: true } },
            feature: { select: { id: true, title: true } },
        },
    });
    return responses(res, 200, "Feedback successfully updated", updatedFeedback);
};
export { getFeedHistoryDetails, updateFeedHistoryDetails };
