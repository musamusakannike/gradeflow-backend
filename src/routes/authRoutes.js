import express from "express"
import {
  registerSuperAdmin,
  registerSchool,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js"
import {
  validate,
  registerSuperAdminValidation,
  registerSchoolValidation,
  loginValidation,
  updateDetailsValidation,
  updatePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../middleware/validationMiddleware.js"

const router = express.Router()

router.post("/register-super-admin", validate(registerSuperAdminValidation), registerSuperAdmin)
router.post("/register-school", validate(registerSchoolValidation), registerSchool)
router.post("/login", validate(loginValidation), login)
router.get("/logout", protect, logout)
router.get("/me", protect, getMe)
router.put("/updatedetails", protect, validate(updateDetailsValidation), updateDetails)
router.put("/updatepassword", protect, validate(updatePasswordValidation), updatePassword)
router.post("/forgotpassword", validate(forgotPasswordValidation), forgotPassword)
router.put("/resetpassword/:resettoken", validate(resetPasswordValidation), resetPassword)

export default router
