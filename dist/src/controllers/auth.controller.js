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
exports.studentLogin = exports.teacherLogin = exports.createStudent = exports.createTeacher = exports.adminLogin = exports.adminSignup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const school_model_1 = __importDefault(require("../models/school.model"));
const teacher_model_1 = __importDefault(require("../models/teacher.model"));
const student_model_1 = __importDefault(require("../models/student.model"));
const class_model_1 = __importDefault(require("../models/class.model"));
const idGenerator_1 = require("../utils/idGenerator");
const auth_validator_1 = require("../utils/auth.validator");
// Admin Signup
const adminSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, auth_validator_1.validateAdminSignupSchema)(req.body);
        if (error) {
            res
                .status(400)
                .json({ status: "error", message: error.details[0].message });
            return;
        }
        const { fullName, schoolName, adminEmail, schoolEmail, schoolAddress, password, } = req.body;
        const existingAdmin = yield admin_model_1.default.findOne({ adminEmail });
        if (existingAdmin) {
            res
                .status(409)
                .json({
                status: "error",
                message: "Admin with this email already exists",
            });
            return;
        }
        const existingSchool = yield school_model_1.default.findOne({ schoolEmail });
        if (existingSchool) {
            res
                .status(409)
                .json({
                status: "error",
                message: "School with this email already exists",
            });
            return;
        }
        const schoolId = (0, idGenerator_1.generateUniqueId)("SCH");
        const admin = yield admin_model_1.default.create({
            fullName,
            schoolName,
            adminEmail,
            schoolEmail,
            schoolAddress,
            password,
            schoolId,
        });
        yield school_model_1.default.create({
            name: schoolName,
            address: schoolAddress,
            schoolId,
            admin: admin._id,
        });
        res
            .status(201)
            .json({ message: "Admin and school created successfully", schoolId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.adminSignup = adminSignup;
// Admin Login
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, auth_validator_1.validateAdminLoginSchema)(req.body);
        if (error) {
            res
                .status(400)
                .json({ status: "error", message: error.details[0].message });
            return;
        }
        const { adminEmail, password } = req.body;
        const admin = yield admin_model_1.default.findOne({ adminEmail });
        if (!admin) {
            res.status(404).json({ message: "Admin not found" });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, admin.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.json({ message: "Login successful", token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.adminLogin = adminLogin;
// Create Teacher
const createTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { error } = (0, auth_validator_1.validateCreateTeacherSchema)(req.body);
        if (error) {
            res
                .status(400)
                .json({ status: "error", message: error.details[0].message });
            return;
        }
        const admin = yield admin_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!admin) {
            res.status(404).json({ status: "error", message: "Admin not found" });
            return;
        }
        const { fullName, email, password } = req.body;
        const existingTeacher = yield teacher_model_1.default.findOne({ email });
        if (existingTeacher) {
            res
                .status(409)
                .json({
                status: "error",
                message: "A teacher with this email already exists",
            });
            return;
        }
        const teacherId = (0, idGenerator_1.generateUniqueId)("TCH");
        const newTeacher = yield teacher_model_1.default.create({
            fullName,
            teacherId,
            schoolId: admin.schoolId,
            email,
            password,
        });
        res
            .status(201)
            .json({
            status: "success",
            message: "Teacher created successfully",
            data: newTeacher,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.createTeacher = createTeacher;
// Create Student
const createStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, auth_validator_1.validateCreateStudentSchema)(req.body);
        if (error) {
            res
                .status(400)
                .json({ status: "error", message: error.details[0].message });
            return;
        }
        const { id: userId, role } = req.user;
        let schoolId;
        let userRoleBasedId;
        if (role === "admin") {
            const admin = yield admin_model_1.default.findById(userId);
            if (!admin) {
                res.status(404).json({ status: "error", message: "Admin not found" });
                return;
            }
            schoolId = admin.schoolId;
            userRoleBasedId = "admin";
        }
        else if (role === "teacher") {
            const teacher = yield teacher_model_1.default.findById(userId);
            if (!teacher) {
                res.status(404).json({ status: "error", message: "Teacher not found" });
                return;
            }
            schoolId = teacher.schoolId;
            userRoleBasedId = teacher.teacherId;
        }
        else {
            res.status(403).json({ status: "error", message: "Unauthorized action" });
            return;
        }
        const { fullName, email, password, classId } = req.body;
        const studentClass = yield class_model_1.default.findOne({ _id: classId, schoolId });
        if (!studentClass) {
            res
                .status(404)
                .json({
                status: "error",
                message: "Class not found for the specified school",
            });
            return;
        }
        const studentId = (0, idGenerator_1.generateUniqueId)("STD");
        const newStudent = yield student_model_1.default.create({
            fullName,
            email,
            schoolId,
            studentId,
            password,
            classId,
            createdBy: userRoleBasedId,
        });
        res.status(201).json({
            status: "success",
            message: "Student created successfully",
            data: {
                studentId,
                fullName,
                email,
                classId,
                schoolId,
                createdBy: userRoleBasedId,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.createStudent = createStudent;
// Teacher Login
const teacherLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, auth_validator_1.validateTeacherLoginSchema)(req.body);
        if (error) {
            res
                .status(400)
                .json({ status: "error", message: error.details[0].message });
            return;
        }
        const { teacherId, password, schoolId } = req.body;
        const teacher = yield teacher_model_1.default.findOne({ teacherId, schoolId });
        if (!teacher) {
            res.status(404).json({ status: "error", message: "Teacher not found" });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, teacher.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: teacher._id, role: "teacher" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ message: "Login successful", token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.teacherLogin = teacherLogin;
// Student Login
const studentLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, auth_validator_1.validateStudentLoginSchema)(req.body);
        if (error) {
            res
                .status(400)
                .json({ status: "error", message: error.details[0].message });
            return;
        }
        const { studentId, password, schoolId } = req.body;
        const student = yield student_model_1.default.findOne({ studentId, schoolId });
        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, student.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ message: "Login successful", token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.studentLogin = studentLogin;
//# sourceMappingURL=auth.controller.js.map