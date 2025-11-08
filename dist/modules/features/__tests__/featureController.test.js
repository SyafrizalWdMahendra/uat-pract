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
        feature: {
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
describe("testing features", () => {
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
    // =================================================================
    // ==  TESTS FOR CREATE FEATURE ==
    // =================================================================
    describe("POST /api/features", () => {
        const featurePayload = {
            project_id: 1,
            title: "Authentication",
        };
        test("should return feature successfully created with status 201", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feature.create.mockResolvedValue(featurePayload);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/features")
                .set("Authorization", "Bearer dummy-token")
                .send(featurePayload);
            expect(response.status).toBe(201);
            expect(response.body.payload.message).toBe("Feature successfully created");
            expect(response.body.payload.data).toEqual(featurePayload);
            expect(client_1.prisma.feature.create).toHaveBeenCalledTimes(1);
            expect(client_1.prisma.feature.create).toHaveBeenCalledWith({
                data: featurePayload,
            });
        }));
        test("should return 400 for invalid created feature data (Zod validation)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPayload = Object.assign(Object.assign({}, featurePayload), { project_id: "1" });
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/features")
                .set("Authorization", "Bearer dummy-token")
                .send(invalidPayload);
            expect(response.status).toBe(400);
        }));
        test("should return 500 when a database error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockError = new Error("Database connection failed");
            client_1.prisma.feature.create.mockRejectedValue(mockError);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/features")
                .set("Authorization", "Bearer dummy-token")
                .send(featurePayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        }));
    });
    // =================================================================
    // ==  TESTS FOR GET FEATURE ==
    // =================================================================
    describe("GET /api/features", () => {
        const featurePayload = {
            project_id: 1,
            title: "Authentication",
        };
        test("should return 200 and all feature successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feature.findMany.mockResolvedValue(featurePayload);
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/features")
                .set("Authorization", "Bearer dummy-token");
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feature successfully retrivied");
        }));
        test("should return 500 when a database error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockError = new Error("Database connection failed");
            client_1.prisma.feature.create.mockRejectedValue(mockError);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/features")
                .set("Authorization", "Bearer dummy-token")
                .send(featurePayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        }));
    });
    // =================================================================
    // ==  TESTS FOR UPDATE FEATURE ==
    // =================================================================
    describe("PATCH /api/features/:id", () => {
        const featureId = 1;
        const updatePayload = {
            project_id: 1,
            title: "Dashboard",
        };
        const expectedUpdatedFeature = {
            id: 1,
            project_id: updatePayload.project_id,
            title: updatePayload.title,
        };
        test("should update a feature successfully and return 200", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feature.update.mockResolvedValue(expectedUpdatedFeature);
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token")
                .send(updatePayload);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feature successfully updated");
            expect(response.body.payload.data).toEqual(expectedUpdatedFeature);
            expect(client_1.prisma.feature.update).toHaveBeenCalledTimes(1);
            expect(client_1.prisma.feature.update).toHaveBeenCalledWith({
                where: { id: featureId },
                data: updatePayload,
            });
        }));
        test("should return 400 for invalid update data (Zod validation)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPayload = Object.assign(Object.assign({}, updatePayload), { title: null });
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token")
                .send(invalidPayload);
            expect(response.status).toBe(400);
        }));
        test("should return 500 when a database error occurs during update", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockError = new Error("Database update failed");
            client_1.prisma.feature.update.mockRejectedValue(mockError);
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token")
                .send(updatePayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        }));
    });
    // =================================================================
    // ==  TESTS FOR DELETE FEATURE ==
    // =================================================================
    describe("DELETE /api/features/:id", () => {
        const featureId = 1;
        const mockFeature = { id: featureId, title: "Test Feature", project_id: 1 };
        test("should delete a feature successfully and return 200", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feature.findUnique.mockResolvedValue(mockFeature);
            client_1.prisma.feature.delete.mockResolvedValue(mockFeature);
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token");
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feature deleted successfully");
            expect(response.body.payload.data).toEqual([]);
            expect(client_1.prisma.feature.findUnique).toHaveBeenCalledWith({
                where: { id: featureId },
            });
            expect(client_1.prisma.feature.delete).toHaveBeenCalledWith({
                where: { id: featureId },
            });
        }));
        test("should return 404 if feature is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feature.findUnique.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token");
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Feature not found");
            expect(client_1.prisma.feature.delete).not.toHaveBeenCalled();
        }));
        test("should return 400 for an invalid (NaN) feature ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidId = "abc";
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/features/${invalidId}`)
                .set("Authorization", "Bearer dummy-token");
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("Invalid feature ID");
            expect(client_1.prisma.feature.findUnique).not.toHaveBeenCalled();
            expect(client_1.prisma.feature.delete).not.toHaveBeenCalled();
        }));
        test("should return 500 if delete operation fails", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.feature.findUnique.mockResolvedValue(mockFeature);
            const mockError = new Error("Database delete failed");
            client_1.prisma.feature.delete.mockRejectedValue(mockError);
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token");
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        }));
    });
});
