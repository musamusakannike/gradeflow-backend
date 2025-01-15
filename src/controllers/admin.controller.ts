import { Request, Response } from "express";
import Student from "../models/student.model";
import Teacher from "../models/teacher.model";
import Class from "../models/class.model";
import Admin from "../models/admin.model";
import Subject from "../models/subject.model";

declare module "express" {
  export interface Request {
    user?: {
      id: string;
    };
  }
}

// Get total number of students
export const getTotalStudents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req.user as { id: string };
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const admin = await Admin.findById(userId);
    if (!admin) {
      res.status(404).json({ status: "error", message: "Admin not found" });
      return;
    }

    const totalStudents = await Student.countDocuments({
      schoolId: admin.schoolId,
    });
    res.status(200).json({ status: "success", data: { totalStudents } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Get total number of teachers
export const getTotalTeachers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req.user as { id: string };
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const admin = await Admin.findById(userId);
    if (!admin) {
      res.status(404).json({ status: "error", message: "Admin not found" });
      return;
    }

    const totalTeachers = await Teacher.countDocuments({
      schoolId: admin.schoolId,
    });
    res.status(200).json({ status: "success", data: { totalTeachers } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Get total number of classes
export const getTotalClasses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req.user as { id: string };
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const admin = await Admin.findById(userId);
    if (!admin) {
      res.status(404).json({ status: "error", message: "Admin not found" });
      return;
    }

    const totalClasses = await Class.countDocuments({
      schoolId: admin.schoolId,
    });
    res.status(200).json({ status: "success", data: { totalClasses } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Get overall statistics
export const getStatistics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req.user as { id: string };
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const admin = await Admin.findById(userId);
    if (!admin) {
      res.status(404).json({ status: "error", message: "Admin not found" });
      return;
    }

    const totalStudents = await Student.countDocuments({
      schoolId: admin.schoolId,
    });
    const totalTeachers = await Teacher.countDocuments({
      schoolId: admin.schoolId,
    });
    const totalClasses = await Class.countDocuments({
      schoolId: admin.schoolId,
    });

    res.status(200).json({
      status: "success",
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        schoolId: admin.schoolId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Get a list of all teachers
export const getAllTeachers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const teachers = await Teacher.find({}, "fullName email teacherId");
    res.status(200).json({
      status: "success",
      message: "Teachers retrieved successfully",
      data: teachers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// Delete a teacher
export const deleteTeacher = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teacherId } = req.params;
    if (!teacherId) {
      res
        .status(400)
        .json({ status: "error", message: "Teacher ID is required" });
      return;
    }

    const assignedClass = await Class.findOne({ teacher: teacherId });
    if (assignedClass) {
      res.status(400).json({
        status: "error",
        message: `Teacher is assigned to class ${assignedClass.name}. Please reassign or remove the teacher before deletion.`,
      });
      return;
    }

    const assignedSubject = await Subject.findOne({ teacherId });
    if (assignedSubject) {
      res.status(400).json({
        status: "error",
        message: `Teacher is assigned to subject ${assignedSubject.name}. Please reassign or remove the teacher before deletion.`,
      });
      return;
    }

    const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);
    if (!deletedTeacher) {
      res.status(404).json({ status: "error", message: "Teacher not found" });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Teacher deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting teacher:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

// List all students by school
export const listStudentsBySchool = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: adminId } = req.user as { id: string };

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ status: "error", message: "Admin not found" });
      return;
    }

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
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
