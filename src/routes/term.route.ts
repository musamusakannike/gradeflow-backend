import express, { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createSession,
  createTerm,
  toggleScoring,
  getSessions,
} from "../controllers/term.controller";

const router: Router = express.Router();

// Admin-only route to create a new session
router.post("/session", authenticate("admin"), createSession);

// Admin-only route to create a new term
router.post("/term", authenticate("admin"), createTerm);

// Admin-only route to toggle scoring for a term
router.patch("/toggle-scoring", authenticate("admin"), toggleScoring);

// Admin-only route to get all sessions
router.get("/sessions", authenticate("admin"), getSessions);

export default router;
