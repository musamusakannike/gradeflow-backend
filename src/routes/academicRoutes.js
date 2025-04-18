import express from "express"
import {
  getAcademicSessions,
  getAcademicSession,
  createAcademicSession,
  updateAcademicSession,
  deleteAcademicSession,
  getTerms,
  getTerm,
  updateTerm,
  activateTerm,
} from "../controllers/academicController.js"
import { protect, authorize, belongsToSchool } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

// Academic Session routes
router.route("/sessions").post(protect, authorize(ROLES.SCHOOL_ADMIN), createAcademicSession)

router
  .route("/sessions/:schoolId")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), belongsToSchool, getAcademicSessions)

router
  .route("/sessions/:id")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), getAcademicSession)
  .put(protect, authorize(ROLES.SCHOOL_ADMIN), updateAcademicSession)
  .delete(protect, authorize(ROLES.SCHOOL_ADMIN), deleteAcademicSession)

// Term routes
router.route("/terms/:sessionId").get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), getTerms)

router
  .route("/terms/:id")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), getTerm)
  .put(protect, authorize(ROLES.SCHOOL_ADMIN), updateTerm)

router.route("/terms/:id/activate").put(protect, authorize(ROLES.SCHOOL_ADMIN), activateTerm)

export default router
