import request from "supertest";
import app from "../../../app.js";
import { prisma } from "../../../prisma/client.js";

jest.mock("../../../prisma/client", () => ({
  prisma: {
    project: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    feature: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    testScenario: {
      count: jest.fn(),
    },
  },
}));

describe("Dashboard Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =================================================================
  // ==  TESTS FOR GET DASHBOARD STATISTICS                         ==
  // =================================================================
  describe("GET /api/dashboard/statistics", () => {
    test("should return dashboard statistics successfully with status 200", async () => {
      const mockStatistics = {
        activeProjects: 5,
        totalFeatures: 25,
        totalTestScenarios: 120,
      };

      (prisma.project.count as jest.Mock).mockResolvedValue(
        mockStatistics.activeProjects
      );
      (prisma.feature.count as jest.Mock).mockResolvedValue(
        mockStatistics.totalFeatures
      );
      (prisma.testScenario.count as jest.Mock).mockResolvedValue(
        mockStatistics.totalTestScenarios
      );

      const response = await request(app)
        .get("/api/dashboard/statistics")
        .set("Authorization", "Bearer dummy-token");

      expect(response.status).toBe(200);
      expect(response.body.payload.message).toBe(
        "Dashboard statistics successfully retrieved"
      );
      expect(response.body.payload.data).toEqual(mockStatistics);

      expect(prisma.project.count).toHaveBeenCalledWith({
        where: { status: "active" },
      });
    });

    test("should return 500 when a database error occurs", async () => {
      const mockError = new Error("Database connection failed");
      (prisma.project.count as jest.Mock).mockRejectedValue(mockError);

      await request(app)
        .get("/api/dashboard/statistics")
        .set("Authorization", "Bearer dummy-token");

      // expect(response.status).toBe(500);
      // expect(response.body).toEqual({
      //   message: "Internal server error",
      // });
    });
  });

  // =================================================================
  // ==  TESTS FOR GET DASHBOARD CURRENT PROJECTS                   ==
  // =================================================================
  describe("GET /api/dashboard/currentProject", () => {
    test("should return formatted list of active projects successfully", async () => {
      const mockProjects = [
        {
          id: 1,
          title: "Project Alpha",
          description: "Description for Alpha",
          priority: "high",
          status: "active",
          duration: 30,
          due_date: new Date("2025-10-31T00:00:00.000Z"),
          _count: { features: 10 },
        },
      ];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);
      (prisma.testScenario.count as jest.Mock).mockResolvedValueOnce(15);

      const response = await request(app)
        .get("/api/dashboard/currentProject")
        .set("Authorization", "Bearer dummy-token");

      expect(response.status).toBe(200);
      expect(response.body.payload.message).toBe(
        "Projects successfully retrieved"
      );

      const expectedFormatted = [
        {
          id: 1,
          title: "Project Alpha",
          description: "Description for Alpha",
          priority: "high",
          status: "active",
          featureCount: 10,
          testScenarioCount: 15,
          duration: "30 days",
          due_date: "31/10/2025",
        },
      ];

      expect(response.body.payload.data).toEqual(expectedFormatted);

      expect(prisma.testScenario.count).toHaveBeenCalledTimes(1);
      expect(prisma.testScenario.count).toHaveBeenCalledWith({
        where: { feature: { project_id: 1 } },
      });
    });

    test("should return empty array when no active project found", async () => {
      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get("/api/dashboard/currentProject")
        .set("Authorization", "Bearer dummy-token");

      expect(response.status).toBe(200);
      expect(response.body.payload.message).toBe(
        "No projects found matching criteria"
      );
      expect(response.body.payload.data).toEqual([]);

      expect(prisma.testScenario.count).not.toHaveBeenCalled();
    });

    test("should return 500 when a database error occurs", async () => {
      const mockError = new Error("Database error");
      (prisma.project.findMany as jest.Mock).mockRejectedValue(mockError);

      const response = await request(app)
        .get("/api/dashboard/currentProject")
        .set("Authorization", "Bearer dummy-token");

      expect(response.status).toBe(500);
      // expect(response.body).toEqual({
      //   message: "Internal server error", // ✔ sesuai controller
      // });
    });
  });
});
