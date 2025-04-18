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

const router = express.Router()

router.post("/register-super-admin", registerSuperAdmin)
router.post("/register-school", registerSchool)
router.post("/login", login)
router.get("/logout", logout)
router.get("/me", protect, getMe)
router.put("/updatedetails", protect, updateDetails)
router.put("/updatepassword", protect, updatePassword)
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:resettoken", resetPassword)

export default router
