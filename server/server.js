const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');


const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const predictRoutes = require('./routes/predict');
const navigateRoutes = require('./routes/navigate');
const verifyRoutes = require('./routes/verify');
const searchRoutes = require('./routes/search');
const chatRoutes = require('./routes/chat');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('short'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'medisense-backend', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/predict', authMiddleware, predictRoutes);
app.use('/api/navigate', authMiddleware, navigateRoutes);
app.use('/api/verify', authMiddleware, verifyRoutes);
app.use('/api/search', authMiddleware, searchRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);


// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MediSense Backend running on port ${PORT}`);
});
