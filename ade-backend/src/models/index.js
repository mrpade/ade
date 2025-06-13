
 'use strict';
 require('dotenv').config();
 const fs        = require('fs');
 const path      = require('path');
 const { Sequelize, DataTypes } = require('sequelize');
 const basename  = path.basename(__filename);

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
 /*fs.readdirSync(__dirname)
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
*/

const db = { sequelize, Sequelize };

// Chargement des modèles
db.User        = require('./User')(sequelize, DataTypes);
db.Doctor      = require('./Doctor')(sequelize, DataTypes);
db.Pharmacy    = require('./Pharmacy')(sequelize, DataTypes);
db.Courier     = require('./Courier')(sequelize, DataTypes);
db.Patient     = require('./patient')(sequelize, DataTypes);
db.Diagnosis   = require('./Diagnosis')(sequelize, DataTypes);
db.DiseasesList = require('./DiseasesList')(sequelize, DataTypes);
db.Consultation = require('./Consultation')(sequelize, DataTypes);
db.Prescription = require('./Prescription')(sequelize, DataTypes);
db.Product      = require('./Product')(sequelize, DataTypes);
db.PharmacyStock = require('./PharmacyStock')(sequelize, DataTypes);
db.Order        = require('./Order')(sequelize, DataTypes);
db.OrderItem    = require('./OrderItem')(sequelize, DataTypes);
db.Delivery     = require('./Delivery')(sequelize, DataTypes);
db.Check        = require('./Check')(sequelize, DataTypes);

 // Mise en place des associations, si définies dans chaque modèle
 Object.keys(db).forEach(name => {
  const model = db[name];
  if (model && model.associate) model.associate(db);
});

 // Ajout de l’instance Sequelize et de la classe Sequelize au module exporté
 db.sequelize = sequelize;
 db.Sequelize = Sequelize;

 // Export final : objet contenant tous les modèles + sequelize
 module.exports = db;