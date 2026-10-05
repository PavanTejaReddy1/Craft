import Review from '../models/Review.js';
import Contract from '../models/Contract.js';
import Project from '../models/Project.js';
import DeveloperProfile from '../models/DeveloperProfile.js';
import ClientProfile from '../models/ClientProfile.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { CONTRACT_STATUS, USER_ROLES } from '../constants/index.js';
import { notifyNewReview } from '../services/notificationService.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/v1/reviews
export const createReview = asyncHandler(async (req, res) => {
  const { contractId, rating, comment } = req.body;

  const contract = await Contract.findById(contractId)
    .populate('project', 'title')
    .populate('client', 'name')
    .populate('developer', 'name');

  if (!contract) return errorResponse(res, 'Contract not found', 404);
  if (contract.status !== CONTRACT_STATUS.COMPLETED) {
    return errorResponse(res, 'Reviews can only be submitted after project completion', 400);
  }

  const isClient = contract.client._id.toString() === req.user._id.toString();
  const isDeveloper = contract.developer._id.toString() === req.user._id.toString();

  if (!isClient && !isDeveloper) {
    return errorResponse(res, 'Not authorized to review this project', 403);
  }

  const reviewType = isClient ? 'client_to_developer' : 'developer_to_client';
  const revieweeId = isClient ? contract.developer._id : contract.client._id;

  // Check if already reviewed
  const existing = await Review.findOne({ contract: contractId, reviewType });
  if (existing) return errorResponse(res, 'You have already reviewed this project', 409);

  const review = await Review.create({
    project: contract.project._id,
    contract: contractId,
    reviewer: req.user._id,
    reviewee: revieweeId,
    rating,
    comment,
    reviewType,
  });

  // Update reputation stats
  if (reviewType === 'client_to_developer') {
    await updateDeveloperRating(contract.developer._id);
  } else {
    await updateClientRating(contract.client._id);
  }

  const revieweeName = isClient ? contract.developer.name : contract.client.name;
  notifyNewReview({
    userId: revieweeId,
    reviewerName: req.user.name,
    projectTitle: contract.project.title,
    projectId: contract.project._id,
  });

  return successResponse(res, { review }, 'Review submitted', 201);
});

// GET /api/v1/reviews/user/:userId
export const getUserReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ reviewee: req.params.userId, isHidden: false })
      .populate('reviewer', 'name avatar')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ reviewee: req.params.userId, isHidden: false }),
  ]);

  return successResponse(res, { reviews, total });
});

// GET /api/v1/reviews/contract/:contractId
export const getContractReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ contract: req.params.contractId })
    .populate('reviewer', 'name avatar')
    .populate('reviewee', 'name avatar');

  return successResponse(res, { reviews });
});

// ─── Internal helpers ─────────────────────────────────────────────────────────

const updateDeveloperRating = async (developerId) => {
  const result = await Review.aggregate([
    { $match: { reviewee: developerId, reviewType: 'client_to_developer', isHidden: false } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (result.length > 0) {
    await DeveloperProfile.findOneAndUpdate(
      { user: developerId },
      {
        averageRating: Math.round(result[0].avgRating * 10) / 10,
        totalReviews: result[0].count,
      }
    );
  }
};

const updateClientRating = async (clientId) => {
  const result = await Review.aggregate([
    { $match: { reviewee: clientId, reviewType: 'developer_to_client', isHidden: false } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (result.length > 0) {
    await ClientProfile.findOneAndUpdate(
      { user: clientId },
      {
        averageRating: Math.round(result[0].avgRating * 10) / 10,
        totalReviews: result[0].count,
      }
    );
  }
};
