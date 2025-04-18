/**
 * Generate a unique conversation ID from two user IDs
 * This ensures the same conversation ID regardless of who initiates the conversation
 * @param {String} userId1 - First user ID
 * @param {String} userId2 - Second user ID
 * @returns {String} - Unique conversation ID
 */
export const generateConversationId = (userId1, userId2) => {
  // Sort the IDs to ensure consistency
  const sortedIds = [userId1, userId2].sort()
  return `${sortedIds[0]}_${sortedIds[1]}`
}

/**
 * Check if a user is allowed to message another user
 * @param {Object} user - Current user
 * @param {Object} targetUser - Target user to message
 * @param {Array} studentIds - Array of student IDs (if user is a parent)
 * @returns {Promise<Boolean>} - Whether the user is allowed to message the target user
 */
export const canMessageUser = async (user, targetUser, studentIds = []) => {
  const { ROLES } = await import("../config/roles.js")

  // School admins can message anyone in their school
  if (user.role === ROLES.SCHOOL_ADMIN && user.school.toString() === targetUser.school.toString()) {
    return true
  }

  // Teachers can message parents of their students
  if ((user.role === ROLES.TEACHER || user.role === ROLES.CLASS_TEACHER) && targetUser.role === ROLES.PARENT) {
    // If studentIds is provided, check if any of them are taught by this teacher
    if (studentIds.length > 0) {
      const { default: Student } = await import("../models/studentModel.js")
      const { default: Subject } = await import("../models/subjectModel.js")
      const { default: Class } = await import("../models/classModel.js")

      for (const studentId of studentIds) {
        const student = await Student.findById(studentId)
        if (!student) continue

        // If user is a class teacher, check if they are the class teacher of the student
        if (user.role === ROLES.CLASS_TEACHER) {
          const classObj = await Class.findOne({
            _id: student.class,
            classTeacher: user._id,
          })
          if (classObj) return true
        }

        // Check if the teacher teaches any subject that the student is enrolled in
        const subjects = await Subject.find({
          teacher: user._id,
          students: studentId,
        })
        if (subjects.length > 0) return true
      }
      return false
    }
    return true // If no studentIds provided, allow (validation will happen elsewhere)
  }

  // Parents can message teachers of their children
  if (user.role === ROLES.PARENT && (targetUser.role === ROLES.TEACHER || targetUser.role === ROLES.CLASS_TEACHER)) {
    // If studentIds is provided, check if any of them are taught by this teacher
    if (studentIds.length > 0) {
      const { default: Subject } = await import("../models/subjectModel.js")
      const { default: Class } = await import("../models/classModel.js")

      for (const studentId of studentIds) {
        // If target user is a class teacher, check if they are the class teacher of the student
        if (targetUser.role === ROLES.CLASS_TEACHER) {
          const classObj = await Class.findOne({
            classTeacher: targetUser._id,
            students: studentId,
          })
          if (classObj) return true
        }

        // Check if the teacher teaches any subject that the student is enrolled in
        const subjects = await Subject.find({
          teacher: targetUser._id,
          students: studentId,
        })
        if (subjects.length > 0) return true
      }
      return false
    }
    return true // If no studentIds provided, allow (validation will happen elsewhere)
  }

  return false
}
