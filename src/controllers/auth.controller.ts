import { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.model";
import School from "../models/school.model";
import Teacher from "../models/teacher.model";
import Student from "../models/student.model";
import Class from "../models/class.model";
import { generateUniqueId } from "../utils/idGenerator";
import {
  validateAdminSignupSchema,
  validateAdminLoginSchema,
  validateCreateTeacherSchema,
  validateCreateStudentSchema,
  validateTeacherLoginSchema,
  validateStudentLoginSchema,
} from "../utils/auth.validator";

// Admin Signup
export const adminSignup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateAdminSignupSchema(req.body);
    if (error) {
      res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
      return;
    }

    const {
      fullName,
      schoolName,
      adminEmail,
      schoolEmail,
      schoolAddress,
      password,
    } = req.body;

    const existingAdmin = await Admin.findOne({ adminEmail });
    if (existingAdmin) {
      res
        .status(409)
        .json({
          status: "error",
          message: "Admin with this email already exists",
        });
      return;
    }

    const existingSchool = await School.findOne({ schoolEmail });
    if (existingSchool) {
      res
        .status(409)
        .json({
          status: "error",
          message: "School with this email already exists",
        });
      return;
    }

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
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Admin Login
export const adminLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateAdminLoginSchema(req.body);
    if (error) {
      res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
      return;
    }

    const { adminEmail, password } = req.body;
    const admin = await Admin.findOne({ adminEmail });

    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Create Teacher
export const createTeacher = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateCreateTeacherSchema(req.body);
    if (error) {
      res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
      return;
    }

    const admin = await Admin.findById(req.user?.id);
    if (!admin) {
      res.status(404).json({ status: "error", message: "Admin not found" });
      return;
    }

    const { fullName, email, password } = req.body;

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      res
        .status(409)
        .json({
          status: "error",
          message: "A teacher with this email already exists",
        });
      return;
    }

    const teacherId = generateUniqueId("TCH");

    const newTeacher = await Teacher.create({
      fullName,
      teacherId,
      schoolId: admin.schoolId,
      email,
      password,
    });

    res
      .status(201)
      .json({
        status: "success",
        message: "Teacher created successfully",
        data: newTeacher,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Create Student
export const createStudent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateCreateStudentSchema(req.body);
    if (error) {
      res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
      return;
    }

    const { id: userId, role } = req.user!;
    let schoolId: string | undefined;
    let userRoleBasedId: string;

    if (role === "admin") {
      const admin = await Admin.findById(userId);
      if (!admin) {
        res.status(404).json({ status: "error", message: "Admin not found" });
        return;
      }
      schoolId = admin.schoolId;
      userRoleBasedId = "admin";
    } else if (role === "teacher") {
      const teacher = await Teacher.findById(userId);
      if (!teacher) {
        res.status(404).json({ status: "error", message: "Teacher not found" });
        return;
      }
      schoolId = teacher.schoolId;
      userRoleBasedId = teacher.teacherId;
    } else {
      res.status(403).json({ status: "error", message: "Unauthorized action" });
      return;
    }

    const { fullName, email, password, classId } = req.body;

    const studentClass = await Class.findOne({ _id: classId, schoolId });
    if (!studentClass) {
      res
        .status(404)
        .json({
          status: "error",
          message: "Class not found for the specified school",
        });
      return;
    }

    const studentId = generateUniqueId("STD");

    const newStudent = await Student.create({
      fullName,
      email,
      schoolId,
      studentId,
      password,
      classId,
      createdBy: userRoleBasedId,
    });

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
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Teacher Login
export const teacherLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateTeacherLoginSchema(req.body);
    if (error) {
      res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
      return;
    }

    const { teacherId, password, schoolId } = req.body;
    const teacher = await Teacher.findOne({ teacherId, schoolId });
    if (!teacher) {
      res.status(404).json({ status: "error", message: "Teacher not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Student Login
export const studentLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateStudentLoginSchema(req.body);
    if (error) {
      res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
      return;
    }

    const { studentId, password, schoolId } = req.body;
    const student = await Student.findOne({ studentId, schoolId });
    if (!student) {
      res.status(404).json({ status: "error", message: "Student not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
