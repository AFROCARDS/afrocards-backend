const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result.controller');
const { verifyToken, optionalAuth } = require('../middlewares/auth.middleware');

/**
 * Routes pour les résultats de quiz
 * Base: /api/results
 */

// POST /api/results/save - Sauvegarder les résultats (authentifié)
router.post('/save', verifyToken, resultController.saveResults);

// GET /api/results/history - Historique des résultats (authentifié)
router.get('/history', verifyToken, resultController.getResultsHistory);

// GET /api/results/stats - Statistiques du joueur (authentifié ou optionnel)
router.get('/stats', optionalAuth, resultController.getPlayerStats);

// POST /api/results/sync-lives - Synchroniser les vies
router.post('/sync-lives', optionalAuth, resultController.syncLives);

// POST /api/results/sync-progress - Synchroniser la progression
router.post('/sync-progress', optionalAuth, resultController.syncProgress);

module.exports = router;
