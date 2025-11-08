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
const app_1 = __importDefault(require("../../../app"));
const client_1 = require("../../../prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
jest.mock("jsonwebtoken", () => (Object.assign(Object.assign({}, jest.requireActual("jsonwebtoken")), { verify: jest.fn() })));
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
        test("should return feedback successfully created with status 201", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feedback.create.mockResolvedValue(feedbackPayload);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/feedbacks")
                .set(authHeader)
                .send(feedbackPayload);
            expect(response.status).toBe(201);
            expect(response.body.payload.message).toBe("Feedback successfully created");
            expect(response.body.payload.data).toEqual({
                createdFeedback: feedbackPayload,
            });
            expect(client_1.prisma.feedback.create).toHaveBeenCalledTimes(1);
            expect(client_1.prisma.feedback.create).toHaveBeenCalledWith({
                data: feedbackPayload,
            });
        }));
        test("should return 400 for invalid created feedback data (Zod validation)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPayload = Object.assign(Object.assign({}, feedbackPayload), { user_id: "1" });
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/feedbacks")
                .set(authHeader)
                .send(invalidPayload);
            expect(response.status).toBe(400);
        }));
        test("should return 500 when a database error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockError = new Error("Database connection failed");
            client_1.prisma.feedback.create.mockRejectedValue(mockError);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/feedbacks")
                .set(authHeader)
                .send(feedbackPayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        }));
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
        test("should return 200 and all feedback successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feedback.findMany.mockResolvedValue(feedbackPayload);
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/feedbacks").set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feedback successfully retrivied");
        }));
        test("should return 404 when feedback data not found", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feedback.findMany.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/feedbacks").set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Feedback not found");
        }));
        test("should return 500 when a database error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockError = new Error("Database connection failed");
            client_1.prisma.feedback.findMany.mockRejectedValue(mockError);
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/feedbacks")
                .set(authHeader)
                .send(feedbackPayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        }));
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
        test("should update a feedback successfully and return 200", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feedback.update.mockResolvedValue(expectedUpdatedFeedback);
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(`/api/feedbacks/${feedbackId}`)
                .set(authHeader)
                .send(updatePayload);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feedback successfully updated");
            expect(response.body.payload.data).toEqual(expectedUpdatedFeedback);
            expect(client_1.prisma.feedback.update).toHaveBeenCalledTimes(1);
            expect(client_1.prisma.feedback.update).toHaveBeenCalledWith({
                where: { id: feedbackId },
                data: updatePayload,
            });
        }));
        test("should return 400 for invalid update data (Zod validation)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPayload = Object.assign(Object.assign({}, updatePayload), { user_id: null });
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(`/api/feedbacks/${feedbackId}`)
                .set(authHeader)
                .send(invalidPayload);
            expect(response.status).toBe(400);
        }));
        test("should return 500 when a database error occurs during update", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockError = new Error("Database update failed");
            client_1.prisma.feedback.update.mockRejectedValue(mockError);
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(`/api/feedbacks/${feedbackId}`)
                .set(authHeader)
                .send(updatePayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        }));
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
        test("should delete a feature successfully and return 200", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feedback.findUnique.mockResolvedValue(mockFeedback);
            client_1.prisma.feedback.delete.mockResolvedValue(mockFeedback);
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/feedbacks/${feedbackId}`)
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feedback successfully deleted");
            expect(response.body.payload.data).toEqual(null);
            expect(client_1.prisma.feedback.findUnique).toHaveBeenCalledWith({
                where: { id: feedbackId },
            });
            expect(client_1.prisma.feedback.delete).toHaveBeenCalledWith({
                where: { id: feedbackId },
            });
        }));
        test("should return 404 if feedback is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feedback.findUnique.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/feedbacks/${feedbackId}`)
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Feedback not found!");
            expect(client_1.prisma.feedback.delete).not.toHaveBeenCalled();
        }));
        test("should return 400 for an invalid (NaN) feedback ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidId = "abc";
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/feedbacks/${invalidId}`)
                .set(authHeader);
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("Invalid feedback ID");
            expect(client_1.prisma.feedback.findUnique).not.toHaveBeenCalled();
            expect(client_1.prisma.feedback.delete).not.toHaveBeenCalled();
        }));
        test("should return 500 if delete operation fails", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feedback.findUnique.mockResolvedValue(mockFeedback);
            const mockError = new Error("Database delete failed");
            client_1.prisma.feedback.delete.mockRejectedValue(mockError);
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/feedbacks/${feedbackId}`)
                .set(authHeader);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        }));
    });
});
