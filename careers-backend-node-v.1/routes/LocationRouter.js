const express = require('express');
const router = express.Router();
const Location = require('../models/LocationModel');

// GET /api/locations/states?country=India
// Returns all states for a country
router.get('/states', async (req, res) => {
  try {
    const country = req.query.country?.trim();
    if (!country) return res.status(400).json({ message: 'Country is required' });

    const results = await Location.find(
      { country: { $regex: `^${country}$`, $options: 'i' } },
      { state: 1, _id: 0 }
    ).sort({ state: 1 });

    const states = results.map(r => r.state);
    res.json({ data: states });
  } catch (err) {
    console.error('States fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/locations/cities?country=India&state=Telangana
// Returns all cities for a country + state
router.get('/cities', async (req, res) => {
  try {
    const country = req.query.country?.trim();
    const state = req.query.state?.trim();
    if (!country || !state) return res.status(400).json({ message: 'Country and state are required' });

    const result = await Location.findOne({
      country: { $regex: `^${country}$`, $options: 'i' },
      state:   { $regex: `^${state}$`,   $options: 'i' },
    });

    const cities = result?.cities || [];
    res.json({ data: cities.sort() });
  } catch (err) {
    console.error('Cities fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/locations/countries
// Returns all available countries in the DB
router.get('/countries', async (req, res) => {
  try {
    const countries = await Location.distinct('country');
    res.json({ data: countries.sort() });
  } catch (err) {
    console.error('Countries fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;