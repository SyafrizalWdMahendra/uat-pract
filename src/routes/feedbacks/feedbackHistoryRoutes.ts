import { Router } from "express";
import {
  searchFeedbackHistory,
  getFeedbackHistory,
  getFeedbackHistoryById,
  deleteFeedbackHistory,
} from "../../modules/feedbacks/controllers/feedbackHistoryControllers";

const router = Router();

router.get("/feedback-history/search", searchFeedbackHistory);
router.get("/feedback-history/:id", getFeedbackHistoryById);
router.get("/feedback-history", getFeedbackHistory);
router.delete("/feedback-history/:id", deleteFeedbackHistory);

export default router;
