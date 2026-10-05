import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    attachments: [{
      filename: { type: String },
      originalName: { type: String },
      mimetype: { type: String },
      size: { type: Number },
      url: { type: String },
    }],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'system'],
      default: 'text',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

messageSchema.index({ contract: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ isRead: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
