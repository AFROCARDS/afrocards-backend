const { ChallengeSponsorise, Partenaire, Joueur, Trophee, InventaireTrophee, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper pour récupérer l'ID joueur courant
const getJoueurId = async (userId) => {
  const joueur = await Joueur.findOne({ where: { idUtilisateur: userId } });
  if (!joueur) throw new Error('Joueur introuvable');
  return joueur.idJoueur;
};

/**
 * Lister les challenges sponsorisés actifs
 */
exports.getAllActive = async (req, res) => {
  try {
    const now = new Date();

    const challenges = await ChallengeSponsorise.findAll({
      where: {
        statut: 'actif',
        dateDebut: { [Op.lte]: now },
        dateFin: { [Op.gte]: now }
      },
      include: [
        {
          model: Partenaire,
          attributes: ['idPartenaire', 'entreprise', 'secteur']
        }
      ],
      order: [['dateDebut', 'DESC']]
    });

    res.json({
      success: true,
      data: challenges,
      count: challenges.length
    });

  } catch (error) {
    console.error('Erreur getAllActive:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur chargement challenges sponsorisés', 
      error: error.message 
    });
  }
};

/**
 * Récupérer les détails d'un challenge sponsorisé
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await ChallengeSponsorise.findByPk(id, {
      include: [
        {
          model: Partenaire,
          attributes: ['idPartenaire', 'entreprise', 'secteur']
        }
      ]
    });

    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge sponsorisé non trouvé' 
      });
    }

    res.json({
      success: true,
      data: challenge
    });

  } catch (error) {
    console.error('Erreur getById:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur chargement challenge', 
      error: error.message 
    });
  }
};

/**
 * Soumettre le résultat d'un challenge sponsorisé
 * Accorde un trophée si gagné
 */
exports.submitResult = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const monJoueurId = await getJoueurId(req.user.id);
    const { challengeId, score, totalQuestions } = req.body;

    // Récupérer le challenge
    const challenge = await ChallengeSponsorise.findByPk(challengeId, {
      transaction: t
    });

    if (!challenge) {
      await t.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge sponsor non trouvé' 
      });
    }

    // Calculer si gagné (score >= 70%)
    const scorePercentage = (score / totalQuestions) * 100;
    const isWon = scorePercentage >= 70;

    let tropheeGranted = null;

    if (isWon) {
      // Créer ou récupérer le trophée pour ce challenge
      const tropheeNom = `Trophy_${challenge.idChallenge}_${challenge.titre}`.replace(/\s/g, '_');
      
      let trophee = await Trophee.findOne({
        where: { nom: tropheeNom },
        transaction: t
      });

      if (!trophee) {
        trophee = await Trophee.create({
          nom: tropheeNom,
          description: `Trophée pour avoir gagné le challenge "${challenge.titre}" du partenaire ${challenge.idPartenaire}`,
          rareté: 'rare',
          icone: '/trophees/sponsor.png'
        }, { transaction: t });
      }

      // Vérifier si le joueur a déjà ce trophée
      const alreadyHas = await InventaireTrophee.findOne({
        where: {
          idJoueur: monJoueurId,
          idTrophee: trophee.idTrophee
        },
        transaction: t
      });

      if (!alreadyHas) {
        // Accorder le trophée
        await InventaireTrophee.create({
          idJoueur: monJoueurId,
          idTrophee: trophee.idTrophee,
          dateObtention: new Date()
        }, { transaction: t });

        tropheeGranted = trophee;
      }
    }

    await t.commit();

    res.json({
      success: true,
      isWon: isWon,
      scorePercentage: scorePercentage.toFixed(2),
      tropheeGranted: tropheeGranted,
      message: isWon ? 'Bravo! Challenge remporté!' : 'Challenge terminé'
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
 * Récupérer les trophées du joueur courant
 */
exports.getMyTrophies = async (req, res) => {
  try {
    const monJoueurId = await getJoueurId(req.user.id);

    const trophies = await InventaireTrophee.findAll({
      where: { idJoueur: monJoueurId },
      include: [
        {
          model: Trophee,
          attributes: ['idTrophee', 'nom', 'description', 'icone', 'rareté']
        }
      ],
      order: [['dateObtention', 'DESC']]
    });

    res.json({
      success: true,
      data: trophies,
      count: trophies.length
    });

  } catch (error) {
    console.error('Erreur getMyTrophies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur chargement trophées', 
      error: error.message 
    });
  }
};
