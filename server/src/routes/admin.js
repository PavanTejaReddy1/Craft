import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getStats, getUsers, suspendUser, unsuspendUser, verifyUser,
  getProjects, getReports, resolveReport, getReviews, hideReview,
  getAuditLogs, featureProject,
} from '../controllers/adminController.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/unsuspend', unsuspendUser);
router.patch('/users/:id/verify', verifyUser);
router.get('/projects', getProjects);
router.patch('/projects/:id/feature', featureProject);
router.get('/reports', getReports);
router.patch('/reports/:id', resolveReport);
router.get('/reviews', getReviews);
router.patch('/reviews/:id/hide', hideReview);
router.get('/audit-logs', getAuditLogs);

export default router;
