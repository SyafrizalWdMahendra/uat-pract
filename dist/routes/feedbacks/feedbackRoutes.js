import { Router } from "express";
import {
  createFeedback,
  deleteFeedbacks,
  getFeedbacks,
  updateFeedbacks,
} from "../../modules/feedbacks/controllers/feedbackController.js";
const router = Router();
router.post("/feedbacks", createFeedback);
router.get("/feedbacks", getFeedbacks);
router.patch("/feedbacks/:id", updateFeedbacks);
router.delete("/feedbacks/:id", deleteFeedbacks);
export default router;
