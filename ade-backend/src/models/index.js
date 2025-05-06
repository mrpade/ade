// src/models/index.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialise la connexion à partir des vars d'env
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,    // <— assure-toi que c’est là
      dialect: 'mysql',
      logging: false,
    }
  );
  

module.exports = sequelize;
// Teste la connexion à la BDD