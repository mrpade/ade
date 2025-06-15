// src/services/cleanup.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const { User }   = require('../models');

// Planification : chaque jour à 3h du matin
cron.schedule('0 3 * * *', async () => {
  try {
    const [affected] = await User.update(
      { reset_token: null, reset_expires: null },
      { where: { reset_expires: { [Op.lt]: new Date() } } }
    );
    console.log(`Cleanup cron: ${affected} expired tokens cleared.`);
  } catch (err) {
    console.error('Error during cleanup cron:', err);
  }
});
