import express from "express";
import {
  getSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
} from "../controllers/schoolController.js";
import {
  protect,
  authorize,
  hasPermission,
} from "../middleware/authMiddleware.js";
import { ROLES, PERMISSIONS } from "../config/roles.js";
import {
  validate,
  registerSchoolValidation,
  updateSchoolValidation,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, authorize(ROLES.SUPER_ADMIN), getSchools)
  .post(
    protect,
    authorize(ROLES.SUPER_ADMIN),
    hasPermission(PERMISSIONS.CREATE_SCHOOL),
    validate(registerSchoolValidation),
    createSchool
  );

router
  .route("/:id")
  .get(protect, authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN), getSchool)
  .put(
    protect,
    authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
    hasPermission(PERMISSIONS.MANAGE_SCHOOL),
    validate(updateSchoolValidation),
    updateSchool
  )
  .delete(
    protect,
    authorize(ROLES.SUPER_ADMIN),
    hasPermission(PERMISSIONS.MANAGE_SCHOOL),
    deleteSchool
  );

export default router;
