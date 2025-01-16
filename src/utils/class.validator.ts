import Joi, { ObjectSchema, ValidationResult } from "joi";

// Validate class creation data
export const validateClassSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    teacherId: Joi.string().required(),
  });
  return schema.validate(data);
};

// Validate assigning a teacher to a class
export const validateAssignTeacherSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    classId: Joi.string().required(),
    teacherId: Joi.string().required(),
  });
  return schema.validate(data);
};

// Validate listing students in a class with pagination
export const validateListStudentsSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    classId: Joi.string().required(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
  });
  return schema.validate(data);
};

// Validate listing classes for a teacher
export const validateListClassesForTeacherSchema = (
  data: any
): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    teacherId: Joi.string().required(),
  });
  return schema.validate(data);
};
