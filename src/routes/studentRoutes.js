import express from "express"
import {
  getStudentsBySchool,
  getStudentsByClass,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentStatus,
  getStudentParents,
} from "../controllers/studentController.js"
import { protect, authorize, belongsToSchool } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router.route("/").post(protect, authorize(ROLES.SCHOOL_ADMIN), createStudent)

router
  .route("/school/:schoolId")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
    belongsToSchool,
    getStudentsBySchool,
  )

router
  .route("/class/:classId")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.CLASS_TEACHER),
    getStudentsByClass,
  )

router
  .route("/:id")
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
    getStudent,
  )
  .put(protect, authorize(ROLES.SCHOOL_ADMIN), updateStudent)
  .delete(protect, authorize(ROLES.SCHOOL_ADMIN), deleteStudent)

router.route("/:id/status").put(protect, authorize(ROLES.SCHOOL_ADMIN), updateStudentStatus)

router.route("/:id/parents").get(protect, getStudentParents)

export default router
