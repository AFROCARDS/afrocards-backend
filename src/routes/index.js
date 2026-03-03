const express = require('express');
const router = express.Router();

// Import des routes
const authRoutes = require('./auth.routes');
const quizRoutes = require('./quiz.routes');
const questionRoutes = require('./question.routes');
const reponseRoutes = require('./reponse.routes');
const explicationRoutes = require('./explication.routes');
const categorieRoutes = require('./categorie.routes');
const modeJeuRoutes = require('./modeJeu.routes');
const sousModeRoutes = require('./sousMode.routes');
const niveauRoutes = require('./niveau.routes');
const partieRoutes = require('./partie.routes');
const classementRoutes = require('./classement.routes');
const adminRoutes = require('./admin.routes');
const partenaireRoutes = require('./partenaire.routes');
const economieRoutes = require('./economie.routes');
const socialRoutes = require('./social.routes');
const gamificationRoutes = require('./gamification.routes'); // <-- AJOUT
const gameplayRoutes = require('./gameplay.routes');
const uploadRoutes = require('./upload.routes');
const passwordRoutes = require('./password.routes');
const resultRoutes = require('./result.routes');
const challengeRoutes = require('./challenge.routes');

// Utiliser les routes
router.use('/auth', authRoutes);
router.use('/quizzes', quizRoutes);
router.use('/questions', questionRoutes);
router.use('/reponses', reponseRoutes);
router.use('/explications', explicationRoutes);
router.use('/categories', categorieRoutes);
router.use('/modes', modeJeuRoutes);
router.use('/sous-modes', sousModeRoutes);
router.use('/niveaux', niveauRoutes);
router.use('/parties', partieRoutes);
router.use('/classement', classementRoutes);
router.use('/admin', adminRoutes);
router.use('/partenaires', partenaireRoutes);
router.use('/economie', economieRoutes);
router.use('/social', socialRoutes);
router.use('/gamification', gamificationRoutes); // <-- AJOUT
router.use('/gameplay', gameplayRoutes);
router.use('/upload', uploadRoutes);
router.use('/password', passwordRoutes);
router.use('/results', resultRoutes);
router.use('/challenges', challengeRoutes);

// Route de test API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API AFROCARDS opérationnelle',
    timestamp: new Date().toISOString(),
    modules: {
      auth: '✅',
      quiz: '✅',
      questions: '✅',
      reponses: '✅',
      explications: '✅',
      categories: '✅',
      modes: '✅',
      parties: '✅',
      classement: '✅',
      admin: '✅',
      partenaires: '✅',
      economie: '✅',
      social: '✅',
      gamification: '✅ NOUVEAU', // <-- AJOUT
      challenges: '✅ NOUVEAU'
    }
  });
});

module.exports = router;