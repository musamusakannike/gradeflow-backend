import express from "express"
import {
  getFeesByTerm,
  getFeesByStudent,
  getFee,
  createFee,
  updateFee,
  deleteFee,
  updateFeeStatus,
} from "../controllers/feeController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router.route("/").post(protect, authorize(ROLES.SCHOOL_ADMIN, ROLES.BURSAR), createFee)

router
  .route("/term/:termId")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.BURSAR), getFeesByTerm)

router
  .route("/student/:studentId")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.BURSAR, ROLES.STUDENT), getFeesByStudent)

router
  .route("/:id")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.BURSAR, ROLES.STUDENT), getFee)
  .put(protect, authorize(ROLES.SCHOOL_ADMIN, ROLES.BURSAR), updateFee)
  .delete(protect, authorize(ROLES.SCHOOL_ADMIN, ROLES.BURSAR), deleteFee)

router.route("/:id/status").put(protect, authorize(ROLES.SCHOOL_ADMIN, ROLES.BURSAR), updateFeeStatus)

export default router
