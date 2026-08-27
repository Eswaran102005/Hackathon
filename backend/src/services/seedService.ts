import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AIScoringService } from './aiScoringService';
import { StrategyEngine } from './strategyEngine';

export class SeedService {
  public static async seedDatabase(prisma: PrismaClient): Promise<{
    merchantId: string;
    customerCount: number;
    paymentCount: number;
    failedPaymentCount: number;
  }> {
    console.log('🌱 Starting RecoverAI database seeding...');

    await prisma.aIMessage.deleteMany();
    await prisma.recoveryEvent.deleteMany();
    await prisma.recoveryAction.deleteMany();
    await prisma.recoveryPrediction.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.merchant.deleteMany();

    const hashedPassword = await bcrypt.hash('demo1234', 10);
    const merchant = await prisma.merchant.create({
      data: {
        name: 'Razorpay Demo Merchant',
        email: 'demo@recoverai.io',
        passwordHash: hashedPassword,
        businessName: 'Nova Retail India Pvt Ltd',
      },
    });

    console.log(`✅ Seeded Merchant: ${merchant.businessName} (${merchant.id})`);

    const indianFirstNames = [
      'Aarav', 'Ananya', 'Rohan', 'Priya', 'Aditya', 'Sneha', 'Vikram', 'Neha', 'Kabir', 'Kavya',
      'Rahul', 'Pooja', 'Siddharth', 'Isha', 'Varun', 'Riya', 'Amit', 'Divya', 'Dev', 'Meera',
      'Karan', 'Tanvi', 'Manish', 'Simran', 'Akash', 'Shruti', 'Rajesh', 'Anushka', 'Suresh', 'Bhavna'
    ];

    const indianLastNames = [
      'Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Iyer', 'Reddy', 'Nair', 'Joshi',
      'Deshmukh', 'Chopra', 'Malhotra', 'Agarwal', 'Mehta', 'Rao', 'Bhat', 'Saxena', 'Kapoor', 'Pillai'
    ];

    const customerRecords = [];
    for (let i = 1; i <= 105; i++) {
      const firstName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
      const lastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      const phone = `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`;
      const ltv = Math.round(1000 + Math.random() * 45000);

      customerRecords.push({
        merchantId: merchant.id,
        name,
        email,
        phone,
        lifetimeValue: ltv,
      });
    }

    await prisma.customer.createMany({ data: customerRecords });
    const customers = await prisma.customer.findMany({ where: { merchantId: merchant.id } });
    console.log(`✅ Seeded ${customers.length} Customers.`);

    const amounts = [499, 999, 1499, 2999, 4999, 9999, 24999];
    const methods = ['upi', 'upi', 'upi', 'card', 'card', 'netbanking', 'wallet'];
    const failureReasons = [
      'insufficient_funds',
      'bank_declined',
      'network_timeout',
      'authentication_failed',
      'card_expired',
      'customer_abandoned',
      'unknown'
    ];

    let paymentCount = 0;
    let failedCount = 0;
    const now = new Date();

    for (let i = 1; i <= 520; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      const paymentMethod = methods[Math.floor(Math.random() * methods.length)];

      const isFailed = i <= 220 || Math.random() < 0.42;
      const status = isFailed ? 'FAILED' : 'SUCCESS';
      const failureReason = isFailed
        ? failureReasons[Math.floor(Math.random() * failureReasons.length)]
        : null;
      const failureCode = isFailed ? `ERR_${(failureReason || 'GENERIC').toUpperCase()}` : null;
      const attemptNumber = isFailed ? (Math.random() < 0.7 ? 1 : Math.random() < 0.85 ? 2 : 3) : 1;

      const dateOffsetDays = Math.floor(Math.random() * 30);
      const createdAt = new Date(now.getTime() - dateOffsetDays * 86400000 - Math.floor(Math.random() * 86400000));

      const externalPaymentId = `pay_${Date.now().toString(36)}_${i}_${Math.floor(Math.random() * 1000)}`;

      const payment = await prisma.payment.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          externalPaymentId,
          amount,
          currency: 'INR',
          paymentMethod,
          status,
          failureCode,
          failureReason,
          attemptNumber,
          createdAt,
          updatedAt: createdAt,
        },
      });

      paymentCount++;
      if (isFailed) failedCount++;

      if (isFailed && failureReason) {
        const scoringInput = {
          amount,
          paymentMethod,
          failureReason,
          attemptNumber,
          customerLifetimeValue: customer.lifetimeValue,
          previousSuccessCount: Math.floor(Math.random() * 8),
          previousFailedCount: Math.floor(Math.random() * 2),
          previousRecoveredCount: Math.floor(Math.random() * 2),
          createdAt,
        };

        const scoring = AIScoringService.scorePayment(scoringInput);
        const strategy = StrategyEngine.selectStrategy(amount, scoring, attemptNumber, failureReason);

        const prediction = await prisma.recoveryPrediction.create({
          data: {
            paymentId: payment.id,
            recoveryProbability: scoring.recoveryProbability,
            expectedRecovery: scoring.expectedRecovery,
            recommendedAction: strategy.recommendedAction,
            recommendedDelayMinutes: strategy.recommendedDelayMinutes,
            confidence: scoring.confidence,
            reason: strategy.reason,
            modelVersion: '1.0.0-xgb-hybrid',
            createdAt,
          },
        });

        let actionStatus = 'SCHEDULED';
        let actualRecoveredAmount: number | null = null;
        let isRecovered = false;

        if (i % 3 === 0 && scoring.recoveryProbability > 0.40) {
          actionStatus = 'EXECUTED';
          isRecovered = true;
          actualRecoveredAmount = amount;
        } else if (i % 5 === 0) {
          actionStatus = 'EXECUTED';
        }

        const action = await prisma.recoveryAction.create({
          data: {
            paymentId: payment.id,
            actionType: strategy.recommendedAction,
            scheduledAt: new Date(createdAt.getTime() + strategy.recommendedDelayMinutes * 60000),
            executedAt: actionStatus === 'EXECUTED' ? new Date(createdAt.getTime() + (strategy.recommendedDelayMinutes + 5) * 60000) : null,
            status: actionStatus,
            expectedValue: strategy.expectedValue,
            actualRecoveredAmount,
            createdAt,
          },
        });

        if (isRecovered) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'RECOVERED' },
          });
        }

        await prisma.recoveryEvent.create({
          data: {
            paymentId: payment.id,
            actionId: action.id,
            eventType: 'PAYMENT_FAILED',
            eventData: JSON.stringify({ amount, failureReason, paymentMethod }),
            createdAt,
          },
        });

        await prisma.recoveryEvent.create({
          data: {
            paymentId: payment.id,
            actionId: action.id,
            eventType: 'PREDICTION_GENERATED',
            eventData: JSON.stringify({
              probability: scoring.recoveryProbability,
              recommendedAction: strategy.recommendedAction,
            }),
            createdAt: new Date(createdAt.getTime() + 1000),
          },
        });

        if (isRecovered) {
          await prisma.recoveryEvent.create({
            data: {
              paymentId: payment.id,
              actionId: action.id,
              eventType: 'PAYMENT_RECOVERED',
              eventData: JSON.stringify({ amountRecovered: amount, channel: strategy.recommendedAction }),
              createdAt: new Date(createdAt.getTime() + (strategy.recommendedDelayMinutes + 10) * 60000),
            },
          });
        }

        await prisma.aIMessage.create({
          data: {
            paymentId: payment.id,
            channel: strategy.recommendedAction === 'WHATSAPP' ? 'WHATSAPP' : 'EMAIL',
            message: `Hi ${customer.name}, your payment of ₹${amount} couldn't be completed. Tap to securely retry: https://pay.recoverai.demo/checkout?ref=${externalPaymentId}`,
            generatedBy: 'GEMINI',
            createdAt,
          },
        });
      }
    }

    console.log(`✅ Seeded ${paymentCount} Payments (${failedCount} failed payment scenarios initialized).`);

    return {
      merchantId: merchant.id,
      customerCount: customers.length,
      paymentCount,
      failedPaymentCount: failedCount,
    };
  }
}
