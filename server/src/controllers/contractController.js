import Contract from '../models/Contract.js';
import Project from '../models/Project.js';
import Milestone from '../models/Milestone.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { MILESTONE_STATUS, CONTRACT_STATUS, PROJECT_STATUS } from '../constants/index.js';
import { createAuditLog } from '../utils/auditLogger.js';
import {
  notifyMilestoneSubmitted, notifyMilestoneApproved,
  notifyRevisionRequested, notifyProjectCompleted,
} from '../services/notificationService.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/v1/contracts/:projectId
export const getContract = asyncHandler(async (req, res) => {
  const contract = await Contract.findOne({ project: req.params.projectId })
    .populate('client', 'name avatar isVerified')
    .populate('developer', 'name avatar isVerified')
    .populate('project', 'title category status');

  if (!contract) return errorResponse(res, 'Contract not found', 404);

  const isParticipant =
    contract.client._id.toString() === req.user._id.toString() ||
    contract.developer._id.toString() === req.user._id.toString();

  if (!isParticipant && req.user.role !== 'admin') {
    return errorResponse(res, 'Not authorized', 403);
  }

  const milestones = await Milestone.find({ contract: contract._id }).sort({ order: 1 });

  return successResponse(res, { contract, milestones });
});

// GET /api/v1/contracts
export const getMyContracts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'client') filter.client = req.user._id;
  else if (req.user.role === 'developer') filter.developer = req.user._id;

  const contracts = await Contract.find(filter)
    .populate('client', 'name avatar')
    .populate('developer', 'name avatar')
    .populate('project', 'title category status')
    .sort({ createdAt: -1 });

  return successResponse(res, { contracts });
});

// ─── Milestone Controllers ────────────────────────────────────────────────────

// GET /api/v1/contracts/:projectId/milestones
export const getMilestones = asyncHandler(async (req, res) => {
  const contract = await Contract.findOne({ project: req.params.projectId });
  if (!contract) return errorResponse(res, 'Contract not found', 404);

  const isParticipant =
    contract.client.toString() === req.user._id.toString() ||
    contract.developer.toString() === req.user._id.toString();

  if (!isParticipant && req.user.role !== 'admin') {
    return errorResponse(res, 'Not authorized', 403);
  }

  const milestones = await Milestone.find({ contract: contract._id }).sort({ order: 1 });
  return successResponse(res, { milestones, contract });
});

// POST /api/v1/contracts/:projectId/milestones/:milestoneId/submit
export const submitMilestone = asyncHandler(async (req, res) => {
  const contract = await Contract.findOne({ project: req.params.projectId })
    .populate('project', 'title')
    .populate('client', 'name');

  if (!contract) return errorResponse(res, 'Contract not found', 404);

  if (contract.developer.toString() !== req.user._id.toString()) {
    return errorResponse(res, 'Only the assigned developer can submit milestones', 403);
  }

  const milestone = await Milestone.findOne({
    _id: req.params.milestoneId,
    contract: contract._id,
  });

  if (!milestone) return errorResponse(res, 'Milestone not found', 404);

  if (![MILESTONE_STATUS.PENDING, MILESTONE_STATUS.IN_PROGRESS, MILESTONE_STATUS.REVISION_REQUESTED].includes(milestone.status)) {
    return errorResponse(res, 'Milestone cannot be submitted at this stage', 400);
  }

  const attachments = (req.files || []).map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `/uploads/milestones/${file.filename}`,
  }));

  milestone.submissions.push({
    message: req.body.message || '',
    attachments,
    submittedAt: new Date(),
  });
  milestone.status = MILESTONE_STATUS.SUBMITTED;
  await milestone.save();

  notifyMilestoneSubmitted({
    clientId: contract.client._id,
    milestoneTitle: milestone.title,
    projectTitle: contract.project.title,
    contractId: contract._id,
  });

  await createAuditLog({
    user: req.user._id,
    action: 'MILESTONE_SUBMITTED',
    entity: 'Milestone',
    entityId: milestone._id,
    ip: req.ip,
  });

  return successResponse(res, { milestone }, 'Milestone submitted for review');
});

// POST /api/v1/contracts/:projectId/milestones/:milestoneId/approve
export const approveMilestone = asyncHandler(async (req, res) => {
  const contract = await Contract.findOne({ project: req.params.projectId })
    .populate('project', 'title')
    .populate('developer', 'name');

  if (!contract) return errorResponse(res, 'Contract not found', 404);

  if (contract.client.toString() !== req.user._id.toString()) {
    return errorResponse(res, 'Only the client can approve milestones', 403);
  }

  const milestone = await Milestone.findOne({
    _id: req.params.milestoneId,
    contract: contract._id,
  });

  if (!milestone) return errorResponse(res, 'Milestone not found', 404);
  if (milestone.status !== MILESTONE_STATUS.SUBMITTED) {
    return errorResponse(res, 'Milestone is not submitted for approval', 400);
  }

  milestone.status = MILESTONE_STATUS.APPROVED;
  milestone.approvedAt = new Date();
  milestone.approvalNote = req.body.note || '';
  await milestone.save();

  notifyMilestoneApproved({
    developerId: contract.developer._id,
    milestoneTitle: milestone.title,
    projectTitle: contract.project.title,
    contractId: contract._id,
  });

  // Check if all milestones are complete
  const allMilestones = await Milestone.find({ contract: contract._id });
  const allApproved = allMilestones.every((m) => m.status === MILESTONE_STATUS.APPROVED);

  if (allApproved) {
    // Auto-complete the project
    contract.status = CONTRACT_STATUS.COMPLETED;
    contract.actualEndDate = new Date();
    await contract.save();

    await Project.findByIdAndUpdate(req.params.projectId, {
      status: PROJECT_STATUS.COMPLETED,
      completedAt: new Date(),
    });

    notifyProjectCompleted({ userId: contract.client, projectTitle: contract.project.title, projectId: req.params.projectId });
    notifyProjectCompleted({ userId: contract.developer._id, projectTitle: contract.project.title, projectId: req.params.projectId });

    // Update developer stats
    const { default: DeveloperProfile } = await import('../models/DeveloperProfile.js');
    await DeveloperProfile.findOneAndUpdate(
      { user: contract.developer._id },
      { $inc: { completedProjects: 1, totalEarnings: contract.developerEarnings } }
    );

    const { default: ClientProfile } = await import('../models/ClientProfile.js');
    await ClientProfile.findOneAndUpdate(
      { user: contract.client },
      { $inc: { completedProjects: 1, totalSpent: contract.agreedPrice } }
    );
  }

  await createAuditLog({
    user: req.user._id,
    action: 'MILESTONE_APPROVED',
    entity: 'Milestone',
    entityId: milestone._id,
    ip: req.ip,
  });

  return successResponse(res, { milestone, projectCompleted: allApproved }, 'Milestone approved');
});

// POST /api/v1/contracts/:projectId/milestones/:milestoneId/request-revision
export const requestRevision = asyncHandler(async (req, res) => {
  const contract = await Contract.findOne({ project: req.params.projectId })
    .populate('project', 'title')
    .populate('developer', 'name');

  if (!contract) return errorResponse(res, 'Contract not found', 404);

  if (contract.client.toString() !== req.user._id.toString()) {
    return errorResponse(res, 'Only the client can request revisions', 403);
  }

  const milestone = await Milestone.findOne({
    _id: req.params.milestoneId,
    contract: contract._id,
  });

  if (!milestone) return errorResponse(res, 'Milestone not found', 404);
  if (milestone.status !== MILESTONE_STATUS.SUBMITTED) {
    return errorResponse(res, 'Can only request revision on submitted milestones', 400);
  }

  milestone.status = MILESTONE_STATUS.REVISION_REQUESTED;
  // Add revision note to latest submission
  if (milestone.submissions.length > 0) {
    milestone.submissions[milestone.submissions.length - 1].revisionNote = req.body.note;
  }
  await milestone.save();

  notifyRevisionRequested({
    developerId: contract.developer._id,
    milestoneTitle: milestone.title,
    projectTitle: contract.project.title,
    contractId: contract._id,
  });

  return successResponse(res, { milestone }, 'Revision requested');
});

// POST /api/v1/contracts/:projectId/milestones
export const addMilestone = asyncHandler(async (req, res) => {
  const contract = await Contract.findOne({ project: req.params.projectId });
  if (!contract) return errorResponse(res, 'Contract not found', 404);

  if (contract.client.toString() !== req.user._id.toString()) {
    return errorResponse(res, 'Only the client can add milestones', 403);
  }

  const lastMilestone = await Milestone.findOne({ contract: contract._id }).sort({ order: -1 });
  const order = (lastMilestone?.order || 0) + 1;

  const milestone = await Milestone.create({
    contract: contract._id,
    project: req.params.projectId,
    ...req.body,
    order,
  });

  return successResponse(res, { milestone }, 'Milestone added', 201);
});
