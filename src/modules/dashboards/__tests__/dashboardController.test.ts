import request from "supertest";
import app from "../../../app.js";
import { prisma } from "../../../prisma/client.js";

jest.mock("../../../prisma/client", () => ({
  prisma: {
    project: {
      count: jest.fn(),
      findFirst: jest.fn(),
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
    test("should return a SINGLE formatted current project successfully with status 200", async () => {
      // --- PERBAIKAN ---
      // Mock data adalah SATU OBJEK, bukan array
      const mockProject = {
        id: 1,
        title: "Project Alpha",
        description: "Description for Alpha",
        priority: "high",
        status: "In Progress", // Sesuaikan dengan 'where' di controller
        duration: 30,
        start_date: new Date("2025-10-01T00:00:00.000Z"),
        due_date: new Date("2025-10-31T00:00:00.000Z"),
        _count: { features: 10 },
      };

      // --- PERBAIKAN ---
      // Mock 'findFirst' untuk mengembalikan satu objek
      (prisma.project.findFirst as jest.Mock).mockResolvedValue(mockProject);

      // --- PERBAIKAN ---
      // Mock 'count' HANYA SATU KALI
      (prisma.testScenario.count as jest.Mock).mockResolvedValueOnce(15);

      const response = await request(app).get("/api/dashboard/currentProject");

      expect(response.status).toBe(200);
      expect(response.body.payload.message).toBe(
        "Current project successfully retrieved"
      );

      // --- PERBAIKAN ---
      // Ekspektasi adalah SATU OBJEK, bukan array
      const expectedFormattedProject = {
        id: 1,
        title: "Project Alpha",
        description: "Description for Alpha",
        priority: "high",
        status: "In Progress",
        featureCount: 10,
        testScenarioCount: 15,
        duration: "30 days",
        due_date: "31/10/2025", // Controller memformat ini
      };

      // Cek bahwa data adalah objek yang sesuai
      expect(response.body.payload.data).toEqual(expectedFormattedProject);

      // --- PERBAIKAN ---
      // Pastikan 'count' HANYA dipanggil 1 KALI
      expect(prisma.testScenario.count).toHaveBeenCalledTimes(1);
      expect(prisma.testScenario.count).toHaveBeenCalledWith({
        where: { feature: { project_id: 1 } },
      });
    });

    test("should return 404 with null data when no active project is found", async () => {
      (prisma.project.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/api/dashboard/currentProject");

      expect(response.status).toBe(404);

      expect(response.body.payload.message).toBe("No active projects found");
      expect(response.body.payload.data).toBeNull();

      expect(prisma.testScenario.count).not.toHaveBeenCalled();
    });

    test("should return 500 when a database error occurs", async () => {
      const mockError = new Error("Database connection failed");
      (prisma.project.findFirst as jest.Mock).mockRejectedValue(mockError);

      const response = await request(app).get("/api/dashboard/currentProject");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Something went wrong!",
      });
    });
  });
});
