import express from "express"
import {
  getParentDashboard,
  getChildPerformance,
  getChildrenComparison,
  getTeacherDashboard,
  getSuperAdminDashboard,
} from "../controllers/dashboardController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router.route("/super-admin").get(protect, authorize(ROLES.SUPER_ADMIN), getSuperAdminDashboard)
router.route("/parent").get(protect, authorize(ROLES.PARENT), getParentDashboard)
router.route("/parent/child/:studentId").get(protect, authorize(ROLES.PARENT), getChildPerformance)
router.route("/parent/children-comparison").get(protect, authorize(ROLES.PARENT), getChildrenComparison)
router.route("/teacher").get(protect, authorize(ROLES.TEACHER, ROLES.CLASS_TEACHER), getTeacherDashboard)

export default router
