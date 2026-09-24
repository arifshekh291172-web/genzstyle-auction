const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const auditService = {
  log: async ({ actor, action, entity, entityId, metadata = {}, req = null }) => {
    try {
      const actorId = actor && actor._id ? actor._id : null;
      const actorEmail = actor && actor.email ? actor.email : 'SYSTEM';
      const actorRole = actor && actor.role ? actor.role : 'SYSTEM';
      const ipAddress = req ? req.ip || req.headers['x-forwarded-for'] : null;
      const userAgent = req ? req.headers['user-agent'] : null;

      const logEntry = await AuditLog.create({
        actorId,
        actorEmail,
        actorRole,
        action,
        entity,
        entityId: entityId ? entityId.toString() : null,
        metadata,
        ipAddress,
        userAgent,
      });

      logger.info('AUDIT_LOG', `[${action}] on ${entity} (${entityId || 'N/A'}) by ${actorEmail}`);
      return logEntry;
    } catch (err) {
      logger.error('AUDIT_ERROR', `Failed to record audit log: ${err.message}`, { action, entity });
      return null;
    }
  },
};

module.exports = auditService;
