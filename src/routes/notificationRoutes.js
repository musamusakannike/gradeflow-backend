import express from "express"
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendNotification,
} from "../controllers/notificationController.js"
import { protect, authorize } from "../middleware/authMiddleware.js"
import { ROLES } from "../config/roles.js"

const router = express.Router()

router.use(protect) // All notification routes require authentication

router.route("/").get(getUserNotifications).delete(deleteAllNotifications)

router.route("/unread-count").get(getUnreadCount)
router.route("/mark-all-read").put(markAllAsRead)

router
  .route("/send")
  .post(
    authorize(ROLES.SUPER_ADMIN, ROLES.SUPER_SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.CLASS_TEACHER, ROLES.TEACHER),
    sendNotification,
  )

router.route("/:id/read").put(markAsRead)
router.route("/:id").delete(deleteNotification)

export default router
