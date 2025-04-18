import Notification from "../models/notificationModel.js"
import User from "../models/userModel.js"
import Parent from "../models/parentModel.js"
import mongoose from "mongoose"

/**
 * Create a notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Created notification
 */
export const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData)
    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

/**
 * Send a notification to a specific user
 * @param {Object} data - Notification data
 * @param {String} data.userId - User ID
 * @param {String} data.senderId - Sender ID (optional)
 * @param {String} data.type - Notification type
 * @param {String} data.title - Notification title
 * @param {String} data.message - Notification message
 * @param {String} data.actionLink - Action link (optional)
 * @param {String} data.relatedId - Related document ID (optional)
 * @param {String} data.relatedModel - Related model name (optional)
 * @param {String} data.schoolId - School ID
 * @param {Boolean} data.sendEmail - Whether to send email (default: false)
 * @returns {Promise<Object>} - Created notification
 */
export const sendNotificationToUser = async (data) => {
  try {
    const {
      userId,
      senderId,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      schoolId,
      sendEmail = false,
    } = data

    // Create notification
    const notification = await createNotification({
      recipient: userId,
      sender: senderId,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      school: schoolId,
    })

    // Send email if required
    if (sendEmail) {
      const user = await User.findById(userId)
      if (user && user.email) {
        await sendEmail({
          email: user.email,
          subject: title,
          message: `${message}\n\n${actionLink ? `Action Link: ${actionLink}` : ""}`,
        })
      }
    }

    return notification
  } catch (error) {
    console.error("Error sending notification to user:", error)
    throw error
  }
}

/**
 * Send notifications to multiple users
 * @param {Object} data - Notification data
 * @param {Array} data.userIds - Array of user IDs
 * @param {String} data.senderId - Sender ID (optional)
 * @param {String} data.type - Notification type
 * @param {String} data.title - Notification title
 * @param {String} data.message - Notification message
 * @param {String} data.actionLink - Action link (optional)
 * @param {String} data.relatedId - Related document ID (optional)
 * @param {String} data.relatedModel - Related model name (optional)
 * @param {String} data.schoolId - School ID
 * @param {Boolean} data.sendEmail - Whether to send email (default: false)
 * @returns {Promise<Array>} - Created notifications
 */
export const sendNotificationToMultipleUsers = async (data) => {
  try {
    const {
      userIds,
      senderId,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      schoolId,
      sendEmail = false,
    } = data

    const notifications = []

    // Create notifications for each user
    for (const userId of userIds) {
      const notification = await sendNotificationToUser({
        userId,
        senderId,
        type,
        title,
        message,
        actionLink,
        relatedId,
        relatedModel,
        schoolId,
        sendEmail,
      })

      notifications.push(notification)
    }

    return notifications
  } catch (error) {
    console.error("Error sending notifications to multiple users:", error)
    throw error
  }
}

/**
 * Send notification to all users with a specific role in a school
 * @param {Object} data - Notification data
 * @param {String} data.role - User role
 * @param {String} data.schoolId - School ID
 * @param {String} data.senderId - Sender ID (optional)
 * @param {String} data.type - Notification type
 * @param {String} data.title - Notification title
 * @param {String} data.message - Notification message
 * @param {String} data.actionLink - Action link (optional)
 * @param {String} data.relatedId - Related document ID (optional)
 * @param {String} data.relatedModel - Related model name (optional)
 * @param {Boolean} data.sendEmail - Whether to send email (default: false)
 * @returns {Promise<Array>} - Created notifications
 */
export const sendNotificationToRole = async (data) => {
  try {
    const {
      role,
      schoolId,
      senderId,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      sendEmail = false,
    } = data

    // Find all users with the specified role in the school
    const users = await User.find({
      role,
      school: schoolId,
    })

    const userIds = users.map((user) => user._id)

    return await sendNotificationToMultipleUsers({
      userIds,
      senderId,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      schoolId,
      sendEmail,
    })
  } catch (error) {
    console.error("Error sending notifications to role:", error)
    throw error
  }
}

/**
 * Send notification to a student's parents
 * @param {Object} data - Notification data
 * @param {String} data.studentId - Student ID
 * @param {String} data.senderId - Sender ID (optional)
 * @param {String} data.type - Notification type
 * @param {String} data.title - Notification title
 * @param {String} data.message - Notification message
 * @param {String} data.actionLink - Action link (optional)
 * @param {String} data.relatedId - Related document ID (optional)
 * @param {String} data.relatedModel - Related model name (optional)
 * @param {String} data.schoolId - School ID
 * @param {Boolean} data.sendEmail - Whether to send email (default: false)
 * @returns {Promise<Array>} - Created notifications
 */
export const sendNotificationToParents = async (data) => {
  try {
    const {
      studentId,
      senderId,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      schoolId,
      sendEmail = false,
    } = data

    // Find all parents of the student
    const parents = await Parent.find({
      children: studentId,
    })

    const parentUserIds = parents.map((parent) => parent.user)

    return await sendNotificationToMultipleUsers({
      userIds: parentUserIds,
      senderId,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      schoolId,
      sendEmail,
    })
  } catch (error) {
    console.error("Error sending notifications to parents:", error)
    throw error
  }
}

/**
 * Send notification to all users in a class (students, parents, and class teacher)
 * @param {Object} data - Notification data
 * @param {String} data.classId - Class ID
 * @param {String} data.senderId - Sender ID (optional)
 * @param {String} data.type - Notification type
 * @param {String} data.title - Notification title
 * @param {String} data.message - Notification message
 * @param {String} data.actionLink - Action link (optional)
 * @param {String} data.relatedId - Related document ID (optional)
 * @param {String} data.relatedModel - Related model name (optional)
 * @param {String} data.schoolId - School ID
 * @param {Boolean} data.sendEmail - Whether to send email (default: false)
 * @param {Boolean} data.includeStudents - Whether to include students (default: true)
 * @param {Boolean} data.includeParents - Whether to include parents (default: true)
 * @param {Boolean} data.includeTeacher - Whether to include class teacher (default: true)
 * @returns {Promise<Array>} - Created notifications
 */
export const sendNotificationToClass = async (data) => {
  try {
    const {
      classId,
      senderId,
      type,
      title,
      message,
      actionLink,
      relatedId,
      relatedModel,
      schoolId,
      sendEmail = false,
      includeStudents = true,
      includeParents = true,
      includeTeacher = true,
    } = data

    const notifications = []

    // Get class information
    const Class = mongoose.model("Class")
    const classInfo = await Class.findById(classId)

    if (!classInfo) {
      throw new Error(`Class not found with id of ${classId}`)
    }

    // Include class teacher
    if (includeTeacher && classInfo.classTeacher) {
      const teacherNotification = await sendNotificationToUser({
        userId: classInfo.classTeacher,
        senderId,
        type,
        title,
        message,
        actionLink,
        relatedId,
        relatedModel,
        schoolId,
        sendEmail,
      })

      notifications.push(teacherNotification)
    }

    if (includeStudents || includeParents) {
      // Get all students in the class
      const Student = mongoose.model("Student")
      const students = await Student.find({ class: classId })

      // Include students
      if (includeStudents) {
        for (const student of students) {
          const studentNotification = await sendNotificationToUser({
            userId: student.user,
            senderId,
            type,
            title,
            message,
            actionLink,
            relatedId,
            relatedModel,
            schoolId,
            sendEmail,
          })

          notifications.push(studentNotification)
        }
      }

      // Include parents
      if (includeParents) {
        for (const student of students) {
          const parentNotifications = await sendNotificationToParents({
            studentId: student._id,
            senderId,
            type,
            title,
            message,
            actionLink,
            relatedId,
            relatedModel,
            schoolId,
            sendEmail,
          })

          notifications.push(...parentNotifications)
        }
      }
    }

    return notifications
  } catch (error) {
    console.error("Error sending notifications to class:", error)
    throw error
  }
}
