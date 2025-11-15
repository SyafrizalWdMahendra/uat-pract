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
        test("should return dashboard statistics successfully with status 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockStatistics = {
                activeProjects: 5,
                totalFeatures: 25,
                totalTestScenarios: 120,
            };
            client_1.prisma.project.count.mockResolvedValue(mockStatistics.activeProjects);
            client_1.prisma.feature.count.mockResolvedValue(mockStatistics.totalFeatures);
            client_1.prisma.testScenario.count.mockResolvedValue(mockStatistics.totalTestScenarios);
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/dashboard/statistics");
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Dashboard statistics successfully retrieved");
            expect(response.body.payload.data).toEqual(mockStatistics);
            expect(client_1.prisma.project.count).toHaveBeenCalledWith({
                where: { status: "active" },
            });
        }));
        test("should return 500 when a database error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockError = new Error("Database connection failed");
            client_1.prisma.project.count.mockRejectedValue(mockError);
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/dashboard/statistics");
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        }));
    });
    // =================================================================
    // ==  TESTS FOR GET DASHBOARD CURRENT PROJECTS                   ==
    // =================================================================
    describe("GET /api/dashboard/currentProject", () => {
        test("should return a SINGLE formatted current project successfully with status 200", () => __awaiter(void 0, void 0, void 0, function* () {
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
            client_1.prisma.project.findFirst.mockResolvedValue(mockProject);
            // --- PERBAIKAN ---
            // Mock 'count' HANYA SATU KALI
            client_1.prisma.testScenario.count.mockResolvedValueOnce(15);
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/dashboard/currentProject");
            expect(response.status).toBe(200);
            expect(response.body.payload.message).toBe("Current project successfully retrieved");
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
            expect(client_1.prisma.testScenario.count).toHaveBeenCalledTimes(1);
            expect(client_1.prisma.testScenario.count).toHaveBeenCalledWith({
                where: { feature: { project_id: 1 } },
            });
        }));
        test("should return 404 with null data when no active project is found", () => __awaiter(void 0, void 0, void 0, function* () {
            client_1.prisma.project.findFirst.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/dashboard/currentProject");
            expect(response.status).toBe(404);
            expect(response.body.payload.message).toBe("No active projects found");
            expect(response.body.payload.data).toBeNull();
            expect(client_1.prisma.testScenario.count).not.toHaveBeenCalled();
        }));
        test("should return 500 when a database error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockError = new Error("Database connection failed");
            client_1.prisma.project.findFirst.mockRejectedValue(mockError);
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/dashboard/currentProject");
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Something went wrong!",
            });
        }));
    });
});
