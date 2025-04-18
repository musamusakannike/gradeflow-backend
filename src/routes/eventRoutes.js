import express from "express"
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
} from "../controllers/eventController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router.use(protect) // All event routes require authentication

router
  .route("/")
  .get(getEvents)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN), createEvent)

router.route("/upcoming").get(getUpcomingEvents)

router
  .route("/:id")
  .get(getEvent)
  .put(authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN), updateEvent)
  .delete(authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN), deleteEvent)

export default router
