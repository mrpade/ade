const router   = require('express').Router();
const { Pharmacy } = require('../models');
const auth     = require('../middleware/auth');
const axios    = require('axios');

// util: geocode address via Nominatim (OpenStreetMap)
async function geocodeAddress(address) {
  const url = 'https://nominatim.openstreetmap.org/search';
  const { data } = await axios.get(url, { params: { format: 'json', q: address, limit: 1 } });
  if (Array.isArray(data) && data.length) {
    return { lat: data[0].lat, lon: data[0].lon };
  }
  return { lat: null, lon: null };
}

// POST /pharmacies  – onboarding pharmacie (profil)
router.post('/pharmacies', auth, async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;
    let lat = latitude, lon = longitude;
    if ((!lat || !lon) && address) {
      const geo = await geocodeAddress(address);
      lat = geo.lat; lon = geo.lon;
    }
      const pharmacy = await Pharmacy.create({
        user_id: req.user.id,
      name,
      address,
      latitude: lat,
      longitude: lon,
      location_verified: false,
      is_on_call: false
    });
    res.status(201).json(pharmacy);
  } catch (e) { res.status(500).json({ error: 'Erreur création pharmacie' }); }
});

// PUT /pharmacies/me/oncall  { is_on_call: true|false }
router.put('/pharmacies/me/oncall', auth, async (req, res) => {
  try {
    const { is_on_call } = req.body;
      await Pharmacy.update({ is_on_call }, { where: { user_id: req.user.id } });
    res.json({ message: 'État de garde mis à jour' });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

// GET /pharmacies/near?lat=...&lon=...
router.get('/pharmacies/near', async (req, res) => {
  let { lat, lon } = req.query;
  lat = parseFloat(lat);
  lon = parseFloat(lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ error: 'Coordonnées manquantes' });
  }
  try {
    let pharmacies = [];
    // Local pharmacies registered in the app
    const allLocal = await Pharmacy.findAll();
    const withinRadius = (p) => {
      if (!p.latitude || !p.longitude) return false;
      const toRad = (deg) => deg * Math.PI / 180;
      const R = 6371; // km
      const dLat = toRad(p.latitude - lat);
      const dLon = toRad(p.longitude - lon);
      const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(p.latitude)) * Math.sin(dLon/2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c <= 5; // 5km
    };
    pharmacies = allLocal.filter(withinRadius).map(p => ({
      name: p.name,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      location_verified: p.location_verified,
      is_on_call: p.is_on_call
    }));

    // External sources (Google or OpenStreetMap)
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
      const { data } = await axios.get(url, {
        params: {
          location: `${lat},${lon}`,
          radius: 5000,
          type: 'pharmacy',
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });
      const list = Array.isArray(data.results) ? data.results : [];
      pharmacies = pharmacies.concat(list.map(p => ({
        name: p.name,
        address: p.vicinity,
        latitude: p.geometry?.location?.lat,
        longitude: p.geometry?.location?.lng,
        location_verified: true,
        is_on_call: false
      })));
    } else {
      const query = `[out:json];node["amenity"="pharmacy"](around:5000,${lat},${lon});out center;`;
      const { data } = await axios.post('https://overpass-api.de/api/interpreter',
        `data=${encodeURIComponent(query)}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      const list = Array.isArray(data.elements) ? data.elements : [];
      pharmacies = pharmacies.concat(list.map(n => ({
        name: n.tags?.name || 'Pharmacie',
        address: `${n.tags?.['addr:street'] || ''} ${n.tags?.['addr:housenumber'] || ''}`.trim(),
        latitude: n.lat,
        longitude: n.lon,
        location_verified: true,
        is_on_call: false
      })));
    }

    // Remove potential duplicates
    const unique = new Map();
    pharmacies.forEach(p => {
      const key = `${p.name}_${p.latitude}_${p.longitude}`;
      if (!unique.has(key)) unique.set(key, p);
    });

    res.json(Array.from(unique.values()));
  } catch (err) {
    console.error('pharmacy search error', err.message);
    res.status(500).json({ error: 'Erreur recherche pharmacies' });
  }
});

module.exports = router;
