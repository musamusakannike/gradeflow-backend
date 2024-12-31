const Subject = require("../models/subject.model"); // Subject model
const Class = require("../models/class.model"); // Class model
const Teacher = require("../models/teacher.model"); // Teacher model
const {validateCreateSubjectSchema} = require("../utils/subject.validator"); // Validation schema

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

module.exports = { createSubject };
