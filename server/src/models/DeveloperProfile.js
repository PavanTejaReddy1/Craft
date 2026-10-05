import mongoose from 'mongoose';
import { AVAILABILITY_STATUS } from '../constants/index.js';

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  technologies: [{ type: String, trim: true }],
  projectUrl: { type: String, trim: true },
  repoUrl: { type: String, trim: true },
  imageUrl: { type: String },
  completedAt: { type: Date },
}, { _id: true });

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, trim: true },
}, { _id: true });

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true, trim: true },
  institution: { type: String, required: true, trim: true },
  fieldOfStudy: { type: String, trim: true },
  startYear: { type: Number },
  endYear: { type: Number },
  description: { type: String, trim: true },
}, { _id: true });

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  issuer: { type: String, required: true, trim: true },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  credentialUrl: { type: String, trim: true },
}, { _id: true });

const developerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [150, 'Headline cannot exceed 150 characters'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    },
    skills: [{ type: String, trim: true }],
    technologies: [{ type: String, trim: true }],
    hourlyRate: {
      type: Number,
      min: 0,
    },
    availability: {
      type: String,
      enum: Object.values(AVAILABILITY_STATUS),
      default: AVAILABILITY_STATUS.AVAILABLE,
    },
    location: {
      city: String,
      country: String,
    },
    languages: [{ type: String, trim: true }],
    portfolio: [portfolioItemSchema],
    experience: [experienceSchema],
    education: [educationSchema],
    certifications: [certificationSchema],
    githubUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
    // Stats (computed/updated on events)
    completedProjects: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 },
    profileCompleteness: { type: Number, default: 0 },
    isProfilePublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

developerProfileSchema.index({ skills: 1 });
developerProfileSchema.index({ technologies: 1 });
developerProfileSchema.index({ availability: 1 });
developerProfileSchema.index({ averageRating: -1 });

// Calculate profile completeness before save
developerProfileSchema.pre('save', function () {
  let score = 0;
  if (this.headline) score += 15;
  if (this.bio) score += 15;
  if (this.skills?.length > 0) score += 15;
  if (this.technologies?.length > 0) score += 10;
  if (this.portfolio?.length > 0) score += 15;
  if (this.experience?.length > 0) score += 15;
  if (this.githubUrl || this.linkedinUrl) score += 10;
  if (this.hourlyRate) score += 5;
  this.profileCompleteness = Math.min(score, 100);
});

const DeveloperProfile = mongoose.model('DeveloperProfile', developerProfileSchema);
export default DeveloperProfile;
