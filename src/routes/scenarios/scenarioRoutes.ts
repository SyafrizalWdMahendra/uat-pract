import { Router } from "express";
import {
  createScenarios,
  deleteScenarios,
  getScenarioDocs,
  getScenarios,
  updateScenarios,
} from "../../modules/scenarios/controllers/scenarioControllers.js";

const router = Router();

router.post("/scenarios", createScenarios);
router.get("/scenarios", getScenarios);
router.get("/scenarioDocs/:id", getScenarioDocs);
router.patch("/scenarios/:id", updateScenarios);
router.delete("/scenarios/:id", deleteScenarios);

export default router;
