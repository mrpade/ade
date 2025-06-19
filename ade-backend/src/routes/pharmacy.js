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
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Coordonnées manquantes' });
  }
  try {
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const { data } = await axios.get(url, {
      params: {
        location: `${lat},${lon}`,
        radius: 5000,
        type: 'pharmacy',
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    const list = Array.isArray(data.results) ? data.results.slice(0, 10) : [];
    const pharmacies = list.map(p => ({
      name: p.name,
      address: p.vicinity,
      latitude: p.geometry?.location?.lat,
      longitude: p.geometry?.location?.lng,
      location_verified: true,
      is_on_call: false
    }));
    res.json(pharmacies);
  } catch (err) {
    console.error('google maps error', err.message);
    res.status(500).json({ error: 'Erreur recherche pharmacies' });
  }
});

module.exports = router;