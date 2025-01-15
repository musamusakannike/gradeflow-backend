import express, { Router } from "express";
import {
  createClass,
  assignTeacherToClass,
  listStudentsInClass,
  listClassesForTeacher,
  listClassesWithTeachers,
  deleteClass,
  updateClass
} from "../controllers/class.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router: Router = express.Router();

// Admin-only routes
router.post("/create", authenticate(["admin", "teacher"]), createClass);

// Route to assign a teacher to a class
router.post("/assign-teacher", authenticate("admin"), assignTeacherToClass);

// Route to list all students in a class
router.get(
  "/list-students",
  authenticate(["admin", "teacher"]),
  listStudentsInClass
);

// Route to list all classes assigned to a teacher
router.get(
  "/teacher-classes",
  authenticate(["admin", "teacher"]),
  listClassesForTeacher
);

// Route to list all classes with their assigned teachers
router.get(
  "/list-classes",
  authenticate(["admin", "teacher"]), // Allow admins and teachers to access
  listClassesWithTeachers
);

// Delete a class
router.delete("/:classId", authenticate("admin"), deleteClass);

// Update a class
router.patch("/:classId", authenticate("admin"), updateClass);

export default router;
