import express from "express"
import {
  getSubjectsByClass,
  getSubjectsByTeacher,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleStudentAddition,
  updateObtainableScores,
  addStudentToSubject,
  removeStudentFromSubject,
  getSubjectsByStudent,
  getAvailableSubjects,
} from "../controllers/subjectController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router.route("/").post(protect, authorize(ROLES.SCHOOL_ADMIN), createSubject)

router
  .route("/class/:classId")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER),
    getSubjectsByClass,
  )

router
  .route("/teacher/:teacherId")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER),
    getSubjectsByTeacher,
  )

router
  .route("/student/:studentId")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER, ROLES.STUDENT),
    getSubjectsByStudent,
  )

router.route("/available/:studentId").get(protect, authorize(ROLES.STUDENT), getAvailableSubjects)

router
  .route("/:id")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER, ROLES.STUDENT),
    getSubject,
  )
  .put(protect, authorize(ROLES.SCHOOL_ADMIN), updateSubject)
  .delete(protect, authorize(ROLES.SCHOOL_ADMIN), deleteSubject)

router
  .route("/:id/toggle-student-addition")
  .put(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER),
    toggleStudentAddition,
  )

router
  .route("/:id/obtainable-scores")
  .put(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER),
    updateObtainableScores,
  )

router
  .route("/:id/add-student/:studentId")
  .put(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER, ROLES.STUDENT),
    addStudentToSubject,
  )

router
  .route("/:id/remove-student/:studentId")
  .put(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER, ROLES.STUDENT),
    removeStudentFromSubject,
  )

export default router
