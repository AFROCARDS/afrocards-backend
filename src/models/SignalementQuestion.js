const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SignalementQuestion = sequelize.define('SignalementQuestion', {
  idSignalement: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idSignaleur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'joueurs',
      key: 'id_joueur'
    }
  },
  idQuestion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'questions',
      key: 'id_question'
    }
  },
  motif: {
    type: DataTypes.STRING(100), // Ex: 'Erreur de réponse', 'Explication incorrecte', etc.
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'traite', 'rejete'),
    defaultValue: 'en_attente'
  },
  dateCreation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'signalements_questions',
  timestamps: true
});

module.exports = SignalementQuestion;
