import Notification from '../models/Notification.js';
import { NOTIFICATION_TYPES } from '../constants/index.js';

export const createNotification = async ({ recipient, type, title, message, data = {}, link = null }) => {
  try {
    return await Notification.create({ recipient, type, title, message, data, link });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

export const notifyNewOffer = async ({ clientId, developerName, projectTitle, projectId, offerId }) => {
  return createNotification({
    recipient: clientId,
    type: NOTIFICATION_TYPES.NEW_OFFER,
    title: 'New offer received',
    message: `${developerName} submitted an offer on "${projectTitle}"`,
    data: { projectId, offerId },
    link: `/projects/${projectId}/offers`,
  });
};

export const notifyOfferAccepted = async ({ developerId, projectTitle, projectId, contractId }) => {
  return createNotification({
    recipient: developerId,
    type: NOTIFICATION_TYPES.OFFER_ACCEPTED,
    title: 'Your offer was accepted!',
    message: `The client accepted your offer for "${projectTitle}"`,
    data: { projectId, contractId },
    link: `/workspace/${projectId}`,
  });
};

export const notifyOfferRejected = async ({ developerId, projectTitle, projectId }) => {
  return createNotification({
    recipient: developerId,
    type: NOTIFICATION_TYPES.OFFER_REJECTED,
    title: 'Offer not selected',
    message: `The client chose another developer for "${projectTitle}"`,
    data: { projectId },
    link: `/projects`,
  });
};

export const notifyNewMessage = async ({ recipientId, senderName, projectTitle, contractId }) => {
  return createNotification({
    recipient: recipientId,
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
    title: 'New message',
    message: `${senderName} sent you a message on "${projectTitle}"`,
    data: { contractId },
    link: `/workspace/${contractId}/messages`,
  });
};

export const notifyMilestoneSubmitted = async ({ clientId, milestoneTitle, projectTitle, contractId }) => {
  return createNotification({
    recipient: clientId,
    type: NOTIFICATION_TYPES.MILESTONE_SUBMITTED,
    title: 'Milestone submitted for review',
    message: `"${milestoneTitle}" was submitted on "${projectTitle}"`,
    data: { contractId },
    link: `/workspace/${contractId}/milestones`,
  });
};

export const notifyMilestoneApproved = async ({ developerId, milestoneTitle, projectTitle, contractId }) => {
  return createNotification({
    recipient: developerId,
    type: NOTIFICATION_TYPES.MILESTONE_APPROVED,
    title: 'Milestone approved!',
    message: `"${milestoneTitle}" was approved on "${projectTitle}"`,
    data: { contractId },
    link: `/workspace/${contractId}/milestones`,
  });
};

export const notifyRevisionRequested = async ({ developerId, milestoneTitle, projectTitle, contractId }) => {
  return createNotification({
    recipient: developerId,
    type: NOTIFICATION_TYPES.REVISION_REQUESTED,
    title: 'Revision requested',
    message: `Client requested revision on "${milestoneTitle}" for "${projectTitle}"`,
    data: { contractId },
    link: `/workspace/${contractId}/milestones`,
  });
};

export const notifyProjectCompleted = async ({ userId, projectTitle, projectId }) => {
  return createNotification({
    recipient: userId,
    type: NOTIFICATION_TYPES.PROJECT_COMPLETED,
    title: 'Project completed!',
    message: `"${projectTitle}" has been completed successfully`,
    data: { projectId },
    link: `/projects/${projectId}`,
  });
};

export const notifyNewReview = async ({ userId, reviewerName, projectTitle, projectId }) => {
  return createNotification({
    recipient: userId,
    type: NOTIFICATION_TYPES.NEW_REVIEW,
    title: 'New review received',
    message: `${reviewerName} left you a review for "${projectTitle}"`,
    data: { projectId },
    link: `/profile`,
  });
};
