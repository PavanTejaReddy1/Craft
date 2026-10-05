import mongoose from 'mongoose';
import { PROJECT_STATUS, BUDGET_TYPES, EXPERIENCE_LEVELS } from '../constants/index.js';

const attachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: true });

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    skills: [{ type: String, trim: true }],
    technologies: [{ type: String, trim: true }],
    budgetType: {
      type: String,
      enum: Object.values(BUDGET_TYPES),
      default: BUDGET_TYPES.FIXED,
    },
    budgetMin: {
      type: Number,
      required: [true, 'Minimum budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    budgetMax: {
      type: Number,
      required: [true, 'Maximum budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    expectedDeliveryDays: {
      type: Number,
      required: [true, 'Expected delivery time is required'],
      min: [1, 'Delivery time must be at least 1 day'],
    },
    deadline: {
      type: Date,
    },
    experienceLevel: {
      type: String,
      enum: Object.values(EXPERIENCE_LEVELS),
      default: EXPERIENCE_LEVELS.INTERMEDIATE,
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.OPEN,
    },
    attachments: [attachmentSchema],
    additionalRequirements: {
      type: String,
      trim: true,
      maxlength: [2000, 'Additional requirements cannot exceed 2000 characters'],
    },
    // Offer tracking
    offerCount: { type: Number, default: 0 },
    acceptedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      default: null,
    },
    assignedDeveloper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Flags
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search and filtering
projectSchema.index({ client: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ budgetMin: 1, budgetMax: 1 });
projectSchema.index({ experienceLevel: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ isFeatured: 1, createdAt: -1 });
// Full text search
projectSchema.index({ title: 'text', description: 'text', skills: 'text', technologies: 'text' });

const Project = mongoose.model('Project', projectSchema);
export default Project;
