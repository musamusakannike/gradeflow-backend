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
exports.updateStudent = void 0;
const student_model_1 = __importDefault(require("../models/student.model"));
// Update student details
const updateStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.params; // Get student ID from route params
        const { fullName, email, password, classId } = req.body; // Get updated fields from request body
        // Find the student by studentId
        const student = yield student_model_1.default.findOne({ _id: studentId });
        if (!student) {
            res.status(404).json({
                status: "error",
                message: "Student not found",
                data: null,
            });
            return;
        }
        // Update fields if provided in the request
        if (fullName)
            student.fullName = fullName;
        if (email)
            student.email = email;
        if (password)
            student.password = password; // Password will be hashed due to pre-save hook
        if (classId)
            student.classId = classId;
        // Save the updated student document
        yield student.save();
        res.status(200).json({
            status: "success",
            message: "Student details updated successfully",
            data: student,
        });
    }
    catch (err) {
        console.error("Error updating student:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.updateStudent = updateStudent;
//# sourceMappingURL=student.controller.js.map