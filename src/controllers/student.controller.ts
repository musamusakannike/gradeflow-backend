import { Request, Response } from "express";
import Student from "../models/student.model";

interface CustomRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Update student details
export const updateStudent = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params; // Get student ID from route params
    const { fullName, email, password, classId } = req.body; // Get updated fields from request body

    // Find the student by studentId
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      res.status(404).json({
        status: "error",
        message: "Student not found",
        data: null,
      });
      return;
    }

    // Update fields if provided in the request
    if (fullName) student.fullName = fullName;
    if (email) student.email = email;
    if (password) student.password = password; // Password will be hashed due to pre-save hook
    if (classId) student.classId = classId;

    // Save the updated student document
    await student.save();

    res.status(200).json({
      status: "success",
      message: "Student details updated successfully",
      data: student,
    });
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};