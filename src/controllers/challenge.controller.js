const { Challenge, Joueur, XP, Coin, Utilisateur, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper pour récupérer l'ID joueur courant
const getJoueurId = async (userId) => {
  const joueur = await Joueur.findOne({ where: { idUtilisateur: userId } });
  if (!joueur) throw new Error('Joueur introuvable');
  return joueur.idJoueur;
};

/**
 * Trouver un adversaire pour un challenge
 */
exports.findOpponent = async (req, res) => {
  try {
    const monJoueurId = await getJoueurId(req.user.id);
    const { nombreQuestions = 10 } = req.body;

    // Récupérer mes infos pour le matchmaking
    const monProfil = await Joueur.findByPk(monJoueurId, {
      include: [{ model: XP, as: 'xp' }]
    });

    const monXp = monProfil.xp?.quantite || 0;

    // Chercher un adversaire avec un XP proche (±500)
    const adversaires = await Joueur.findAll({
      where: {
        idJoueur: { [Op.ne]: monJoueurId }, // Pas moi-même
        statut: 'actif'
      },
      include: [
        { model: XP, as: 'xp' },
        { model: Utilisateur }
      ],
      limit: 10
    });

    if (adversaires.length === 0) {
      // Créer un adversaire fictif si aucun disponible
      return res.json({
        success: true,
        opponent: {
          id: 0,
          nom: 'Bot AFROCARDS',
          niveau: 'Intermédiaire',
          xp: Math.floor(monXp * 0.9),
          avatarUrl: null
        },
        isBot: true
      });
    }

    // Sélectionner un adversaire aléatoire parmi ceux trouvés
    // Privilégier ceux avec un XP proche
    const adversairesTriés = adversaires
      .map(adv => ({
        joueur: adv,
        ecart: Math.abs((adv.xp?.quantite || 0) - monXp)
      }))
      .sort((a, b) => a.ecart - b.ecart);

    // Prendre parmi les 5 meilleurs matchs de façon aléatoire
    const topAdversaires = adversairesTriés.slice(0, 5);
    const adversaireChoisi = topAdversaires[Math.floor(Math.random() * topAdversaires.length)];
    const adv = adversaireChoisi.joueur;

    // Calculer le niveau basé sur l'XP
    const advXp = adv.xp?.quantite || 0;
    let niveau = 'Débutant';
    if (advXp >= 5000) niveau = 'Expert';
    else if (advXp >= 2000) niveau = 'Avancé';
    else if (advXp >= 500) niveau = 'Intermédiaire';

    res.json({
      success: true,
      opponent: {
        id: adv.idJoueur,
        nom: adv.Utilisateur?.nom || `Joueur #${adv.idJoueur}`,
        niveau: niveau,
        xp: advXp,
        avatarUrl: adv.avatar || null
      },
      isBot: false
    });

  } catch (error) {
    console.error('Erreur findOpponent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur recherche adversaire', 
      error: error.message 
    });
  }
};

/**
 * Créer un nouveau challenge
 */
exports.createChallenge = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const monJoueurId = await getJoueurId(req.user.id);
    const { opponentId, nombreQuestions = 10 } = req.body;

    // Créer le challenge
    const challenge = await Challenge.create({
      idJoueur1: monJoueurId,
      idJoueur2: opponentId > 0 ? opponentId : null, // null si bot
      nombreQuestions,
      statut: 'en_cours',
      dateDebut: new Date()
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      challengeId: challenge.idChallenge,
      message: 'Challenge créé'
    });

  } catch (error) {
    await t.rollback();
    console.error('Erreur createChallenge:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur création challenge', 
      error: error.message 
    });
  }
};

/**
 * Soumettre le résultat d'un challenge
 */
exports.submitResult = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const monJoueurId = await getJoueurId(req.user.id);
    const { challengeId, score, totalQuestions } = req.body;

    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Challenge introuvable' });
    }

    // Déterminer si je suis joueur 1 ou 2
    const isJoueur1 = challenge.idJoueur1 === monJoueurId;
    const isJoueur2 = challenge.idJoueur2 === monJoueurId;

    if (!isJoueur1 && !isJoueur2) {
      await t.rollback();
      return res.status(403).json({ success: false, message: 'Vous ne participez pas à ce challenge' });
    }

    // Mettre à jour mon score
    if (isJoueur1) {
      challenge.scoreJoueur1 = score;
    } else {
      challenge.scoreJoueur2 = score;
    }

    // Simuler le score de l'adversaire si c'est un bot ou si l'adversaire n'a pas encore joué
    let opponentScore = isJoueur1 ? challenge.scoreJoueur2 : challenge.scoreJoueur1;
    
    if (opponentScore === null) {
      // Simuler un score pour l'adversaire
      const random = Math.random();
      if (random < 0.4) {
        opponentScore = Math.floor(score * 0.7); // Adversaire moins bon
      } else if (random < 0.8) {
        opponentScore = Math.max(0, score + Math.floor(Math.random() * 3) - 1); // Score proche
      } else {
        opponentScore = Math.min(totalQuestions, score + 1 + Math.floor(Math.random() * 2)); // Adversaire meilleur
      }
      
      if (isJoueur1) {
        challenge.scoreJoueur2 = opponentScore;
      } else {
        challenge.scoreJoueur1 = opponentScore;
      }
    }

    // Déterminer le gagnant
    const monScore = score;
    let gagnantId = null;
    let isWinner = false;

    if (monScore > opponentScore) {
      gagnantId = monJoueurId;
      isWinner = true;
    } else if (opponentScore > monScore) {
      gagnantId = isJoueur1 ? challenge.idJoueur2 : challenge.idJoueur1;
    }
    // Si égalité, pas de gagnant

    challenge.idGagnant = gagnantId;
    challenge.statut = 'termine';
    challenge.dateFin = new Date();

    // Calculer les récompenses
    const xpBase = totalQuestions * 10;
    const coinsBase = totalQuestions * 5;
    
    let xpGained = Math.floor(xpBase * (monScore / totalQuestions));
    let coinsGained = Math.floor(coinsBase * (monScore / totalQuestions));

    // Bonus si victoire
    if (isWinner) {
      xpGained = Math.floor(xpGained * 1.5);
      coinsGained = Math.floor(coinsGained * 1.5);
    }

    challenge.xpRecompense = xpGained;
    challenge.coinsRecompense = coinsGained;
    await challenge.save({ transaction: t });

    // Mettre à jour les ressources du joueur
    const xpRecord = await XP.findOne({ where: { idJoueur: monJoueurId } });
    if (xpRecord) {
      xpRecord.quantite += xpGained;
      await xpRecord.save({ transaction: t });
    }

    const coinRecord = await Coin.findOne({ where: { idJoueur: monJoueurId } });
    if (coinRecord) {
      coinRecord.quantite += coinsGained;
      await coinRecord.save({ transaction: t });
    }

    await t.commit();

    res.json({
      success: true,
      result: {
        isWinner,
        playerScore: monScore,
        opponentScore,
        xpGained,
        coinsGained,
        isDraw: monScore === opponentScore
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Erreur submitResult:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur soumission résultat', 
      error: error.message 
    });
  }
};

/**
 * Historique des challenges d'un joueur
 */
exports.getMyHistory = async (req, res) => {
  try {
    const monJoueurId = await getJoueurId(req.user.id);

    const challenges = await Challenge.findAll({
      where: {
        [Op.or]: [
          { idJoueur1: monJoueurId },
          { idJoueur2: monJoueurId }
        ],
        statut: 'termine'
      },
      include: [
        { model: Joueur, as: 'joueur1', include: [Utilisateur] },
        { model: Joueur, as: 'joueur2', include: [Utilisateur] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    const history = challenges.map(c => {
      const isJoueur1 = c.idJoueur1 === monJoueurId;
      const adversaire = isJoueur1 ? c.joueur2 : c.joueur1;
      const monScore = isJoueur1 ? c.scoreJoueur1 : c.scoreJoueur2;
      const advScore = isJoueur1 ? c.scoreJoueur2 : c.scoreJoueur1;
      
      return {
        id: c.idChallenge,
        date: c.dateFin,
        adversaire: adversaire?.Utilisateur?.nom || 'Bot AFROCARDS',
        monScore,
        adversaireScore: advScore,
        resultat: c.idGagnant === monJoueurId ? 'victoire' : (c.idGagnant ? 'defaite' : 'egalite'),
        xpGagne: isJoueur1 ? c.xpRecompense : 0,
        coinsGagne: isJoueur1 ? c.coinsRecompense : 0
      };
    });

    res.json({ success: true, history });

  } catch (error) {
    console.error('Erreur getMyHistory:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur récupération historique', 
      error: error.message 
    });
  }
};
