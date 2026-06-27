const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/dashboard/kpi
router.get('/kpi', async (req, res) => {
  try {
    // Active outbreak warnings
    const outbreaks = await db.query(
      `SELECT COUNT(DISTINCT district_id) as districts, 
              MAX(probability) as max_probability,
              SUM(predicted_cases) as total_predicted
       FROM outbreak_predictions 
       WHERE predicted_date >= CURRENT_DATE 
         AND predicted_date <= CURRENT_DATE + INTERVAL '7 days'
         AND probability > 0.6`
    );

    // National Health Equity Index (average)
    const equity = await db.query(
      `SELECT ROUND(AVG(equity_score)::numeric, 2) as national_index,
              COUNT(*) as upazilas_measured
       FROM health_equity_scores`
    );

    // Counterfeit detection rate
    const verification = await db.query(
      `SELECT COUNT(*) as total_scans,
              COUNT(*) FILTER (WHERE status = 'counterfeit') as counterfeit_found
       FROM drug_registry`
    );

    res.json({
      outbreaks: {
        active_warnings: parseInt(outbreaks.rows[0]?.districts || 0),
        max_probability: parseFloat(outbreaks.rows[0]?.max_probability || 0),
        total_predicted_cases: parseInt(outbreaks.rows[0]?.total_predicted || 0),
      },
      equity: {
        national_index: parseFloat(equity.rows[0]?.national_index || 0),
        upazilas_measured: parseInt(equity.rows[0]?.upazilas_measured || 0),
      },
      verification: {
        total_scans: parseInt(verification.rows[0]?.total_scans || 0),
        counterfeit_found: parseInt(verification.rows[0]?.counterfeit_found || 0),
        detection_rate: verification.rows[0]?.total_scans > 0
          ? ((verification.rows[0].counterfeit_found / verification.rows[0].total_scans) * 100).toFixed(1)
          : 0,
      },
    });
  } catch (err) {
    console.error('KPI error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/feed
router.get('/feed', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT 20'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
