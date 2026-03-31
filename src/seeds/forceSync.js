const sequelize = require('../config/database');

(async () => {
  try {
    console.log('🔄 Chargement des modèles avec associations...');
    // Les modèles et associations sont automatiquement chargés lors du require
    require('../models');
    
    console.log('🔄 Vérification initiale des tables...');
    const tables = await sequelize.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'afrocards_db' AND TABLE_NAME = 'sous_categories'`);
    
    if (tables[0].length === 0) {
      console.log('⚠️ Table sous_categories n\'existe pas - création forcée...');
      await sequelize.sync({ force: false, alter: true });
    } else {
      console.log('✅ Table sous_categories existe déjà');
    }
    
    // Double-check
    const tablesAfter = await sequelize.query(`SHOW TABLES LIKE 'sous_categories'`);
    if (tablesAfter[0].length > 0) {
      console.log('✅ Table sous_categories confirmée dans la base de données!');
    } else {
      console.log('❌ Impossible de créer la table');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
})();
