import { Request, Response } from "express";
import { ObjectId, Types } from "mongoose";
import Teacher from "../models/teacher.model";
import Subject, { ISubject } from "../models/subject.model";
import Class, { IClass } from "../models/class.model";
import Student from "../models/student.model";

// Define the shape of the user object in the request
interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}

// Corrected interfaces for populated fields
interface PopulatedSubject extends Omit<ISubject, "classId"> {
  classId: {
    _id: ObjectId;
    name: string;
  };
}

interface PopulatedClass extends Omit<IClass, "_id" | "subjects"> {
  _id: ObjectId;
  subjects: {
    name: string;
    allowStudentAddition: boolean;
  }[];
}

// Get teacher dashboard statistics
export const getTeacherDashboardStats = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
      return;
    }

    const teacher = await Teacher.findById(teacherId).select(
      "fullName email teacherId"
    );
    if (!teacher) {
      res.status(404).json({
        status: "error",
        message: "Teacher not found",
        data: null,
      });
      return;
    }

    const subjects = await Subject.find({ teacherId })
      .populate<{ classId: { _id: ObjectId; name: string } }>("classId", "name") // Correctly typed `populate`
      .select("name classId");

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

// Get all classes assigned to a teacher
export const getTeacherClasses = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const teacher = await Teacher.findById(userId);
    if (!teacher) {
      res.status(404).json({
        status: "error",
        message: "Teacher not found",
      });
      return;
    }

    const classes = await Class.find({
      teacher: teacher._id,
    }).populate<PopulatedClass>({
      path: "subjects",
      model: Subject,
      select: "name allowStudentAddition",
    });

    const classIds = classes.map((cls) => cls._id.toString());
    const students = await Student.find({
      classId: { $in: classIds.map((id) => new Types.ObjectId(id)) },
    });

    const formattedClasses = classes.map((cls) => ({
      _id: cls._id.toString(),
      name: cls.name,
      subjects: cls.subjects.map((subj) => ({
        name: subj.name,
        allowStudentAddition: subj.allowStudentAddition,
      })),
      totalStudents: students.filter(
        (student) => student.classId.toString() === cls._id.toString()
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
