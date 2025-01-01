const express = require('express');
const { createSubject, joinSubject, leaveSubject } = require('../controllers/subject.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Admin-only route to create a subject
router.post(
  '/create',
  authenticate('admin'), // Ensure only admins can perform this action
  createSubject
);

// Student route to join a subject
router.post(
  '/join',
  authenticate('student'), // Only authenticated students can join
  joinSubject
);

// Student route to leave a subject
router.post(
  '/leave',
  authenticate('student'), // Only authenticated students can leave
  leaveSubject
);

module.exports = router;
