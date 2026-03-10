const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modèle Article (produit boutique)
const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  prix: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('vie', 'xp_boost', 'coins', 'avatar', 'badge', 'premium'),
    allowNull: false,
    defaultValue: 'vie',
  },
  valeur: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Valeur de l\'article (nombre de vies, multiplicateur XP, etc.)',
  },
  duree: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Durée en minutes pour les boosts temporaires',
  },
  categorie: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'consommable',
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'articles',
  timestamps: true,
});

module.exports = Article;
