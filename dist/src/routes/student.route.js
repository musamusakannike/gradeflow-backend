"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const student_controller_1 = require("../controllers/student.controller");
const router = express_1.default.Router();
// Update a student's details
router.patch("/:studentId", (0, auth_middleware_1.authenticate)(["admin", "teacher"]), student_controller_1.updateStudent);
exports.default = router;
//# sourceMappingURL=student.route.js.map