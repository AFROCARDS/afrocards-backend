const express = require('express');
const router = express.Router();
const niveauController = require('../controllers/niveau.controller');
const { verifyToken, checkRole, optionalAuth } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   - name: Niveaux
 *     description: Gestion des niveaux du mode Stages
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Niveau:
 *       type: object
 *       properties:
 *         idNiveau:
 *           type: integer
 *         numero:
 *           type: integer
 *         nom:
 *           type: string
 *         difficulte:
 *           type: string
 *           enum: [facile, moyen, difficile]
 *         nombreQuestions:
 *           type: integer
 *         tempsParQuestion:
 *           type: integer
 *         xpRecompense:
 *           type: integer
 *         coinsRecompense:
 *           type: integer
 *         scoreMinimum:
 *           type: integer
 *         estDebloque:
 *           type: boolean
 */

/**
 * @swagger
 * /niveaux/stages:
 *   get:
 *     summary: Récupérer tous les niveaux du mode Stages avec progression
 *     tags: [Niveaux]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des niveaux avec progression du joueur
 */
router.get('/stages', optionalAuth, niveauController.getStagesNiveaux);

/**
 * @swagger
 * /niveaux/mode/{idMode}:
 *   get:
 *     summary: Récupérer tous les niveaux d'un mode de jeu
 *     tags: [Niveaux]
 *     parameters:
 *       - in: path
 *         name: idMode
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: difficulte
 *         schema:
 *           type: string
 *           enum: [facile, moyen, difficile]
 *     responses:
 *       200:
 *         description: Liste des niveaux
 */
router.get('/mode/:idMode', niveauController.getNiveauxByMode);

/**
 * @swagger
 * /niveaux/mode/{idMode}/progression:
 *   get:
 *     summary: Récupérer les niveaux avec la progression du joueur
 *     tags: [Niveaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idMode
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Niveaux avec progression
 */
router.get('/mode/:idMode/progression', optionalAuth, niveauController.getNiveauxWithProgression);

/**
 * @swagger
 * /niveaux/{id}:
 *   get:
 *     summary: Récupérer un niveau par ID
 *     tags: [Niveaux]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du niveau
 *       404:
 *         description: Niveau non trouvé
 */
router.get('/:id', niveauController.getNiveauById);

/**
 * @swagger
 * /niveaux/{idNiveau}/progression:
 *   put:
 *     summary: Mettre à jour la progression sur un niveau
 *     tags: [Niveaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idNiveau
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: integer
 *               estComplete:
 *                 type: boolean
 *               etoiles:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Progression mise à jour
 */
router.put('/:idNiveau/progression', verifyToken, niveauController.updateProgression);

/**
 * @swagger
 * /niveaux:
 *   post:
 *     summary: Créer un nouveau niveau (Admin)
 *     tags: [Niveaux]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idMode, numero]
 *             properties:
 *               idMode:
 *                 type: integer
 *               numero:
 *                 type: integer
 *               nom:
 *                 type: string
 *               difficulte:
 *                 type: string
 *                 enum: [facile, moyen, difficile]
 *     responses:
 *       201:
 *         description: Niveau créé
 */
router.post('/', verifyToken, checkRole('admin'), niveauController.createNiveau);

module.exports = router;
