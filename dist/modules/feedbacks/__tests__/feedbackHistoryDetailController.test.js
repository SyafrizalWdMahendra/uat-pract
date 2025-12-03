import request from "supertest";
import app from "../../../app.js";
import { prisma } from "../../../prisma/client.js";
import jwt from "jsonwebtoken";
jest.mock("../../../prisma/client", () => ({
    ProjectPriority: {
        High: "high",
        Medium: "medium",
        Low: "low",
    },
    prisma: {
        feedback: {
            findUnique: jest.fn(),
            findUniqueOrThrow: jest.fn(),
            update: jest.fn(),
        },
        testScenario: {
            update: jest.fn(),
            findFirst: jest.fn(),
        },
        feature: {
            update: jest.fn(),
            findFirst: jest.fn(),
        },
        project: {
            update: jest.fn(),
        },
    },
}));
jest.mock("jsonwebtoken", () => ({
    ...jest.requireActual("jsonwebtoken"),
    verify: jest.fn(),
}));
const mockedJwt = jwt;
describe("testing feedback detail", () => {
    const authHeader = { Authorization: "Bearer dummy-token" };
    beforeEach(() => {
        jest.clearAllMocks();
        mockedJwt.verify.mockImplementation((token, secretOrPublicKey, optionsOrCallback, callback) => {
            const userPayload = { id: "1", role: "manager" };
            const cb = typeof optionsOrCallback === "function"
                ? optionsOrCallback
                : callback;
            if (cb) {
                cb(null, userPayload);
            }
        });
    });
    // =================================================================
    // GET feedback detail
    // =================================================================
    describe("GET /api/feedback-history/details/:id", () => {
        const mockFeedbackDetail = {
            id: 1,
            user_id: 1,
            description: "Test feedback",
            status: "open",
            priority: "low",
            user: { name: "Test User" },
            testScenario: { code: "TC-01", test_case: "Login test" },
            feature: { title: "Authentication" },
        };
        test("should return feedback details successfully with status 200", async () => {
            prisma.feedback.findUnique.mockResolvedValue(mockFeedbackDetail);
            const response = await request(app)
                .get("/api/feedback-history/details/1")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.data).toEqual(mockFeedbackDetail);
            expect(prisma.feedback.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 } }));
        });
        test("should return 404 if feedback is not found", async () => {
            prisma.feedback.findUnique.mockResolvedValue(null);
            const response = await request(app)
                .get("/api/feedback-history/details/999")
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Feedback not found!");
        });
    });
    // =================================================================
    // PATCH update feedback detail
    // =================================================================
    describe("PATCH /api/feedback-history/details/:id", () => {
        const validPayload = {
            feature_title: "New Feature",
            test_scenario_code: "TC-20",
            test_scenario_test_case: "Login success",
            feedback_priority: "high",
            feedback_status: "open",
            feedback_description: "Updated feedback",
        };
        test("should return 400 for invalid ID", async () => {
            const response = await request(app)
                .patch("/api/feedback-history/details/abc")
                .set(authHeader)
                .send(validPayload);
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("Invalid feedback ID");
        });
        test("should return 400 for invalid request body (Zod validation)", async () => {
            const response = await request(app)
                .patch("/api/feedback-history/details/1")
                .set(authHeader)
                .send({ feedback_description: 123 });
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("Validation error");
        });
        test("should return 404 when feedback not found", async () => {
            prisma.feedback.findUnique.mockResolvedValue(null);
            const response = await request(app)
                .patch("/api/feedback-history/details/1")
                .set(authHeader)
                .send(validPayload);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Feedback not found!");
        });
        test("should return 404 if feature title does not exist", async () => {
            prisma.feedback.findUnique.mockResolvedValue({
                id: 1,
                project_id: 99,
                feature_id: 10,
            });
            prisma.feature.findFirst.mockResolvedValue(null);
            const response = await request(app)
                .patch("/api/feedback-history/details/1")
                .set(authHeader)
                .send({
                feature_title: "New Feature",
            });
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe('Feature with title "New Feature" not found');
        });
        test("should return 404 if test scenario not found", async () => {
            prisma.feedback.findUnique.mockResolvedValue({
                id: 1,
                project_id: 99,
                feature_id: 10,
            });
            prisma.feature.findFirst.mockResolvedValue({ id: 20 });
            prisma.testScenario.findFirst.mockResolvedValue(null);
            const response = await request(app)
                .patch("/api/feedback-history/details/1")
                .set(authHeader)
                .send({
                feature_title: "Existing Feature",
                test_scenario_code: "TC-99",
                test_scenario_test_case: "Some case",
            });
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Test scenario not found with given criteria");
        });
        test("should return 400 if no valid field to update", async () => {
            prisma.feedback.findUnique.mockResolvedValue({
                id: 1,
                project_id: 1,
                feature_id: 10,
            });
            const response = await request(app)
                .patch("/api/feedback-history/details/1")
                .set(authHeader)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("No valid fields to update");
        });
        test("should update feedback successfully", async () => {
            prisma.feedback.findUnique.mockResolvedValue({
                id: 1,
                project_id: 99,
                feature_id: 10,
            });
            prisma.feature.findFirst.mockResolvedValue({ id: 20 });
            prisma.testScenario.findFirst.mockResolvedValue({
                id: 30,
            });
            prisma.feedback.update.mockResolvedValue({
                id: 1,
                feature_id: 20,
                test_scenario_id: 30,
                project_id: 99,
                user_id: 5,
                priority: "high",
                status: "open",
                description: "Updated feedback",
                created_at: "2025-01-01",
                updated_at: "2025-01-02",
            });
            const response = await request(app)
                .patch("/api/feedback-history/details/1")
                .set(authHeader)
                .send(validPayload);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feedback successfully updated");
            expect(prisma.feedback.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 1 },
                data: expect.objectContaining({
                    description: "Updated feedback",
                    priority: "high",
                    status: "open",
                    feature: { connect: { id: 20 } },
                    testScenario: { connect: { id: 30 } },
                }),
            }));
        });
    });
});
