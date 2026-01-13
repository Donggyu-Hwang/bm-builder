import { Router } from 'express';
import * as authController from '../../controllers/auth.controller';

const router = Router();

// OAuth Routes
router.post('/google', authController.signInWithGoogle);
router.post('/naver', authController.signInWithNaver);

// Session Routes
router.get('/session', authController.getSession);

// Sign Out
router.post('/signout', authController.signOut);

export default router;
