import express from "express"
import { getUsers, getUser, createUser, updateUser, deleteUser } from "../controllers/userController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"
import { validate, userValidation, userUpdateValidation } from "../middleware/validationMiddleware.js"

const router = express.Router()

router
  .route("/")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), getUsers)
  .post(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), validate(userValidation), createUser)

router
  .route("/:id")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), getUser)
  .put(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), validate(userUpdateValidation), updateUser)
  .delete(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), deleteUser)

export default router
