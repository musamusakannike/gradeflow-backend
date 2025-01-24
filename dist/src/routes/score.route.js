"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const score_controller_1 = require("../controllers/score.controller");
const router = express_1.default.Router();
// Route for teachers to assign scores
router.post("/assign", (0, auth_middleware_1.authenticate)("teacher"), // Only teachers can assign scores
score_controller_1.assignScores);
// Route for teachers to retrieve scores for a specific term and subject
router.get("/retrieve", (0, auth_middleware_1.authenticate)("teacher"), // Ensure only teachers can access
score_controller_1.getScoresForTermAndSubject);
exports.default = router;
//# sourceMappingURL=score.route.js.map