import request from "supertest";
import app from "../../../app.js";
import { prisma } from "../../../prisma/client.js";
import jwt from "jsonwebtoken";
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
jest.mock("jsonwebtoken", () => ({
    ...jest.requireActual("jsonwebtoken"),
    verify: jest.fn(),
}));
const mockedJwt = jwt;
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
        test("should return feature successfully created with status 201", async () => {
            prisma.feature.create.mockResolvedValue(featurePayload);
            const response = await request(app)
                .post("/api/features")
                .set("Authorization", "Bearer dummy-token")
                .send(featurePayload);
            expect(response.status).toBe(201);
            expect(response.body.payload.message).toBe("Feature successfully created");
            expect(response.body.payload.data).toEqual(featurePayload);
            expect(prisma.feature.create).toHaveBeenCalledTimes(1);
            expect(prisma.feature.create).toHaveBeenCalledWith({
                data: featurePayload,
            });
        });
        test("should return 400 for invalid created feature data (Zod validation)", async () => {
            const invalidPayload = { ...featurePayload, project_id: "1" };
            const response = await request(app)
                .post("/api/features")
                .set("Authorization", "Bearer dummy-token")
                .send(invalidPayload);
            expect(response.status).toBe(400);
        });
        test("should return 500 when a database error occurs", async () => {
            const mockError = new Error("Database connection failed");
            prisma.feature.create.mockRejectedValue(mockError);
            const response = await request(app)
                .post("/api/features")
                .set("Authorization", "Bearer dummy-token")
                .send(featurePayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        });
    });
    // =================================================================
    // ==  TESTS FOR GET FEATURE ==
    // =================================================================
    describe("GET /api/features", () => {
        const featurePayload = {
            project_id: 1,
            title: "Authentication",
        };
        test("should return 200 and all feature successfully", async () => {
            prisma.feature.findMany.mockResolvedValue(featurePayload);
            const response = await request(app)
                .get("/api/features")
                .set("Authorization", "Bearer dummy-token");
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feature successfully retrivied");
        });
        test("should return 500 when a database error occurs", async () => {
            const mockError = new Error("Database connection failed");
            prisma.feature.create.mockRejectedValue(mockError);
            const response = await request(app)
                .post("/api/features")
                .set("Authorization", "Bearer dummy-token")
                .send(featurePayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        });
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
        test("should update a feature successfully and return 200", async () => {
            prisma.feature.update.mockResolvedValue(expectedUpdatedFeature);
            const response = await request(app)
                .patch(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token")
                .send(updatePayload);
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feature successfully updated");
            expect(response.body.payload.data).toEqual(expectedUpdatedFeature);
            expect(prisma.feature.update).toHaveBeenCalledTimes(1);
            expect(prisma.feature.update).toHaveBeenCalledWith({
                where: { id: featureId },
                data: updatePayload,
            });
        });
        test("should return 400 for invalid update data (Zod validation)", async () => {
            const invalidPayload = { ...updatePayload, title: null };
            const response = await request(app)
                .patch(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token")
                .send(invalidPayload);
            expect(response.status).toBe(400);
        });
        test("should return 500 when a database error occurs during update", async () => {
            const mockError = new Error("Database update failed");
            prisma.feature.update.mockRejectedValue(mockError);
            const response = await request(app)
                .patch(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token")
                .send(updatePayload);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        });
    });
    // =================================================================
    // ==  TESTS FOR DELETE FEATURE ==
    // =================================================================
    describe("DELETE /api/features/:id", () => {
        const featureId = 1;
        const mockFeature = { id: featureId, title: "Test Feature", project_id: 1 };
        test("should delete a feature successfully and return 200", async () => {
            prisma.feature.findUnique.mockResolvedValue(mockFeature);
            prisma.feature.delete.mockResolvedValue(mockFeature);
            const response = await request(app)
                .delete(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token");
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Feature deleted successfully");
            expect(response.body.payload.data).toEqual([]);
            expect(prisma.feature.findUnique).toHaveBeenCalledWith({
                where: { id: featureId },
            });
            expect(prisma.feature.delete).toHaveBeenCalledWith({
                where: { id: featureId },
            });
        });
        test("should return 404 if feature is not found", async () => {
            prisma.feature.findUnique.mockResolvedValue(null);
            const response = await request(app)
                .delete(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token");
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("Feature not found");
            expect(prisma.feature.delete).not.toHaveBeenCalled();
        });
        test("should return 400 for an invalid (NaN) feature ID", async () => {
            const invalidId = "abc";
            const response = await request(app)
                .delete(`/api/features/${invalidId}`)
                .set("Authorization", "Bearer dummy-token");
            expect(response.status).toBe(400);
            expect(response.body.payload.message).toBe("Invalid feature ID");
            expect(prisma.feature.findUnique).not.toHaveBeenCalled();
            expect(prisma.feature.delete).not.toHaveBeenCalled();
        });
        test("should return 500 if delete operation fails", async () => {
            prisma.feature.findUnique.mockResolvedValue(mockFeature);
            const mockError = new Error("Database delete failed");
            prisma.feature.delete.mockRejectedValue(mockError);
            const response = await request(app)
                .delete(`/api/features/${featureId}`)
                .set("Authorization", "Bearer dummy-token");
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        });
    });
});
