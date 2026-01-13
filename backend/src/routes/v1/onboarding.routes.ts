import { Router } from 'express';
import * as onboardingController from '../../controllers/onboarding.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.post('/response', onboardingController.saveResponse);
router.get('/responses', onboardingController.getResponses);
router.post('/complete', onboardingController.completeOnboarding);

export default router;
