import Project from '../models/Project.js';
import Offer from '../models/Offer.js';
import { successResponse, errorResponse, paginatedResponse, buildPagination } from '../utils/response.js';
import { PROJECT_STATUS, PAGINATION } from '../constants/index.js';
import { createAuditLog } from '../utils/auditLogger.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/v1/projects
export const createProject = asyncHandler(async (req, res) => {
  const {
    title, description, category, skills, technologies,
    budgetType, budgetMin, budgetMax, expectedDeliveryDays,
    deadline, experienceLevel, additionalRequirements,
  } = req.body;

  const attachments = (req.files || []).map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `/uploads/projects/${file.filename}`,
  }));

  const project = await Project.create({
    title, description, category,
    skills: skills || [],
    technologies: technologies || [],
    budgetType, budgetMin, budgetMax,
    expectedDeliveryDays,
    deadline: deadline ? new Date(deadline) : undefined,
    experienceLevel,
    additionalRequirements,
    attachments,
    client: req.user._id,
    status: PROJECT_STATUS.OPEN,
  });

  await createAuditLog({
    user: req.user._id,
    action: 'PROJECT_CREATED',
    entity: 'Project',
    entityId: project._id,
    ip: req.ip,
  });

  return successResponse(res, { project }, 'Project posted successfully', 201);
});

// GET /api/v1/projects
export const getProjects = asyncHandler(async (req, res) => {
  const {
    search, category, skills, technologies, budgetMin, budgetMax,
    experienceLevel, status = PROJECT_STATUS.OPEN,
    sort = 'newest',
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
  } = req.query;

  const filter = {};

  // Only show open projects publicly unless querying own or admin
  if (!req.user || req.user.role === 'developer') {
    filter.status = PROJECT_STATUS.OPEN;
  } else if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) filter.category = category;
  if (skills) {
    const skillList = Array.isArray(skills) ? skills : skills.split(',');
    filter.skills = { $in: skillList.map((s) => new RegExp(s.trim(), 'i')) };
  }
  if (technologies) {
    const techList = Array.isArray(technologies) ? technologies : technologies.split(',');
    filter.technologies = { $in: techList.map((t) => new RegExp(t.trim(), 'i')) };
  }
  if (budgetMin || budgetMax) {
    filter.budgetMin = {};
    if (budgetMin) filter.budgetMax = { $gte: Number(budgetMin) };
    if (budgetMax) filter.budgetMin = { ...filter.budgetMin, $lte: Number(budgetMax) };
  }
  if (experienceLevel) filter.experienceLevel = experienceLevel;

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    budget_high: { budgetMax: -1 },
    budget_low: { budgetMin: 1 },
    deadline: { deadline: 1 },
  };

  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Math.min(Number(limit), PAGINATION.MAX_LIMIT);

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('client', 'name avatar isVerified')
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(limitNum)
      .select('-attachments'),
    Project.countDocuments(filter),
  ]);

  // Increment view count for single-project queries is handled in getProject
  return paginatedResponse(res, projects, buildPagination(page, limitNum, total));
});

// GET /api/v1/projects/:id
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('client', 'name avatar isVerified createdAt')
    .populate('assignedDeveloper', 'name avatar');

  if (!project) return errorResponse(res, 'Project not found', 404);

  // Only client or assigned developer can see non-open projects
  if (project.status !== PROJECT_STATUS.OPEN) {
    if (!req.user) return errorResponse(res, 'Not authorized', 403);
    const isClient = project.client._id.toString() === req.user._id.toString();
    const isDeveloper = project.assignedDeveloper?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isClient && !isDeveloper && !isAdmin) {
      return errorResponse(res, 'Not authorized', 403);
    }
  }

  // Increment view count (fire and forget)
  Project.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

  // Check if current developer has already submitted an offer
  let myOffer = null;
  if (req.user?.role === 'developer') {
    myOffer = await Offer.findOne({ project: project._id, developer: req.user._id });
  }

  return successResponse(res, { project, myOffer });
});

// PATCH /api/v1/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return errorResponse(res, 'Project not found', 404);

  if (project.client.toString() !== req.user._id.toString()) {
    return errorResponse(res, 'Not authorized to update this project', 403);
  }

  if (![PROJECT_STATUS.DRAFT, PROJECT_STATUS.OPEN].includes(project.status)) {
    return errorResponse(res, 'Cannot edit a project that is already in progress or completed', 400);
  }

  const allowedFields = [
    'title', 'description', 'category', 'skills', 'technologies',
    'budgetMin', 'budgetMax', 'expectedDeliveryDays', 'deadline',
    'experienceLevel', 'additionalRequirements', 'status',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // Only allow draft/open status changes from client
  if (updates.status && ![PROJECT_STATUS.DRAFT, PROJECT_STATUS.OPEN, PROJECT_STATUS.CANCELLED].includes(updates.status)) {
    delete updates.status;
  }

  Object.assign(project, updates);
  await project.save();

  await createAuditLog({ user: req.user._id, action: 'PROJECT_UPDATED', entity: 'Project', entityId: project._id, ip: req.ip });

  return successResponse(res, { project }, 'Project updated');
});

// DELETE /api/v1/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return errorResponse(res, 'Project not found', 404);

  if (project.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 'Not authorized', 403);
  }

  if (project.status === PROJECT_STATUS.IN_PROGRESS) {
    return errorResponse(res, 'Cannot delete a project that is in progress', 400);
  }

  await Project.findByIdAndDelete(req.params.id);
  await createAuditLog({ user: req.user._id, action: 'PROJECT_DELETED', entity: 'Project', entityId: project._id, ip: req.ip });

  return successResponse(res, {}, 'Project deleted');
});

// GET /api/v1/projects/my
export const getMyProjects = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (req.user.role === 'client') {
    filter.client = req.user._id;
  } else if (req.user.role === 'developer') {
    filter.assignedDeveloper = req.user._id;
  }
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('client', 'name avatar')
      .populate('assignedDeveloper', 'name avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Project.countDocuments(filter),
  ]);

  return paginatedResponse(res, projects, buildPagination(page, limit, total));
});

// GET /api/v1/projects/featured
export const getFeaturedProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ isFeatured: true, status: PROJECT_STATUS.OPEN })
    .populate('client', 'name avatar isVerified')
    .sort({ createdAt: -1 })
    .limit(6)
    .select('title category technologies budgetMin budgetMax expectedDeliveryDays createdAt');
  return successResponse(res, { projects });
});
