// src/routes/maladies.js
/*const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();

// importe le modèle avec le bon nom
const DiseasesList = require('../models/DiseasesList');

router.get('/', async (req, res) => {
  const { symptomes } = req.query;
  let where = {};

  if (symptomes) {
    const termes = symptomes
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    where = {
      [Op.or]: termes.map(t => ({
        Symptomes: { [Op.like]: `%${t}%` }
      }))
    };
  }

  try {
    const results = await DiseasesList.findAll({ where });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
*/

// src/routes/maladies.js
const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const DiseasesList = require('../models/DiseasesList');

router.get('/', async (req, res) => {
  try {
    const { symptomes } = req.query;

    // si pas de filtre, renvoyer tout (mais limiter à 5)
    if (!symptomes) {
      const all = await DiseasesList.findAll({ limit: 5 });
      return res.json(all);
    }

    // découper et nettoyer les termes
    const terms = symptomes
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    // récupérer les maladies correspondant à au moins 1 terme
    const candidates = await DiseasesList.findAll({
      where: {
        [Op.or]: terms.map(term => ({
          Symptomes: { [Op.like]: `%${term}%` }
        }))
      }
    });

    // calculer le nombre de correspondances pour chaque maladie
    const withCounts = candidates.map(item => {
      const text = (item.Symptomes || '').toLowerCase();
      const count = terms.reduce(
        (acc, t) => acc + (text.includes(t) ? 1 : 0),
        0
      );
      return { item, count };
    });

    // trier :
    // 1) ceux qui matchent tous les termes
    // 2) les autres par nombre de correspondances décroissant
    withCounts.sort((a, b) => {
      const allA = a.count === terms.length;
      const allB = b.count === terms.length;
      if (allA && !allB) return -1;
      if (allB && !allA) return 1;
      return b.count - a.count;
    });

    // ne garder que les 5 premiers
    const top5 = withCounts.slice(0, 5).map(entry => entry.item);

    res.json(top5);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
});

module.exports = router;
