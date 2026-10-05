import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { uploadProjectFiles } from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import {
  createProject, getProjects, getProject, updateProject,
  deleteProject, getMyProjects, getFeaturedProjects,
} from '../controllers/projectController.js';

const router = Router();

router.get('/featured', getFeaturedProjects);
router.get('/my', authenticate, getMyProjects);

router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProject);

router.post('/', authenticate, authorize('client'), uploadProjectFiles.array('attachments', 5), [
  body('title').trim().isLength({ min: 10, max: 200 }).withMessage('Title must be 10–200 characters'),
  body('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('budgetMin').isNumeric().withMessage('Min budget must be a number'),
  body('budgetMax').isNumeric().withMessage('Max budget must be a number'),
  body('expectedDeliveryDays').isInt({ min: 1 }).withMessage('Delivery days must be a positive integer'),
  validate,
], createProject);

router.patch('/:id', authenticate, authorize('client'), [
  body('title').optional().trim().isLength({ min: 10, max: 200 }),
  body('budgetMin').optional().isNumeric(),
  body('budgetMax').optional().isNumeric(),
  validate,
], updateProject);

router.delete('/:id', authenticate, deleteProject);

export default router;
