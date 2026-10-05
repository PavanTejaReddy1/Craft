import Message from '../models/Message.js';
import Contract from '../models/Contract.js';
import { successResponse, errorResponse, paginatedResponse, buildPagination } from '../utils/response.js';
import { notifyNewMessage } from '../services/notificationService.js';
import asyncHandler from '../utils/asyncHandler.js';

// Verify user is a participant of the contract
const verifyParticipant = async (contractId, userId, role) => {
  if (role === 'admin') return await Contract.findById(contractId).populate('project', 'title');
  return await Contract.findOne({
    _id: contractId,
    $or: [{ client: userId }, { developer: userId }],
  }).populate('project', 'title');
};

// GET /api/v1/messages/:contractId
export const getMessages = asyncHandler(async (req, res) => {
  const contract = await verifyParticipant(req.params.contractId, req.user._id, req.user.role);
  if (!contract) return errorResponse(res, 'Not authorized to view these messages', 403);

  const { page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [messages, total] = await Promise.all([
    Message.find({ contract: req.params.contractId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Message.countDocuments({ contract: req.params.contractId }),
  ]);

  // Mark unread messages as read
  await Message.updateMany(
    {
      contract: req.params.contractId,
      sender: { $ne: req.user._id },
      isRead: false,
    },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return paginatedResponse(res, messages.reverse(), buildPagination(page, limit, total));
});

// POST /api/v1/messages/:contractId
export const sendMessage = asyncHandler(async (req, res) => {
  const contract = await verifyParticipant(req.params.contractId, req.user._id, req.user.role);
  if (!contract) return errorResponse(res, 'Not authorized', 403);

  const { content } = req.body;
  const attachments = (req.files || []).map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `/uploads/projects/${file.filename}`,
  }));

  if (!content && attachments.length === 0) {
    return errorResponse(res, 'Message must have content or an attachment', 400);
  }

  const message = await Message.create({
    contract: req.params.contractId,
    sender: req.user._id,
    content: content || '',
    attachments,
    messageType: attachments.length > 0 ? 'file' : 'text',
  });

  await message.populate('sender', 'name avatar role');

  // Notify the other party
  const recipientId = contract.client.toString() === req.user._id.toString()
    ? contract.developer
    : contract.client;

  notifyNewMessage({
    recipientId,
    senderName: req.user.name,
    projectTitle: contract.project?.title || 'your project',
    contractId: contract._id,
  });

  return successResponse(res, { message }, 'Message sent', 201);
});

// GET /api/v1/messages/:contractId/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const contract = await verifyParticipant(req.params.contractId, req.user._id, req.user.role);
  if (!contract) return errorResponse(res, 'Not authorized', 403);

  const count = await Message.countDocuments({
    contract: req.params.contractId,
    sender: { $ne: req.user._id },
    isRead: false,
  });

  return successResponse(res, { count });
});
