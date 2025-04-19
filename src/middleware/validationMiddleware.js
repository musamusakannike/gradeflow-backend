import { body, validationResult } from 'express-validator'

// Validation middleware
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)))

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    res.status(400).json({
      success: false,
      errors: errors.array()
    })
  }
}

// Auth validation rules
export const registerSuperAdminValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
]

export const registerSchoolValidation = [
  body('schoolName')
    .trim()
    .notEmpty()
    .withMessage('School name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('School name must be between 2 and 100 characters'),
  
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('adminFirstName')
    .trim()
    .notEmpty()
    .withMessage('Admin first name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Admin first name must be between 2 and 50 characters'),
  
  body('adminLastName')
    .trim()
    .notEmpty()
    .withMessage('Admin last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Admin last name must be between 2 and 50 characters'),
  
  body('adminEmail')
    .trim()
    .notEmpty()
    .withMessage('Admin email is required')
    .isEmail()
    .withMessage('Please provide a valid admin email'),
  
  body('adminPassword')
    .notEmpty()
    .withMessage('Admin password is required')
    .isLength({ min: 6 })
    .withMessage('Admin password must be at least 6 characters long')
]

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

export const updateDetailsValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('phoneNumber')
    .optional()
    .trim()
]

export const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
]

export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
]

export const resetPasswordValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
] 