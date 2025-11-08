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
const bcrypt_1 = __importDefault(require("bcrypt"));
// --- Mocking Dependencies ---
jest.mock("../../../prisma/client", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));
jest.mock("bcrypt", () => (Object.assign(Object.assign({}, jest.requireActual("bcrypt")), { compare: jest.fn() })));
// --- Setup ---
process.env.JWT_SECRET = "secret-test-key-yang-aman";
const mockedPrisma = client_1.prisma;
const mockedBcrypt = bcrypt_1.default;
// --- Test Suites ---
describe("Auth Endpoints", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    // =================================================================
    // ==  TESTS FOR REGISTER                                         ==
    // =================================================================
    describe("POST /api/register", () => {
        const registerPayload = {
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            role: "manager",
        };
        test("should register a new user successfully and return 201", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.user.findUnique.mockResolvedValue(null);
            const createdUser = {
                id: "1",
                name: registerPayload.name,
                email: registerPayload.email,
                role: registerPayload.role,
            };
            mockedPrisma.user.create.mockResolvedValue(createdUser);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/register")
                .send(registerPayload);
            expect(response.status).toBe(201);
            expect(response.body.payload.message).toBe("User successfully registered");
            expect(response.body.payload.data).toEqual(createdUser);
            expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: registerPayload.email },
            });
            expect(mockedPrisma.user.create).toHaveBeenCalledTimes(1);
        }));
        test("should return 409 if email is already registered", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.user.findUnique.mockResolvedValue(Object.assign(Object.assign({ id: "1" }, registerPayload), { password: "hashedpassword" }));
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/register")
                .send(registerPayload);
            expect(response.status).toBe(409);
            expect(response.body.payload.message).toBe("Email already registered");
            expect(mockedPrisma.user.create).not.toHaveBeenCalled();
        }));
        test("should return 400 for invalid registration data (Zod validation)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPayload = Object.assign(Object.assign({}, registerPayload), { email: "not-an-email" });
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/register")
                .send(invalidPayload);
            expect(response.status).toBe(400);
        }));
    });
    // =================================================================
    // ==  TESTS FOR LOGIN                                            ==
    // =================================================================
    describe("POST /api/login", () => {
        const loginPayload = {
            email: "user@example.com",
            password: "password123",
        };
        const mockUser = {
            id: "1",
            name: "Existing User",
            email: loginPayload.email,
            password: "hashedpassword",
            role: "USER",
        };
        test("should login successfully and return a token with status 200", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true);
            const response = yield (0, supertest_1.default)(app_1.default).post("/api/login").send(loginPayload);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Login berhasil");
            expect(response.body.payload.data).toHaveProperty("token");
            expect(typeof response.body.payload.data.token).toBe("string");
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginPayload.password, mockUser.password);
        }));
        test("should return 404 if user is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.user.findUnique.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app_1.default).post("/api/login").send(loginPayload);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Pengguna tidak ditemukan");
        }));
        test("should return 401 if password is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false);
            const response = yield (0, supertest_1.default)(app_1.default).post("/api/login").send(loginPayload);
            expect(response.status).toBe(401);
            expect(response.body.payload.message).toBe("Email atau password salah");
        }));
        test("should return 400 for invalid login data (e.g., missing password)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPayload = { email: "user@example.com" };
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/login")
                .send(invalidPayload);
            expect(response.status).toBe(400);
        }));
    });
});
