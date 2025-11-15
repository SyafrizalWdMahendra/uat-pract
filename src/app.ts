import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth/authRoutes.js";
import projectRoutes from "./routes/projects/projectRoutes.js";
import featureRoutes from "./routes/features/featureRoutes.js";
import scenarioRoutes from "./routes/scenarios/scenarioRoutes.js";
import feedbackRoutes from "./routes/feedbacks/feedbackRoutes.js";
import feedHistoryRoutes from "./routes/feedbacks/feedbackHistoryRoutes.js";
import feedHistoryDetailRoutes from "./routes/feedbacks/feedbackHistoryDetailRoutes.js";
import dashboardRoutes from "./routes/dashboards/dashboardRoutes.js";
import { authenticateToken } from "./utils/token.js";
import { ZodError } from "zod";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),

    DEBUG_JWT_SECRET_SNIPPET: process.env.JWT_SECRET
      ? process.env.JWT_SECRET.substring(0, 4) +
        "..." +
        process.env.JWT_SECRET.slice(-4)
      : "!! JWT_SECRET TIDAK DITEMUKAN !!",
  });
});

app.get("/api/debug-env", (req, res) => {
  res.json({
    message: "Membaca env vars...",
    jwt_secret_snippet: process.env.JWT_SECRET
      ? process.env.JWT_SECRET.substring(0, 4) +
        "..." +
        process.env.JWT_SECRET.slice(-4)
      : "!! TIDAK DISET !!",
  });
});

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/api", authRoutes);
app.use("/api", authenticateToken, dashboardRoutes);
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

  next();
});

export default app;
