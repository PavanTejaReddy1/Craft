// ============================================================
// CRAFT - Centralized Constants
// ============================================================

export const USER_ROLES = {
  CLIENT: 'client',
  DEVELOPER: 'developer',
  ADMIN: 'admin',
};

export const PROJECT_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PAUSED: 'paused',
};

export const OFFER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
  CLOSED: 'closed',
};

export const MILESTONE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  REVISION_REQUESTED: 'revision_requested',
  APPROVED: 'approved',
  COMPLETED: 'completed',
};

export const CONTRACT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const TRANSACTION_TYPE = {
  PAYMENT: 'payment',
  MILESTONE_RELEASE: 'milestone_release',
  REFUND: 'refund',
  PLATFORM_FEE: 'platform_fee',
};

export const NOTIFICATION_TYPES = {
  NEW_OFFER: 'new_offer',
  OFFER_ACCEPTED: 'offer_accepted',
  OFFER_REJECTED: 'offer_rejected',
  NEW_MESSAGE: 'new_message',
  PROJECT_ASSIGNED: 'project_assigned',
  MILESTONE_SUBMITTED: 'milestone_submitted',
  MILESTONE_APPROVED: 'milestone_approved',
  REVISION_REQUESTED: 'revision_requested',
  DEADLINE_APPROACHING: 'deadline_approaching',
  PROJECT_COMPLETED: 'project_completed',
  NEW_REVIEW: 'new_review',
  ACCOUNT_VERIFIED: 'account_verified',
  OFFER_WITHDRAWN: 'offer_withdrawn',
};

export const REPORT_TYPES = {
  USER: 'user',
  PROJECT: 'project',
  REVIEW: 'review',
  MESSAGE: 'message',
};

export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
};

export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  NOT_AVAILABLE: 'not_available',
};

export const EXPERIENCE_LEVELS = {
  ENTRY: 'entry',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert',
};

export const BUDGET_TYPES = {
  FIXED: 'fixed',
  HOURLY: 'hourly',
};

export const PROJECT_CATEGORIES = [
  'Web Development',
  'Mobile App Development',
  'Backend / API Development',
  'Full Stack Development',
  'UI/UX Design',
  'AI / Machine Learning',
  'Data Analytics',
  'Automation',
  'Cloud / DevOps',
  'Database',
  'Testing / QA',
  'Bug Fixing',
  'Technical Consulting',
  'Other',
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
};

export const FILE_LIMITS = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

export const PLATFORM_FEE_PERCENTAGE = 10;
