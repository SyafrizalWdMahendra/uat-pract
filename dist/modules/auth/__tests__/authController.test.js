import request from "supertest";
import app from "../../../app.js";
import { prisma } from "../../../prisma/client.js";
import bcrypt from "bcrypt";
// --- Mocking Dependencies ---
jest.mock("../../../prisma/client", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));
jest.mock("bcrypt", () => ({
    ...jest.requireActual("bcrypt"),
    compare: jest.fn(),
}));
// --- Setup ---
process.env.JWT_SECRET = "secret-test-key-yang-aman";
const mockedPrisma = prisma;
const mockedBcrypt = bcrypt;
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
        test("should register a new user successfully and return 201", async () => {
            mockedPrisma.user.findUnique.mockResolvedValue(null);
            const createdUser = {
                id: "1",
                name: registerPayload.name,
                email: registerPayload.email,
                role: registerPayload.role,
            };
            mockedPrisma.user.create.mockResolvedValue(createdUser);
            const response = await request(app)
                .post("/api/register")
                .send(registerPayload);
            expect(response.status).toBe(201);
            expect(response.body.payload.message).toBe("User successfully registered");
            expect(response.body.payload.data).toEqual(createdUser);
            expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: registerPayload.email },
            });
            expect(mockedPrisma.user.create).toHaveBeenCalledTimes(1);
        });
        test("should return 409 if email is already registered", async () => {
            mockedPrisma.user.findUnique.mockResolvedValue({
                id: "1",
                ...registerPayload,
                password: "hashedpassword",
            });
            const response = await request(app)
                .post("/api/register")
                .send(registerPayload);
            expect(response.status).toBe(409);
            expect(response.body.payload.message).toBe("Email already registered");
            expect(mockedPrisma.user.create).not.toHaveBeenCalled();
        });
        test("should return 400 for invalid registration data (Zod validation)", async () => {
            const invalidPayload = { ...registerPayload, email: "not-an-email" };
            const response = await request(app)
                .post("/api/register")
                .send(invalidPayload);
            expect(response.status).toBe(400);
        });
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
        test("should login successfully and return a token with status 200", async () => {
            mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true);
            const response = await request(app).post("/api/login").send(loginPayload);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Login berhasil");
            expect(response.body.payload.data).toHaveProperty("token");
            expect(typeof response.body.payload.data.token).toBe("string");
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginPayload.password, mockUser.password);
        });
        test("should return 404 if user is not found", async () => {
            mockedPrisma.user.findUnique.mockResolvedValue(null);
            const response = await request(app).post("/api/login").send(loginPayload);
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Pengguna tidak ditemukan");
        });
        test("should return 401 if password is invalid", async () => {
            mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false);
            const response = await request(app).post("/api/login").send(loginPayload);
            expect(response.status).toBe(401);
            expect(response.body.payload.message).toBe("Email atau password salah");
        });
        test("should return 400 for invalid login data (e.g., missing password)", async () => {
            const invalidPayload = { email: "user@example.com" };
            const response = await request(app)
                .post("/api/login")
                .send(invalidPayload);
            expect(response.status).toBe(400);
        });
    });
});
