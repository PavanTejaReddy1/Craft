import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  sendInquiry, getInquiries, getInquiry,
  replyInquiry, getUnreadCount,
} from '../controllers/inquiryController.js';

const router = Router();

router.use(authenticate);

router.get('/unread-count', getUnreadCount);
router.get('/',    getInquiries);
router.get('/:id', getInquiry);

router.post('/', authorize('client'), [
  body('developerId').isMongoId().withMessage('Valid developer ID required'),
  body('message').trim().notEmpty().withMessage('Message is required')
    .isLength({ max: 5000 }).withMessage('Max 5000 characters'),
  validate,
], sendInquiry);

router.post('/:id/reply', [
  body('message').trim().notEmpty().withMessage('Message is required'),
  validate,
], replyInquiry);

export default router;
