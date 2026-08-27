import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'recoverai_super_secret_jwt_key_2026';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, businessName } = req.body;

    if (!email || !password || !businessName) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email, password, and business name are required' },
      });
    }

    const existing = await prisma.merchant.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'MERCHANT_EXISTS', message: 'Merchant with this email already exists' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const merchant = await prisma.merchant.create({
      data: { name: name || businessName, email, passwordHash, businessName },
    });

    const token = jwt.sign({ id: merchant.id, email: merchant.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: {
        token,
        merchant: { id: merchant.id, name: merchant.name, email: merchant.email, businessName: merchant.businessName },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const merchant = await prisma.merchant.findFirst({ where: { email } }) || await prisma.merchant.findFirst();

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: { code: 'MERCHANT_NOT_FOUND', message: 'No merchant found' },
      });
    }

    const token = jwt.sign({ id: merchant.id, email: merchant.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        merchant: { id: merchant.id, name: merchant.name, email: merchant.email, businessName: merchant.businessName },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchant = await prisma.merchant.findFirst();
    res.json({
      success: true,
      data: { merchant },
    });
  } catch (err) {
    next(err);
  }
};
