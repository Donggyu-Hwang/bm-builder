import { Router, Response, Request } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import plansService from '../../services/plans.service';

const router = Router();

/**
 * GET /api/v1/plans
 * Get all available subscription plans
 */
router.get('/plans', async (_req: Request, res: Response) => {
  try {
    const plans = await plansService.getAllPlans();
    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Failed to fetch plans:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch plans';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/subscription
 * Get current user's subscription
 */
router.get('/subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const subscription = await plansService.getUserSubscription(userId);

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subscription';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/subscription/usage
 * Get current usage statistics
 */
router.get('/subscription/usage', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const usage = await plansService.getUserUsage(userId);

    res.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    console.error('Failed to fetch usage:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch usage';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * POST /api/v1/subscription
 * Subscribe to a plan
 */
router.post('/subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const { planId, paymentMethodId } = req.body;

    const subscription = await plansService.createSubscription(userId, planId, paymentMethodId);

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Failed to create subscription:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * POST /api/v1/subscription/cancel
 * Cancel subscription
 */
router.post('/subscription/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    await plansService.cancelSubscription(userId);

    res.json({
      success: true,
      data: { message: 'Subscription canceled successfully' },
    });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * PUT /api/v1/subscription/plan
 * Update subscription plan
 */
router.put('/subscription/plan', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const { planId } = req.body;

    const subscription = await plansService.updateSubscriptionPlan(userId, planId);

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Failed to update subscription:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to update subscription';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/subscription/billing
 * Get billing history
 */
router.get('/subscription/billing', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const billing = await plansService.getBillingHistory(userId);

    res.json({
      success: true,
      data: billing,
    });
  } catch (error) {
    console.error('Failed to fetch billing history:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch billing history';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * POST /api/v1/subscription/checkout
 * Create checkout session
 */
router.post('/subscription/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const { planId, successUrl, cancelUrl } = req.body;

    const checkoutSession = await plansService.createCheckoutSession(
      userId,
      planId,
      successUrl,
      cancelUrl
    );

    res.json({
      success: true,
      data: checkoutSession,
    });
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create checkout session';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

export default router;
