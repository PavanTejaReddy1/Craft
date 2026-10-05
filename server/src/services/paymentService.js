/**
 * Payment Provider Abstraction Layer
 *
 * This module provides a clean interface for payment processing.
 * Currently uses a mock provider for development.
 * To integrate a real provider (Razorpay, Stripe, etc.), implement
 * the same interface in a new provider file and swap the import below.
 */

import Payment from '../models/Payment.js';
import { PAYMENT_STATUS, TRANSACTION_TYPE, PLATFORM_FEE_PERCENTAGE } from '../constants/index.js';

// ─── Fee Calculation ──────────────────────────────────────────────────────────

export const calculateFees = (amount) => {
  const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENTAGE / 100));
  const developerEarnings = amount - platformFee;
  return { amount, platformFee, developerEarnings };
};

// ─── Mock Payment Provider ────────────────────────────────────────────────────

const mockProvider = {
  createOrder: async ({ amount, currency, metadata }) => {
    return {
      orderId: `mock_order_${Date.now()}`,
      amount,
      currency,
      status: 'created',
    };
  },

  capturePayment: async ({ orderId, paymentId }) => {
    return {
      success: true,
      transactionId: `mock_txn_${Date.now()}`,
      status: 'captured',
    };
  },

  refund: async ({ paymentId, amount }) => {
    return {
      success: true,
      refundId: `mock_refund_${Date.now()}`,
      amount,
    };
  },
};

// ─── Provider Selection ───────────────────────────────────────────────────────
// To add Razorpay: import razorpayProvider from './providers/razorpayProvider.js';
// const provider = process.env.PAYMENT_PROVIDER === 'razorpay' ? razorpayProvider : mockProvider;
const provider = mockProvider;

// ─── Payment Service ──────────────────────────────────────────────────────────

export const initiatePayment = async ({ contractId, milestoneId, clientId, developerId, amount }) => {
  const fees = calculateFees(amount);

  const order = await provider.createOrder({
    amount: fees.amount,
    currency: 'INR',
    metadata: { contractId, milestoneId },
  });

  const payment = await Payment.create({
    contract: contractId,
    milestone: milestoneId || null,
    client: clientId,
    developer: developerId,
    ...fees,
    currency: 'INR',
    status: PAYMENT_STATUS.PENDING,
    provider: 'mock',
    providerOrderId: order.orderId,
    transactions: [{
      type: TRANSACTION_TYPE.PAYMENT,
      amount: fees.amount,
      currency: 'INR',
      status: PAYMENT_STATUS.PENDING,
      reference: order.orderId,
    }],
  });

  return { payment, order };
};

export const confirmPayment = async ({ paymentId, providerPaymentId }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');

  const result = await provider.capturePayment({
    orderId: payment.providerOrderId,
    paymentId: providerPaymentId,
  });

  if (result.success) {
    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.providerPaymentId = providerPaymentId;
    payment.transactions.push({
      type: TRANSACTION_TYPE.PLATFORM_FEE,
      amount: payment.platformFee,
      currency: payment.currency,
      status: PAYMENT_STATUS.COMPLETED,
      reference: result.transactionId,
      processedAt: new Date(),
    });
    await payment.save();
  }

  return payment;
};

export const processRefund = async ({ paymentId, amount, reason }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== PAYMENT_STATUS.COMPLETED) throw new Error('Cannot refund a non-completed payment');

  const result = await provider.refund({ paymentId: payment.providerPaymentId, amount });

  if (result.success) {
    payment.refundStatus = amount >= payment.amount ? 'full' : 'partial';
    payment.refundAmount += amount;
    payment.transactions.push({
      type: TRANSACTION_TYPE.REFUND,
      amount,
      currency: payment.currency,
      status: PAYMENT_STATUS.COMPLETED,
      reference: result.refundId,
      metadata: { reason },
      processedAt: new Date(),
    });
    await payment.save();
  }

  return payment;
};
