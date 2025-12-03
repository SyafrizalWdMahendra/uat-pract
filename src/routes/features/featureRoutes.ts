import { Router } from "express";
import {
  createFeature,
  getFeatures,
  updateFeatures,
  deleteFeatures,
} from "../../modules/features/controllers/featureControllers.js";

const router = Router();

router.post("/features", createFeature);
router.get("/features", getFeatures);
router.patch("/features/:id", updateFeatures);
router.delete("/features/:id", deleteFeatures);

export default router;
