const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  idQuestion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idQuiz: {
    type: DataTypes.INTEGER,
    allowNull: true, // Peut être null pour les questions standalone
    references: {
      model: 'quiz',
      key: 'id_quiz'
    }
  },
  idCategorie: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id_categorie'
    }
  },
  texte: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('QCM', 'VraiFaux', 'Completion'),
    defaultValue: 'QCM'
  },
  difficulte: {
    type: DataTypes.ENUM('facile', 'moyen', 'difficile'),
    defaultValue: 'moyen',
    comment: 'Niveau de difficulté de la question'
  },
  priorite: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Priorité d\'affichage (1 = haute, 5 = basse)'
  },
  mediaURL: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL d\'une image ou vidéo illustrant la question'
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: 'Points gagnés pour une bonne réponse'
  },
  tempsReponse: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Temps de réponse en secondes'
  },
  estActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'questions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['id_categorie'] },
    { fields: ['difficulte'] },
    { fields: ['est_active'] }
  ]
});

module.exports = Question;