const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Generate new QR code
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    db.prepare('UPDATE qr_tokens SET is_active = 0 WHERE user_id = ?').run(req.user.userId);

    const token = uuidv4();
    const qrId = uuidv4();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    db.prepare('INSERT INTO qr_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)')
      .run(qrId, req.user.userId, token, expiresAt.toISOString());

    const frontendUrl = process.env.FRONTEND_URL || 'http://192.25.129.228:3000'; // ✅ fixed
    const scanUrl = `${frontendUrl}/scan/${token}`;

    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#FFFFFF' },
      width: 300
    });

    res.json({ message: 'QR code generated', token, scanUrl, qrDataUrl, expiresAt: expiresAt.toISOString() });
  } catch (err) {
    console.error('GENERATE ERROR:', err);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Get active QR
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const qrRecord = db.prepare(
      'SELECT * FROM qr_tokens WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1'
    ).get(req.user.userId);

    if (!qrRecord) return res.json({ qr: null });

    const frontendUrl = process.env.FRONTEND_URL || 'http://172.25.129.228:3000'; // ✅ fixed
    const scanUrl = `${frontendUrl}/scan/${qrRecord.token}`;

    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#FFFFFF' },
      width: 300
    });

    res.json({ qr: { ...qrRecord, scanUrl, qrDataUrl } });
  } catch (err) {
    console.error('ACTIVE ERROR:', err);
    res.status(500).json({ error: 'Failed to load QR code' });
  }
});

// Get scan logs
router.get('/scan-logs', authMiddleware, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT sl.* FROM scan_logs sl
      JOIN qr_tokens qt ON sl.qr_token = qt.token
      WHERE qt.user_id = ?
      ORDER BY sl.scanned_at DESC
      LIMIT 50
    `).all(req.user.userId);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load scan logs' });
  }
});

module.exports = router;