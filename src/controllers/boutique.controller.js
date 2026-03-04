const Article = require('../models/Article');

// GET /boutique/articles
exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.findAll();
    res.json({ data: articles });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des articles' });
  }
};
