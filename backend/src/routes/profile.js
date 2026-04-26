const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();


// ✅ GET PROFILE (MISSING HOTA — NOW FIXED)
router.get('/', authMiddleware, (req, res) => {
  try {
    const profile = db.prepare(
      'SELECT * FROM profiles WHERE user_id = ?'
    ).get(req.user.userId);

    const contacts = db.prepare(
      'SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY priority'
    ).all(req.user.userId);

    res.json({
      profile: profile || {},
      contacts: contacts || []
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});


// ✅ SAVE / UPDATE PROFILE (AUTO CREATE FIX)
router.put('/', authMiddleware, (req, res) => {
  try {
    const {
      full_name, date_of_birth, gender, blood_type,
      allergies, medical_conditions, current_medications,
      doctor_name, doctor_phone, organ_donor, address
    } = req.body;

    // 🔥 CREATE IF NOT EXISTS
    const existing = db.prepare(
      'SELECT * FROM profiles WHERE user_id = ?'
    ).get(req.user.userId);

    if (!existing) {
      db.prepare(
        'INSERT INTO profiles (user_id, full_name) VALUES (?, ?)'
      ).run(req.user.userId, full_name || '');
    }

    // 🔥 UPDATE
    db.prepare(`
      UPDATE profiles SET
        full_name = ?, date_of_birth = ?, gender = ?, blood_type = ?,
        allergies = ?, medical_conditions = ?, current_medications = ?,
        doctor_name = ?, doctor_phone = ?, organ_donor = ?, address = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      full_name, date_of_birth, gender, blood_type,
      allergies, medical_conditions, current_medications,
      doctor_name, doctor_phone, organ_donor ? 1 : 0, address,
      req.user.userId
    );

    res.json({ message: 'Profile saved successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});


// ✅ ADD CONTACT
router.post('/contacts', authMiddleware, (req, res) => {
  try {
    const { name, relationship, phone, priority } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO emergency_contacts 
      (id, user_id, name, relationship, phone, priority)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.user.userId,
      name,
      relationship,
      phone,
      priority || 1
    );

    res.status(201).json({ message: 'Contact added', id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add contact' });
  }
});


// ✅ DELETE CONTACT
router.delete('/contacts/:id', authMiddleware, (req, res) => {
  try {
    db.prepare(
      'DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.user.userId);

    res.json({ message: 'Contact removed' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});


module.exports = router;