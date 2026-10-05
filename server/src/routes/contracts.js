import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadMilestoneFiles } from '../middleware/upload.js';
import {
  getContract, getMyContracts, getMilestones,
  submitMilestone, approveMilestone, requestRevision, addMilestone,
} from '../controllers/contractController.js';

const router = Router();

router.get('/', authenticate, getMyContracts);
router.get('/:projectId', authenticate, getContract);
router.get('/:projectId/milestones', authenticate, getMilestones);
router.post('/:projectId/milestones', authenticate, addMilestone);
router.post('/:projectId/milestones/:milestoneId/submit', authenticate, uploadMilestoneFiles.array('files', 5), submitMilestone);
router.post('/:projectId/milestones/:milestoneId/approve', authenticate, approveMilestone);
router.post('/:projectId/milestones/:milestoneId/request-revision', authenticate, requestRevision);

export default router;
