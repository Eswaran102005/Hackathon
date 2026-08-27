import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { SeedService } from '../services/seedService';
import { MockPaymentProvider } from '../services/paymentProvider';

const prisma = new PrismaClient();
const paymentProvider = new MockPaymentProvider(prisma);

export const resetDemoData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seedResult = await SeedService.seedDatabase(prisma);
    res.json({
      success: true,
      message: 'Demo dataset successfully reset and re-seeded!',
      data: seedResult,
    });
  } catch (err) {
    next(err);
  }
};

export const simulateFailurePitchFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Exact Pitch Demo Scenario: ₹5,000 UPI transaction failure for Arun Kumar
    const result = await paymentProvider.processFailedPayment({
      amount: 5000,
      paymentMethod: 'upi',
      failureReason: 'temporary_bank_failure',
      customerName: 'Arun Kumar',
      customerEmail: 'arun.kumar@example.com',
      externalPaymentId: `pay_pitch_${Date.now()}`,
    });

    res.json({
      success: true,
      message: 'Simulated payment failure created for Pitch Flow',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const simulateRecoverySuccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.body;
    let targetPaymentId = paymentId;

    if (!targetPaymentId) {
      const latestFailed = await prisma.payment.findFirst({
        where: { status: 'FAILED' },
        orderBy: { createdAt: 'desc' },
      });
      if (latestFailed) targetPaymentId = latestFailed.id;
    }

    if (!targetPaymentId) {
      return res.status(404).json({
        success: false,
        error: { code: 'PAYMENT_NOT_FOUND', message: 'No failed payment available for recovery simulation.' },
      });
    }

    const result = await paymentProvider.simulateRetryPayment(targetPaymentId);
    res.json({
      success: true,
      message: 'Simulated recovery successful! +₹5,000 added to recovered revenue.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
