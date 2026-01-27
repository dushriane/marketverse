import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, transactionController.createOrder);
router.get('/history', authenticateToken, transactionController.getMyOrders);
router.get('/vendor', authenticateToken, transactionController.getVendorReservations);
router.put('/:id/status', authenticateToken, transactionController.updateOrderStatus);

export default router;
