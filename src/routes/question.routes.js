const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const { questionValidator } = require('../utils/validators');
const { validate } = require('../middlewares/validation.middleware');
const { verifyToken } = require('../middlewares/auth.middleware'); // à décommenter si nécessaire

/**
 * @swagger
 * tags:
 *   - name: Questions
 *     description: Gestion des questions pour les quiz
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         quizId:
 *           type: integer
 *           example: 5
 *         question:
 *           type: string
 *           example: "Quelle est la capitale du Bénin ?"
 *         reponses:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Cotonou", "Porto-Novo", "Parakou", "Abomey"]
 *         bonneReponse:
 *           type: string
 *           example: "Porto-Novo"
 */

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Créer une question pour un quiz
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quizId
 *               - question
 *               - reponses
 *               - bonneReponse
 *             properties:
 *               quizId:
 *                 type: integer
 *                 example: 5
 *               question:
 *                 type: string
 *                 example: "Quelle est la capitale du Bénin ?"
 *               reponses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Cotonou", "Porto-Novo", "Parakou", "Abomey"]
 *               bonneReponse:
 *                 type: string
 *                 example: "Porto-Novo"
 *     responses:
 *       201:
 *         description: Question créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Données invalides
 */
router.post('/', questionValidator, validate, questionController.createQuestion);

/**
 * @swagger
 * /questions/quiz/{quizId}:
 *   get:
 *     summary: Récupérer toutes les questions d'un quiz
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du quiz
 *     responses:
 *       200:
 *         description: Liste des questions pour le quiz
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       404:
 *         description: Quiz ou questions introuvables
 */
router.get('/quiz/:quizId', questionController.getQuestionsByQuiz);

/**
 * @swagger
 * /questions/{id}:
 *   put:
 *     summary: Modifier une question existante
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: "Nouvelle question"
 *               reponses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["A", "B", "C", "D"]
 *               bonneReponse:
 *                 type: string
 *                 example: "B"
 *     responses:
 *       200:
 *         description: Question mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question non trouvée
 */
router.put('/:id', questionController.updateQuestion);

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Supprimer une question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la question
 *     responses:
 *       200:
 *         description: Question supprimée avec succès
 *       404:
 *         description: Question non trouvée
 */
router.delete('/:id', questionController.deleteQuestion);

// ========== ROUTES POUR LE JEU ==========

/**
 * @swagger
 * /questions/stats:
 *   get:
 *     summary: Statistiques des questions
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 */
router.get('/stats', questionController.getQuestionsStats);

/**
 * @swagger
 * /questions/random:
 *   get:
 *     summary: Récupérer des questions aléatoires (mode Fiesta)
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: difficulte
 *         schema:
 *           type: string
 *           enum: [facile, moyen, difficile]
 *       - in: query
 *         name: idCategorie
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Questions aléatoires récupérées
 */
router.get('/random', questionController.getRandomQuestions);

/**
 * @swagger
 * /questions/category/{idCategorie}:
 *   get:
 *     summary: Récupérer des questions par catégorie
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: idCategorie
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: difficulte
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Questions récupérées avec succès
 */
router.get('/category/:idCategorie', questionController.getQuestionsByCategory);

/**
 * @swagger
 * /questions/level/{levelNumber}:
 *   get:
 *     summary: Récupérer des questions pour un niveau (mode Stage)
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: levelNumber
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: idCategorie
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Questions pour le niveau récupérées
 */
router.get('/level/:levelNumber', questionController.getQuestionsForLevel);

/**
 * @swagger
 * /questions/{idQuestion}/explication:
 *   get:
 *     summary: Récupérer l'explication d'une question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: idQuestion
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Explication récupérée avec succès
 *       404:
 *         description: Question non trouvée
 */
router.get('/:idQuestion/explication', questionController.getQuestionExplication);

/**
 * @swagger
 * /questions/{idQuestion}/verify:
 *   post:
 *     summary: Vérifier une réponse
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: idQuestion
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
 *               idReponse:
 *                 type: integer
 *               tempsReponse:
 *                 type: number
 *     responses:
 *       200:
 *         description: Réponse vérifiée
 */
router.post('/:idQuestion/verify', questionController.verifyAnswer);

/**
 * @swagger
 * /questions/{idQuestion}:
 *   get:
 *     summary: Récupérer une question par son ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: idQuestion
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question récupérée
 *       404:
 *         description: Question non trouvée
 */
router.get('/:idQuestion', questionController.getQuestionById);

module.exports = router;
