const sequelize = require('../config/database');

(async () => {
  try {
    const [results] = await sequelize.query('SHOW TABLES LIKE "sous_categories"');
    if (results.length > 0) {
      console.log('✅ Table sous_categories existe');
    } else {
      console.log('❌ Table sous_categories n\'existe pas - création en cours...');
      // Créer la table directement
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS sous_categories (
          id_sous_categorie INT AUTO_INCREMENT PRIMARY KEY,
          id_categorie INT NOT NULL,
          nom VARCHAR(100) NOT NULL,
          description TEXT,
          icone VARCHAR(500),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (id_categorie) REFERENCES categories(id_categorie) ON DELETE CASCADE,
          UNIQUE KEY unique_sous_cat (id_categorie, nom)
        )
      `);
      console.log('✅ Table sous_categories créée!');
    }
    process.exit(0);
  } catch(e) {
    console.error('❌ Erreur:', e.message);
    process.exit(1);
  }
})();
