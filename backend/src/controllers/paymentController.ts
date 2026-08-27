import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { MockPaymentProvider } from '../services/paymentProvider';

const prisma = new PrismaClient();
const paymentProvider = new MockPaymentProvider(prisma);

export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, failureReason, paymentMethod, search, page = '1', limit = '15' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status as string;
    }
    if (failureReason && failureReason !== 'ALL') {
      where.failureReason = failureReason as string;
    }
    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod as string;
    }
    if (search) {
      where.OR = [
        { externalPaymentId: { contains: search as string } },
        { customer: { name: { contains: search as string } } },
        { customer: { email: { contains: search as string } } },
      ];
    }

    const totalCount = await prisma.payment.count({ where });
    const payments = await prisma.payment.findMany({
      where,
      include: {
        customer: true,
        predictions: { orderBy: { createdAt: 'desc' }, take: 1 },
        actions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            payments: {
              where: { id: { not: id } },
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        predictions: { orderBy: { createdAt: 'desc' } },
        actions: { orderBy: { createdAt: 'desc' } },
        events: { orderBy: { createdAt: 'desc' } },
        aiMessages: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment with specified ID was not found.' },
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (err) {
    next(err);
  }
};

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await paymentProvider.processFailedPayment(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const retryPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await paymentProvider.simulateRetryPayment(id);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
