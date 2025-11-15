import request from "supertest";
import app from "../../../app";
import { prisma } from "../../../prisma/client";
jest.mock("../../../prisma/client", () => ({
    prisma: {
        user: {
            findMany: jest.fn(),
        },
    },
}));
const mockedPrismaUserFindMany = prisma.user.findMany;
describe("GET /api/getUsers Endpoint", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("should return 200 and all users successfully", async () => {
        const mockUsers = [
            { id: "1", name: "John Doe", email: "john@example.com", role: "USER" },
        ];
        mockedPrismaUserFindMany.mockResolvedValue(mockUsers);
        const response = await request(app).get("/api/getUsers");
        expect(response.status).toBe(200);
        expect(response.body.payload.data).toEqual(mockUsers);
        expect(mockedPrismaUserFindMany).toHaveBeenCalledTimes(1);
    });
    test("should return 200 and an empty array if no users are found", async () => {
        mockedPrismaUserFindMany.mockResolvedValue([]);
        const response = await request(app).get("/api/getUsers");
        expect(response.status).toBe(200);
        expect(response.body.payload.data).toEqual([]);
    });
    test("should return 500 when a database error occurs", async () => {
        const mockError = new Error("Database connection failed");
        mockedPrismaUserFindMany.mockRejectedValue(mockError);
        const response = await request(app).get("/api/getUsers");
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: "Something went wrong!",
        });
    });
});
