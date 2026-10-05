import mongoose from 'mongoose';
import { CONTRACT_STATUS } from '../constants/index.js';

const contractSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true,
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
    agreedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryDays: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expectedEndDate: {
      type: Date,
      required: true,
    },
    actualEndDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(CONTRACT_STATUS),
      default: CONTRACT_STATUS.ACTIVE,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    developerEarnings: {
      type: Number,
      required: true,
    },
    termsAcceptedByClient: { type: Boolean, default: true },
    termsAcceptedByDeveloper: { type: Boolean, default: false },
    cancellationReason: { type: String, trim: true },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

contractSchema.index({ client: 1 });
contractSchema.index({ developer: 1 });
contractSchema.index({ status: 1 });

const Contract = mongoose.model('Contract', contractSchema);
export default Contract;
