import { Router } from 'express';
import * as messageController from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, messageController.sendMessage);
router.get('/', authenticateToken, messageController.getMessages);
router.get('/top-buyers', authenticateToken, messageController.getTopBuyers);

export default router;
