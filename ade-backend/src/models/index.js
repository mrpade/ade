// src/models/index.js
/*const { Sequelize } = require('sequelize');
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
  

module.exports = sequelize;*/
// Teste la connexion à la BDD

 'use strict';
 require('dotenv').config();
 const fs        = require('fs');
 const path      = require('path');
 const Sequelize = require('sequelize');
 const basename  = path.basename(__filename);
 const db        = {};

 // Configuration Sequelize à partir des variables d'environnement
 const sequelize = new Sequelize(
   process.env.DB_NAME,
   process.env.DB_USER,
   process.env.DB_PASS,
   {
     host: process.env.DB_HOST,
     port: process.env.DB_PORT,
     dialect: 'mysql',
     logging: false,
   }
 );

 // Chargement dynamique de tous les modèles dans ce dossier
 fs.readdirSync(__dirname)
   .filter(file => {
     return (
       file.indexOf('.') !== 0 &&
       file !== basename &&
       file.slice(-3) === '.js'
     );
   })
   .forEach(file => {
     const modelDef = require(path.join(__dirname, file));
     const model = modelDef(sequelize, Sequelize.DataTypes);
     db[model.name] = model;
   });

 // Mise en place des associations, si définies dans chaque modèle
 Object.keys(db).forEach(modelName => {
   if (db[modelName].associate) {
     db[modelName].associate(db);
   }
 });

 // Ajout de l’instance Sequelize et de la classe Sequelize au module exporté
 db.sequelize = sequelize;
 db.Sequelize = Sequelize;

 // Export final : objet contenant tous les modèles + sequelize
 module.exports = db;