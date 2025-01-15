import Joi, { ObjectSchema } from "joi";

export const validateAdminSignupSchema = (data: any): Joi.ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    fullName: Joi.string().min(3).max(50).required(),
    schoolName: Joi.string().min(3).max(100).required(),
    adminEmail: Joi.string().email().required(),
    schoolEmail: Joi.string().email().required(),
    schoolAddress: Joi.string().min(10).max(255).required(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(data);
};

export const validateAdminLoginSchema = (data: any): Joi.ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    adminEmail: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

export const validateCreateTeacherSchema = (
  data: any
): Joi.ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    fullName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(data);
};

export const validateCreateStudentSchema = (
  data: any
): Joi.ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    fullName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email(),
    classId: Joi.string().required(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(data);
};

export const validateTeacherLoginSchema = (data: any): Joi.ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    teacherId: Joi.string().required(),
    password: Joi.string().required(),
    schoolId: Joi.string().required(),
  });
  return schema.validate(data);
};

export const validateStudentLoginSchema = (data: any): Joi.ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    studentId: Joi.string().required(),
    password: Joi.string().required(),
    schoolId: Joi.string().required(),
  });
  return schema.validate(data);
};
