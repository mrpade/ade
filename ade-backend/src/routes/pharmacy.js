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

module.exports = router;