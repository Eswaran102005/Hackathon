export interface ScoringInput {
  amount: number;
  paymentMethod: string; // card, upi, netbanking, wallet
  failureReason: string; // insufficient_funds, bank_declined, network_timeout, authentication_failed, card_expired, customer_abandoned, unknown
  attemptNumber: number;
  customerLifetimeValue: number;
  previousSuccessCount: number;
  previousFailedCount: number;
  previousRecoveredCount: number;
  createdAt?: Date;
}

export interface ScoringResult {
  recoveryProbability: number; // 0.0 - 1.0
  confidence: number;          // 0.0 - 1.0
  expectedRecovery: number;
  signals: {
    positive: string[];
    negative: string[];
  };
  featureVector: Record<string, number | string>;
}

export class AIScoringService {
  /**
   * Calculates recovery probability based on deterministic feature scoring weights.
   */
  public static scorePayment(input: ScoringInput): ScoringResult {
    let score = 0.50; // Baseline
    const positiveSignals: string[] = [];
    const negativeSignals: string[] = [];

    // 1. Payment Method Baseline
    switch (input.paymentMethod.toLowerCase()) {
      case 'upi':
        score += 0.12;
        positiveSignals.push("UPI payments exhibit the highest recovery success rate (instant retry availability)");
        break;
      case 'card':
        score += 0.05;
        positiveSignals.push("Card payments have reliable secondary auth retry paths");
        break;
      case 'netbanking':
        score -= 0.04;
        negativeSignals.push("Netbanking relies on bank gateway session stability");
        break;
      case 'wallet':
        score += 0.02;
        break;
      default:
        break;
    }

    // 2. Failure Reason Impact
    switch (input.failureReason.toLowerCase()) {
      case 'network_timeout':
        score += 0.22;
        positiveSignals.push("Transient network timeout has ultra-high recovery potential on immediate/delayed retry");
        break;
      case 'insufficient_funds':
        score += 0.10;
        positiveSignals.push("Insufficient funds recoverable after salary/cycle delay (6-24 hours)");
        break;
      case 'authentication_failed':
        score += 0.08;
        positiveSignals.push("Authentication/OTP drop-off highly recoverable via prompt payment link");
        break;
      case 'bank_declined':
        score -= 0.10;
        negativeSignals.push("Bank declined transaction requires customer action or alternate payment mode");
        break;
      case 'card_expired':
        score -= 0.25;
        negativeSignals.push("Card expiry requires payment method update");
        break;
      case 'customer_abandoned':
        score -= 0.05;
        negativeSignals.push("Customer intent abandoned checkout session");
        break;
      default:
        score -= 0.08;
        break;
    }

    // 3. Customer Loyalty & Historical Behavior
    if (input.previousSuccessCount > 5) {
      score += 0.18;
      positiveSignals.push(`Highly loyal customer (${input.previousSuccessCount} past successful transactions)`);
    } else if (input.previousSuccessCount > 0) {
      score += 0.08;
      positiveSignals.push(`Returning customer with ${input.previousSuccessCount} past successful transactions`);
    } else {
      score -= 0.08;
      negativeSignals.push("First-time customer with no prior transaction history");
    }

    if (input.previousRecoveredCount > 0) {
      score += 0.12;
      positiveSignals.push("Customer previously responded positively to recovery nudge");
    }

    if (input.customerLifetimeValue > 10000) {
      score += 0.10;
      positiveSignals.push(`High Lifetime Value customer (₹${input.customerLifetimeValue.toLocaleString('en-IN')})`);
    }

    // 4. Attempt Penalty
    if (input.attemptNumber === 1) {
      score += 0.05;
    } else if (input.attemptNumber >= 3) {
      score -= 0.20;
      negativeSignals.push(`Multiple failed attempts (${input.attemptNumber} prior attempts)`);
    }

    // 5. Amount Factor
    if (input.amount > 20000) {
      score -= 0.05; // High friction for very large payments without manual review
    } else if (input.amount < 1500) {
      score += 0.06; // Lower friction for small ticket items
    }

    // Clamp score between 0.05 and 0.98
    const recoveryProbability = Math.min(Math.max(Number(score.toFixed(2)), 0.05), 0.98);

    // Calculate Confidence based on feature completeness
    let confidence = 0.85;
    if (input.previousSuccessCount > 0) confidence += 0.05;
    if (input.failureReason !== 'unknown') confidence += 0.04;
    confidence = Math.min(Math.max(Number(confidence.toFixed(2)), 0.70), 0.96);

    const expectedRecovery = Math.round(input.amount * recoveryProbability);

    return {
      recoveryProbability,
      confidence,
      expectedRecovery,
      signals: {
        positive: positiveSignals,
        negative: negativeSignals,
      },
      featureVector: {
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        failureReason: input.failureReason,
        attemptNumber: input.attemptNumber,
        customerLifetimeValue: input.customerLifetimeValue,
        previousSuccessCount: input.previousSuccessCount,
        previousRecoveredCount: input.previousRecoveredCount,
      },
    };
  }
}
