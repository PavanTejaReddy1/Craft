import mongoose from 'mongoose';

/**
 * Inquiry — a direct message thread between a client and a developer
 * that exists OUTSIDE of a project contract (e.g. "I like your profile, let's talk").
 * Once hired, communication moves to the Contract workspace.
 */
const inquirySchema = new mongoose.Schema(
  {
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
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, trim: true, maxlength: 5000, required: true },
        isRead:  { type: Boolean, default: false },
        readAt:  { type: Date, default: null },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    lastMessageAt: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One thread per client–developer pair
inquirySchema.index({ client: 1, developer: 1 }, { unique: true });
inquirySchema.index({ client: 1, lastMessageAt: -1 });
inquirySchema.index({ developer: 1, lastMessageAt: -1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
