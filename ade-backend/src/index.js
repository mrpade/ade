// src/index.js

// 1. Variables d'environnement
require('dotenv').config();

// 2. Imports
const express = require('express');
const cors = require('cors');

// 3. ORM & modèles
const sequelize = require('./models');
const DiseasesList = require('./models/DiseasesList');
const User = require('./models/User'); // nouveau modèle


// 4. Routes
const auth = require('./middleware/auth');
const authRouter = require('./routes/auth');
const maladiesRouter = require('./routes/maladies');        // route GET /api/maladies
const symptomesRouter = require('./routes/symptomes');      // route GET /api/symptomes
const monCompteRouter  = require('./routes/moncompte')

// 5. App Express
const app = express();
const PORT = process.env.PORT || 4000;

// 6. Middlewares
app.use(cors());
app.use(express.json());

// 7. Route racine
app.get('/', (req, res) => {
  res.json({ message: 'API ADE – OK' });
});

// 8. Monte les routes
/*app.use('/api/maladies', maladiesRouter);*/
// protège la route moncompte par le middleware auth
app.use('/api/moncompte', auth, monCompteRouter);
app.use('/api/maladies', maladiesRouter);
app.use('/api/symptomes', symptomesRouter);
app.use('/api/auth', authRouter);
app.use('/api/auth', require('./routes/auth'));

// 9. Connexion à la BDD, synchronisation des modèles, puis démarrage du serveur
(async () => {
  try {
    // 9.1 Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la BDD réussie');

    // 9.2 Synchroniser les modèles (alter : true met à jour la structure sans perdre de données)
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');

    // 9.3 Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🟢 Serveur Express démarré sur http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Échec initialisation serveur/BDD :', err);
    process.exit(1);
  }
})();
