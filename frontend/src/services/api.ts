import { DashboardSummary, Payment, EventRecord } from '../types';

const API_BASE = '/api';

// Realistic Mock Baseline for GitHub Pages / Static Deployment
const mockDashboardSummary: DashboardSummary = {
  totalRevenue: 2450000,
  revenueAtRisk: 500000,
  recoverableRevenue: 425000,
  simulatedRecoveredRevenue: 184000,
  recoveryRate: 36.8,
  totalPaymentsCount: 520,
  failedPaymentsCount: 220,
  recoveredPaymentsCount: 92,
  insights: [
    '87% of insufficient funds failures can be recovered via 6-hour delayed auto-retry.',
    'UPI payment method exhibits the highest recovery rate at 84%.',
    'WhatsApp nudge channels generate 2.4x higher conversion than email for card declines.',
  ],
};

const mockPayments: Payment[] = [
  {
    id: 'pay_demo_arun_kumar_1',
    merchantId: 'merch_nova',
    customerId: 'cust_arun',
    externalPaymentId: 'pay_upi_9948172',
    amount: 5000,
    currency: 'INR',
    paymentMethod: 'upi',
    status: 'FAILED',
    failureReason: 'insufficient_funds',
    attemptNumber: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: {
      id: 'cust_arun',
      name: 'Arun Kumar',
      email: 'arun.kumar@example.com',
      phone: '+91 98765 43210',
      lifetimeValue: 24500,
      createdAt: new Date().toISOString(),
    },
    predictions: [
      {
        id: 'pred_1',
        recoveryProbability: 0.87,
        confidence: 0.91,
        recommendedAction: 'RETRY_LATER',
        recommendedDelayMinutes: 360,
        expectedRecovery: 4350,
        reason: 'Customer has strong payment history (8 successful orders). Failed attempt due to temporary insufficient funds before salary credit cycle. Delayed retry in 6 hours has 87% recovery probability.',
        modelVersion: '1.0.0-hybrid',
        createdAt: new Date().toISOString(),
      },
    ],
    events: [
      {
        id: 'ev_1',
        paymentId: 'pay_demo_arun_kumar_1',
        eventType: 'PAYMENT_FAILED',
        eventData: JSON.stringify({ amount: 5000, failureReason: 'insufficient_funds' }),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ev_2',
        paymentId: 'pay_demo_arun_kumar_1',
        eventType: 'PREDICTION_GENERATED',
        eventData: JSON.stringify({ probability: 0.87, recommendedAction: 'RETRY_LATER' }),
        createdAt: new Date().toISOString(),
      },
    ],
    aiMessages: [
      {
        id: 'msg_1',
        channel: 'WHATSAPP',
        message: 'Hi Arun, your payment of ₹5,000 for order #9948172 was unsuccessful. Click here to safely complete payment: https://recoverai.io/pay/9948172',
        generatedBy: 'GEMINI',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'pay_demo_rahul_verma_2',
    merchantId: 'merch_nova',
    customerId: 'cust_rahul',
    externalPaymentId: 'pay_card_48201',
    amount: 12500,
    currency: 'INR',
    paymentMethod: 'card',
    status: 'RECOVERED',
    failureReason: 'network_timeout',
    attemptNumber: 2,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    customer: {
      id: 'cust_rahul',
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      phone: '+91 98112 33445',
      lifetimeValue: 45000,
      createdAt: new Date().toISOString(),
    },
    predictions: [
      {
        id: 'pred_2',
        recoveryProbability: 0.92,
        confidence: 0.95,
        recommendedAction: 'RETRY_NOW',
        recommendedDelayMinutes: 0,
        expectedRecovery: 11500,
        reason: 'Payment failed due to transient gateway network timeout. Immediate auto-retry execution succeeded.',
        modelVersion: '1.0.0-hybrid',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    events: [
      {
        id: 'ev_3',
        paymentId: 'pay_demo_rahul_verma_2',
        eventType: 'PAYMENT_RECOVERED',
        eventData: JSON.stringify({ amountRecovered: 12500 }),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },
  {
    id: 'pay_demo_priya_sharma_3',
    merchantId: 'merch_nova',
    customerId: 'cust_priya',
    externalPaymentId: 'pay_nb_10482',
    amount: 3200,
    currency: 'INR',
    paymentMethod: 'netbanking',
    status: 'FAILED',
    failureReason: 'bank_declined',
    attemptNumber: 1,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    customer: {
      id: 'cust_priya',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 99887 76655',
      lifetimeValue: 18200,
      createdAt: new Date().toISOString(),
    },
    predictions: [
      {
        id: 'pred_3',
        recoveryProbability: 0.78,
        confidence: 0.88,
        recommendedAction: 'WHATSAPP',
        recommendedDelayMinutes: 15,
        expectedRecovery: 2496,
        reason: 'Netbanking authentication declined by bank. Sent interactive WhatsApp payment link.',
        modelVersion: '1.0.0-hybrid',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  },
];

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || 'API request failed');
    }
    return json.data;
  } catch (err) {
    // Fallback to client-side mock data when backend API server is not available (e.g. GitHub Pages static deployment)
    console.warn(`RecoverAI API Fallback for [${url}]:`, err);
    return handleMockFallback<T>(url, options);
  }
}

function handleMockFallback<T>(url: string, options?: RequestInit): any {
  if (url.includes('/dashboard/summary')) return mockDashboardSummary;
  if (url.includes('/dashboard/revenue')) {
    return [
      { date: 'Aug 14', successful: 120000, failed: 25000, recovered: 18000 },
      { date: 'Aug 16', successful: 140000, failed: 30000, recovered: 22000 },
      { date: 'Aug 18', successful: 110000, failed: 20000, recovered: 15000 },
      { date: 'Aug 20', successful: 165000, failed: 35000, recovered: 28000 },
      { date: 'Aug 22', successful: 180000, failed: 40000, recovered: 32000 },
      { date: 'Aug 24', successful: 195000, failed: 42000, recovered: 35000 },
      { date: 'Aug 26', successful: 210000, failed: 45000, recovered: 38000 },
    ];
  }
  if (url.includes('/dashboard/failure-breakdown')) {
    return [
      { reason: 'INSUFFICIENT_FUNDS', count: 98, value: 245000 },
      { reason: 'NETWORK_TIMEOUT', count: 58, value: 145000 },
      { reason: 'BANK_DECLINED', count: 38, value: 95000 },
      { reason: 'AUTHENTICATION_FAILED', count: 18, value: 45000 },
      { reason: 'CARD_EXPIRED', count: 8, value: 20000 },
    ];
  }
  if (url.includes('/dashboard/recovery-trends')) {
    return {
      byPaymentMethod: [
        { method: 'UPI', rate: 84 },
        { method: 'CARD', rate: 76 },
        { method: 'NETBANKING', rate: 68 },
        { method: 'WALLET', rate: 62 },
      ],
    };
  }
  if (url.includes('/payments?')) {
    return { payments: mockPayments, pagination: { total: mockPayments.length, page: 1, limit: 10 } };
  }
  if (url.includes('/payments/')) {
    const id = url.split('/payments/')[1].split('/')[0];
    const match = mockPayments.find((p) => p.id === id) || mockPayments[0];
    if (url.includes('/retry')) {
      match.status = 'RECOVERED';
      mockDashboardSummary.simulatedRecoveredRevenue += match.amount;
      return { success: true, payment: match, recoveredAmount: match.amount };
    }
    return match;
  }
  if (url.includes('/recovery')) {
    return {
      actions: [
        { actionType: 'RETRY_LATER', delayMinutes: 360, channel: 'AUTO_RETRY' },
        { actionType: 'WHATSAPP', delayMinutes: 15, channel: 'WHATSAPP' },
      ],
      events: mockPayments[0].events || [],
    };
  }
  if (url.includes('/ai/generate-message')) {
    const body = options?.body ? JSON.parse(options.body as string) : {};
    const channel = body.channel || 'WHATSAPP';
    return {
      messageResult: {
        message: `Hi Arun, your payment of ₹5,000 for order #9948172 was unsuccessful due to bank network delays. Tap here to complete your payment: https://recoverai.io/pay/9948172`,
        subject: 'Action Required: Complete your ₹5,000 order payment',
        generatedBy: 'GEMINI',
      },
    };
  }
  if (url.includes('/simulator/run')) {
    const body = options?.body ? JSON.parse(options.body as string) : {};
    const count = body.failedCount || 100;
    const value = body.totalFailedValue || 500000;
    const delay = body.retryDelayHours || 6;
    const expectedYield = Math.round(value * (0.35 + (delay / 24) * 0.4));

    return {
      recommendedStrategy: `RETRY_LATER (${delay}h delay)`,
      potentialUplift: expectedYield,
      upliftPercentage: 38.5,
      strategies: [
        { name: 'RETRY_NOW (Instant)', delay: '0h', channel: 'AUTO', recoveryRate: '42%', expectedRecovery: Math.round(value * 0.42) },
        { name: 'WHATSAPP Nudge', delay: '15m', channel: 'WHATSAPP', recoveryRate: '68%', expectedRecovery: Math.round(value * 0.68) },
        { name: `RETRY_LATER (${delay}h Window)`, delay: `${delay}h`, channel: body.channel || 'WHATSAPP', recoveryRate: '82%', expectedRecovery: expectedYield },
      ],
    };
  }
  if (url.includes('/demo/simulate-payment-failure')) {
    return {
      payment: mockPayments[0],
      customer: mockPayments[0].customer,
      prediction: mockPayments[0].predictions?.[0],
    };
  }
  if (url.includes('/demo/simulate-recovery-success')) {
    mockPayments[0].status = 'RECOVERED';
    mockDashboardSummary.simulatedRecoveredRevenue += 5000;
    return { success: true, payment: mockPayments[0], recoveredAmount: 5000 };
  }
  if (url.includes('/demo/reset')) {
    mockPayments[0].status = 'FAILED';
    mockDashboardSummary.simulatedRecoveredRevenue = 184000;
    return { success: true };
  }

  return { success: true };
}

export const api = {
  // Dashboard
  getDashboardSummary: () => fetchJson<DashboardSummary>('/dashboard/summary'),
  getRevenueTrends: () => fetchJson<any[]>('/dashboard/revenue'),
  getFailureBreakdown: () => fetchJson<any[]>('/dashboard/failure-breakdown'),
  getRecoveryTrends: () => fetchJson<{ byPaymentMethod: any[] }>('/dashboard/recovery-trends'),

  // Payments
  getPayments: (params: { page?: number; limit?: number; status?: string; failureReason?: string; paymentMethod?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    if (params.failureReason) query.append('failureReason', params.failureReason);
    if (params.paymentMethod) query.append('paymentMethod', params.paymentMethod);
    if (params.search) query.append('search', params.search);
    return fetchJson<{ payments: Payment[]; pagination: any }>(`/payments?${query.toString()}`);
  },

  getPaymentById: (id: string) => fetchJson<Payment>(`/payments/${id}`),

  retryPayment: (id: string) => fetchJson<{ success: boolean; payment: Payment; recoveredAmount: number }>(`/payments/${id}/retry`, {
    method: 'POST',
  }),

  // AI & Recovery
  predictPayment: (paymentId: string) => fetchJson<any>(`/ai/predict/${paymentId}`, { method: 'POST' }),

  generateMessage: (paymentId: string, channel: string) => fetchJson<any>(`/ai/generate-message/${paymentId}`, {
    method: 'POST',
    body: JSON.stringify({ channel }),
  }),

  getRecoveryActions: () => fetchJson<{ actions: any[]; events: EventRecord[] }>('/recovery'),

  scheduleAction: (paymentId: string, actionType: string, delayMinutes: number) => fetchJson<any>(`/recovery/${paymentId}/schedule`, {
    method: 'POST',
    body: JSON.stringify({ actionType, delayMinutes }),
  }),

  executeAction: (paymentId: string) => fetchJson<any>(`/recovery/${paymentId}/execute`, { method: 'POST' }),

  // Simulator
  runSimulator: (payload: any) => fetchJson<any>('/simulator/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Webhook
  triggerWebhook: (payload: any) => fetchJson<any>('/webhooks/payment', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // DemoPitch Controls
  simulateFailurePitch: () => fetchJson<any>('/demo/simulate-payment-failure', { method: 'POST' }),
  simulateSuccessPitch: (paymentId?: string) => fetchJson<any>('/demo/simulate-recovery-success', {
    method: 'POST',
    body: JSON.stringify({ paymentId }),
  }),
  resetDemoData: () => fetchJson<any>('/demo/reset', { method: 'POST' }),
};
