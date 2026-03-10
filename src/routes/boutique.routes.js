const express = require('express');
const router = express.Router();
const boutiqueController = require('../controllers/boutique.controller');
const { verifyToken, optionalAuth } = require('../middlewares/auth.middleware');

// GET /boutique/articles - Liste des articles (public)
router.get('/articles', boutiqueController.getArticles);

// POST /boutique/acheter - Acheter un article (authentifié)
router.post('/acheter', verifyToken, boutiqueController.acheterArticle);

// GET /boutique/mes-achats - Historique des achats (authentifié)
router.get('/mes-achats', verifyToken, boutiqueController.getMesAchats);

module.exports = router;
