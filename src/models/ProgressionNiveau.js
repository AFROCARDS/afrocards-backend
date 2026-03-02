const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modèle ProgressionNiveau - Suivi de la progression d'un joueur sur les niveaux
 */
const ProgressionNiveau = sequelize.define('ProgressionNiveau', {
  idProgression: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idJoueur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'joueurs',
      key: 'id_joueur'
    }
  },
  idNiveau: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'niveaux',
      key: 'id_niveau'
    }
  },
  estDebloque: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si le niveau est débloqué pour ce joueur'
  },
  estComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si le niveau a été complété'
  },
  meilleurScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Meilleur score obtenu sur ce niveau'
  },
  nombreTentatives: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Nombre de fois que le joueur a tenté ce niveau'
  },
  etoiles: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 3
    },
    comment: 'Nombre d\'étoiles obtenues (0-3)'
  },
  dateCompletion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de première complétion'
  }
}, {
  tableName: 'progression_niveaux',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id_joueur', 'id_niveau'],
      name: 'unique_progression_joueur_niveau'
    }
  ]
});

module.exports = ProgressionNiveau;
