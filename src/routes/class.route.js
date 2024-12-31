const express = require("express");
const { createClass, assignTeacherToClass, listStudentsInClass, listClassesForTeacher } = require("../controllers/class.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// Admin-only routes
router.post("/create", authenticate(["admin", "teacher"]), createClass);

// Route to assign a teacher to a class
router.post(
  "/assign-teacher",
  authenticate("admin"),
  assignTeacherToClass
);

// Route to list all students in a class
router.get(
  '/list-students',
  authenticate(['admin', 'teacher']),
  listStudentsInClass
);

// Route to list all classes assigned to a teacher
router.get(
  '/teacher-classes',
  authenticate(['admin', 'teacher']),
  listClassesForTeacher
);

module.exports = router;
