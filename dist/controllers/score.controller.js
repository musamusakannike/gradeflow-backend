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
exports.getScoresForTermAndSubject = exports.assignScores = void 0;
const mongodb_1 = require("mongodb");
const score_model_1 = __importDefault(require("../models/score.model"));
const term_model_1 = __importDefault(require("../models/term.model"));
const subject_model_1 = __importDefault(require("../models/subject.model"));
const score_validator_1 = require("../utils/score.validator");
// Assign scores to students
const assignScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Validate request body
        const { error } = (0, score_validator_1.validateAssignScoresSchema)(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        const teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated teacher
        if (!teacherId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
                data: null,
            });
            return;
        }
        const { subjectId, termId, scores } = req.body;
        // Ensure the subject exists and is assigned to the teacher
        const subject = yield subject_model_1.default.findOne({
            _id: new mongodb_1.ObjectId(subjectId),
            teacherId,
        });
        if (!subject) {
            res.status(404).json({
                status: "error",
                message: "Subject not found or you are not authorized to manage this subject",
                data: null,
            });
            return;
        }
        // Ensure the term exists and scoring is enabled
        const term = yield term_model_1.default.findById(termId);
        if (!term || !term.isScoringEnabled) {
            res.status(403).json({
                status: "error",
                message: "Scoring is not enabled for this term",
                data: null,
            });
            return;
        }
        // Save scores for each student
        const savedScores = [];
        for (const scoreData of scores) {
            const { studentId, test1, test2, exam } = scoreData;
            // Find existing score record or create a new one
            let score = yield score_model_1.default.findOne({
                studentId: new mongodb_1.ObjectId(studentId),
                subjectId: new mongodb_1.ObjectId(subjectId),
                termId: new mongodb_1.ObjectId(termId),
            });
            if (!score) {
                score = new score_model_1.default({
                    studentId: new mongodb_1.ObjectId(studentId),
                    subjectId: new mongodb_1.ObjectId(subjectId),
                    termId: new mongodb_1.ObjectId(termId),
                });
            }
            // Update only the fields that are provided
            if (test1 !== undefined)
                score.test1 = test1;
            if (test2 !== undefined)
                score.test2 = test2;
            if (exam !== undefined)
                score.exam = exam;
            yield score.save();
            savedScores.push(score);
        }
        res.status(200).json({
            status: "success",
            message: "Scores assigned successfully",
            data: savedScores,
        });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
        return;
    }
});
exports.assignScores = assignScores;
// Retrieve scores for a specific term and subject
const getScoresForTermAndSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Validate request query parameters
        const { error } = (0, score_validator_1.validateGetScoresSchema)(req.query);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        const teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated teacher
        if (!teacherId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
                data: null,
            });
            return;
        }
        const { subjectId, termId } = req.query;
        // Ensure the subject exists and is assigned to the teacher
        const subject = yield subject_model_1.default.findOne({
            _id: new mongodb_1.ObjectId(subjectId),
            teacherId,
        });
        if (!subject) {
            res.status(404).json({
                status: "error",
                message: "Subject not found or you are not authorized to manage this subject",
                data: null,
            });
            return;
        }
        // Retrieve scores for the specific term and subject
        const scores = yield score_model_1.default.find({
            subjectId: new mongodb_1.ObjectId(subjectId),
            termId: new mongodb_1.ObjectId(termId),
        })
            .populate("studentId", "fullName email studentId") // Populate student details
            .select("studentId test1 test2 exam"); // Select specific fields
        res.status(200).json({
            status: "success",
            message: "Scores retrieved successfully",
            data: scores,
        });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
        return;
    }
});
exports.getScoresForTermAndSubject = getScoresForTermAndSubject;
//# sourceMappingURL=score.controller.js.map