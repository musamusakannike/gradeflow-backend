const Joi = require("joi");

const validateClassSchema = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    teacherId: Joi.string().required(),
  });
  return schema.validate(data);
};

const validateAssignTeacherSchema = (data) => {
  const schema = Joi.object({
    classId: Joi.string().required(),
    teacherId: Joi.string().required(),
  });
  return schema.validate(data);
};

const validateListStudentsSchema = (data) => {
  const schema = Joi.object({
    classId: Joi.string().required(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
  });

  return schema.validate(data);
};

const validateListClassesForTeacherSchema = (data) => {
  const schema = Joi.object({
    teacherId: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports = {
  validateClassSchema,
  validateAssignTeacherSchema,
  validateListStudentsSchema,
  validateListClassesForTeacherSchema,
};
