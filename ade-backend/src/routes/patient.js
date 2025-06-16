const router = require('express').Router();
const { User, Patient, Check, Diagnosis, Doctor, DiseasesList, Consultation } = require('../models');
const auth = require('../middleware/auth');

function calcAge(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

// GET /patient/profile – infos du patient connecté
router.get('/patient/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['first_name', 'last_name', 'birthdate']
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    res.json({
      firstName: user.first_name,
      lastName: user.last_name,
      age: calcAge(user.birthdate),
      gender: patient ? patient.gender : null
    });
  } catch (err) {
    console.error('patient profile fetch error', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /patient/checks – liste des checks du patient connecté
router.get('/patient/checks', auth, async (req, res) => {
  try {
    const list = await Check.findAll({
      include: [
        {
          model: Diagnosis,
          where: { patient_id: req.user.id },
          include: [{ model: DiseasesList, as: 'disease', attributes: ['Nom'] }]
        },
        {
          model: Doctor,
          include: [{ model: User, as: 'account', attributes: ['first_name', 'last_name', 'role'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const mapped = list.map(c => ({
      id: c.id,
      doctorName: c.Doctor && c.Doctor.account
        ? `${c.Doctor.account.first_name} ${c.Doctor.account.last_name}`
        : '',
      doctorSpecialty: c.Doctor ? c.Doctor.speciality : '',
      symptoms: Array.isArray(c.Diagnosis.symptoms_json)
        ? c.Diagnosis.symptoms_json.join(', ')
        : (c.Diagnosis.symptoms_json ? JSON.parse(c.Diagnosis.symptoms_json).join(', ') : ''),
      result: c.Diagnosis.disease ? c.Diagnosis.disease.Nom : '',
      notes: c.answer || ''
    }));
    res.json(mapped);
  } catch (err) {
    console.error('patient checks fetch error', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /patient/appointments – rendez-vous du patient connecté
router.get('/patient/appointments', auth, async (req, res) => {
  try {
    const list = await Consultation.findAll({
      where: { patient_id: req.user.id },
      include: [{
        model: Doctor,
        include: [{ model: User, as: 'account', attributes: ['first_name', 'last_name'] }]
      }],
      order: [['scheduled_at', 'DESC']]
    });

    const mapped = list.map(rdv => ({
      id: rdv.id,
      doctorName: rdv.Doctor && rdv.Doctor.account
        ? `${rdv.Doctor.account.first_name} ${rdv.Doctor.account.last_name}`
        : '',
      doctorSpecialty: rdv.Doctor ? rdv.Doctor.speciality : '',
      notes: '',
      time: rdv.scheduled_at
    }));
    res.json(mapped);
  } catch (err) {
    console.error('patient appointments fetch error', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

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