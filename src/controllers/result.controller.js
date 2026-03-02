const { Partie, Joueur, Niveau, Badge, InventaireBadge, HistoriqueTransaction, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Sauvegarder les résultats d'un quiz
 * POST /api/results/save
 */
exports.saveResults = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const { 
      score, 
      totalQuestions, 
      totalPoints, 
      xpGained, 
      coinsGained, 
      mode, 
      levelNumber 
    } = req.body;

    // Récupérer le joueur
    const joueur = await Joueur.findOne({ 
      where: { idUser: userId },
      transaction 
    });

    if (!joueur) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    // Calculer le pourcentage de réussite
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    // Créer l'entrée de partie
    const partie = await Partie.create({
      idJoueur: joueur.idJoueur,
      scoreObtenu: totalPoints,
      bonnesReponses: score,
      mauvaisesReponses: totalQuestions - score,
      tempsTotal: 0, // À implémenter si nécessaire
      datePartie: new Date(),
      estTerminee: true,
      modeJeu: mode,
      niveau: levelNumber || null
    }, { transaction });

    // Mettre à jour les XP et coins du joueur
    const oldXP = joueur.pointsXP || 0;
    const newXP = oldXP + xpGained;
    
    // Vérifier si level up
    let levelUp = false;
    let newLevel = joueur.niveauActuel;
    
    // Calculer le nouveau niveau basé sur les XP
    // Exemple: 100 XP = Stage 1, 250 XP = Stage 2, etc.
    const xpThresholds = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700];
    for (let i = xpThresholds.length - 1; i >= 0; i--) {
      if (newXP >= xpThresholds[i]) {
        const calculatedLevel = `Stage ${i + 1}`;
        if (calculatedLevel !== joueur.niveauActuel) {
          levelUp = true;
          newLevel = calculatedLevel;
        }
        break;
      }
    }

    // Mettre à jour le joueur
    await joueur.update({
      pointsXP: newXP,
      coins: (joueur.coins || 0) + coinsGained,
      partiesJouees: (joueur.partiesJouees || 0) + 1,
      partiesGagnees: percentage >= 50 ? (joueur.partiesGagnees || 0) + 1 : joueur.partiesGagnees,
      niveauActuel: newLevel
    }, { transaction });

    // Enregistrer la transaction de coins
    if (coinsGained > 0) {
      await HistoriqueTransaction.create({
        idJoueur: joueur.idJoueur,
        type: 'gain',
        montant: coinsGained,
        description: `Récompense quiz ${mode}${levelNumber ? ' niveau ' + levelNumber : ''}`,
        dateTransaction: new Date()
      }, { transaction });
    }

    // Vérifier les badges à débloquer
    const unlockedBadges = await checkAndUnlockBadges(joueur, {
      score,
      totalQuestions,
      percentage,
      mode,
      levelNumber,
      partiesJouees: joueur.partiesJouees + 1
    }, transaction);

    await transaction.commit();

    res.json({
      success: true,
      message: 'Résultats sauvegardés',
      data: {
        partieId: partie.idPartie,
        xpGained,
        coinsGained,
        totalXP: newXP,
        totalCoins: joueur.coins + coinsGained,
        levelUp,
        newLevel: levelUp ? newLevel : null,
        unlockedBadges
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erreur saveResults:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde des résultats',
      error: error.message
    });
  }
};

/**
 * Historique des résultats du joueur
 * GET /api/results/history
 */
exports.getResultsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const joueur = await Joueur.findOne({ where: { idUser: userId } });
    if (!joueur) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    const parties = await Partie.findAndCountAll({
      where: { 
        idJoueur: joueur.idJoueur,
        estTerminee: true
      },
      order: [['datePartie', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      count: parties.count,
      data: parties.rows
    });

  } catch (error) {
    console.error('Erreur getResultsHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

/**
 * Statistiques du joueur
 * GET /api/results/stats
 */
exports.getPlayerStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const joueur = await Joueur.findOne({ 
      where: { idUtilisateur: userId },
      include: [
        {
          model: Badge,
          as: 'badges',
          through: { attributes: ['dateObtention'] },
          required: false
        }
      ]
    });

    if (!joueur) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    // Calculer les stats
    const totalParties = joueur.partiesJouees || 0;
    const partiesGagnees = joueur.partiesGagnees || 0;
    const winRate = totalParties > 0 ? Math.round((partiesGagnees / totalParties) * 100) : 0;

    // Récupérer les meilleures performances
    const bestScores = await Partie.findAll({
      where: { 
        idJoueur: joueur.idJoueur,
        estTerminee: true
      },
      order: [['scoreObtenu', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        niveau: joueur.niveauActuel || 'Stage 1',
        pointsXP: joueur.pointsXP || 0,
        coins: joueur.coins || 0,
        lives: joueur.vies ?? 5,
        maxUnlockedStage: joueur.maxNiveauDebloque || 1,
        partiesJouees: totalParties,
        partiesGagnees,
        winRate,
        badges: joueur.badges || [],
        bestScores: bestScores.map(p => ({
          score: p.scoreObtenu,
          date: p.datePartie,
          mode: p.modeJeu
        }))
      }
    });

  } catch (error) {
    console.error('Erreur getPlayerStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

/**
 * Vérifie et débloque les badges
 */
async function checkAndUnlockBadges(joueur, stats, transaction) {
  const unlockedBadges = [];
  
  try {
    // Récupérer tous les badges non débloqués
    const allBadges = await Badge.findAll();
    const joueurBadges = await InventaireBadge.findAll({
      where: { idJoueur: joueur.idJoueur }
    });
    const unlockedIds = joueurBadges.map(jb => jb.idBadge);

    for (const badge of allBadges) {
      if (unlockedIds.includes(badge.idBadge)) continue;

      let shouldUnlock = false;
      const condition = badge.conditionObtention?.toLowerCase() || '';

      // Vérifier les conditions
      if (condition.includes('premiere_partie') && stats.partiesJouees === 1) {
        shouldUnlock = true;
      }
      if (condition.includes('10_parties') && stats.partiesJouees >= 10) {
        shouldUnlock = true;
      }
      if (condition.includes('score_parfait') && stats.percentage === 100) {
        shouldUnlock = true;
      }
      if (condition.includes('niveau_10') && stats.levelNumber >= 10) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        await InventaireBadge.create({
          idJoueur: joueur.idJoueur,
          idBadge: badge.idBadge,
          dateObtention: new Date()
        }, { transaction });

        unlockedBadges.push({
          nom: badge.nom,
          description: badge.description,
          icone: badge.icone
        });
      }
    }
  } catch (error) {
    console.error('Erreur checkAndUnlockBadges:', error);
  }

  return unlockedBadges;
}

/**
 * Synchroniser les vies du joueur
 * POST /api/results/sync-lives
 */
exports.syncLives = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const { lives, lastUpdate } = req.body;

    const joueur = await Joueur.findOne({ where: { idUser: userId } });
    if (!joueur) {
      return res.status(404).json({ success: false, message: 'Joueur non trouvé' });
    }

    // Mettre à jour les vies
    await joueur.update({
      vies: lives,
      derniereRegenerationVie: lastUpdate ? new Date(lastUpdate) : new Date()
    });

    res.json({
      success: true,
      message: 'Vies synchronisées',
      data: { lives: joueur.vies }
    });

  } catch (error) {
    console.error('Erreur syncLives:', error);
    res.status(500).json({ success: false, message: 'Erreur synchronisation vies' });
  }
};

/**
 * Synchroniser la progression du joueur
 * POST /api/results/sync-progress
 */
exports.syncProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const { pointsXP, coins, lives, currentStageLevel, maxUnlockedStage } = req.body;

    const joueur = await Joueur.findOne({ where: { idUser: userId } });
    if (!joueur) {
      return res.status(404).json({ success: false, message: 'Joueur non trouvé' });
    }

    // Mettre à jour la progression
    await joueur.update({
      pointsXP: pointsXP ?? joueur.pointsXP,
      coins: coins ?? joueur.coins,
      vies: lives ?? joueur.vies,
      niveauActuel: `Stage ${currentStageLevel}` ?? joueur.niveauActuel,
      maxNiveauDebloque: maxUnlockedStage ?? joueur.maxNiveauDebloque
    });

    res.json({
      success: true,
      message: 'Progression synchronisée',
      data: {
        pointsXP: joueur.pointsXP,
        coins: joueur.coins,
        lives: joueur.vies,
        niveau: joueur.niveauActuel,
        maxUnlockedStage: joueur.maxNiveauDebloque
      }
    });

  } catch (error) {
    console.error('Erreur syncProgress:', error);
    res.status(500).json({ success: false, message: 'Erreur synchronisation progression' });
  }
};

module.exports = exports;
