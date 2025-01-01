const express = require("express");
const { assignScores, getScoresForTermAndSubject } = require("../controllers/score.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// Route for teachers to assign scores
router.post(
  "/assign",
  authenticate("teacher"), // Only teachers can assign scores
  assignScores
);

// Route for teachers to retrieve scores for a specific term and subject
router.get(
  "/retrieve",
  authenticate("teacher"), // Ensure only teachers can access
  getScoresForTermAndSubject
);

module.exports = router;
