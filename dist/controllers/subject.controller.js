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
exports.editSubjectDetails = exports.deleteSubject = exports.getAllSubjects = exports.getSubjectsForTeacher = exports.removeStudentFromSubject = exports.addStudentToSubject = exports.toggleJoinPermissionsBulk = exports.toggleSubjectJoinPermission = exports.viewStudentsInSubjects = exports.viewEnrolledSubjects = exports.leaveSubject = exports.joinSubject = exports.createSubject = void 0;
const subject_model_1 = __importDefault(require("../models/subject.model")); // Subject model
const class_model_1 = __importDefault(require("../models/class.model")); // Class model
const teacher_model_1 = __importDefault(require("../models/teacher.model")); // Teacher model
const student_model_1 = __importDefault(require("../models/student.model")); // Student model
const mongodb_1 = require("mongodb");
const subject_validator_1 = require("../utils/subject.validator"); // Validation schema
// Create a new subject
const createSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, subject_validator_1.validateCreateSubjectSchema)(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        const { name, classId, teacherId } = req.body;
        const studentClass = yield class_model_1.default.findById(classId);
        if (!studentClass) {
            res
                .status(404)
                .json({ status: "error", message: "Class not found", data: null });
            return;
        }
        const teacher = yield teacher_model_1.default.findById(teacherId);
        if (!teacher) {
            res
                .status(404)
                .json({ status: "error", message: "Teacher not found", data: null });
            return;
        }
        const newSubject = yield subject_model_1.default.create({
            name,
            classId,
            teacherId,
            students: [],
            allowStudentAddition: true,
        });
        studentClass.subjects.push(newSubject._id);
        yield studentClass.save();
        res.status(201).json({
            status: "success",
            message: "Subject created successfully",
            data: newSubject,
        });
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ status: "error", message: "Internal server error", data: null });
    }
});
exports.createSubject = createSubject;
// Join a subject
const joinSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { error } = (0, subject_validator_1.validateJoinSubjectSchema)(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { subjectId } = req.body;
        const subject = yield subject_model_1.default.findById(subjectId);
        if (!subject) {
            res
                .status(404)
                .json({ status: "error", message: "Subject not found", data: null });
            return;
        }
        if (!subject.allowStudentAddition) {
            res.status(403).json({
                status: "error",
                message: "Joining this subject is not allowed at the moment",
                data: null,
            });
            return;
        }
        if (studentId && subject.students.includes(new mongodb_1.ObjectId(studentId))) {
            res.status(409).json({
                status: "error",
                message: "You are already enrolled in this subject",
                data: null,
            });
            return;
        }
        subject.students.push(new mongodb_1.ObjectId(studentId));
        yield subject.save();
        res.status(200).json({
            status: "success",
            message: "Successfully joined the subject",
            data: { subjectId, studentId },
        });
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ status: "error", message: "Internal server error", data: null });
    }
});
exports.joinSubject = joinSubject;
// Leave a subject
const leaveSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { error } = (0, subject_validator_1.validateLeaveSubjectSchema)(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { subjectId } = req.body;
        const subject = yield subject_model_1.default.findById(subjectId);
        if (!subject) {
            res
                .status(404)
                .json({ status: "error", message: "Subject not found", data: null });
            return;
        }
        if (studentId && !subject.students.includes(new mongodb_1.ObjectId(studentId))) {
            res.status(409).json({
                status: "error",
                message: "You are not enrolled in this subject",
                data: null,
            });
            return;
        }
        if (!subject.allowStudentAddition) {
            res.status(403).json({
                status: "error",
                message: "Dropping this subject is not allowed at the moment",
                data: null,
            });
            return;
        }
        subject.students = subject.students.filter((id) => id.toString() !== (studentId === null || studentId === void 0 ? void 0 : studentId.toString()));
        yield subject.save();
        res.status(200).json({
            status: "success",
            message: "Successfully left the subject",
            data: { subjectId, studentId },
        });
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ status: "error", message: "Internal server error", data: null });
    }
});
exports.leaveSubject = leaveSubject;
const viewEnrolledSubjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get the student ID from the authenticated user
        const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Query subjects where the student is enrolled
        const enrolledSubjects = yield subject_model_1.default.find({ students: studentId })
            .populate("teacherId", "fullName email") // Populate teacher details
            .populate("classId", "name") // Populate class details
            .select("name classId teacherId"); // Return specific fields
        res.status(200).json({
            status: "success",
            message: "Enrolled subjects retrieved successfully",
            data: enrolledSubjects,
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
exports.viewEnrolledSubjects = viewEnrolledSubjects;
// View students in subjects by teacher
const viewStudentsInSubjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectId } = req.query; // Extract subjectId from query parameters
        if (!subjectId) {
            res.status(400).json({
                status: "error",
                message: "Subject ID is required",
                data: null,
            });
            return;
        }
        // Fetch the subject details by ID
        const subject = yield subject_model_1.default.findById(subjectId)
            .populate("classId", "name") // Populate class details
            .select("name classId students"); // Select specific fields
        if (!subject) {
            res.status(404).json({
                status: "error",
                message: "Subject not found",
                data: null,
            });
            return;
        }
        // Fetch the students enrolled in the subject
        const students = yield student_model_1.default.find({
            _id: { $in: subject.students },
        }).select("fullName email studentId"); // Fetch specific student details
        // Prepare the response
        res.status(200).json({
            status: "success",
            message: "Students in the subject retrieved successfully",
            data: {
                subjectId: subject._id,
                subjectName: subject.name,
                className: subject.classId.name,
                students,
            },
        });
    }
    catch (err) {
        console.error("Error retrieving subject students:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.viewStudentsInSubjects = viewStudentsInSubjects;
// Toggle subject join permission by admin and teacher
const toggleSubjectJoinPermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, subject_validator_1.validateToggleSubjectJoinSchema)(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        // Extract subject ID and desired allowStudentAddition flag from the request body
        const { subjectId, allowStudentAddition } = req.body;
        // Ensure the subject exists
        const subject = yield subject_model_1.default.findById(subjectId);
        if (!subject) {
            res.status(404).json({
                status: "error",
                message: "Subject not found",
                data: null,
            });
            return;
        }
        // Update the allowStudentAddition flag
        subject.allowStudentAddition = allowStudentAddition;
        yield subject.save();
        res.status(200).json({
            status: "success",
            message: `Subject join permission has been ${allowStudentAddition ? "enabled" : "disabled"}`,
            data: { subjectId, allowStudentAddition },
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
exports.toggleSubjectJoinPermission = toggleSubjectJoinPermission;
const toggleJoinPermissionsBulk = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, subject_validator_1.validateToggleJoinPermissionsBulkSchema)(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        // Extract subject IDs and the desired flag from the request body
        const { subjectIds, allowStudentAddition } = req.body;
        // Validate that subjectIds is a non-empty array
        if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
            res.status(400).json({
                status: "error",
                message: "Invalid input: subjectIds must be a non-empty array",
                data: null,
            });
            return;
        }
        // Update the allowStudentAddition flag for all specified subjects
        const result = yield subject_model_1.default.updateMany({ _id: { $in: subjectIds } }, // Match all subjects in the subjectIds array
        { $set: { allowStudentAddition } } // Set the allowStudentAddition field
        );
        res.status(200).json({
            status: "success",
            message: `Join permissions have been ${allowStudentAddition ? "enabled" : "disabled"} for ${result.modifiedCount} subject(s)`,
            data: {
                updatedCount: result.modifiedCount,
                allowStudentAddition,
            },
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
exports.toggleJoinPermissionsBulk = toggleJoinPermissionsBulk;
// Allow teachers to add students to their subjects
const addStudentToSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { error } = (0, subject_validator_1.validateAddRemoveStudentSchema)(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        // Extract the teacher ID, studentId, and subjectId from the request
        const teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated teacher
        const { studentId, subjectId } = req.body;
        // Ensure the subject exists and is assigned to the teacher
        const subject = yield subject_model_1.default.findOne({ _id: subjectId, teacherId });
        if (!subject) {
            res.status(404).json({
                status: "error",
                message: "Subject not found or you are not authorized to manage this subject",
                data: null,
            });
            return;
        }
        // Ensure the student exists using the studentId field
        const student = yield student_model_1.default.findOne({ studentId });
        if (!student) {
            res.status(404).json({
                status: "error",
                message: "Student not found",
                data: null,
            });
            return;
        }
        // Check if the student is already enrolled in the subject
        if (subject.students.includes(student._id)) {
            res.status(409).json({
                status: "error",
                message: "Student is already enrolled in this subject",
                data: null,
            });
            return;
        }
        // Add the student to the subject
        subject.students.push(student._id); // Use the student's _id
        yield subject.save();
        res.status(200).json({
            status: "success",
            message: "Student added to the subject successfully",
            data: { subjectId, studentId },
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
exports.addStudentToSubject = addStudentToSubject;
// Allow teachers to remove students from their subjects
const removeStudentFromSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { error } = (0, subject_validator_1.validateAddRemoveStudentSchema)(req.body);
        if (error) {
            res.status(400).json({
                status: "error",
                message: error.details[0].message,
                data: null,
            });
            return;
        }
        // Extract the teacher ID, studentId, and subjectId from the request
        const teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated teacher
        const { studentId, subjectId } = req.body;
        // Ensure the subject exists and is assigned to the teacher
        const subject = yield subject_model_1.default.findOne({ _id: subjectId, teacherId });
        if (!subject) {
            res.status(404).json({
                status: "error",
                message: "Subject not found or you are not authorized to manage this subject",
                data: null,
            });
            return;
        }
        // Ensure the student exists using the studentId field
        const student = yield student_model_1.default.findOne({ studentId });
        if (!student) {
            res.status(404).json({
                status: "error",
                message: "Student not found",
                data: null,
            });
            return;
        }
        // Check if the student is enrolled in the subject
        if (!subject.students.includes(student._id)) {
            res.status(404).json({
                status: "error",
                message: "Student is not enrolled in this subject",
                data: null,
            });
            return;
        }
        // Remove the student from the subject
        subject.students = subject.students.filter((id) => id.toString() !== student._id.toString());
        yield subject.save();
        res.status(200).json({
            status: "success",
            message: "Student removed from the subject successfully",
            data: { subjectId, studentId },
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
exports.removeStudentFromSubject = removeStudentFromSubject;
// Get a list of subjects assigned to a specific teacher
const getSubjectsForTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get the teacher ID from the authenticated user
        const teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Query subjects where the teacher is assigned
        const subjects = yield subject_model_1.default.find({ teacherId })
            .populate("classId", "name") // Populate class details
            .select("name classId students allowStudentAddition") // Include allowStudentAddition
            .populate("classId", "name"); // Ensure classId is populated with name
        // Format the response
        const formattedSubjects = subjects.map((subject) => {
            var _a;
            return ({
                subjectId: subject._id,
                subjectName: subject.name,
                className: ((_a = subject.classId) === null || _a === void 0 ? void 0 : _a.name) || "Class not assigned",
                totalStudents: subject.students.length, // Count of enrolled students
                allowStudentAddition: subject.allowStudentAddition, // Current join permission flag
            });
        });
        res.status(200).json({
            status: "success",
            message: "Subjects retrieved successfully",
            data: formattedSubjects,
        });
    }
    catch (err) {
        console.error("Error retrieving subjects for teacher:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.getSubjectsForTeacher = getSubjectsForTeacher;
const getAllSubjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all subjects with related class and teacher details
        const subjects = yield subject_model_1.default.find()
            .populate("classId", "name") // Populate class name
            .populate("teacherId", "fullName email"); // Populate teacher's full name and email
        res.status(200).json({
            status: "success",
            message: "Subjects retrieved successfully",
            data: subjects,
        });
    }
    catch (err) {
        console.error("Error fetching subjects:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
exports.getAllSubjects = getAllSubjects;
const deleteSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectId } = req.params;
        // Ensure the subject exists
        const subject = yield subject_model_1.default.findById(subjectId);
        if (!subject) {
            res.status(404).json({
                status: "error",
                message: "Subject not found",
                data: null,
            });
            return;
        }
        // Remove the subject from the class's subject list
        const studentClass = yield class_model_1.default.findById(subject.classId);
        if (studentClass) {
            studentClass.subjects = studentClass.subjects.filter((id) => id.toString() !== subjectId.toString());
            yield studentClass.save();
        }
        // Delete the subject
        yield subject_model_1.default.findByIdAndDelete(subjectId);
        res.status(200).json({
            status: "success",
            message: "Subject deleted successfully",
            data: { subjectId },
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
exports.deleteSubject = deleteSubject;
const editSubjectDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectId } = req.params;
        const { name, classId, teacherId } = req.body;
        // Validate request body
        if (!name && !classId && !teacherId) {
            res.status(400).json({
                status: "error",
                message: "At least one field (name, classId, teacherId) must be provided",
                data: null,
            });
            return;
        }
        // Find the subject
        const subject = yield subject_model_1.default.findById(subjectId);
        if (!subject) {
            res.status(404).json({
                status: "error",
                message: "Subject not found",
                data: null,
            });
            return;
        }
        // Update class association if needed
        if (classId && classId !== subject.classId.toString()) {
            const newClass = yield class_model_1.default.findById(classId);
            if (!newClass) {
                res.status(404).json({
                    status: "error",
                    message: "Class not found",
                    data: null,
                });
                return;
            }
            // Remove subject from the old class
            const oldClass = yield class_model_1.default.findById(subject.classId);
            if (oldClass) {
                oldClass.subjects = oldClass.subjects.filter((id) => id.toString() !== subjectId.toString());
                yield oldClass.save();
            }
            // Add subject to the new class
            newClass.subjects.push(new mongodb_1.ObjectId(subjectId));
            yield newClass.save();
            subject.classId = classId;
        }
        // Update teacher association if needed
        if (teacherId && teacherId !== subject.teacherId.toString()) {
            const teacher = yield teacher_model_1.default.findById(teacherId);
            if (!teacher) {
                res.status(404).json({
                    status: "error",
                    message: "Teacher not found",
                    data: null,
                });
                return;
            }
            subject.teacherId = teacherId;
        }
        // Update subject name if provided
        if (name) {
            subject.name = name;
        }
        // Save updated subject
        yield subject.save();
        res.status(200).json({
            status: "success",
            message: "Subject details updated successfully",
            data: subject,
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
exports.editSubjectDetails = editSubjectDetails;
//# sourceMappingURL=subject.controller.js.map