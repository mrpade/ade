const router     = require('express').Router();
const { Diagnosis } = require('../models');
const auth       = require('../middleware/auth');

// POST /diagnoses  { disease_id, symptoms }
router.post('/diagnoses', auth, async (req, res) => {
  try {
    const { disease_id, symptoms } = req.body; // symptoms = array of strings
    const diag = await Diagnosis.create({
        patient_id: req.user.id,
      disease_id,
      symptoms_json: JSON.stringify(symptoms),
      status: 'pending'
    });
    res.status(201).json(diag);
  } catch (e) { res.status(500).json({ error: 'Erreur création diagnostic' }); }
});

// GET /diagnoses/me – diagnostics du patient connecté
router.get('/diagnoses/me', auth, async (req, res) => {
  const list = await Diagnosis.findAll({ where: { patient_id: req.user.id }, order: [['created_at','DESC']] });
  res.json(list);
});

module.exports = router;