import { Router } from 'express';
import * as vendorController from '../controllers/vendorController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Profile Management
router.get('/profile', authenticateToken, requireRole('VENDOR'), vendorController.getMyProfile);
router.put('/profile', authenticateToken, requireRole('VENDOR'), vendorController.updateProfile);

// Stall Management
router.get('/stalls', authenticateToken, requireRole('VENDOR'), vendorController.getMyStalls);
router.post('/stalls', authenticateToken, requireRole('VENDOR'), vendorController.createStall);
router.put('/stalls/:id', authenticateToken, requireRole('VENDOR'), vendorController.updateStall);
router.delete('/stalls/:id', authenticateToken, requireRole('VENDOR'), vendorController.deleteStall);

export default router;
