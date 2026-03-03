const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challenge.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

/**
 * @route   POST /api/challenges/find-opponent
 * @desc    Trouver un adversaire pour un challenge
 * @access  Private
 */
router.post('/find-opponent', challengeController.findOpponent);

/**
 * @route   POST /api/challenges/create
 * @desc    Créer un nouveau challenge
 * @access  Private
 */
router.post('/create', challengeController.createChallenge);

/**
 * @route   POST /api/challenges/submit-result
 * @desc    Soumettre le résultat d'un challenge
 * @access  Private
 */
router.post('/submit-result', challengeController.submitResult);

/**
 * @route   GET /api/challenges/history
 * @desc    Récupérer l'historique de mes challenges
 * @access  Private
 */
router.get('/history', challengeController.getMyHistory);

module.exports = router;
