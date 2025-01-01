const Score = require("../models/score.model"); // Score model
const Term = require("../models/term.model"); // Term model
const Subject = require("../models/subject.model"); // Subject model
const Student = require("../models/student.model"); // Student model
const { validateAssignScoresSchema, validateGetScoresSchema } = require("../utils/score.validator");

const assignScores = async (req, res) => {
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
    const teacherId = req.user.id; // Authenticated teacher
    const { subjectId, termId, scores } = req.body;

    // Ensure the subject exists and is assigned to the teacher
    const subject = await Subject.findOne({ _id: subjectId, teacherId });
    if (!subject) {
      return res.status(404).json({
        status: "error",
        message:
          "Subject not found or you are not authorized to manage this subject",
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
      let score = await Score.findOne({ studentId, subjectId, termId });
      if (!score) {
        score = new Score({ studentId, subjectId, termId });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

// Retrieve scores for a specific term and subject
const getScoresForTermAndSubject = async (req, res) => {
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
    const teacherId = req.user.id; // Authenticated teacher
    const { subjectId, termId } = req.query;

    // Ensure the subject exists and is assigned to the teacher
    const subject = await Subject.findOne({ _id: subjectId, teacherId });
    if (!subject) {
      return res.status(404).json({
        status: "error",
        message:
          "Subject not found or you are not authorized to manage this subject",
        data: null,
      });
    }

    // Retrieve scores for the specific term and subject
    const scores = await Score.find({ subjectId, termId })
      .populate("studentId", "fullName email studentId") // Populate student details
      .select("studentId test1 test2 exam"); // Select specific fields

    res.status(200).json({
      status: "success",
      message: "Scores retrieved successfully",
      data: scores,
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

module.exports = { assignScores, getScoresForTermAndSubject };
