const Student = require("../models/student.model");
const Teacher = require("../models/teacher.model");
const Class = require("../models/class.model");
const Admin = require("../models/admin.model");
const Subject = require("../models/subject.model");

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
      data: { totalStudents, totalTeachers, totalClasses, schoolId },
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

const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params; // Extract teacherId from the route parameters

    // Ensure the teacherId is provided
    if (!teacherId) {
      return res.status(400).json({
        status: "error",
        message: "Teacher ID is required",
      });
    }

    // Check if the teacher is assigned to any class
    const assignedClass = await Class.findOne({ teacher: teacherId });
    if (assignedClass) {
      return res.status(400).json({
        status: "error",
        message: `Teacher is assigned to class ${assignedClass.name}. Please reassign or remove the teacher before deletion.`,
      });
    }

    // Check if the teacher is assigned to any subject
    const assignedSubject = await Subject.findOne({ teacherId });
    if (assignedSubject) {
      return res.status(400).json({
        status: "error",
        message: `Teacher is assigned to subject ${assignedSubject.name}. Please reassign or remove the teacher before deletion.`,
      });
    }

    // Find and delete the teacher by teacherId field
    const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);

    // If teacher not found, return an error
    if (!deletedTeacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Teacher deleted successfully",
      data: null,
    });
  } catch (err) {
    console.error("Error deleting teacher:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const listStudentsBySchool = async (req, res) => {
  try {
    const { id: adminId } = req.user;

    // Ensure the admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
      });
    }

    // Find all students in the admin's school
    const students = await Student.find({ schoolId: admin.schoolId })
      .populate("classId", "name")
      .select("fullName studentId email classId");

    res.status(200).json({
      status: "success",
      message: "Students retrieved successfully",
      data: students,
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};


module.exports = {
  getTotalStudents,
  getTotalTeachers,
  getTotalClasses,
  getStatistics,
  getAllTeachers,
  deleteTeacher,
  listStudentsBySchool, 
};
