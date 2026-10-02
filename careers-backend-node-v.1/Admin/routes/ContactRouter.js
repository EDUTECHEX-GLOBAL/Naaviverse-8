const express = require('express');
const router = express.Router();
const Contact = require('../models/ContactModel');
const { validateEmail, validatePersonName } = require('../../utils/emailValidator');

// POST — save message
router.post('/', async (req, res) => {
  try {
    const { email, fullName, mobile, message } = req.body;

    const validation = validateEmail(email);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const nameValidation = validatePersonName(fullName, "Full name");
    if (!nameValidation.isValid) {
      return res.status(400).json({ message: nameValidation.message });
    }

    await Contact.create({
      ...req.body,
      email: validation.cleanEmail,
      fullName: nameValidation.cleanName,
    });
    res.status(201).json({ message: "Message saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error saving message" });
  }
});

// GET — fetch all
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch {
    res.status(500).json({ message: "Error fetching contacts" });
  }
});

router.get('/count', async (req, res) => {
  try {
    const count = await Contact.countDocuments();

    res.set('Cache-Control', 'no-store');   // 🔥 ADD THIS
    res.status(200).json({ count });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;