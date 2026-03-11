const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SousCategorie = sequelize.define('SousCategorie', {
  idSousCategorie: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idCategorie: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'idCategorie'
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
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'sous_categories',
  timestamps: true,
  underscored: true
});

module.exports = SousCategorie;
