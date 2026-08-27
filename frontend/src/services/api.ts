import { DashboardSummary, Payment, EventRecord } from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'API request failed');
  }
  return json.data;
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
