const Joi = require('joi');

const validateAdminSignupSchema = (data) => {
    const schema = Joi.object({
        fullName: Joi.string().min(3).max(50).required(),
        schoolName: Joi.string().min(3).max(100).required(),
        adminEmail: Joi.string().email().required(),
        schoolEmail: Joi.string().email().required(),
        schoolAddress: Joi.string().min(10).max(255).required(),
        password: Joi.string().min(8).required(),
    });
    return schema.validate(data);
};

const validateAdminLoginSchema = (data) => {
    const schema = Joi.object({
        adminEmail: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    return schema.validate(data);
};

const validateCreateTeacherSchema = (data) => {
    const schema = Joi.object({
        fullName: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
    });
    return schema.validate(data);
};

const validateCreateStudentSchema = (data) => {
    const schema = Joi.object({
        fullName: Joi.string().min(3).max(50).required(),
        email: Joi.string().email(),
        classId: Joi.string().required(),
        password: Joi.string().min(8).required(),
    });
    return schema.validate(data);
};

const validateTeacherLoginSchema = (data) => {
    const schema = Joi.object({
        teacherId: Joi.string().required(),
        password: Joi.string().required(),
        schoolId: Joi.string().required(),
    });
    return schema.validate(data);
};

const validateStudentLoginSchema = (data) => {
    const schema = Joi.object({
        studentId: Joi.string().required(),
        password: Joi.string().required(),
        schoolId: Joi.string().required(),
    });
    return schema.validate(data);
};

module.exports = {
    validateAdminSignupSchema,
    validateAdminLoginSchema,
    validateCreateTeacherSchema,
    validateCreateStudentSchema,
    validateTeacherLoginSchema,
    validateStudentLoginSchema,
};
