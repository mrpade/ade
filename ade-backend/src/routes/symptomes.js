const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const { Symptom, DiseasesList, sequelize } = require('../models');

/**
 * GET /api/symptomes?q=fièv
 * Renvoie une liste de symptômes commençant par la chaîne q
 */
router.get('/', async (req, res) => {
  try {
    const { q, full } = req.query;
    if (!q || q.trim() === '') {
      return res.json([]);
    }
    const term = q.trim().toLowerCase();

    const suggestionsRows = await Symptom.findAll({
      where: sequelize.literal(
        `MATCH(name) AGAINST(${sequelize.escape(term + '*')} IN BOOLEAN MODE)`
      ),
      attributes: full ? ['id', 'name'] : ['name'],
      limit: 10
    });

    if (!suggestionsRows.length) {
      const rows = await DiseasesList.findAll({
        attributes: ['Symptomes'],
        where: { Symptomes: { [Op.like]: `%${term}%` } }
      });

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
      const arr = Array.from(set).slice(0, 10);
      if (full) {
        return res.json(arr.map(name => ({ id: null, name })));
      }
      return res.json(arr);
    }
    
    if (full) {
      return res.json(suggestionsRows.map(s => ({ id: s.id, name: s.name })));
    }
    res.json(suggestionsRows.map(s => s.name));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors des suggestions' });
  }
});

module.exports = router;