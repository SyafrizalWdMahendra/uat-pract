import { Router } from "express";
import {
  getDashboardStatistics,
  getDashboardCurrentProjects,
} from "../modules/dashboards/controllers/statistics";

const router = Router();

router.get("/dashboard/statistics", getDashboardStatistics);
router.get("/dashboard/currentProject", getDashboardCurrentProjects);
// router.get("/scenarios", getScenarios);
// router.patch("/scenarios/:id", updateScenarios);
// router.delete("/scenarios/:id", deleteScenarios);

export default router;
