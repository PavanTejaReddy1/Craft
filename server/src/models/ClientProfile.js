import mongoose from 'mongoose';

const clientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    companyWebsite: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    location: {
      city: String,
      country: String,
    },
    linkedinUrl: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
    // Stats
    totalProjectsPosted: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isProfilePublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// clientProfileSchema index defined via unique: true on the field

const ClientProfile = mongoose.model('ClientProfile', clientProfileSchema);
export default ClientProfile;
