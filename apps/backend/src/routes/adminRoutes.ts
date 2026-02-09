import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import * as analyticsController from '../controllers/analyticsController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Admin Only
router.post('/markets', authenticateToken, requireRole('ADMIN'), adminController.createMarket);
router.get('/users', authenticateToken, requireRole('ADMIN'), adminController.getUsers);

// Analytics (Admin + Vendor)
// Pointing to adminController as well for now since analyticsController might be missing or incomplete causing 500s
// router.get('/analytics', authenticateToken, analyticsController.getAnalytics);
// router.get('/reports', authenticateToken, analyticsController.downloadReport);
router.get('/analytics', authenticateToken, adminController.getAnalytics);
router.get('/reports', authenticateToken, adminController.getReports);

export default router;
