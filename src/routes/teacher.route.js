const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { getTeacherDashboardStats } = require("../controllers/teacher.controller");

const router = express.Router();

router.get('/dashboard/stats', authenticate("teacher"), getTeacherDashboardStats);

module.exports = router;