const express = require('express');
const router = express.Router();
const UniversityProgram = require('../models/Universityprogram.model');

// GET /api/university-programs/search?q=stan
// Search only universities that have mapped programs
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    // Get distinct university names matching the query
    const results = await UniversityProgram.distinct('university', {
      university: { $regex: q, $options: 'i' }
    });

    // Return in same format as /api/universities/search for compatibility
    const data = results.slice(0, 8).map(name => ({ name }));

    res.json({ data });
  } catch (err) {
    console.error('University search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/university-programs?university=Stanford University
// Returns all programs for a specific university
router.get('/', async (req, res) => {
  try {
    const universityName = req.query.university?.trim();

    if (!universityName || universityName.length < 2) {
      return res.status(400).json({ message: 'University name is required' });
    }

    const results = await UniversityProgram.find({
      university: { $regex: universityName, $options: 'i' }
    }).select('program -_id');

    const programs = results.map(r => r.program);

    res.json({ data: programs });
  } catch (err) {
    console.error('University programs fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;