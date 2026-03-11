/**
 * Script pour nettoyer toutes les parties fictives et garder seulement les vraies données
 * Exécution: node src/seeds/cleanHistorique.js
 */

const sequelize = require('../config/database');
const { Partie } = require('../models');

async function cleanHistorique() {
  try {
    console.log('🔄 Nettoyage de l\'historique des parties fictives...\n');

    // Récupérer le nombre de parties avant
    const countBefore = await Partie.count();
    console.log(`📊 Parties avant nettoyage: ${countBefore}`);

    // Supprimer TOUTES les parties (repartir de zéro)
    // Les vraies données viendront uniquement des vraies parties jouées
    const result = await sequelize.query('DELETE FROM parties;');
    
    // Reset auto-increment
    await sequelize.query('ALTER TABLE parties AUTO_INCREMENT = 1;');

    console.log('\n✅ Toutes les parties ont été supprimées');
    console.log('✅ Auto-increment réinitialisé');
    console.log('\n📝 À partir de maintenant:');
    console.log('   • L\'historique contiendra uniquement les vraies parties jouées');
    console.log('   • Chaque jeu créera une vraie entrée dans la base de données');
    console.log('   • Pas de données fictives');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

cleanHistorique();
