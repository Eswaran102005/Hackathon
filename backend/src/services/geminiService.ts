import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { ScoringResult } from './aiScoringService';
import { StrategyResult } from './strategyEngine';

dotenv.config();

export interface ExplanationResponse {
  explanation: string;
  keyInsights: string[];
  generatedBy: 'GEMINI' | 'FALLBACK';
}

export interface MessageResponse {
  channel: string;
  message: string;
  subject?: string;
  generatedBy: 'GEMINI' | 'FALLBACK';
}

export class GeminiService {
  private static aiClient: GoogleGenerativeAI | null = null;

  private static getClient(): GoogleGenerativeAI | null {
    if (this.aiClient) return this.aiClient;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim().length > 0) {
      try {
        this.aiClient = new GoogleGenerativeAI(apiKey);
        return this.aiClient;
      } catch (err) {
        console.warn('Failed to initialize GoogleGenerativeAI client, falling back to deterministic AI service:', err);
        return null;
      }
    }
    return null;
  }

  public static async generateExplanation(
    payment: { amount: number; paymentMethod: string; failureReason: string; attemptNumber: number; customerName?: string },
    scoring: ScoringResult,
    strategy: StrategyResult
  ): Promise<ExplanationResponse> {
    const ai = this.getClient();

    if (ai) {
      try {
        const prompt = `
You are RecoverAI's financial decision intelligence agent.
Analyze this failed payment and explain the recovery strategy:

- Transaction Amount: ₹${payment.amount.toLocaleString('en-IN')}
- Payment Method: ${payment.paymentMethod}
- Failure Reason: ${payment.failureReason}
- Attempt Number: ${payment.attemptNumber}
- Calculated Recovery Probability: ${(scoring.recoveryProbability * 100).toFixed(0)}%
- Recommended Recovery Action: ${strategy.recommendedAction}
- Recommended Delay: ${strategy.recommendedDelayMinutes} minutes
- Key Signals: ${scoring.signals.positive.concat(scoring.signals.negative).join('; ')}

Provide:
1. A concise 2-sentence executive rationale explaining why this action was selected.
2. 3 bullet-point customer insights.

Format output as JSON:
{
  "explanation": "...",
  "keyInsights": ["...", "...", "..."]
}
`;
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } as any });
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        if (text) {
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          return {
            explanation: parsed.explanation,
            keyInsights: parsed.keyInsights || [],
            generatedBy: 'GEMINI',
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, using deterministic fallback explanation:', err);
      }
    }

    const formattedAmount = `₹${payment.amount.toLocaleString('en-IN')}`;
    let explanation = `Recovery probability is rated high at ${(scoring.recoveryProbability * 100).toFixed(0)}% because this payment failed due to ${payment.failureReason.replace('_', ' ')}. `;

    if (strategy.recommendedAction === 'RETRY_LATER') {
      explanation += `A delayed retry after ${strategy.recommendedDelayMinutes / 60} hours is selected to allow bank clearing cycles to settle before re-attempting ${formattedAmount}.`;
    } else if (strategy.recommendedAction === 'WHATSAPP' || strategy.recommendedAction === 'EMAIL') {
      explanation += `Direct customer nudge via ${strategy.recommendedAction} is selected to provide a seamless 1-click checkout recovery link for ${formattedAmount}.`;
    } else if (strategy.recommendedAction === 'MANUAL_REVIEW') {
      explanation += `Manual merchant review is mandated due to high transaction volume (${formattedAmount}) and bank decline signals.`;
    } else {
      explanation += `${strategy.recommendedAction} was identified as the optimal recovery vector with estimated value of ₹${strategy.expectedValue.toLocaleString('en-IN')}.`;
    }

    const keyInsights = [
      `Historical recovery baseline for ${payment.paymentMethod.toUpperCase()} is ${(scoring.recoveryProbability * 100).toFixed(0)}%.`,
      scoring.signals.positive[0] || `Transaction failure reason '${payment.failureReason}' presents high retry potential.`,
      `Expected recovery yield estimated at ₹${scoring.expectedRecovery.toLocaleString('en-IN')}.`,
    ];

    return {
      explanation,
      keyInsights,
      generatedBy: 'FALLBACK',
    };
  }

  public static async generatePersonalizedMessage(
    payment: { amount: number; paymentMethod: string; failureReason: string; externalPaymentId: string },
    customer: { name: string; email: string },
    channel: 'EMAIL' | 'WHATSAPP' | 'SMS',
    recommendedAction: string
  ): Promise<MessageResponse> {
    const ai = this.getClient();
    const formattedAmount = `₹${payment.amount.toLocaleString('en-IN')}`;
    const paymentLink = `https://pay.recoverai.demo/checkout?ref=${payment.externalPaymentId}`;

    if (ai) {
      try {
        const prompt = `
Generate a polite, modern, customer-centric payment recovery message for a failed online transaction.
Channel: ${channel}
Customer Name: ${customer.name}
Amount: ${formattedAmount}
Failure Reason: ${payment.failureReason.replace('_', ' ')}
Payment Link placeholder: ${paymentLink}

Rules:
- Never mention confidential banking codes or internal ML probabilities.
- Keep tone professional, empathetic, and urgent.
- Include the secure payment link placeholder.
- If channel is EMAIL, include a 'subject' line.

Return JSON:
{
  "subject": "...",
  "message": "..."
}
`;
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } as any });
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        if (text) {
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          return {
            channel,
            subject: parsed.subject,
            message: parsed.message,
            generatedBy: 'GEMINI',
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, using deterministic fallback message generator:', err);
      }
    }

    if (channel === 'WHATSAPP') {
      return {
        channel: 'WHATSAPP',
        message: `Hi ${customer.name}, your payment of ${formattedAmount} couldn't be processed due to a temporary network update. You can complete your purchase securely with 1 click here: ${paymentLink}`,
        generatedBy: 'FALLBACK',
      };
    }

    if (channel === 'SMS') {
      return {
        channel: 'SMS',
        message: `RecoverAI Alert: Your transaction of ${formattedAmount} was incomplete. Retry securely here: ${paymentLink}`,
        generatedBy: 'FALLBACK',
      };
    }

    return {
      channel: 'EMAIL',
      subject: `Action Required: Complete your payment of ${formattedAmount}`,
      message: `Dear ${customer.name},\n\nWe noticed your recent payment of ${formattedAmount} was interrupted due to a temporary issue (${payment.failureReason.replace('_', ' ')}).\n\nDon't worry—your order reservation is held. You can complete your transaction securely by clicking the button below:\n\n${paymentLink}\n\nThank you for choosing us!`,
      generatedBy: 'FALLBACK',
    };
  }
}
