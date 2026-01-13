import { Router } from 'express';
import * as prioritiesController from '../../controllers/priorities.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.post('/generate', prioritiesController.generatePriorities);
router.get('/', prioritiesController.getPriorities);
router.put('/', prioritiesController.updatePriorities);

export default router;
