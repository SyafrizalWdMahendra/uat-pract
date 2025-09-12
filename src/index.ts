import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import featureRoutes from "./routes/featureRoutes";
import scenarioRoutes from "./routes/scenarioRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import feedHistoryRoutes from "./routes/feedbackHistoryRoutes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", authRoutes);
app.use("/api", projectRoutes);
app.use("/api", featureRoutes);
app.use("/api", scenarioRoutes);
app.use("/api", feedbackRoutes);
app.use("/api", feedHistoryRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
