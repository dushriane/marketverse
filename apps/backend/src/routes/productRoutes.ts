import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, requireRole('VENDOR'), productController.createProduct);
router.put('/:id', authenticateToken, requireRole('VENDOR'), productController.updateProduct);
router.delete('/:id', authenticateToken, requireRole('VENDOR'), productController.deleteProduct);

export default router;
