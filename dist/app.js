"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/auth/authRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projects/projectRoutes"));
const featureRoutes_1 = __importDefault(require("./routes/features/featureRoutes"));
const scenarioRoutes_1 = __importDefault(require("./routes/scenarios/scenarioRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbacks/feedbackRoutes"));
const feedbackHistoryRoutes_1 = __importDefault(require("./routes/feedbacks/feedbackHistoryRoutes"));
const feedbackHistoryDetailRoutes_1 = __importDefault(require("./routes/feedbacks/feedbackHistoryDetailRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboards/dashboardRoutes"));
const token_1 = require("./utils/token");
const zod_1 = require("zod");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api", authRoutes_1.default);
app.use("/api", dashboardRoutes_1.default);
app.use("/api", token_1.authenticateToken, feedbackHistoryDetailRoutes_1.default);
app.use("/api", token_1.authenticateToken, projectRoutes_1.default);
app.use("/api", token_1.authenticateToken, featureRoutes_1.default);
app.use("/api", token_1.authenticateToken, scenarioRoutes_1.default);
app.use("/api", token_1.authenticateToken, feedbackRoutes_1.default);
app.use("/api", token_1.authenticateToken, feedbackHistoryRoutes_1.default);
app.use((err, req, res, next) => {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            status: "error",
            message: "Invalid request data",
            errors: err.issues.map((e) => ({
                path: e.path.join("."),
                message: e.message,
            })),
        });
    }
    if (process.env.NODE_ENV !== "test") {
        console.error("ERROR:", err.stack);
    }
    res.status(500).json({ message: "Something went wrong!" });
    next();
});
exports.default = app;
