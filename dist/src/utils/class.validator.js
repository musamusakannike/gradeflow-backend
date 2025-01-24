"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateListClassesForTeacherSchema = exports.validateListStudentsSchema = exports.validateAssignTeacherSchema = exports.validateClassSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Validate class creation data
const validateClassSchema = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().min(3).max(50).required(),
        teacherId: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateClassSchema = validateClassSchema;
// Validate assigning a teacher to a class
const validateAssignTeacherSchema = (data) => {
    const schema = joi_1.default.object({
        classId: joi_1.default.string().required(),
        teacherId: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateAssignTeacherSchema = validateAssignTeacherSchema;
// Validate listing students in a class with pagination
const validateListStudentsSchema = (data) => {
    const schema = joi_1.default.object({
        classId: joi_1.default.string().required(),
        page: joi_1.default.number().integer().min(1).optional(),
        limit: joi_1.default.number().integer().min(1).optional(),
    });
    return schema.validate(data);
};
exports.validateListStudentsSchema = validateListStudentsSchema;
// Validate listing classes for a teacher
const validateListClassesForTeacherSchema = (data) => {
    const schema = joi_1.default.object({
        teacherId: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateListClassesForTeacherSchema = validateListClassesForTeacherSchema;
//# sourceMappingURL=class.validator.js.map