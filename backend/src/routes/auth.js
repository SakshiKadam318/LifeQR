const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lifeqr-super-secret-key-change-in-production';

// REGISTER
router.post('/register', (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const id = uuidv4();
    db.prepare(
      'INSERT INTO users (id, full_name, email, password) VALUES (?, ?, ?, ?)'
    ).run(id, full_name, email, password);

    // ✅ Profile bhi create karo
    const profileId = uuidv4();
    db.prepare(
      'INSERT INTO profiles (id, user_id, full_name) VALUES (?, ?, ?)'
    ).run(profileId, id, full_name);

    const user = { id, full_name, email };
    const token = jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = db.prepare(
      'SELECT * FROM users WHERE email = ? AND password = ?'
    ).get(email, password);

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // ✅ Login pe profile check karo
    const existingProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
    if (!existingProfile) {
      const profileId = uuidv4();
      db.prepare(
        'INSERT INTO profiles (id, user_id, full_name) VALUES (?, ?, ?)'
      ).run(profileId, user.id, user.full_name);
    }

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;