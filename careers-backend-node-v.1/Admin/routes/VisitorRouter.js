const express = require('express');
const axios = require('axios');
const Visitor = require('../models/VisitorModel');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const geoCache = new Map();

const fallbackGeo = {
  city: 'Unknown',
  region: 'Unknown',
  postalCode: 'Unknown',
  country: 'Unknown'
};

const normalizeIp = (ip) => {
  if (!ip) return 'Unknown';

  let cleanIp = ip.split(',')[0].trim();

  if (cleanIp.includes('::ffff:')) {
    cleanIp = cleanIp.split('::ffff:')[1];
  }

  if (cleanIp === '::1') {
    return '127.0.0.1';
  }

  return cleanIp;
};

const isLocalOrPrivateIp = (ip) => {
  if (!ip || ip === 'Unknown') return true;

  return (
    ip === '127.0.0.1' ||
    ip === '0.0.0.0' ||
    ip === 'localhost' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip.startsWith('fc') ||
    ip.startsWith('fd') ||
    ip.startsWith('fe80:')
  );
};

const getGeoInfo = async (ip) => {
  if (isLocalOrPrivateIp(ip)) {
    return {
      city: 'Localhost',
      region: 'Local',
      postalCode: 'Unknown',
      country: 'Local'
    };
  }

  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.cachedAt < GEO_CACHE_TTL_MS) {
    return cached.geo;
  }

  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json`, {
      timeout: 2500,
      headers: {
        'User-Agent': 'NaaviNetworkVisitorLogger/1.0'
      }
    });

    const geo = {
      city: response.data?.city || fallbackGeo.city,
      region: response.data?.region || fallbackGeo.region,
      postalCode: response.data?.postal || fallbackGeo.postalCode,
      country: response.data?.country_name || fallbackGeo.country
    };

    geoCache.set(ip, { geo, cachedAt: Date.now() });
    return geo;
  } catch (err) {
    const status = err.response?.status;
    if (status === 429) {
      console.warn(`Visitor geo lookup rate-limited for ${ip}; using fallback location.`);
    } else {
      console.warn(`Visitor geo lookup failed for ${ip}: ${err.message}`);
    }

    return fallbackGeo;
  }
};

router.get('/', async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch visitors', error });
  }
});

router.post('/admin-visitor', async (req, res) => {
  try {
    const clientIp = normalizeIp(
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      req.ip
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyLogged = await Visitor.findOne({
      ip: clientIp,
      createdAt: { $gte: today }
    });

    if (alreadyLogged) {
      return res.status(200).json({ message: 'Visitor already logged today' });
    }

    const geo = await getGeoInfo(clientIp);

    const newVisitor = new Visitor({
      ip: clientIp,
      city: geo.city,
      region: geo.region,
      postalCode: geo.postalCode,
      country: geo.country
    });

    await newVisitor.save();

    return res.status(200).json({ message: 'Visitor data logged successfully' });
  } catch (err) {
    console.error('Error logging visitor:', err.message);
    return res.status(500).json({ message: 'Error logging visitor data' });
  }
});

router.get('/count', async (req, res) => {
  try {
    const count = await Visitor.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    console.error('Error fetching visitor count', err);
    res.status(500).send('Error fetching visitor count');
  }
});

module.exports = router;
