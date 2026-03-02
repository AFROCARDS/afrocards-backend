const { Niveau, ModeJeu, ProgressionNiveau, Joueur } = require('../models');

/**
 * Controller pour les niveaux du mode Stages
 */

// 1. Récupérer tous les niveaux d'un mode de jeu
exports.getNiveauxByMode = async (req, res) => {
  try {
    const { idMode } = req.params;
    const { difficulte } = req.query;

    const whereClause = { idMode };
    if (difficulte) {
      whereClause.difficulte = difficulte;
    }

    const niveaux = await Niveau.findAll({
      where: whereClause,
      order: [['numero', 'ASC']],
      include: [{
        model: ModeJeu,
        attributes: ['nom', 'description']
      }]
    });

    res.status(200).json({
      success: true,
      count: niveaux.length,
      data: niveaux
    });
  } catch (error) {
    console.error('Erreur getNiveauxByMode:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 2. Récupérer un niveau par ID
exports.getNiveauById = async (req, res) => {
  try {
    const { id } = req.params;

    const niveau = await Niveau.findByPk(id, {
      include: [{
        model: ModeJeu,
        attributes: ['nom', 'description', 'regles']
      }]
    });

    if (!niveau) {
      return res.status(404).json({ success: false, message: 'Niveau non trouvé' });
    }

    res.status(200).json({
      success: true,
      data: niveau
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 3. Récupérer les niveaux avec la progression du joueur
exports.getNiveauxWithProgression = async (req, res) => {
  try {
    const { idMode } = req.params;
    const idJoueur = req.user?.idJoueur;

    // Récupérer tous les niveaux du mode
    const niveaux = await Niveau.findAll({
      where: { idMode },
      order: [['numero', 'ASC']]
    });

    // Si le joueur est connecté, récupérer sa progression
    let progressions = [];
    if (idJoueur) {
      progressions = await ProgressionNiveau.findAll({
        where: { idJoueur },
        include: [{
          model: Niveau,
          where: { idMode }
        }]
      });
    }

    // Fusionner les données
    const niveauxAvecProgression = niveaux.map(niveau => {
      const progression = progressions.find(p => p.idNiveau === niveau.idNiveau);
      
      // Déterminer si le niveau est débloqué
      let estDebloque = niveau.estDebloque; // Par défaut (niveau 1)
      
      if (progression) {
        estDebloque = progression.estDebloque;
      } else if (niveau.numero > 1) {
        // Vérifier si le niveau précédent est complété
        const niveauPrecedent = niveaux.find(n => n.numero === niveau.numero - 1);
        if (niveauPrecedent) {
          const progressionPrecedente = progressions.find(p => p.idNiveau === niveauPrecedent.idNiveau);
          estDebloque = progressionPrecedente?.estComplete || false;
        }
      }

      return {
        ...niveau.toJSON(),
        progression: progression ? {
          estDebloque: progression.estDebloque,
          estComplete: progression.estComplete,
          meilleurScore: progression.meilleurScore,
          nombreTentatives: progression.nombreTentatives,
          etoiles: progression.etoiles
        } : {
          estDebloque: estDebloque,
          estComplete: false,
          meilleurScore: 0,
          nombreTentatives: 0,
          etoiles: 0
        }
      };
    });

    res.status(200).json({
      success: true,
      count: niveauxAvecProgression.length,
      data: niveauxAvecProgression
    });
  } catch (error) {
    console.error('Erreur getNiveauxWithProgression:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 4. Mettre à jour la progression d'un joueur sur un niveau
exports.updateProgression = async (req, res) => {
  try {
    const { idNiveau } = req.params;
    const { score, estComplete, etoiles } = req.body;
    const idJoueur = req.user?.idJoueur;

    if (!idJoueur) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    // Vérifier que le niveau existe
    const niveau = await Niveau.findByPk(idNiveau);
    if (!niveau) {
      return res.status(404).json({ success: false, message: 'Niveau non trouvé' });
    }

    // Trouver ou créer la progression
    let [progression, created] = await ProgressionNiveau.findOrCreate({
      where: { idJoueur, idNiveau },
      defaults: {
        idJoueur,
        idNiveau,
        estDebloque: true,
        estComplete: estComplete || false,
        meilleurScore: score || 0,
        nombreTentatives: 1,
        etoiles: etoiles || 0,
        dateCompletion: estComplete ? new Date() : null
      }
    });

    if (!created) {
      // Mettre à jour la progression existante
      const updates = {
        nombreTentatives: progression.nombreTentatives + 1
      };

      if (score && score > progression.meilleurScore) {
        updates.meilleurScore = score;
      }

      if (estComplete && !progression.estComplete) {
        updates.estComplete = true;
        updates.dateCompletion = new Date();
      }

      if (etoiles && etoiles > progression.etoiles) {
        updates.etoiles = etoiles;
      }

      await progression.update(updates);
    }

    // Si le niveau est complété, débloquer le niveau suivant
    if (estComplete) {
      const niveauSuivant = await Niveau.findOne({
        where: { idMode: niveau.idMode, numero: niveau.numero + 1 }
      });

      if (niveauSuivant) {
        await ProgressionNiveau.findOrCreate({
          where: { idJoueur, idNiveau: niveauSuivant.idNiveau },
          defaults: {
            idJoueur,
            idNiveau: niveauSuivant.idNiveau,
            estDebloque: true
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Progression mise à jour',
      data: progression
    });
  } catch (error) {
    console.error('Erreur updateProgression:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 5. Récupérer les niveaux du mode Stages (raccourci pratique)
exports.getStagesNiveaux = async (req, res) => {
  try {
    // Trouver le mode Stages
    const modeStages = await ModeJeu.findOne({ where: { nom: 'Stages' } });
    
    if (!modeStages) {
      return res.status(404).json({ success: false, message: 'Mode Stages non trouvé' });
    }

    // Rediriger vers getNiveauxByMode
    req.params.idMode = modeStages.idMode;
    return exports.getNiveauxWithProgression(req, res);
  } catch (error) {
    console.error('Erreur getStagesNiveaux:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 6. Créer un niveau (Admin)
exports.createNiveau = async (req, res) => {
  try {
    const { idMode, numero, nom, difficulte, nombreQuestions, tempsParQuestion, xpRecompense, coinsRecompense, scoreMinimum } = req.body;

    // Vérifier que le mode existe
    const mode = await ModeJeu.findByPk(idMode);
    if (!mode) {
      return res.status(404).json({ success: false, message: 'Mode de jeu non trouvé' });
    }

    // Vérifier l'unicité du numéro
    const existingNiveau = await Niveau.findOne({ where: { idMode, numero } });
    if (existingNiveau) {
      return res.status(400).json({ success: false, message: 'Ce numéro de niveau existe déjà pour ce mode' });
    }

    const newNiveau = await Niveau.create({
      idMode,
      numero,
      nom: nom || `Niveau ${numero.toString().padStart(2, '0')}`,
      difficulte: difficulte || 'facile',
      nombreQuestions: nombreQuestions || 10,
      tempsParQuestion: tempsParQuestion || 30,
      xpRecompense: xpRecompense || 50,
      coinsRecompense: coinsRecompense || 10,
      scoreMinimum: scoreMinimum || 70,
      estDebloque: numero === 1
    });

    res.status(201).json({
      success: true,
      message: 'Niveau créé avec succès',
      data: newNiveau
    });
  } catch (error) {
    console.error('Erreur createNiveau:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};
