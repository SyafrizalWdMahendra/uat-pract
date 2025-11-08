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
jest.mock("../../../prisma/client", () => ({
    prisma: {
        user: {
            findMany: jest.fn(),
        },
    },
}));
const mockedPrismaUserFindMany = client_1.prisma.user.findMany;
describe("GET /api/getUsers Endpoint", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("should return 200 and all users successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUsers = [
            { id: "1", name: "John Doe", email: "john@example.com", role: "USER" },
        ];
        mockedPrismaUserFindMany.mockResolvedValue(mockUsers);
        const response = yield (0, supertest_1.default)(app_1.default).get("/api/getUsers");
        expect(response.status).toBe(200);
        expect(response.body.payload.data).toEqual(mockUsers);
        expect(mockedPrismaUserFindMany).toHaveBeenCalledTimes(1);
    }));
    test("should return 200 and an empty array if no users are found", () => __awaiter(void 0, void 0, void 0, function* () {
        mockedPrismaUserFindMany.mockResolvedValue([]);
        const response = yield (0, supertest_1.default)(app_1.default).get("/api/getUsers");
        expect(response.status).toBe(200);
        expect(response.body.payload.data).toEqual([]);
    }));
    test("should return 500 when a database error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockError = new Error("Database connection failed");
        mockedPrismaUserFindMany.mockRejectedValue(mockError);
        const response = yield (0, supertest_1.default)(app_1.default).get("/api/getUsers");
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: "Something went wrong!",
        });
    }));
});
