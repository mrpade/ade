// 1. Variables d'environnement
require('dotenv').config();

// 2. Imports
const express = require('express');
const cors = require('cors');
// Lancement du cleanup cron
require('./services/cleanup')

// 3. ORM & modèles
const { sequelize, DiseasesList, User } = require('./models');
//const { sequelize, DiseasesList, User /* autres modèles nécessaires */ } = require('./models');


// 4. Routes
const auth = require('./middleware/auth');
const authRouter = require('./routes/auth');
const maladiesRouter = require('./routes/maladies');        // route GET /api/maladies
const symptomesRouter = require('./routes/symptomes');
const doctorRouter = require('./routes/doctors');      // route GET /api/symptomes
const monCompteRouter  = require('./routes/moncompte')
const userRouter = require('./routes/user'); // route GET /api/users


// 5. App Express
const app = express();
const PORT = process.env.PORT || 4000;

// 6. Middlewares
//app.use(cors());
app.use(cors({ origin: 'http://localhost:5173' }));
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
app.use('/api/doctors', doctorRouter); // route GET /api/doctors
app.use('/api/users', userRouter);

// 9. Connexion à la BDD, synchronisation des modèles, puis démarrage du serveur
(async () => {
  try {
    // 9.1 Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la BDD réussie');

    // 9.2 Synchroniser les modèles
    // Utiliser les migrations pour modifier la structure afin d'éviter la multiplication des index
    await sequelize.sync();
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

// Update maladies route to sort by match count
/*const { Op } = require('sequelize');
const DiseasesList = require('./models/DiseasesList');
app.get('/api/maladies', async (req, res) => {
  const terms = req.query.symptomes
    ? req.query.symptomes.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    : [];

  try {
    const diseases = await DiseasesList.findAll();
    const scored = diseases.map(d => {
      const text = d.Symptomes.toLowerCase();
      const matchCount = terms.reduce((acc, t) => acc + (text.includes(t) ? 1 : 0), 0);
      return { disease: d, matchCount };
    });
    scored.sort((a, b) => b.matchCount - a.matchCount);
    res.json(scored.map(r => r.disease));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});*/
