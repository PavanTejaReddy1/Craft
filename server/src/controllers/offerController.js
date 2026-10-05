import Offer from '../models/Offer.js';
import Project from '../models/Project.js';
import Contract from '../models/Contract.js';
import Milestone from '../models/Milestone.js';
import DeveloperProfile from '../models/DeveloperProfile.js';
import ClientProfile from '../models/ClientProfile.js';
import { successResponse, errorResponse, paginatedResponse, buildPagination } from '../utils/response.js';
import { OFFER_STATUS, PROJECT_STATUS, PLATFORM_FEE_PERCENTAGE } from '../constants/index.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { notifyNewOffer, notifyOfferAccepted, notifyOfferRejected } from '../services/notificationService.js';
import { sendOfferNotificationEmail, sendOfferAcceptedEmail } from '../services/emailService.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/v1/offers
export const submitOffer = asyncHandler(async (req, res) => {
  const { projectId, proposedPrice, deliveryDays, coverLetter, milestones, additionalNotes } = req.body;

  const project = await Project.findById(projectId).populate('client', 'name email');
  if (!project) return errorResponse(res, 'Project not found', 404);
  if (project.status !== PROJECT_STATUS.OPEN) return errorResponse(res, 'Project is not accepting offers', 400);
  if (project.client._id.toString() === req.user._id.toString()) {
    return errorResponse(res, 'You cannot submit an offer on your own project', 403);
  }

  const existing = await Offer.findOne({ project: projectId, developer: req.user._id });
  if (existing) return errorResponse(res, 'You have already submitted an offer for this project', 409);

  const offer = await Offer.create({
    project: projectId,
    developer: req.user._id,
    proposedPrice,
    deliveryDays,
    coverLetter,
    milestones: milestones || [],
    additionalNotes,
  });

  // Increment offer count
  await Project.findByIdAndUpdate(projectId, { $inc: { offerCount: 1 } });

  // Notifications
  notifyNewOffer({
    clientId: project.client._id,
    developerName: req.user.name,
    projectTitle: project.title,
    projectId: project._id,
    offerId: offer._id,
  });

  sendOfferNotificationEmail(project.client, offer, project).catch(console.error);

  await createAuditLog({
    user: req.user._id,
    action: 'OFFER_SUBMITTED',
    entity: 'Offer',
    entityId: offer._id,
    ip: req.ip,
  });

  return successResponse(res, { offer }, 'Offer submitted successfully', 201);
});

// GET /api/v1/offers/project/:projectId
export const getProjectOffers = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return errorResponse(res, 'Project not found', 404);

  if (project.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 'Not authorized to view these offers', 403);
  }

  const { page = 1, limit = 10, sort = 'newest' } = req.query;

  const sortOptions = {
    newest:     { createdAt: -1 },
    price_low:  { proposedPrice: 1 },
    price_high: { proposedPrice: -1 },
    delivery:   { deliveryDays: 1 },
  };

  const skip   = (Number(page) - 1) * Number(limit);
  const filter = { project: req.params.projectId, status: { $ne: OFFER_STATUS.WITHDRAWN } };

  const [offers, total] = await Promise.all([
    Offer.find(filter)
      .populate('developer', 'name avatar isVerified')   // flat populate — no nested nonsense
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(Number(limit)),
    Offer.countDocuments(filter),
  ]);

  // Attach developer profile for each offer
  const enrichedOffers = await Promise.all(
    offers.map(async (offer) => {
      const devId = offer.developer?._id || offer.developer;
      const devProfile = await DeveloperProfile.findOne({ user: devId })
        .select('headline skills technologies averageRating completedProjects availability hourlyRate');
      return { ...offer.toJSON(), developerProfile: devProfile || null };
    })
  );

  return paginatedResponse(res, enrichedOffers, buildPagination(page, limit, total));
});

// GET /api/v1/offers/my
export const getMyOffers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { developer: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [offers, total] = await Promise.all([
    Offer.find(filter)
      .populate('project', 'title category budgetMin budgetMax status createdAt client')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Offer.countDocuments(filter),
  ]);

  return paginatedResponse(res, offers, buildPagination(page, limit, total));
});

// GET /api/v1/offers/:id
export const getOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate('project', 'title category budgetMin budgetMax client status')
    .populate('developer', 'name avatar isVerified');

  if (!offer) return errorResponse(res, 'Offer not found', 404);

  const project = await Project.findById(offer.project._id);
  const isClient = project.client.toString() === req.user._id.toString();
  const isDeveloper = offer.developer._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isClient && !isDeveloper && !isAdmin) {
    return errorResponse(res, 'Not authorized', 403);
  }

  return successResponse(res, { offer });
});

// PATCH /api/v1/offers/:id
export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return errorResponse(res, 'Offer not found', 404);

  if (offer.developer.toString() !== req.user._id.toString()) {
    return errorResponse(res, 'Not authorized', 403);
  }

  if (offer.status !== OFFER_STATUS.PENDING) {
    return errorResponse(res, 'Cannot update a non-pending offer', 400);
  }

  const allowedFields = ['proposedPrice', 'deliveryDays', 'coverLetter', 'milestones', 'additionalNotes'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) offer[field] = req.body[field];
  });

  await offer.save();
  return successResponse(res, { offer }, 'Offer updated');
});

// DELETE /api/v1/offers/:id (withdraw)
export const withdrawOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return errorResponse(res, 'Offer not found', 404);

  if (offer.developer.toString() !== req.user._id.toString()) {
    return errorResponse(res, 'Not authorized', 403);
  }

  if (![OFFER_STATUS.PENDING].includes(offer.status)) {
    return errorResponse(res, 'Cannot withdraw this offer', 400);
  }

  offer.status = OFFER_STATUS.WITHDRAWN;
  offer.withdrawnAt = new Date();
  await offer.save();

  await Project.findByIdAndUpdate(offer.project, { $inc: { offerCount: -1 } });

  return successResponse(res, {}, 'Offer withdrawn');
});

// PATCH /api/v1/offers/:id/shortlist
export const shortlistOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate('project');
  if (!offer) return errorResponse(res, 'Offer not found', 404);

  if (offer.project.client.toString() !== req.user._id.toString()) {
    return errorResponse(res, 'Not authorized', 403);
  }

  offer.isShortlisted = !offer.isShortlisted;
  await offer.save();

  return successResponse(res, { offer }, offer.isShortlisted ? 'Developer shortlisted' : 'Removed from shortlist');
});

// POST /api/v1/offers/:id/accept
export const acceptOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate('developer', 'name email')
    .populate('project');

  if (!offer) return errorResponse(res, 'Offer not found', 404);

  const project = offer.project;

  if (project.client.toString() !== req.user._id.toString()) {
    return errorResponse(res, 'Only the project client can accept offers', 403);
  }

  if (project.status !== PROJECT_STATUS.OPEN) {
    return errorResponse(res, 'Project is no longer accepting offers', 400);
  }

  if (offer.status !== OFFER_STATUS.PENDING) {
    return errorResponse(res, 'This offer is no longer available', 400);
  }

  // ── Atomic state transitions ──────────────────────────────────────────────

  // 1. Accept this offer
  offer.status = OFFER_STATUS.ACCEPTED;
  offer.acceptedAt = new Date();
  await offer.save();

  // 2. Close all other pending offers
  await Offer.updateMany(
    { project: project._id, _id: { $ne: offer._id }, status: OFFER_STATUS.PENDING },
    { $set: { status: OFFER_STATUS.CLOSED } }
  );

  // 3. Update project
  project.status = PROJECT_STATUS.IN_PROGRESS;
  project.acceptedOffer = offer._id;
  project.assignedDeveloper = offer.developer._id;
  await project.save();

  // 4. Create contract
  const platformFee = Math.round(offer.proposedPrice * (PLATFORM_FEE_PERCENTAGE / 100));
  const startDate = new Date();
  const expectedEndDate = new Date();
  expectedEndDate.setDate(expectedEndDate.getDate() + offer.deliveryDays);

  const contract = await Contract.create({
    project: project._id,
    offer: offer._id,
    client: req.user._id,
    developer: offer.developer._id,
    agreedPrice: offer.proposedPrice,
    deliveryDays: offer.deliveryDays,
    startDate,
    expectedEndDate,
    platformFee,
    developerEarnings: offer.proposedPrice - platformFee,
    termsAcceptedByClient: true,
  });

  // 5. Create milestones from offer milestones
  if (offer.milestones?.length > 0) {
    const milestoneData = offer.milestones.map((m, i) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + m.dueInDays);
      return {
        contract: contract._id,
        project: project._id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        dueDate,
        order: i + 1,
      };
    });
    await Milestone.insertMany(milestoneData);
  } else {
    // Create a single default milestone
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + offer.deliveryDays);
    await Milestone.create({
      contract: contract._id,
      project: project._id,
      title: 'Project Delivery',
      description: 'Complete project delivery',
      amount: offer.proposedPrice,
      dueDate,
      order: 1,
    });
  }

  // 6. Notify rejected developers
  const rejectedOffers = await Offer.find({
    project: project._id,
    status: OFFER_STATUS.CLOSED,
  }).populate('developer', '_id name');

  for (const rejected of rejectedOffers) {
    notifyOfferRejected({
      developerId: rejected.developer._id,
      projectTitle: project.title,
      projectId: project._id,
    });
  }

  // 7. Notify accepted developer
  notifyOfferAccepted({
    developerId: offer.developer._id,
    projectTitle: project.title,
    projectId: project._id,
    contractId: contract._id,
  });

  sendOfferAcceptedEmail(offer.developer, project).catch(console.error);

  await createAuditLog({
    user: req.user._id,
    action: 'OFFER_ACCEPTED',
    entity: 'Offer',
    entityId: offer._id,
    ip: req.ip,
    metadata: { contractId: contract._id, projectId: project._id },
  });

  return successResponse(res, { offer, contract }, 'Offer accepted. Project is now active.');
});

// POST /api/v1/offers/:id/reject
export const rejectOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate('project');
  if (!offer) return errorResponse(res, 'Offer not found', 404);

  if (offer.project.client.toString() !== req.user._id.toString()) {
    return errorResponse(res, 'Not authorized', 403);
  }

  if (offer.status !== OFFER_STATUS.PENDING) {
    return errorResponse(res, 'Offer is not in pending state', 400);
  }

  offer.status = OFFER_STATUS.REJECTED;
  offer.rejectedAt = new Date();
  offer.clientNote = req.body.note || '';
  await offer.save();

  notifyOfferRejected({
    developerId: offer.developer,
    projectTitle: offer.project.title,
    projectId: offer.project._id,
  });

  return successResponse(res, {}, 'Offer rejected');
});
