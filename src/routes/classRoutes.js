import express from "express"
import { getClasses, getClass, createClass, updateClass, deleteClass } from "../controllers/classController.js"
import { protect, authorize, belongsToSchool } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router.route("/").post(protect, authorize(ROLES.SCHOOL_ADMIN), createClass)

router
  .route("/:schoolId")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER),
    belongsToSchool,
    getClasses,
  )

router
  .route("/:id")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.CLASS_TEACHER), getClass)
  .put(protect, authorize(ROLES.SCHOOL_ADMIN), updateClass)
  .delete(protect, authorize(ROLES.SCHOOL_ADMIN), deleteClass)

export default router
