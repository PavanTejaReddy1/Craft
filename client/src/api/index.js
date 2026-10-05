import api from './axios.js';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

// ─── Profiles ─────────────────────────────────────────────────────────────────
export const profileApi = {
  getMyDeveloper: () => api.get('/profile/developer/me'),
  getDeveloper: (userId) => api.get(`/profile/developer/${userId}`),
  updateDeveloper: (data) => api.patch('/profile/developer', data),
  addPortfolio: (data) => api.post('/profile/developer/portfolio', data),
  updatePortfolio: (id, data) => api.patch(`/profile/developer/portfolio/${id}`, data),
  deletePortfolio: (id) => api.delete(`/profile/developer/portfolio/${id}`),
  addExperience: (data) => api.post('/profile/developer/experience', data),
  deleteExperience: (id) => api.delete(`/profile/developer/experience/${id}`),
  addEducation: (data) => api.post('/profile/developer/education', data),
  deleteEducation: (id) => api.delete(`/profile/developer/education/${id}`),
  addCertification: (data) => api.post('/profile/developer/certifications', data),
  deleteCertification: (id) => api.delete(`/profile/developer/certifications/${id}`),
  getMyClient: () => api.get('/profile/client/me'),
  getClient: (userId) => api.get(`/profile/client/${userId}`),
  updateClient: (data) => api.patch('/profile/client', data),
  uploadAvatar: (formData) => api.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  searchDevelopers: (params) => api.get('/profile/developers', { params }),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectApi = {
  create: (formData) => api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/projects', { params }),
  getFeatured: () => api.get('/projects/featured'),
  getMy: (params) => api.get('/projects/my', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// ─── Offers ───────────────────────────────────────────────────────────────────
export const offerApi = {
  submit: (data) => api.post('/offers', data),
  getMy: (params) => api.get('/offers/my', { params }),
  getProjectOffers: (projectId, params) => api.get(`/offers/project/${projectId}`, { params }),
  getById: (id) => api.get(`/offers/${id}`),
  update: (id, data) => api.patch(`/offers/${id}`, data),
  withdraw: (id) => api.delete(`/offers/${id}`),
  shortlist: (id) => api.patch(`/offers/${id}/shortlist`),
  accept: (id) => api.post(`/offers/${id}/accept`),
  reject: (id, note) => api.post(`/offers/${id}/reject`, { note }),
};

// ─── Contracts ────────────────────────────────────────────────────────────────
export const contractApi = {
  getMy: () => api.get('/contracts'),
  getByProject: (projectId) => api.get(`/contracts/${projectId}`),
  getMilestones: (projectId) => api.get(`/contracts/${projectId}/milestones`),
  addMilestone: (projectId, data) => api.post(`/contracts/${projectId}/milestones`, data),
  submitMilestone: (projectId, milestoneId, formData) =>
    api.post(`/contracts/${projectId}/milestones/${milestoneId}/submit`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  approveMilestone: (projectId, milestoneId, data) =>
    api.post(`/contracts/${projectId}/milestones/${milestoneId}/approve`, data),
  requestRevision: (projectId, milestoneId, data) =>
    api.post(`/contracts/${projectId}/milestones/${milestoneId}/request-revision`, data),
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messageApi = {
  get: (contractId, params) => api.get(`/messages/${contractId}`, { params }),
  send: (contractId, formData) =>
    api.post(`/messages/${contractId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getUnreadCount: (contractId) => api.get(`/messages/${contractId}/unread`),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationApi = {
  get: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewApi = {
  create: (data) => api.post('/reviews', data),
  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  getContractReviews: (contractId) => api.get(`/reviews/contract/${contractId}`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  suspendUser: (id, reason) => api.patch(`/admin/users/${id}/suspend`, { reason }),
  unsuspendUser: (id) => api.patch(`/admin/users/${id}/unsuspend`),
  verifyUser: (id) => api.patch(`/admin/users/${id}/verify`),
  getProjects: (params) => api.get('/admin/projects', { params }),
  featureProject: (id, featured) => api.patch(`/admin/projects/${id}/feature`, { featured }),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  hideReview: (id, note) => api.patch(`/admin/reviews/${id}/hide`, { note }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportApi = {
  create: (data) => api.post('/reports', data),
};

// ─── Inquiries (direct messages without a contract) ───────────────────────────
export const inquiryApi = {
  send:         (data)  => api.post('/inquiries', data),
  getAll:       ()      => api.get('/inquiries'),
  getById:      (id)    => api.get(`/inquiries/${id}`),
  reply:        (id, message) => api.post(`/inquiries/${id}/reply`, { message }),
  getUnreadCount: ()    => api.get('/inquiries/unread-count'),
};
