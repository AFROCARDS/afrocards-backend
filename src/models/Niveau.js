const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Niveau - Représente un niveau dans le mode Stage
 * Chaque niveau a une difficulté, un numéro d'ordre et un statut de déverrouillage
 */
const Niveau = sequelize.define('Niveau', {
  idNiveau: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idMode: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'modes_jeu',
      key: 'id_mode'
    },
    comment: 'Mode de jeu associé (ex: Stages)'
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Numéro du niveau (1, 2, 3...)'
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Nom optionnel du niveau'
  },
  difficulte: {
    type: DataTypes.ENUM('facile', 'moyen', 'difficile'),
    defaultValue: 'facile',
    comment: 'Niveau de difficulté'
  },
  nombreQuestions: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: 'Nombre de questions dans ce niveau'
  },
  tempsParQuestion: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Temps en secondes pour répondre à chaque question'
  },
  xpRecompense: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    comment: 'XP gagnés en complétant le niveau'
  },
  coinsRecompense: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: 'Coins gagnés en complétant le niveau'
  },
  scoreMinimum: {
    type: DataTypes.INTEGER,
    defaultValue: 70,
    comment: 'Score minimum (%) pour réussir le niveau'
  },
  estDebloque: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si le niveau est débloqué par défaut (niveau 1 = true)'
  },
  icone: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
    comment: 'Icône ou image du niveau'
  }
}, {
  tableName: 'niveaux',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id_mode', 'numero'],
      name: 'unique_niveau_par_mode'
    }
  ]
});

module.exports = Niveau;
