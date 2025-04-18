import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import User from "../models/userModel.js"
import { ROLE_PERMISSIONS } from "../config/roles.js"
import AppError from "../utils/appError.js"

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return next(new AppError("Not authorized to access this route", 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from the token
    req.user = await User.findById(decoded.id).select("-password")

    if (!req.user) {
      return next(new AppError("User not found", 404))
    }

    next()
  } catch (error) {
    return next(new AppError("Not authorized to access this route", 401))
  }
})

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user.role} is not authorized to access this route`, 403))
    }
    next()
  }
}

// Check if user has permission
export const hasPermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user.role
    const permissions = ROLE_PERMISSIONS[userRole] || []

    if (!permissions.includes(permission)) {
      return next(new AppError(`User does not have permission to perform this action`, 403))
    }
    next()
  }
}

// Check if user belongs to school
export const belongsToSchool = asyncHandler(async (req, res, next) => {
  if (req.user.role === "super_admin") {
    return next()
  }

  if (req.params.schoolId && req.user.school.toString() !== req.params.schoolId) {
    return next(new AppError(`User does not belong to this school`, 403))
  }

  next()
})
