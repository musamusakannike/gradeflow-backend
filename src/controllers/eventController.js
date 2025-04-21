import Event from "../models/eventModel.js"
import Student from "../models/studentModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"
import { sendNotificationToRole, sendNotificationToClass } from "../utils/notificationService.js"

// @desc    Get all events for a school
// @route   GET /api/events
// @access  Private
export const getEvents = asyncHandler(async (req, res, next) => {
  // Parse query parameters
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  // Build filter object
  const filter = { school: req.user.school }

  // Filter by date range if provided
  if (req.query.startDate && req.query.endDate) {
    filter.startDate = { $gte: new Date(req.query.startDate) }
    filter.endDate = { $lte: new Date(req.query.endDate) }
  } else if (req.query.startDate) {
    filter.startDate = { $gte: new Date(req.query.startDate) }
  } else if (req.query.endDate) {
    filter.endDate = { $lte: new Date(req.query.endDate) }
  }

  // Filter by event type if provided
  if (req.query.eventType) {
    filter.eventType = req.query.eventType
  }

  // Filter by target audience based on user role
  if (req.user.role === ROLES.TEACHER || req.user.role === ROLES.CLASS_TEACHER) {
    filter.$or = [{ targetAudience: "all" }, { targetAudience: "teachers" }]
  } else if (req.user.role === ROLES.STUDENT) {
    filter.$or = [{ targetAudience: "all" }, { targetAudience: "students" }]

    // Get student's class
    const student = await Student.findOne({ user: req.user._id })
    if (student) {
      filter.$or.push({ classes: student.class })
    }
  } else if (req.user.role === ROLES.PARENT) {
    filter.$or = [{ targetAudience: "all" }, { targetAudience: "parents" }]
  }

  // Count total documents
  const total = await Event.countDocuments(filter)

  // Execute query with pagination
  const events = await Event.find(filter)
    .sort({ startDate: 1 })
    .skip(startIndex)
    .limit(limit)
    .populate("createdBy", "firstName lastName")
    .populate("classes", "name")

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
    count: events.length,
    pagination,
    total,
    data: events,
  })
})

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
export const getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate("createdBy", "firstName lastName")
    .populate("classes", "name")

  if (!event) {
    return next(new AppError(`Event not found with id of ${req.params.id}`, 404))
  }

  // Check if user belongs to the school
  if (req.user.school.toString() !== event.school.toString()) {
    return next(new AppError("Not authorized to access this event", 403))
  }

  res.status(200).json({
    success: true,
    data: event,
  })
})

// @desc    Create new event
// @route   POST /api/events
// @access  Private/SchoolAdmin
export const createEvent = asyncHandler(async (req, res, next) => {
  // Add school and creator to req.body
  req.body.school = req.user.school
  req.body.createdBy = req.user._id

  const event = await Event.create(req.body)

  // Send notifications based on target audience
  const { targetAudience, classes } = req.body
  const notificationData = {
    senderId: req.user._id,
    type: "event",
    title: `New Event: ${req.body.title}`,
    message: req.body.description,
    relatedId: event._id,
    relatedModel: "Event",
    schoolId: req.user.school,
    sendEmail: req.body.sendEmail === true,
  }

  // Send to specific roles
  if (targetAudience && targetAudience.length > 0) {
    for (const audience of targetAudience) {
      if (audience === "all") {
        continue // Handle "all" separately
      }

      let role
      switch (audience) {
        case "teachers":
          role = ROLES.TEACHER
          break
        case "students":
          role = ROLES.STUDENT
          break
        case "parents":
          role = ROLES.PARENT
          break
        case "staff":
          role = ROLES.STAFF
          break
        default:
          continue
      }

      await sendNotificationToRole({
        ...notificationData,
        role,
      })
    }
  }

  // Send to specific classes
  if (classes && classes.length > 0) {
    for (const classId of classes) {
      await sendNotificationToClass({
        ...notificationData,
        classId,
        includeStudents: targetAudience.includes("all") || targetAudience.includes("students"),
        includeParents: targetAudience.includes("all") || targetAudience.includes("parents"),
        includeTeacher: targetAudience.includes("all") || targetAudience.includes("teachers"),
      })
    }
  }

  res.status(201).json({
    success: true,
    data: event,
  })
})

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/SchoolAdmin
export const updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id)

  if (!event) {
    return next(new AppError(`Event not found with id of ${req.params.id}`, 404))
  }

  // Check if user belongs to the school
  if (req.user.school.toString() !== event.school.toString()) {
    return next(new AppError("Not authorized to update this event", 403))
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  // Send update notification if specified
  if (req.body.sendUpdateNotification) {
    const { targetAudience, classes } = event
    const notificationData = {
      senderId: req.user._id,
      type: "event",
      title: `Event Updated: ${event.title}`,
      message: `The event "${event.title}" has been updated. Please check the details.`,
      relatedId: event._id,
      relatedModel: "Event",
      schoolId: req.user.school,
      sendEmail: req.body.sendEmail === true,
    }

    // Send to specific roles
    if (targetAudience && targetAudience.length > 0) {
      for (const audience of targetAudience) {
        if (audience === "all") {
          continue // Handle "all" separately
        }

        let role
        switch (audience) {
          case "teachers":
            role = ROLES.TEACHER
            break
          case "students":
            role = ROLES.STUDENT
            break
          case "parents":
            role = ROLES.PARENT
            break
          case "staff":
            role = ROLES.STAFF
            break
          default:
            continue
        }

        await sendNotificationToRole({
          ...notificationData,
          role,
        })
      }
    }

    // Send to specific classes
    if (classes && classes.length > 0) {
      for (const classId of classes) {
        await sendNotificationToClass({
          ...notificationData,
          classId,
          includeStudents: targetAudience.includes("all") || targetAudience.includes("students"),
          includeParents: targetAudience.includes("all") || targetAudience.includes("parents"),
          includeTeacher: targetAudience.includes("all") || targetAudience.includes("teachers"),
        })
      }
    }
  }

  res.status(200).json({
    success: true,
    data: event,
  })
})

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/SchoolAdmin
export const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)

  if (!event) {
    return next(new AppError(`Event not found with id of ${req.params.id}`, 404))
  }

  // Check if user belongs to the school
  if (req.user.school.toString() !== event.school.toString()) {
    return next(new AppError("Not authorized to delete this event", 403))
  }

  await event.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Private
export const getUpcomingEvents = asyncHandler(async (req, res, next) => {
  const limit = Number.parseInt(req.query.limit, 10) || 5

  // Build filter object
  const filter = {
    school: req.user.school,
    startDate: { $gte: new Date() },
  }

  // Filter by target audience based on user role
  if (req.user.role === ROLES.TEACHER || req.user.role === ROLES.CLASS_TEACHER) {
    filter.$or = [{ targetAudience: "all" }, { targetAudience: "teachers" }]
  } else if (req.user.role === ROLES.STUDENT) {
    filter.$or = [{ targetAudience: "all" }, { targetAudience: "students" }]

    // Get student's class
    const student = await Student.findOne({ user: req.user._id })
    if (student) {
      filter.$or.push({ classes: student.class })
    }
  } else if (req.user.role === ROLES.PARENT) {
    filter.$or = [{ targetAudience: "all" }, { targetAudience: "parents" }]
  }

  const events = await Event.find(filter)
    .sort({ startDate: 1 })
    .limit(limit)
    .populate("createdBy", "firstName lastName")
    .populate("classes", "name")

  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  })
})
