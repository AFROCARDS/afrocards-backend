const { Question, Quiz, Categorie, Reponse, Explication } = require('../models');
const { Sequelize, Op } = require('sequelize');

// 1. Créer une question dans un Quiz
exports.createQuestion = async (req, res) => {
  try {
    const { idQuiz, texte, type, priorite, mediaURL, categories } = req.body;

    // Vérifier si le Quiz existe
    const quiz = await Quiz.findByPk(idQuiz);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    }

    // Création de la question
    const newQuestion = await Question.create({
      idQuiz,
      texte,
      type: type || 'QCM',
      priorite: priorite || 1,
      mediaURL
    });

    // Gestion de l'association N:N avec les catégories
    if (categories && Array.isArray(categories) && categories.length > 0) {
      await newQuestion.setCategories(categories);
    }

    res.status(201).json({
      success: true,
      message: 'Question ajoutée avec succès',
      data: newQuestion
    });
  } catch (error) {
    console.error('Erreur createQuestion:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// 2. Récupérer toutes les questions d'un Quiz spécifique
exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Vérifier si le Quiz existe
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    }

    const questions = await Question.findAll({
      where: { idQuiz: quizId },
      include: [
        {
          model: Categorie,
          attributes: ['idCategorie', 'nom'],
          through: { attributes: [] } // Masquer la table de liaison 'question_categories'
        }
      ],
      order: [['priorite', 'ASC']] // Trié par priorité
    });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Erreur getQuestionsByQuiz:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération questions' });
  }
};

// 3. Modifier une question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { texte, type, priorite, mediaURL, categories } = req.body;

    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question non trouvée' });
    }

    // Mise à jour des champs de base
    await question.update({
      texte,
      type,
      priorite,
      mediaURL
    });

    // Mise à jour des catégories (remplace les anciennes associations)
    if (categories && Array.isArray(categories)) {
      await question.setCategories(categories);
    }

    res.status(200).json({
      success: true,
      message: 'Question mise à jour',
      data: question
    });
  } catch (error) {
    console.error('Erreur updateQuestion:', error);
    res.status(500).json({ success: false, message: 'Erreur modification question' });
  }
};

// 4. Supprimer une question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question non trouvée' });
    }

    await question.destroy();

    res.status(200).json({
      success: true,
      message: 'Question supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteQuestion:', error);
    res.status(500).json({ success: false, message: 'Erreur suppression question' });
  }
};

// ========== ENDPOINTS POUR LE JEU ==========

/**
 * 5. Récupérer des questions par catégorie (pour le jeu)
 * GET /api/questions/category/:idCategorie
 */
exports.getQuestionsByCategory = async (req, res) => {
  try {
    const { idCategorie } = req.params;
    const { difficulte, limit = 10, random = 'true' } = req.query;

    const whereClause = {
      idCategorie,
      estActive: true
    };

    if (difficulte) {
      whereClause.difficulte = difficulte;
    }

    let questions = await Question.findAll({
      where: whereClause,
      include: [
        {
          model: Reponse,
          attributes: ['idReponse', 'texte', 'estCorrecte', 'ordreAffichage']
        },
        {
          model: Categorie,
          as: 'categorieDirecte',
          attributes: ['idCategorie', 'nom', 'icone']
        }
      ],
      limit: parseInt(limit)
    });

    // Mélanger les questions si demandé
    if (random === 'true') {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // Mélanger les réponses pour chaque question
    questions = questions.map(q => {
      const questionJson = q.toJSON();
      questionJson.Reponses = questionJson.Reponses.sort(() => Math.random() - 0.5);
      return questionJson;
    });

    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Erreur getQuestionsByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des questions',
      error: error.message
    });
  }
};

/**
 * 6. Récupérer des questions pour un niveau (Stage mode)
 * GET /api/questions/level/:levelNumber
 */
exports.getQuestionsForLevel = async (req, res) => {
  try {
    const { levelNumber } = req.params;
    const { idCategorie } = req.query;
    
    // Déterminer la difficulté selon le niveau
    let difficulte;
    const level = parseInt(levelNumber);
    if (level <= 3) {
      difficulte = 'facile';
    } else if (level <= 7) {
      difficulte = 'moyen';
    } else {
      difficulte = 'difficile';
    }

    // Nombre de questions selon le niveau
    const nombreQuestions = level <= 3 ? 10 : (level <= 7 ? 12 : 15);
    const tempsParQuestion = level <= 3 ? 30 : (level <= 7 ? 25 : 20);

    const whereClause = {
      estActive: true,
      difficulte
    };

    if (idCategorie) {
      whereClause.idCategorie = parseInt(idCategorie);
    }

    let questions = await Question.findAll({
      where: whereClause,
      include: [
        {
          model: Reponse,
          attributes: ['idReponse', 'texte', 'estCorrecte', 'ordreAffichage']
        },
        {
          model: Categorie,
          as: 'categorieDirecte',
          attributes: ['idCategorie', 'nom', 'icone']
        }
      ],
      order: Sequelize.literal('RAND()'),
      limit: nombreQuestions
    });

    // Si pas assez de questions avec cette difficulté, prendre d'autres
    if (questions.length < nombreQuestions) {
      const remaining = nombreQuestions - questions.length;
      const existingIds = questions.map(q => q.idQuestion);
      
      const additionalQuestions = await Question.findAll({
        where: {
          estActive: true,
          idQuestion: { [Op.notIn]: existingIds },
          ...(idCategorie && { idCategorie: parseInt(idCategorie) })
        },
        include: [
          {
            model: Reponse,
            attributes: ['idReponse', 'texte', 'estCorrecte', 'ordreAffichage']
          },
          {
            model: Categorie,
            as: 'categorieDirecte',
            attributes: ['idCategorie', 'nom', 'icone']
          }
        ],
        limit: remaining
      });
      
      questions = [...questions, ...additionalQuestions];
    }

    // Mélanger les réponses pour chaque question
    questions = questions.map(q => {
      const questionJson = q.toJSON();
      questionJson.Reponses = questionJson.Reponses.sort(() => Math.random() - 0.5);
      return questionJson;
    });

    res.json({
      success: true,
      level: level,
      difficulte,
      nombreQuestions: questions.length,
      tempsParQuestion,
      data: questions
    });
  } catch (error) {
    console.error('Erreur getQuestionsForLevel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des questions pour le niveau',
      error: error.message
    });
  }
};

/**
 * 7. Récupérer des questions aléatoires (mode Fiesta - Aléatoire)
 * GET /api/questions/random
 */
exports.getRandomQuestions = async (req, res) => {
  try {
    const { limit = 10, difficulte, idCategorie } = req.query;

    const whereClause = { estActive: true };
    
    if (difficulte) {
      whereClause.difficulte = difficulte;
    }
    
    if (idCategorie) {
      whereClause.idCategorie = parseInt(idCategorie);
    }

    let questions = await Question.findAll({
      where: whereClause,
      include: [
        {
          model: Reponse,
          attributes: ['idReponse', 'texte', 'estCorrecte', 'ordreAffichage']
        },
        {
          model: Categorie,
          as: 'categorieDirecte',
          attributes: ['idCategorie', 'nom', 'icone']
        }
      ],
      order: Sequelize.literal('RAND()'),
      limit: parseInt(limit)
    });

    // Mélanger les réponses
    questions = questions.map(q => {
      const questionJson = q.toJSON();
      questionJson.Reponses = questionJson.Reponses.sort(() => Math.random() - 0.5);
      return questionJson;
    });

    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Erreur getRandomQuestions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des questions aléatoires',
      error: error.message
    });
  }
};

/**
 * 8. Récupérer l'explication d'une question
 * GET /api/questions/:idQuestion/explication
 */
exports.getQuestionExplication = async (req, res) => {
  try {
    const { idQuestion } = req.params;

    const question = await Question.findByPk(idQuestion, {
      include: [
        {
          model: Explication,
          attributes: ['idExplication', 'texte', 'source', 'lienRessource']
        },
        {
          model: Reponse,
          attributes: ['idReponse', 'texte', 'estCorrecte'],
          where: { estCorrecte: true },
          required: false
        }
      ]
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question non trouvée'
      });
    }

    res.json({
      success: true,
      data: {
        idQuestion: question.idQuestion,
        texte: question.texte,
        mediaURL: question.mediaURL,
        bonneReponse: question.Reponses?.[0]?.texte,
        explication: question.Explication
      }
    });
  } catch (error) {
    console.error('Erreur getQuestionExplication:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'explication',
      error: error.message
    });
  }
};

/**
 * 9. Vérifier une réponse
 * POST /api/questions/:idQuestion/verify
 */
exports.verifyAnswer = async (req, res) => {
  try {
    const { idQuestion } = req.params;
    const { idReponse, tempsReponse } = req.body;

    const question = await Question.findByPk(idQuestion, {
      include: [
        {
          model: Reponse,
          attributes: ['idReponse', 'texte', 'estCorrecte']
        },
        {
          model: Explication,
          attributes: ['idExplication', 'texte', 'source', 'lienRessource']
        }
      ]
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question non trouvée'
      });
    }

    const reponseChoisie = question.Reponses.find(r => r.idReponse === parseInt(idReponse));
    const bonneReponse = question.Reponses.find(r => r.estCorrecte);

    if (!reponseChoisie) {
      return res.status(400).json({
        success: false,
        message: 'Réponse non valide'
      });
    }

    const estCorrecte = reponseChoisie.estCorrecte;
    
    // Calculer les points bonus si réponse rapide
    let pointsGagnes = 0;
    if (estCorrecte) {
      pointsGagnes = question.points || 10;
      // Bonus temps: +50% si réponse en moins de 5 secondes
      if (tempsReponse && tempsReponse < 5) {
        pointsGagnes = Math.round(pointsGagnes * 1.5);
      } else if (tempsReponse && tempsReponse < 10) {
        pointsGagnes = Math.round(pointsGagnes * 1.2);
      }
    }

    res.json({
      success: true,
      data: {
        estCorrecte,
        reponseChoisie: {
          idReponse: reponseChoisie.idReponse,
          texte: reponseChoisie.texte
        },
        bonneReponse: {
          idReponse: bonneReponse?.idReponse,
          texte: bonneReponse?.texte
        },
        pointsGagnes,
        explication: question.Explication
      }
    });
  } catch (error) {
    console.error('Erreur verifyAnswer:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de la réponse',
      error: error.message
    });
  }
};

/**
 * 10. Récupérer une question par son ID
 * GET /api/questions/:idQuestion
 */
exports.getQuestionById = async (req, res) => {
  try {
    const { idQuestion } = req.params;

    const question = await Question.findByPk(idQuestion, {
      include: [
        {
          model: Reponse,
          attributes: ['idReponse', 'texte', 'estCorrecte', 'ordreAffichage']
        },
        {
          model: Categorie,
          as: 'categorieDirecte',
          attributes: ['idCategorie', 'nom', 'icone']
        }
      ]
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question non trouvée'
      });
    }

    // Mélanger les réponses
    const questionJson = question.toJSON();
    questionJson.Reponses = questionJson.Reponses.sort(() => Math.random() - 0.5);

    res.json({
      success: true,
      data: questionJson
    });
  } catch (error) {
    console.error('Erreur getQuestionById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la question',
      error: error.message
    });
  }
};

/**
 * 11. Statistiques des questions
 * GET /api/questions/stats
 */
exports.getQuestionsStats = async (req, res) => {
  try {
    const totalQuestions = await Question.count({ where: { estActive: true } });
    
    const parCategorie = await Question.findAll({
      attributes: [
        'idCategorie',
        [Sequelize.fn('COUNT', Sequelize.col('id_question')), 'count']
      ],
      where: { estActive: true },
      group: ['idCategorie'],
      include: [{
        model: Categorie,
        as: 'categorieDirecte',
        attributes: ['nom']
      }]
    });

    const parDifficulte = await Question.findAll({
      attributes: [
        'difficulte',
        [Sequelize.fn('COUNT', Sequelize.col('id_question')), 'count']
      ],
      where: { estActive: true },
      group: ['difficulte']
    });

    res.json({
      success: true,
      data: {
        total: totalQuestions,
        parCategorie: parCategorie.map(p => ({
          categorie: p.categorieDirecte?.nom || 'Non catégorisé',
          count: parseInt(p.dataValues.count)
        })),
        parDifficulte: parDifficulte.map(p => ({
          difficulte: p.difficulte,
          count: parseInt(p.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Erreur getQuestionsStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};