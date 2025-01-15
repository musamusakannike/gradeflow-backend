import express, { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  getTeacherDashboardStats,
  getTeacherClasses,
} from "../controllers/teacher.controller";

const router: Router = express.Router();

router.get(
  "/dashboard/stats",
  authenticate("teacher"),
  getTeacherDashboardStats
);
router.get("/classes", authenticate("teacher"), getTeacherClasses);

export default router;
