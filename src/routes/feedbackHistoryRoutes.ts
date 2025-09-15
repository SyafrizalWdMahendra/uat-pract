import { Router } from "express";
import {
  searchFeedbackHistory,
  getFeedbackHistory,
} from "../modules/feedbacks/controllers/feedbackHistoryControllers";

const router = Router();

router.get("/feedback-history/search", searchFeedbackHistory);
router.get("/feedback-history", getFeedbackHistory);

export default router;
