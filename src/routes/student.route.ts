import express, { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { updateStudent } from "../controllers/student.controller";
const router: Router = express.Router();

// Update a student's details
router.patch("/:studentId", authenticate(["admin", "teacher"]), updateStudent);

export default router;
