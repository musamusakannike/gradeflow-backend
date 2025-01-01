const express = require("express");
const {
  createSubject,
  joinSubject,
  leaveSubject,
  viewEnrolledSubjects,
  viewStudentsInSubjects,
  toggleSubjectJoinPermission,
  toggleJoinPermissionsBulk,
} = require("../controllers/subject.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// Admin-only route to create a subject
router.post(
  "/create",
  authenticate("admin"), // Ensure only admins can perform this action
  createSubject
);

// Student route to join a subject
router.post(
  "/join",
  authenticate("student"), // Only authenticated students can join
  joinSubject
);

// Student route to leave a subject
router.post(
  "/leave",
  authenticate("student"), // Only authenticated students can leave
  leaveSubject
);

// Route for students to view their enrolled subjects
router.get(
  "/my-subjects",
  authenticate("student"), // Ensure only authenticated students can access
  viewEnrolledSubjects
);

// Route for teachers to view students in their subjects
router.get(
  "/students",
  authenticate("teacher"), // Ensure only authenticated teachers can access
  viewStudentsInSubjects
);

// Route to toggle subject join permission by admin and teacher
router.patch(
  "/toggle-join-permission",
  authenticate(["admin", "teacher"]), // Ensure only authenticated admins can access
  toggleSubjectJoinPermission
);

// Admin-only bulk action to toggle join permissions for multiple subjects
router.patch(
  "/toggle-join-permissions-bulk",
  authenticate("admin"), // Ensure only admins can access
  toggleJoinPermissionsBulk
);

module.exports = router;
