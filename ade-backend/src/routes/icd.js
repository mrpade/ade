const express = require('express');
const router = express.Router();
const icdService = require('../services/icdService');

/**
 * GET /api/icd/symptoms?query=...
 * Returns a list of symptom suggestions.
 */
router.get('/symptoms', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);
  try {
    const suggestions = await icdService.searchSymptoms(query);
    res.json(suggestions);
  } catch (err) {
    console.error('ICD search error:', err);
    res.status(500).json({ error: 'Erreur recherche symptômes' });
  }
});

module.exports = router;