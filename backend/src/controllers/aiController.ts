import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AIScoringService } from '../services/aiScoringService';
import { StrategyEngine } from '../services/strategyEngine';
import { GeminiService } from '../services/geminiService';

const prisma = new PrismaClient();

export const predictPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { customer: true },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment not found' },
      });
    }

    const pastSuccess = await prisma.payment.count({
      where: { customerId: payment.customerId, status: 'SUCCESS' },
    });

    const scoring = AIScoringService.scorePayment({
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      failureReason: payment.failureReason || 'unknown',
      attemptNumber: payment.attemptNumber,
      customerLifetimeValue: payment.customer?.lifetimeValue || 0,
      previousSuccessCount: pastSuccess,
      previousFailedCount: 1,
      previousRecoveredCount: 0,
    });

    const strategy = StrategyEngine.selectStrategy(
      payment.amount,
      scoring,
      payment.attemptNumber,
      payment.failureReason || 'unknown'
    );

    const explanation = await GeminiService.generateExplanation(
      {
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        failureReason: payment.failureReason || 'unknown',
        attemptNumber: payment.attemptNumber,
        customerName: payment.customer?.name,
      },
      scoring,
      strategy
    );

    res.json({
      success: true,
      data: {
        scoring,
        strategy,
        explanation,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPrediction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const prediction = await prisma.recoveryPrediction.findFirst({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: prediction,
    });
  } catch (err) {
    next(err);
  }
};

export const generateMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const { channel = 'WHATSAPP' } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { customer: true },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment not found' },
      });
    }

    const messageResult = await GeminiService.generatePersonalizedMessage(
      {
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        failureReason: payment.failureReason || 'unknown',
        externalPaymentId: payment.externalPaymentId,
      },
      {
        name: payment.customer?.name || 'Valued Customer',
        email: payment.customer?.email || 'customer@example.com',
      },
      channel,
      'RETRY_LATER'
    );

    // Save message record
    const aiMessage = await prisma.aIMessage.create({
      data: {
        paymentId: payment.id,
        channel,
        message: messageResult.message,
        generatedBy: messageResult.generatedBy,
      },
    });

    res.json({
      success: true,
      data: {
        aiMessage,
        messageResult,
      },
    });
  } catch (err) {
    next(err);
  }
};
