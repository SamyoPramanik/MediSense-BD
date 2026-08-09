const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();


// GET /api/predict/outbreaks — National outbreak summary with per-district probabilities
router.get('/outbreaks', async (req, res) => {
  try {
    const result = await db.query(
      `WITH latest_prediction_date AS (
         SELECT COALESCE(MAX(predicted_date), CURRENT_DATE) as latest_date FROM outbreak_predictions
       ),
       latest_predictions AS (
         SELECT op.*
         FROM outbreak_predictions op, latest_prediction_date lpd
         WHERE op.predicted_date = lpd.latest_date
       ),
       predictions_with_risk AS (
         SELECT lp.*,
                (lp.predicted_cases::double precision / NULLIF(SUM(lp.predicted_cases) OVER (PARTITION BY lp.disease), 0)) as risk
         FROM latest_predictions lp
       )
       SELECT d.id as district_id, d.name, d.name_bn, d.lat, d.lng, d.division,
              COALESCE(
                JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'disease', pwr.disease,
                    'predicted_cases', pwr.predicted_cases,
                    'probability', pwr.probability,
                    'risk', pwr.risk
                  )
                ) FILTER (WHERE pwr.disease IS NOT NULL),
                '[]'::json
              ) as diseases,
              COALESCE(MAX(pwr.risk), 0) as max_risk
       FROM districts d
       LEFT JOIN predictions_with_risk pwr ON pwr.district_id = d.id
       GROUP BY d.id, d.name, d.name_bn, d.lat, d.lng, d.division
       ORDER BY max_risk DESC NULLS LAST`
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
      `SELECT disease, predicted_date, predicted_cases, actual_cases, probability, temperature, humidity, rainfall_mm, season_type
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

// POST /api/predict/upload — Upload CSV text to replace or append to the DB table
router.post('/upload', authMiddleware, async (req, res) => {
  if (req.user && req.user.role === 'user') {
    return res.status(403).json({ error: 'Permission denied: Regular users are not allowed to upload datasets.' });
  }
  const client = await db.pool.connect();
  try {
    const { csvData, mode } = req.body;

    if (!csvData) {
      return res.status(400).json({ error: 'No CSV data provided' });
    }

    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) {
      return res.status(400).json({ error: 'CSV dataset is empty or missing header line' });
    }

    // Parse headers case-insensitively
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Find index of column headers using exact matches to prevent substring overlapping
    const districtNameIdx = headers.findIndex(h => h === 'district_name' || h === 'name' || h === 'district');
    const districtIdIdx = headers.findIndex(h => h === 'district_id' || h === 'id');
    const diseaseIdx = headers.findIndex(h => h === 'disease');
    const dateIdx = headers.findIndex(h => h === 'predicted_date' || h === 'date');
    const predictedCasesIdx = headers.findIndex(h => h === 'predicted_cases' || h === 'predicted' || h === 'cases');
    const actualCasesIdx = headers.findIndex(h => h === 'actual_cases' || h === 'actual');
    const probIdx = headers.findIndex(h => h === 'probability' || h === 'prob');
    const tempIdx = headers.findIndex(h => h === 'temperature' || h === 'temp');
    const humIdx = headers.findIndex(h => h === 'humidity' || h === 'hum');
    const rainIdx = headers.findIndex(h => h === 'rainfall_mm' || h === 'rain' || h === 'rainfall');
    const seasonIdx = headers.findIndex(h => h === 'season_type' || h === 'season');

    if (districtNameIdx === -1 && districtIdIdx === -1) {
      return res.status(400).json({ error: 'CSV must contain district_name or district_id column' });
    }
    if (diseaseIdx === -1 || dateIdx === -1 || predictedCasesIdx === -1) {
      return res.status(400).json({ error: 'CSV must contain disease, predicted_date, and predicted_cases columns' });
    }

    // Build district name -> ID mapping cache
    const districtsRes = await client.query('SELECT id, name FROM districts');
    const districtMap = {};
    districtsRes.rows.forEach(d => {
      districtMap[d.name.toLowerCase().trim()] = d.id;
    });

    await client.query('BEGIN');

    if (mode === 'replace') {
      await client.query('TRUNCATE TABLE outbreak_predictions RESTART IDENTITY CASCADE');
    }

    const insertQuery = `
      INSERT INTO outbreak_predictions 
      (district_id, disease, predicted_date, predicted_cases, actual_cases, probability, temperature, humidity, rainfall_mm, season_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',');

      // Resolve district_id
      let district_id = null;
      if (districtIdIdx !== -1 && cols[districtIdIdx]) {
        district_id = parseInt(cols[districtIdIdx].trim());
      } else if (districtNameIdx !== -1 && cols[districtNameIdx]) {
        const nameKey = cols[districtNameIdx].toLowerCase().trim();
        district_id = districtMap[nameKey];
        if (!district_id) {
          throw new Error(`Unknown district name: "${cols[districtNameIdx]}" at row ${i + 1}`);
        }
      }

      if (!district_id || isNaN(district_id)) {
        throw new Error(`Invalid district at row ${i + 1}`);
      }

      const disease = cols[diseaseIdx] ? cols[diseaseIdx].trim() : 'Unknown';
      const predicted_date = cols[dateIdx] ? cols[dateIdx].trim() : new Date().toISOString().split('T')[0];
      const predicted_cases = cols[predictedCasesIdx] ? parseInt(cols[predictedCasesIdx].trim()) : 0;
      
      const actual_cases = actualCasesIdx !== -1 && cols[actualCasesIdx] && cols[actualCasesIdx].trim() !== '' 
        ? parseInt(cols[actualCasesIdx].trim()) 
        : null;
        
      const probability = probIdx !== -1 && cols[probIdx] && cols[probIdx].trim() !== '' 
        ? parseFloat(cols[probIdx].trim()) 
        : 0.5;
        
      const temperature = tempIdx !== -1 && cols[tempIdx] && cols[tempIdx].trim() !== '' 
        ? parseFloat(cols[tempIdx].trim()) 
        : null;
        
      const humidity = humIdx !== -1 && cols[humIdx] && cols[humIdx].trim() !== '' 
        ? parseFloat(cols[humIdx].trim()) 
        : null;
        
      const rainfall_mm = rainIdx !== -1 && cols[rainIdx] && cols[rainIdx].trim() !== '' 
        ? parseFloat(cols[rainIdx].trim()) 
        : null;
        
      const season_type = seasonIdx !== -1 && cols[seasonIdx] ? cols[seasonIdx].trim() : 'Summer';

      await client.query(insertQuery, [
        district_id, disease, predicted_date, predicted_cases, actual_cases,
        probability, temperature, humidity, rainfall_mm, season_type
      ]);
      count++;
    }

    await client.query('COMMIT');
    res.json({ success: true, count, message: `Successfully loaded ${count} records` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import CSV error:', err);
    res.status(400).json({ error: err.message || 'Failed to parse and upload CSV' });
  } finally {
    client.release();
  }
});

// POST /api/predict/run — Trigger FastAPI ML model training & next-day forecast updates
router.post('/run', authMiddleware, async (req, res) => {
  if (req.user && req.user.role === 'user') {
    return res.status(403).json({ error: 'Permission denied: Regular users are not allowed to run model training.' });
  }
  try {

    const response = await fetch('http://ml-inference:8000/predict/train_and_predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`FastAPI service returned status ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'error') {
      return res.status(500).json({ error: result.message });
    }

    res.json(result);
  } catch (err) {
    console.error('Run prediction model error:', err);
    res.status(500).json({ error: err.message || 'Failed to execute prediction run' });
  }
});

// GET /api/predict/export — Export outbreak prediction table as CSV file using district names
router.get('/export', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT d.name as district_name, op.disease, op.predicted_date, op.predicted_cases, 
             op.actual_cases, op.probability, op.temperature, op.humidity, op.rainfall_mm, op.season_type 
      FROM outbreak_predictions op
      JOIN districts d ON op.district_id = d.id
      ORDER BY op.predicted_date DESC, d.name ASC
    `);

    // Output with District_name header matching the import requirements
    let csvContent = 'District_name,disease,predicted_date,predicted_cases,actual_cases,probability,temperature,humidity,rainfall_mm,season_type\n';

    for (const row of result.rows) {
      const dateStr = row.predicted_date instanceof Date 
        ? row.predicted_date.toISOString().split('T')[0] 
        : row.predicted_date;

      const line = [
        row.district_name,
        row.disease,
        dateStr,
        row.predicted_cases,
        row.actual_cases !== null ? row.actual_cases : '',
        row.probability,
        row.temperature !== null ? row.temperature : '',
        row.humidity !== null ? row.humidity : '',
        row.rainfall_mm !== null ? row.rainfall_mm : '',
        row.season_type
      ].join(',');

      csvContent += line + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=outbreak_predictions.csv');
    res.send(csvContent);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Failed to generate prediction dataset export' });
  }
});

module.exports = router;
