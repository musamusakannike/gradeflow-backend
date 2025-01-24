"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStudentLoginSchema = exports.validateTeacherLoginSchema = exports.validateCreateStudentSchema = exports.validateCreateTeacherSchema = exports.validateAdminLoginSchema = exports.validateAdminSignupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const validateAdminSignupSchema = (data) => {
    const schema = joi_1.default.object({
        fullName: joi_1.default.string().min(3).max(50).required(),
        schoolName: joi_1.default.string().min(3).max(100).required(),
        adminEmail: joi_1.default.string().email().required(),
        schoolEmail: joi_1.default.string().email().required(),
        schoolAddress: joi_1.default.string().min(10).max(255).required(),
        password: joi_1.default.string().min(8).required(),
    });
    return schema.validate(data);
};
exports.validateAdminSignupSchema = validateAdminSignupSchema;
const validateAdminLoginSchema = (data) => {
    const schema = joi_1.default.object({
        adminEmail: joi_1.default.string().email().required(),
        password: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateAdminLoginSchema = validateAdminLoginSchema;
const validateCreateTeacherSchema = (data) => {
    const schema = joi_1.default.object({
        fullName: joi_1.default.string().min(3).max(50).required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
    });
    return schema.validate(data);
};
exports.validateCreateTeacherSchema = validateCreateTeacherSchema;
const validateCreateStudentSchema = (data) => {
    const schema = joi_1.default.object({
        fullName: joi_1.default.string().min(3).max(50).required(),
        email: joi_1.default.string().email(),
        classId: joi_1.default.string().required(),
        password: joi_1.default.string().min(8).required(),
    });
    return schema.validate(data);
};
exports.validateCreateStudentSchema = validateCreateStudentSchema;
const validateTeacherLoginSchema = (data) => {
    const schema = joi_1.default.object({
        teacherId: joi_1.default.string().required(),
        password: joi_1.default.string().required(),
        schoolId: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateTeacherLoginSchema = validateTeacherLoginSchema;
const validateStudentLoginSchema = (data) => {
    const schema = joi_1.default.object({
        studentId: joi_1.default.string().required(),
        password: joi_1.default.string().required(),
        schoolId: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateStudentLoginSchema = validateStudentLoginSchema;
//# sourceMappingURL=auth.validator.js.map