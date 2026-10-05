import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createReview, getUserReviews, getContractReviews } from '../controllers/reviewController.js';

const router = Router();

router.post('/', authenticate, [
  body('contractId').isMongoId().withMessage('Valid contract ID required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('comment').trim().isLength({ min: 20, max: 2000 }).withMessage('Comment must be 20–2000 characters'),
  validate,
], createReview);

router.get('/user/:userId', getUserReviews);
router.get('/contract/:contractId', authenticate, getContractReviews);

export default router;
