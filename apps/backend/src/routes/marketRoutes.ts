import { Router } from 'express';
import * as marketController from '../controllers/marketController';

const router = Router();

router.get('/vendors', marketController.getVendors);
router.get('/stall/:stallId/layout', marketController.getStallLayout);

export default router;
