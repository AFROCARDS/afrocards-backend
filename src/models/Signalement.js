const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Signalement = sequelize.define('Signalement', {
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
  idSignale: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'joueurs',
      key: 'id_joueur'
    }
  },
  motif: {
    type: DataTypes.STRING(100), // Ex: 'Langage inapproprié', 'Harcèlement', etc.
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
  tableName: 'signalements',
  timestamps: true
});

module.exports = Signalement;
