const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medisense-secret-key-2026';
const logsDir = path.resolve(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'activity_audit.log');

// Helper to sanitize sensitive fields in payloads
function sanitizePayload(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = JSON.parse(JSON.stringify(obj));
  const sensitiveKeys = ['password', 'token', 'jwt', 'secret', 'apiKey'];

  const sanitizeRecursive = (target) => {
    if (!target || typeof target !== 'object') return;
    for (const key of Object.keys(target)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        target[key] = '***REDACTED***';
      } else if (typeof target[key] === 'object') {
        sanitizeRecursive(target[key]);
      }
    }
  };

  sanitizeRecursive(clone);
  return clone;
}

let entryCounter = Date.now();

function auditLoggerMiddleware(req, res, next) {
  const start = Date.now();

  let extractedUser = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      extractedUser = jwt.verify(token, JWT_SECRET);
    } catch (err) {}
  }

  let responseBody = null;
  const originalJson = res.json;
  res.json = function (body) {
    responseBody = body;
    return originalJson.apply(res, arguments);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userObj = req.user || extractedUser;

    const userSummary = userObj
      ? `${userObj.email || 'user'} (${userObj.role || 'user'})`
      : 'Anonymous';

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').toString();
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const timestamp = new Date().toISOString();
    const entryId = `${Date.now()}-${++entryCounter}`;

    let payload = null;
    if (req.body && Object.keys(req.body).length > 0) {
      payload = sanitizePayload(req.body);
    }

    let errorDetail = null;
    if (res.statusCode >= 400 && responseBody && responseBody.error) {
      errorDetail = responseBody.error;
    }

    const logRecord = {
      id: entryId,
      timestamp,
      type: 'HTTP',
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: duration,
      user: userObj ? { id: userObj.id, email: userObj.email, role: userObj.role, gender: userObj.gender } : null,
      userSummary,
      ip,
      userAgent,
      payload,
      error: errorDetail,
    };

    fs.appendFile(logFilePath, JSON.stringify(logRecord) + '\n', (err) => {
      if (err) console.error('[Audit Logger Error] Failed to write log:', err);
    });

    console.log(`[AUDIT] ${req.method} ${req.originalUrl || req.url} ${res.statusCode} (${duration}ms) - ${userSummary}`);
  });

  next();
}

module.exports = { auditLoggerMiddleware, logFilePath, sanitizePayload };
