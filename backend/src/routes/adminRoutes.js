const express = require('express');
const { body, param } = require('express-validator');
const { getAllUsers, updateUserRole } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/users', getAllUsers);

router.patch(
  '/users/:userId/role',
  [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin')
  ],
  validateRequest,
  updateUserRole
);

module.exports = router;
