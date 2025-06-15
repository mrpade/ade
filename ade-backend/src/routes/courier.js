const router  = require('express').Router();
const { Courier } = require('../models');
const auth     = require('../middleware/auth');

// POST /couriers – onboarding livreur
router.post('/couriers', auth, async (req, res) => {
  try {
    const { vehicle_type, plate_number, driver_license } = req.body;
      const courier = await Courier.create({
        user_id: req.user.id,
      vehicle_type,
      plate_number,
      driver_license,
      is_available: false
    });
    res.status(201).json(courier);
  } catch (e) { res.status(500).json({ error: 'Erreur création livreur' }); }
});

// PUT /couriers/me/availability { is_available: true|false }
router.put('/couriers/me/availability', auth, async (req, res) => {
  try {
    const { is_available } = req.body;
      await Courier.update({ is_available }, { where: { user_id: req.user.id } });
    res.json({ message: 'Disponibilité mise à jour' });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

module.exports = router;