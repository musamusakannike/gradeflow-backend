import { Request, Response } from "express";
import Admin from "../models/admin.model";
import Class from "../models/class.model";
import Teacher from "../models/teacher.model";
import Student from "../models/student.model";
import {
  validateClassSchema,
  validateAssignTeacherSchema,
  validateListStudentsSchema,
  validateListClassesForTeacherSchema,
} from "../utils/class.validator";
import { ObjectId } from "mongodb";

interface CustomRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Create a new class
export const createClass = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { error } = validateClassSchema(req.body);
    if (error) {
      res.status(400).json({ status: "error", message: error.details[0].message, data: null });
      return;
    }

    if (req.user?.role !== "admin") {
      res.status(403).json({ status: "error", message: "Forbidden: Only admins can create classes", data: null });
      return;
    }

    const { name, teacherId } = req.body;
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      res.status(404).json({ status: "error", message: "Admin not found", data: null });
      return;
    }

    const { schoolId } = admin;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      res.status(404).json({ status: "error", message: "Teacher not found", data: null });
      return;
    }

    if (teacher.schoolId !== schoolId) {
      res.status(403).json({ status: "error", message: "Teacher not associated with the admin's school", data: null });
      return;
    }

    const existingClass = await Class.findOne({ name, teacher: teacherId });
    if (existingClass) {
      res.status(409).json({ status: "error", message: "A class with this name already exists for the teacher", data: null });
      return;
    }

    const newClass = await Class.create({ name, schoolId, teacher: teacherId });

    res.status(201).json({ status: "success", message: "Class created successfully", class: newClass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error", data: null });
  }
};

// Assign a teacher to a class
export const assignTeacherToClass = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { error } = validateAssignTeacherSchema(req.body);
    if (error) {
      res.status(400).json({ status: "error", message: error.details[0].message, data: null });
      return;
    }

    const { id: userId, role } = req.user!;
    const { classId, teacherId } = req.body;

    if (role !== "admin") {
      res.status(403).json({ status: "error", message: "Unauthorized action", data: null });
      return;
    }

    const admin = await Admin.findById(userId);
    if (!admin) {
      res.status(404).json({ status: "error", message: "Admin not found", data: null });
      return;
    }

    const teacher = await Teacher.findOne({ _id: teacherId, schoolId: admin.schoolId });
    if (!teacher) {
      res.status(404).json({ status: "error", message: "Teacher not found or does not belong to this school", data: null });
      return;
    }

    const studentClass = await Class.findOne({ _id: classId, schoolId: admin.schoolId });
    if (!studentClass) {
      res.status(404).json({ status: "error", message: "Class not found for the specified school", data: null });
      return;
    }

    studentClass.teacher = teacher._id as unknown as ObjectId;
    await studentClass.save();

    res.status(200).json({ status: "success", message: "Teacher assigned to class successfully", data: { classId, teacherId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error", data: null });
  }
};

// List students in a class
export const listStudentsInClass = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { error } = validateListStudentsSchema(req.query);
    if (error) {
      res.status(400).json({ status: "error", message: error.details[0].message, data: null });
      return;
    }

    const { classId, page = "1", limit = "10" } = req.query as { classId: string; page?: string; limit?: string };

    const studentClass = await Class.findById(classId);
    if (!studentClass) {
      res.status(404).json({ status: "error", message: "Class not found", data: null });
      return;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const students = await Student.find({ classId }).skip(skip).limit(parseInt(limit)).sort({ fullName: 1 });
    const totalStudents = await Student.countDocuments({ classId });

    res.status(200).json({
      status: "success",
      message: "Students retrieved successfully",
      data: {
        students,
        pagination: {
          totalStudents,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalStudents / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error", data: null });
  }
};

// List classes for a teacher
export const listClassesForTeacher = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { error } = validateListClassesForTeacherSchema(req.query);
    if (error) {
      res.status(400).json({ status: "error", message: error.details[0].message, data: null });
      return;
    }

    if (req.user?.role !== "teacher" && req.user?.role !== "admin") {
      res.status(403).json({ status: "error", message: "Only teachers and admins can access this endpoint", data: null });
      return;
    }

    const { teacherId } = req.query as { teacherId: string };

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      res.status(404).json({ status: "error", message: "Teacher not found", data: null });
      return;
    }

    const classes = await Class.find({ teacher: teacherId }).sort({ name: 1 });

    const classesWithDetails = await Promise.all(
      classes.map(async (classObj) => {
        const studentCount = await Student.countDocuments({ classId: classObj._id });
        return { ...classObj.toObject(), studentCount };
      })
    );

    res.status(200).json({
      status: "success",
      message: "Classes retrieved successfully",
      data: classesWithDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error", data: null });
  }
};

export const listClassesWithTeachers = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    // Query all classes and populate teacher details
    const classes = await Class.find()
      .populate("teacher", "fullName email") // Include teacher details
      .select("name teacher"); // Select specific fields

    res.status(200).json({
      status: "success",
      message: "Classes and their teachers retrieved successfully",
      data: classes,
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

// Delete a class
export const deleteClass = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;

    // Check if the class exists
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      res.status(404).json({
        status: "error",
        message: "Class not found",
        data: null,
      });
      return;
    }

    await Class.findByIdAndDelete(classId);

    res.status(200).json({
      status: "success",
      message: "Class deleted successfully",
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

// Update a class
export const updateClass = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { name, teacherId } = req.body;

    // Check if the class exists
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      res.status(404).json({
        status: "error",
        message: "Class not found",
        data: null,
      });
      return; // Ensures the function stops execution
    }

    // Check if the teacher exists
    if (teacherId) {
      const teacherExists = await Teacher.findById(teacherId);
      if (!teacherExists) {
        res.status(404).json({
          status: "error",
          message: "Teacher not found",
          data: null,
        });
        return; // Ensures the function stops execution
      }
    }

    // Update the class
    existingClass.name = name || existingClass.name;
    existingClass.teacher = teacherId || existingClass.teacher;
    await existingClass.save();

    res.status(200).json({
      status: "success",
      message: "Class updated successfully",
      data: existingClass,
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
