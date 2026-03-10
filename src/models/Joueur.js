const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Joueur = sequelize.define('Joueur', {
  idJoueur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idUtilisateur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'utilisateurs',
      key: 'id_utilisateur'
    }
  },
  pseudo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  avatarURL: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: '/avatars/default.png'
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 13,
      max: 120
    }
  },
  pays: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  nationalite: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  scoreTotal: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  niveau: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  // Champs de progression
  pointsXP: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  totalXP: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 },
    comment: 'XP total cumulé depuis toujours'
  },
  niveauStage: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: { min: 1 },
    comment: 'Numéro du stage actuel (1, 2, 3...)'
  },
  coins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  vies: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: { min: 0, max: 5 }
  },
  niveauActuel: {
    type: DataTypes.STRING(50),
    defaultValue: 'Stage 1'
  },
  maxNiveauDebloque: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: { min: 1 }
  },
  partiesJouees: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  partiesGagnees: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  derniereRegenerationVie: {
    type: DataTypes.DATE,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  statutPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  premiumExpiration: {
    type: DataTypes.DATE,
    allowNull: true
  },
  xpBoostMultiplier: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Multiplicateur XP actif (1 = normal, 2 = double, 3 = triple)'
  },
  xpBoostExpiration: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date d\'expiration du boost XP'
  },
  dateInscription: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'joueurs',
  timestamps: true,
  createdAt: 'dateInscription',
  updatedAt: 'updatedAt'
});

module.exports = Joueur;