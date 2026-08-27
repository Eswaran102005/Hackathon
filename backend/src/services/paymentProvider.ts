import { PrismaClient } from '@prisma/client';
import { AIScoringService } from './aiScoringService';
import { StrategyEngine } from './strategyEngine';
import { GeminiService } from './geminiService';

export interface PaymentWebhookPayload {
  externalPaymentId?: string;
  amount?: number;
  paymentMethod?: string;
  failureReason?: string;
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentProvider {
  processFailedPayment(payload: PaymentWebhookPayload): Promise<any>;
  simulateRetryPayment(paymentId: string): Promise<any>;
  executeRecoveryAction(paymentId: string, actionType: string): Promise<any>;
}

export class MockPaymentProvider implements PaymentProvider {
  constructor(private prisma: PrismaClient) {}

  public async processFailedPayment(payload: PaymentWebhookPayload) {
    const merchant = await this.prisma.merchant.findFirst() || await this.prisma.merchant.create({
      data: {
        name: 'Razorpay Demo Merchant',
        email: 'demo@recoverai.io',
        businessName: 'Nova Retail India Pvt Ltd',
      },
    });

    const email = payload.customerEmail || 'rohan.sharma@example.com';
    const name = payload.customerName || 'Rohan Sharma';
    let customer = await this.prisma.customer.findFirst({ where: { email } });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          merchantId: merchant.id,
          name,
          email,
          phone: '+91 9876543210',
          lifetimeValue: 12500,
        },
      });
    }

    const amount = payload.amount || 5000;
    const paymentMethod = payload.paymentMethod || 'card';
    const failureReason = payload.failureReason || 'insufficient_funds';
    const externalPaymentId = payload.externalPaymentId || `pay_sim_${Date.now()}`;

    const payment = await this.prisma.payment.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        externalPaymentId,
        amount,
        currency: 'INR',
        paymentMethod,
        status: 'FAILED',
        failureCode: `ERR_${failureReason.toUpperCase()}`,
        failureReason,
        attemptNumber: 1,
      },
    });

    const pastSuccess = await this.prisma.payment.count({
      where: { customerId: customer.id, status: 'SUCCESS' },
    });
    const pastRecovered = await this.prisma.payment.count({
      where: { customerId: customer.id, status: 'RECOVERED' },
    });

    const scoring = AIScoringService.scorePayment({
      amount,
      paymentMethod,
      failureReason,
      attemptNumber: 1,
      customerLifetimeValue: customer.lifetimeValue,
      previousSuccessCount: pastSuccess || 3,
      previousFailedCount: 1,
      previousRecoveredCount: pastRecovered || 1,
    });

    const strategy = StrategyEngine.selectStrategy(amount, scoring, 1, failureReason);

    const explanation = await GeminiService.generateExplanation(
      { amount, paymentMethod, failureReason, attemptNumber: 1, customerName: customer.name },
      scoring,
      strategy
    );

    const commChannel = strategy.recommendedAction === 'WHATSAPP' ? 'WHATSAPP' : strategy.recommendedAction === 'EMAIL' ? 'EMAIL' : 'SMS';
    const aiMessage = await GeminiService.generatePersonalizedMessage(
      { amount, paymentMethod, failureReason, externalPaymentId },
      { name: customer.name, email: customer.email },
      commChannel,
      strategy.recommendedAction
    );

    const prediction = await this.prisma.recoveryPrediction.create({
      data: {
        paymentId: payment.id,
        recoveryProbability: scoring.recoveryProbability,
        expectedRecovery: scoring.expectedRecovery,
        recommendedAction: strategy.recommendedAction,
        recommendedDelayMinutes: strategy.recommendedDelayMinutes,
        confidence: scoring.confidence,
        reason: explanation.explanation,
        modelVersion: '1.0.0-xgb-hybrid',
      },
    });

    const scheduledAt = new Date(Date.now() + strategy.recommendedDelayMinutes * 60000);
    const action = await this.prisma.recoveryAction.create({
      data: {
        paymentId: payment.id,
        actionType: strategy.recommendedAction,
        scheduledAt,
        status: 'SCHEDULED',
        expectedValue: strategy.expectedValue,
      },
    });

    await this.prisma.recoveryEvent.create({
      data: {
        paymentId: payment.id,
        actionId: action.id,
        eventType: 'PAYMENT_FAILED',
        eventData: JSON.stringify({ amount, failureReason, paymentMethod }),
      },
    });

    await this.prisma.recoveryEvent.create({
      data: {
        paymentId: payment.id,
        actionId: action.id,
        eventType: 'PREDICTION_GENERATED',
        eventData: JSON.stringify({
          probability: scoring.recoveryProbability,
          recommendedAction: strategy.recommendedAction,
          expectedValue: strategy.expectedValue,
          generatedBy: explanation.generatedBy,
        }),
      },
    });

    await this.prisma.aIMessage.create({
      data: {
        paymentId: payment.id,
        channel: commChannel,
        message: aiMessage.message,
        generatedBy: aiMessage.generatedBy,
      },
    });

    return {
      payment,
      customer,
      prediction,
      action,
      explanation,
      aiMessage,
      scoring,
      strategy,
    };
  }

  public async simulateRetryPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { customer: true, actions: true },
    });

    if (!payment) throw new Error('Payment not found');

    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'RECOVERED' },
    });

    const action = payment.actions[0];
    if (action) {
      await this.prisma.recoveryAction.update({
        where: { id: action.id },
        data: {
          status: 'EXECUTED',
          executedAt: new Date(),
          actualRecoveredAmount: payment.amount,
        },
      });
    }

    await this.prisma.recoveryEvent.create({
      data: {
        paymentId,
        actionId: action?.id || null,
        eventType: 'PAYMENT_RECOVERED',
        eventData: JSON.stringify({
          amountRecovered: payment.amount,
          recoveredAt: new Date().toISOString(),
        }),
      },
    });

    return {
      success: true,
      payment: updatedPayment,
      recoveredAmount: payment.amount,
    };
  }

  public async executeRecoveryAction(paymentId: string, actionType: string) {
    return this.simulateRetryPayment(paymentId);
  }
}
