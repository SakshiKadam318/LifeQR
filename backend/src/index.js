require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const qrRoutes = require('./routes/qr');
const publicRoutes = require('./routes/public');

const db = require('./models/db');

const app = express();
const PORT = process.env.PORT || 5000;



// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`LifeQR backend running on port ${PORT}`);
});