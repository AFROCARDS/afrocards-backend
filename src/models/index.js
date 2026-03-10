const Article = require('./Article');
const sequelize = require('../config/database');

// ==========================================
// IMPORTS DES MODÈLES
// ==========================================

// 1. Utilisateurs & Acteurs
const Utilisateur = require('./Utilisateur');
const Joueur = require('./Joueur');
const Partenaire = require('./Partenaire');

// 2. Contenu (Quiz)
const Categorie = require('./Categorie');
const Quiz = require('./Quiz');
const Question = require('./Question');
const Reponse = require('./Reponse');
const Explication = require('./Explication');

// 3. Jeu
const ModeJeu = require('./ModeJeu');
const SousModeJeu = require('./SousModeJeu');
const Partie = require('./Partie');
const Niveau = require('./Niveau');
const ProgressionNiveau = require('./ProgressionNiveau');
const Challenge = require('./Challenge');

// 4. Marketing (Partenaires)
const ChallengeSponsorise = require('./ChallengeSponsorise');
const Promotion = require('./Promotion');
const Publicite = require('./Publicite');

// 5. Économie & Gamification
const Ressource = require('./Ressource');
const Coin = require('./Coin');
const PointsVie = require('./PointsVie');
const XP = require('./XP');
const Badge = require('./Badge');
const Trophee = require('./Trophee');
const InventaireBadge = require('./InventaireBadge');
const InventaireTrophee = require('./InventaireTrophee');
const Classement = require('./Classement');
const HistoriqueTransaction = require('./HistoriqueTransaction');

// 6. Social (NOUVEAU)
const Message = require('./Message');
const Notification = require('./Notification');
const NotificationParametre = require('./NotificationParametre');
const Signalement = require('./Signalement');
const SignalementQuestion = require('./SignalementQuestion');
const Ami = require('./Ami');

// ==========================================
// DÉFINITION DES ASSOCIATIONS
// ==========================================

const defineAssociations = () => {
  // ========== UTILISATEURS ==========
  
  // 1. UTILISATEUR ↔ JOUEUR (1:1)
  Utilisateur.hasOne(Joueur, {
    foreignKey: 'idUtilisateur',
    onDelete: 'CASCADE'
  });
  Joueur.belongsTo(Utilisateur, {
    foreignKey: 'idUtilisateur'
  });

  // 2. UTILISATEUR ↔ PARTENAIRE (1:1)
  Utilisateur.hasOne(Partenaire, {
    foreignKey: 'idUtilisateur',
    onDelete: 'CASCADE'
  });
  Partenaire.belongsTo(Utilisateur, {
    foreignKey: 'idUtilisateur'
  });

  // ========== QUIZ & QUESTIONS ==========

  // 3. QUIZ ↔ QUESTION (1:N)
  Quiz.hasMany(Question, {
    foreignKey: 'idQuiz',
    onDelete: 'CASCADE'
  });
  Question.belongsTo(Quiz, {
    foreignKey: 'idQuiz'
  });

  // 4. QUESTION ↔ RÉPONSE (1:N)
  Question.hasMany(Reponse, {
    foreignKey: 'idQuestion',
    onDelete: 'CASCADE'
  });
  Reponse.belongsTo(Question, {
    foreignKey: 'idQuestion'
  });

  // 5. QUESTION ↔ EXPLICATION (1:1)
  Question.hasOne(Explication, {
    foreignKey: 'idQuestion',
    onDelete: 'CASCADE'
  });
  Explication.belongsTo(Question, {
    foreignKey: 'idQuestion'
  });

  // 6. QUIZ ↔ CATÉGORIE (N:N)
  Quiz.belongsToMany(Categorie, {
    through: 'quiz_categories',
    foreignKey: 'idQuiz',
    otherKey: 'idCategorie'
  });
  Categorie.belongsToMany(Quiz, {
    through: 'quiz_categories',
    foreignKey: 'idCategorie',
    otherKey: 'idQuiz'
  });

  // 7. QUESTION ↔ CATÉGORIE (N:N)
  Question.belongsToMany(Categorie, {
    through: 'question_categories',
    foreignKey: 'idQuestion',
    otherKey: 'idCategorie'
  });
  Categorie.belongsToMany(Question, {
    through: 'question_categories',
    foreignKey: 'idCategorie',
    otherKey: 'idQuestion'
  });

  // 7b. CATÉGORIE ↔ QUESTION (1:N) - Association directe
  Categorie.hasMany(Question, {
    foreignKey: 'idCategorie',
    as: 'questionsDirectes'
  });
  Question.belongsTo(Categorie, {
    foreignKey: 'idCategorie',
    as: 'categorieDirecte'
  });

  // ========== PARTIES ==========

  // 8. JOUEUR ↔ PARTIE (1:N)
  Joueur.hasMany(Partie, {
    foreignKey: 'idJoueur',
    onDelete: 'CASCADE'
  });
  Partie.belongsTo(Joueur, {
    foreignKey: 'idJoueur'
  });

  // Association pour l'adversaire (Partie -> Joueur)
  Partie.belongsTo(Joueur, {
    foreignKey: 'idAdversaire',
    as: 'adversaire'
  });

  // 9. QUIZ ↔ PARTIE (1:N)
  Quiz.hasMany(Partie, {
    foreignKey: 'idQuiz'
  });
  Partie.belongsTo(Quiz, {
    foreignKey: 'idQuiz'
  });

  // 10. MODEJEU ↔ PARTIE (1:N)
  ModeJeu.hasMany(Partie, {
    foreignKey: 'idMode'
  });
  Partie.belongsTo(ModeJeu, {
    foreignKey: 'idMode'
  });

  // 10b. MODEJEU ↔ NIVEAU (1:N)
  ModeJeu.hasMany(Niveau, {
    foreignKey: 'idMode',
    onDelete: 'CASCADE'
  });
  Niveau.belongsTo(ModeJeu, {
    foreignKey: 'idMode'
  });

  // 10e. MODEJEU ↔ SOUSMODEJEU (1:N)
  ModeJeu.hasMany(SousModeJeu, {
    foreignKey: 'idMode',
    as: 'sousModes',
    onDelete: 'CASCADE'
  });
  SousModeJeu.belongsTo(ModeJeu, {
    foreignKey: 'idMode',
    as: 'modeJeu'
  });

  // 10c. JOUEUR ↔ PROGRESSIONNIVEAU (1:N)
  Joueur.hasMany(ProgressionNiveau, {
    foreignKey: 'idJoueur',
    onDelete: 'CASCADE'
  });
  ProgressionNiveau.belongsTo(Joueur, {
    foreignKey: 'idJoueur'
  });

  // 10d. NIVEAU ↔ PROGRESSIONNIVEAU (1:N)
  Niveau.hasMany(ProgressionNiveau, {
    foreignKey: 'idNiveau',
    onDelete: 'CASCADE'
  });
  ProgressionNiveau.belongsTo(Niveau, {
    foreignKey: 'idNiveau'
  });

  // ========== CHALLENGES (PvP) ==========

  // JOUEUR ↔ CHALLENGE (1:N) - Joueur 1
  Joueur.hasMany(Challenge, {
    foreignKey: 'idJoueur1',
    as: 'challengesInities',
    onDelete: 'CASCADE'
  });
  Challenge.belongsTo(Joueur, {
    foreignKey: 'idJoueur1',
    as: 'joueur1'
  });

  // JOUEUR ↔ CHALLENGE (1:N) - Joueur 2
  Joueur.hasMany(Challenge, {
    foreignKey: 'idJoueur2',
    as: 'challengesRecus',
    onDelete: 'SET NULL'
  });
  Challenge.belongsTo(Joueur, {
    foreignKey: 'idJoueur2',
    as: 'joueur2'
  });

  // JOUEUR ↔ CHALLENGE (1:N) - Gagnant
  Joueur.hasMany(Challenge, {
    foreignKey: 'idGagnant',
    as: 'challengesGagnes',
    onDelete: 'SET NULL'
  });
  Challenge.belongsTo(Joueur, {
    foreignKey: 'idGagnant',
    as: 'gagnant'
  });

  // ========== PARTENAIRES & MARKETING ==========

  // 11. PARTENAIRE ↔ CHALLENGE (1:N)
  Partenaire.hasMany(ChallengeSponsorise, {
    foreignKey: 'idPartenaire',
    onDelete: 'CASCADE'
  });
  ChallengeSponsorise.belongsTo(Partenaire, {
    foreignKey: 'idPartenaire'
  });

  // 12. PARTENAIRE ↔ PROMOTION (1:N)
  Partenaire.hasMany(Promotion, {
    foreignKey: 'idPartenaire',
    onDelete: 'CASCADE'
  });
  Promotion.belongsTo(Partenaire, {
    foreignKey: 'idPartenaire'
  });

  // 13. PARTENAIRE ↔ PUBLICITÉ (1:N)
  Partenaire.hasMany(Publicite, {
    foreignKey: 'idPartenaire',
    onDelete: 'CASCADE'
  });
  Publicite.belongsTo(Partenaire, {
    foreignKey: 'idPartenaire'
  });

  // ========== ÉCONOMIE & GAMIFICATION ==========

  // 14. JOUEUR ↔ COIN (1:1)
  Joueur.hasOne(Coin, {
    foreignKey: 'idJoueur',
    onDelete: 'CASCADE'
  });
  Coin.belongsTo(Joueur, {
    foreignKey: 'idJoueur'
  });

  // 15. JOUEUR ↔ pointSVIE (1:1)
  Joueur.hasOne(PointsVie, {
    foreignKey: 'idJoueur',
    onDelete: 'CASCADE'
  });
  PointsVie.belongsTo(Joueur, {
    foreignKey: 'idJoueur'
  });

  // 16. JOUEUR ↔ XP (1:1)
  Joueur.hasOne(XP, {
    foreignKey: 'idJoueur',
    onDelete: 'CASCADE'
  });
  XP.belongsTo(Joueur, {
    foreignKey: 'idJoueur'
  });

  // 17. JOUEUR ↔ BADGE (N:N via InventaireBadge) - ASSOCIATIONS AMÉLIORÉES
  Joueur.belongsToMany(Badge, {
    through: InventaireBadge,
    foreignKey: 'idJoueur',
    otherKey: 'idBadge',
    as: 'badges'
  });
  Badge.belongsToMany(Joueur, {
    through: InventaireBadge,
    foreignKey: 'idBadge',
    otherKey: 'idJoueur'
  });

  // 18. JOUEUR ↔ TROPHÉE (N:N via InventaireTrophée) - ASSOCIATIONS AMÉLIORÉES
  Joueur.belongsToMany(Trophee, {
    through: InventaireTrophee,
    foreignKey: 'idJoueur',
    otherKey: 'idTrophee',
    as: 'trophees'
  });
  Trophee.belongsToMany(Joueur, {
    through: InventaireTrophee,
    foreignKey: 'idTrophee',
    otherKey: 'idJoueur'
  });

  // 19. INVENTAIREBADGE ↔ BADGE (1:N)
  InventaireBadge.belongsTo(Badge, {
    foreignKey: 'idBadge'
  });
  Badge.hasMany(InventaireBadge, {
    foreignKey: 'idBadge'
  });

  // 20. INVENTAIRETROPHEE ↔ TROPHEE (1:N)
  InventaireTrophee.belongsTo(Trophee, {
    foreignKey: 'idTrophee'
  });
  Trophee.hasMany(InventaireTrophee, {
    foreignKey: 'idTrophee'
  });

  // 21. JOUEUR ↔ CLASSEMENT (1:N)
  Joueur.hasMany(Classement, {
    foreignKey: 'idJoueur',
    onDelete: 'CASCADE'
  });
  Classement.belongsTo(Joueur, {
    foreignKey: 'idJoueur'
  });

  // 22. JOUEUR ↔ HISTORIQUE_TRANSACTION (1:N)
  Joueur.hasMany(HistoriqueTransaction, {
    foreignKey: 'idJoueur',
    onDelete: 'CASCADE'
  });
  HistoriqueTransaction.belongsTo(Joueur, {
    foreignKey: 'idJoueur'
  });

  // ========== MODULE SOCIAL (NOUVEAU) ==========

  // 23. JOUEUR ↔ MESSAGE (1:N) - Messages envoyés
  Joueur.hasMany(Message, {
    foreignKey: 'idExpediteur',
    as: 'messagesEnvoyes',
    onDelete: 'CASCADE'
  });
  Message.belongsTo(Joueur, {
    foreignKey: 'idExpediteur',
    as: 'expediteur'
  });

  // 24. JOUEUR ↔ MESSAGE (1:N) - Messages reçus
  Joueur.hasMany(Message, {
    foreignKey: 'idDestinataire',
    as: 'messagesRecus',
    onDelete: 'CASCADE'
  });
  Message.belongsTo(Joueur, {
    foreignKey: 'idDestinataire',
    as: 'destinataire'
  });

  // 25. JOUEUR ↔ NOTIFICATION (1:N)
  Joueur.hasMany(Notification, {
    foreignKey: 'idJoueur',
    onDelete: 'CASCADE'
  });
  Notification.belongsTo(Joueur, {
    foreignKey: 'idJoueur'
  });

  // 26. JOUEUR ↔ NOTIFICATIONPARAMETRE (1:1)
  Joueur.hasOne(NotificationParametre, {
    foreignKey: 'idJoueur',
    onDelete: 'CASCADE'
  });
  NotificationParametre.belongsTo(Joueur, {
    foreignKey: 'idJoueur'
  });

  // 27. JOUEUR ↔ SIGNALEMENT (N:N)
  Joueur.hasMany(Signalement, { foreignKey: 'idSignaleur', as: 'signalementsFaits' });
  Joueur.hasMany(Signalement, { foreignKey: 'idSignale', as: 'signalementsRecus' });
  Signalement.belongsTo(Joueur, { foreignKey: 'idSignaleur', as: 'signaleur' });
  Signalement.belongsTo(Joueur, { foreignKey: 'idSignale', as: 'signale' });

  // 28. JOUEUR ↔ SIGNALEMENTQUESTION (N:N)
  Joueur.hasMany(SignalementQuestion, { foreignKey: 'idSignaleur', as: 'signalementsQuestionsFaits' });
  SignalementQuestion.belongsTo(Joueur, { foreignKey: 'idSignaleur', as: 'signaleur' });
  Question.hasMany(SignalementQuestion, { foreignKey: 'idQuestion', as: 'signalements' });
  SignalementQuestion.belongsTo(Question, { foreignKey: 'idQuestion', as: 'question' });

  // 29. JOUEUR ↔ AMI (Système d'amitié)
  Joueur.hasMany(Ami, {
    foreignKey: 'idJoueur1',
    as: 'demandesEnvoyees',
    onDelete: 'CASCADE'
  });
  Joueur.hasMany(Ami, {
    foreignKey: 'idJoueur2',
    as: 'demandesRecues',
    onDelete: 'CASCADE'
  });
  Ami.belongsTo(Joueur, {
    foreignKey: 'idJoueur1',
    as: 'demandeur'
  });
  Ami.belongsTo(Joueur, {
    foreignKey: 'idJoueur2',
    as: 'destinataire'
  });

  console.log('✅ Associations définies (avec Module Social et Gamification complète)');
};

// Initialiser les associations
defineAssociations();

// Synchroniser les modèles avec la base de données
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Base de données synchronisée');
  } catch (error) {
    console.error('❌ Erreur de synchronisation:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  // Modèles Utilisateurs
  Utilisateur,
  Joueur,
  Partenaire,
  // Modèles Quiz
  Categorie,
  Quiz,
  Question,
  Reponse,
  Explication,
  // Modèles Jeu
  ModeJeu,
  SousModeJeu,
  Partie,
  Niveau,
  ProgressionNiveau,
  Challenge,
  // Modèles Marketing
  ChallengeSponsorise,
  Promotion,
  Publicite,
  // Modèles Économie
  Ressource,
  Coin,
  PointsVie,
  XP,
  Badge,
  Trophee,
  InventaireBadge,
  InventaireTrophee,
  Classement,
  HistoriqueTransaction,
  // Modèles Social
  Message,
  Notification,
  NotificationParametre,
  Signalement,
  SignalementQuestion,
  Ami,
  // Modèle Boutique
  Article
};