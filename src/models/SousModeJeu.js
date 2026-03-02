const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle SousModeJeu - Sous-modes de jeu (ex: Challenges, Aléatoire, Défier des amis pour Fiesta)
 */
const SousModeJeu = sequelize.define('SousModeJeu', {
  idSousMode: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_sous_mode'
  },
  idMode: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_mode',
    references: {
      model: 'modes_jeu',
      key: 'id_mode'
    }
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icone: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  estActif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'est_actif'
  },
  configuation: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Configuration spécifique au sous-mode (nombre de questions, temps, etc.)'
  }
}, {
  tableName: 'sous_modes_jeu',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['id_mode', 'nom']
    }
  ]
});

module.exports = SousModeJeu;
