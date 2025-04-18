import School from "../models/schoolModel.js"
import Student from "../models/studentModel.js"
import Class from "../models/classModel.js"
import Term from "../models/termModel.js"
import Result from "../models/resultModel.js"
import Score from "../models/scoreModel.js"
import Attendance from "../models/attendanceModel.js"
import Parent from "../models/parentModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"
import {
  generateResultPDF,
  generateAttendancePDF,
  generateClassResultPDF,
  generateClassAttendancePDF,
} from "../utils/pdfGenerator.js"

// @desc    Generate student result report
// @route   GET /api/reports/student/:studentId/result/:termId
// @access  Private/SchoolAdmin/ClassTeacher/Student/Parent
export const generateStudentResultReport = asyncHandler(async (req, res, next) => {
  const { studentId, termId } = req.params

  // Get student
  const student = await Student.findById(studentId).populate("user", "firstName lastName")
  if (!student) {
    return next(new AppError(`Student not found with id of ${studentId}`, 404))
  }

  // Get term
  const term = await Term.findById(termId).populate("academicSession", "name")
  if (!term) {
    return next(new AppError(`Term not found with id of ${termId}`, 404))
  }

  // Check if user is authorized to view this student's result
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
    const classObj = await Class.findOne({
      _id: student.class,
      classTeacher: req.user._id,
    })

    if (classObj) {
      isAuthorized = true
    }
  }

  // Student themselves
  else if (req.user.role === ROLES.STUDENT && req.user._id.toString() === student.user.toString()) {
    isAuthorized = true
  }

  // Parent of the student
  else if (req.user.role === ROLES.PARENT) {
    const parent = await Parent.findOne({
      user: req.user._id,
      children: student._id,
    })

    if (parent) {
      isAuthorized = true
    }
  }

  if (!isAuthorized) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this student's result`, 403))
  }

  // Get result
  const result = await Result.findOne({
    student: studentId,
    term: termId,
  })

  if (!result) {
    return next(new AppError("Result not found", 404))
  }

  // Get scores
  const scores = await Score.find({
    student: studentId,
    term: termId,
  }).populate("subject", "name code obtainableScores")

  // Get class
  const classObj = await Class.findById(student.class)
  if (!classObj) {
    return next(new AppError("Class not found", 404))
  }

  // Get school
  const school = await School.findById(student.school)
  if (!school) {
    return next(new AppError("School not found", 404))
  }

  // Get attendance statistics
  const attendanceRecords = await Attendance.find({
    student: studentId,
    term: termId,
  })

  const totalDays = attendanceRecords.length
  const presentDays = attendanceRecords.filter((record) => record.status === "Present").length
  const absentDays = attendanceRecords.filter((record) => record.status === "Absent").length
  const lateDays = attendanceRecords.filter((record) => record.status === "Late").length
  const excusedDays = attendanceRecords.filter((record) => record.status === "Excused").length

  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : "N/A"

  // Generate PDF
  const pdfData = await generateResultPDF({
    student,
    school,
    result,
    scores,
    term,
    class: classObj,
    attendance: {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendancePercentage,
    },
  })

  // Set response headers
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `attachment; filename=result_${student.studentId}_${term.name}.pdf`)

  // Send PDF
  res.send(pdfData)
})

// @desc    Generate student attendance report
// @route   GET /api/reports/student/:studentId/attendance/:termId
// @access  Private/SchoolAdmin/ClassTeacher/Student/Parent
export const generateStudentAttendanceReport = asyncHandler(async (req, res, next) => {
  const { studentId, termId } = req.params

  // Get student
  const student = await Student.findById(studentId).populate("user", "firstName lastName")
  if (!student) {
    return next(new AppError(`Student not found with id of ${studentId}`, 404))
  }

  // Get term
  const term = await Term.findById(termId).populate("academicSession", "name")
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
    const classObj = await Class.findOne({
      _id: student.class,
      classTeacher: req.user._id,
    })

    if (classObj) {
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

  // Get class
  const classObj = await Class.findById(student.class)
  if (!classObj) {
    return next(new AppError("Class not found", 404))
  }

  // Get school
  const school = await School.findById(student.school)
  if (!school) {
    return next(new AppError("School not found", 404))
  }

  // Get attendance records
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

  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : "N/A"

  // Generate PDF
  const pdfData = await generateAttendancePDF({
    student,
    school,
    term,
    class: classObj,
    statistics: {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendancePercentage,
    },
    records: attendanceRecords,
  })

  // Set response headers
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `attachment; filename=attendance_${student.studentId}_${term.name}.pdf`)

  // Send PDF
  res.send(pdfData)
})

// @desc    Generate class result report
// @route   GET /api/reports/class/:classId/results/:termId
// @access  Private/SchoolAdmin/ClassTeacher
export const generateClassResultReport = asyncHandler(async (req, res, next) => {
  const { classId, termId } = req.params

  // Get class
  const classObj = await Class.findById(classId)
  if (!classObj) {
    return next(new AppError(`Class not found with id of ${classId}`, 404))
  }

  // Get term
  const term = await Term.findById(termId).populate("academicSession", "name")
  if (!term) {
    return next(new AppError(`Term not found with id of ${termId}`, 404))
  }

  // Check authorization
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN &&
    req.user.role !== ROLES.SCHOOL_ADMIN &&
    !(req.user.role === ROLES.CLASS_TEACHER && classObj.classTeacher.toString() === req.user._id.toString())
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this class's results`, 403))
  }

  // Get school
  const school = await School.findById(classObj.school)
  if (!school) {
    return next(new AppError("School not found", 404))
  }

  // Get results
  const results = await Result.find({
    class: classId,
    term: termId,
  })
    .sort({ position: 1 })
    .populate({
      path: "student",
      select: "studentId",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })

  if (results.length === 0) {
    return next(new AppError("No results found for this class and term", 404))
  }

  // Generate PDF
  const pdfData = await generateClassResultPDF({
    school,
    class: classObj,
    term,
    results,
  })

  // Set response headers
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `attachment; filename=class_results_${classObj.name}_${term.name}.pdf`)

  // Send PDF
  res.send(pdfData)
})

// @desc    Generate class attendance report
// @route   GET /api/reports/class/:classId/attendance/:termId
// @access  Private/SchoolAdmin/ClassTeacher
export const generateClassAttendanceReport = asyncHandler(async (req, res, next) => {
  const { classId, termId } = req.params

  // Get class
  const classObj = await Class.findById(classId)
  if (!classObj) {
    return next(new AppError(`Class not found with id of ${classId}`, 404))
  }

  // Get term
  const term = await Term.findById(termId).populate("academicSession", "name")
  if (!term) {
    return next(new AppError(`Term not found with id of ${termId}`, 404))
  }

  // Check authorization
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN &&
    req.user.role !== ROLES.SCHOOL_ADMIN &&
    !(req.user.role === ROLES.CLASS_TEACHER && classObj.classTeacher.toString() === req.user._id.toString())
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this class's attendance`, 403))
  }

  // Get school
  const school = await School.findById(classObj.school)
  if (!school) {
    return next(new AppError("School not found", 404))
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

    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : "0.00"

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
        attendancePercentage,
      },
    })
  }

  // Sort by attendance percentage (descending)
  studentReports.sort(
    (a, b) =>
      Number.parseFloat(b.statistics.attendancePercentage) - Number.parseFloat(a.statistics.attendancePercentage),
  )

  // Generate PDF
  const pdfData = await generateClassAttendancePDF({
    school,
    class: classObj,
    term,
    totalSchoolDays: uniqueDates.length,
    studentReports,
  })

  // Set response headers
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `attachment; filename=class_attendance_${classObj.name}_${term.name}.pdf`)

  // Send PDF
  res.send(pdfData)
})
