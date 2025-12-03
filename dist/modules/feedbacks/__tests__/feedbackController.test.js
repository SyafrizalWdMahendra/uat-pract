import request from "supertest";
import app from "../../../app.js";
import { prisma } from "../../../prisma/client.js";
import jwt from "jsonwebtoken";
jest.mock("../../../prisma/client", () => ({
    prisma: {
        feedback: {
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    },
}));
jest.mock("jsonwebtoken", () => ({
    ...jest.requireActual("jsonwebtoken"),
    verify: jest.fn(),
}));
const mockedJwt = jwt;
describe("testing feedback", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedJwt.verify.mockImplementation((token, secretOrPublicKey, optionsOrCallback, callback) => {
            const userPayload = { id: "1", role: "manager" };
            const cb = typeof optionsOrCallback === "function"
                ? optionsOrCallback
                : callback;
            if (cb) {
                cb(null, userPayload);
                return;
            }
        });
    });
    const authHeader = { Authorization: "Bearer dummy-token" };
    // =================================================================
    // ==  TESTS FOR CREATE FEEDBACK ==
    // =================================================================
    describe("POST /api/feedbacks", () => {
        const feedbackPayload = {
            user_id: 1,
            test_scenario_id: 1,
            project_id: 1,
            feature_id: 1,
            description: "very good feature",
            priority: "low",
            status: "open",
        };
        test("should return feedback successfully created with status 201", async () => {
            prisma.feedback.create.mockResolvedValue(feedbackPayload);
            const response = await request(app)
                .post("/api/feedbacks")
                .set(authHeader)
                .send(feedbackPayload);
            expect(response.status).toBe(201);
            expect(response.body.payload.message).toBe("Feedback successfully created");
            expect(response.body.payload.data).toEqual({
                createdFeedback: feedbackPayload,
            });
            expect(prisma.feedback.create).toHaveBeenCalledTimes(1);
            expect(prisma.feedback.create).toHaveBeenCalledWith({
                data: feedbackPayload,
            });
        });
        test("should return 400 for invalid created feedback data (Zod validation)", async () => {
            const invalidPayload = { ...feedbackPayload, user_id: "1" };
            const response = await request(app)
                .post("/api/feedbacks")
                .set(authHeader)
                .send(invalidPayload);
            expect(response.status).toBe(400);
        });
        test("should return 500 when a database error occurs", async () => {
            const mockError = new Error("Database connection failed");
            prisma.feedback.create.mockRejectedValue(mockError);
            const response = await request(app)
                .post("/api/feedbacks")
                .set(authHeader)
                .send(feedbackPayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        });
    });
    // =================================================================
    // ==  TESTS FOR GET FEEDBACK ==
    // =================================================================
    describe("GET /api/feedbacks", () => {
        const feedbackPayload = {
            user_id: 1,
            test_scenario_id: 1,
            project_id: 1,
            feature_id: 1,
            description: "very good feature",
            priority: "low",
            status: "open",
        };
        test("should return 200 and all feedback successfully", async () => {
            prisma.feedback.findMany.mockResolvedValue(feedbackPayload);
            const response = await request(app).get("/api/feedbacks").set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feedback successfully retrivied");
        });
        test("should return 404 when feedback data not found", async () => {
            prisma.feedback.findMany.mockResolvedValue(null);
            const response = await request(app).get("/api/feedbacks").set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Feedback not found");
        });
        test("should return 500 when a database error occurs", async () => {
            const mockError = new Error("Database connection failed");
            prisma.feedback.findMany.mockRejectedValue(mockError);
            const response = await request(app)
                .get("/api/feedbacks")
                .set(authHeader)
                .send(feedbackPayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        });
    });
    // =================================================================
    // ==  TESTS FOR UPDATE FEEDBACK ==
    // =================================================================
    describe("PATCH /api/feedbacks/:id", () => {
        const feedbackId = 1;
        const updatePayload = {
            user_id: 1,
            test_scenario_id: 1,
            project_id: 1,
            feature_id: 1,
            description: "very good feature",
            priority: "low",
            status: "open",
        };
        const expectedUpdatedFeedback = {
            id: 1,
            user_id: updatePayload.user_id,
            test_scenario_id: updatePayload.test_scenario_id,
            project_id: updatePayload.project_id,
            feature_id: updatePayload.feature_id,
            description: updatePayload.description,
            priority: updatePayload.priority,
            status: updatePayload.status,
        };
        test("should update a feedback successfully and return 200", async () => {
            prisma.feedback.update.mockResolvedValue(expectedUpdatedFeedback);
            const response = await request(app)
                .patch(`/api/feedbacks/${feedbackId}`)
                .set(authHeader)
                .send(updatePayload);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feedback successfully updated");
            expect(response.body.payload.data).toEqual(expectedUpdatedFeedback);
            expect(prisma.feedback.update).toHaveBeenCalledTimes(1);
            expect(prisma.feedback.update).toHaveBeenCalledWith({
                where: { id: feedbackId },
                data: updatePayload,
            });
        });
        test("should return 400 for invalid update data (Zod validation)", async () => {
            const invalidPayload = { ...updatePayload, user_id: null };
            const response = await request(app)
                .patch(`/api/feedbacks/${feedbackId}`)
                .set(authHeader)
                .send(invalidPayload);
            expect(response.status).toBe(400);
        });
        test("should return 500 when a database error occurs during update", async () => {
            const mockError = new Error("Database update failed");
            prisma.feedback.update.mockRejectedValue(mockError);
            const response = await request(app)
                .patch(`/api/feedbacks/${feedbackId}`)
                .set(authHeader)
                .send(updatePayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        });
    });
    // =================================================================
    // ==  TESTS FOR DELETE FEEDBACK ==
    // =================================================================
    describe("DELETE /api/feedbacks/:id", () => {
        const feedbackId = 1;
        const mockFeedback = {
            id: feedbackId,
            user_id: 1,
            test_scenario_id: 1,
            project_id: 1,
            feature_id: 1,
            description: "very good feature",
            priority: "low",
            status: "open",
        };
        test("should delete a feature successfully and return 200", async () => {
            prisma.feedback.findUnique.mockResolvedValue(mockFeedback);
            prisma.feedback.delete.mockResolvedValue(mockFeedback);
            const response = await request(app)
                .delete(`/api/feedbacks/${feedbackId}`)
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feedback successfully deleted");
            expect(response.body.payload.data).toEqual(null);
            expect(prisma.feedback.findUnique).toHaveBeenCalledWith({
                where: { id: feedbackId },
            });
            expect(prisma.feedback.delete).toHaveBeenCalledWith({
                where: { id: feedbackId },
            });
        });
        test("should return 404 if feedback is not found", async () => {
            prisma.feedback.findUnique.mockResolvedValue(null);
            const response = await request(app)
                .delete(`/api/feedbacks/${feedbackId}`)
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Feedback not found!");
            expect(prisma.feedback.delete).not.toHaveBeenCalled();
        });
        test("should return 400 for an invalid (NaN) feedback ID", async () => {
            const invalidId = "abc";
            const response = await request(app)
                .delete(`/api/feedbacks/${invalidId}`)
                .set(authHeader);
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("Invalid feedback ID");
            expect(prisma.feedback.findUnique).not.toHaveBeenCalled();
            expect(prisma.feedback.delete).not.toHaveBeenCalled();
        });
        test("should return 500 if delete operation fails", async () => {
            prisma.feedback.findUnique.mockResolvedValue(mockFeedback);
            const mockError = new Error("Database delete failed");
            prisma.feedback.delete.mockRejectedValue(mockError);
            const response = await request(app)
                .delete(`/api/feedbacks/${feedbackId}`)
                .set(authHeader);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        });
    });
});
