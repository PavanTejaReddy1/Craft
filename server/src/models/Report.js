import mongoose from 'mongoose';
import { REPORT_TYPES, REPORT_STATUS } from '../constants/index.js';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entityType: {
      type: String,
      enum: Object.values(REPORT_TYPES),
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      trim: true,
      minlength: [20, 'Reason must be at least 20 characters'],
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: ['spam', 'inappropriate', 'fraud', 'harassment', 'fake', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.PENDING,
    },
    adminNote: { type: String, trim: true },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ reporter: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ entityType: 1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
