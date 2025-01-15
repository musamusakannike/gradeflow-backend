import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.config";

import authRoutes from "./routes/auth.route";
import classRoutes from "./routes/class.route";
import subjectRoutes from "./routes/subject.route";
import scoreRoutes from "./routes/score.route";
import termRoutes from "./routes/term.route";
import adminRoutes from "./routes/admin.route";
import teacherRoutes from "./routes/teacher.route";
import studentRoutes from "./routes/student.route";

// Initialize the Express application
const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());

// Test server route
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "Welcome to the API",
    data: null,
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/class", classRoutes);
app.use("/api/v1/subject", subjectRoutes);
app.use("/api/v1/score", scoreRoutes);
app.use("/api/v1/term", termRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/student", studentRoutes);

export default app;
