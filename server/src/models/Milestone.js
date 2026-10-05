import mongoose from 'mongoose';
import { MILESTONE_STATUS } from '../constants/index.js';

const submissionSchema = new mongoose.Schema({
  message: { type: String, trim: true },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
  }],
  submittedAt: { type: Date, default: Date.now },
  revisionNote: { type: String, trim: true },
}, { _id: true });

const milestoneSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Milestone amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(MILESTONE_STATUS),
      default: MILESTONE_STATUS.PENDING,
    },
    submissions: [submissionSchema],
    approvedAt: { type: Date, default: null },
    approvalNote: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

milestoneSchema.index({ contract: 1, order: 1 });
milestoneSchema.index({ project: 1 });
milestoneSchema.index({ status: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);
export default Milestone;
