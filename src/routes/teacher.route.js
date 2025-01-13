const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { getTeacherDashboardStats,getTeacherClasses } = require("../controllers/teacher.controller");

const router = express.Router();

router.get('/dashboard/stats', authenticate("teacher"), getTeacherDashboardStats);
router.get('/classes', authenticate("teacher"), getTeacherClasses);

module.exports = router;