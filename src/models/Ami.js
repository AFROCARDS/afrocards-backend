const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle Ami (Friendship)
 * Gère les relations d'amitié entre joueurs
 */
const Ami = sequelize.define('Ami', {
  idAmitie: {
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
    },
    comment: 'Joueur qui a envoyé la demande'
  },
  idJoueur2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'joueurs',
      key: 'id_joueur'
    },
    comment: 'Joueur qui a reçu la demande'
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'accepte', 'refuse', 'bloque'),
    defaultValue: 'en_attente',
    comment: 'Statut de la relation'
  },
  dateEnvoi: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dateReponse: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'amis',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['idJoueur1', 'idJoueur2']
    }
  ]
});

module.exports = Ami;
