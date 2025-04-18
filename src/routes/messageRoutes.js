import express from "express"
import {
  sendMessage,
  getConversations,
  getConversationMessages,
  getUnreadCount,
  markAsRead,
  toggleArchiveConversation,
  getContacts,
} from "../controllers/messageController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.use(protect) // All message routes require authentication

router.route("/").post(sendMessage)
router.route("/unread-count").get(getUnreadCount)
router.route("/contacts").get(getContacts)
router.route("/conversations").get(getConversations)
router.route("/conversations/:conversationId").get(getConversationMessages)
router.route("/conversations/:id/archive").put(toggleArchiveConversation)
router.route("/:id/read").put(markAsRead)

export default router
