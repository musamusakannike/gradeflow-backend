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
exports.updateClass = exports.deleteClass = exports.listClassesWithTeachers = exports.listClassesForTeacher = exports.listStudentsInClass = exports.assignTeacherToClass = exports.createClass = void 0;
const admin_model_1 = __importDefault(require("../models/admin.model"));
const class_model_1 = __importDefault(require("../models/class.model"));
const teacher_model_1 = __importDefault(require("../models/teacher.model"));
const student_model_1 = __importDefault(require("../models/student.model"));
const class_validator_1 = require("../utils/class.validator");
// Create a new class
const createClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { error } = (0, class_validator_1.validateClassSchema)(req.body);
        if (error) {
            res.status(400).json({ status: "error", message: error.details[0].message, data: null });
            return;
        }
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
            res.status(403).json({ status: "error", message: "Forbidden: Only admins can create classes", data: null });
            return;
        }
        const { name, teacherId } = req.body;
        const admin = yield admin_model_1.default.findById(req.user.id);
        if (!admin) {
            res.status(404).json({ status: "error", message: "Admin not found", data: null });
            return;
        }
        const { schoolId } = admin;
        const teacher = yield teacher_model_1.default.findById(teacherId);
        if (!teacher) {
            res.status(404).json({ status: "error", message: "Teacher not found", data: null });
            return;
        }
        if (teacher.schoolId !== schoolId) {
            res.status(403).json({ status: "error", message: "Teacher not associated with the admin's school", data: null });
            return;
        }
        const existingClass = yield class_model_1.default.findOne({ name, teacher: teacherId });
        if (existingClass) {
            res.status(409).json({ status: "error", message: "A class with this name already exists for the teacher", data: null });
            return;
        }
        const newClass = yield class_model_1.default.create({ name, schoolId, teacher: teacherId });
        res.status(201).json({ status: "success", message: "Class created successfully", class: newClass });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error", data: null });
    }
});
exports.createClass = createClass;
// Assign a teacher to a class
const assignTeacherToClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, class_validator_1.validateAssignTeacherSchema)(req.body);
        if (error) {
            res.status(400).json({ status: "error", message: error.details[0].message, data: null });
            return;
        }
        const { id: userId, role } = req.user;
        const { classId, teacherId } = req.body;
        if (role !== "admin") {
            res.status(403).json({ status: "error", message: "Unauthorized action", data: null });
            return;
        }
        const admin = yield admin_model_1.default.findById(userId);
        if (!admin) {
            res.status(404).json({ status: "error", message: "Admin not found", data: null });
            return;
        }
        const teacher = yield teacher_model_1.default.findOne({ _id: teacherId, schoolId: admin.schoolId });
        if (!teacher) {
            res.status(404).json({ status: "error", message: "Teacher not found or does not belong to this school", data: null });
            return;
        }
        const studentClass = yield class_model_1.default.findOne({ _id: classId, schoolId: admin.schoolId });
        if (!studentClass) {
            res.status(404).json({ status: "error", message: "Class not found for the specified school", data: null });
            return;
        }
        studentClass.teacher = teacher._id;
        yield studentClass.save();
        res.status(200).json({ status: "success", message: "Teacher assigned to class successfully", data: { classId, teacherId } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error", data: null });
    }
});
exports.assignTeacherToClass = assignTeacherToClass;
// List students in a class
const listStudentsInClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, class_validator_1.validateListStudentsSchema)(req.query);
        if (error) {
            res.status(400).json({ status: "error", message: error.details[0].message, data: null });
            return;
        }
        const { classId, page = "1", limit = "10" } = req.query;
        const studentClass = yield class_model_1.default.findById(classId);
        if (!studentClass) {
            res.status(404).json({ status: "error", message: "Class not found", data: null });
            return;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const students = yield student_model_1.default.find({ classId }).skip(skip).limit(parseInt(limit)).sort({ fullName: 1 });
        const totalStudents = yield student_model_1.default.countDocuments({ classId });
        res.status(200).json({
            status: "success",
            message: "Students retrieved successfully",
            data: {
                students,
                pagination: {
                    totalStudents,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(totalStudents / parseInt(limit)),
                },
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error", data: null });
    }
});
exports.listStudentsInClass = listStudentsInClass;
// List classes for a teacher
const listClassesForTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { error } = (0, class_validator_1.validateListClassesForTeacherSchema)(req.query);
        if (error) {
            res.status(400).json({ status: "error", message: error.details[0].message, data: null });
            return;
        }
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "teacher" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "admin") {
            res.status(403).json({ status: "error", message: "Only teachers and admins can access this endpoint", data: null });
            return;
        }
        const { teacherId } = req.query;
        const teacher = yield teacher_model_1.default.findById(teacherId);
        if (!teacher) {
            res.status(404).json({ status: "error", message: "Teacher not found", data: null });
            return;
        }
        const classes = yield class_model_1.default.find({ teacher: teacherId }).sort({ name: 1 });
        const classesWithDetails = yield Promise.all(classes.map((classObj) => __awaiter(void 0, void 0, void 0, function* () {
            const studentCount = yield student_model_1.default.countDocuments({ classId: classObj._id });
            return Object.assign(Object.assign({}, classObj.toObject()), { studentCount });
        })));
        res.status(200).json({
            status: "success",
            message: "Classes retrieved successfully",
            data: classesWithDetails,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error", data: null });
    }
});
exports.listClassesForTeacher = listClassesForTeacher;
const listClassesWithTeachers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Query all classes and populate teacher details
        const classes = yield class_model_1.default.find()
            .populate("teacher", "fullName email") // Include teacher details
            .select("name teacher"); // Select specific fields
        res.status(200).json({
            status: "success",
            message: "Classes and their teachers retrieved successfully",
            data: classes,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.listClassesWithTeachers = listClassesWithTeachers;
// Delete a class
const deleteClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classId } = req.params;
        // Check if the class exists
        const existingClass = yield class_model_1.default.findById(classId);
        if (!existingClass) {
            res.status(404).json({
                status: "error",
                message: "Class not found",
                data: null,
            });
            return;
        }
        yield class_model_1.default.findByIdAndDelete(classId);
        res.status(200).json({
            status: "success",
            message: "Class deleted successfully",
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.deleteClass = deleteClass;
// Update a class
const updateClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classId } = req.params;
        const { name, teacherId } = req.body;
        // Check if the class exists
        const existingClass = yield class_model_1.default.findById(classId);
        if (!existingClass) {
            res.status(404).json({
                status: "error",
                message: "Class not found",
                data: null,
            });
            return; // Ensures the function stops execution
        }
        // Check if the teacher exists
        if (teacherId) {
            const teacherExists = yield teacher_model_1.default.findById(teacherId);
            if (!teacherExists) {
                res.status(404).json({
                    status: "error",
                    message: "Teacher not found",
                    data: null,
                });
                return; // Ensures the function stops execution
            }
        }
        // Update the class
        existingClass.name = name || existingClass.name;
        existingClass.teacher = teacherId || existingClass.teacher;
        yield existingClass.save();
        res.status(200).json({
            status: "success",
            message: "Class updated successfully",
            data: existingClass,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.updateClass = updateClass;
//# sourceMappingURL=class.controller.js.map