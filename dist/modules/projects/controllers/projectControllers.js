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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectInformation = exports.deleteProject = exports.updateProject = exports.getProject = exports.createProject = void 0;
const projectDto_1 = require("../dto/projectDto");
const responses_1 = require("../../../utils/responses");
const client_1 = require("../../../prisma/client");
const scenarioDocsDto_1 = require("../../scenarios/dto/scenarioDocsDto.");
const formatDate = (date) => {
    if (!date)
        return null;
    const d = new Date(date);
    if (isNaN(d.getTime()))
        return null;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = projectDto_1.projectSchema.parse(req.body);
    const scenarioDocsValidation = scenarioDocsDto_1.scenarioDocsSchema.parse(req.body);
    const start = new Date(parsed.start_date);
    const due = new Date(parsed.due_date);
    const duration = Math.ceil((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const { manager_id, test_lead_id } = parsed, projectData = __rest(parsed, ["manager_id", "test_lead_id"]);
    const [manager, testLead] = yield Promise.all([
        client_1.prisma.user.findUnique({ where: { id: manager_id } }),
        client_1.prisma.user.findUnique({ where: { id: test_lead_id } }),
    ]);
    if (!manager || manager.role !== "manager") {
        return (0, responses_1.responses)(res, 400, "Manager ID tidak valid atau bukan seorang Manager.", null);
    }
    else if (!testLead || testLead.role !== "test_lead") {
        return (0, responses_1.responses)(res, 400, "Test Lead ID tidak valid atau bukan seorang Test Lead.", null);
    }
    const createdProject = yield client_1.prisma.project.create({
        data: {
            manager: { connect: { id: manager.id } },
            testLead: { connect: { id: testLead.id } },
            title: projectData.title,
            description: projectData.description,
            priority: projectData.priority,
            status: projectData.status,
            start_date: start,
            due_date: due,
            duration: Number(duration) || null,
        },
    });
    const scenarioDocs = yield client_1.prisma.testScenarioDocs.create({
        data: {
            project_id: createdProject.id,
            doc_url: scenarioDocsValidation.doc_url,
        },
    });
    return (0, responses_1.responses)(res, 201, "Project created successfully", {
        project: [createdProject],
        scenarioDocsInfo: scenarioDocs,
    });
});
exports.createProject = createProject;
const getProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projects = yield client_1.prisma.project.findMany();
    return (0, responses_1.responses)(res, 200, "Project successfully retrivied", projects);
});
exports.getProject = getProject;
const updateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = Number(req.params.id);
    const parsed = projectDto_1.projectSchema.parse(req.body);
    const scenarioDocsValidation = scenarioDocsDto_1.scenarioDocsSchema.parse(req.body);
    const start = parsed.start_date ? new Date(parsed.start_date) : null;
    const due = parsed.due_date ? new Date(parsed.due_date) : null;
    let duration = null;
    if (start && due && !isNaN(start.getTime()) && !isNaN(due.getTime())) {
        duration = Math.ceil((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    const { manager_id, test_lead_id } = parsed, projectData = __rest(parsed, ["manager_id", "test_lead_id"]);
    const [manager, testLead] = yield Promise.all([
        client_1.prisma.user.findUnique({ where: { id: manager_id } }),
        client_1.prisma.user.findUnique({ where: { id: test_lead_id } }),
    ]);
    if (!manager || manager.role !== "manager") {
        return (0, responses_1.responses)(res, 400, "Manager ID tidak valid atau bukan seorang Manager.", null);
    }
    if (!testLead || testLead.role !== "test_lead") {
        return (0, responses_1.responses)(res, 400, "Test Lead ID tidak valid atau bukan seorang Test Lead.", null);
    }
    const [updatedProject, scenarioDocResult] = yield client_1.prisma.$transaction([
        client_1.prisma.project.update({
            where: { id: projectId },
            data: {
                manager: { connect: { id: manager.id } },
                testLead: { connect: { id: testLead.id } },
                title: projectData.title,
                description: projectData.description,
                priority: projectData.priority,
                status: projectData.status,
                duration: duration,
            },
        }),
        client_1.prisma.testScenarioDocs.upsert({
            where: {
                project_id: projectId,
            },
            update: {
                doc_url: scenarioDocsValidation.doc_url,
            },
            create: {
                project_id: projectId,
                doc_url: scenarioDocsValidation.doc_url,
            },
        }),
    ]);
    return (0, responses_1.responses)(res, 200, "Project updated successfully", {
        project: updatedProject,
        scenarioDocs: scenarioDocResult,
    });
});
exports.updateProject = updateProject;
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = Number(req.params.id);
    if (isNaN(projectId)) {
        return (0, responses_1.responses)(res, 400, "Project ID tidak valid.", null);
    }
    yield client_1.prisma.$transaction([
        client_1.prisma.feedback.deleteMany({
            where: { project_id: projectId },
        }),
        client_1.prisma.testScenarioDocs.deleteMany({
            where: { project_id: projectId },
        }),
        client_1.prisma.feature.deleteMany({
            where: { project_id: projectId },
        }),
        client_1.prisma.project.delete({
            where: { id: projectId },
        }),
    ]);
    return (0, responses_1.responses)(res, 200, "Project berhasil dihapus.", null);
});
exports.deleteProject = deleteProject;
const getProjectInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = Number(req.params.id);
    const project = yield client_1.prisma.project.findUnique({
        where: { id: projectId },
        select: {
            id: true,
            manager_id: true,
            test_lead_id: true,
            title: true,
            description: true,
            priority: true,
            status: true,
            start_date: true,
            due_date: true,
            duration: true,
            manager: { select: { name: true, role: true } },
            testLead: { select: { name: true, role: true } },
            features: {
                include: { testScenarios: true },
            },
        },
    });
    if (!project) {
        return (0, responses_1.responses)(res, 404, "Project not found", null);
    }
    const formattedProject = Object.assign(Object.assign({}, project), { start_date: formatDate(project.start_date), due_date: formatDate(project.due_date) });
    const featureCount = project.features.length;
    const testScenarioCount = project.features.reduce((total, feature) => total + feature.testScenarios.length, 0);
    const projectData = __rest(formattedProject, []);
    const responseData = Object.assign(Object.assign({}, projectData), { featureCount,
        testScenarioCount });
    return (0, responses_1.responses)(res, 200, "Project successfully retrieved", responseData);
});
exports.getProjectInformation = getProjectInformation;
