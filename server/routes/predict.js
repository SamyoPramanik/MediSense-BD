const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/predict/outbreaks — National outbreak summary with per-district probabilities
router.get('/outbreaks', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.id as district_id, d.name, d.name_bn, d.lat, d.lng, d.division,
              op.disease, op.probability, op.predicted_cases, op.predicted_date,
              op.temperature, op.humidity
       FROM districts d
       LEFT JOIN LATERAL (
         SELECT * FROM outbreak_predictions 
         WHERE district_id = d.id 
           AND predicted_date >= CURRENT_DATE
         ORDER BY probability DESC
         LIMIT 1
       ) op ON true
       ORDER BY op.probability DESC NULLS LAST`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Outbreaks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/predict/district/:id — District-level time-series forecast
router.get('/district/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const district = await db.query('SELECT * FROM districts WHERE id = $1', [id]);
    if (district.rows.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }

    const predictions = await db.query(
      `SELECT disease, predicted_date, predicted_cases, actual_cases, probability, temperature, humidity
       FROM outbreak_predictions 
       WHERE district_id = $1 
       ORDER BY predicted_date ASC`,
      [id]
    );

    res.json({
      district: district.rows[0],
      predictions: predictions.rows,
    });
  } catch (err) {
    console.error('District prediction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
