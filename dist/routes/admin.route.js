"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Admin-only routes
router.get("/students/count", (0, auth_middleware_1.authenticate)("admin"), admin_controller_1.getTotalStudents);
router.get("/teachers/count", (0, auth_middleware_1.authenticate)("admin"), admin_controller_1.getTotalTeachers);
router.get("/classes/count", (0, auth_middleware_1.authenticate)("admin"), admin_controller_1.getTotalClasses);
router.get("/statistics", (0, auth_middleware_1.authenticate)("admin"), admin_controller_1.getStatistics);
router.delete("/delete-teacher/:teacherId", (0, auth_middleware_1.authenticate)("admin"), admin_controller_1.deleteTeacher);
// Get all teachers
router.get("/list-teachers", (0, auth_middleware_1.authenticate)("admin"), admin_controller_1.getAllTeachers);
// Get all students
router.get("/list-students", (0, auth_middleware_1.authenticate)("admin"), admin_controller_1.listStudentsBySchool);
exports.default = router;
//# sourceMappingURL=admin.route.js.map