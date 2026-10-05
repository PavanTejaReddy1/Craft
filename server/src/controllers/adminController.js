import User from '../models/User.js';
import Project from '../models/Project.js';
import Offer from '../models/Offer.js';
import Contract from '../models/Contract.js';
import Review from '../models/Review.js';
import Report from '../models/Report.js';
import DeveloperProfile from '../models/DeveloperProfile.js';
import ClientProfile from '../models/ClientProfile.js';
import AuditLog from '../models/AuditLog.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createAuditLog } from '../utils/auditLogger.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/v1/admin/stats
export const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalClients, totalDevelopers,
    totalProjects, openProjects, activeProjects, completedProjects,
    totalOffers, totalContracts, pendingReports,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    User.countDocuments({ role: 'client' }),
    User.countDocuments({ role: 'developer' }),
    Project.countDocuments(),
    Project.countDocuments({ status: 'open' }),
    Project.countDocuments({ status: 'in_progress' }),
    Project.countDocuments({ status: 'completed' }),
    Offer.countDocuments(),
    Contract.countDocuments(),
    Report.countDocuments({ status: 'pending' }),
  ]);

  // Revenue estimate
  const revenueAgg = await Contract.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$platformFee' } } },
  ]);

  return successResponse(res, {
    stats: {
      users: { total: totalUsers, clients: totalClients, developers: totalDevelopers },
      projects: { total: totalProjects, open: openProjects, active: activeProjects, completed: completedProjects },
      offers: totalOffers,
      contracts: totalContracts,
      pendingReports,
      estimatedRevenue: revenueAgg[0]?.total || 0,
    },
  });
});

// GET /api/v1/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status === 'suspended') filter.isSuspended = true;
  if (status === 'active') filter.isSuspended = false;
  if (search) filter.$or = [
    { name: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return successResponse(res, { users, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// PATCH /api/v1/admin/users/:id/suspend
export const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 'User not found', 404);
  if (user.role === 'admin') return errorResponse(res, 'Cannot suspend admin users', 403);

  user.isSuspended = true;
  user.suspensionReason = req.body.reason || 'Policy violation';
  await user.save({ validateBeforeSave: false });

  await createAuditLog({
    user: req.user._id,
    action: 'USER_SUSPENDED',
    entity: 'User',
    entityId: user._id,
    ip: req.ip,
    metadata: { reason: user.suspensionReason },
  });

  return successResponse(res, {}, 'User suspended');
});

// PATCH /api/v1/admin/users/:id/unsuspend
export const unsuspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { isSuspended: false, suspensionReason: null } },
    { new: true }
  );
  if (!user) return errorResponse(res, 'User not found', 404);

  await createAuditLog({ user: req.user._id, action: 'USER_UNSUSPENDED', entity: 'User', entityId: user._id, ip: req.ip });

  return successResponse(res, {}, 'User unsuspended');
});

// PATCH /api/v1/admin/users/:id/verify
export const verifyUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { isVerified: true } },
    { new: true }
  );
  if (!user) return errorResponse(res, 'User not found', 404);

  await createAuditLog({ user: req.user._id, action: 'USER_VERIFIED', entity: 'User', entityId: user._id, ip: req.ip });

  return successResponse(res, {}, 'User verified');
});

// GET /api/v1/admin/projects
export const getProjects = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('client', 'name email')
      .populate('assignedDeveloper', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Project.countDocuments(filter),
  ]);

  return successResponse(res, { projects, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/v1/admin/reports
export const getReports = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reports, total] = await Promise.all([
    Report.find({ status })
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Report.countDocuments({ status }),
  ]);

  return successResponse(res, { reports, total });
});

// PATCH /api/v1/admin/reports/:id
export const resolveReport = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { $set: { status, adminNote, reviewedBy: req.user._id, reviewedAt: new Date() } },
    { new: true }
  );
  if (!report) return errorResponse(res, 'Report not found', 404);
  return successResponse(res, { report }, 'Report updated');
});

// GET /api/v1/admin/reviews
export const getReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find()
      .populate('reviewer', 'name email')
      .populate('reviewee', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments(),
  ]);

  return successResponse(res, { reviews, total });
});

// PATCH /api/v1/admin/reviews/:id/hide
export const hideReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $set: { isHidden: true, isModerated: true, moderationNote: req.body.note } },
    { new: true }
  );
  if (!review) return errorResponse(res, 'Review not found', 404);

  // Recalculate reviewer's rating
  const { default: DeveloperProfile } = await import('../models/DeveloperProfile.js');
  const result = await Review.aggregate([
    { $match: { reviewee: review.reviewee, reviewType: 'client_to_developer', isHidden: false } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (result.length > 0) {
    await DeveloperProfile.findOneAndUpdate(
      { user: review.reviewee },
      { averageRating: Math.round(result[0].avgRating * 10) / 10, totalReviews: result[0].count }
    );
  }

  return successResponse(res, {}, 'Review hidden');
});

// GET /api/v1/admin/audit-logs
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, action } = req.query;
  const filter = {};
  if (action) filter.action = new RegExp(action, 'i');

  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AuditLog.countDocuments(filter),
  ]);

  return successResponse(res, { logs, total });
});

// PATCH /api/v1/admin/projects/:id/feature
export const featureProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $set: { isFeatured: req.body.featured } },
    { new: true }
  );
  if (!project) return errorResponse(res, 'Project not found', 404);
  return successResponse(res, { project }, `Project ${req.body.featured ? 'featured' : 'unfeatured'}`);
});
