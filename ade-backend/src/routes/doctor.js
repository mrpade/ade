const router = require('express').Router();
const { Doctor }  = require('../models');
const auth        = require('../middleware/auth');

// PUT /doctors/me/availability  { is_available: true|false }
router.put('/doctors/me/availability', auth, async (req, res) => {
  try {
    const { is_available } = req.body;
    await Doctor.update({ is_available }, { where: { user_id: req.user.userId } });
    res.json({ message: 'Disponibilité mise à jour' });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

// POST /doctors  – utilisé lors de l’onboarding d’un médecin
router.post('/doctors', auth, async (req, res) => {
  try {
    const { speciality, onmc, workplace, bio } = req.body;
    const doctor = await Doctor.create({
      user_id: req.user.userId,
      speciality,
      onmc,
      workplace,
      bio,
      is_available: false
    });
    res.status(201).json(doctor);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

module.exports = router;