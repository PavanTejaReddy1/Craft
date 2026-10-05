import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadProjectFiles } from '../middleware/upload.js';
import { getMessages, sendMessage, getUnreadCount } from '../controllers/messageController.js';

const router = Router();

router.get('/:contractId', authenticate, getMessages);
router.post('/:contractId', authenticate, uploadProjectFiles.array('files', 5), sendMessage);
router.get('/:contractId/unread', authenticate, getUnreadCount);

export default router;
