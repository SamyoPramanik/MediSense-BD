const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL || 'postgresql://admin:password@localhost:5432/medisense',
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
