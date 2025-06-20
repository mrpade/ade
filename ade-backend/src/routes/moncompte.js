// src/routes/moncompte.js
const express = require('express');
const router  = express.Router();
const { User } = require('../models');

// GET /api/moncompte  → renvoie les infos du user authentifié
router.get('/', async (req, res) => {
  try {
    // req.user a été rempli par le middleware auth
    // l'auth middleware renseigne req.user.id
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'id',
        'email',
        'first_name',
        'last_name',
        'birthdate',
        'created_at'
      ]
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;