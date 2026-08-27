import { ScoringResult } from './aiScoringService';

export type StrategyActionType =
  | 'NO_ACTION'
  | 'RETRY_NOW'
  | 'RETRY_LATER'
  | 'EMAIL'
  | 'WHATSAPP'
  | 'PAYMENT_LINK'
  | 'MANUAL_REVIEW';

export interface StrategyCandidate {
  action: StrategyActionType;
  actionSuccessProbability: number;
  cost: number;
  delayMinutes: number;
  expectedValue: number;
  description: string;
}

export interface StrategyResult {
  recommendedAction: StrategyActionType;
  recommendedDelayMinutes: number;
  expectedRecovery: number;
  expectedValue: number;
  reason: string;
  guardrailTriggered?: string;
  candidates: StrategyCandidate[];
}

export class StrategyEngine {
  public static selectStrategy(
    amount: number,
    scoring: ScoringResult,
    attemptNumber: number,
    failureReason: string
  ): StrategyResult {
    const prob = scoring.recoveryProbability;

    if (attemptNumber >= 4) {
      return {
        recommendedAction: 'NO_ACTION',
        recommendedDelayMinutes: 0,
        expectedRecovery: 0,
        expectedValue: 0,
        reason: "Guardrail triggered: Maximum retry attempts reached (4 attempts limit exceeded).",
        guardrailTriggered: "MAX_ATTEMPTS_EXCEEDED",
        candidates: [],
      };
    }

    if (prob < 0.15) {
      return {
        recommendedAction: 'NO_ACTION',
        recommendedDelayMinutes: 0,
        expectedRecovery: 0,
        expectedValue: 0,
        reason: "Guardrail triggered: Extremely low recovery probability (<15%). Suppressing action to protect customer experience.",
        guardrailTriggered: "LOW_PROBABILITY_SUPPRESSION",
        candidates: [],
      };
    }

    if (amount >= 25000 && (failureReason === 'bank_declined' || failureReason === 'unknown')) {
      return {
        recommendedAction: 'MANUAL_REVIEW',
        recommendedDelayMinutes: 0,
        expectedRecovery: Math.round(amount * prob * 0.85),
        expectedValue: Math.round(amount * prob * 0.85 - 100),
        reason: `Guardrail triggered: High-value transaction (₹${amount.toLocaleString('en-IN')}) with ${failureReason}. Escalating for merchant human review.`,
        guardrailTriggered: "HIGH_VALUE_MANUAL_REVIEW",
        candidates: [],
      };
    }

    const candidates: StrategyCandidate[] = [];

    if (failureReason === 'network_timeout') {
      const pSuccess = 0.92;
      const cost = 2;
      const ev = amount * prob * pSuccess - cost;
      candidates.push({
        action: 'RETRY_NOW',
        actionSuccessProbability: pSuccess,
        cost,
        delayMinutes: 0,
        expectedValue: Math.round(ev),
        description: 'Instant gateway auto-retry for transient network timeout.',
      });
    }

    const retryDelay = failureReason === 'insufficient_funds' ? 360 : 120;
    const retryPSuccess = failureReason === 'insufficient_funds' ? 0.88 : 0.82;
    const retryCost = 2;
    const retryEV = amount * prob * retryPSuccess - retryCost;
    candidates.push({
      action: 'RETRY_LATER',
      actionSuccessProbability: retryPSuccess,
      cost: retryCost,
      delayMinutes: retryDelay,
      expectedValue: Math.round(retryEV),
      description: `Schedule auto-retry after ${retryDelay / 60} hours optimal window.`,
    });

    const waPSuccess = 0.85;
    const waCost = 15;
    const waEV = amount * prob * waPSuccess - waCost;
    candidates.push({
      action: 'WHATSAPP',
      actionSuccessProbability: waPSuccess,
      cost: waCost,
      delayMinutes: 15,
      expectedValue: Math.round(waEV),
      description: 'Send high-conversion interactive WhatsApp payment recovery link.',
    });

    const emailPSuccess = 0.68;
    const emailCost = 1;
    const emailEV = amount * prob * emailPSuccess - emailCost;
    candidates.push({
      action: 'EMAIL',
      actionSuccessProbability: emailPSuccess,
      cost: emailCost,
      delayMinutes: 30,
      expectedValue: Math.round(emailEV),
      description: 'Send personalized recovery email notification with payment button.',
    });

    const plPSuccess = 0.78;
    const plCost = 5;
    const plEV = amount * prob * plPSuccess - plCost;
    candidates.push({
      action: 'PAYMENT_LINK',
      actionSuccessProbability: plPSuccess,
      cost: plCost,
      delayMinutes: 10,
      expectedValue: Math.round(plEV),
      description: 'Generate and dispatch one-click secure checkout payment link.',
    });

    candidates.sort((a, b) => b.expectedValue - a.expectedValue);
    const winner = candidates[0];

    let reason = winner.description;
    if (scoring.signals.positive.length > 0) {
      reason += ` Signal: ${scoring.signals.positive[0]}.`;
    }

    return {
      recommendedAction: winner.action,
      recommendedDelayMinutes: winner.delayMinutes,
      expectedRecovery: scoring.expectedRecovery,
      expectedValue: winner.expectedValue,
      reason,
      candidates,
    };
  }
}
