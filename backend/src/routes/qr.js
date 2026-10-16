
const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const db = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Live frontend URL
const FRONTEND_URL = (
  process.env.FRONTEND_URL ||
  'https://lifeqr-frontend.onrender.com'
).replace(/\/+$/, '');

// Generate new QR code
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized: User ID not found'
      });
    }

    // Deactivate previous QR codes for this user
    db.prepare(`
      UPDATE qr_tokens
      SET is_active = 0
      WHERE user_id = ?
    `).run(userId);

    const token = uuidv4();
    const qrId = uuidv4();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const expiresAtISO = expiresAt.toISOString();

    // Insert new active QR token
    db.prepare(`
      INSERT INTO qr_tokens
        (id, user_id, token, expires_at, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(qrId, userId, token, expiresAtISO);

    // URL opened when QR is scanned
    const scanUrl = `${FRONTEND_URL}/scan/${token}`;

    // Generate QR image
    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#FFFFFF'
      },
      width: 300
    });

    return res.status(201).json({
      message: 'QR code generated successfully',
      token,
      scanUrl,
      qrDataUrl,
      expiresAt: expiresAtISO
    });

  } catch (err) {
    console.error('GENERATE ERROR:', err);

    return res.status(500).json({
      error: 'Failed to generate QR code'
    });
  }
});

// Get active QR code
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized: User ID not found'
      });
    }

    const qrRecord = db.prepare(`
      SELECT *
      FROM qr_tokens
      WHERE user_id = ?
        AND is_active = 1
      ORDER BY created_at DESC
      LIMIT 1
    `).get(userId);

    if (!qrRecord) {
      return res.json({ qr: null });
    }

    const scanUrl = `${FRONTEND_URL}/scan/${qrRecord.token}`;

    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#FFFFFF'
      },
      width: 300
    });

    return res.json({
      qr: {
        ...qrRecord,
        scanUrl,
        qrDataUrl
      }
    });

  } catch (err) {
    console.error('ACTIVE ERROR:', err);

    return res.status(500).json({
      error: 'Failed to load QR code'
    });
  }
});

// Get scan logs
router.get('/scan-logs', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized: User ID not found'
      });
    }

    const logs = db.prepare(`
      SELECT sl.*
      FROM scan_logs sl
      JOIN qr_tokens qt
        ON sl.qr_token = qt.token
      WHERE qt.user_id = ?
      ORDER BY sl.scanned_at DESC
      LIMIT 50
    `).all(userId);

    return res.json({ logs });

  } catch (err) {
    console.error('SCAN LOGS ERROR:', err);

    return res.status(500).json({
      error: 'Failed to load scan logs'
    });
  }
});

module.exports = router;
