import Inquiry from '../models/Inquiry.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createNotification } from '../services/notificationService.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/v1/inquiries  — start or continue a thread; send first message
export const sendInquiry = asyncHandler(async (req, res) => {
  const { developerId, subject, message } = req.body;

  if (!message?.trim()) return errorResponse(res, 'Message is required', 400);
  if (req.user._id.toString() === developerId) {
    return errorResponse(res, 'You cannot message yourself', 400);
  }

  const developer = await User.findById(developerId);
  if (!developer || developer.role !== 'developer') {
    return errorResponse(res, 'Developer not found', 404);
  }

  // Upsert: find existing thread or create one
  let inquiry = await Inquiry.findOne({
    client: req.user._id,
    developer: developerId,
  });

  if (!inquiry) {
    inquiry = await Inquiry.create({
      client: req.user._id,
      developer: developerId,
      subject: subject?.trim() || `Message from ${req.user.name}`,
      messages: [],
    });
  }

  inquiry.messages.push({
    sender: req.user._id,
    content: message.trim(),
  });
  inquiry.lastMessageAt = new Date();
  await inquiry.save();

  // Notify the developer
  createNotification({
    recipient: developerId,
    type: 'new_message',
    title: 'New message',
    message: `${req.user.name} sent you a message: "${message.trim().slice(0, 60)}${message.length > 60 ? '…' : ''}"`,
    data: { inquiryId: inquiry._id },
    link: `/inquiries/${inquiry._id}`,
  });

  return successResponse(res, { inquiry }, 'Message sent', 201);
});

// GET /api/v1/inquiries — list all threads for the current user
export const getInquiries = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'client'
    ? { client: req.user._id }
    : { developer: req.user._id };

  const inquiries = await Inquiry.find({ ...filter, isArchived: false })
    .populate('client',    'name avatar')
    .populate('developer', 'name avatar')
    .sort({ lastMessageAt: -1 });

  return successResponse(res, { inquiries });
});

// GET /api/v1/inquiries/:id — get a single thread with messages
export const getInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id)
    .populate('client',    'name avatar role')
    .populate('developer', 'name avatar role')
    .populate('messages.sender', 'name avatar role');

  if (!inquiry) return errorResponse(res, 'Conversation not found', 404);

  const isParticipant =
    inquiry.client._id.toString()    === req.user._id.toString() ||
    inquiry.developer._id.toString() === req.user._id.toString();

  if (!isParticipant) return errorResponse(res, 'Not authorized', 403);

  // Mark all incoming messages as read
  let changed = false;
  inquiry.messages.forEach((msg) => {
    if (msg.sender._id.toString() !== req.user._id.toString() && !msg.isRead) {
      msg.isRead = true;
      msg.readAt = new Date();
      changed = true;
    }
  });
  if (changed) await inquiry.save();

  return successResponse(res, { inquiry });
});

// POST /api/v1/inquiries/:id/reply — send a follow-up message in a thread
export const replyInquiry = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return errorResponse(res, 'Message is required', 400);

  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) return errorResponse(res, 'Conversation not found', 404);

  const isParticipant =
    inquiry.client.toString()    === req.user._id.toString() ||
    inquiry.developer.toString() === req.user._id.toString();

  if (!isParticipant) return errorResponse(res, 'Not authorized', 403);

  inquiry.messages.push({ sender: req.user._id, content: message.trim() });
  inquiry.lastMessageAt = new Date();
  await inquiry.save();

  const recipientId = inquiry.client.toString() === req.user._id.toString()
    ? inquiry.developer
    : inquiry.client;

  createNotification({
    recipient: recipientId,
    type: 'new_message',
    title: 'New message',
    message: `${req.user.name}: "${message.trim().slice(0, 60)}${message.length > 60 ? '…' : ''}"`,
    data: { inquiryId: inquiry._id },
    link: `/inquiries/${inquiry._id}`,
  });

  await inquiry.populate('messages.sender', 'name avatar role');
  return successResponse(res, { inquiry }, 'Reply sent');
});

// GET /api/v1/inquiries/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'client'
    ? { client: req.user._id }
    : { developer: req.user._id };

  const inquiries = await Inquiry.find(filter).select('messages');
  let count = 0;
  inquiries.forEach((inq) => {
    inq.messages.forEach((msg) => {
      if (msg.sender.toString() !== req.user._id.toString() && !msg.isRead) count++;
    });
  });

  return successResponse(res, { count });
});
