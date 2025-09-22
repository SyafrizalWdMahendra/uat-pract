import { Router } from "express";
import {
  createScenarios,
  deleteScenarios,
  getScenarios,
  updateScenarios,
} from "../../modules/scenarios/controllers/scenarioControllers";

const router = Router();

router.post("/scenarios", createScenarios);
router.get("/scenarios", getScenarios);
router.patch("/scenarios/:id", updateScenarios);
router.delete("/scenarios/:id", deleteScenarios);

export default router;
