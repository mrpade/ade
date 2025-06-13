const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const { DiseasesList } = require('../models');

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const distance = levenshtein(a.toLowerCase(), b.toLowerCase());
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

router.get('/', async (req, res) => {
  try {
    const { symptomes } = req.query;

    // si pas de filtre ou vide, renvoyer tout (mais limiter à 5)
    if (!symptomes || symptomes.trim() === '') {
      const all = await DiseasesList.findAll({ limit: 6 });
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

    const scored = candidates.map(item => {
      const itemSyms = (item.Symptomes || '')
        .toLowerCase()
        .split(/[,;]+/)
        .map(s => s.trim())
        .filter(Boolean);

      const matchCount = terms.reduce(
        (acc, t) => acc + (itemSyms.includes(t) ? 1 : 0),
        0
      );

      const diffScore = 1 - Math.min(
        Math.abs(itemSyms.length - terms.length) /
          Math.max(itemSyms.length, terms.length),
        1
      );

      const spellTotal = terms.reduce((acc, term) => {
        const best = itemSyms.reduce(
          (max, sym) => Math.max(max, similarity(term, sym)),
          0
        );
        return acc + best;
      }, 0);
      const spellScore = terms.length ? spellTotal / terms.length : 0;

      const countScore = terms.length
        ? (matchCount / terms.length) * diffScore
        : 0;

      const finalScore = (0.7 * countScore + 0.3 * spellScore) * 5;

      return { item, score: finalScore };
    });

    scored.sort((a, b) => b.score - a.score);

    const top6 = scored.slice(0, 6).map(({ item, score }) => ({
      ...item.toJSON(),
      score: Number(score.toFixed(2))
    }));

    res.json(top6);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
});

module.exports = router;