const express = require('express');
const router = express.Router();
const ProgramName = require('../models/programName.model');

// GET /api/programs/search?q=nursing
// Search program names - same pattern as university search
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    const results = await ProgramName.find({
      name: { $regex: q, $options: 'i' }
    })
      .limit(8)
      .select('name -_id');

    res.json({ data: results });
  } catch (err) {
    console.error('Program search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;