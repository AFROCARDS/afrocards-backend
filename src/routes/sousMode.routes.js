const express = require('express');
const router = express.Router();
const sousModeController = require('../controllers/sousMode.controller');

/**
 * @swagger
 * tags:
 *   name: Sous-Modes
 *   description: Gestion des sous-modes de jeu (Fiesta)
 */

// GET /api/sous-modes/fiesta - Récupérer les sous-modes du mode Fiesta
router.get('/fiesta', sousModeController.getFiestaSousModes);

// GET /api/sous-modes/:id - Récupérer les détails d'un sous-mode
router.get('/:id', sousModeController.getSousModeById);

module.exports = router;
