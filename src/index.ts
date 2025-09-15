import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import featureRoutes from "./routes/featureRoutes";
import scenarioRoutes from "./routes/scenarioRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import feedHistoryRoutes from "./routes/feedbackHistoryRoutes";
import feedHistoryDetailRoutes from "./routes/feedbackHistoryDetailRoutes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const authenticateToken = require("./utils/token");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", authRoutes);
app.use("/api", authenticateToken, feedHistoryDetailRoutes);
app.use("/api", authenticateToken, projectRoutes);
app.use("/api", authenticateToken, featureRoutes);
app.use("/api", authenticateToken, scenarioRoutes);
app.use("/api", authenticateToken, feedbackRoutes);
app.use("/api", authenticateToken, feedHistoryRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
