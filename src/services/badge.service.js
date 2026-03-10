const { Badge, InventaireBadge, Partie } = require('../models');
const { Op } = require('sequelize');

/**
 * Vérifie et attribue les badges débloqués par un joueur
 * @param {Object} joueur - L'instance du joueur
 */
exports.verifierBadges = async (joueur) => {
  try {
    // 1. Récupérer tous les badges existants
    const tousLesBadges = await Badge.findAll();
    
    // 2. Récupérer les IDs des badges que le joueur a DÉJÀ
    const badgesAcquis = await InventaireBadge.findAll({
      where: { idJoueur: joueur.idJoueur },
      attributes: ['idBadge']
    });
    const idsBadgesAcquis = badgesAcquis.map(b => b.idBadge);

    // 3. Filtrer les badges potentiels (ceux qu'il n'a pas encore)
    const badgesPotentiels = tousLesBadges.filter(b => !idsBadgesAcquis.includes(b.idBadge));

    const nouveauxBadges = [];

    // 4. Vérifier les conditions pour chaque badge potentiel
    for (const badge of badgesPotentiels) {
      let conditionRemplie = false;

      switch (badge.conditionType) {
        case 'score_total':
          if (joueur.scoreTotal >= badge.conditionValeur) conditionRemplie = true;
          break;
        
        case 'xp_total':
          // Vérifier le total XP du joueur
          if (joueur.totalXP >= badge.conditionValeur) conditionRemplie = true;
          break;
        
        case 'niveau_stage':
          // Vérifier le niveau de stage du joueur
          if (joueur.niveauStage >= badge.conditionValeur) conditionRemplie = true;
          break;
        
        case 'parties_jouees':
          const nbParties = await Partie.count({ where: { idJoueur: joueur.idJoueur, statut: 'termine' } });
          if (nbParties >= badge.conditionValeur) conditionRemplie = true;
          break;

        case 'quiz_parfaits':
          const nbParfaits = await Partie.count({ 
            where: { idJoueur: joueur.idJoueur, progression: 100, statut: 'termine' } 
          });
          if (nbParfaits >= badge.conditionValeur) conditionRemplie = true;
          break;
          
        // Ajoutez d'autres cas ici (ex: "connexions_consecutives")
      }

      // 5. Attribuer le badge si condition remplie
      if (conditionRemplie) {
        await InventaireBadge.create({
          idJoueur: joueur.idJoueur,
          idBadge: badge.idBadge
        });
        
        // Bonus XP du badge
        if (badge.recompenseXP > 0) {
          await joueur.increment('totalXP', { by: badge.recompenseXP });
        }

        nouveauxBadges.push(badge);
      }
    }

    return nouveauxBadges; // Retourne la liste des badges gagnés pour l'affichage

  } catch (error) {
    console.error('Erreur vérification badges:', error);
    return [];
  }
};