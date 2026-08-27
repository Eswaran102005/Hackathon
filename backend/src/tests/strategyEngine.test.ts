import { describe, it, expect } from 'vitest';
import { AIScoringService } from '../services/aiScoringService';
import { StrategyEngine } from '../services/strategyEngine';

describe('RecoverAI Strategy & Scoring Engine Unit Tests', () => {
  it('should compute high recovery probability for transient network timeout', () => {
    const scoring = AIScoringService.scorePayment({
      amount: 4999,
      paymentMethod: 'upi',
      failureReason: 'network_timeout',
      attemptNumber: 1,
      customerLifetimeValue: 25000,
      previousSuccessCount: 8,
      previousFailedCount: 0,
      previousRecoveredCount: 1,
    });

    expect(scoring.recoveryProbability).toBeGreaterThan(0.75);
    expect(scoring.expectedRecovery).toBeGreaterThan(3700);
    expect(scoring.signals.positive.length).toBeGreaterThan(0);
  });

  it('should select RETRY_NOW for immediate network timeouts', () => {
    const scoring = AIScoringService.scorePayment({
      amount: 5000,
      paymentMethod: 'card',
      failureReason: 'network_timeout',
      attemptNumber: 1,
      customerLifetimeValue: 10000,
      previousSuccessCount: 3,
      previousFailedCount: 0,
      previousRecoveredCount: 0,
    });

    const strategy = StrategyEngine.selectStrategy(5000, scoring, 1, 'network_timeout');
    expect(strategy.recommendedAction).toBe('RETRY_NOW');
  });

  it('should enforce guardrail for max retry attempts', () => {
    const scoring = AIScoringService.scorePayment({
      amount: 2000,
      paymentMethod: 'card',
      failureReason: 'insufficient_funds',
      attemptNumber: 4,
      customerLifetimeValue: 5000,
      previousSuccessCount: 1,
      previousFailedCount: 3,
      previousRecoveredCount: 0,
    });

    const strategy = StrategyEngine.selectStrategy(2000, scoring, 4, 'insufficient_funds');
    expect(strategy.recommendedAction).toBe('NO_ACTION');
    expect(strategy.guardrailTriggered).toBe('MAX_ATTEMPTS_EXCEEDED');
  });

  it('should enforce guardrail for high-value unusual transaction', () => {
    const scoring = AIScoringService.scorePayment({
      amount: 30000,
      paymentMethod: 'netbanking',
      failureReason: 'bank_declined',
      attemptNumber: 1,
      customerLifetimeValue: 40000,
      previousSuccessCount: 2,
      previousFailedCount: 0,
      previousRecoveredCount: 0,
    });

    const strategy = StrategyEngine.selectStrategy(30000, scoring, 1, 'bank_declined');
    expect(strategy.recommendedAction).toBe('MANUAL_REVIEW');
    expect(strategy.guardrailTriggered).toBe('HIGH_VALUE_MANUAL_REVIEW');
  });
});
