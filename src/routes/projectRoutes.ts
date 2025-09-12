import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  updateProject,
} from "../modules/projects/controllers/projectControllers";

const router = Router();

router.post("/projects", createProject);
router.get("/projects", getProject);
router.patch("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

export default router;
