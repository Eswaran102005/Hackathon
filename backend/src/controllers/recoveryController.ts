import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { MockPaymentProvider } from '../services/paymentProvider';

const prisma = new PrismaClient();
const paymentProvider = new MockPaymentProvider(prisma);

export const getRecoveryActions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actions = await prisma.recoveryAction.findMany({
      include: {
        payment: {
          include: { customer: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const events = await prisma.recoveryEvent.findMany({
      include: {
        payment: {
          include: { customer: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      data: {
        actions,
        events,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const scheduleAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const { actionType, delayMinutes = 0 } = req.body;

    const scheduledAt = new Date(Date.now() + delayMinutes * 60000);
    const action = await prisma.recoveryAction.create({
      data: {
        paymentId,
        actionType: actionType || 'RETRY_LATER',
        scheduledAt,
        status: 'SCHEDULED',
        expectedValue: 4000,
      },
    });

    await prisma.recoveryEvent.create({
      data: {
        paymentId,
        actionId: action.id,
        eventType: 'ACTION_SCHEDULED',
        eventData: JSON.stringify({ actionType, scheduledAt: scheduledAt.toISOString() }),
      },
    });

    res.status(201).json({
      success: true,
      data: action,
    });
  } catch (err) {
    next(err);
  }
};

export const executeAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const result = await paymentProvider.simulateRetryPayment(paymentId);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
