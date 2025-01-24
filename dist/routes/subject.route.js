"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subject_controller_1 = require("../controllers/subject.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Admin-only route to create a subject
router.post("/create", (0, auth_middleware_1.authenticate)("admin"), // Ensure only admins can perform this action
subject_controller_1.createSubject);
// Student route to join a subject
router.post("/join", (0, auth_middleware_1.authenticate)("student"), // Only authenticated students can join
subject_controller_1.joinSubject);
// Student route to leave a subject
router.post("/leave", (0, auth_middleware_1.authenticate)("student"), // Only authenticated students can leave
subject_controller_1.leaveSubject);
// Route for students to view their enrolled subjects
router.get("/my-subjects", (0, auth_middleware_1.authenticate)("student"), // Ensure only authenticated students can access
subject_controller_1.viewEnrolledSubjects);
// Route for teachers to view students in their subjects
router.get("/students", (0, auth_middleware_1.authenticate)("teacher"), // Ensure only authenticated teachers can access
subject_controller_1.viewStudentsInSubjects);
// Route to toggle subject join permission by admin and teacher
router.patch("/toggle-join-permission", (0, auth_middleware_1.authenticate)(["admin", "teacher"]), // Ensure only authenticated admins can access
subject_controller_1.toggleSubjectJoinPermission);
// Admin-only bulk action to toggle join permissions for multiple subjects
router.patch("/toggle-join-permissions-bulk", (0, auth_middleware_1.authenticate)("admin"), // Ensure only admins can access
subject_controller_1.toggleJoinPermissionsBulk);
// Route for teachers to add a student to a subject
router.post("/add-student", (0, auth_middleware_1.authenticate)("teacher"), // Only authenticated teachers can access
subject_controller_1.addStudentToSubject);
// Route for teachers to remove a student from a subject
router.post("/remove-student", (0, auth_middleware_1.authenticate)("teacher"), // Only authenticated teachers can access
subject_controller_1.removeStudentFromSubject);
// Route for teachers to view their assigned subjects
router.get("/teacher/subjects", (0, auth_middleware_1.authenticate)("teacher"), subject_controller_1.getSubjectsForTeacher);
// Get all subjects with class and teacher details (admin only)
router.get("/list", (0, auth_middleware_1.authenticate)("admin"), subject_controller_1.getAllSubjects);
// Admin-only route to delete a subject
router.delete("/delete/:subjectId", // Pass subjectId as a parameter
(0, auth_middleware_1.authenticate)("admin"), // Ensure only admins can delete
subject_controller_1.deleteSubject);
// Admin and teacher route to edit subject details
router.patch("/edit/:subjectId", // Pass subjectId as a parameter
(0, auth_middleware_1.authenticate)(["admin", "teacher"]), // Ensure only admins or teachers can edit
subject_controller_1.editSubjectDetails);
exports.default = router;
//# sourceMappingURL=subject.route.js.map