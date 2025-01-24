"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessions = exports.toggleScoring = exports.createTerm = exports.createSession = void 0;
const term_model_1 = __importDefault(require("../models/term.model"));
const session_model_1 = __importDefault(require("../models/session.model"));
const term_validator_1 = require("../utils/term.validator");
// Create a new session
const createSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, term_validator_1.validateSessionSchema)(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        const { year } = req.body;
        const existingSession = yield session_model_1.default.findOne({ year });
        if (existingSession) {
            res.status(409).json({
                status: "error",
                message: "Session already exists",
                data: null,
            });
            return;
        }
        const session = yield session_model_1.default.create({ year });
        res.status(201).json({
            status: "success",
            message: "Session created successfully",
            data: session,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.createSession = createSession;
// Create a new term and associate it with a session
const createTerm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, term_validator_1.validateTermSchema)(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        const { name, sessionId } = req.body;
        const session = yield session_model_1.default.findById(sessionId);
        if (!session) {
            res.status(404).json({
                status: "error",
                message: "Session not found",
                data: null,
            });
            return;
        }
        const term = yield term_model_1.default.create({ name, sessionId });
        session.terms.push(term._id);
        yield session.save();
        res.status(201).json({
            status: "success",
            message: "Term created successfully",
            data: term,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.createTerm = createTerm;
// Enable or disable scoring for a term
const toggleScoring = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, term_validator_1.validateToggleScoringSchema)(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        const { termId, isScoringEnabled } = req.body;
        const term = yield term_model_1.default.findById(termId);
        if (!term) {
            res.status(404).json({
                status: "error",
                message: "Term not found",
                data: null,
            });
            return;
        }
        term.isScoringEnabled = isScoringEnabled;
        yield term.save();
        res.status(200).json({
            status: "success",
            message: `Scoring has been ${isScoringEnabled ? "enabled" : "disabled"}`,
            data: term,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.toggleScoring = toggleScoring;
// Get all sessions
const getSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessions = yield session_model_1.default.find().populate("terms");
        res.status(200).json({
            status: "success",
            message: "Sessions retrieved successfully",
            data: sessions,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.getSessions = getSessions;
//# sourceMappingURL=term.controller.js.map