const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { createSession, createTerm, toggleScoring, getSessions } = require("../controllers/term.controller");

const router = express.Router();

// Admin-only route to create a new session
router.post('/session', authenticate("admin"), createSession);

// Admin-only route to create a new term
router.post('/term', authenticate("admin"), createTerm);

// Admin-only route to toggle scoring for a term
router.patch('/toggle-scoring', authenticate("admin"), toggleScoring);

// Admin-only route to get all sessions
router.get('/sessions', authenticate("admin"), getSessions);

module.exports = router;