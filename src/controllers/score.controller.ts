import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import Score from "../models/score.model";
import Term from "../models/term.model";
import Subject from "../models/subject.model";
import Student from "../models/student.model";
import {
  validateAssignScoresSchema,
  validateGetScoresSchema,
} from "../utils/score.validator";

// Define interfaces for request bodies and query parameters
interface AssignScoresBody {
  subjectId: string;
  termId: string;
  scores: Array<{
    studentId: string;
    test1?: number;
    test2?: number;
    exam?: number;
  }>;
}

interface GetScoresQuery {
  subjectId: string;
  termId: string;
}

// Assign scores to students
export const assignScores = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request body
    const { error } = validateAssignScoresSchema(req.body);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }

    const teacherId = req.user?.id; // Authenticated teacher
    if (!teacherId) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
      return;
    }

    const { subjectId, termId, scores } = req.body as AssignScoresBody;

    // Ensure the subject exists and is assigned to the teacher
    const subject = await Subject.findOne({
      _id: new ObjectId(subjectId),
      teacherId,
    });
    if (!subject) {
      res.status(404).json({
        status: "error",
        message:
          "Subject not found or you are not authorized to manage this subject",
        data: null,
      });
      return;
    }

    // Ensure the term exists and scoring is enabled
    const term = await Term.findById(termId);
    if (!term || !term.isScoringEnabled) {
      res.status(403).json({
        status: "error",
        message: "Scoring is not enabled for this term",
        data: null,
      });
      return;
    }

    // Save scores for each student
    const savedScores = [];
    for (const scoreData of scores) {
      const { studentId, test1, test2, exam } = scoreData;

      // Find existing score record or create a new one
      let score = await Score.findOne({
        studentId: new ObjectId(studentId),
        subjectId: new ObjectId(subjectId),
        termId: new ObjectId(termId),
      });

      if (!score) {
        score = new Score({
          studentId: new ObjectId(studentId),
          subjectId: new ObjectId(subjectId),
          termId: new ObjectId(termId),
        });
      }

      // Update only the fields that are provided
      if (test1 !== undefined) score.test1 = test1;
      if (test2 !== undefined) score.test2 = test2;
      if (exam !== undefined) score.exam = exam;

      await score.save();
      savedScores.push(score);
    }

    res.status(200).json({
      status: "success",
      message: "Scores assigned successfully",
      data: savedScores,
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
    return;
  }
};

// Retrieve scores for a specific term and subject
export const getScoresForTermAndSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request query parameters
    const { error } = validateGetScoresSchema(req.query);
    if (error) {
      res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
      return;
    }

    const teacherId = req.user?.id; // Authenticated teacher
    if (!teacherId) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
      return;
    }

    const { subjectId, termId } = req.query as unknown as GetScoresQuery;

    // Ensure the subject exists and is assigned to the teacher
    const subject = await Subject.findOne({
      _id: new ObjectId(subjectId),
      teacherId,
    });
    if (!subject) {
      res.status(404).json({
        status: "error",
        message:
          "Subject not found or you are not authorized to manage this subject",
        data: null,
      });
      return;
    }

    // Retrieve scores for the specific term and subject
    const scores = await Score.find({
      subjectId: new ObjectId(subjectId),
      termId: new ObjectId(termId),
    })
      .populate("studentId", "fullName email studentId") // Populate student details
      .select("studentId test1 test2 exam"); // Select specific fields

    res.status(200).json({
      status: "success",
      message: "Scores retrieved successfully",
      data: scores,
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
    return;
  }
};
