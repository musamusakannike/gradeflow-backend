import express from "express"
import {
  getParentsBySchool,
  getParent,
  createParent,
  updateParent,
  deleteParent,
  addChildToParent,
  removeChildFromParent,
  getParentChildren,
  getParentByUser,
} from "../controllers/parentController.js"
import { protect, authorize, belongsToSchool } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router.route("/").post(protect, authorize(ROLES.SCHOOL_ADMIN), createParent)

router
  .route("/school/:schoolId")
  .get(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
    belongsToSchool,
    getParentsBySchool,
  )

router.route("/user/:userId").get(protect, getParentByUser)

router
  .route("/:id")
  .get(protect, getParent)
  .put(protect, authorize(ROLES.SCHOOL_ADMIN), updateParent)
  .delete(protect, authorize(ROLES.SCHOOL_ADMIN), deleteParent)

router.route("/:id/add-child/:studentId").put(protect, authorize(ROLES.SCHOOL_ADMIN), addChildToParent)

router.route("/:id/remove-child/:studentId").put(protect, authorize(ROLES.SCHOOL_ADMIN), removeChildFromParent)

router.route("/:id/children").get(protect, getParentChildren)

export default router
