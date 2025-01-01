const Joi = require("joi");

const validateSessionSchema = (data) => {
  const schema = Joi.object({
    year: Joi.string().required(),
  });

  return schema.validate(data);
};

const validateTermSchema = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    sessionId: Joi.string().required(),
  });

  return schema.validate(data);
};

const validateToggleScoringSchema = (data) => {
    const schema = Joi.object({
      termId: Joi.string().required(),
      isScoringEnabled: Joi.boolean().required(),
    });

    return schema.validate(data);
};

module.exports = { validateSessionSchema, validateTermSchema, validateToggleScoringSchema };
