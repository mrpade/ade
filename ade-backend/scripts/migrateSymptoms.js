require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { sequelize, DiseasesList, Symptom, DiseaseSymptom } = require('../src/models');

(async () => {
  const t = await sequelize.transaction();
  try {
    const diseases = await DiseasesList.findAll({ transaction: t });
    for (const disease of diseases) {
      const list = (disease.Symptomes || '')
        .split(/[,;]+/)
        .map(s => s.trim())
        .filter(Boolean);
      for (const symName of list) {
        const [symptom] = await Symptom.findOrCreate({
          where: { name: symName },
          defaults: { name: symName },
          transaction: t
        });
        await DiseaseSymptom.findOrCreate({
          where: { disease_id: disease.id, symptom_id: symptom.id },
          defaults: { disease_id: disease.id, symptom_id: symptom.id },
          transaction: t
        });
      }
    }
    await t.commit();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    await t.rollback();
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();