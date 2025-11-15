"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../../modules/dashboards/controllers/dashboardController");
const router = (0, express_1.Router)();
router.get("/dashboard/statistics", dashboardController_1.getDashboardStatistics);
router.get("/dashboard/currentProject", dashboardController_1.getDashboardCurrentProjects);
exports.default = router;
