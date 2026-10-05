import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [20, 'Comment must be at least 20 characters'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    // Which direction: client→developer or developer→client
    reviewType: {
      type: String,
      enum: ['client_to_developer', 'developer_to_client'],
      required: true,
    },
    isModerated: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    moderationNote: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One review per direction per contract
reviewSchema.index({ contract: 1, reviewType: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, rating: -1 });
reviewSchema.index({ reviewer: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
