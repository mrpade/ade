// src/routes/moncompte.js
const express = require('express');
const router  = express.Router();
const { User } = require('../models');

// GET /api/moncompte  → renvoie les infos du user authentifié
router.get('/', async (req, res) => {
  try {
    // req.user a été rempli par le middleware auth
    const user = await User.findByPk(req.user.userId, {
            attributes: [
              'id',
              'email',
              'first_name',
              'last_name',
              'birthdate',
              'createdAt'  // ou 'createdAt' si tu utilises camelCase
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