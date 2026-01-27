import pool from '../utils/db';

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxDocuments: number;
  maxTeams: number;
  maxStorageMB: number;
  prioritySupport: boolean;
  aiGenerationsPerMonth: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan?: Plan;
}

export interface Usage {
  documentsCount: number;
  teamsCount: number;
  storageUsedMB: number;
  aiGenerationsCount: number;
  currentPeriod: {
    start: Date;
    end: Date;
  };
}

class PlansService {
  async getAllPlans(): Promise<Plan[]> {
    // In production, this would fetch from a database table
    // For now, return hardcoded plans
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'KRW',
        interval: 'monthly',
        features: ['최대 5개 문서', '기본 AI 문서 생성', '1개 팀', '100MB 저장 공간'],
        maxDocuments: 5,
        maxTeams: 1,
        maxStorageMB: 100,
        prioritySupport: false,
        aiGenerationsPerMonth: 10,
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 29000,
        currency: 'KRW',
        interval: 'monthly',
        features: [
          '무제한 문서',
          '고급 AI 문서 생성',
          '최대 5개 팀',
          '10GB 저장 공간',
          '우선 기술 지원',
        ],
        maxDocuments: -1,
        maxTeams: 5,
        maxStorageMB: 10240,
        prioritySupport: true,
        aiGenerationsPerMonth: 100,
      },
      {
        id: 'pro-yearly',
        name: 'Pro (연간)',
        price: 290000,
        currency: 'KRW',
        interval: 'yearly',
        features: [
          '무제한 문서',
          '고급 AI 문서 생성',
          '최대 10개 팀',
          '50GB 저장 공간',
          '우선 기술 지원',
          '월 2회 컨설팅',
        ],
        maxDocuments: -1,
        maxTeams: 10,
        maxStorageMB: 51200,
        prioritySupport: true,
        aiGenerationsPerMonth: 200,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 0,
        currency: 'KRW',
        interval: 'monthly',
        features: [
          '모든 Pro 기능',
          '무제한 팀',
          '무제한 저장 공간',
          '전담 매니저',
          '맞춤형 API 액세스',
        ],
        maxDocuments: -1,
        maxTeams: -1,
        maxStorageMB: -1,
        prioritySupport: true,
        aiGenerationsPerMonth: -1,
      },
    ];
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const result = await pool.query(
      `SELECT
        s.id,
        s.user_id,
        s.plan_id,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.cancel_at_period_end,
        p.name as plan_name,
        p.price,
        p.currency,
        p.interval,
        p.features,
        p.max_documents,
        p.max_teams,
        p.max_storage_mb,
        p.priority_support,
        p.ai_generations_per_month
       FROM subscriptions s
       LEFT JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      status: row.status,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      plan: row.plan_id
        ? {
            id: row.plan_id,
            name: row.plan_name,
            price: parseInt(row.price, 10),
            currency: row.currency,
            interval: row.interval,
            features: row.features || [],
            maxDocuments: row.max_documents,
            maxTeams: row.max_teams,
            maxStorageMB: row.max_storage_mb,
            prioritySupport: row.priority_support,
            aiGenerationsPerMonth: row.ai_generations_per_month,
          }
        : undefined,
    };
  }

  async getUserUsage(userId: string): Promise<Usage> {
    // Get documents count
    const docsResult = await pool.query(
      `SELECT COUNT(*) as count FROM documents WHERE user_id = $1`,
      [userId]
    );

    // Get teams count
    const teamsResult = await pool.query(
      `SELECT COUNT(*) as count FROM team_members WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    // Get storage used
    const storageResult = await pool.query(
      `SELECT COALESCE(SUM(pg_pretty_bytes(content::text::bytea)), 0) as bytes
       FROM documents
       WHERE user_id = $1`,
      [userId]
    );

    // Get AI generations count (current month)
    const aiResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM document_generation_sessions
       WHERE user_id = $1
       AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );

    // Get current period
    const periodResult = await pool.query(
      `SELECT
        CURRENT_DATE as start,
        (CURRENT_DATE + INTERVAL '1 month')::date as end
      `
    );

    return {
      documentsCount: parseInt(docsResult.rows[0].count, 10),
      teamsCount: parseInt(teamsResult.rows[0].count, 10),
      storageUsedMB: Math.round(parseInt(storageResult.rows[0].bytes, 10) / (1024 * 1024)),
      aiGenerationsCount: parseInt(aiResult.rows[0].count, 10),
      currentPeriod: {
        start: periodResult.rows[0].start,
        end: periodResult.rows[0].end,
      },
    };
  }

  async createSubscription(
    userId: string,
    planId: string,
    _paymentMethodId?: string
  ): Promise<Subscription> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get plan details
      const plans = await this.getAllPlans();
      const plan = plans.find((p) => p.id === planId);

      if (!plan) {
        throw new Error('Plan not found');
      }

      // Calculate period end
      // MEDIUM FIX: Fixed syntax error - JavaScript doesn't have '1 year' or '1 month' syntax
      const startDate = new Date();
      const endDate = new Date();
      if (plan.interval === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Create subscription
      const result = await pool.query(
        `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
         VALUES ($1, $2, 'active', $3, $4)
         RETURNING *`,
        [userId, planId, startDate, endDate]
      );

      await client.query('COMMIT');

      return {
        id: result.rows[0].id,
        userId,
        planId,
        status: 'active',
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Set cancel_at_period_end to true
      // MEDIUM FIX: Fixed SQL syntax - removed stray comma
      await pool.query(
        `UPDATE subscriptions
         SET cancel_at_period_end = true
         WHERE user_id = $1
         AND status = 'active'`,
        [userId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateSubscriptionPlan(userId: string, newPlanId: string): Promise<Subscription> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current subscription
      const current = await this.getUserSubscription(userId);
      if (!current) {
        throw new Error('No active subscription found');
      }

      // Get new plan details
      const plans = await this.getAllPlans();
      const newPlan = plans.find((p) => p.id === newPlanId);

      if (!newPlan) {
        throw new Error('Plan not found');
      }

      // Update subscription
      const result = await pool.query(
        `UPDATE subscriptions
         SET plan_id = $1, status = 'active'
         WHERE user_id = $2
         RETURNING *`,
        [newPlanId, userId]
      );

      await client.query('COMMIT');

      return {
        id: result.rows[0].id,
        userId,
        planId: newPlanId,
        status: 'active',
        currentPeriodStart: result.rows[0].current_period_start,
        currentPeriodEnd: result.rows[0].current_period_end,
        cancelAtPeriodEnd: result.rows[0].cancel_at_period_end,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getBillingHistory(userId: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT
        id,
        amount,
        currency,
        status,
        created_at,
        metadata
       FROM billing_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    return result.rows;
  }

  async createCheckoutSession(
    _userId: string,
    planId: string,
    _successUrl: string,
    _cancelUrl: string
  ): Promise<{ sessionId: string; url: string }> {
    // In production, this would integrate with Stripe or another payment provider
    // For now, return a mock session

    const plans = await this.getAllPlans();
    const plan = plans.find((p) => p.id === planId);

    if (!plan) {
      throw new Error('Plan not found');
    }

    // In production, you would:
    // 1. Create a Stripe Checkout Session
    // 2. Return the session URL
    // For now, we'll return a mock response

    return {
      sessionId: `mock-session-${Date.now()}`,
      url: `/dashboard?plan=${planId}`,
    };
  }
}

export default new PlansService();
