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
exports.getTeacherClasses = exports.getTeacherDashboardStats = void 0;
const mongoose_1 = require("mongoose");
const teacher_model_1 = __importDefault(require("../models/teacher.model"));
const subject_model_1 = __importDefault(require("../models/subject.model"));
const class_model_1 = __importDefault(require("../models/class.model"));
const student_model_1 = __importDefault(require("../models/student.model"));
// Get teacher dashboard statistics
const getTeacherDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!teacherId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
                data: null,
            });
            return;
        }
        const teacher = yield teacher_model_1.default.findById(teacherId).select("fullName email teacherId");
        if (!teacher) {
            res.status(404).json({
                status: "error",
                message: "Teacher not found",
                data: null,
            });
            return;
        }
        const subjects = yield subject_model_1.default.find({ teacherId })
            .populate("classId", "name") // Correctly typed `populate`
            .select("name classId");
        const totalSubjects = subjects.length;
        // Extract unique class IDs
        const uniqueClassIds = [
            ...new Set(subjects.map((subject) => subject.classId._id.toString())),
        ];
        // Fetch details of all unique classes
        const classes = yield class_model_1.default.find({ _id: { $in: uniqueClassIds } }).select("name");
        const totalClasses = classes.length;
        res.status(200).json({
            status: "success",
            message: "Teacher dashboard statistics retrieved successfully",
            data: {
                teacherDetails: teacher,
                totalSubjects,
                totalClasses,
                subjects: subjects.map((subject) => ({
                    subjectName: subject.name,
                    className: subject.classId.name,
                })),
                classes: classes.map((cls) => ({
                    classId: cls._id,
                    className: cls.name,
                })),
            },
        });
    }
    catch (err) {
        console.error("Error retrieving teacher dashboard statistics:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.getTeacherDashboardStats = getTeacherDashboardStats;
// Get all classes assigned to a teacher
const getTeacherClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
            return;
        }
        const teacher = yield teacher_model_1.default.findById(userId);
        if (!teacher) {
            res.status(404).json({
                status: "error",
                message: "Teacher not found",
            });
            return;
        }
        const classes = yield class_model_1.default.find({
            teacher: teacher._id,
        }).populate({
            path: "subjects",
            model: subject_model_1.default,
            select: "name allowStudentAddition",
        });
        const classIds = classes.map((cls) => cls._id.toString());
        const students = yield student_model_1.default.find({
            classId: { $in: classIds.map((id) => new mongoose_1.Types.ObjectId(id)) },
        });
        const formattedClasses = classes.map((cls) => ({
            _id: cls._id.toString(),
            name: cls.name,
            subjects: cls.subjects.map((subj) => ({
                name: subj.name,
                allowStudentAddition: subj.allowStudentAddition,
            })),
            totalStudents: students.filter((student) => student.classId.toString() === cls._id.toString()).length,
        }));
        res.status(200).json({
            status: "success",
            message: "Teacher classes retrieved successfully",
            data: formattedClasses,
        });
    }
    catch (err) {
        console.error("Error retrieving teacher classes:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});
exports.getTeacherClasses = getTeacherClasses;
//# sourceMappingURL=teacher.controller.js.map