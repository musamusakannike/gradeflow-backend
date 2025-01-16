import Joi, { ObjectSchema, ValidationResult } from "joi";

// Validate creating a session
export const validateSessionSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    year: Joi.string().required(),
  });

  return schema.validate(data);
};

// Validate creating a term
export const validateTermSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    name: Joi.string().required(),
    sessionId: Joi.string().required(),
  });

  return schema.validate(data);
};

// Validate toggling scoring
export const validateToggleScoringSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    termId: Joi.string().required(),
    isScoringEnabled: Joi.boolean().required(),
  });

  return schema.validate(data);
};
