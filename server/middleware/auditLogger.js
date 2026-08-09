const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medisense-secret-key-2026';
const logsDir = path.resolve(__dirname, '../logs');

// Ensure log directory exists
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

function auditLoggerMiddleware(req, res, next) {
  const start = Date.now();

  // Try extracting user from Authorization header if present before authMiddleware
  let extractedUser = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      extractedUser = jwt.verify(token, JWT_SECRET);
    } catch (err) {}
  }

  // Intercept response json to capture summary
  let responseBody = null;
  const originalJson = res.json;
  res.json = function (body) {
    responseBody = body;
    return originalJson.apply(res, arguments);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userObj = req.user || extractedUser;

    let userInfo = 'Anonymous Visitor';
    if (userObj) {
      userInfo = `User ID ${userObj.id} (${userObj.email || 'no-email'}, role: ${userObj.role || 'user'}, gender: ${userObj.gender || 'unspecified'})`;
    }

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').toString();
    const userAgent = req.headers['user-agent'] || 'Unknown-Agent';
    const timestamp = new Date().toISOString();

    let payloadStr = '';
    if (req.body && Object.keys(req.body).length > 0) {
      const sanitized = sanitizePayload(req.body);
      payloadStr = ` | Payload: ${JSON.stringify(sanitized)}`;
    }

    let resSummary = '';
    if (res.statusCode >= 400 && responseBody && responseBody.error) {
      resSummary = ` | Error: "${responseBody.error}"`;
    }

    const logLine = `[${timestamp}] | ${req.method} ${req.originalUrl || req.url} | Status: ${res.statusCode} (${duration}ms) | User: ${userInfo} | IP: ${ip}${payloadStr}${resSummary} | UA: ${userAgent}\n`;

    // Append log line asynchronously to activity_audit.log file
    fs.appendFile(logFilePath, logLine, (err) => {
      if (err) console.error('[Audit Logger Error] Failed to write log file:', err);
    });

    // Console output for docker logs
    console.log(`[AUDIT LOG] ${logLine.trim()}`);
  });

  next();
}

module.exports = { auditLoggerMiddleware, logFilePath };
