const express = require('express');
const router = express.Router();
const challengeSponsoriseController = require('../controllers/challengeSponsorise.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/challenges-sponsorises/active
 * @desc    Lister les challenges sponsorisés actifs
 * @access  Public
 */
router.get('/active', challengeSponsoriseController.getAllActive);

/**
 * @route   GET /api/challenges-sponsorises/:id
 * @desc    Récupérer les détails d'un challenge sponsorisé
 * @access  Public
 */
router.get('/:id', challengeSponsoriseController.getById);

// Routes authentifiées
router.use(verifyToken);

/**
 * @route   POST /api/challenges-sponsorises/submit-result
 * @desc    Soumettre le résultat d'un challenge sponsorisé
 * @access  Private
 */
router.post('/submit-result', challengeSponsoriseController.submitResult);

/**
 * @route   GET /api/challenges-sponsorises/my-trophies
 * @desc    Récupérer mes trophées
 * @access  Private
 */
router.get('/my-trophies', challengeSponsoriseController.getMyTrophies);

module.exports = router;
