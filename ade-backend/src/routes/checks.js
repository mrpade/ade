const router = require('express').Router();
const { Check, Diagnosis } = require('../models');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { disease_id, symptoms = [], doctor_user_id } = req.body;
    if (!disease_id || !doctor_user_id) {
      return res.status(400).json({ error: 'disease_id et doctor_user_id requis' });
    }
    const diagnosis = await Diagnosis.create({
      patient_id: req.user.id,
      disease_id,
      symptoms_json: JSON.stringify(symptoms),
      status: 'pending'
    });
    const check = await Check.create({
      diagnosis_id: diagnosis.id,
      doctor_user_id
    });
    res.status(201).json(check);
  } catch (err) {
    console.error('create check error', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
