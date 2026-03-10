const { Joueur, Utilisateur, Partie, Ami, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper pour récupérer l'ID joueur courant
const getJoueurId = async (userId) => {
  const joueur = await Joueur.findOne({ where: { idUtilisateur: userId } });
  if (!joueur) throw new Error('Joueur introuvable');
  return joueur.idJoueur;
};

// Fonction pour formater le niveau avec badge
const formatNiveau = (niveau) => {
  return `Stage ${niveau || 1}`;
};

// 1. Classement Global (Top Joueurs par XP Total)
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const userId = req.user?.id;

    const joueurs = await Joueur.findAll({
      attributes: ['idJoueur', 'pseudo', 'avatarURL', 'pointsXP', 'niveau', 'pays', 'niveauActuel'],
      order: [['pointsXP', 'DESC']],
      limit: parseInt(limit),
      include: [
        { model: Utilisateur, attributes: ['dateCreation'] }
      ]
    });

    // Ajouter le rang à chaque joueur
    const classement = joueurs.map((joueur, index) => ({
      rang: index + 1,
      idJoueur: joueur.idJoueur,
      pseudo: joueur.pseudo,
      avatarURL: joueur.avatarURL,
      xpTotal: joueur.pointsXP || 0,
      niveau: formatNiveau(joueur.niveau),
      badge: 'Emeraude', // Badge par défaut, à adapter selon le système de badges
      pays: joueur.pays
    }));

    // Vérifier si l'utilisateur connecté est dans le classement, sinon l'ajouter
    let currentUserInList = false;
    let currentUserData = null;

    if (userId) {
      const monJoueur = await Joueur.findOne({ where: { idUtilisateur: userId } });
      if (monJoueur) {
        currentUserInList = classement.some(j => j.idJoueur === monJoueur.idJoueur);
        
        if (!currentUserInList) {
          // Calculer le rang de l'utilisateur
          const rang = await Joueur.count({
            where: { pointsXP: { [Op.gt]: monJoueur.pointsXP || 0 } }
          });
          
          currentUserData = {
            rang: rang + 1,
            idJoueur: monJoueur.idJoueur,
            pseudo: monJoueur.pseudo,
            avatarURL: monJoueur.avatarURL,
            xpTotal: monJoueur.pointsXP || 0,
            niveau: formatNiveau(monJoueur.niveau),
            badge: 'Emeraude',
            pays: monJoueur.pays,
            isCurrentUser: true
          };
        }
      }
    }

    res.status(200).json({
      success: true,
      data: classement,
      currentUser: currentUserData
    });
  } catch (error) {
    console.error('Erreur getGlobalLeaderboard:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération classement' });
  }
};

// 2. Classement Mensuel (Top Joueurs du mois en cours)
exports.getMonthlyLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const userId = req.user?.id;

    // Calculer le début du mois actuel
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Récupérer les scores des parties du mois groupés par joueur
    const partiesMois = await Partie.findAll({
      attributes: [
        'idJoueur',
        [sequelize.fn('SUM', sequelize.col('score')), 'scoreMois'],
        [sequelize.fn('COUNT', sequelize.col('idPartie')), 'partiesJouees']
      ],
      where: {
        datePartie: { [Op.gte]: startOfMonth }
      },
      group: ['idJoueur'],
      order: [[sequelize.literal('scoreMois'), 'DESC']],
      limit: parseInt(limit),
      include: [{
        model: Joueur,
        attributes: ['idJoueur', 'pseudo', 'avatarURL', 'niveau', 'pays', 'pointsXP']
      }]
    });

    // Formater les résultats
    const classement = partiesMois.map((partie, index) => ({
      rang: index + 1,
      idJoueur: partie.Joueur?.idJoueur,
      pseudo: partie.Joueur?.pseudo || 'Joueur',
      avatarURL: partie.Joueur?.avatarURL,
      xpTotal: parseInt(partie.dataValues.scoreMois) || 0,
      niveau: formatNiveau(partie.Joueur?.niveau),
      badge: 'Emeraude',
      partiesJouees: parseInt(partie.dataValues.partiesJouees) || 0
    }));

    // Ajouter l'utilisateur courant s'il n'est pas dans la liste
    let currentUserData = null;
    if (userId) {
      const monJoueur = await Joueur.findOne({ where: { idUtilisateur: userId } });
      if (monJoueur) {
        const isInList = classement.some(j => j.idJoueur === monJoueur.idJoueur);
        
        if (!isInList) {
          // Calculer le score mensuel de l'utilisateur
          const monScore = await Partie.findOne({
            attributes: [
              [sequelize.fn('SUM', sequelize.col('score')), 'scoreMois']
            ],
            where: {
              idJoueur: monJoueur.idJoueur,
              datePartie: { [Op.gte]: startOfMonth }
            }
          });

          const scoreMois = parseInt(monScore?.dataValues?.scoreMois) || 0;
          
          // Calculer le rang
          const rang = await Partie.count({
            attributes: [[sequelize.fn('SUM', sequelize.col('score')), 'total']],
            where: { datePartie: { [Op.gte]: startOfMonth } },
            group: ['idJoueur'],
            having: sequelize.literal(`SUM(score) > ${scoreMois}`)
          });

          currentUserData = {
            rang: rang.length + 1,
            idJoueur: monJoueur.idJoueur,
            pseudo: monJoueur.pseudo,
            avatarURL: monJoueur.avatarURL,
            xpTotal: scoreMois,
            niveau: formatNiveau(monJoueur.niveau),
            badge: 'Emeraude',
            isCurrentUser: true
          };
        }
      }
    }

    res.status(200).json({
      success: true,
      data: classement,
      currentUser: currentUserData
    });
  } catch (error) {
    console.error('Erreur getMonthlyLeaderboard:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération classement mensuel' });
  }
};

// 3. Classement des amis (vrais amis depuis la table amis)
exports.getFriendsLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    // Récupérer le joueur courant
    const monJoueur = await Joueur.findOne({ where: { idUtilisateur: userId } });
    if (!monJoueur) {
      return res.status(404).json({ success: false, message: 'Joueur introuvable' });
    }

    const monId = monJoueur.idJoueur;

    // Récupérer les IDs des amis (amitiés acceptées)
    const amities = await Ami.findAll({
      where: {
        [Op.or]: [
          { idJoueur1: monId },
          { idJoueur2: monId }
        ],
        statut: 'accepte'
      },
      attributes: ['idJoueur1', 'idJoueur2']
    });

    // Extraire les IDs des amis (l'autre joueur dans chaque amitié)
    const amisIds = amities.map(a => a.idJoueur1 === monId ? a.idJoueur2 : a.idJoueur1);
    
    // Ajouter l'utilisateur courant à la liste pour qu'il apparaisse dans le classement
    amisIds.push(monId);

    if (amisIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Aucun ami trouvé'
      });
    }

    // Récupérer les joueurs amis triés par XP
    const joueurs = await Joueur.findAll({
      attributes: ['idJoueur', 'pseudo', 'avatarURL', 'pointsXP', 'niveauActuel', 'pays'],
      where: {
        idJoueur: { [Op.in]: amisIds }
      },
      order: [['pointsXP', 'DESC']],
      limit: parseInt(limit)
    });

    const classement = joueurs.map((joueur, index) => ({
      rang: index + 1,
      idJoueur: joueur.idJoueur,
      pseudo: joueur.pseudo,
      avatarURL: joueur.avatarURL,
      xpTotal: joueur.pointsXP || 0,
      niveau: formatNiveau(joueur.niveauActuel),
      badge: 'Emeraude',
      pays: joueur.pays,
      isCurrentUser: joueur.idJoueur === monId
    }));

    res.status(200).json({
      success: true,
      data: classement
    });
  } catch (error) {
    console.error('Erreur getFriendsLeaderboard:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération classement amis' });
  }
};

// 4. Classement par Pays
exports.getCountryLeaderboard = async (req, res) => {
  try {
    const { pays } = req.params;
    const { limit = 50 } = req.query;

    const joueurs = await Joueur.findAll({
      where: { pays: pays },
      attributes: ['idJoueur', 'pseudo', 'avatarURL', 'pointsXP', 'niveau', 'pays'],
      order: [['pointsXP', 'DESC']],
      limit: parseInt(limit)
    });

    const classement = joueurs.map((joueur, index) => ({
      rang: index + 1,
      idJoueur: joueur.idJoueur,
      pseudo: joueur.pseudo,
      avatarURL: joueur.avatarURL,
      xpTotal: joueur.pointsXP || 0,
      niveau: formatNiveau(joueur.niveau),
      badge: 'Emeraude'
    }));

    res.status(200).json({
      success: true,
      pays: pays,
      data: classement
    });
  } catch (error) {
    console.error('Erreur getCountryLeaderboard:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération classement pays' });
  }
};

// 5. Ma position dans le classement
exports.getMyRank = async (req, res) => {
  try {
    const userId = req.user.id;
    const joueur = await Joueur.findOne({ where: { idUtilisateur: userId } });

    if (!joueur) return res.status(404).json({ message: 'Joueur introuvable' });

    // Compter combien de joueurs ont un XP supérieur strictement
    const rank = await Joueur.count({
      where: {
        pointsXP: {
          [Op.gt]: joueur.pointsXP || 0
        }
      }
    });

    // Compter le total de joueurs
    const totalPlayers = await Joueur.count();

    res.status(200).json({
      success: true,
      data: {
        idJoueur: joueur.idJoueur,
        pseudo: joueur.pseudo,
        avatarURL: joueur.avatarURL,
        xpTotal: joueur.pointsXP || 0,
        niveau: formatNiveau(joueur.niveau),
        badge: 'Emeraude',
        rang: rank + 1,
        total: totalPlayers
      }
    });
  } catch (error) {
    console.error('Erreur getMyRank:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération rang' });
  }
};