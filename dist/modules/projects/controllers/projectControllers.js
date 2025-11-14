import { projectSchema } from "../dto/projectDto.js";
import { responses } from "../../../utils/responses.js";
import { prisma } from "../../../prisma/client.js";
import { scenarioDocsSchema } from "../../scenarios/dto/scenarioDocsDto..js";
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
const createProject = async (req, res) => {
    const parsed = projectSchema.parse(req.body);
    const scenarioDocsValidation = scenarioDocsSchema.parse(req.body);
    const start = new Date(parsed.start_date);
    const due = new Date(parsed.due_date);
    const duration = Math.ceil((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const { manager_id, test_lead_id, ...projectData } = parsed;
    const [manager, testLead] = await Promise.all([
        prisma.user.findUnique({ where: { id: manager_id } }),
        prisma.user.findUnique({ where: { id: test_lead_id } }),
    ]);
    if (!manager || manager.role !== "manager") {
        return responses(res, 400, "Manager ID tidak valid atau bukan seorang Manager.", null);
    }
    else if (!testLead || testLead.role !== "test_lead") {
        return responses(res, 400, "Test Lead ID tidak valid atau bukan seorang Test Lead.", null);
    }
    const createdProject = await prisma.project.create({
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
    const scenarioDocs = await prisma.testScenarioDocs.create({
        data: {
            project_id: createdProject.id,
            doc_url: scenarioDocsValidation.doc_url,
        },
    });
    return responses(res, 201, "Project created successfully", {
        project: [createdProject],
        scenarioDocsInfo: scenarioDocs,
    });
};
const getProject = async (req, res) => {
    const projects = await prisma.project.findMany();
    return responses(res, 200, "Project successfully retrivied", projects);
};
const updateProject = async (req, res) => {
    const projectId = Number(req.params.id);
    const parsed = projectSchema.parse(req.body);
    const scenarioDocsValidation = scenarioDocsSchema.parse(req.body);
    const start = parsed.start_date ? new Date(parsed.start_date) : null;
    const due = parsed.due_date ? new Date(parsed.due_date) : null;
    let duration = null;
    if (start && due && !isNaN(start.getTime()) && !isNaN(due.getTime())) {
        duration = Math.ceil((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    const { manager_id, test_lead_id, ...projectData } = parsed;
    const [manager, testLead] = await Promise.all([
        prisma.user.findUnique({ where: { id: manager_id } }),
        prisma.user.findUnique({ where: { id: test_lead_id } }),
    ]);
    if (!manager || manager.role !== "manager") {
        return responses(res, 400, "Manager ID tidak valid atau bukan seorang Manager.", null);
    }
    if (!testLead || testLead.role !== "test_lead") {
        return responses(res, 400, "Test Lead ID tidak valid atau bukan seorang Test Lead.", null);
    }
    const [updatedProject, scenarioDocResult] = await prisma.$transaction([
        prisma.project.update({
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
        prisma.testScenarioDocs.upsert({
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
    return responses(res, 200, "Project updated successfully", {
        project: updatedProject,
        scenarioDocs: scenarioDocResult,
    });
};
const deleteProject = async (req, res) => {
    const projectId = Number(req.params.id);
    if (isNaN(projectId)) {
        return responses(res, 400, "Project ID tidak valid.", null);
    }
    await prisma.$transaction([
        prisma.feedback.deleteMany({
            where: { project_id: projectId },
        }),
        prisma.testScenarioDocs.deleteMany({
            where: { project_id: projectId },
        }),
        prisma.feature.deleteMany({
            where: { project_id: projectId },
        }),
        prisma.project.delete({
            where: { id: projectId },
        }),
    ]);
    return responses(res, 200, "Project berhasil dihapus.", null);
};
const getProjectInformation = async (req, res) => {
    const projectId = Number(req.params.id);
    const project = await prisma.project.findUnique({
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
        return responses(res, 404, "Project not found", null);
    }
    const formattedProject = {
        ...project,
        start_date: formatDate(project.start_date),
        due_date: formatDate(project.due_date),
    };
    const featureCount = project.features.length;
    const testScenarioCount = project.features.reduce((total, feature) => total + feature.testScenarios.length, 0);
    const { ...projectData } = formattedProject;
    const responseData = {
        ...projectData,
        featureCount,
        testScenarioCount,
    };
    return responses(res, 200, "Project successfully retrieved", responseData);
};
export { createProject, getProject, updateProject, deleteProject, getProjectInformation, };
