import request from "supertest";
import app from "../../../app.js";
import { prisma } from "../../../prisma/client.js";
import jwt from "jsonwebtoken";
jest.mock("../../../prisma/client", () => ({
  ProjectPriority: {
    High: "high",
    Medium: "medium",
    Low: "low",
  },
  prisma: {
    feedback: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
    testScenario: {
      update: jest.fn(),
    },
    feature: {
      update: jest.fn(),
    },
    project: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));
jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn(),
}));
const mockedJwt = jwt;
let mockedTx;
let mockRelations;
let shouldFailFindUnique;
describe("testing feedback detail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    shouldFailFindUnique = false;
    mockRelations = {
      testScenario: {
        id: 10,
        feature: {
          id: 20,
          project_id: 30,
        },
      },
    };
    mockedJwt.verify.mockImplementation(
      (token, secretOrPublicKey, optionsOrCallback, callback) => {
        const userPayload = { id: "1", role: "manager" };
        const cb =
          typeof optionsOrCallback === "function"
            ? optionsOrCallback
            : callback;
        if (cb) {
          cb(null, userPayload);
          return;
        }
      }
    );
    prisma.$transaction.mockImplementation(async (callback) => {
      mockedTx = {
        feedback: {
          findUniqueOrThrow: jest.fn(),
          update: jest.fn(),
        },
        testScenario: {
          update: jest.fn(),
        },
        feature: {
          update: jest.fn(),
        },
        project: {
          update: jest.fn(),
        },
      };
      if (shouldFailFindUnique) {
        mockedTx.feedback.findUniqueOrThrow.mockRejectedValue(
          new Error("Feedback not found")
        );
      } else {
        mockedTx.feedback.findUniqueOrThrow.mockResolvedValue(mockRelations);
      }
      mockedTx.feedback.update.mockResolvedValue({});
      mockedTx.testScenario.update.mockResolvedValue({});
      mockedTx.feature.update.mockResolvedValue({});
      mockedTx.project.update.mockResolvedValue({});
      return await callback(mockedTx);
    });
  });
  const authHeader = { Authorization: "Bearer dummy-token" };
  // =================================================================
  // ==  TESTS FOR FIND FEEDBACK HISTORY DETAIL ==
  // =================================================================
  describe("GET /api/feedback-history/details/:id", () => {
    const mockFeedbackDetail = {
      id: 1,
      user_id: 1,
      description: "Test feedback",
      status: "open",
      priority: "low",
      user: { name: "Test User" },
      testScenario: { code: "TC-01", test_case: "Login test" },
      feature: { title: "Authentication" },
    };
    test("should return feedback details successfully with status 200", async () => {
      prisma.feedback.findUnique.mockResolvedValue(mockFeedbackDetail);
      const response = await request(app)
        .get("/api/feedback-history/details/1")
        .set(authHeader);
      expect(response.status).toBe(200);
      expect(response.body.payload.data).toEqual(mockFeedbackDetail);
      expect(prisma.feedback.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
    });
    test("should return 404 if feedback is not found", async () => {
      prisma.feedback.findUnique.mockResolvedValue(null);
      const response = await request(app)
        .get("/api/feedback-history/details/999")
        .set(authHeader);
      expect(response.status).toBe(404);
      expect(response.body.payload.message).toBe("Feedback not found!");
    });
  });
  // =================================================================
  // ==  TESTS FOR UPDATE FEEDBACK HISTORY DETAILS                  ==
  // =================================================================
  describe("PATCH /api/feedback-history/details/:id", () => {
    const fullUpdatePayload = {
      feedback_content: "Updated description",
      test_scenario_code: "TC-02",
      feature_title: "Updated Feature Title",
      project_priority: "high",
    };
    test("should update all related data successfully with status 200", async () => {
      const response = await request(app)
        .patch("/api/feedback-history/details/1")
        .set(authHeader)
        .send(fullUpdatePayload);
      expect(response.status).toBe(200);
      expect(response.body.payload.message).toBe(
        "Data terkait berhasil diperbarui"
      );
      expect(mockedTx.feedback.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { description: "Updated description" },
      });
      expect(mockedTx.testScenario.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { code: "TC-02" },
      });
      expect(mockedTx.feature.update).toHaveBeenCalledWith({
        where: { id: 20 },
        data: { title: "Updated Feature Title" },
      });
      expect(mockedTx.project.update).toHaveBeenCalledWith({
        where: { id: 30 },
        data: { priority: "high" },
      });
    });
    test("should return 400 for an invalid ID", async () => {
      const response = await request(app)
        .patch("/api/feedback-history/details/abc")
        .set(authHeader)
        .send(fullUpdatePayload);
      expect(response.status).toBe(400);
      expect(response.body.payload.message).toBe(
        "Invalid feedback history detail ID"
      );
    });
    test("should return 400 for invalid request body (Zod validation)", async () => {
      const response = await request(app)
        .patch("/api/feedback-history/details/1")
        .set(authHeader)
        .send({ feedback_content: 12345 });
      expect(response.status).toBe(400);
    });
    test("should return 500 if finding relations fails", async () => {
      shouldFailFindUnique = true;
      const response = await request(app)
        .patch("/api/feedback-history/details/1")
        .set(authHeader)
        .send(fullUpdatePayload);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Something went wrong!");
    });
  });
});
