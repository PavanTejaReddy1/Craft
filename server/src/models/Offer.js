import mongoose from 'mongoose';
import { OFFER_STATUS } from '../constants/index.js';

const offerMilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  amount: { type: Number, required: true, min: 0 },
  dueInDays: { type: Number, required: true, min: 1 },
  order: { type: Number, required: true },
}, { _id: true });

const offerSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposedPrice: {
      type: Number,
      required: [true, 'Proposed price is required'],
      min: [1, 'Price must be greater than 0'],
    },
    deliveryDays: {
      type: Number,
      required: [true, 'Delivery time is required'],
      min: [1, 'Delivery time must be at least 1 day'],
    },
    coverLetter: {
      type: String,
      required: [true, 'Proposal is required'],
      trim: true,
      minlength: [100, 'Proposal must be at least 100 characters'],
      maxlength: [5000, 'Proposal cannot exceed 5000 characters'],
    },
    milestones: [offerMilestoneSchema],
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Additional notes cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(OFFER_STATUS),
      default: OFFER_STATUS.PENDING,
    },
    isShortlisted: {
      type: Boolean,
      default: false,
    },
    clientNote: {
      type: String,
      trim: true,
    },
    withdrawnAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One offer per developer per project
offerSchema.index({ project: 1, developer: 1 }, { unique: true });
offerSchema.index({ project: 1, status: 1 });
offerSchema.index({ developer: 1, status: 1 });
offerSchema.index({ createdAt: -1 });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
