"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const client_1 = require("../../../prisma/client");
const app_1 = __importDefault(require("../../../app"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
jest.mock("jsonwebtoken", () => (Object.assign(Object.assign({}, jest.requireActual("jsonwebtoken")), { verify: jest.fn() })));
const mockedPrisma = client_1.prisma;
const mockedJwt = jsonwebtoken_1.default;
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
        test("should search successfully by content", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.feedback.findMany.mockResolvedValue([
                mockFeedback,
            ]);
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/feedback-history/search?content=Test")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.data[0]).toEqual(mockFeedback);
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: { description: { contains: "Test" } },
                select: expect.any(Object),
            });
        }));
        test("should search successfully by feature", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.feedback.findMany.mockResolvedValue([
                mockFeedback,
            ]);
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/feedback-history/search?feature=Auth")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: { feature: { title: { contains: "Auth" } } },
                select: expect.any(Object),
            });
        }));
        test("should search successfully by author", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.feedback.findMany.mockResolvedValue([
                mockFeedback,
            ]);
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/feedback-history/search?author=User")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(mockedPrisma.feedback.findMany).toHaveBeenCalledWith({
                where: { user: { name: { contains: "User" } } },
                select: expect.any(Object),
            });
        }));
        test("should return 400 if no search parameter is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/feedback-history/search")
                .set(authHeader);
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("A valid search parameter (content, feature, or author) is required");
        }));
        test("should return 404 if no results are found", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.feedback.findMany.mockResolvedValue([]);
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/feedback-history/search?content=notfound")
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("No feedback history found matching your criteria");
        }));
        test("should return 500 if database fails", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.feedback.findMany.mockRejectedValue(new Error("DB Error"));
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/feedback-history/search?content=test")
                .set(authHeader);
            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Something went wrong!");
        }));
    });
    // =================================================================
    // ==  TESTS FOR getFeedbackHistoryById
    // =================================================================
    describe("GET /api/feedback-history/:id", () => {
        test("should return feedback by ID successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.feedback.findFirst.mockResolvedValue(mockFeedback);
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/feedback-history/1")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.data).toEqual(mockFeedback);
        }));
        test("should return 404 if feedback by ID is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.feedback.findFirst.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/feedback-history/999")
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toContain("Riwayat feedback tidak ditemukan atau Anda tidak memiliki akses.");
        }));
    });
    // =================================================================
    // ==  TESTS FOR getFeedbackHistory
    // =================================================================
    describe("GET /api/feedback-history", () => {
        test("should return all feedback history successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.feedback.findMany.mockResolvedValue([
                mockFeedback,
            ]);
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/feedback-history")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.data[0]).toEqual(mockFeedback);
        }));
    });
    // =================================================================
    // ==  TESTS FOR deleteFeedbackHistory
    // =================================================================
    describe("DELETE /api/feedback-history/:id", () => {
        test("should delete feedback successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.feedback.findUnique.mockResolvedValue(mockFeedback);
            mockedPrisma.feedback.delete.mockResolvedValue(mockFeedback);
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete("/api/feedback-history/1")
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toContain("successfully deleted");
            expect(mockedPrisma.feedback.findUnique).toHaveBeenCalledTimes(1);
            expect(mockedPrisma.feedback.delete).toHaveBeenCalledTimes(1);
        }));
        test("should return 400 for an invalid ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete("/api/feedback-history/abc")
                .set(authHeader);
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("Invalid feedback history ID");
        }));
        test("should return 404 if feedback to delete is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.feedback.findUnique.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete("/api/feedback-history/999")
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Feedback history not found!");
            expect(mockedPrisma.feedback.delete).not.toHaveBeenCalled();
        }));
    });
});
