export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lifetimeValue: number;
  createdAt: string;
}

export interface Prediction {
  id: string;
  recoveryProbability: number;
  expectedRecovery: number;
  recommendedAction: string;
  recommendedDelayMinutes: number;
  confidence: number;
  reason: string;
  modelVersion: string;
  createdAt: string;
}

export interface Action {
  id: string;
  actionType: string;
  scheduledAt: string;
  executedAt?: string;
  status: 'SCHEDULED' | 'EXECUTED' | 'CANCELLED' | 'FAILED';
  expectedValue: number;
  actualRecoveredAmount?: number;
  createdAt: string;
}

export interface EventRecord {
  id: string;
  paymentId: string;
  actionId?: string;
  eventType: string;
  eventData: string;
  createdAt: string;
  payment?: Payment;
}

export interface AIMessage {
  id: string;
  channel: string;
  message: string;
  generatedBy: 'GEMINI' | 'FALLBACK';
  createdAt: string;
}

export interface Payment {
  id: string;
  merchantId: string;
  customerId: string;
  customer?: Customer;
  externalPaymentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'SUCCESS' | 'FAILED' | 'RECOVERING' | 'RECOVERED';
  failureCode?: string;
  failureReason?: string;
  attemptNumber: number;
  createdAt: string;
  updatedAt: string;
  predictions?: Prediction[];
  actions?: Action[];
  events?: EventRecord[];
  aiMessages?: AIMessage[];
}

export interface DashboardSummary {
  totalRevenue: number;
  revenueAtRisk: number;
  recoverableRevenue: number;
  simulatedRecoveredRevenue: number;
  recoveryRate: number;
  totalPaymentsCount: number;
  failedPaymentsCount: number;
  recoveredPaymentsCount: number;
  insights: string[];
}
