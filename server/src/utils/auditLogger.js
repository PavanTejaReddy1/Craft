import AuditLog from '../models/AuditLog.js';

export const createAuditLog = async ({
  user = null,
  action,
  entity = null,
  entityId = null,
  changes = {},
  ip = null,
  userAgent = null,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      user,
      action,
      entity,
      entityId,
      changes,
      ip,
      userAgent,
      metadata,
    });
  } catch (err) {
    // Audit log failures should never crash the app
    console.error('Audit log creation failed:', err.message);
  }
};
