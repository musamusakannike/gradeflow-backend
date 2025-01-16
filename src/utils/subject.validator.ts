import Joi, { ObjectSchema, ValidationResult } from "joi";

// Validate creating a subject
export const validateCreateSubjectSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    classId: Joi.string().required(),
    teacherId: Joi.string().required(),
  });

  return schema.validate(data);
};

// Validate joining a subject
export const validateJoinSubjectSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    subjectId: Joi.string().required(),
  });

  return schema.validate(data);
};

// Validate leaving a subject
export const validateLeaveSubjectSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    subjectId: Joi.string().required(),
  });

  return schema.validate(data);
};

// Validate toggling subject join permissions
export const validateToggleSubjectJoinSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    subjectId: Joi.string().required(),
    allowStudentAddition: Joi.boolean().required(),
  });

  return schema.validate(data);
};

// Validate toggling join permissions in bulk
export const validateToggleJoinPermissionsBulkSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    subjectIds: Joi.array().items(Joi.string().required()).min(1).required(),
    allowStudentAddition: Joi.boolean().required(),
  });

  return schema.validate(data);
};

// Validate adding or removing a student
export const validateAddRemoveStudentSchema = (data: any): ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    studentId: Joi.string().required(),
    subjectId: Joi.string().required(),
  });

  return schema.validate(data);
};
