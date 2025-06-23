const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const { DiseasesList, Symptom, DiseaseSymptom, Question, QuestionOption, OptionImpact } = require('../models');
const { get: levenshtein } = require('fast-levenshtein');


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

    const searchQuery = terms.map(t => `+${t}*`).join(' ');

    const matchedSymptoms = await Symptom.findAll({
      where: Symptom.sequelize.literal(
        `MATCH(name) AGAINST(${Symptom.sequelize.escape(searchQuery)} IN BOOLEAN MODE)`
      ),
      attributes: ['id']
    });

    const symptomIds = matchedSymptoms.map(s => s.id);
    let candidates;
    if (symptomIds.length) {
      const linkRows = await DiseaseSymptom.findAll({
        where: { symptom_id: { [Op.in]: symptomIds } }
      });

      const diseaseIds = [...new Set(linkRows.map(r => r.disease_id))];

      candidates = await DiseasesList.findAll({
        where: { id: { [Op.in]: diseaseIds } },
        include: [{ model: Symptom, attributes: ['name'], through: { attributes: [] } }]
      });
    } else {
      // fallback for legacy data without normalized symptoms
      candidates = await DiseasesList.findAll({
        where: {
          [Op.or]: terms.map(term => ({
            Symptomes: { [Op.like]: `%${term}%` }
          }))
        }
      });
    }

    const scored = candidates.map(item => {
      let itemSyms;
      if (item.Symptoms && item.Symptoms.length) {
        itemSyms = item.Symptoms.map(s => s.name.toLowerCase());
      } else {
        itemSyms = (item.Symptomes || '')
          .toLowerCase()
          .split(/[,;]+/)
          .map(s => s.trim())
          .filter(Boolean);
      }
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

// POST /maladies/interactive
router.post('/interactive', async (req, res) => {
  try {
    const { symptoms = [], responses = [] } = req.body;

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: 'symptoms array required' });
    }

    const terms = symptoms.map(s => String(s).trim().toLowerCase()).filter(Boolean);
    const searchQuery = terms.map(t => `+${t}*`).join(' ');

    const matchedSymptoms = await Symptom.findAll({
      where: Symptom.sequelize.literal(
        `MATCH(name) AGAINST(${Symptom.sequelize.escape(searchQuery)} IN BOOLEAN MODE)`
      ),
      attributes: ['id']
    });

    const symptomIds = matchedSymptoms.map(s => s.id);
    const linkRows = await DiseaseSymptom.findAll({
      where: { symptom_id: { [Op.in]: symptomIds } }
    });
    const diseaseIds = [...new Set(linkRows.map(r => r.disease_id))];

    const candidates = await DiseasesList.findAll({
      where: { id: { [Op.in]: diseaseIds } },
      include: [{ model: Symptom, attributes: ['name'], through: { attributes: [] } }]
    });

    const scored = candidates.map(item => {
      const itemSyms = item.Symptoms.map(s => s.name.toLowerCase());
      const matchCount = terms.reduce((acc, t) => acc + (itemSyms.includes(t) ? 1 : 0), 0);
      const diffScore = 1 - Math.min(Math.abs(itemSyms.length - terms.length) / Math.max(itemSyms.length, terms.length), 1);
      const spellTotal = terms.reduce((acc, term) => {
        const best = itemSyms.reduce((max, sym) => Math.max(max, similarity(term, sym)), 0);
        return acc + best;
      }, 0);
      const spellScore = terms.length ? spellTotal / terms.length : 0;
      const countScore = terms.length ? (matchCount / terms.length) * diffScore : 0;
      const baseScore = (0.7 * countScore + 0.3 * spellScore) * 5;
      return { item, score: baseScore };
    });

    if (responses.length) {
      const optIds = responses.map(r => r.optionId).filter(Boolean);
      if (optIds.length) {
        const impacts = await OptionImpact.findAll({ where: { option_id: { [Op.in]: optIds } } });
        scored.forEach(s => {
          const totalDelta = impacts
            .filter(i => i.disease_id === s.item.id)
            .reduce((acc, i) => acc + parseFloat(i.score_delta), 0);
          s.score += totalDelta;
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    const diseases = scored.slice(0, 6).map(({ item, score }) => ({
      ...item.toJSON(),
      score: Number(score.toFixed(2))
    }));

    const questions = await Question.findAll({
      where: { trigger_symptom_id: { [Op.in]: symptomIds } },
      include: [{ model: QuestionOption, as: 'options' }]
    });

    const answered = responses.map(r => r.questionId);
    const nextQuestions = questions.filter(q => !answered.includes(q.id));

    res.json({ diseases, questions: nextQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la recherche interactive' });
  }
});

module.exports = router;