const Student = require("../models/student.model");
const Teacher = require("../models/teacher.model");
const Class = require("../models/class.model");
const Admin = require("../models/admin.model");

// Get total number of students
const getTotalStudents = async (req, res) => {
  try {
    const { id: userId } = req.user;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }
    // Get schoolId from the user
    const { schoolId } = await Admin.findById(userId);
    const totalStudents = await Student.countDocuments({ schoolId });

    res.status(200).json({
      status: "success",
      data: { totalStudents },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Get total number of teachers
const getTotalTeachers = async (req, res) => {
  try {
    const { id: userId } = req.user;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }
    // Get schoolId from the user
    const { schoolId } = await Admin.findById(userId);
    // Count the number of teachers in the school using the schoolId
    const totalTeachers = await Teacher.countDocuments({ schoolId });

    res.status(200).json({
      status: "success",
      data: { totalTeachers },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Get total number of classes
const getTotalClasses = async (req, res) => {
  try {
    const { id: userId } = req.user;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }
    // Get schoolId from the user
    const { schoolId } = await Admin.findById(userId);

    // Count the number of classes in the school using the schoolId
    const totalClasses = await Class.countDocuments({ schoolId });

    res.status(200).json({
      status: "success",
      data: { totalClasses },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getStatistics = async (req, res) => {
  try {
    const { id: userId } = req.user;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }
    const { schoolId } = await Admin.findById(userId);

    const totalStudents = await Student.countDocuments({ schoolId });
    const totalTeachers = await Teacher.countDocuments({ schoolId });
    const totalClasses = await Class.countDocuments({ schoolId });

    res.status(200).json({
      status: "success",
      data: { totalStudents, totalTeachers, totalClasses },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Get a list of all teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({}, "fullName email teacherId"); // Select only required fields
    res.status(200).json({
      status: "success",
      message: "Teachers retrieved successfully",
      data: teachers,
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
  getTotalStudents,
  getTotalTeachers,
  getTotalClasses,
  getStatistics,
  getAllTeachers
};
