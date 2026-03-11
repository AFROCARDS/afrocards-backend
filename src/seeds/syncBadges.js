/**
 * Script de synchronisation des badges pour les joueurs existants
 * Ce script vérifie les stats de chaque joueur et leur attribue les badges mérités
 * 
 * Exécuter avec: node src/seeds/syncBadges.js
 */

require('dotenv').config();
const { Joueur, Badge, InventaireBadge, sequelize } = require('../models');

async function syncBadges() {
  try {
    await sequelize.authenticate();
    console.log('📦 Connexion à la base de données établie');

    // Récupérer tous les badges
    const allBadges = await Badge.findAll();
    console.log(`🏅 ${allBadges.length} badges trouvés dans la base`);

    // Récupérer tous les joueurs avec leurs stats
    const joueurs = await Joueur.findAll({
      attributes: ['idJoueur', 'pseudo', 'pointsXP', 'partiesJouees', 'niveauStage']
    });
    console.log(`👥 ${joueurs.length} joueurs à vérifier`);

    let totalBadgesAttribues = 0;

    for (const joueur of joueurs) {
      // Récupérer les badges déjà débloqués par ce joueur
      const joueurBadges = await InventaireBadge.findAll({
        where: { idJoueur: joueur.idJoueur }
      });
      const unlockedIds = joueurBadges.map(jb => jb.idBadge);

      const stats = {
        totalXP: joueur.pointsXP || 0,
        partiesJouees: joueur.partiesJouees || 0,
        stageLevel: joueur.niveauStage || 1
      };

      let badgesAttribues = 0;

      for (const badge of allBadges) {
        // Ignorer si déjà débloqué
        if (unlockedIds.includes(badge.idBadge)) continue;

        let shouldUnlock = false;
        const conditionType = badge.conditionType?.toLowerCase() || '';
        const conditionValeur = badge.conditionValeur || 0;

        switch (conditionType) {
          case 'parties_jouees':
            if (stats.partiesJouees >= conditionValeur) {
              shouldUnlock = true;
            }
            break;
          case 'xp_total':
            if (stats.totalXP >= conditionValeur) {
              shouldUnlock = true;
            }
            break;
          case 'niveau_stage':
            if (stats.stageLevel >= conditionValeur) {
              shouldUnlock = true;
            }
            break;
          // quiz_parfaits sera géré automatiquement lors des prochaines parties
        }

        if (shouldUnlock) {
          await InventaireBadge.create({
            idJoueur: joueur.idJoueur,
            idBadge: badge.idBadge,
            dateObtention: new Date()
          });
          badgesAttribues++;
          totalBadgesAttribues++;
        }
      }

      if (badgesAttribues > 0) {
        console.log(`  ✅ ${joueur.pseudo}: ${badgesAttribues} badge(s) attribué(s) (XP: ${stats.totalXP}, Parties: ${stats.partiesJouees}, Stage: ${stats.stageLevel})`);
      }
    }

    console.log('');
    console.log(`🎉 Synchronisation terminée : ${totalBadgesAttribues} badge(s) attribué(s) au total`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    process.exit(1);
  }
}

syncBadges();
