const Teacher = require("../models/teacher.model");
const Subject = require("../models/subject.model");
const Class = require("../models/class.model");
const Student = require("../models/student.model");

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
const getTeacherClasses = async (req, res) => {
  try {
    const userId = req.user.id;

    const teacher = await Teacher.findById(userId);
    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
      });
    }

    const classes = await Class.find({ teacher: teacher._id }).populate([
      { path: "subjects", select: "name allowStudentAddition" },
    ]);

    const classIds = classes.map((cls) => cls._id);
    const students = await Student.find({ classId: { $in: classIds } });

    const formattedClasses = classes.map((cls) => ({
      _id: cls._id,
      name: cls.name,
      subjects: cls.subjects.map((subj) => ({
        name: subj.name,
        allowStudentAddition: subj.allowStudentAddition,
      })),
      totalStudents: students.filter((student) =>
        student.classId.equals(cls._id)
      ).length,
    }));

    res.status(200).json({
      status: "success",
      message: "Teacher classes retrieved successfully",
      data: formattedClasses,
    });
  } catch (err) {
    console.error("Error retrieving teacher classes:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = { getTeacherDashboardStats, getTeacherClasses };
