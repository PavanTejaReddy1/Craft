import mongoose from 'mongoose';
import { PAYMENT_STATUS, TRANSACTION_TYPE } from '../constants/index.js';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(TRANSACTION_TYPE),
    required: true,
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING,
  },
  reference: { type: String, trim: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  processedAt: { type: Date, default: null },
}, { timestamps: true });

const paymentSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      min: 0,
    },
    developerEarnings: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    // Payment provider abstraction - swap this for real provider later
    provider: {
      type: String,
      enum: ['mock', 'razorpay', 'stripe', 'paypal'],
      default: 'mock',
    },
    providerPaymentId: { type: String, trim: true },
    providerOrderId: { type: String, trim: true },
    transactions: [transactionSchema],
    refundStatus: {
      type: String,
      enum: ['none', 'partial', 'full'],
      default: 'none',
    },
    refundAmount: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ contract: 1 });
paymentSchema.index({ client: 1 });
paymentSchema.index({ developer: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
