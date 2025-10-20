import request from "supertest";
import app from "../../../app"; // <-- Impor aplikasi Express Anda
import { prisma } from "../../../prisma/client";

// Mocking module tetap sama
jest.mock("../../../prisma/client", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

// Kita tidak perlu mock 'responses' lagi karena kita akan menguji output HTTP asli
// jest.mock("../../../utils/responses", ...); // <-- HAPUS ATAU KOMENTARI INI

const mockedPrismaUserFindMany = prisma.user.findMany as jest.Mock;

describe("GET /api/getUsers Endpoint", () => {
  // <-- Ganti deskripsi menjadi nama endpoint

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Skenario sukses
  test("should return 200 and all users successfully", async () => {
    const mockUsers = [
      { id: "1", name: "John Doe", email: "john@example.com", role: "USER" },
    ];
    mockedPrismaUserFindMany.mockResolvedValue(mockUsers);

    const response = await request(app).get("/api/getUsers");

    expect(response.status).toBe(200);
    // Baris di bawah ini yang akan kita perbaiki
    expect(response.body.payload.data).toEqual(mockUsers);
    expect(mockedPrismaUserFindMany).toHaveBeenCalledTimes(1);
  });

  // Test 2: Skenario data kosong
  test("should return 200 and an empty array if no users are found", async () => {
    mockedPrismaUserFindMany.mockResolvedValue([]);

    const response = await request(app).get("/api/getUsers");

    expect(response.status).toBe(200);
    expect(response.body.payload.data).toEqual([]);
  });

  // Test 3: Skenario error (INI PERBAIKAN UTAMANYA)
  test("should return 500 when a database error occurs", async () => {
    const mockError = new Error("Database connection failed");
    mockedPrismaUserFindMany.mockRejectedValue(mockError);

    // Lakukan request yang kita harapkan akan gagal
    const response = await request(app).get("/api/getUsers");

    // Lakukan pengecekan pada response yang dikirim oleh error handler terpusat Anda
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Something went wrong!",
    });
  });
});
