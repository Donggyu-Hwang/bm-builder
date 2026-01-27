/**
 * Plans Page
 * Display pricing plans and manage subscriptions
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader2, Crown, Zap, Users, HardDrive, FileText } from 'lucide-react';
import * as plansApi from '../api/plans';

interface Plan {
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

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan?: Plan;
}

interface Usage {
  documentsCount: number;
  teamsCount: number;
  storageUsedMB: number;
  aiGenerationsCount: number;
  currentPeriod: {
    start: string;
    end: string;
  };
}

export default function PlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [showBilling, setShowBilling] = useState(false);

  useEffect(() => {
    loadPlansAndSubscription();
  }, []);

  const loadPlansAndSubscription = async () => {
    try {
      setLoading(true);
      const [plansData, subscriptionData, usageData, billingData] = await Promise.all([
        plansApi.getAllPlans(),
        plansApi.getUserSubscription().catch(() => null),
        plansApi.getUserUsage().catch(() => null),
        plansApi.getBillingHistory().catch(() => []),
      ]);
      setPlans(plansData);
      setSubscription(subscriptionData);
      setUsage(usageData);
      setBillingHistory(billingData);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setActionLoading(planId);
      const successUrl = `${window.location.origin}/plans?success=true`;
      const cancelUrl = `${window.location.origin}/plans?canceled=true`;

      const session = await plansApi.createCheckoutSession(planId, successUrl, cancelUrl);

      // Redirect to checkout (in production, this would be Stripe Checkout)
      window.location.href = session.url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('결제 세션 생성에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('정말로 구독을 취소하시겠습니까? 기간 종료 후 모든 기능이 제한됩니다.')) {
      return;
    }

    try {
      setActionLoading('cancel');
      await plansApi.cancelSubscription();
      await loadPlansAndSubscription();
      alert('구독이 취소되었습니다. 기간 종료까지 서비스를 계속 이용하실 수 있습니다.');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('구독 취소에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePlan = async (newPlanId: string) => {
    try {
      setActionLoading(newPlanId);
      await plansApi.updateSubscriptionPlan(newPlanId);
      await loadPlansAndSubscription();
      alert('플랜이 변경되었습니다.');
    } catch (error) {
      console.error('Failed to update plan:', error);
      alert('플랜 변경에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return '무료';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatStorage = (mb: number) => {
    if (mb < 1024) return `${mb}MB`;
    return `${(mb / 1024).toFixed(0)}GB`;
  };

  const getLimitDisplay = (current: number, max: number) => {
    if (max === -1) return `${current} / 무제한`;
    return `${current} / ${max}`;
  };

  const getLimitPercentage = (current: number, max: number) => {
    if (max === -1) return 0;
    return Math.min((current / max) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">플랜 선택</h1>
          <p className="text-xl text-gray-600">비즈니스 규모에 맞는 플랜을 선택하세요</p>
        </div>

        {/* Current Subscription & Usage */}
        {subscription && subscription.plan && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  현재 플랜: {subscription.plan.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {subscription.status === 'active'
                    ? `다음 결제일: ${new Date(subscription.currentPeriodEnd).toLocaleDateString('ko-KR')}`
                    : `상태: ${subscription.status}`}
                </p>
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-orange-600 mt-1">기간 종료 후 구독이 만료됩니다.</p>
                )}
              </div>
              <div className="flex gap-3">
                {!showBilling && (
                  <>
                    {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={actionLoading === 'cancel'}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionLoading === 'cancel' ? '처리 중...' : '구독 취소'}
                      </button>
                    )}
                    <button
                      onClick={() => setShowBilling(!showBilling)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      {showBilling ? '사용량 보기' : '결제 내역'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {!showBilling && usage ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Documents */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-700">문서</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {getLimitDisplay(usage.documentsCount, subscription.plan.maxDocuments)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${getLimitPercentage(usage.documentsCount, subscription.plan.maxDocuments)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Teams */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-700">팀</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {getLimitDisplay(usage.teamsCount, subscription.plan.maxTeams)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${getLimitPercentage(usage.teamsCount, subscription.plan.maxTeams)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Storage */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-700">저장공간</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {getLimitDisplay(usage.storageUsedMB, subscription.plan.maxStorageMB)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${getLimitPercentage(usage.storageUsedMB, subscription.plan.maxStorageMB)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* AI Generations */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-gray-700">AI 생성</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {getLimitDisplay(
                      usage.aiGenerationsCount,
                      subscription.plan.aiGenerationsPerMonth
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${getLimitPercentage(usage.aiGenerationsCount, subscription.plan.aiGenerationsPerMonth)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 내역</h3>
                {billingHistory.length === 0 ? (
                  <p className="text-gray-600">결제 내역이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {billingHistory.map((bill) => (
                      <div
                        key={bill.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Intl.NumberFormat('ko-KR', {
                              style: 'currency',
                              currency: bill.currency,
                            }).format(bill.amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(bill.created_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            bill.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : bill.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {bill.status === 'completed'
                            ? '완료'
                            : bill.status === 'pending'
                              ? '대기 중'
                              : '실패'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.planId === plan.id;
            const isEnterprise = plan.id === 'enterprise';

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  isCurrentPlan ? 'ring-4 ring-green-500' : ''
                }`}
              >
                {/* Plan Header */}
                <div
                  className={`${plan.id === 'pro' || plan.id === 'pro-yearly' ? 'bg-green-600' : 'bg-gray-800'} p-6 text-white`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {isCurrentPlan && (
                      <span className="px-2 py-1 bg-white text-green-600 rounded-full text-xs font-semibold">
                        현재 플랜
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {formatPrice(plan.price, plan.currency)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm opacity-90">
                        /{plan.interval === 'monthly' ? '월' : '년'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Plan Features */}
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.maxDocuments === -1 && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">무제한 문서</span>
                      </li>
                    )}
                    {plan.prioritySupport && (
                      <li className="flex items-start gap-2">
                        <Crown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">우선 기술 지원</span>
                      </li>
                    )}
                  </ul>

                  {/* Action Button */}
                  {isEnterprise ? (
                    <button
                      onClick={() => (window.location.href = 'mailto:contact@bmbuilder.com')}
                      className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold transition"
                    >
                      문의하기
                    </button>
                  ) : isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed"
                    >
                      현재 플랜
                    </button>
                  ) : subscription && subscription.status === 'active' ? (
                    <button
                      onClick={() => handleUpdatePlan(plan.id)}
                      disabled={actionLoading === plan.id}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50"
                    >
                      {actionLoading === plan.id ? '처리 중...' : '플랜 변경'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={actionLoading === plan.id}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition disabled:opacity-50"
                    >
                      {actionLoading === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                          처리 중...
                        </>
                      ) : (
                        '시작하기'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">자주 묻는 질문</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">언제든 플랜을 변경할 수 있나요?</h3>
              <p className="text-gray-600">
                네, 언제든 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 변경 사항은 즉시
                적용되며, 요금은 일할 계산됩니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">환불 정책이 있나요?</h3>
              <p className="text-gray-600">
                14일 무료 평가판 후 환불은 불가능합니다. 그러나 서비스에 만족하지 못하신 경우 언제든
                구독을 취소할 수 있습니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">결제 방법은 무엇이 있나요?</h3>
              <p className="text-gray-600">
                신용카드, 체크카드, 계좌이체를 지원합니다. 모든 결제는 안전하게 처리됩니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Enterprise 플랜은 무엇을 포함하나요?
              </h3>
              <p className="text-gray-600">
                Enterprise 플랜은 무제한 모든 기능, 전담 매니저, 맞춤형 API 액세스, 우선 기술 지원을
                포함합니다. 영업팀에 문의해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
