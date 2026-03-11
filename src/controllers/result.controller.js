const { Partie, Joueur, Niveau, Badge, InventaireBadge, HistoriqueTransaction, Notification, sequelize } = require('../models');
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

    console.log('✅ [SaveResults] ENDPOINT CALLED');
    console.log('📝 [SaveResults] userId:', userId, 'token user:', req.user.email);
    console.log('📝 [SaveResults] Body:', { score, totalQuestions, totalPoints, xpGained, coinsGained, mode, levelNumber });

    // Récupérer le joueur
    const joueur = await Joueur.findOne({ 
      where: { idUtilisateur: userId },
      transaction 
    });

    if (!joueur) {
      console.log('❌ [SaveResults] Joueur NOT FOUND for idUtilisateur:', userId);
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    console.log('✅ [SaveResults] Joueur found:', joueur.pseudo, 'idJoueur:', joueur.idJoueur);

    // Calculer le pourcentage de réussite
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    // Créer l'entrée de partie
    const partie = await Partie.create({
      idJoueur: joueur.idJoueur,
      score: totalPoints,
      bonnesReponses: score,
      totalQuestions: totalQuestions,
      tempsTotal: 0,
      dateDebut: new Date(),
      dateFin: new Date(),
      statut: 'termine',
      modeJeu: mode,
      niveauStage: levelNumber || null,
      xpGagne: xpGained,
      coinsGagnes: coinsGained
    }, { transaction });

    console.log('✅ [SaveResults] Game created - idPartie:', partie.idPartie, 'statut:', partie.statut, 'modeJeu:', partie.modeJeu);

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
      partiesJouees: joueur.partiesJouees + 1,
      totalXP: newXP,
      stageLevel: joueur.niveauStage || 1
    }, transaction);

    await transaction.commit();

    console.log('✅ [SaveResults] Transaction COMMITTED successfully');
    console.log('✅ [SaveResults] RESPONSE: partieId=' + partie.idPartie + ', xp=' + xpGained + ', coins=' + coinsGained);

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
    console.error('❌ [SaveResults] ERROR:', error.message);
    console.error('❌ [SaveResults] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde des résultats',
      error: error.message
    });
  }
};

/**
 * Historique complet de toute l'activité de jeu du joueur
 * GET /api/results/history
 */
exports.getResultsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 100, offset = 0 } = req.query;

    console.log('📋 [History] Fetching for userId:', userId);

    const joueur = await Joueur.findOne({ where: { idUtilisateur: userId } });
    if (!joueur) {
      console.error('❌ [History] Joueur not found for userId:', userId);
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    console.log('✅ [History] Found joueur:', joueur.idJoueur, joueur.pseudo);

    // 1. Récupérer toutes les PARTIES (Stage, Fiesta, Duels, etc.)
    const parties = await Partie.findAll({
      where: { 
        idJoueur: joueur.idJoueur,
        statut: 'termine'
      },
      include: [
        {
          model: Joueur,
          as: 'adversaire',
          attributes: ['idJoueur', 'pseudo', 'avatarURL'],
          required: false
        }
      ],
      order: [['dateFin', 'DESC'], ['dateDebut', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('📊 [History] Found', parties.length, 'terminated games for user');

    // Formatter les parties
    const formattedParties = parties.map(partie => {
      const obj = partie.toJSON();
      return {
        activityId: obj.idPartie,
        type: 'partie',
        modeJeu: obj.modeJeu || 'Stage',
        datePartie: obj.dateFin || obj.dateDebut,
        dateFin: obj.dateFin || obj.dateDebut,
        bonnesReponses: obj.bonnesReponses || 0,
        totalQuestions: obj.totalQuestions || 10,
        xpGagne: obj.xpGagne || 0,
        coinsGagnes: obj.coinsGagnes || 0,
        niveauStage: obj.niveauStage || null,
        nomAdversaire: obj.nomAdversaire || obj.adversaire?.pseudo || null,
        avatarAdversaire: obj.adversaire?.avatarURL || null,
        idAdversaire: obj.idAdversaire || null
      };
    });

    console.log('✅ [History] Formatted', formattedParties.length, 'activities');

    res.json({
      success: true,
      count: formattedParties.length,
      data: formattedParties
    });

  } catch (error) {
    console.error('❌ [History] Error:', error.message);
    console.error('❌ [History] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message
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
      const conditionType = badge.conditionType?.toLowerCase() || '';
      const conditionValeur = badge.conditionValeur || 0;

      // Vérifier les conditions selon le type
      switch (conditionType) {
        case 'parties_jouees':
          if (stats.partiesJouees >= conditionValeur) {
            shouldUnlock = true;
          }
          break;
        case 'xp_total':
          if ((stats.totalXP || 0) >= conditionValeur) {
            shouldUnlock = true;
          }
          break;
        case 'quiz_parfaits':
          if (stats.percentage === 100) {
            // Incrémenter le compteur de quiz parfaits côté stats si nécessaire
            const quizParfaits = stats.quizParfaits || (stats.percentage === 100 ? 1 : 0);
            if (quizParfaits >= conditionValeur) {
              shouldUnlock = true;
            }
          }
          break;
        case 'niveau_stage':
          if ((stats.levelNumber || stats.stageLevel || 1) >= conditionValeur) {
            shouldUnlock = true;
          }
          break;
      }

      if (shouldUnlock) {
        await InventaireBadge.create({
          idJoueur: joueur.idJoueur,
          idBadge: badge.idBadge,
          dateObtention: new Date()
        }, { transaction });

        // Créer une notification pour le badge débloqué
        await Notification.create({
          idJoueur: joueur.idJoueur,
          type: 'badge',
          titre: '🏅 Nouveau badge débloqué !',
          contenu: `Félicitations ! Vous avez obtenu le badge "${badge.nom}" : ${badge.description}`,
          canal: 'in-app',
          estLue: false
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
