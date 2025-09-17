import { Router } from "express";
import { getDashboardStatistics } from "../modules/dashboards/controllers/statistics";

const router = Router();

router.get("/statistics", getDashboardStatistics);
// router.get("/scenarios", getScenarios);
// router.patch("/scenarios/:id", updateScenarios);
// router.delete("/scenarios/:id", deleteScenarios);

export default router;
