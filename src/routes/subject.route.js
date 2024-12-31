const express = require('express');
const { createSubject } = require('../controllers/subject.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Admin-only route to create a subject
router.post(
  '/create',
  authenticate('admin'), // Ensure only admins can perform this action
  createSubject
);

module.exports = router;
