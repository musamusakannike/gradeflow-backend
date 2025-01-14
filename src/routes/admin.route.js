const express = require("express");
const {
  getTotalStudents,
  getTotalTeachers,
  getTotalClasses,
  getStatistics,
  getAllTeachers,
  deleteTeacher,
  listStudentsBySchool,
} = require("../controllers/admin.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// Admin-only routes
router.get("/students/count", authenticate("admin"), getTotalStudents);
router.get("/teachers/count", authenticate("admin"), getTotalTeachers);
router.get("/classes/count", authenticate("admin"), getTotalClasses);
router.get("/statistics", authenticate("admin"), getStatistics);
router.delete(
  "/delete-teacher/:teacherId",
  authenticate("admin"),
  deleteTeacher
);

// Get all teachers
router.get("/list-teachers", authenticate("admin"), getAllTeachers);

// Get all students
router.get("/list-students", authenticate("admin"), listStudentsBySchool);

module.exports = router;
