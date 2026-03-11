/**
 * Migration pour ajouter la colonne 'couleur' à la table badges
 * Exécuter: node src/migrations/addCouleurToBadges.js
 */
const { sequelize, Badge } = require('../models');

async function migrate() {
  try {
    console.log('🔧 Vérification de la colonne couleur...');
    
    // Vérifier si la colonne existe déjà
    const [columns] = await sequelize.query('SHOW COLUMNS FROM badges LIKE \'couleur\'');
    
    if (columns.length === 0) {
      console.log('📦 Ajout de la colonne couleur...');
      await sequelize.query('ALTER TABLE badges ADD COLUMN couleur VARCHAR(20) DEFAULT \'#78909C\'');
      console.log('✅ Colonne couleur ajoutée!');
      
      // Mettre à jour les couleurs par défaut
      const colorMap = {
        'Débutant': '#78909C',
        'Apprenti': '#8B4513',
        'Amateur': '#CD7F32',
        'Expert': '#BDBDBD',
        'Maître': '#E040FB',
        'Légende': '#FFD700',
        'Première Partie': '#4CAF50',
        'Joueur Régulier': '#2196F3',
        'Passionné': '#FF5722',
        'Acharné': '#9C27B0',
        'Sans Faute': '#00BCD4',
        'Perfectionniste': '#FFC107',
        'Stage 5': '#8BC34A',
        'Stage 10': '#3F51B5',
        'Stage 20': '#E91E63'
      };
      
      const badges = await Badge.findAll();
      for (const badge of badges) {
        const color = colorMap[badge.nom] || '#78909C';
        await badge.update({ couleur: color });
        console.log(`  ${badge.nom} -> ${color}`);
      }
      console.log('✅ Couleurs mises à jour!');
    } else {
      console.log('✅ La colonne couleur existe déjà.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

migrate();
