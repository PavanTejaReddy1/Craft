import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getNotifications, markRead, markAllRead, deleteNotification } from '../controllers/notificationController.js';

const router = Router();

router.get('/', authenticate, getNotifications);
router.patch('/mark-all-read', authenticate, markAllRead);
router.patch('/:id/read', authenticate, markRead);
router.delete('/:id', authenticate, deleteNotification);

export default router;
