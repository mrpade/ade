const express = require('express');
const router = express.Router();
const { Doctor, User, Check, Diagnosis, DiseasesList }  = require('../models');
const auth        = require('../middleware/auth');

// GET /doctors/me
router.get('/me', auth, async (req, res) => {
  try {
    // Assurer que l’ID utilisateur est bien défini (payload JWT peut utiliser userId)
    const userId = req.user.id || req.user.userId;
    if (!userId) return res.status(400).json({ error: 'ID utilisateur manquant' });
    const doctor = await Doctor.findOne({ where: { user_id: userId } });
    if (!doctor) return res.status(404).json({ error: 'Médecin non trouvé' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /doctors/available – liste des médecins connectés disponibles
router.get('/available', async (req, res) => {
  try {
    const list = await Doctor.findAll({
      where: { is_available: true },
      include: [{ model: User, as: 'account', attributes: ['first_name', 'last_name'] }]
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /doctors/me/availability  { is_available: true|false }
// Mounted at /api/doctors so the final path is /api/doctors/me/availability
router.put('/me/availability', auth, async (req, res) => {
  try {
    const { is_available } = req.body;
    await Doctor.update({ is_available }, { where: { user_id: req.user.id } });
    res.json({ message: 'Disponibilité mise à jour' });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

// POST /doctors  – utilisé lors de l’onboarding d’un médecin
router.post('/', auth, async (req, res) => {
  try {
    const { speciality, onmc, workplace, bio } = req.body;
    const doctor = await Doctor.create({
      user_id: req.user.id,
      speciality,
      onmc,
      workplace,
      bio,
      is_available: false
    });
    res.status(201).json(doctor);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

router.get('/me/checks', auth, async (req, res) => {
  try {
    const checks = await Check.findAll({
      where: { doctor_user_id: req.user.id },
      include: [{
        model: Diagnosis,
        include: [
          { model: User, as: 'patient', attributes: ['first_name', 'last_name', 'birthdate'] },
          { model: DiseasesList, as: 'disease', attributes: ['Nom'] }
        ]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(checks);
  } catch (err) {
    console.error('fetch doctor checks error', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;