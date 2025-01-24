"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddRemoveStudentSchema = exports.validateToggleJoinPermissionsBulkSchema = exports.validateToggleSubjectJoinSchema = exports.validateLeaveSubjectSchema = exports.validateJoinSubjectSchema = exports.validateCreateSubjectSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Validate creating a subject
const validateCreateSubjectSchema = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().min(3).max(50).required(),
        classId: joi_1.default.string().required(),
        teacherId: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateCreateSubjectSchema = validateCreateSubjectSchema;
// Validate joining a subject
const validateJoinSubjectSchema = (data) => {
    const schema = joi_1.default.object({
        subjectId: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateJoinSubjectSchema = validateJoinSubjectSchema;
// Validate leaving a subject
const validateLeaveSubjectSchema = (data) => {
    const schema = joi_1.default.object({
        subjectId: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateLeaveSubjectSchema = validateLeaveSubjectSchema;
// Validate toggling subject join permissions
const validateToggleSubjectJoinSchema = (data) => {
    const schema = joi_1.default.object({
        subjectId: joi_1.default.string().required(),
        allowStudentAddition: joi_1.default.boolean().required(),
    });
    return schema.validate(data);
};
exports.validateToggleSubjectJoinSchema = validateToggleSubjectJoinSchema;
// Validate toggling join permissions in bulk
const validateToggleJoinPermissionsBulkSchema = (data) => {
    const schema = joi_1.default.object({
        subjectIds: joi_1.default.array().items(joi_1.default.string().required()).min(1).required(),
        allowStudentAddition: joi_1.default.boolean().required(),
    });
    return schema.validate(data);
};
exports.validateToggleJoinPermissionsBulkSchema = validateToggleJoinPermissionsBulkSchema;
// Validate adding or removing a student
const validateAddRemoveStudentSchema = (data) => {
    const schema = joi_1.default.object({
        studentId: joi_1.default.string().required(),
        subjectId: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateAddRemoveStudentSchema = validateAddRemoveStudentSchema;
//# sourceMappingURL=subject.validator.js.map