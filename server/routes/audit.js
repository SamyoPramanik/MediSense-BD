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

  let userObj = null;
  let userSummary = 'Anonymous Visitor';
  if (req.user) {
    userObj = { id: req.user.id, email: req.user.email, role: req.user.role, gender: req.user.gender };
    userSummary = `${req.user.email} (${req.user.role})`;
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').toString();
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const entryId = `${Date.now()}-pv`;

  const logRecord = {
    id: entryId,
    timestamp,
    type: 'PAGE_VISIT',
    method: 'GET',
    url: pagePath || '/',
    status: 200,
    durationMs: 0,
    user: userObj,
    userSummary,
    ip,
    userAgent,
    payload: { title: title || 'MediSense', referrer: referrer || 'direct' },
    error: null,
  };

  fs.appendFile(logFilePath, JSON.stringify(logRecord) + '\n', (err) => {
    if (err) console.error('[Audit Logger Error] Failed to write page visit log:', err);
  });

  res.json({ status: 'ok', logged: true });
});

// GET /api/audit/logs — Read lightweight summary log table (ADMIN ONLY STRICT)
router.get('/logs', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    if (!fs.existsSync(logFilePath)) {
      return res.json({ total_entries: 0, showing: 0, logs: [], message: 'No log records found.' });
    }

    const fileContent = fs.readFileSync(logFilePath, 'utf8');
    const rawLines = fileContent.trim().split('\n').filter(Boolean);

    const parsedRecords = [];
    for (let i = rawLines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(rawLines[i]);
        // Strip heavy fields for table listing to maximize speed & bandwidth
        parsedRecords.push({
          id: item.id || `idx-${i}`,
          timestamp: item.timestamp,
          type: item.type || 'HTTP',
          method: item.method || 'GET',
          url: item.url || '/',
          status: item.status || 200,
          durationMs: item.durationMs || 0,
          userSummary: item.userSummary || 'Anonymous',
          ip: item.ip || '127.0.0.1',
          hasPayload: Boolean(item.payload),
          hasError: Boolean(item.error),
        });
      } catch (parseErr) {
        // Fallback for legacy plain text lines
        parsedRecords.push({
          id: `legacy-${i}`,
          timestamp: new Date().toISOString(),
          type: 'LEGACY',
          method: 'LOG',
          url: rawLines[i].slice(0, 50),
          status: 200,
          durationMs: 0,
          userSummary: 'System',
          ip: '127.0.0.1',
          hasPayload: false,
          hasError: false,
        });
      }
      if (parsedRecords.length >= 150) break; // Return max 150 recent items for fast table loading
    }

    res.json({
      total_entries: rawLines.length,
      showing: parsedRecords.length,
      logs: parsedRecords,
      log_file_path: logFilePath,
    });
  } catch (err) {
    console.error('Failed to read audit logs:', err);
    res.status(500).json({ error: 'Failed to read audit log file' });
  }
});

// GET /api/audit/logs/:id — On-demand full detail fetch for a specific log entry (ADMIN ONLY)
router.get('/logs/:id', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    if (!fs.existsSync(logFilePath)) {
      return res.status(404).json({ error: 'Log record not found' });
    }

    const fileContent = fs.readFileSync(logFilePath, 'utf8');
    const rawLines = fileContent.trim().split('\n').filter(Boolean);

    for (let i = rawLines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(rawLines[i]);
        if (item.id === id || `idx-${i}` === id) {
          return res.json(item);
        }
      } catch (e) {}
    }

    res.status(404).json({ error: 'Log entry not found' });
  } catch (err) {
    console.error('Failed to fetch full log details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
