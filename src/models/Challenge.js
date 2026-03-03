const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Challenge - Défi entre deux joueurs
 */
const Challenge = sequelize.define('Challenge', {
  idChallenge: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idJoueur1: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'joueurs',
      key: 'id_joueur'
    }
  },
  idJoueur2: {
    type: DataTypes.INTEGER,
    allowNull: true, // Null pendant la recherche d'adversaire
    references: {
      model: 'joueurs',
      key: 'id_joueur'
    }
  },
  nombreQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    validate: {
      isIn: [[10, 15, 20]]
    }
  },
  scoreJoueur1: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  scoreJoueur2: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  idGagnant: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'joueurs',
      key: 'id_joueur'
    }
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'en_cours', 'termine', 'annule'),
    defaultValue: 'en_attente'
  },
  xpMise: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  coinsMise: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  xpRecompense: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  coinsRecompense: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dateDebut: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dateFin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'challenges',
  timestamps: true,
  underscored: true
});

module.exports = Challenge;
