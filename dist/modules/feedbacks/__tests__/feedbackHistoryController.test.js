import request from "supertest";
import { prisma } from "../../../prisma/client";
import app from "../../../app";
import jwt from "jsonwebtoken";
jest.mock("../../../prisma/client", () => ({
    prisma: {
        feedback: {
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            findFirst: jest.fn(),
        },
    },
}));
jest.mock("jsonwebtoken", () => ({
    ...jest.requireActual("jsonwebtoken"),
    verify: jest.fn(),
}));
const mockedPrisma = prisma;
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
    const mockFeedback = {
        id: 1,
        description: "Test feedback",
        user: { name: "Test User" },
        feature: { title: "Authentication" },
        testScenario: { code: "TC-01" },
    };
    // =================================================================
    // ==  TESTS FOR searchFeedbackHistory
    // =================================================================
    describe("GET /api/feedback-history/search", () => {
        test("should search successfully by content", async () => {
            mockedPrisma.feedback.findMany.mockResolvedValue([
                mockFeedback,
            ]);
            const response = await request(app)
                .get("/api/feedback-history/search?content=Test")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.data[0]).toEqual(mockFeedback);
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: { description: { contains: "Test" } },
                select: expect.any(Object),
            });
        });
        test("should search successfully by feature", async () => {
            mockedPrisma.feedback.findMany.mockResolvedValue([
                mockFeedback,
            ]);
            const response = await request(app)
                .get("/api/feedback-history/search?feature=Auth")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: { feature: { title: { contains: "Auth" } } },
                select: expect.any(Object),
            });
        });
        test("should search successfully by author", async () => {
            mockedPrisma.feedback.findMany.mockResolvedValue([
                mockFeedback,
            ]);
            const response = await request(app)
                .get("/api/feedback-history/search?author=User")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: { user: { name: { contains: "User" } } },
                select: expect.any(Object),
            });
        });
        test("should return 400 if no search parameter is provided", async () => {
            const response = await request(app)
                .get("/api/feedback-history/search")
                .set(authHeader);
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("A valid search parameter (content, feature, or author) is required");
        });
        test("should return 404 if no results are found", async () => {
            mockedPrisma.feedback.findMany.mockResolvedValue([]);
            const response = await request(app)
                .get("/api/feedback-history/search?content=notfound")
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("No feedback history found matching your criteria");
        });
        test("should return 500 if database fails", async () => {
            mockedPrisma.feedback.findMany.mockRejectedValue(new Error("DB Error"));
            const response = await request(app)
                .get("/api/feedback-history/search?content=test")
                .set(authHeader);
            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Something went wrong!");
        });
    });
    // =================================================================
    // ==  TESTS FOR getFeedbackHistoryById
    // =================================================================
    describe("GET /api/feedback-history/:id", () => {
        test("should return feedback by ID successfully", async () => {
            mockedPrisma.feedback.findFirst.mockResolvedValue(mockFeedback);
            const response = await request(app)
                .get("/api/feedback-history/1")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.data).toEqual(mockFeedback);
        });
        test("should return 404 if feedback by ID is not found", async () => {
            mockedPrisma.feedback.findFirst.mockResolvedValue(null);
            const response = await request(app)
                .get("/api/feedback-history/999")
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toContain("Riwayat feedback tidak ditemukan atau Anda tidak memiliki akses.");
        });
    });
    // =================================================================
    // ==  TESTS FOR getFeedbackHistory
    // =================================================================
    describe("GET /api/feedback-history", () => {
        test("should return all feedback history successfully", async () => {
            mockedPrisma.feedback.findMany.mockResolvedValue([
                mockFeedback,
            ]);
            const response = await request(app)
                .get("/api/feedback-history")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.data[0]).toEqual(mockFeedback);
        });
    });
    // =================================================================
    // ==  TESTS FOR deleteFeedbackHistory
    // =================================================================
    describe("DELETE /api/feedback-history/:id", () => {
        test("should delete feedback successfully", async () => {
            mockedPrisma.feedback.findUnique.mockResolvedValue(mockFeedback);
            mockedPrisma.feedback.delete.mockResolvedValue(mockFeedback);
            const response = await request(app)
                .delete("/api/feedback-history/1")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toContain("successfully deleted");
            expect(mockedPrisma.feedback.findUnique).toHaveBeenCalledTimes(1);
            expect(mockedPrisma.feedback.delete).toHaveBeenCalledTimes(1);
        });
        test("should return 400 for an invalid ID", async () => {
            const response = await request(app)
                .delete("/api/feedback-history/abc")
                .set(authHeader);
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("Invalid feedback history ID");
        });
        test("should return 404 if feedback to delete is not found", async () => {
            mockedPrisma.feedback.findUnique.mockResolvedValue(null);
            const response = await request(app)
                .delete("/api/feedback-history/999")
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Feedback history not found!");
            expect(mockedPrisma.feedback.delete).not.toHaveBeenCalled();
        });
    });
});
