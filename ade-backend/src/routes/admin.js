const express = require('express');
const router = express.Router();
const { Question, QuestionOption, OptionImpact, DiseasesList, Symptom } = require('../models');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

router.use(auth, adminOnly);

// GET /admin/questions?symptom=...
router.get('/questions', async (req, res) => {
  try {
    const where = {};
    if (req.query.symptom) {
      const sym = await Symptom.findOne({ where: { name: req.query.symptom } });
      if (sym) where.trigger_symptom_id = sym.id; else where.trigger_symptom_id = -1; // no results
    }
    const questions = await Question.findAll({
      where,
      include: [{
        model: QuestionOption,
        as: 'options',
        include: [{ model: OptionImpact, as: 'impacts', include: [DiseasesList] }]
      }]
    });
    res.json(questions);
  } catch (err) {
    console.error('[ADMIN][GET /questions]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /admin/questions
router.post('/questions', async (req, res) => {
  try {
    const { question_text, question_type, trigger_symptom_id } = req.body;
    const q = await Question.create({ question_text, question_type, trigger_symptom_id });
    res.status(201).json(q);
  } catch (err) {
    console.error('[ADMIN][POST /questions]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /admin/questions/:id
router.put('/questions/:id', async (req, res) => {
  try {
    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ error: 'Not found' });
    await q.update({ question_text: req.body.question_text, question_type: req.body.question_type, trigger_symptom_id: req.body.trigger_symptom_id });
    res.json(q);
  } catch (err) {
    console.error('[ADMIN][PUT /questions/:id]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /admin/questions/:id
router.delete('/questions/:id', async (req, res) => {
  try {
    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ error: 'Not found' });
    await q.destroy();
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error('[ADMIN][DELETE /questions/:id]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// OPTIONS CRUD
router.post('/questions/:questionId/options', async (req, res) => {
  try {
    const opt = await QuestionOption.create({ question_id: req.params.questionId, option_label: req.body.option_label });
    res.status(201).json(opt);
  } catch (err) {
    console.error('[ADMIN][POST option]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/options/:id', async (req, res) => {
  try {
    const opt = await QuestionOption.findByPk(req.params.id);
    if (!opt) return res.status(404).json({ error: 'Not found' });
    await opt.update({ option_label: req.body.option_label });
    res.json(opt);
  } catch (err) {
    console.error('[ADMIN][PUT option]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/options/:id', async (req, res) => {
  try {
    const opt = await QuestionOption.findByPk(req.params.id);
    if (!opt) return res.status(404).json({ error: 'Not found' });
    await opt.destroy();
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error('[ADMIN][DELETE option]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Impacts CRUD
router.post('/options/:optionId/impacts', async (req, res) => {
  try {
    const impact = await OptionImpact.create({ option_id: req.params.optionId, disease_id: req.body.disease_id, score_delta: req.body.score_delta });
    res.status(201).json(impact);
  } catch (err) {
    console.error('[ADMIN][POST impact]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/impacts/:id', async (req, res) => {
  try {
    const impact = await OptionImpact.findByPk(req.params.id);
    if (!impact) return res.status(404).json({ error: 'Not found' });
    await impact.update({ disease_id: req.body.disease_id, score_delta: req.body.score_delta });
    res.json(impact);
  } catch (err) {
    console.error('[ADMIN][PUT impact]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/impacts/:id', async (req, res) => {
  try {
    const impact = await OptionImpact.findByPk(req.params.id);
    if (!impact) return res.status(404).json({ error: 'Not found' });
    await impact.destroy();
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error('[ADMIN][DELETE impact]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;