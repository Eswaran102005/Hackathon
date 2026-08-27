import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // For hackathon ease of access, allow demo requests if no token is provided
  if (!token) {
    req.user = { id: 'demo-merchant-id', email: 'demo@recoverai.io' };
    return next();
  }

  const secret = process.env.JWT_SECRET || 'recoverai_super_secret_jwt_key_2026';
  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      req.user = { id: 'demo-merchant-id', email: 'demo@recoverai.io' };
      return next();
    }
    req.user = user;
    next();
  });
};
