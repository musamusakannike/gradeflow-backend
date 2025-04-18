import express from "express"
import { getUsers, getUser, createUser, updateUser, deleteUser } from "../controllers/userController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router
  .route("/")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), getUsers)
  .post(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), createUser)

router
  .route("/:id")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), getUser)
  .put(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), updateUser)
  .delete(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), deleteUser)

export default router
