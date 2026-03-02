const { SousModeJeu, ModeJeu } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     SousModeJeu:
 *       type: object
 *       properties:
 *         idSousMode:
 *           type: integer
 *         idMode:
 *           type: integer
 *         nom:
 *           type: string
 *         description:
 *           type: string
 *         icone:
 *           type: string
 *         ordre:
 *           type: integer
 *         estActif:
 *           type: boolean
 *         configuation:
 *           type: object
 */

/**
 * @swagger
 * /api/modes/{idMode}/sous-modes:
 *   get:
 *     summary: Récupérer les sous-modes d'un mode de jeu
 *     tags: [Modes de Jeu]
 *     parameters:
 *       - in: path
 *         name: idMode
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du mode de jeu
 *     responses:
 *       200:
 *         description: Liste des sous-modes
 */
exports.getSousModesByMode = async (req, res) => {
  try {
    const { idMode } = req.params;

    // Vérifier que le mode existe
    const mode = await ModeJeu.findByPk(idMode);
    if (!mode) {
      return res.status(404).json({
        success: false,
        message: 'Mode de jeu non trouvé'
      });
    }

    // Récupérer les sous-modes actifs
    const sousModes = await SousModeJeu.findAll({
      where: {
        idMode: idMode,
        estActif: true
      },
      order: [['ordre', 'ASC']],
      attributes: ['idSousMode', 'nom', 'description', 'icone', 'ordre', 'configuation']
    });

    res.json({
      success: true,
      data: sousModes,
      mode: {
        idMode: mode.idMode,
        nom: mode.nom
      }
    });
  } catch (error) {
    console.error('Erreur getSousModesByMode:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/modes/fiesta/sous-modes:
 *   get:
 *     summary: Récupérer les sous-modes du mode Fiesta
 *     tags: [Modes de Jeu]
 *     responses:
 *       200:
 *         description: Liste des sous-modes Fiesta
 */
exports.getFiestaSousModes = async (req, res) => {
  try {
    // Trouver le mode Fiesta
    const modeFiesta = await ModeJeu.findOne({
      where: { nom: 'Fiesta' }
    });

    if (!modeFiesta) {
      return res.status(404).json({
        success: false,
        message: 'Mode Fiesta non trouvé'
      });
    }

    // Récupérer les sous-modes actifs
    const sousModes = await SousModeJeu.findAll({
      where: {
        idMode: modeFiesta.idMode,
        estActif: true
      },
      order: [['ordre', 'ASC']],
      attributes: ['idSousMode', 'nom', 'description', 'icone', 'ordre', 'configuation']
    });

    res.json({
      success: true,
      data: sousModes,
      mode: {
        idMode: modeFiesta.idMode,
        nom: modeFiesta.nom,
        description: modeFiesta.description
      }
    });
  } catch (error) {
    console.error('Erreur getFiestaSousModes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/sous-modes/{id}:
 *   get:
 *     summary: Récupérer les détails d'un sous-mode
 *     tags: [Modes de Jeu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du sous-mode
 *     responses:
 *       200:
 *         description: Détails du sous-mode
 */
exports.getSousModeById = async (req, res) => {
  try {
    const { id } = req.params;

    const sousMode = await SousModeJeu.findByPk(id, {
      include: [{
        model: ModeJeu,
        as: 'modeJeu',
        attributes: ['idMode', 'nom', 'description']
      }]
    });

    if (!sousMode) {
      return res.status(404).json({
        success: false,
        message: 'Sous-mode non trouvé'
      });
    }

    res.json({
      success: true,
      data: sousMode
    });
  } catch (error) {
    console.error('Erreur getSousModeById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
