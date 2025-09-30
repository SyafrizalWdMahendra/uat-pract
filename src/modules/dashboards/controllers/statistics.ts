// import { Request, Response } from "express";
// const prisma = require("../../../prisma/client");
// const responses = require("../../../utils/responses");

// const getDashboardStatistics = async (req: Request, res: Response) => {
//   try {
//     const projects = await prisma.project.findMany({
//       include: {
//         features: {
//           include: {
//             testScenarios: {
//               select: {
//                 status: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (projects.length === 0) {
//       return responses(res, 200, "Statistics retrieved", {
//         averageProgress: 0,
//       });
//     }

//     const projectProgressList = projects.map((project: { features: any[] }) => {
//       let totalScenarios = 0;
//       let passedScenarios = 0;

//       project.features.forEach((feature) => {
//         totalScenarios += feature.testScenarios.length;
//         const passedCount = feature.testScenarios.filter(
//           (scenario: { status: string }) => scenario.status === "passed"
//         ).length;
//         passedScenarios += passedCount;
//       });

//       if (totalScenarios === 0) {
//         return 0;
//       }

//       return (passedScenarios / totalScenarios) * 100;
//     });

//     const totalProgressSum = projectProgressList.reduce(
//       (sum: any, current: any) => sum + current,
//       0
//     );
//     const averageProgress = totalProgressSum / projects.length;

//     const [activeProjects, totalFeatures, totalTestScenarios] =
//       await Promise.all([
//         prisma.project.count({ where: { status: "active" } }),
//         prisma.feature.count(),
//         prisma.testScenario.count(),
//       ]);

//     const statistics = {
//       activeProjects,
//       totalFeatures,
//       totalTestScenarios,
//       averageProgress: Math.round(averageProgress),
//     };

//     return responses(
//       res,
//       200,
//       "Dashboard statistics successfully retrieved",
//       statistics
//     );
//   } catch (error) {
//     console.error("Failed to get dashboard statistics:", error);
//     return responses(res, 500, "Internal server error");
//   }
// };

// const getDashboardCurrentProjects = async (req: Request, res: Response) => {
//   try {
//     const projects = await prisma.project.findMany({
//       include: {
//         features: {
//           include: {
//             testScenarios: true,
//           },
//         },
//       },
//     });

//     const projectsWithCounts = projects.map(
//       (project: { [x: string]: any; features: any }) => {
//         const featureCount = project.features.length;

//         const testScenarioCount = project.features.reduce(
//           (total: any, feature: { testScenarios: string | any[] }) => {
//             return total + feature.testScenarios.length;
//           },
//           0
//         );

//         const { features, ...projectData } = project;

//         return {
//           ...projectData,
//           featureCount,
//           testScenarioCount,
//         };
//       }
//     );

//     return responses(
//       res,
//       200,
//       "Current projects successfully retrieved",
//       projectsWithCounts
//     );
//   } catch (error) {
//     console.error("Failed to get current projects:", error);
//     return responses(res, 500, "Internal server error");
//   }
// };

// export { getDashboardStatistics, getDashboardCurrentProjects };

// src/modules/dashboards/controllers/statistics.ts

import { Request, Response } from "express";
const prisma = require("../../../prisma/client");
const responses = require("../../../utils/responses");

/**
 * MENGAMBIL STATISTIK UTAMA DASBOR (VERSI OPTIMAL)
 *
 * Perubahan:
 * 1. Menghapus `findMany` yang berat: Tidak ada lagi pengambilan semua data proyek,
 * fitur, dan skenario ke dalam memori.
 * 2. Menggunakan Agregasi Database: Semua perhitungan (`COUNT`) dilakukan langsung
 * di database, yang jauh lebih cepat dan efisien.
 * 3. Kueri Paralel: Semua permintaan `count` dijalankan secara bersamaan
 * menggunakan `Promise.all` untuk waktu respons yang lebih cepat.
 */
const getDashboardStatistics = async (req: Request, res: Response) => {
  try {
    // Jalankan semua kueri agregasi secara paralel
    const [
      activeProjects,
      totalFeatures,
      totalTestScenarios,
      passedScenariosCount, // Langsung hitung skenario yang "passed"
    ] = await Promise.all([
      prisma.project.count({ where: { status: "active" } }),
      prisma.feature.count(),
      prisma.testScenario.count(),
      prisma.testScenario.count({ where: { status: "passed" } }),
    ]);

    // Kalkulasi rata-rata progres langsung dari hasil agregasi
    const averageProgress =
      totalTestScenarios > 0
        ? (passedScenariosCount / totalTestScenarios) * 100
        : 0;

    const statistics = {
      activeProjects,
      totalFeatures,
      totalTestScenarios,
      // Pembulatan hasil untuk response yang bersih
      averageProgress: Math.round(averageProgress),
    };

    return responses(
      res,
      200,
      "Dashboard statistics successfully retrieved",
      statistics
    );
  } catch (error) {
    console.error("Failed to get dashboard statistics:", error);
    // Mengirim pesan error yang lebih aman ke klien
    return responses(res, 500, "Terjadi kesalahan pada server");
  }
};

/**
 * MENGAMBIL DAFTAR PROYEK SAAT INI DENGAN JUMLAH RELASI (VERSI OPTIMAL)
 *
 * Perubahan:
 * 1. Menggunakan `_count`: Alih-alih mengambil semua relasi (features, testScenarios)
 * hanya untuk menghitung panjang array-nya, kita gunakan `_count` dari Prisma.
 * 2. Efisiensi Data: Ini membuat Prisma secara otomatis melakukan subquery yang
 * efisien untuk mendapatkan jumlah relasi tanpa harus mengirim semua data
 * relasi tersebut ke aplikasi.
 */
const getDashboardCurrentProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        duration: true,
        start_date: true,
        due_date: true,
        _count: {
          select: {
            features: true,
          },
        },
      },
    });

    const projectsWithScenarioCounts = await Promise.all(
      projects.map(
        async (project: {
          id: any;
          title: any;
          description: any;
          priority: any;
          status: any;
          duration: any;
          due_date: any;
          _count: { features: any };
        }) => {
          const scenarioCount = await prisma.testScenario.count({
            where: {
              feature: {
                project_id: project.id,
              },
            },
          });

          const dueDate = new Date(project.due_date);

          const day = String(dueDate.getDate()).padStart(2, "0");
          const month = String(dueDate.getMonth() + 1).padStart(2, "0");
          const year = dueDate.getFullYear();

          const formattedDueDate = `${day}/${month}/${year}`;

          return {
            id: project.id,
            title: project.title,
            description: project.description,
            priority: project.priority,
            status: project.status,
            featureCount: project._count.features,
            testScenarioCount: scenarioCount,
            duration: project.duration ? `${project.duration} days` : null,
            due_date: formattedDueDate,
          };
        }
      )
    );

    return responses(
      res,
      200,
      "Current projects successfully retrieved",
      projectsWithScenarioCounts
    );
  } catch (error) {
    console.error("Failed to get current projects:", error);
    return responses(res, 500, "Terjadi kesalahan pada server");
  }
};

export { getDashboardStatistics, getDashboardCurrentProjects };
