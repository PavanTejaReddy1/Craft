import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import Report from '../models/Report.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// POST /api/v1/reports
router.post('/', authenticate, [
  body('reportedEntity').isMongoId().withMessage('Valid entity ID required'),
  body('entityType').isIn(['user', 'project', 'review', 'message']).withMessage('Invalid entity type'),
  body('reason').trim().isLength({ min: 20, max: 1000 }).withMessage('Reason must be 20–1000 characters'),
  body('category').isIn(['spam', 'inappropriate', 'fraud', 'harassment', 'fake', 'other']),
  validate,
], async (req, res) => {
  const { reportedEntity, entityType, reason, category } = req.body;

  // Prevent self-reporting
  if (entityType === 'user' && reportedEntity === req.user._id.toString()) {
    return errorResponse(res, 'You cannot report yourself', 400);
  }

  const existing = await Report.findOne({
    reporter: req.user._id,
    reportedEntity,
    entityType,
    status: 'pending',
  });

  if (existing) return errorResponse(res, 'You have already reported this', 409);

  const report = await Report.create({
    reporter: req.user._id,
    reportedEntity,
    entityType,
    reason,
    category,
  });

  return successResponse(res, { report }, 'Report submitted', 201);
});

export default router;
