import express from "express"
import {
  getResultsByTermAndClass,
  getStudentResult,
  createOrUpdateScore,
  compileResults,
  addRemarks,
  publishResults,
  toggleTermScoring,
} from "../controllers/resultController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router
  .route("/term/:termId/class/:classId")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.CLASS_TEACHER), getResultsByTermAndClass)

router
  .route("/student/:studentId/term/:termId")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.CLASS_TEACHER, ROLES.STUDENT), getStudentResult)

router
  .route("/scores")
  .post(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER),
    createOrUpdateScore,
  )

router
  .route("/compile/:classId/:termId")
  .post(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.CLASS_TEACHER), compileResults)

router
  .route("/:id/remarks")
  .put(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.CLASS_TEACHER), addRemarks)

router.route("/publish/:classId/:termId").put(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), publishResults)

router
  .route("/toggle-scoring/:termId")
  .put(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), toggleTermScoring)

export default router
