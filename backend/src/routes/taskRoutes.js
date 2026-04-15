const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createTaskHandler,
  deleteTaskHandler,
  getTaskByIdHandler,
  getTasksHandler,
  updateTaskHandler
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['todo', 'in_progress', 'done'])
  ],
  validateRequest,
  createTaskHandler
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),
    query('sort').optional().isString().withMessage('Sort must be a string')
  ],
  validateRequest,
  getTasksHandler
);

router.get(
  '/:taskId',
  [param('taskId').isMongoId().withMessage('Invalid task ID')],
  validateRequest,
  getTaskByIdHandler
);

router.patch(
  '/:taskId',
  [
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('title').optional().trim().notEmpty().isLength({ max: 120 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['todo', 'in_progress', 'done'])
  ],
  validateRequest,
  updateTaskHandler
);

router.delete(
  '/:taskId',
  [param('taskId').isMongoId().withMessage('Invalid task ID')],
  validateRequest,
  deleteTaskHandler
);

module.exports = router;
