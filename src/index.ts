import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth/authRoutes";
import projectRoutes from "./routes/projects/projectRoutes";
import featureRoutes from "./routes/features/featureRoutes";
import scenarioRoutes from "./routes/scenarios/scenarioRoutes";
import feedbackRoutes from "./routes/feedbacks/feedbackRoutes";
import feedHistoryRoutes from "./routes/feedbacks/feedbackHistoryRoutes";
import feedHistoryDetailRoutes from "./routes/feedbacks/feedbackHistoryDetailRoutes";
import statisticRoutes from "./routes/dashboards/statisticRoutes";
import { authenticateToken } from "./utils/token";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", authRoutes);
app.use("/api", statisticRoutes);
app.use("/api", authenticateToken, feedHistoryDetailRoutes);
app.use("/api", authenticateToken, projectRoutes);
app.use("/api", authenticateToken, featureRoutes);
app.use("/api", authenticateToken, scenarioRoutes);
app.use("/api", authenticateToken, feedbackRoutes);
app.use("/api", authenticateToken, feedHistoryRoutes);

app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
