import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { MockPaymentProvider } from '../services/paymentProvider';

const prisma = new PrismaClient();
const paymentProvider = new MockPaymentProvider(prisma);

export const handlePaymentWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    console.log('⚡ [Webhook Received] Processing payment failure payload:', payload);

    const result = await paymentProvider.processFailedPayment(payload);

    res.json({
      success: true,
      message: 'Payment webhook processed successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
