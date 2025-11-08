"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedbackHistoryDetailController_1 = require("../../modules/feedbacks/controllers/feedbackHistoryDetailController");
const router = (0, express_1.Router)();
router.get("/feedback-history/details/:id", feedbackHistoryDetailController_1.getFeedHistoryDetails);
router.patch("/feedback-history/details/:id", feedbackHistoryDetailController_1.updateFeedHistoryDetails);
exports.default = router;
