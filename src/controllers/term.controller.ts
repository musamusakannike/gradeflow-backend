import { Request, Response } from "express";
import Term from "../models/term.model";
import Session from "../models/session.model";
import {
  validateSessionSchema,
  validateTermSchema,
  validateToggleScoringSchema,
} from "../utils/term.validator";
import { Types } from "mongoose";

// Define interfaces for request bodies
interface CreateSessionBody {
  year: string;
}

interface CreateTermBody {
  name: string;
  sessionId: string;
}

interface ToggleScoringBody {
  termId: string;
  isScoringEnabled: boolean;
}

// Create a new session
export const createSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateSessionSchema(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }

    const { year } = req.body as CreateSessionBody;

    const existingSession = await Session.findOne({ year });
    if (existingSession) {
      res.status(409).json({
        status: "error",
        message: "Session already exists",
        data: null,
      });
      return;
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
export const createTerm = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateTermSchema(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }

    const { name, sessionId } = req.body as CreateTermBody;

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({
        status: "error",
        message: "Session not found",
        data: null,
      });
      return;
    }

    const term = await Term.create({ name, sessionId });
    session.terms.push(term._id as Types.ObjectId);
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
export const toggleScoring = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateToggleScoringSchema(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }

    const { termId, isScoringEnabled } = req.body as ToggleScoringBody;

    const term = await Term.findById(termId);
    if (!term) {
      res.status(404).json({
        status: "error",
        message: "Term not found",
        data: null,
      });
      return;
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

// Get all sessions
export const getSessions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessions = await Session.find().populate("terms");
    res.status(200).json({
      status: "success",
      message: "Sessions retrieved successfully",
      data: sessions,
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
