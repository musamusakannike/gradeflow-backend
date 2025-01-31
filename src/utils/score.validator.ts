const Joi = require("joi");

export const validateAssignScoresSchema = (data: any) => {
  const schema = Joi.object({
    subjectId: Joi.string().required(),
    termId: Joi.string().required(),
    scores: Joi.array()
      .items(
        Joi.object({
          studentId: Joi.string().required(),
          test1: Joi.number().min(0).max(100).optional(),
          test2: Joi.number().min(0).max(100).optional(),
          exam: Joi.number().min(0).max(100).optional(),
        })
      )
      .min(1)
      .required(),
  });

  return schema.validate(data);
};
export const validateGetScoresSchema = (data: any) => {
  const schema = Joi.object({
    subjectId: Joi.string().required(),
    termId: Joi.string().required(),
  });

  return schema.validate(data);
};
