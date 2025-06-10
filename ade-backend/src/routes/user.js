const express = require('express');
const router = express.Router();
const { User } = require('../models');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Other user routes (GET by id, POST, PUT, DELETE) as needed

module.exports = router;