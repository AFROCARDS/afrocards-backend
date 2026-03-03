const express = require('express');
const router = express.Router();
const classementController = require('../controllers/classement.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   - name: Classement
 *     description: Classements global, mensuel, amis, par pays et classement personnel
 */

router.use(verifyToken); // Protection globale des routes

/**
 * @swagger
 * /classement/global:
 *   get:
 *     summary: Récupérer le classement global des meilleurs joueurs (par XP total)
 *     tags: [Classement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre de joueurs à retourner
 *     responses:
 *       200:
 *         description: Classement global retourné
 *       400:
 *         description: Paramètres invalides
 */
router.get('/global', classementController.getGlobalLeaderboard);

/**
 * @swagger
 * /classement/mensuel:
 *   get:
 *     summary: Récupérer le classement du mois en cours
 *     tags: [Classement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre de joueurs à retourner
 *     responses:
 *       200:
 *         description: Classement mensuel retourné
 */
router.get('/mensuel', classementController.getMonthlyLeaderboard);

/**
 * @swagger
 * /classement/amis:
 *   get:
 *     summary: Récupérer le classement des amis (basé sur le pays pour le moment)
 *     tags: [Classement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre de joueurs à retourner
 *     responses:
 *       200:
 *         description: Classement amis retourné
 */
router.get('/amis', classementController.getFriendsLeaderboard);

/**
 * @swagger
 * /classement/pays/{pays}:
 *   get:
 *     summary: Récupérer le classement des joueurs d'un pays
 *     tags: [Classement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pays
 *         required: true
 *         schema:
 *           type: string
 *         description: Code ou nom du pays
 *     responses:
 *       200:
 *         description: Classement par pays retourné
 *       404:
 *         description: Aucun joueur trouvé pour ce pays
 */
router.get('/pays/:pays', classementController.getCountryLeaderboard);

/**
 * @swagger
 * /classement/me:
 *   get:
 *     summary: Obtenir ma position dans le classement
 *     tags: [Classement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Position retournée avec infos complètes
 *       404:
 *         description: Joueur introuvable
 */
router.get('/me', classementController.getMyRank);

module.exports = router;
