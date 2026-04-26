const express = require('express');
const router = express.Router();
  const  db   = require('../models/db'); // path check kar
const { v4: uuidv4 } = require('uuid');

// ROUTE
router.get('/scan/:token', (req, res) => {
  try {
    const { token } = req.params;

    console.log("TOKEN RECEIVED:", token);

    const qrRecord = db.prepare(
      "SELECT * FROM qr_tokens WHERE token = ?"
    ).get(token);

    if (!qrRecord) {
      return res.status(404).json({ error: 'QR code not found or expired' });
    }

    if (qrRecord.expires_at && new Date(qrRecord.expires_at) < new Date()) {
      return res.status(410).json({ error: 'QR code has expired' });
    }

    const profile = db.prepare(
      'SELECT * FROM profiles WHERE user_id = ?'
    ).get(qrRecord.user_id);

    const contacts = db.prepare(
      'SELECT id, name, relationship, phone FROM emergency_contacts WHERE user_id = ? ORDER BY priority'
    ).all(qrRecord.user_id);

    const logId = uuidv4();

    db.prepare(
      'INSERT INTO scan_logs (id, qr_token) VALUES (?, ?)'
    ).run(logId, token);

    res.json({
      profile,
      contacts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// IMPORTANT
module.exports = router;