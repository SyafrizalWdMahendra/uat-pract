import { Router } from "express";
import { getFeedHistoryDetails } from "../modules/feedbacks/controllers/feedbackDetailController";

const router = Router();

router.get("/feedback-history/details/:id", getFeedHistoryDetails);

export default router;
