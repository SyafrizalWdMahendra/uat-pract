import request from "supertest";
import app from "../../../app"; // Pastikan Anda mengimpor 'app' dari app.ts
import { prisma } from "../../../prisma/client";
import bcrypt from "bcrypt";

// --- Mocking Dependencies ---
// Mock Prisma Client
jest.mock("../../../prisma/client", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock("bcrypt", () => ({
  ...jest.requireActual("bcrypt"), // Gunakan implementasi asli untuk hash, tapi mock compare
  compare: jest.fn(),
}));

// --- Setup ---
// Atur environment variable untuk JWT
process.env.JWT_SECRET = "secret-test-key-yang-aman";

// Tipe casting untuk mempermudah penggunaan mock
const mockedPrisma = prisma as unknown as {
  user: {
    findUnique: jest.Mock<any, any>;
    create: jest.Mock<any, any>;
  };
};
const mockedBcrypt = bcrypt as unknown as {
  compare: jest.Mock<any, any>;
};

// --- Test Suites ---
describe("Auth Endpoints", () => {
  // Reset semua mock sebelum setiap tes dijalankan
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
      // Arrange: User tidak ditemukan & proses create berhasil
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      const { password, ...createdUser } = { id: "3", ...registerPayload }; // Respons tidak mengandung password
      mockedPrisma.user.create.mockResolvedValue(createdUser);

      // Act
      const response = await request(app)
        .post("/api/register") // Sesuaikan path jika berbeda
        .send(registerPayload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.payload.message).toBe(
        "User successfully registered"
      );
      expect(response.body.payload.data).toEqual(createdUser);
      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerPayload.email },
      });
      expect(mockedPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    test("should return 409 if email is already registered", async () => {
      // Arrange: User dengan email yang sama sudah ada
      mockedPrisma.user.findUnique.mockResolvedValue({
        id: "1",
        ...registerPayload,
        password: "hashedpassword",
      });

      // Act
      const response = await request(app)
        .post("/api/register")
        .send(registerPayload);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body.payload.message).toBe("Email already registered");
      expect(mockedPrisma.user.create).not.toHaveBeenCalled();
    });

    test("should return 400 for invalid registration data (Zod validation)", async () => {
      // Arrange: Kirim payload yang tidak valid (misal: email salah format)
      const invalidPayload = { ...registerPayload, email: "not-an-email" };

      // Act
      const response = await request(app)
        .post("/api/register")
        .send(invalidPayload);

      // Assert
      // Zod biasanya akan menghasilkan error yang ditangkap oleh error handler
      // dan menghasilkan status 400 (Bad Request) jika di-setup dengan benar.
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
      // Arrange: User ditemukan dan password cocok
      mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .post("/api/login") // Sesuaikan path jika berbeda
        .send(loginPayload);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.payload.message).toBe("Login berhasil");
      expect(response.body.payload.data).toHaveProperty("token");
      expect(typeof response.body.payload.data.token).toBe("string");
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginPayload.password,
        mockUser.password
      );
    });

    test("should return 404 if user is not found", async () => {
      // Arrange: User tidak ditemukan di database
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post("/api/login")
        .send(loginPayload);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.payload.message).toBe("Pengguna tidak ditemukan");
    });

    test("should return 401 if password is invalid", async () => {
      // Arrange: User ditemukan tapi password salah
      mockedPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post("/api/login")
        .send(loginPayload);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.payload.message).toBe("Email atau password salah");
    });

    test("should return 400 for invalid login data (e.g., missing password)", async () => {
      // Arrange: Payload tidak lengkap
      const invalidPayload = { email: "user@example.com" };

      // Act
      const response = await request(app)
        .post("/api/login")
        .send(invalidPayload);

      // Assert
      expect(response.status).toBe(400);
    });
  });
});
