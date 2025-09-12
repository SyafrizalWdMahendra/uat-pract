import { Router } from "express";
import { searchFeedbackHistory } from "../modules/feedbacks/controllers/feedbackHistoryControllers";

const router = Router();

router.get("/feedback-history/search", searchFeedbackHistory);

export default router;
