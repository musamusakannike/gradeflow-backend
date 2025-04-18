import express from "express"
import {
  markAttendance,
  markBulkAttendance,
  getClassAttendance,
  getStudentTermAttendance,
  getClassAttendanceReport,
  deleteAttendance,
} from "../controllers/attendanceController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router
  .route("/")
  .post(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER),
    markAttendance,
  )

router
  .route("/bulk")
  .post(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER),
    markBulkAttendance,
  )

router
  .route("/class/:classId/date/:date")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER),
    getClassAttendance,
  )

router
  .route("/student/:studentId/term/:termId")
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
    getStudentTermAttendance,
  )

router
  .route("/report/class/:classId/term/:termId")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER),
    getClassAttendanceReport,
  )

router
  .route("/:id")
  .delete(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER),
    deleteAttendance,
  )

export default router
