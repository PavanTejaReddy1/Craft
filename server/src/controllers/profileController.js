import DeveloperProfile from '../models/DeveloperProfile.js';
import ClientProfile from '../models/ClientProfile.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { USER_ROLES } from '../constants/index.js';
import path from 'path';
import asyncHandler from '../utils/asyncHandler.js';

// ─── Developer Profile ────────────────────────────────────────────────────────

// GET /api/v1/profile/developer/me
export const getMyDeveloperProfile = asyncHandler(async (req, res) => {
  const profile = await DeveloperProfile.findOne({ user: req.user._id }).populate('user', 'name email avatar isVerified createdAt');
  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile });
});

// GET /api/v1/profile/developer/:userId
export const getDeveloperProfile = asyncHandler(async (req, res) => {
  const profile = await DeveloperProfile.findOne({ user: req.params.userId, isProfilePublic: true })
    .populate('user', 'name avatar isVerified createdAt');
  if (!profile) return errorResponse(res, 'Developer profile not found', 404);

  const reviews = await Review.find({ reviewee: req.params.userId, isHidden: false })
    .populate('reviewer', 'name avatar')
    .populate('project', 'title')
    .sort({ createdAt: -1 })
    .limit(10);

  return successResponse(res, { profile, reviews });
});

// PATCH /api/v1/profile/developer
export const updateDeveloperProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'headline', 'bio', 'skills', 'technologies', 'hourlyRate',
    'availability', 'location', 'languages', 'githubUrl', 'linkedinUrl',
    'websiteUrl', 'isProfilePublic',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const profile = await DeveloperProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('user', 'name email avatar isVerified');

  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile }, 'Profile updated');
});

// POST /api/v1/profile/developer/portfolio
export const addPortfolioItem = asyncHandler(async (req, res) => {
  const profile = await DeveloperProfile.findOneAndUpdate(
    { user: req.user._id },
    { $push: { portfolio: req.body } },
    { new: true, runValidators: true }
  );
  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile }, 'Portfolio item added', 201);
});

// PATCH /api/v1/profile/developer/portfolio/:itemId
export const updatePortfolioItem = asyncHandler(async (req, res) => {
  const profile = await DeveloperProfile.findOne({ user: req.user._id });
  if (!profile) return errorResponse(res, 'Profile not found', 404);

  const item = profile.portfolio.id(req.params.itemId);
  if (!item) return errorResponse(res, 'Portfolio item not found', 404);

  Object.assign(item, req.body);
  await profile.save();
  return successResponse(res, { profile }, 'Portfolio item updated');
});

// DELETE /api/v1/profile/developer/portfolio/:itemId
export const deletePortfolioItem = asyncHandler(async (req, res) => {
  const profile = await DeveloperProfile.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { portfolio: { _id: req.params.itemId } } },
    { new: true }
  );
  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile }, 'Portfolio item removed');
});

// POST /api/v1/profile/developer/experience
export const addExperience = asyncHandler(async (req, res) => {
  const profile = await DeveloperProfile.findOneAndUpdate(
    { user: req.user._id },
    { $push: { experience: req.body } },
    { new: true, runValidators: true }
  );
  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile }, 'Experience added', 201);
});

// DELETE /api/v1/profile/developer/experience/:itemId
export const deleteExperience = asyncHandler(async (req, res) => {
  const profile = await DeveloperProfile.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { experience: { _id: req.params.itemId } } },
    { new: true }
  );
  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile }, 'Experience removed');
});

// POST /api/v1/profile/developer/education
export const addEducation = asyncHandler(async (req, res) => {
  const profile = await DeveloperProfile.findOneAndUpdate(
    { user: req.user._id },
    { $push: { education: req.body } },
    { new: true, runValidators: true }
  );
  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile }, 'Education added', 201);
});

// DELETE /api/v1/profile/developer/education/:itemId
export const deleteEducation = asyncHandler(async (req, res) => {
  const profile = await DeveloperProfile.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { education: { _id: req.params.itemId } } },
    { new: true }
  );
  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile }, 'Education removed');
});

// POST /api/v1/profile/developer/certifications
export const addCertification = asyncHandler(async (req, res) => {
  const profile = await DeveloperProfile.findOneAndUpdate(
    { user: req.user._id },
    { $push: { certifications: req.body } },
    { new: true, runValidators: true }
  );
  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile }, 'Certification added', 201);
});

// DELETE /api/v1/profile/developer/certifications/:itemId
export const deleteCertification = asyncHandler(async (req, res) => {
  const profile = await DeveloperProfile.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { certifications: { _id: req.params.itemId } } },
    { new: true }
  );
  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile }, 'Certification removed');
});

// ─── Client Profile ───────────────────────────────────────────────────────────

// GET /api/v1/profile/client/me
export const getMyClientProfile = asyncHandler(async (req, res) => {
  const profile = await ClientProfile.findOne({ user: req.user._id }).populate('user', 'name email avatar isVerified createdAt');
  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile });
});

// GET /api/v1/profile/client/:userId
export const getClientProfile = asyncHandler(async (req, res) => {
  const profile = await ClientProfile.findOne({ user: req.params.userId, isProfilePublic: true })
    .populate('user', 'name avatar isVerified createdAt');
  if (!profile) return errorResponse(res, 'Client profile not found', 404);

  const reviews = await Review.find({ reviewee: req.params.userId, isHidden: false })
    .populate('reviewer', 'name avatar')
    .populate('project', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

  return successResponse(res, { profile, reviews });
});

// PATCH /api/v1/profile/client
export const updateClientProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['companyName', 'companyWebsite', 'industry', 'bio', 'location', 'linkedinUrl', 'websiteUrl', 'isProfilePublic'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const profile = await ClientProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('user', 'name email avatar isVerified');

  if (!profile) return errorResponse(res, 'Profile not found', 404);
  return successResponse(res, { profile }, 'Profile updated');
});

// ─── Avatar Upload ────────────────────────────────────────────────────────────

// POST /api/v1/profile/avatar
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return errorResponse(res, 'No file uploaded', 400);

  const avatarUrl = `/uploads/profiles/${req.file.filename}`;
  await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

  return successResponse(res, { avatar: avatarUrl }, 'Avatar uploaded');
});

// ─── Developer Search ─────────────────────────────────────────────────────────

// GET /api/v1/profile/developers
export const searchDevelopers = asyncHandler(async (req, res) => {
  const { skill, technology, availability, minRating, page = 1, limit = 12 } = req.query;

  const filter = { isProfilePublic: true };
  if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };
  if (technology) filter.technologies = { $in: [new RegExp(technology, 'i')] };
  if (availability) filter.availability = availability;
  if (minRating) filter.averageRating = { $gte: Number(minRating) };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await DeveloperProfile.countDocuments(filter);
  const profiles = await DeveloperProfile.find(filter)
    .populate('user', 'name avatar isVerified')
    .sort({ averageRating: -1, completedProjects: -1 })
    .skip(skip)
    .limit(Number(limit));

  return successResponse(res, {
    profiles,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});
