const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { logFilePath } = require('../middleware/auditLogger');
const { authMiddleware, requireRole } = require('../middleware/auth');

// POST /api/audit/page-view — Track frontend page visits by users or anonymous visitors
router.post('/page-view', (req, res) => {
  const { path: pagePath, title, referrer } = req.body;
  const timestamp = new Date().toISOString();

  let userInfo = 'Anonymous Visitor';
  if (req.user) {
    userInfo = `User ID ${req.user.id} (${req.user.email}, role: ${req.user.role}, gender: ${req.user.gender || 'unspecified'})`;
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').toString();
  const userAgent = req.headers['user-agent'] || 'Unknown-Agent';

  const logLine = `[${timestamp}] | PAGE_VISIT ${pagePath || '/'} | Title: "${title || 'MediSense'}" | User: ${userInfo} | IP: ${ip} | Referrer: ${referrer || 'direct'} | UA: ${userAgent}\n`;

  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) console.error('[Audit Logger Error] Failed to write page visit log:', err);
  });

  console.log(`[AUDIT PAGE VISIT] ${logLine.trim()}`);
  res.json({ status: 'ok', logged: true });
});

// GET /api/audit/logs — Read recent audit logs for system auditing & maintenance
router.get('/logs', authMiddleware, requireRole('admin', 'analyst', 'user'), (req, res) => {

  try {
    if (!fs.existsSync(logFilePath)) {
      return res.json({ logs: [], message: 'No log file found yet.' });
    }

    const logContent = fs.readFileSync(logFilePath, 'utf8');
    const lines = logContent.trim().split('\n').filter(Boolean);
    const recentLogs = lines.slice(-100).reverse(); // Return last 100 entries

    res.json({
      total_entries: lines.length,
      showing: recentLogs.length,
      logs: recentLogs,
      log_file_path: logFilePath,
    });
  } catch (err) {
    console.error('Failed to read audit logs:', err);
    res.status(500).json({ error: 'Failed to read audit log file' });
  }
});

module.exports = router;
