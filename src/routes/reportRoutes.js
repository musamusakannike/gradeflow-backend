import express from "express"
import {
  generateStudentResultReport,
  generateStudentAttendanceReport,
  generateClassResultReport,
  generateClassAttendanceReport,
} from "../controllers/reportController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router
  .route("/student/:studentId/result/:termId")
  .get(
    protect,
    authorize(
      ROLES.SUPER_ADMIN,
      ROLES.SUPER_SUPER_ADMIN,
      ROLES.SCHOOL_ADMIN,
      ROLES.CLASS_TEACHER,
      ROLES.STUDENT,
      ROLES.PARENT,
    ),
    generateStudentResultReport,
  )

router
  .route("/student/:studentId/attendance/:termId")
  .get(
    protect,
    authorize(
      ROLES.SUPER_ADMIN,
      ROLES.SUPER_SUPER_ADMIN,
      ROLES.SCHOOL_ADMIN,
      ROLES.TEACHER,
      ROLES.CLASS_TEACHER,
      ROLES.STUDENT,
      ROLES.PARENT,
    ),
    generateStudentAttendanceReport,
  )

router
  .route("/class/:classId/results/:termId")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.CLASS_TEACHER),
    generateClassResultReport,
  )

router
  .route("/class/:classId/attendance/:termId")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.CLASS_TEACHER),
    generateClassAttendanceReport,
  )

export default router
