"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToggleScoringSchema = exports.validateTermSchema = exports.validateSessionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Validate creating a session
const validateSessionSchema = (data) => {
    const schema = joi_1.default.object({
        year: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateSessionSchema = validateSessionSchema;
// Validate creating a term
const validateTermSchema = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        sessionId: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.validateTermSchema = validateTermSchema;
// Validate toggling scoring
const validateToggleScoringSchema = (data) => {
    const schema = joi_1.default.object({
        termId: joi_1.default.string().required(),
        isScoringEnabled: joi_1.default.boolean().required(),
    });
    return schema.validate(data);
};
exports.validateToggleScoringSchema = validateToggleScoringSchema;
//# sourceMappingURL=term.validator.js.map