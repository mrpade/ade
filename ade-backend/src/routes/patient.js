const router = require('express').Router();
const { Patient } = require('../models');
const auth = require('../middleware/auth');

router.put('/patients/me', auth, async (req, res) => {
  const { height_cm, weight_kg, medical_history, emergency_contact } = req.body;
  try {
    await Patient.upsert({
      user_id: req.user.id,
      height_cm,
      weight_kg,
      medical_history,
      emergency_contact
    });
    res.json({ message: 'Profil patient mis à jour' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
module.exports = router;