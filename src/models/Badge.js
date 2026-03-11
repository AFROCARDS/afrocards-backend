const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Badge = sequelize.define('Badge', {
  idBadge: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  icone: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: '/badges/default.png'
  },
  conditionType: {
    type: DataTypes.STRING(50), 
    allowNull: false,
    comment: 'Ex: "score_total", "parties_jouees", "quiz_parfaits"'
  },
  conditionValeur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'La valeur à atteindre pour débloquer (ex: 1000)'
  },
  couleur: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#78909C'
  },
  recompenseXP: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'badges',
  timestamps: false
});

module.exports = Badge;