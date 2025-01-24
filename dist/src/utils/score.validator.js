"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGetScoresSchema = exports.validateAssignScoresSchema = void 0;
const Joi = require("joi");
const validateAssignScoresSchema = (data) => {
    const schema = Joi.object({
        subjectId: Joi.string().required(),
        termId: Joi.string().required(),
        scores: Joi.array()
            .items(Joi.object({
            studentId: Joi.string().required(),
            test1: Joi.number().min(0).max(100).optional(),
            test2: Joi.number().min(0).max(100).optional(),
            exam: Joi.number().min(0).max(100).optional(),
        }))
            .min(1)
            .required(),
    });
    return schema.validate(data);
};
exports.validateAssignScoresSchema = validateAssignScoresSchema;
const validateGetScoresSchema = (data) => {
    const schema = Joi.object({
        subjectId: Joi.string().required(),
        termId: Joi.string().required(),
    });
    return schema.validate(data);
};
exports.validateGetScoresSchema = validateGetScoresSchema;
//# sourceMappingURL=score.validator.js.map