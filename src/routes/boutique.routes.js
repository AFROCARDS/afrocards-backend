const express = require('express');
const router = express.Router();
const boutiqueController = require('../controllers/boutique.controller');

// GET /boutique/articles
router.get('/articles', boutiqueController.getArticles);

module.exports = router;
