const Admin = require("../models/admin.model");
const Class = require("../models/class.model");
const Teacher = require("../models/teacher.model");
const Student = require("../models/student.model");
const { validateClassSchema, validateAssignTeacherSchema, validateListStudentsSchema, validateListClassesForTeacherSchema } = require("../utils/class.validator");

const createClass = async (req, res) => {
  try {
    const { error } = validateClassSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }

    // Only admins can create classes
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: Only admins can create classes",
        data: null,
      });
    }

    const { name, teacherId } = req.body;
    // Retrieve the admin details using req.user.id
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
        data: null,
      });
    }

    // Extract the schoolId from the admin's details
    const { schoolId } = admin;

    // Check if the teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
        data: null,
      });
    }

    // Check if the teacher is associated with the admin's school
    if (teacher.schoolId !== schoolId) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: Teacher not associated with the admin's school",
        data: null,
      });
    }

    // Check if a class with the same name already exists for the same teacher
    const existingClass = await Class.findOne({ name, teacher: teacherId });
    if (existingClass) {
      return res.status(409).json({
        status: "error",
        message: "A class with this name already exists for the teacher",
        data: null,
      });
    }

    // Create the class
    const newClass = await Class.create({
      name,
      schoolId,
      teacher: teacherId,
    });

    res
      .status(201)
      .json({
        status: "success",
        message: "Class created successfully",
        class: newClass,
      });
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ status: "error", message: "Internal server error", data: null });
  }
};

const assignTeacherToClass = async (req, res) => {
  try {
    // Validate request body
    const { error } = validateAssignTeacherSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }

    // Extract user details and request body
    const { id: userId, role } = req.user;
    const { classId, teacherId } = req.body;

    // Determine the schoolId based on the role
    let schoolId;
    if (role === 'admin') {
      const admin = await Admin.findById(userId);
      if (!admin) {
        return res.status(404).json({
          status: "error",
          message: "Admin not found",
          data: null,
        });
      }
      schoolId = admin.schoolId;
    } else {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized action",
        data: null,
      });
    }

    // Ensure the teacher exists and belongs to the same school
    const teacher = await Teacher.findOne({ _id: teacherId, schoolId });
    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found or does not belong to this school",
        data: null,
      });
    }

    // Ensure the class exists and belongs to the same school
    const studentClass = await Class.findOne({ _id: classId, schoolId });
    if (!studentClass) {
      return res.status(404).json({
        status: "error",
        message: "Class not found for the specified school",
        data: null,
      });
    }

    // Assign the teacher to the class
    studentClass.teacher = teacher._id;
    await studentClass.save();

    res.status(200).json({
      status: "success",
      message: "Teacher assigned to class successfully",
      data: { classId, teacherId },
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

const listStudentsInClass = async (req, res) => {
  try {
    // Validate the query parameters
    const { error } = validateListStudentsSchema(req.query);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }

    // Extract parameters
    const { classId, page = 1, limit = 10 } = req.query;

    // Ensure the class exists
    const studentClass = await Class.findById(classId);
    if (!studentClass) {
      return res.status(404).json({
        status: "error",
        message: "Class not found",
        data: null,
      });
    }

    // Pagination logic
    const skip = (page - 1) * limit;

    // Query students in the specified class
    const students = await Student.find({ classId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ fullName: 1 }); // Sort alphabetically by fullName

    // Total number of students in the class
    const totalStudents = await Student.countDocuments({ classId });

    // Respond with paginated students
    res.status(200).json({
      status: "success",
      message: "Students retrieved successfully",
      data: {
        students,
        pagination: {
          totalStudents,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalStudents / limit),
        },
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

const listClassesForTeacher = async (req, res) => {
  try {
    // Validate the query parameters
    const { error } = validateListClassesForTeacherSchema(req.query);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }

    // Ensure the user is a teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: "error",
        message: "Only teachers and admins can access this endpoint",
        data: null,
      });
    }

    // Get the teacher's ID from the query parameters
    const { teacherId } = req.query;

    // Check if the teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
        data: null,
      });
    }

    // Query all classes assigned to the teacher
    const classes = await Class.find({ teacher: teacherId }).sort({ name: 1 });

    // Get additional details for each class (e.g., total number of students)
    const classesWithDetails = await Promise.all(
      classes.map(async (classObj) => {
        const studentCount = await Student.countDocuments({ classId: classObj._id });
        return {
          classId: classObj._id,
          name: classObj.name,
          schoolId: classObj.schoolId,
          teacherId: classObj.teacher,
          studentCount, // Total number of students in the class
        };
      })
    );

    // Respond with the list of classes including additional details
    res.status(200).json({
      status: "success",
      message: "Classes retrieved successfully",
      data: classesWithDetails,
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

module.exports = { createClass, assignTeacherToClass, listStudentsInClass, listClassesForTeacher };
