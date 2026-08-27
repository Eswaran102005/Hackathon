import { Request, Response, NextFunction } from 'express';

export const runSimulation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      failedCount = 100,
      totalFailedValue = 500000,
      retryDelayHours = 6,
      channel = 'WHATSAPP',
      strategyPreset = 'BALANCED',
    } = req.body;

    const safeCount = Math.max(1, Math.abs(Number(failedCount) || 100));
    const safeValue = Math.max(0, Math.abs(Number(totalFailedValue) || 500000));
    const safeDelay = Math.max(0, Math.min(Number(retryDelayHours) || 6, 72));

    const avgTicket = safeValue / safeCount;

    // Strategy A: Immediate Retry (no delay, no channel nudge)
    const probA = 0.42;
    const yieldA = Math.round(safeValue * probA);

    // Strategy B: Channel Nudge Only (Instant WhatsApp/Email)
    const probB = channel === 'WHATSAPP' ? 0.65 : channel === 'PAYMENT_LINK' ? 0.58 : 0.48;
    const yieldB = Math.round(safeValue * probB);

    // Strategy C: RecoverAI Optimized Strategy (Optimal delay + AI Channel Nudge)
    const delayMultiplier = safeDelay >= 4 && safeDelay <= 12 ? 1.15 : 1.05;
    const probC = Math.min(probB * delayMultiplier, 0.88);
    const yieldC = Math.round(safeValue * probC);

    const uplift = yieldC - yieldA;

    const strategies = [
      {
        name: 'Strategy A: Immediate Gateway Retry',
        delay: 'Instant (0h)',
        channel: 'None',
        recoveryRate: `${(probA * 100).toFixed(0)}%`,
        expectedRecovery: yieldA,
        cost: Math.round(safeCount * 2),
        netReturn: Math.round(yieldA - safeCount * 2),
      },
      {
        name: `Strategy B: ${channel} Nudge`,
        delay: '15 mins',
        channel,
        recoveryRate: `${(probB * 100).toFixed(0)}%`,
        expectedRecovery: yieldB,
        cost: Math.round(safeCount * 12),
        netReturn: Math.round(yieldB - safeCount * 12),
      },
      {
        name: `Strategy C: RecoverAI Multi-Stage (${safeDelay}h Delay + ${channel})`,
        delay: `${safeDelay} Hours`,
        channel: `${channel} + Smart Auto-Retry`,
        recoveryRate: `${(probC * 100).toFixed(0)}%`,
        expectedRecovery: yieldC,
        cost: Math.round(safeCount * 15),
        netReturn: Math.round(yieldC - safeCount * 15),
      },
    ];

    res.json({
      success: true,
      data: {
        inputs: { failedCount: safeCount, totalFailedValue: safeValue, retryDelayHours: safeDelay, channel, strategyPreset },
        recommendedStrategy: `Strategy C: RecoverAI Multi-Stage (${safeDelay}h Delay + ${channel})`,
        potentialUplift: uplift,
        upliftPercentage: Number(((uplift / (yieldA || 1)) * 100).toFixed(1)),
        strategies,
      },
    });
  } catch (err) {
    next(err);
  }
};
