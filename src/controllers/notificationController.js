import Notification from "../models/notificationModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import {
  sendNotificationToMultipleUsers,
  sendNotificationToRole,
  sendNotificationToParents,
  sendNotificationToClass,
} from "../utils/notificationService.js"

// @desc    Get all notifications for the current user
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = asyncHandler(async (req, res, next) => {
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 20
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const filter = { recipient: req.user._id }

  // Filter by read status if provided
  if (req.query.read !== undefined) {
    filter.read = req.query.read === "true"
  }

  // Filter by type if provided
  if (req.query.type) {
    filter.type = req.query.type
  }

  const total = await Notification.countDocuments(filter)

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate("sender", "firstName lastName role")
    .populate("relatedId", "name title studentId", req.query.populate)

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
    count: notifications.length,
    pagination,
    total,
    data: notifications,
  })
})

// @desc    Get unread notification count for the current user
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  })

  res.status(200).json({
    success: true,
    count,
  })
})

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id)

  if (!notification) {
    return next(new AppError(`Notification not found with id of ${req.params.id}`, 404))
  }

  // Check if the notification belongs to the current user
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to access this notification", 403))
  }

  notification.read = true
  await notification.save()

  res.status(200).json({
    success: true,
    data: notification,
  })
})

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  })
})

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id)

  if (!notification) {
    return next(new AppError(`Notification not found with id of ${req.params.id}`, 404))
  }

  // Check if the notification belongs to the current user
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to delete this notification", 403))
  }

  await notification.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
export const deleteAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ recipient: req.user._id })

  res.status(200).json({
    success: true,
    message: "All notifications deleted",
  })
})

// @desc    Send notification to users
// @route   POST /api/notifications/send
// @access  Private/SchoolAdmin
export const sendNotification = asyncHandler(async (req, res, next) => {
  const { recipients, type, title, message, actionLink, relatedId, relatedModel, sendEmail } = req.body

  if (!recipients || !type || !title || !message) {
    return next(new AppError("Please provide recipients, type, title, and message", 400))
  }

  let notifications = []

  // Send notification based on recipient type
  if (recipients.userIds && recipients.userIds.length > 0) {
    // Send to specific users
    notifications = await sendNotificationToMultipleUsers({
      userIds: recipients.userIds,
      senderId: req.user._id,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      schoolId: req.user.school,
      sendEmail,
    })
  } else if (recipients.role) {
    // Send to all users with a specific role
    notifications = await sendNotificationToRole({
      role: recipients.role,
      schoolId: req.user.school,
      senderId: req.user._id,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      sendEmail,
    })
  } else if (recipients.studentId) {
    // Send to a student's parents
    notifications = await sendNotificationToParents({
      studentId: recipients.studentId,
      senderId: req.user._id,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      schoolId: req.user.school,
      sendEmail,
    })
  } else if (recipients.classId) {
    // Send to all users in a class
    notifications = await sendNotificationToClass({
      classId: recipients.classId,
      senderId: req.user._id,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      schoolId: req.user.school,
      sendEmail,
      includeStudents: recipients.includeStudents !== false,
      includeParents: recipients.includeParents !== false,
      includeTeacher: recipients.includeTeacher !== false,
    })
  } else {
    return next(new AppError("Invalid recipient type", 400))
  }

  res.status(201).json({
    success: true,
    count: notifications.length,
    data: notifications,
  })
})
