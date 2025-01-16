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
export const assignScores = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request body
    const { error } = validateAssignScoresSchema(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }

    const teacherId = req.user?.id; // Authenticated teacher
    if (!teacherId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }

    const { subjectId, termId, scores } = req.body as AssignScoresBody;

    // Ensure the subject exists and is assigned to the teacher
    const subject = await Subject.findOne({ _id: new ObjectId(subjectId), teacherId });
    if (!subject) {
      return res.status(404).json({
        status: "error",
        message: "Subject not found or you are not authorized to manage this subject",
        data: null,
      });
    }

    // Ensure the term exists and scoring is enabled
    const term = await Term.findById(termId);
    if (!term || !term.isScoringEnabled) {
      return res.status(403).json({
        status: "error",
        message: "Scoring is not enabled for this term",
        data: null,
      });
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

    return res.status(200).json({
      status: "success",
      message: "Scores assigned successfully",
      data: savedScores,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

// Retrieve scores for a specific term and subject
export const getScoresForTermAndSubject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Validate request query parameters
    const { error } = validateGetScoresSchema(req.query);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
        data: null,
      });
    }

    const teacherId = req.user?.id; // Authenticated teacher
    if (!teacherId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }

    const { subjectId, termId } = req.query as unknown as GetScoresQuery;

    // Ensure the subject exists and is assigned to the teacher
    const subject = await Subject.findOne({ _id: new ObjectId(subjectId), teacherId });
    if (!subject) {
      return res.status(404).json({
        status: "error",
        message: "Subject not found or you are not authorized to manage this subject",
        data: null,
      });
    }

    // Retrieve scores for the specific term and subject
    const scores = await Score.find({
      subjectId: new ObjectId(subjectId),
      termId: new ObjectId(termId),
    })
      .populate("studentId", "fullName email studentId") // Populate student details
      .select("studentId test1 test2 exam"); // Select specific fields

    return res.status(200).json({
      status: "success",
      message: "Scores retrieved successfully",
      data: scores,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};
