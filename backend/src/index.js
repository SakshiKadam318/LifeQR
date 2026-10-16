
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const qrRoutes = require('./routes/qr');
const publicRoutes = require('./routes/public');

require('./models/db');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://lifeqr-frontend.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('Blocked CORS origin:', origin);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// CORS must be before all API routes
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'))
);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LifeQR backend is running'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/public', publicRoutes);

// Unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Request error:', err.stack || err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`LifeQR backend running on port ${PORT}`);
});
