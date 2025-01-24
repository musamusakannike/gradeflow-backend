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
exports.listStudentsBySchool = exports.deleteTeacher = exports.getAllTeachers = exports.getStatistics = exports.getTotalClasses = exports.getTotalTeachers = exports.getTotalStudents = void 0;
const student_model_1 = __importDefault(require("../models/student.model"));
const teacher_model_1 = __importDefault(require("../models/teacher.model"));
const class_model_1 = __importDefault(require("../models/class.model"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const subject_model_1 = __importDefault(require("../models/subject.model"));
// Get total number of students
const getTotalStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: userId } = req.user;
        if (!userId) {
            res.status(401).json({ status: "error", message: "Unauthorized" });
            return;
        }
        const admin = yield admin_model_1.default.findById(userId);
        if (!admin) {
            res.status(404).json({ status: "error", message: "Admin not found" });
            return;
        }
        const totalStudents = yield student_model_1.default.countDocuments({
            schoolId: admin.schoolId,
        });
        res.status(200).json({ status: "success", data: { totalStudents } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.getTotalStudents = getTotalStudents;
// Get total number of teachers
const getTotalTeachers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: userId } = req.user;
        if (!userId) {
            res.status(401).json({ status: "error", message: "Unauthorized" });
            return;
        }
        const admin = yield admin_model_1.default.findById(userId);
        if (!admin) {
            res.status(404).json({ status: "error", message: "Admin not found" });
            return;
        }
        const totalTeachers = yield teacher_model_1.default.countDocuments({
            schoolId: admin.schoolId,
        });
        res.status(200).json({ status: "success", data: { totalTeachers } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.getTotalTeachers = getTotalTeachers;
// Get total number of classes
const getTotalClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: userId } = req.user;
        if (!userId) {
            res.status(401).json({ status: "error", message: "Unauthorized" });
            return;
        }
        const admin = yield admin_model_1.default.findById(userId);
        if (!admin) {
            res.status(404).json({ status: "error", message: "Admin not found" });
            return;
        }
        const totalClasses = yield class_model_1.default.countDocuments({
            schoolId: admin.schoolId,
        });
        res.status(200).json({ status: "success", data: { totalClasses } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.getTotalClasses = getTotalClasses;
// Get overall statistics
const getStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: userId } = req.user;
        if (!userId) {
            res.status(401).json({ status: "error", message: "Unauthorized" });
            return;
        }
        const admin = yield admin_model_1.default.findById(userId);
        if (!admin) {
            res.status(404).json({ status: "error", message: "Admin not found" });
            return;
        }
        const totalStudents = yield student_model_1.default.countDocuments({
            schoolId: admin.schoolId,
        });
        const totalTeachers = yield teacher_model_1.default.countDocuments({
            schoolId: admin.schoolId,
        });
        const totalClasses = yield class_model_1.default.countDocuments({
            schoolId: admin.schoolId,
        });
        res.status(200).json({
            status: "success",
            data: {
                totalStudents,
                totalTeachers,
                totalClasses,
                schoolId: admin.schoolId,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.getStatistics = getStatistics;
// Get a list of all teachers
const getAllTeachers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teachers = yield teacher_model_1.default.find({}, "fullName email teacherId");
        res.status(200).json({
            status: "success",
            message: "Teachers retrieved successfully",
            data: teachers,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.getAllTeachers = getAllTeachers;
// Delete a teacher
const deleteTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherId } = req.params;
        if (!teacherId) {
            res
                .status(400)
                .json({ status: "error", message: "Teacher ID is required" });
            return;
        }
        const assignedClass = yield class_model_1.default.findOne({ teacher: teacherId });
        if (assignedClass) {
            res.status(400).json({
                status: "error",
                message: `Teacher is assigned to class ${assignedClass.name}. Please reassign or remove the teacher before deletion.`,
            });
            return;
        }
        const assignedSubject = yield subject_model_1.default.findOne({ teacherId });
        if (assignedSubject) {
            res.status(400).json({
                status: "error",
                message: `Teacher is assigned to subject ${assignedSubject.name}. Please reassign or remove the teacher before deletion.`,
            });
            return;
        }
        const deletedTeacher = yield teacher_model_1.default.findByIdAndDelete(teacherId);
        if (!deletedTeacher) {
            res.status(404).json({ status: "error", message: "Teacher not found" });
            return;
        }
        res.status(200).json({
            status: "success",
            message: "Teacher deleted successfully",
        });
    }
    catch (err) {
        console.error("Error deleting teacher:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.deleteTeacher = deleteTeacher;
// List all students by school
const listStudentsBySchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: adminId } = req.user;
        const admin = yield admin_model_1.default.findById(adminId);
        if (!admin) {
            res.status(404).json({ status: "error", message: "Admin not found" });
            return;
        }
        const students = yield student_model_1.default.find({ schoolId: admin.schoolId })
            .populate("classId", "name")
            .select("fullName studentId email classId");
        res.status(200).json({
            status: "success",
            message: "Students retrieved successfully",
            data: students,
        });
    }
    catch (err) {
        console.error("Error fetching students:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.listStudentsBySchool = listStudentsBySchool;
//# sourceMappingURL=admin.controller.js.map