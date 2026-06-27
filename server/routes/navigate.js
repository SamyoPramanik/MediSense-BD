const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/navigate/hospitals — All hospitals with coordinates
router.get('/hospitals', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT h.*, d.name as district_name, d.division 
       FROM hospitals h 
       JOIN districts d ON h.district_id = d.id
       ORDER BY h.name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Hospitals error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/navigate/nearest?lat=&lng= — Nearest hospitals
router.get('/nearest', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng required' });
    }

    // Haversine distance calculation in SQL
    const result = await db.query(
      `SELECT h.*, d.name as district_name,
              (6371 * acos(
                cos(radians($1)) * cos(radians(h.lat)) *
                cos(radians(h.lng) - radians($2)) +
                sin(radians($1)) * sin(radians(h.lat))
              )) AS distance_km
       FROM hospitals h
       JOIN districts d ON h.district_id = d.id
       WHERE h.has_emergency = true
       ORDER BY distance_km ASC
       LIMIT 5`,
      [parseFloat(lat), parseFloat(lng)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Nearest hospital error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/navigate/equity-heatmap — Upazila-level equity scores
router.get('/equity-heatmap', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT hes.*, d.name as district_name, d.lat, d.lng, d.division
       FROM health_equity_scores hes
       JOIN districts d ON hes.district_id = d.id
       ORDER BY hes.equity_score ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Equity heatmap error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
