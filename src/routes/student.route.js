const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { updateStudent } = require("../controllers/student.controller");
const router = express.Router();

// Update a student's details
router.patch("/:studentId", authenticate(["admin", "teacher"]), updateStudent);

module.exports = router;
