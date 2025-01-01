const Joi = require("joi");

const validateCreateSubjectSchema = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    classId: Joi.string().required(),
    teacherId: Joi.string().required(),
  });

  return schema.validate(data);
};

const validateJoinSubjectSchema = (data) => {
  const schema = Joi.object({
    subjectId: Joi.string().required(),
  });

  return schema.validate(data);
};

const validateLeaveSubjectSchema = (data) => {
  const schema = Joi.object({
    subjectId: Joi.string().required(),
  });

  return schema.validate(data);
};

const validateToggleSubjectJoinSchema = (data) => {
  const schema = Joi.object({
    subjectId: Joi.string().required(),
    allowStudentAddition: Joi.boolean().required(),
  });

  return schema.validate(data);
};

const validateToggleJoinPermissionsBulkSchema = (data) => {
  const schema = Joi.object({
    subjectIds: Joi.array().items(Joi.string().required()).min(1).required(),
    allowStudentAddition: Joi.boolean().required(),
  });

  return schema.validate(data);
};

const validateAddRemoveStudentSchema = (data) => {
  const schema = Joi.object({
    studentId: Joi.string().required(),
    subjectId: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports = {
  validateCreateSubjectSchema,
  validateJoinSubjectSchema,
  validateLeaveSubjectSchema,
  validateToggleSubjectJoinSchema,
  validateToggleJoinPermissionsBulkSchema,
  validateAddRemoveStudentSchema,
};
