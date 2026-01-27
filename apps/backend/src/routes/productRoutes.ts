import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticateToken, requireRole('VENDOR'), productController.createProduct);
router.put('/:id', authenticateToken, requireRole('VENDOR'), productController.updateProduct);
router.delete('/:id', authenticateToken, requireRole('VENDOR'), productController.deleteProduct);

export default router;
