import { Request, Response } from "express";
import Subject from "../models/subject.model"; // Subject model
import Class from "../models/class.model"; // Class model
import Teacher from "../models/teacher.model"; // Teacher model
import Student from "../models/student.model"; // Student model
import { ObjectId } from "mongodb";
import {
  validateCreateSubjectSchema,
  validateJoinSubjectSchema,
  validateLeaveSubjectSchema,
  validateToggleSubjectJoinSchema,
  validateToggleJoinPermissionsBulkSchema,
  validateAddRemoveStudentSchema,
} from "../utils/subject.validator"; // Validation schema

interface CustomRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Create a new subject
export const createSubject = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateCreateSubjectSchema(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }

    const { name, classId, teacherId } = req.body;

    const studentClass = await Class.findById(classId);
    if (!studentClass) {
      res
        .status(404)
        .json({ status: "error", message: "Class not found", data: null });
      return;
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      res
        .status(404)
        .json({ status: "error", message: "Teacher not found", data: null });
      return;
    }

    const newSubject = await Subject.create({
      name,
      classId,
      teacherId,
      students: [],
      allowStudentAddition: true,
    });

    studentClass.subjects.push(newSubject._id as ObjectId);
    await studentClass.save();

    res.status(201).json({
      status: "success",
      message: "Subject created successfully",
      data: newSubject,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "error", message: "Internal server error", data: null });
  }
};

// Join a subject
export const joinSubject = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateJoinSubjectSchema(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }

    const studentId = req.user?.id;
    const { subjectId } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      res
        .status(404)
        .json({ status: "error", message: "Subject not found", data: null });
      return;
    }

    if (!subject.allowStudentAddition) {
      res.status(403).json({
        status: "error",
        message: "Joining this subject is not allowed at the moment",
        data: null,
      });
      return;
    }

    if (studentId && subject.students.includes(new ObjectId(studentId))) {
      res.status(409).json({
        status: "error",
        message: "You are already enrolled in this subject",
        data: null,
      });
      return;
    }

    subject.students.push(new ObjectId(studentId as string));
    await subject.save();

    res.status(200).json({
      status: "success",
      message: "Successfully joined the subject",
      data: { subjectId, studentId },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "error", message: "Internal server error", data: null });
  }
};

// Leave a subject
export const leaveSubject = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateLeaveSubjectSchema(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }

    const studentId = req.user?.id;
    const { subjectId } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      res
        .status(404)
        .json({ status: "error", message: "Subject not found", data: null });
      return;
    }

    if (studentId && !subject.students.includes(new ObjectId(studentId))) {
      res.status(409).json({
        status: "error",
        message: "You are not enrolled in this subject",
        data: null,
      });
      return;
    }

    if (!subject.allowStudentAddition) {
      res.status(403).json({
        status: "error",
        message: "Dropping this subject is not allowed at the moment",
        data: null,
      });
      return;
    }

    subject.students = subject.students.filter(
      (id) => id.toString() !== studentId?.toString()
    );
    await subject.save();

    res.status(200).json({
      status: "success",
      message: "Successfully left the subject",
      data: { subjectId, studentId },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "error", message: "Internal server error", data: null });
  }
};

export const viewEnrolledSubjects = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    // Get the student ID from the authenticated user
    const studentId = req.user?.id;

    // Query subjects where the student is enrolled
    const enrolledSubjects = await Subject.find({ students: studentId })
      .populate("teacherId", "fullName email") // Populate teacher details
      .populate("classId", "name") // Populate class details
      .select("name classId teacherId"); // Return specific fields

    res.status(200).json({
      status: "success",
      message: "Enrolled subjects retrieved successfully",
      data: enrolledSubjects,
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

// View students in subjects by teacher
export const viewStudentsInSubjects = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { subjectId } = req.query; // Extract subjectId from query parameters

    if (!subjectId) {
      res.status(400).json({
        status: "error",
        message: "Subject ID is required",
        data: null,
      });
      return;
    }

    // Fetch the subject details by ID
    const subject = await Subject.findById(subjectId)
      .populate("classId", "name") // Populate class details
      .select("name classId students"); // Select specific fields

    if (!subject) {
      res.status(404).json({
        status: "error",
        message: "Subject not found",
        data: null,
      });
      return;
    }

    // Fetch the students enrolled in the subject
    const students = await Student.find({
      _id: { $in: subject.students },
    }).select("fullName email studentId"); // Fetch specific student details

    // Prepare the response
    res.status(200).json({
      status: "success",
      message: "Students in the subject retrieved successfully",
      data: {
        subjectId: subject._id,
        subjectName: subject.name,
        className: (subject.classId as any).name,
        students,
      },
    });
  } catch (err) {
    console.error("Error retrieving subject students:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

// Toggle subject join permission by admin and teacher
export const toggleSubjectJoinPermission = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateToggleSubjectJoinSchema(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }
    // Extract subject ID and desired allowStudentAddition flag from the request body
    const { subjectId, allowStudentAddition } = req.body;

    // Ensure the subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      res.status(404).json({
        status: "error",
        message: "Subject not found",
        data: null,
      });
      return;
    }

    // Update the allowStudentAddition flag
    subject.allowStudentAddition = allowStudentAddition;
    await subject.save();

    res.status(200).json({
      status: "success",
      message: `Subject join permission has been ${
        allowStudentAddition ? "enabled" : "disabled"
      }`,
      data: { subjectId, allowStudentAddition },
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

export const toggleJoinPermissionsBulk = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateToggleJoinPermissionsBulkSchema(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }
    // Extract subject IDs and the desired flag from the request body
    const { subjectIds, allowStudentAddition } = req.body;

    // Validate that subjectIds is a non-empty array
    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      res.status(400).json({
        status: "error",
        message: "Invalid input: subjectIds must be a non-empty array",
        data: null,
      });
      return;
    }

    // Update the allowStudentAddition flag for all specified subjects
    const result = await Subject.updateMany(
      { _id: { $in: subjectIds } }, // Match all subjects in the subjectIds array
      { $set: { allowStudentAddition } } // Set the allowStudentAddition field
    );

    res.status(200).json({
      status: "success",
      message: `Join permissions have been ${
        allowStudentAddition ? "enabled" : "disabled"
      } for ${result.modifiedCount} subject(s)`,
      data: {
        updatedCount: result.modifiedCount,
        allowStudentAddition,
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

// Allow teachers to add students to their subjects
export const addStudentToSubject = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateAddRemoveStudentSchema(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }
    // Extract the teacher ID, studentId, and subjectId from the request
    const teacherId = req.user?.id; // Authenticated teacher
    const { studentId, subjectId } = req.body;

    // Ensure the subject exists and is assigned to the teacher
    const subject = await Subject.findOne({ _id: subjectId, teacherId });
    if (!subject) {
      res.status(404).json({
        status: "error",
        message:
          "Subject not found or you are not authorized to manage this subject",
        data: null,
      });
      return;
    }

    // Ensure the student exists using the studentId field
    const student = await Student.findOne({ studentId });
    if (!student) {
      res.status(404).json({
        status: "error",
        message: "Student not found",
        data: null,
      });
      return;
    }

    // Check if the student is already enrolled in the subject
    if (subject.students.includes(student._id as ObjectId)) {
      res.status(409).json({
        status: "error",
        message: "Student is already enrolled in this subject",
        data: null,
      });
      return;
    }

    // Add the student to the subject
    subject.students.push(student._id as ObjectId); // Use the student's _id
    await subject.save();

    res.status(200).json({
      status: "success",
      message: "Student added to the subject successfully",
      data: { subjectId, studentId },
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

// Allow teachers to remove students from their subjects
export const removeStudentFromSubject = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { error } = validateAddRemoveStudentSchema(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }
    // Extract the teacher ID, studentId, and subjectId from the request
    const teacherId = req.user?.id; // Authenticated teacher
    const { studentId, subjectId } = req.body;

    // Ensure the subject exists and is assigned to the teacher
    const subject = await Subject.findOne({ _id: subjectId, teacherId });
    if (!subject) {
      res.status(404).json({
        status: "error",
        message:
          "Subject not found or you are not authorized to manage this subject",
        data: null,
      });
      return;
    }

    // Ensure the student exists using the studentId field
    const student = await Student.findOne({ studentId });
    if (!student) {
      res.status(404).json({
        status: "error",
        message: "Student not found",
        data: null,
      });
      return;
    }

    // Check if the student is enrolled in the subject
    if (!subject.students.includes(student._id as ObjectId)) {
      res.status(404).json({
        status: "error",
        message: "Student is not enrolled in this subject",
        data: null,
      });
      return;
    }

    // Remove the student from the subject
    subject.students = subject.students.filter(
      (id) => id.toString() !== (student._id as ObjectId).toString()
    );
    await subject.save();

    res.status(200).json({
      status: "success",
      message: "Student removed from the subject successfully",
      data: { subjectId, studentId },
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

// Get a list of subjects assigned to a specific teacher
export const getSubjectsForTeacher = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    // Get the teacher ID from the authenticated user
    const teacherId = req.user?.id;

    // Query subjects where the teacher is assigned
    const subjects = await Subject.find({ teacherId })
      .populate("classId", "name") // Populate class details
      .select("name classId students allowStudentAddition") // Include allowStudentAddition
      .populate("classId", "name"); // Ensure classId is populated with name

    // Format the response
    const formattedSubjects = subjects.map((subject) => ({
      subjectId: subject._id,
      subjectName: subject.name,
      className: (subject.classId as any)?.name || "Class not assigned",
      totalStudents: subject.students.length, // Count of enrolled students
      allowStudentAddition: subject.allowStudentAddition, // Current join permission flag
    }));

    res.status(200).json({
      status: "success",
      message: "Subjects retrieved successfully",
      data: formattedSubjects,
    });
  } catch (err) {
    console.error("Error retrieving subjects for teacher:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

export const getAllSubjects = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    // Fetch all subjects with related class and teacher details
    const subjects = await Subject.find()
      .populate("classId", "name") // Populate class name
      .populate("teacherId", "fullName email"); // Populate teacher's full name and email

    res.status(200).json({
      status: "success",
      message: "Subjects retrieved successfully",
      data: subjects,
    });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

export const deleteSubject = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { subjectId } = req.params;

    // Ensure the subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      res.status(404).json({
        status: "error",
        message: "Subject not found",
        data: null,
      });
      return;
    }

    // Remove the subject from the class's subject list
    const studentClass = await Class.findById(subject.classId);
    if (studentClass) {
      studentClass.subjects = studentClass.subjects.filter(
        (id) => id.toString() !== subjectId.toString()
      );
      await studentClass.save();
    }

    // Delete the subject
    await Subject.findByIdAndDelete(subjectId);

    res.status(200).json({
      status: "success",
      message: "Subject deleted successfully",
      data: { subjectId },
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

export const editSubjectDetails = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { subjectId } = req.params;
    const { name, classId, teacherId } = req.body;

    // Validate request body
    if (!name && !classId && !teacherId) {
      res.status(400).json({
        status: "error",
        message:
          "At least one field (name, classId, teacherId) must be provided",
        data: null,
      });
      return;
    }

    // Find the subject
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      res.status(404).json({
        status: "error",
        message: "Subject not found",
        data: null,
      });
      return;
    }

    // Update class association if needed
    if (classId && classId !== subject.classId.toString()) {
      const newClass = await Class.findById(classId);
      if (!newClass) {
        res.status(404).json({
          status: "error",
          message: "Class not found",
          data: null,
        });
        return;
      }

      // Remove subject from the old class
      const oldClass = await Class.findById(subject.classId);
      if (oldClass) {
        oldClass.subjects = oldClass.subjects.filter(
          (id) => id.toString() !== subjectId.toString()
        );
        await oldClass.save();
      }

      // Add subject to the new class
      newClass.subjects.push(new ObjectId(subjectId));
      await newClass.save();

      subject.classId = classId;
    }

    // Update teacher association if needed
    if (teacherId && teacherId !== subject.teacherId.toString()) {
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        res.status(404).json({
          status: "error",
          message: "Teacher not found",
          data: null,
        });
        return;
      }

      subject.teacherId = teacherId;
    }

    // Update subject name if provided
    if (name) {
      subject.name = name;
    }

    // Save updated subject
    await subject.save();

    res.status(200).json({
      status: "success",
      message: "Subject details updated successfully",
      data: subject,
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
