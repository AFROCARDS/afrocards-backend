const { Utilisateur, Joueur, Quiz, Partie, Categorie, Question, Signalement, SignalementQuestion, Challenge, ChallengeSponsorise, Partenaire } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// 1. Obtenir les statistiques du Dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    // Compter les éléments dans la BDD
    const totalUtilisateurs = await Utilisateur.count();
    const totalJoueurs = await Joueur.count();
    const totalQuiz = await Quiz.count();
    const totalPartiesJouees = await Partie.count({ where: { statut: 'termine' } });

    // Nouveaux inscrits ce mois-ci
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const nouveauxUtilisateurs = await Utilisateur.count({
      where: {
        dateCreation: {
          [Op.gte]: startOfMonth
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        global: {
          utilisateurs: totalUtilisateurs,
          joueurs: totalJoueurs,
          quiz: totalQuiz,
          partiesJouees: totalPartiesJouees
        },
        mensuel: {
          nouveauxInscrits: nouveauxUtilisateurs
        }
      }
    });
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 2. Liste de tous les utilisateurs (avec filtre optionnel)
exports.getAllUsers = async (req, res) => {
  try {
    // Pagination simple (optionnelle)
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (type) {
      whereClause.typeUtilisateur = type;
    }

    const utilisateurs = await Utilisateur.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['motDePasse'] }, // SÉCURITÉ : Ne jamais renvoyer le mot de passe
      include: [
        { model: Joueur, attributes: ['pseudo', 'niveau', 'pays'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['dateCreation', 'DESC']]
    });

    res.status(200).json({
      success: true,
      total: utilisateurs.count,
      totalPages: Math.ceil(utilisateurs.count / limit),
      currentPage: parseInt(page),
      data: utilisateurs.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération utilisateurs' });
  }
};

// 3. Modifier le statut d'un compte (Suspendre/Activer)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable' });

    // Empêcher un admin de se suspendre lui-même (optionnel mais recommandé)
    if (utilisateur.idUtilisateur === req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez pas modifier votre propre statut' });
    }

    await utilisateur.update({ statutCompte: statut });

    res.status(200).json({
      success: true,
      message: `Compte passé en statut : ${statut}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur modification statut' });
  }
};

// 4. Modifier le rôle d'un utilisateur (Promouvoir/Rétrograder)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable' });

    await utilisateur.update({ typeUtilisateur: role });

    res.status(200).json({
      success: true,
      message: `Rôle utilisateur mis à jour : ${role}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur modification rôle' });
  }
};

// ============================================
// STATISTIQUES AVANCÉES POUR DASHBOARD
// ============================================

// 5. Evolution des inscriptions sur les 12 derniers mois
exports.getUsersEvolution = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    
    const results = [];
    const now = new Date();
    
    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const count = await Utilisateur.count({
        where: {
          dateCreation: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      results.push({
        mois: monthNames[startDate.getMonth()],
        annee: startDate.getFullYear(),
        label: `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`,
        inscriptions: count
      });
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Erreur getUsersEvolution:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 6. Parties jouées par jour sur les 30 derniers jours
exports.getPartiesEvolution = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const results = [];
    const now = new Date();
    
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const count = await Partie.count({
        where: {
          dateDebut: {
            [Op.between]: [date, endDate]
          }
        }
      });
      
      results.push({
        date: date.toISOString().split('T')[0],
        jour: date.getDate(),
        parties: count
      });
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Erreur getPartiesEvolution:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 7. Questions par catégorie
exports.getQuestionsByCategory = async (req, res) => {
  try {
    const categories = await Categorie.findAll({
      attributes: ['idCategorie', 'nom', 'couleur', 'icone'],
      include: [{
        model: Quiz,
        attributes: ['idQuiz'],
        include: [{
          model: Question,
          attributes: ['idQuestion']
        }]
      }]
    });
    
    const results = categories.map(cat => {
      const totalQuestions = cat.Quizzes?.reduce((acc, quiz) => {
        return acc + (quiz.Questions?.length || 0);
      }, 0) || 0;
      
      return {
        id: cat.idCategorie,
        nom: cat.nom,
        couleur: cat.couleur || '#4CAF50',
        icone: cat.icone,
        questions: totalQuestions
      };
    }).filter(c => c.questions > 0).sort((a, b) => b.questions - a.questions);
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Erreur getQuestionsByCategory:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 8. Top 10 joueurs par score
exports.getTopPlayers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const joueurs = await Joueur.findAll({
      attributes: ['idJoueur', 'pseudo', 'avatarURL', 'scoreTotal', 'niveau', 'partiesJouees', 'partiesGagnees'],
      include: [{
        model: Utilisateur,
        attributes: ['nom', 'email'],
        where: { statutCompte: 'actif' }
      }],
      order: [['scoreTotal', 'DESC']],
      limit: parseInt(limit)
    });
    
    const results = joueurs.map((j, index) => ({
      rang: index + 1,
      id: j.idJoueur,
      pseudo: j.pseudo,
      avatar: j.avatarURL,
      score: j.scoreTotal,
      niveau: j.niveau,
      partiesJouees: j.partiesJouees,
      partiesGagnees: j.partiesGagnees,
      tauxVictoire: j.partiesJouees > 0 ? Math.round((j.partiesGagnees / j.partiesJouees) * 100) : 0
    }));
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Erreur getTopPlayers:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 9. Statistiques des signalements
exports.getSignalementsStats = async (req, res) => {
  try {
    // Signalements utilisateurs
    const signalements = await Signalement.findAll({
      attributes: [
        'statut',
        [sequelize.fn('COUNT', sequelize.col('idSignalement')), 'count']
      ],
      group: ['statut']
    });
    
    // Signalements questions
    const signalementQuestions = await SignalementQuestion.findAll({
      attributes: [
        'statut',
        [sequelize.fn('COUNT', sequelize.col('idSignalementQuestion')), 'count']
      ],
      group: ['statut']
    });
    
    // Format results
    const formatStats = (data) => {
      const stats = { en_attente: 0, traite: 0, rejete: 0, total: 0 };
      data.forEach(item => {
        const count = parseInt(item.dataValues.count);
        stats[item.statut] = count;
        stats.total += count;
      });
      return stats;
    };
    
    res.status(200).json({
      success: true,
      data: {
        utilisateurs: formatStats(signalements),
        questions: formatStats(signalementQuestions),
        totalEnAttente: formatStats(signalements).en_attente + formatStats(signalementQuestions).en_attente
      }
    });
  } catch (error) {
    console.error('Erreur getSignalementsStats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 10. Répartition des utilisateurs par type
exports.getUsersDistribution = async (req, res) => {
  try {
    const distribution = await Utilisateur.findAll({
      attributes: [
        'typeUtilisateur',
        [sequelize.fn('COUNT', sequelize.col('idUtilisateur')), 'count']
      ],
      group: ['typeUtilisateur']
    });
    
    const colors = {
      joueur: '#4CAF50',
      admin: '#E53935',
      partenaire: '#7C4DFF',
      bot: '#FF9800'
    };
    
    const results = distribution.map(item => ({
      type: item.typeUtilisateur,
      count: parseInt(item.dataValues.count),
      couleur: colors[item.typeUtilisateur] || '#9E9E9E'
    }));
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Erreur getUsersDistribution:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 11. Répartition des joueurs par pays
exports.getPlayersByCountry = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const distribution = await Joueur.findAll({
      attributes: [
        'pays',
        [sequelize.fn('COUNT', sequelize.col('idJoueur')), 'count']
      ],
      where: {
        pays: { [Op.ne]: null }
      },
      group: ['pays'],
      order: [[sequelize.fn('COUNT', sequelize.col('idJoueur')), 'DESC']],
      limit: parseInt(limit)
    });
    
    const results = distribution.map(item => ({
      pays: item.pays,
      joueurs: parseInt(item.dataValues.count)
    }));
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Erreur getPlayersByCountry:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 12. Activité récente (dernières inscriptions + parties)
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Derniers utilisateurs inscrits
    const recentUsers = await Utilisateur.findAll({
      attributes: ['idUtilisateur', 'nom', 'email', 'typeUtilisateur', 'dateCreation'],
      include: [{
        model: Joueur,
        attributes: ['pseudo', 'avatarURL']
      }],
      order: [['dateCreation', 'DESC']],
      limit: parseInt(limit)
    });
    
    // Dernières parties terminées
    const recentParties = await Partie.findAll({
      attributes: ['idPartie', 'score', 'dateDebut', 'dateFin'],
      where: { statut: 'termine' },
      include: [{
        model: Joueur,
        attributes: ['pseudo', 'avatarURL']
      }],
      order: [['dateFin', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      success: true,
      data: {
        inscriptions: recentUsers.map(u => ({
          id: u.idUtilisateur,
          nom: u.nom,
          email: u.email,
          type: u.typeUtilisateur,
          pseudo: u.Joueur?.pseudo,
          avatar: u.Joueur?.avatarURL,
          date: u.dateCreation
        })),
        parties: recentParties.map(p => ({
          id: p.idPartie,
          pseudo: p.Joueur?.pseudo,
          avatar: p.Joueur?.avatarURL,
          score: p.score,
          date: p.dateFin
        }))
      }
    });
  } catch (error) {
    console.error('Erreur getRecentActivity:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 13. Stats challenges sponsorisés
exports.getChallengesSponsorisesStats = async (req, res) => {
  try {
    const total = await ChallengeSponsorise.count();
    const actifs = await ChallengeSponsorise.count({
      where: {
        dateDebut: { [Op.lte]: new Date() },
        dateFin: { [Op.gte]: new Date() },
        statut: 'actif'
      }
    });
    const termines = await ChallengeSponsorise.count({
      where: { dateFin: { [Op.lt]: new Date() } }
    });
    const aVenir = await ChallengeSponsorise.count({
      where: { dateDebut: { [Op.gt]: new Date() } }
    });
    
    // Partenaires actifs
    const partenairesActifs = await Partenaire.count({
      where: { statut: 'valide' }
    });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        actifs,
        termines,
        aVenir,
        partenairesActifs
      }
    });
  } catch (error) {
    console.error('Erreur getChallengesSponsorisesStats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};