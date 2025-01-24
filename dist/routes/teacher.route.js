"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const teacher_controller_1 = require("../controllers/teacher.controller");
const router = express_1.default.Router();
router.get("/dashboard/stats", (0, auth_middleware_1.authenticate)("teacher"), teacher_controller_1.getTeacherDashboardStats);
router.get("/classes", (0, auth_middleware_1.authenticate)("teacher"), teacher_controller_1.getTeacherClasses);
exports.default = router;
//# sourceMappingURL=teacher.route.js.map