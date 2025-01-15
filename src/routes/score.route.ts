import express, { Router } from "express";
import {
  assignScores,
  getScoresForTermAndSubject,
} from "../controllers/score.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router: Router = express.Router();

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

export default router;
