import Message from "../models/messageModel.js"
import Conversation from "../models/conversationModel.js"
import User from "../models/userModel.js"
import Parent from "../models/parentModel.js"
import Student from "../models/studentModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"
import { generateConversationId, canMessageUser } from "../utils/messageUtils.js"
import { sendNotificationToUser } from "../utils/notificationService.js"
import mongoose from "mongoose"

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { recipientId, content, subject, studentIds } = req.body

  if (!recipientId || !content) {
    return next(new AppError("Please provide recipient and message content", 400))
  }

  // Check if recipient exists
  const recipient = await User.findById(recipientId)
  if (!recipient) {
    return next(new AppError(`User not found with id of ${recipientId}`, 404))
  }

  // Check if sender is allowed to message recipient
  const canMessage = await canMessageUser(req.user, recipient, studentIds)
  if (!canMessage) {
    return next(new AppError("You are not authorized to message this user", 403))
  }

  // Generate conversation ID
  const conversationId = generateConversationId(req.user._id.toString(), recipientId)

  // Check if conversation exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, recipientId] },
  })

  if (!conversation) {
    // Create new conversation
    conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
      subject: subject || "No subject",
      school: req.user.school,
    })
  } else if (subject) {
    // Update conversation subject if provided
    conversation.subject = subject
    await conversation.save()
  }

  // Create message
  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    conversationId,
    content,
    school: req.user.school,
    attachments: req.body.attachments || [],
  })

  // Update conversation with last message
  conversation.lastMessage = message._id
  await conversation.save()

  // Send notification to recipient
  await sendNotificationToUser({
    userId: recipientId,
    senderId: req.user._id,
    type: "message",
    title: `New message from ${req.user.firstName} ${req.user.lastName}`,
    message: content.length > 50 ? `${content.substring(0, 50)}...` : content,
    relatedId: message._id,
    relatedModel: "Message",
    schoolId: req.user.school,
    sendEmail: req.body.sendEmail === true,
  })

  res.status(201).json({
    success: true,
    data: message,
  })
})

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = asyncHandler(async (req, res, next) => {
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  // Build filter object
  const filter = {
    participants: req.user._id,
  }

  // Filter by archived status if provided
  if (req.query.archived !== undefined) {
    filter.isArchived = req.query.archived === "true"
  }

  // Count total documents
  const total = await Conversation.countDocuments(filter)

  // Execute query with pagination
  const conversations = await Conversation.find(filter)
    .sort({ updatedAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate("participants", "firstName lastName role")
    .populate({
      path: "lastMessage",
      select: "content createdAt read",
    })

  // Pagination result
  const pagination = {}

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }

  // Format conversations to include other participant info
  const formattedConversations = conversations.map((conversation) => {
    const otherParticipant = conversation.participants.find(
      (participant) => participant._id.toString() !== req.user._id.toString(),
    )

    return {
      _id: conversation._id,
      otherParticipant,
      subject: conversation.subject,
      lastMessage: conversation.lastMessage,
      updatedAt: conversation.updatedAt,
      isArchived: conversation.isArchived,
    }
  })

  res.status(200).json({
    success: true,
    count: formattedConversations.length,
    pagination,
    total,
    data: formattedConversations,
  })
})

// @desc    Get messages for a conversation
// @route   GET /api/messages/conversations/:conversationId
// @access  Private
export const getConversationMessages = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 20
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  // Check if conversation exists and user is a participant
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) {
    return next(new AppError(`Conversation not found with id of ${conversationId}`, 404))
  }

  if (!conversation.participants.includes(req.user._id)) {
    return next(new AppError("You are not authorized to access this conversation", 403))
  }

  // Get other participant
  const otherParticipantId = conversation.participants.find(
    (participant) => participant.toString() !== req.user._id.toString(),
  )
  const otherParticipant = await User.findById(otherParticipantId).select("firstName lastName role")

  // Count total messages
  const total = await Message.countDocuments({
    conversationId: generateConversationId(req.user._id.toString(), otherParticipantId.toString()),
  })

  // Get messages
  const messages = await Message.find({
    conversationId: generateConversationId(req.user._id.toString(), otherParticipantId.toString()),
  })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate("sender", "firstName lastName role")

  // Mark unread messages as read
  await Message.updateMany(
    {
      conversationId: generateConversationId(req.user._id.toString(), otherParticipantId.toString()),
      recipient: req.user._id,
      read: false,
    },
    { read: true },
  )

  // Pagination result
  const pagination = {}

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }

  res.status(200).json({
    success: true,
    count: messages.length,
    pagination,
    total,
    conversation: {
      _id: conversation._id,
      subject: conversation.subject,
      otherParticipant,
      isArchived: conversation.isArchived,
    },
    data: messages,
  })
})

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Message.countDocuments({
    recipient: req.user._id,
    read: false,
  })

  res.status(200).json({
    success: true,
    count,
  })
})

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id)

  if (!message) {
    return next(new AppError(`Message not found with id of ${req.params.id}`, 404))
  }

  // Check if user is the recipient
  if (message.recipient.toString() !== req.user._id.toString()) {
    return next(new AppError("You are not authorized to mark this message as read", 403))
  }

  message.read = true
  await message.save()

  res.status(200).json({
    success: true,
    data: message,
  })
})

// @desc    Archive/Unarchive a conversation
// @route   PUT /api/messages/conversations/:id/archive
// @access  Private
export const toggleArchiveConversation = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id)

  if (!conversation) {
    return next(new AppError(`Conversation not found with id of ${req.params.id}`, 404))
  }

  // Check if user is a participant
  if (!conversation.participants.includes(req.user._id)) {
    return next(new AppError("You are not authorized to archive this conversation", 403))
  }

  // Toggle archive status
  conversation.isArchived = !conversation.isArchived
  await conversation.save()

  res.status(200).json({
    success: true,
    data: conversation,
  })
})

// @desc    Get contacts (users that can be messaged)
// @route   GET /api/messages/contacts
// @access  Private
export const getContacts = asyncHandler(async (req, res, next) => {
  const { role } = req.query
  let contacts = []

  // If user is a parent, get teachers of their children
  if (req.user.role === ROLES.PARENT) {
    // Get parent's children
    const parent = await Parent.findOne({ user: req.user._id })
    if (!parent || parent.children.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      })
    }

    // Get all teachers who teach the parent's children
    const teacherIds = new Set()

    // Get class teachers
    for (const childId of parent.children) {
      const student = await Student.findById(childId).populate("class", "classTeacher")
      if (student && student.class && student.class.classTeacher) {
        teacherIds.add(student.class.classTeacher.toString())
      }
    }

    // Get subject teachers
    const Subject = mongoose.model("Subject")
    for (const childId of parent.children) {
      const subjects = await Subject.find({ students: childId })
      for (const subject of subjects) {
        if (subject.teacher) {
          teacherIds.add(subject.teacher.toString())
        }
      }
    }

    // Get teacher details
    if (teacherIds.size > 0) {
      contacts = await User.find({
        _id: { $in: Array.from(teacherIds) },
        role: { $in: [ROLES.TEACHER, ROLES.CLASS_TEACHER] },
      }).select("firstName lastName role")
    }
  }
  // If user is a teacher, get parents of their students
  else if (req.user.role === ROLES.TEACHER || req.user.role === ROLES.CLASS_TEACHER) {
    const studentIds = new Set()

    // If class teacher, get all students in the class
    if (req.user.role === ROLES.CLASS_TEACHER) {
      const Class = mongoose.model("Class")
      const classes = await Class.find({ classTeacher: req.user._id })
      for (const cls of classes) {
        const students = await Student.find({ class: cls._id })
        for (const student of students) {
          studentIds.add(student._id.toString())
        }
      }
    }

    // Get students from subjects taught
    const Subject = mongoose.model("Subject")
    const subjects = await Subject.find({ teacher: req.user._id })
    for (const subject of subjects) {
      for (const studentId of subject.students) {
        studentIds.add(studentId.toString())
      }
    }

    // Get parents of these students
    const parentIds = new Set()
    for (const studentId of studentIds) {
      const parents = await Parent.find({ children: studentId })
      for (const parent of parents) {
        parentIds.add(parent.user.toString())
      }
    }

    // Get parent details
    if (parentIds.size > 0) {
      contacts = await User.find({
        _id: { $in: Array.from(parentIds) },
        role: ROLES.PARENT,
      }).select("firstName lastName role")
    }
  }
  // If user is a school admin, get all teachers and parents in the school
  else if (req.user.role === ROLES.SCHOOL_ADMIN || req.user.role === ROLES.SUPER_ADMIN) {
    const roleFilter = role ? { role } : { role: { $in: [ROLES.TEACHER, ROLES.CLASS_TEACHER, ROLES.PARENT] } }

    contacts = await User.find({
      ...roleFilter,
      school: req.user.school,
      _id: { $ne: req.user._id },
    }).select("firstName lastName role")
  }

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts,
  })
})
