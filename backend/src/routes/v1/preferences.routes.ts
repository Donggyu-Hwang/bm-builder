import { Router } from 'express';
import * as preferencesController from '../../controllers/preferences.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.get('/', preferencesController.getPreferences);
router.put('/', preferencesController.updatePreferences);

export default router;
