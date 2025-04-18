import Result from "../models/resultModel.js"
import Score from "../models/scoreModel.js"
import Fee from "../models/feeModel.js"
import Student from "../models/studentModel.js"
import Subject from "../models/subjectModel.js"
import Term from "../models/termModel.js"
import Parent from "../models/parentModel.js"
import Class from "../models/classModel.js" // Import Class model
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"
import { sendNotificationToClass } from "../utils/notificationService.js"

// @desc    Get all results for a term and class
// @route   GET /api/results/term/:termId/class/:classId
// @access  Private/SchoolAdmin/ClassTeacher
export const getResultsByTermAndClass = asyncHandler(async (req, res, next) => {
  const results = await Result.find({
    term: req.params.termId,
    class: req.params.classId,
  })
    .populate({
      path: "student",
      select: "studentId",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })
    .populate("class", "name")
    .populate("term", "name")

  res.status(200).json({
    success: true,
    count: results.length,
    data: results,
  })
})

// @desc    Get student result for a term
// @route   GET /api/results/student/:studentId/term/:termId
// @access  Private/SchoolAdmin/ClassTeacher/Student/Parent
export const getStudentResult = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.studentId)

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.studentId}`, 404))
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

  // If user is student or parent, check if fees are paid
  if (req.user.role === ROLES.STUDENT || req.user.role === ROLES.PARENT) {
    const fee = await Fee.findOne({
      student: req.params.studentId,
      term: req.params.termId,
    })

    if (!fee || fee.status !== "Paid") {
      return next(new AppError("Fees must be paid to view this result", 403))
    }
  }

  const result = await Result.findOne({
    student: req.params.studentId,
    term: req.params.termId,
  })
    .populate({
      path: "student",
      select: "studentId",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })
    .populate("class", "name")
    .populate("term", "name")

  if (!result) {
    return next(new AppError("Result not found", 404))
  }

  // Get scores for this student and term
  const scores = await Score.find({
    student: req.params.studentId,
    term: req.params.termId,
  }).populate("subject", "name code obtainableScores")

  res.status(200).json({
    success: true,
    data: {
      result,
      scores,
    },
  })
})

// @desc    Create or update score
// @route   POST /api/results/scores
// @access  Private/Teacher
export const createOrUpdateScore = asyncHandler(async (req, res, next) => {
  const { student, subject, term, test1, test2, exam } = req.body

  // Check if term allows scoring
  const termDoc = await Term.findById(term)
  if (!termDoc) {
    return next(new AppError(`Term not found with id of ${term}`, 404))
  }

  if (!termDoc.allowScoring) {
    return next(new AppError(`Scoring is not allowed for this term`, 403))
  }

  // Check if subject belongs to teacher
  const subjectDoc = await Subject.findById(subject)

  if (!subjectDoc) {
    return next(new AppError(`Subject not found with id of ${subject}`, 404))
  }

  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SCHOOL_ADMIN &&
    subjectDoc.teacher.toString() !== req.user._id.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to update scores for this subject`, 403))
  }

  // Check if student is registered for the subject
  if (!subjectDoc.students.includes(student)) {
    return next(new AppError(`Student is not registered for this subject`, 400))
  }

  // Add teacher and school to req.body
  req.body.teacher = req.user._id
  req.body.school = req.user.school

  // Check if score already exists
  let score = await Score.findOne({
    student,
    subject,
    term,
  })

  if (score) {
    // Update score
    score = await Score.findOneAndUpdate(
      {
        student,
        subject,
        term,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    )
  } else {
    // Create score
    score = await Score.create(req.body)
  }

  res.status(201).json({
    success: true,
    data: score,
  })
})

// @desc    Compile results for a class and term
// @route   POST /api/results/compile/:classId/:termId
// @access  Private/SchoolAdmin/ClassTeacher
export const compileResults = asyncHandler(async (req, res, next) => {
  const { classId, termId } = req.params

  // Get all students in the class
  const students = await Student.find({ class: classId })

  // For each student, compile results
  for (const student of students) {
    // Get all scores for this student and term
    const scores = await Score.find({
      student: student._id,
      term: termId,
    })

    if (scores.length === 0) {
      continue // Skip if no scores
    }

    // Calculate total and average
    let totalPercentage = 0
    scores.forEach((score) => {
      totalPercentage += score.percentageScore
    })
    const averagePercentage = totalPercentage / scores.length

    // Check if result already exists
    let result = await Result.findOne({
      student: student._id,
      class: classId,
      term: termId,
    })

    if (result) {
      // Update result
      result = await Result.findOneAndUpdate(
        {
          student: student._id,
          class: classId,
          term: termId,
        },
        {
          totalScore: totalPercentage,
          averageScore: averagePercentage,
          numberOfSubjects: scores.length,
          school: req.user.school,
        },
        {
          new: true,
          runValidators: true,
        },
      )
    } else {
      // Create result
      result = await Result.create({
        student: student._id,
        class: classId,
        term: termId,
        totalScore: totalPercentage,
        averageScore: averagePercentage,
        numberOfSubjects: scores.length,
        school: req.user.school,
      })
    }
  }

  // Calculate positions
  const results = await Result.find({
    class: classId,
    term: termId,
  }).sort({ averageScore: -1 })

  // Update positions
  for (let i = 0; i < results.length; i++) {
    await Result.findByIdAndUpdate(results[i]._id, {
      position: i + 1,
    })
  }

  res.status(200).json({
    success: true,
    message: "Results compiled successfully",
  })
})

// @desc    Add remarks to result
// @route   PUT /api/results/:id/remarks
// @access  Private/SchoolAdmin/ClassTeacher
export const addRemarks = asyncHandler(async (req, res, next) => {
  const { classTeacherRemark, principalRemark } = req.body

  let result = await Result.findById(req.params.id)

  if (!result) {
    return next(new AppError(`Result not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== result.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this result`, 403))
  }

  // Update remarks
  result = await Result.findByIdAndUpdate(
    req.params.id,
    {
      classTeacherRemark,
      principalRemark,
    },
    {
      new: true,
      runValidators: true,
    },
  )

  res.status(200).json({
    success: true,
    data: result,
  })
})

// @desc    Publish results
// @route   PUT /api/results/publish/:classId/:termId
// @access  Private/SchoolAdmin
export const publishResults = asyncHandler(async (req, res, next) => {
  const { classId, termId } = req.params

  // Update all results for this class and term
  await Result.updateMany(
    {
      class: classId,
      term: termId,
    },
    {
      isPublished: true,
    },
  )

  // Get class and term information for the notification
  const classObj = await Class.findById(classId)
  const termObj = await Term.findById(termId)

  if (classObj && termObj) {
    // Send notification to all students and parents in the class
    await sendNotificationToClass({
      classId,
      senderId: req.user._id,
      type: "result",
      title: `Results Published: ${classObj.name} - ${termObj.name}`,
      message: `The results for ${classObj.name} for ${termObj.name} have been published. You can now view your results.`,
      relatedId: classId,
      relatedModel: "Class",
      schoolId: req.user.school,
      sendEmail: true, // Send email for result notifications
      includeTeacher: false, // No need to notify the teacher who published the results
    })
  }

  res.status(200).json({
    success: true,
    message: "Results published successfully",
  })
})

// @desc    Toggle term scoring permission
// @route   PUT /api/results/toggle-scoring/:termId
// @access  Private/SchoolAdmin
export const toggleTermScoring = asyncHandler(async (req, res, next) => {
  const term = await Term.findById(req.params.termId)

  if (!term) {
    return next(new AppError(`Term not found with id of ${req.params.termId}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== term.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this term`, 403))
  }

  // Toggle allowScoring
  term.allowScoring = !term.allowScoring
  await term.save()

  res.status(200).json({
    success: true,
    data: term,
  })
})
