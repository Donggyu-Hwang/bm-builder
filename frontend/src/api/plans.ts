/**
 * Plans API
 * Handles subscription plans and payment management
 */

import { api } from './axios';

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
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan?: Plan;
}

export interface Usage {
  documentsCount: number;
  teamsCount: number;
  storageUsedMB: number;
  aiGenerationsCount: number;
  currentPeriod: {
    start: string;
    end: string;
  };
}

const plansService = {
  // Get all available plans
  getPlans: async () => {
    const { data } = await api.get<{ success: boolean; data: Plan[] }>('/api/v1/plans');
    return data.data;
  },

  // Get current user subscription
  getSubscription: async () => {
    const { data } = await api.get<{ success: boolean; data: Subscription }>(
      '/api/v1/subscription'
    );
    return data.data;
  },

  // Get current usage
  getUsage: async () => {
    const { data } = await api.get<{ success: boolean; data: Usage }>('/api/v1/subscription/usage');
    return data.data;
  },

  // Subscribe to a plan
  subscribe: async (planId: string, paymentMethodId?: string) => {
    const { data } = await api.post<{ success: boolean; data: Subscription }>(
      '/api/v1/subscription',
      {
        planId,
        paymentMethodId,
      }
    );
    return data.data;
  },

  // Cancel subscription
  cancelSubscription: async () => {
    const { data } = await api.post<{ success: boolean; data: { message: string } }>(
      '/api/v1/subscription/cancel'
    );
    return data;
  },

  // Update subscription plan
  updatePlan: async (newPlanId: string) => {
    const { data } = await api.put<{ success: boolean; data: Subscription }>(
      '/api/v1/subscription/plan',
      {
        planId: newPlanId,
      }
    );
    return data.data;
  },

  // Get billing history
  getBillingHistory: async () => {
    const { data } = await api.get<{ success: boolean; data: any[] }>(
      '/api/v1/subscription/billing'
    );
    return data.data;
  },

  // Get payment methods
  getPaymentMethods: async () => {
    const { data } = await api.get<{ success: boolean; data: any[] }>(
      '/api/v1/subscription/payment-methods'
    );
    return data.data;
  },

  // Add payment method
  addPaymentMethod: async (paymentMethod: { type: string; token: string }) => {
    const { data } = await api.post<{ success: boolean; data: any }>(
      '/api/v1/subscription/payment-methods',
      paymentMethod
    );
    return data.data;
  },

  // Get checkout session for plan upgrade
  getCheckoutSession: async (planId: string, successUrl: string, cancelUrl: string) => {
    const { data } = await api.post<{ success: boolean; data: { sessionId: string; url: string } }>(
      '/api/v1/subscription/checkout',
      {
        planId,
        successUrl,
        cancelUrl,
      }
    );
    return data.data;
  },
};

export default plansService;
