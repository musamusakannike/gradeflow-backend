import express, { Router } from "express";
import {
  adminSignup,
  adminLogin,
  createTeacher,
  createStudent,
  teacherLogin,
  studentLogin,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router: Router = express.Router();

// Admin routes
router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);
router.post(
  "/admin/create/teacher",
  authenticate("admin"),
  createTeacher
);
router.post(
  "/admin/create/student",
  authenticate(["admin", "teacher"]),
  createStudent
);

// Teacher and student routes
router.post("/teacher/login", teacherLogin);
router.post("/student/login", studentLogin);

export default router;
