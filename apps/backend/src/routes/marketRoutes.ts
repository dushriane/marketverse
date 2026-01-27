import { Router } from 'express';
import * as marketController from '../controllers/marketController';

const router = Router();

router.get('/markets', marketController.getMarkets);
router.get('/vendors', marketController.getVendors);
router.get('/stall/:stallId/layout', marketController.getStallLayout);

export default router;
