import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, transactionController.createOrder);
router.get('/history', authenticateToken, transactionController.getMyOrders);

export default router;
