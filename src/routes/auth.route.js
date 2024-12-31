const express = require("express");
const {
  adminSignup,
  adminLogin,
  createTeacher,
  createStudent,
  teacherLogin,
  studentLogin,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

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
  authenticate(['admin', 'teacher']),
  createStudent
);

// Teacher and student routes
router.post("/teacher/login", teacherLogin);
router.post("/student/login", studentLogin);

module.exports = router;
