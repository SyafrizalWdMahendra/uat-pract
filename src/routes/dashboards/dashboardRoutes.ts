import { Router } from "express";
import {
  getDashboardStatistics,
  getDashboardCurrentProjects,
} from "../../modules/dashboards/controllers/dashboardController.js";

const router = Router();

router.get("/dashboard/statistics", getDashboardStatistics);
router.get("/dashboard/currentProject", getDashboardCurrentProjects);

export default router;
