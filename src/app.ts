import express, { NextFunction, Request, Response } from "express";
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
import { ZodError } from "zod";
dotenv.config();

const app = express();

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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
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
});

export default app;
