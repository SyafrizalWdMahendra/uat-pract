import request from "supertest";
import { prisma } from "../../../prisma/client.js";
import app from "../../../app.js";
jest.mock("../../../prisma/client", () => ({
    prisma: {
        feedback: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));
const mockedPrisma = prisma;
const authHeader = {
    authorization: `Bearer dummy-token`,
};
describe("testing feedback history", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("GET /api/feedback-history/search", () => {
        it("should search successfully by content", async () => {
            const mockDate = new Date();
            const mockFeedback = {
                id: 1,
                description: "Test feedback",
                priority: "high",
                status: "open",
                created_at: mockDate,
                user: { name: "Test User" },
                feature: { title: "Auth Feature" },
                testScenario: { code: "TS001" },
            };
            mockedPrisma.feedback.findMany.mockResolvedValue([mockFeedback]);
            const response = await request(app)
                .get("/api/feedback-history/search?content=Test")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.data[0]).toEqual({
                ...mockFeedback,
                created_at: mockDate.toISOString(),
            });
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: {
                    AND: [{ description: { contains: "Test" } }],
                },
                select: expect.any(Object),
                orderBy: { created_at: "desc" },
            });
        });
        it("should search successfully by feature", async () => {
            const mockFeedback = {
                id: 1,
                description: "Test feedback",
                priority: "high",
                status: "open",
                created_at: new Date(),
                user: { name: "Test User" },
                feature: { title: "Auth Feature" },
                testScenario: { code: "TS001" },
            };
            mockedPrisma.feedback.findMany.mockResolvedValue([mockFeedback]);
            const response = await request(app)
                .get("/api/feedback-history/search?feature=Auth")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: expect.any(Object),
                select: expect.any(Object),
                orderBy: { created_at: "desc" },
            });
        });
        it("should search successfully by author", async () => {
            const mockFeedback = {
                id: 1,
                description: "Test feedback",
                priority: "high",
                status: "open",
                created_at: new Date(),
                user: { name: "User Name" },
                feature: { title: "Auth Feature" },
                testScenario: { code: "TS001" },
            };
            mockedPrisma.feedback.findMany.mockResolvedValue([mockFeedback]);
            const response = await request(app)
                .get("/api/feedback-history/search?author=User")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: {
                    AND: [{ user: { name: { contains: "User" } } }],
                },
                select: expect.any(Object),
                orderBy: { created_at: "desc" },
            });
        });
        it("should search successfully by status", async () => {
            const mockFeedback = {
                id: 1,
                description: "Test feedback",
                priority: "high",
                status: "open",
                created_at: new Date(),
                user: { name: "Test User" },
                feature: { title: "Auth Feature" },
                testScenario: { code: "TS001" },
            };
            mockedPrisma.feedback.findMany.mockResolvedValue([mockFeedback]);
            const response = await request(app)
                .get("/api/feedback-history/search?status=open")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: {
                    AND: [{ status: { equals: "open" } }],
                },
                select: expect.any(Object),
                orderBy: { created_at: "desc" },
            });
        });
        it("should search successfully by priority", async () => {
            const mockFeedback = {
                id: 1,
                description: "Test feedback",
                priority: "high",
                status: "open",
                created_at: new Date(),
                user: { name: "Test User" },
                feature: { title: "Auth Feature" },
                testScenario: { code: "TS001" },
            };
            mockedPrisma.feedback.findMany.mockResolvedValue([mockFeedback]);
            const response = await request(app)
                .get("/api/feedback-history/search?priority=high")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: {
                    AND: [{ priority: { equals: "high" } }],
                },
                select: expect.any(Object),
                orderBy: { created_at: "desc" },
            });
        });
        it("should return all feedback when no search parameter is provided", async () => {
            const mockFeedback = {
                id: 1,
                description: "Test feedback",
                priority: "high",
                status: "open",
                created_at: new Date(),
                user: { name: "Test User" },
                feature: { title: "Auth Feature" },
                testScenario: { code: "TS001" },
            };
            mockedPrisma.feedback.findMany.mockResolvedValue([mockFeedback]);
            const response = await request(app)
                .get("/api/feedback-history/search")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feedback history successfully retrieved");
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: {},
                select: expect.any(Object),
                orderBy: { created_at: "desc" },
            });
        });
        it("should return empty array if no results are found", async () => {
            mockedPrisma.feedback.findMany.mockResolvedValue([]);
            const response = await request(app)
                .get("/api/feedback-history/search?content=NonExistent")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.data).toEqual([]);
        });
        it("should return 500 if database fails", async () => {
            mockedPrisma.feedback.findMany.mockRejectedValue(new Error("Database error"));
            const response = await request(app)
                .get("/api/feedback-history/search?content=Test")
                .set(authHeader);
            expect(response.status).toBe(500);
        });
    });
    describe("GET /api/feedback-history/:id", () => {
        it("should return feedback by ID successfully", async () => {
            const mockDate = new Date();
            const mockFeedback = {
                id: 1,
                description: "Test feedback",
                priority: "high",
                status: "open",
                created_at: mockDate,
                user: { id: 1, name: "Test User" },
                feature: { id: 1, title: "Auth Feature" },
                testScenario: { id: 1, code: "TS001", test_case: "Test case" },
            };
            mockedPrisma.feedback.findFirst.mockResolvedValue(mockFeedback);
            const response = await request(app)
                .get("/api/feedback-history/1")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Data riwayat feedback berhasil diambil");
            expect(response.body.payload.data).toEqual({
                ...mockFeedback,
                created_at: mockDate.toISOString(),
            });
        });
        it("should return 404 if feedback by ID is not found", async () => {
            mockedPrisma.feedback.findFirst.mockResolvedValue(null);
            const response = await request(app)
                .get("/api/feedback-history/999")
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Riwayat feedback tidak ditemukan atau Anda tidak memiliki akses.");
        });
    });
    describe("GET /api/feedback-history", () => {
        it("should return all feedback history successfully with projectId", async () => {
            const mockDate = new Date();
            const mockFeedback = {
                id: 1,
                description: "Test feedback",
                priority: "high",
                status: "open",
                created_at: mockDate,
                project_id: 1,
                user: { id: 1, name: "Test User" },
                feature: { title: "Auth Feature" },
                testScenario: { code: "TS001", test_case: "Test case" },
            };
            mockedPrisma.feedback.findMany.mockResolvedValue([mockFeedback]);
            const response = await request(app)
                .get("/api/feedback-history?projectId=1")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feedback Histories successfully retrieved");
            expect(response.body.payload.data[0]).toEqual({
                ...mockFeedback,
                created_at: mockDate.toISOString(),
            });
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: { project_id: 1 },
                include: {
                    user: { select: { id: true, name: true } },
                    testScenario: { select: { code: true, test_case: true } },
                    feature: { select: { title: true } },
                },
                orderBy: { created_at: "desc" },
            });
        });
        it("should return 400 if projectId is not provided", async () => {
            const response = await request(app)
                .get("/api/feedback-history")
                .set(authHeader);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("projectId diperlukan");
        });
    });
    describe("DELETE /api/feedback-history/:id", () => {
        it("should delete feedback successfully", async () => {
            const mockFeedback = {
                id: 1,
                description: "Test feedback",
                priority: "high",
                status: "open",
            };
            mockedPrisma.feedback.findUnique.mockResolvedValue(mockFeedback);
            mockedPrisma.feedback.delete.mockResolvedValue(mockFeedback);
            const response = await request(app)
                .delete("/api/feedback-history/1")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feedback History and related Feedback successfully deleted");
            expect(mockedPrisma.feedback.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });
        it("should return 400 for an invalid ID", async () => {
            const response = await request(app)
                .delete("/api/feedback-history/invalid")
                .set(authHeader);
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("Invalid feedback history ID");
        });
        it("should return 404 if feedback to delete is not found", async () => {
            mockedPrisma.feedback.findUnique.mockResolvedValue(null);
            const response = await request(app)
                .delete("/api/feedback-history/999")
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Feedback history not found!");
        });
    });
});
