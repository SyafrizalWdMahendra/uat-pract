import request from "supertest";
import app from "../../../app";
import { prisma } from "../../../prisma/client";

jest.mock("../../../prisma/client", () => ({
  prisma: {
    project: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    feature: {
      count: jest.fn(),
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

      const response = await request(app).get("/api/dashboard/statistics");

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

      const response = await request(app).get("/api/dashboard/statistics");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Something went wrong!",
      });
    });
  });

  // =================================================================
  // ==  TESTS FOR GET DASHBOARD CURRENT PROJECTS                   ==
  // =================================================================
  describe("GET /api/dashboard/currentProject", () => {
    test("should return formatted current projects successfully with status 200", async () => {
      const mockProjects = [
        {
          id: 1,
          title: "Project Alpha",
          description: "Description for Alpha",
          priority: "high",
          status: "active",
          duration: 30,
          start_date: new Date("2025-10-01T00:00:00.000Z"),
          due_date: new Date("2025-10-31T00:00:00.000Z"),
          _count: { features: 10 },
        },
        {
          id: 2,
          title: "Project Beta",
          description: "Description for Beta",
          priority: "medium",
          status: "pending",
          duration: null,
          start_date: new Date("2025-11-01T00:00:00.000Z"),
          due_date: new Date("2025-12-05T00:00:00.000Z"),
          _count: { features: 5 },
        },
      ];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      (prisma.testScenario.count as jest.Mock)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(8);

      const response = await request(app).get("/api/dashboard/currentProject");

      expect(response.status).toBe(200);
      expect(response.body.payload.message).toBe(
        "Current projects successfully retrieved"
      );

      const expectedFormattedProjects = [
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
        {
          id: 2,
          title: "Project Beta",
          description: "Description for Beta",
          priority: "medium",
          status: "pending",
          featureCount: 5,
          testScenarioCount: 8,
          duration: null,
          due_date: "05/12/2025",
        },
      ];

      expect(response.body.payload.data).toEqual(expectedFormattedProjects);

      expect(prisma.testScenario.count).toHaveBeenCalledTimes(2);
      expect(prisma.testScenario.count).toHaveBeenCalledWith({
        where: { feature: { project_id: 1 } },
      });
      expect(prisma.testScenario.count).toHaveBeenCalledWith({
        where: { feature: { project_id: 2 } },
      });
    });

    test("should return 500 when a database error occurs", async () => {
      const mockError = new Error("Database connection failed");
      (prisma.project.findMany as jest.Mock).mockRejectedValue(mockError);

      const response = await request(app).get("/api/dashboard/currentProject");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Something went wrong!",
      });
    });
  });
});
