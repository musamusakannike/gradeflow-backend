"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Admin routes
router.post("/admin/signup", auth_controller_1.adminSignup);
router.post("/admin/login", auth_controller_1.adminLogin);
router.post("/admin/create/teacher", (0, auth_middleware_1.authenticate)("admin"), auth_controller_1.createTeacher);
router.post("/admin/create/student", (0, auth_middleware_1.authenticate)(["admin", "teacher"]), auth_controller_1.createStudent);
// Teacher and student routes
router.post("/teacher/login", auth_controller_1.teacherLogin);
router.post("/student/login", auth_controller_1.studentLogin);
exports.default = router;
//# sourceMappingURL=auth.route.js.map