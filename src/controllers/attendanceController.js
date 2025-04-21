import Attendance from "../models/attendanceModel.js"
import Student from "../models/studentModel.js"
import Class from "../models/classModel.js"
import Term from "../models/termModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"
import mongoose from "mongoose"
import { sendNotificationToParents } from "../utils/notificationService.js"

// @desc    Mark attendance for a student
// @route   POST /api/attendance
// @access  Private/Teacher/ClassTeacher
export const markAttendance = asyncHandler(async (req, res, next) => {
  const { student, date, status, term, remark } = req.body

  // Check if student exists
  const studentDoc = await Student.findById(student)
  if (!studentDoc) {
    return next(new AppError(`Student not found with id of ${student}`, 404))
  }

  // Check if term exists
  const termDoc = await Term.findById(term)
  if (!termDoc) {
    return next(new AppError(`Term not found with id of ${term}`, 404))
  }

  // Check if term is active
  if (!termDoc.isActive) {
    return next(new AppError(`Cannot mark attendance for inactive term`, 400))
  }

  // Check if user is authorized to mark attendance for this class
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SCHOOL_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN
  ) {
    // If user is a class teacher, check if they are assigned to this class
    if (req.user.role === ROLES.CLASS_TEACHER) {
      const classDoc = await Class.findOne({
        _id: studentDoc.class,
        classTeacher: req.user._id,
      })

      if (!classDoc) {
        return next(new AppError(`You are not authorized to mark attendance for students in this class`, 403))
      }
    }
    // If user is a regular teacher, they can still mark attendance but we'll log it
  }

  // Format the date to remove time component for consistent comparison
  const formattedDate = new Date(date)
  formattedDate.setHours(0, 0, 0, 0)

  // Check if attendance already exists for this student on this date
  let attendance = await Attendance.findOne({
    student,
    date: {
      $gte: formattedDate,
      $lt: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000),
    },
  })

  if (attendance) {
    // Update existing attendance
    attendance = await Attendance.findByIdAndUpdate(
      attendance._id,
      {
        status,
        remark,
        markedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      },
    )
  } else {
    // Create new attendance record
    attendance = await Attendance.create({
      student,
      class: studentDoc.class,
      date: formattedDate,
      status,
      term,
      remark,
      markedBy: req.user._id,
      school: req.user.school,
    })
  }

  // Send notification to parents if student is absent or late
  if (status === "Absent" || status === "Late") {
    const studentDoc = await Student.findById(student).populate("user", "firstName lastName")

    // Format date for better readability
    const formattedDate = new Date(date).toLocaleDateString()

    await sendNotificationToParents({
      studentId: student,
      senderId: req.user._id,
      type: "attendance",
      title: `${status} Notification: ${studentDoc.user.firstName} ${studentDoc.user.lastName}`,
      message: `Your child was marked as ${status} on ${formattedDate}${remark ? `. Remark: ${remark}` : ""}`,
      relatedId: attendance._id,
      relatedModel: "Attendance",
      schoolId: req.user.school,
      sendEmail: true, // Send email for absence notifications
    })
  }

  res.status(201).json({
    success: true,
    data: attendance,
  })
})

// @desc    Mark attendance for multiple students
// @route   POST /api/attendance/bulk
// @access  Private/Teacher/ClassTeacher
export const markBulkAttendance = asyncHandler(async (req, res, next) => {
  const { classId, date, term, attendanceData } = req.body

  // Check if class exists
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    return next(new AppError(`Class not found with id of ${classId}`, 404))
  }

  // Check if term exists
  const termDoc = await Term.findById(term)
  if (!termDoc) {
    return next(new AppError(`Term not found with id of ${term}`, 404))
  }

  // Check if term is active
  if (!termDoc.isActive) {
    return next(new AppError(`Cannot mark attendance for inactive term`, 400))
  }

  // Check if user is authorized to mark attendance for this class
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SCHOOL_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN
  ) {
    // If user is a class teacher, check if they are assigned to this class
    if (req.user.role === ROLES.CLASS_TEACHER) {
      if (classDoc.classTeacher.toString() !== req.user._id.toString()) {
        return next(new AppError(`You are not authorized to mark attendance for students in this class`, 403))
      }
    }
    // If user is a regular teacher, they can still mark attendance but we'll log it
  }

  // Format the date to remove time component for consistent comparison
  const formattedDate = new Date(date)
  formattedDate.setHours(0, 0, 0, 0)

  // Get all students in the class
  const students = await Student.find({ class: classId })

  // Validate that all students in attendanceData belong to this class
  for (const item of attendanceData) {
    const studentExists = students.some((student) => student._id.toString() === item.student)
    if (!studentExists) {
      return next(new AppError(`Student ${item.student} does not belong to this class`, 400))
    }
  }

  // Create or update attendance records
  const attendanceRecords = []

  for (const item of attendanceData) {
    // Check if attendance already exists for this student on this date
    let attendance = await Attendance.findOne({
      student: item.student,
      date: {
        $gte: formattedDate,
        $lt: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })

    if (attendance) {
      // Update existing attendance
      attendance = await Attendance.findByIdAndUpdate(
        attendance._id,
        {
          status: item.status,
          remark: item.remark,
          markedBy: req.user._id,
        },
        {
          new: true,
          runValidators: true,
        },
      )
    } else {
      // Create new attendance record
      attendance = await Attendance.create({
        student: item.student,
        class: classId,
        date: formattedDate,
        status: item.status,
        term,
        remark: item.remark,
        markedBy: req.user._id,
        school: req.user.school,
      })
    }

    attendanceRecords.push(attendance)
  }

  // Send notifications to parents for absent or late students
  for (const item of attendanceData) {
    if (item.status === "Absent" || item.status === "Late") {
      const studentDoc = await Student.findById(item.student).populate("user", "firstName lastName")

      // Format date for better readability
      const formattedDate = new Date(date).toLocaleDateString()

      await sendNotificationToParents({
        studentId: item.student,
        senderId: req.user._id,
        type: "attendance",
        title: `${item.status} Notification: ${studentDoc.user.firstName} ${studentDoc.user.lastName}`,
        message: `Your child was marked as ${item.status} on ${formattedDate}${item.remark ? `. Remark: ${item.remark}` : ""}`,
        relatedId: attendanceRecords.find((record) => record.student.toString() === item.student.toString())?._id,
        relatedModel: "Attendance",
        schoolId: req.user.school,
        sendEmail: true, // Send email for absence notifications
      })
    }
  }

  res.status(201).json({
    success: true,
    count: attendanceRecords.length,
    data: attendanceRecords,
  })
})

// @desc    Get attendance for a class on a specific date
// @route   GET /api/attendance/class/:classId/date/:date
// @access  Private/Teacher/ClassTeacher/SchoolAdmin
export const getClassAttendance = asyncHandler(async (req, res, next) => {
  const { classId, date } = req.params

  // Check if class exists
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    return next(new AppError(`Class not found with id of ${classId}`, 404))
  }

  // Format the date to remove time component for consistent comparison
  const formattedDate = new Date(date)
  formattedDate.setHours(0, 0, 0, 0)

  // Get all students in the class
  const students = await Student.find({ class: classId }).populate("user", "firstName lastName")

  // Get attendance records for this class on this date
  const attendanceRecords = await Attendance.find({
    class: classId,
    date: {
      $gte: formattedDate,
      $lt: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000),
    },
  }).populate("student", "studentId")

  // Create a complete attendance list including students without attendance records
  const completeAttendance = students.map((student) => {
    const attendanceRecord = attendanceRecords.find(
      (record) => record.student._id.toString() === student._id.toString(),
    )

    return {
      student: {
        _id: student._id,
        studentId: student.studentId,
        name: `${student.user.firstName} ${student.user.lastName}`,
      },
      attendance: attendanceRecord
        ? {
            _id: attendanceRecord._id,
            status: attendanceRecord.status,
            remark: attendanceRecord.remark,
          }
        : {
            status: "Not Marked",
            remark: "",
          },
    }
  })

  res.status(200).json({
    success: true,
    count: completeAttendance.length,
    data: completeAttendance,
  })
})

// @desc    Get attendance for a student in a term
// @route   GET /api/attendance/student/:studentId/term/:termId
// @access  Private/Teacher/ClassTeacher/SchoolAdmin/Parent/Student
export const getStudentTermAttendance = asyncHandler(async (req, res, next) => {
  const { studentId, termId } = req.params

  // Check if student exists
  const student = await Student.findById(studentId)
  if (!student) {
    return next(new AppError(`Student not found with id of ${studentId}`, 404))
  }

  // Check if term exists
  const term = await Term.findById(termId)
  if (!term) {
    return next(new AppError(`Term not found with id of ${termId}`, 404))
  }

  // Check authorization
  let isAuthorized = false

  // School admin or super admin
  if (
    req.user.role === ROLES.SUPER_ADMIN ||
    req.user.role === ROLES.SUPER_SUPER_ADMIN ||
    (req.user.role === ROLES.SCHOOL_ADMIN && req.user.school.toString() === student.school.toString())
  ) {
    isAuthorized = true
  }
  // Class teacher
  else if (req.user.role === ROLES.CLASS_TEACHER) {
    const classDoc = await Class.findOne({
      _id: student.class,
      classTeacher: req.user._id,
    })

    if (classDoc) {
      isAuthorized = true
    }
  }
  // Teacher
  else if (req.user.role === ROLES.TEACHER && req.user.school.toString() === student.school.toString()) {
    isAuthorized = true
  }
  // Student themselves
  else if (req.user.role === ROLES.STUDENT && req.user._id.toString() === student.user.toString()) {
    isAuthorized = true
  }
  // Parent of the student
  else if (req.user.role === ROLES.PARENT) {
    const Parent = mongoose.model("Parent")
    const parent = await Parent.findOne({
      user: req.user._id,
      children: studentId,
    })

    if (parent) {
      isAuthorized = true
    }
  }

  if (!isAuthorized) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this student's attendance`, 403))
  }

  // Get attendance records for this student in this term
  const attendanceRecords = await Attendance.find({
    student: studentId,
    term: termId,
  })
    .sort({ date: 1 })
    .populate("markedBy", "firstName lastName")

  // Calculate attendance statistics
  const totalDays = attendanceRecords.length
  const presentDays = attendanceRecords.filter((record) => record.status === "Present").length
  const absentDays = attendanceRecords.filter((record) => record.status === "Absent").length
  const lateDays = attendanceRecords.filter((record) => record.status === "Late").length
  const excusedDays = attendanceRecords.filter((record) => record.status === "Excused").length

  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

  res.status(200).json({
    success: true,
    data: {
      student: {
        _id: student._id,
        studentId: student.studentId,
      },
      term: {
        _id: term._id,
        name: term.name,
      },
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        attendancePercentage: attendancePercentage.toFixed(2),
      },
      records: attendanceRecords,
    },
  })
})

// @desc    Get attendance report for a class in a term
// @route   GET /api/attendance/report/class/:classId/term/:termId
// @access  Private/Teacher/ClassTeacher/SchoolAdmin
export const getClassAttendanceReport = asyncHandler(async (req, res, next) => {
  const { classId, termId } = req.params

  // Check if class exists
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    return next(new AppError(`Class not found with id of ${classId}`, 404))
  }

  // Check if term exists
  const term = await Term.findById(termId)
  if (!term) {
    return next(new AppError(`Term not found with id of ${termId}`, 404))
  }

  // Get all students in the class
  const students = await Student.find({ class: classId }).populate("user", "firstName lastName")

  // Get all attendance records for this class in this term
  const allAttendanceRecords = await Attendance.find({
    class: classId,
    term: termId,
  })

  // Get unique dates
  const uniqueDates = [...new Set(allAttendanceRecords.map((record) => record.date.toISOString().split("T")[0]))].sort()

  // Create report for each student
  const studentReports = []

  for (const student of students) {
    const studentAttendance = allAttendanceRecords.filter(
      (record) => record.student.toString() === student._id.toString(),
    )

    const totalDays = studentAttendance.length
    const presentDays = studentAttendance.filter((record) => record.status === "Present").length
    const absentDays = studentAttendance.filter((record) => record.status === "Absent").length
    const lateDays = studentAttendance.filter((record) => record.status === "Late").length
    const excusedDays = studentAttendance.filter((record) => record.status === "Excused").length

    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

    studentReports.push({
      student: {
        _id: student._id,
        studentId: student.studentId,
        name: `${student.user.firstName} ${student.user.lastName}`,
      },
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        attendancePercentage: attendancePercentage.toFixed(2),
      },
    })
  }

  // Sort by attendance percentage (descending)
  studentReports.sort((a, b) => b.statistics.attendancePercentage - a.statistics.attendancePercentage)

  res.status(200).json({
    success: true,
    data: {
      class: {
        _id: classDoc._id,
        name: classDoc.name,
      },
      term: {
        _id: term._id,
        name: term.name,
      },
      totalSchoolDays: uniqueDates.length,
      studentReports,
    },
  })
})

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Teacher/ClassTeacher/SchoolAdmin
export const deleteAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id)

  if (!attendance) {
    return next(new AppError(`Attendance record not found with id of ${req.params.id}`, 404))
  }

  // Check if user is authorized to delete this attendance record
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN &&
    req.user.role !== ROLES.SCHOOL_ADMIN
  ) {
    // If user is a class teacher, check if they are assigned to this class
    if (req.user.role === ROLES.CLASS_TEACHER) {
      const classDoc = await Class.findOne({
        _id: attendance.class,
        classTeacher: req.user._id,
      })

      if (!classDoc) {
        return next(new AppError(`You are not authorized to delete attendance records for students in this class`, 403))
      }
    }
    // If user is a regular teacher, check if they marked this attendance
    else if (req.user.role === ROLES.TEACHER) {
      if (attendance.markedBy.toString() !== req.user._id.toString()) {
        return next(new AppError(`You are not authorized to delete attendance records marked by other teachers`, 403))
      }
    }
  }

  await attendance.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})
