const Term = require("../models/term.model");
const Session = require("../models/session.model");
const {
  validateSessionSchema,
  validateTermSchema,
  validateToggleScoringSchema,
} = require("../utils/term.validator");

// Create a new session
const createSession = async (req, res) => {
  try {
    const { error } = validateSessionSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    // Extract session year from request body
    const { year } = req.body;

    // Check if session already exists
    const existingSession = await Session.findOne({ year });
    if (existingSession) {
      return res.status(409).json({
        status: "error",
        message: "Session already exists",
        data: null,
      });
    }

    const session = await Session.create({ year });
    res.status(201).json({
      status: "success",
      message: "Session created successfully",
      data: session,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

// Create a new term and associate it with a session
const createTerm = async (req, res) => {
  try {
    const { error } = validateTermSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    const { name, sessionId } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Session not found",
        data: null,
      });
    }

    const term = await Term.create({ name, sessionId });
    session.terms.push(term._id);
    await session.save();

    res.status(201).json({
      status: "success",
      message: "Term created successfully",
      data: term,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

// Enable or disable scoring for a term
const toggleScoring = async (req, res) => {
  try {
    const { error } = validateToggleScoringSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    const { termId, isScoringEnabled } = req.body;

    const term = await Term.findById(termId);
    if (!term) {
      return res.status(404).json({
        status: "error",
        message: "Term not found",
        data: null,
      });
    }

    term.isScoringEnabled = isScoringEnabled;
    await term.save();

    res.status(200).json({
      status: "success",
      message: `Scoring has been ${isScoringEnabled ? "enabled" : "disabled"}`,
      data: term,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = { createSession, createTerm, toggleScoring };
