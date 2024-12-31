const Joi = require("joi");

const validateCreateSubjectSchema = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    classId: Joi.string().required(),
    teacherId: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports = { validateCreateSubjectSchema };
