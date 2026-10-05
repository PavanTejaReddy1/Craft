import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/v1/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const filter = { recipient: req.user._id };
  if (unreadOnly === 'true') filter.isRead = false;

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  return successResponse(res, { notifications, total, unreadCount });
});

// PATCH /api/v1/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );

  if (!notification) return errorResponse(res, 'Notification not found', 404);
  return successResponse(res, { notification });
});

// PATCH /api/v1/notifications/mark-all-read
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  return successResponse(res, {}, 'All notifications marked as read');
});

// DELETE /api/v1/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  return successResponse(res, {}, 'Notification deleted');
});
