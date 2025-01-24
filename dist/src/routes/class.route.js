"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const class_controller_1 = require("../controllers/class.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Admin-only routes
router.post("/create", (0, auth_middleware_1.authenticate)(["admin", "teacher"]), class_controller_1.createClass);
// Route to assign a teacher to a class
router.post("/assign-teacher", (0, auth_middleware_1.authenticate)("admin"), class_controller_1.assignTeacherToClass);
// Route to list all students in a class
router.get("/list-students", (0, auth_middleware_1.authenticate)(["admin", "teacher"]), class_controller_1.listStudentsInClass);
// Route to list all classes assigned to a teacher
router.get("/teacher-classes", (0, auth_middleware_1.authenticate)(["admin", "teacher"]), class_controller_1.listClassesForTeacher);
// Route to list all classes with their assigned teachers
router.get("/list-classes", (0, auth_middleware_1.authenticate)(["admin", "teacher"]), // Allow admins and teachers to access
class_controller_1.listClassesWithTeachers);
// Delete a class
router.delete("/:classId", (0, auth_middleware_1.authenticate)("admin"), class_controller_1.deleteClass);
// Update a class
router.patch("/:classId", (0, auth_middleware_1.authenticate)("admin"), class_controller_1.updateClass);
exports.default = router;
//# sourceMappingURL=class.route.js.map