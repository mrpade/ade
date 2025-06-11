// src/routes/symptomes.js
const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const DiseasesList = require('../models');

/**
 * GET /api/symptomes?q=fièv
 * Renvoie une liste de symptômes commençant par la chaîne q
 */
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json([]);
    }
    const term = q.trim().toLowerCase();

    // Récupère tous les champs Symptomes qui contiennent la sous-chaîne
    const rows = await DiseasesList.findAll({
      attributes: ['Symptomes']
      , where: {
        Symptomes: { [Op.like]: `%${term}%` }
      }
    });

    // Explose et collecte les valeurs distinctes commençant par `term`
    const set = new Set();
    rows.forEach(r => {
      (r.Symptomes || '')
        .split(',')
        .map(s => s.trim())
        .forEach(s => {
          if (s.toLowerCase().startsWith(term)) {
            set.add(s);
          }
        });
    });

    // Limite à 10 suggestions maximum
    const suggestions = Array.from(set).slice(0, 10);
    res.json(suggestions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors des suggestions' });
  }
});

module.exports = router;
