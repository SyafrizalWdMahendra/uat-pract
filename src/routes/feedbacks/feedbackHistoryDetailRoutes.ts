import { Router } from "express";
import {
  getFeedHistoryDetails,
  updateFeedHistoryDetails,
} from "../../modules/feedbacks/controllers/feedbackHistoryDetailController.js";

const router = Router();

router.get("/feedback-history/details/:id", getFeedHistoryDetails);
router.patch("/feedback-history/details/:id", updateFeedHistoryDetails);

export default router;
