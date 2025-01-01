const Subject = require("../models/subject.model"); // Subject model
const Class = require("../models/class.model"); // Class model
const Teacher = require("../models/teacher.model"); // Teacher model
const Student = require("../models/student.model"); // Student model
const {
  validateCreateSubjectSchema,
  validateJoinSubjectSchema,
  validateLeaveSubjectSchema,
  validateToggleSubjectJoinSchema,
  validateToggleJoinPermissionsBulkSchema,
  validateAddRemoveStudentSchema,
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

const viewEnrolledSubjects = async (req, res) => {
  try {
    // Get the student ID from the authenticated user
    const studentId = req.user.id;

    // Query subjects where the student is enrolled
    const enrolledSubjects = await Subject.find({ students: studentId })
      .populate("teacherId", "fullName email") // Populate teacher details
      .populate("classId", "name") // Populate class details
      .select("name classId teacherId"); // Return specific fields

    res.status(200).json({
      status: "success",
      message: "Enrolled subjects retrieved successfully",
      data: enrolledSubjects,
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

// View students in subjects by teacher
const viewStudentsInSubjects = async (req, res) => {
  try {
    // Get the teacher ID from the authenticated user
    const teacherId = req.user.id;

    // Query subjects assigned to the teacher
    const subjects = await Subject.find({ teacherId })
      .populate("classId", "name") // Populate class details
      .select("name classId students"); // Select specific fields

    // Prepare the response with student details
    const subjectDetails = await Promise.all(
      subjects.map(async (subject) => {
        const students = await Student.find({
          _id: { $in: subject.students },
        }).select("fullName email studentId"); // Fetch student details
        return {
          subjectId: subject._id,
          subjectName: subject.name,
          className: subject.classId.name,
          students,
        };
      })
    );

    res.status(200).json({
      status: "success",
      message: "Students in subjects retrieved successfully",
      data: subjectDetails,
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

// Toggle subject join permission by admin and teacher
const toggleSubjectJoinPermission = async (req, res) => {
  try {
    const { error } = validateToggleSubjectJoinSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    // Extract subject ID and desired allowStudentAddition flag from the request body
    const { subjectId, allowStudentAddition } = req.body;

    // Ensure the subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        status: "error",
        message: "Subject not found",
        data: null,
      });
    }

    // Update the allowStudentAddition flag
    subject.allowStudentAddition = allowStudentAddition;
    await subject.save();

    res.status(200).json({
      status: "success",
      message: `Subject join permission has been ${
        allowStudentAddition ? "enabled" : "disabled"
      }`,
      data: { subjectId, allowStudentAddition },
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

const toggleJoinPermissionsBulk = async (req, res) => {
  try {
    const { error } = validateToggleJoinPermissionsBulkSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    // Extract subject IDs and the desired flag from the request body
    const { subjectIds, allowStudentAddition } = req.body;

    // Validate that subjectIds is a non-empty array
    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid input: subjectIds must be a non-empty array",
        data: null,
      });
    }

    // Update the allowStudentAddition flag for all specified subjects
    const result = await Subject.updateMany(
      { _id: { $in: subjectIds } }, // Match all subjects in the subjectIds array
      { $set: { allowStudentAddition } } // Set the allowStudentAddition field
    );

    res.status(200).json({
      status: "success",
      message: `Join permissions have been ${
        allowStudentAddition ? "enabled" : "disabled"
      } for ${result.modifiedCount} subject(s)`,
      data: {
        updatedCount: result.modifiedCount,
        allowStudentAddition,
      },
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

// Allow teachers to add students to their subjects
const addStudentToSubject = async (req, res) => {
  try {
    const { error } = validateAddRemoveStudentSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    // Extract the teacher ID, student ID, and subject ID from the request
    const teacherId = req.user.id; // Authenticated teacher
    const { studentId, subjectId } = req.body;

    // Ensure the subject exists and is assigned to the teacher
    const subject = await Subject.findOne({ _id: subjectId, teacherId });
    if (!subject) {
      return res.status(404).json({
        status: "error",
        message:
          "Subject not found or you are not authorized to manage this subject",
        data: null,
      });
    }

    // Ensure the student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        status: "error",
        message: "Student not found",
        data: null,
      });
    }

    // Check if the student is already enrolled in the subject
    if (subject.students.includes(studentId)) {
      return res.status(409).json({
        status: "error",
        message: "Student is already enrolled in this subject",
        data: null,
      });
    }

    // Add the student to the subject
    subject.students.push(studentId);
    await subject.save();

    res.status(200).json({
      status: "success",
      message: "Student added to the subject successfully",
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

// Allow teachers to remove students from their subjects
const removeStudentFromSubject = async (req, res) => {
  try {
    const { error } = validateAddRemoveStudentSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    // Extract the teacher ID, student ID, and subject ID from the request
    const teacherId = req.user.id; // Authenticated teacher
    const { studentId, subjectId } = req.body;

    // Ensure the subject exists and is assigned to the teacher
    const subject = await Subject.findOne({ _id: subjectId, teacherId });
    if (!subject) {
      return res.status(404).json({
        status: "error",
        message:
          "Subject not found or you are not authorized to manage this subject",
        data: null,
      });
    }

    // Check if the student is enrolled in the subject
    if (!subject.students.includes(studentId)) {
      return res.status(404).json({
        status: "error",
        message: "Student is not enrolled in this subject",
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
      message: "Student removed from the subject successfully",
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

module.exports = {
  createSubject,
  joinSubject,
  leaveSubject,
  viewEnrolledSubjects,
  viewStudentsInSubjects,
  toggleSubjectJoinPermission,
  toggleJoinPermissionsBulk,
  addStudentToSubject,
  removeStudentFromSubject,
};
