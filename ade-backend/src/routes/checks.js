const router = require('express').Router();
const { Check, Diagnosis } = require('../models');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const {
      disease_id: rawDisease,
      symptoms = [],
      doctor_user_id: rawDoctor
    } = req.body;

    const disease_id = parseInt(rawDisease, 10);
    const doctor_user_id = parseInt(rawDoctor, 10);

    if (!disease_id || !doctor_user_id) {
      return res
        .status(400)
        .json({ error: 'disease_id et doctor_user_id requis' });
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

// PUT /checks/:id - update doctor's answer on a check
router.put('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { answer } = req.body;
    if (!id || !answer) {
      return res.status(400).json({ error: 'id et answer requis' });
    }
    const [updated] = await Check.update(
      { answer },
      { where: { id, doctor_user_id: req.user.id } }
    );
    if (!updated) return res.status(404).json({ error: 'Check non trouvé' });
    res.json({ message: 'Réponse enregistrée' });
  } catch (err) {
    console.error('update check error', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;