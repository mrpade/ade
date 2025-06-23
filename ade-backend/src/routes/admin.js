const express = require('express');
const router = express.Router();
const {
  Question,
  QuestionOption,
  OptionImpact,
  DiseasesList,
  Symptom
} = require('../models');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

router.use(auth, adminOnly);

// GET /admin/symptoms?page=1&perPage=20
router.get('/symptoms', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.perPage, 10) || 20;
    const list = await Symptom.findAll({
      order: [['name', 'ASC']],
      limit: perPage,
      offset: (page - 1) * perPage
    });
    res.json(list);
  } catch (err) {
    console.error('[ADMIN][GET /symptoms]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /admin/symptoms/:id/diseases
router.get('/symptoms/:id/diseases', async (req, res) => {
  try {
    const list = await DiseasesList.findAll({
      include: [{
        model: Symptom,
        through: { attributes: [] },
        where: { id: req.params.id }
      }],
      order: [['Nom', 'ASC']]
    });
    const mapped = list.map(d => ({ id: d.id, name: d.Nom }));
    res.json(mapped);
  } catch (err) {
    console.error('[ADMIN][GET /symptoms/:id/diseases]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

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

// GET /admin/options/:symptomId
router.get('/options/:symptomId', async (req, res) => {
  try {
    const { symptomId } = req.params;
    const options = await QuestionOption.findAll({
      include: [
        {
          model: Question,
          where: { trigger_symptom_id: symptomId },
          attributes: []
        }
      ],
      order: [['option_label', 'ASC']]
    });
    const mapped = options.map(o => ({ id: o.id, text: o.option_label }));
    res.json(mapped);
  } catch (err) {
    console.error('[ADMIN][GET /options/:symptomId]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /admin/scores/:symptomId
router.get('/scores/:symptomId', async (req, res) => {
  try {
    const { symptomId } = req.params;
    const impacts = await OptionImpact.findAll({
      include: [
        DiseasesList,
        {
          model: QuestionOption,
          include: [{ model: Question, where: { trigger_symptom_id: symptomId } }]
        }
      ]
    });
    const result = impacts.map(i => ({
      id: i.id,
      disease_name: i.DiseasesList ? i.DiseasesList.Nom : null,
      value: parseFloat(i.score_delta)
    }));
    res.json(result);
  } catch (err) {
    console.error('[ADMIN][GET /scores/:symptomId]', err);
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
