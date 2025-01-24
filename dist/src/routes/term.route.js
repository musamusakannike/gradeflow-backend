"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const term_controller_1 = require("../controllers/term.controller");
const router = express_1.default.Router();
// Admin-only route to create a new session
router.post("/session", (0, auth_middleware_1.authenticate)("admin"), term_controller_1.createSession);
// Admin-only route to create a new term
router.post("/term", (0, auth_middleware_1.authenticate)("admin"), term_controller_1.createTerm);
// Admin-only route to toggle scoring for a term
router.patch("/toggle-scoring", (0, auth_middleware_1.authenticate)("admin"), term_controller_1.toggleScoring);
// Admin-only route to get all sessions
router.get("/sessions", (0, auth_middleware_1.authenticate)("admin"), term_controller_1.getSessions);
exports.default = router;
//# sourceMappingURL=term.route.js.map