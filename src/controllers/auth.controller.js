const Admin = require("../models/admin.model");
const School = require("../models/school.model");
const Teacher = require("../models/teacher.model");
const Student = require("../models/student.model");
const Class = require("../models/class.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateUniqueId } = require("../utils/idGenerator");
const {
  validateAdminSignupSchema,
  validateAdminLoginSchema,
  validateCreateTeacherSchema,
  validateCreateStudentSchema,
  validateTeacherLoginSchema,
  validateStudentLoginSchema,
} = require("../utils/auth.validator");

const adminSignup = async (req, res) => {
  try {
    const { error } = validateAdminSignupSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    const {
      fullName,
      schoolName,
      adminEmail,
      schoolEmail,
      schoolAddress,
      password,
    } = req.body;
    const schoolId = generateUniqueId("SCH");
    const admin = await Admin.create({
      fullName,
      schoolName,
      adminEmail,
      schoolEmail,
      schoolAddress,
      password,
      schoolId,
    });
    await School.create({
      name: schoolName,
      address: schoolAddress,
      schoolId,
      admin: admin._id,
    });
    res
      .status(201)
      .json({ message: "Admin and school created successfully", schoolId });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { error } = validateAdminLoginSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    const { adminEmail, password } = req.body;
    const admin = await Admin.findOne({ adminEmail });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

const createTeacher = async (req, res) => {
  try {
    // Validate the request body
    const { error } = validateCreateTeacherSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }

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

    // Extract teacher details from the request body
    const { fullName, email, password } = req.body;

    // Check if a teacher with the given email already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(409).json({
        status: "error",
        message: "A teacher with this email already exists",
        data: null,
      });
    }

    // Generate a unique teacherId
    const teacherId = generateUniqueId("TCH");

    // Create the teacher
    const newTeacher = await Teacher.create({
      fullName,
      teacherId,
      schoolId,
      email,
      password,
    });

    // Respond with success
    res.status(201).json({
      status: "success",
      message: "Teacher created successfully",
      data: newTeacher,
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

const createStudent = async (req, res) => {
  try {
    // Validate the request body
    const { error } = validateCreateStudentSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }

    // Extract user details from req.user
    const { id: userId, role } = req.user;

    // Fetch schoolId based on the user's role
    let schoolId;
    let userRoleBasedId;
    if (role === "admin") {
      const admin = await Admin.findById(userId);
      if (!admin) {
        return res
          .status(404)
          .json({ status: "error", message: "Admin not found", data: null });
      }
      schoolId = admin.schoolId;
      userRoleBasedId = "admin";
    } else if (role === "teacher") {
      const teacher = await Teacher.findById(userId);
      if (!teacher) {
        return res
          .status(404)
          .json({ status: "error", message: "Teacher not found", data: null });
      }
      schoolId = teacher.schoolId;
      userRoleBasedId = teacher.teacherId;
    } else {
      return res
        .status(403)
        .json({ status: "error", message: "Unauthorized action", data: null });
    }

    // Extract other details from the request body
    const { fullName, email, password, classId } = req.body;

    // Ensure the class exists and belongs to the same school
    const studentClass = await Class.findOne({ _id: classId, schoolId });
    if (!studentClass) {
      return res.status(404).json({
        status: "error",
        message: "Class not found for the specified school",
        data: null,
      });
    }

    // Generate a unique studentId
    const studentId = generateUniqueId("STD");

    // Create the student
    const newStudent = await Student.create({
      fullName,
      email,
      schoolId,
      studentId,
      password,
      classId,
      createdBy: userRoleBasedId, // Track who created the student
    });

    // Respond with success
    res.status(201).json({
      status: "success",
      message: "Student created successfully",
      data: {
        studentId,
        fullName,
        email,
        classId,
        schoolId,
        createdBy: userRoleBasedId,
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

const teacherLogin = async (req, res) => {
  try {
    const { error } = validateTeacherLoginSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    const { teacherId, password, schoolId } = req.body;
    const teacher = await Teacher.findOne({ teacherId, schoolId });
    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

const studentLogin = async (req, res) => {
  try {
    const { error } = validateStudentLoginSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }
    const { studentId, password, schoolId } = req.body;
    const student = await Student.findOne({ studentId, schoolId });
    if (!student) {
      return res
        .status(404)
        .json({ status: "error", message: "Student not found", data: null });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = {
  adminSignup,
  adminLogin,
  createTeacher,
  createStudent,
  teacherLogin,
  studentLogin,
};
