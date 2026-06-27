const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/search?q= — Cross-pillar search
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const searchTerm = `%${q.trim()}%`;

    // Search districts
    const districts = await db.query(
      `SELECT id, name, name_bn, division, 'district' as type FROM districts 
       WHERE name ILIKE $1 OR name_bn ILIKE $1 OR division ILIKE $1 LIMIT 5`,
      [searchTerm]
    );

    // Search hospitals
    const hospitals = await db.query(
      `SELECT h.id, h.name, d.name as district_name, h.type, 'hospital' as result_type 
       FROM hospitals h JOIN districts d ON h.district_id = d.id
       WHERE h.name ILIKE $1 LIMIT 5`,
      [searchTerm]
    );

    // Search drugs
    const drugs = await db.query(
      `SELECT id, brand_name, generic_name, manufacturer, status, 'drug' as type 
       FROM drug_registry
       WHERE brand_name ILIKE $1 OR generic_name ILIKE $1 LIMIT 5`,
      [searchTerm]
    );

    // Search diseases in predictions
    const diseases = await db.query(
      `SELECT DISTINCT disease, 'disease' as type FROM outbreak_predictions
       WHERE disease ILIKE $1 LIMIT 3`,
      [searchTerm]
    );

    res.json({
      districts: districts.rows,
      hospitals: hospitals.rows,
      drugs: drugs.rows,
      diseases: diseases.rows,
      total: districts.rows.length + hospitals.rows.length + drugs.rows.length + diseases.rows.length,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
