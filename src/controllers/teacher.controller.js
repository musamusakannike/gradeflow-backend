const Teacher = require("../models/teacher.model");
const Subject = require("../models/subject.model");
const Class = require("../models/class.model");

const getTeacherDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user.id; // Extract teacher ID from the authenticated user

    // Fetch teacher details
    const teacher = await Teacher.findById(teacherId).select(
      "fullName email teacherId"
    );
    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
        data: null,
      });
    }

    // Fetch all subjects taught by the teacher with class details
    const subjects = await Subject.find({ teacherId })
      .populate("classId", "name") // Populate class names
      .select("name classId"); // Select subject name and class reference

    const totalSubjects = subjects.length;

    // Extract unique class IDs
    const uniqueClassIds = [
      ...new Set(subjects.map((subject) => subject.classId._id.toString())),
    ];

    // Fetch details of all unique classes
    const classes = await Class.find({ _id: { $in: uniqueClassIds } }).select(
      "name"
    );

    const totalClasses = classes.length;

    // Respond with the teacher's statistics
    res.status(200).json({
      status: "success",
      message: "Teacher dashboard statistics retrieved successfully",
      data: {
        teacherDetails: teacher,
        totalSubjects,
        totalClasses,
        subjects: subjects.map((subject) => ({
          subjectName: subject.name,
          className: subject.classId.name,
        })),
        classes: classes.map((cls) => ({
          classId: cls._id,
          className: cls.name,
        })),
      },
    });
  } catch (err) {
    console.error("Error retrieving teacher dashboard statistics:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = { getTeacherDashboardStats };
