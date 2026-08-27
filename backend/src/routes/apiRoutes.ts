import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as dashboardController from '../controllers/dashboardController';
import * as paymentController from '../controllers/paymentController';
import * as aiController from '../controllers/aiController';
import * as recoveryController from '../controllers/recoveryController';
import * as simulatorController from '../controllers/simulatorController';
import * as webhookController from '../controllers/webhookController';
import * as demoController from '../controllers/demoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.me);

// Dashboard Routes
router.get('/dashboard/summary', authenticateToken, dashboardController.getSummary);
router.get('/dashboard/revenue', authenticateToken, dashboardController.getRevenueTrends);
router.get('/dashboard/failure-breakdown', authenticateToken, dashboardController.getFailureBreakdown);
router.get('/dashboard/recovery-trends', authenticateToken, dashboardController.getRecoveryTrends);

// Payments Routes
router.get('/payments', authenticateToken, paymentController.getPayments);
router.get('/payments/:id', authenticateToken, paymentController.getPaymentById);
router.post('/payments', authenticateToken, paymentController.createPayment);
router.post('/payments/:id/retry', authenticateToken, paymentController.retryPayment);

// AI Agent Routes
router.post('/ai/predict/:paymentId', authenticateToken, aiController.predictPayment);
router.get('/ai/prediction/:paymentId', authenticateToken, aiController.getPrediction);
router.post('/ai/generate-message/:paymentId', authenticateToken, aiController.generateMessage);

// Recovery & Activity Routes
router.get('/recovery', authenticateToken, recoveryController.getRecoveryActions);
router.post('/recovery/:paymentId/schedule', authenticateToken, recoveryController.scheduleAction);
router.post('/recovery/:paymentId/execute', authenticateToken, recoveryController.executeAction);

// Simulator Routes
router.post('/simulator/run', authenticateToken, simulatorController.runSimulation);

// Webhooks
router.post('/webhooks/payment', webhookController.handlePaymentWebhook);

// Demo Pitch Flow Controls
router.post('/demo/reset', demoController.resetDemoData);
router.post('/demo/simulate-payment-failure', demoController.simulateFailurePitchFlow);
router.post('/demo/simulate-recovery-success', demoController.simulateRecoverySuccess);

export default router;
