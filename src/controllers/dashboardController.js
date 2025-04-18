import Student from "../models/studentModel.js"
import Parent from "../models/parentModel.js"
import Result from "../models/resultModel.js"
import Score from "../models/scoreModel.js"
import Attendance from "../models/attendanceModel.js"
import Message from "../models/messageModel.js" // Add Message import
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js" // Add ROLES import
import mongoose from "mongoose"
import User from "../models/userModel.js"
import Class from "../models/classModel.js"
import Subject from "../models/subjectModel.js"

// @desc    Get parent dashboard data
// @route   GET /api/dashboard/parent
// @access  Private/Parent
export const getParentDashboard = asyncHandler(async (req, res, next) => {
  // Get parent
  const parent = await Parent.findOne({ user: req.user._id })

  if (!parent) {
    return next(new AppError("Parent not found", 404))
  }

  // Get children
  const children = await Student.find({ _id: { $in: parent.children } })
    .populate("user", "firstName lastName")
    .populate("class", "name")

  // Get latest results for each child
  const childrenData = []

  for (const child of children) {
    const latestResult = await Result.findOne({ student: child._id })
      .sort({ createdAt: -1 })
      .populate("term", "name")
      .populate("class", "name")
      .limit(1)

    // Get attendance statistics for the current term
    let attendanceStats = null
    if (latestResult) {
      const attendanceRecords = await Attendance.find({
        student: child._id,
        term: latestResult.term._id,
      })

      const totalDays = attendanceRecords.length
      const presentDays = attendanceRecords.filter((record) => record.status === "Present").length
      const absentDays = attendanceRecords.filter((record) => record.status === "Absent").length

      attendanceStats = {
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : "N/A",
      }
    }

    childrenData.push({
      student: child,
      latestResult: latestResult || null,
      attendance: attendanceStats,
    })
  }

  // Get unread messages count
  const unreadMessagesCount = await Message.countDocuments({
    recipient: req.user._id,
    read: false,
  })

  res.status(200).json({
    success: true,
    data: {
      parent,
      children: childrenData,
      unreadMessagesCount,
    },
  })
})

// @desc    Get teacher dashboard data
// @route   GET /api/dashboard/teacher
// @access  Private/Teacher/ClassTeacher
export const getTeacherDashboard = asyncHandler(async (req, res, next) => {
  // Check if user is a teacher
  if (req.user.role !== ROLES.TEACHER && req.user.role !== ROLES.CLASS_TEACHER) {
    return next(new AppError("Only teachers can access this dashboard", 403))
  }

  // Get classes taught (for class teachers)
  let classesTaught = []
  if (req.user.role === ROLES.CLASS_TEACHER) {
    const Class = mongoose.model("Class")
    classesTaught = await Class.find({ classTeacher: req.user._id }).populate("academicSession", "name")
  }

  // Get subjects taught
  const Subject = mongoose.model("Subject")
  const subjectsTaught = await Subject.find({ teacher: req.user._id }).populate("class", "name")

  // Get total number of students taught
  const studentIds = new Set()

  // Add students from classes (if class teacher)
  for (const cls of classesTaught) {
    const students = await Student.find({ class: cls._id })
    for (const student of students) {
      studentIds.add(student._id.toString())
    }
  }

  // Add students from subjects
  for (const subject of subjectsTaught) {
    for (const studentId of subject.students) {
      studentIds.add(studentId.toString())
    }
  }

  // Get unread messages count
  const unreadMessagesCount = await Message.countDocuments({
    recipient: req.user._id,
    read: false,
  })

  // Get recent messages
  const recentMessages = await Message.find({
    recipient: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("sender", "firstName lastName role")

  res.status(200).json({
    success: true,
    data: {
      classesTaught,
      subjectsTaught,
      totalStudents: studentIds.size,
      unreadMessagesCount,
      recentMessages,
    },
  })
})

// @desc    Get parent child performance overview
// @route   GET /api/dashboard/parent/child/:studentId
// @access  Private/Parent
export const getChildPerformance = asyncHandler(async (req, res, next) => {
  // Get parent
  const parent = await Parent.findOne({ user: req.user._id })

  if (!parent) {
    return next(new AppError("Parent not found", 404))
  }

  // Check if student is a child of this parent
  if (!parent.children.includes(req.params.studentId)) {
    return next(new AppError("Student is not a child of this parent", 403))
  }

  // Get student
  const student = await Student.findById(req.params.studentId)
    .populate("user", "firstName lastName")
    .populate("class", "name")

  // Get all results for this student
  const results = await Result.find({ student: student._id })
    .sort({ createdAt: -1 })
    .populate("term", "name")
    .populate("class", "name")

  // Get subjects and scores for the latest term
  let latestTermScores = []
  let attendanceStats = null

  if (results.length > 0) {
    const latestResult = results[0]

    latestTermScores = await Score.find({
      student: student._id,
      term: latestResult.term._id,
    }).populate("subject", "name code")

    // Get attendance statistics for the latest term
    const attendanceRecords = await Attendance.find({
      student: student._id,
      term: latestResult.term._id,
    })

    const totalDays = attendanceRecords.length
    const presentDays = attendanceRecords.filter((record) => record.status === "Present").length
    const absentDays = attendanceRecords.filter((record) => record.status === "Absent").length
    const lateDays = attendanceRecords.filter((record) => record.status === "Late").length
    const excusedDays = attendanceRecords.filter((record) => record.status === "Excused").length

    attendanceStats = {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendancePercentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : "N/A",
      recentRecords: await Attendance.find({ student: student._id, term: latestResult.term._id })
        .sort({ date: -1 })
        .limit(5),
    }
  }

  // Get teachers who teach this student
  const teacherIds = new Set()

  // Get class teacher
  const classObj = await Class.findById(student.class)
  if (classObj && classObj.classTeacher) {
    teacherIds.add(classObj.classTeacher.toString())
  }

  // Get subject teachers
  const subjects = await Subject.find({ students: student._id })
  for (const subject of subjects) {
    if (subject.teacher) {
      teacherIds.add(subject.teacher.toString())
    }
  }

  // Get teacher details
  const teachers = await User.find({
    _id: { $in: Array.from(teacherIds) },
  }).select("firstName lastName role")

  res.status(200).json({
    success: true,
    data: {
      student,
      results,
      latestTermScores,
      attendance: attendanceStats,
      teachers,
    },
  })
})

// @desc    Get parent's children performance comparison
// @route   GET /api/dashboard/parent/children-comparison
// @access  Private/Parent
export const getChildrenComparison = asyncHandler(async (req, res, next) => {
  // Get parent
  const parent = await Parent.findOne({ user: req.user._id })

  if (!parent) {
    return next(new AppError("Parent not found", 404))
  }

  // Get children
  const children = await Student.find({ _id: { $in: parent.children } })
    .populate("user", "firstName lastName")
    .populate("class", "name")

  // Get performance data for each child
  const childrenPerformance = []

  for (const child of children) {
    // Get latest result
    const latestResult = await Result.findOne({ student: child._id })
      .sort({ createdAt: -1 })
      .populate("term", "name")
      .limit(1)

    if (latestResult) {
      // Get average scores for each subject
      const subjectScores = await Score.find({
        student: child._id,
        term: latestResult.term._id,
      }).populate("subject", "name")

      // Get attendance statistics
      const attendanceRecords = await Attendance.find({
        student: child._id,
        term: latestResult.term._id,
      })

      const totalDays = attendanceRecords.length
      const presentDays = attendanceRecords.filter((record) => record.status === "Present").length
      const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : "N/A"

      childrenPerformance.push({
        student: {
          id: child._id,
          name: `${child.user.firstName} ${child.user.lastName}`,
          class: child.class.name,
        },
        term: latestResult.term.name,
        averageScore: latestResult.averageScore,
        position: latestResult.position,
        attendance: {
          totalDays,
          presentDays,
          attendancePercentage,
        },
        subjectScores: subjectScores.map((score) => ({
          subject: score.subject.name,
          percentageScore: score.percentageScore,
          grade: score.grade,
        })),
      })
    }
  }

  res.status(200).json({
    success: true,
    data: childrenPerformance,
  })
})
