const express = require("express");
const {
  getTotalStudents,
  getTotalTeachers,
  getTotalClasses,
  getStatistics,
  getAllTeachers,
} = require("../controllers/admin.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// Admin-only routes
router.get("/students/count", authenticate("admin"), getTotalStudents);
router.get("/teachers/count", authenticate("admin"), getTotalTeachers);
router.get("/classes/count", authenticate("admin"), getTotalClasses);
router.get('/statistics', authenticate('admin'), getStatistics);

// Get all teachers
router.get("/list-teachers", authenticate("admin"), getAllTeachers);



module.exports = router;
