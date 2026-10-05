import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  submitOffer, getProjectOffers, getMyOffers, getOffer,
  updateOffer, withdrawOffer, shortlistOffer, acceptOffer, rejectOffer,
} from '../controllers/offerController.js';

const router = Router();

router.get('/my', authenticate, authorize('developer'), getMyOffers);
router.get('/project/:projectId', authenticate, authorize('client', 'admin'), getProjectOffers);
router.get('/:id', authenticate, getOffer);

router.post('/', authenticate, authorize('developer'), [
  body('projectId').notEmpty().isMongoId().withMessage('Valid project ID required'),
  body('proposedPrice').isNumeric({ min: 1 }).withMessage('Proposed price must be a positive number'),
  body('deliveryDays').isInt({ min: 1 }).withMessage('Delivery days must be a positive integer'),
  body('coverLetter').trim().isLength({ min: 100, max: 5000 }).withMessage('Proposal must be 100–5000 characters'),
  validate,
], submitOffer);

router.patch('/:id', authenticate, authorize('developer'), updateOffer);
router.delete('/:id', authenticate, authorize('developer'), withdrawOffer);
router.patch('/:id/shortlist', authenticate, authorize('client'), shortlistOffer);
router.post('/:id/accept', authenticate, authorize('client'), acceptOffer);
router.post('/:id/reject', authenticate, authorize('client'), rejectOffer);

export default router;
