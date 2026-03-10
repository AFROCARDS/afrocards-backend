const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilisateur = sequelize.define('Utilisateur', {
  idUtilisateur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  motDePasse: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  dateCreation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dernierLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  statutCompte: {
    type: DataTypes.ENUM('actif', 'suspendu', 'supprime'),
    defaultValue: 'actif'
  },
  derniereActivite: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resetPasswordToken: {
  type: DataTypes.STRING(64),
  allowNull: true
},
resetPasswordExpiry: {
  type: DataTypes.DATE,
  allowNull: true
},
  typeUtilisateur: {
    type: DataTypes.ENUM('joueur', 'partenaire', 'admin', 'bot'),
    allowNull: false
  }
}, {
  tableName: 'utilisateurs',
  timestamps: true,
  createdAt: 'dateCreation',
  updatedAt: 'derniereActivite'
});

module.exports = Utilisateur;