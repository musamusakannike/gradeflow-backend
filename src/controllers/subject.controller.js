const Subject = require("../models/subject.model"); // Subject model
const Class = require("../models/class.model"); // Class model
const Teacher = require("../models/teacher.model"); // Teacher model
const Student = require("../models/student.model"); // Student model
const {
  validateCreateSubjectSchema,
  validateJoinSubjectSchema,
  validateLeaveSubjectSchema,
} = require("../utils/subject.validator"); // Validation schema

const createSubject = async (req, res) => {
  try {
    // Validate the request body
    const { error } = validateCreateSubjectSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }

    // Extract details from the request body
    const { name, classId, teacherId } = req.body;

    // Verify if the class exists
    const studentClass = await Class.findById(classId);
    if (!studentClass) {
      return res.status(404).json({
        status: "error",
        message: "Class not found",
        data: null,
      });
    }

    // Verify if the teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
        data: null,
      });
    }

    // Create the subject
    const newSubject = await Subject.create({
      name,
      classId,
      teacherId,
      students: [],
      allowStudentAddition: true, // Default to true
    });

    // Add the subject to the class's subject list
    studentClass.subjects.push(newSubject._id);
    await studentClass.save();

    res.status(201).json({
      status: "success",
      message: "Subject created successfully",
      data: newSubject,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

// Join a subject by student
const joinSubject = async (req, res) => {
  try {
    const { error } = validateJoinSubjectSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    // Extract student ID and subject ID from the request
    const studentId = req.user.id; // Extract from the authenticated user
    const { subjectId } = req.body;

    // Ensure the subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        status: "error",
        message: "Subject not found",
        data: null,
      });
    }

    // Check if students are allowed to join
    if (!subject.allowStudentAddition) {
      return res.status(403).json({
        status: "error",
        message: "Joining this subject is not allowed at the moment",
        data: null,
      });
    }

    // Check if the student is already enrolled in the subject
    if (subject.students.includes(studentId)) {
      return res.status(409).json({
        status: "error",
        message: "You are already enrolled in this subject",
        data: null,
      });
    }

    // Add the student to the subject
    subject.students.push(studentId);
    await subject.save();

    res.status(200).json({
      status: "success",
      message: "Successfully joined the subject",
      data: { subjectId, studentId },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

// Leave a subject by student
const leaveSubject = async (req, res) => {
  try {
    const { error } = validateLeaveSubjectSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    // Extract student ID and subject ID from the request
    const studentId = req.user.id; // Extract from the authenticated user
    const { subjectId } = req.body;

    // Ensure the subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        status: "error",
        message: "Subject not found",
        data: null,
      });
    }

    // Check if the student is enrolled in the subject
    if (!subject.students.includes(studentId)) {
      return res.status(409).json({
        status: "error",
        message: "You are not enrolled in this subject",
        data: null,
      });
    }

    // Check if students are allowed to join/leave
    if (!subject.allowStudentAddition) {
      return res.status(403).json({
        status: "error",
        message: "Dropping this subject is not allowed at the moment",
        data: null,
      });
    }

    // Remove the student from the subject
    subject.students = subject.students.filter(
      (id) => id.toString() !== studentId.toString()
    );
    await subject.save();

    res.status(200).json({
      status: "success",
      message: "Successfully left the subject",
      data: { subjectId, studentId },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = { createSubject, joinSubject, leaveSubject };
