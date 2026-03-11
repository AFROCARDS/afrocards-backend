/**
 * Script pour créer les colonnes manquantes dans parties
 * et ajouter des données d'historique de test
 */

const sequelize = require('../config/database');
const { Joueur, Partie, Quiz, Utilisateur } = require('../models');

async function seedHistorique() {
  try {
    console.log('🔄 Ajout des colonnes manquantes à la table parties...');

    // Ajouter les colonnes manquantes
    const columnsToAdd = [
      { name: 'xp_gagne', definition: 'INT DEFAULT 0' },
      { name: 'coins_gagnes', definition: 'INT DEFAULT 0' },
      { name: 'id_adversaire', definition: 'INT NULL' },
      { name: 'nom_adversaire', definition: 'VARCHAR(100) NULL' },
      { name: 'niveau_stage', definition: 'INT NULL' },
      { name: 'bonnes_reponses', definition: 'INT DEFAULT 0' },
      { name: 'total_questions', definition: 'INT DEFAULT 10' }
    ];

    for (const col of columnsToAdd) {
      try {
        await sequelize.query(`ALTER TABLE parties ADD COLUMN ${col.name} ${col.definition}`);
        console.log(`✅ Colonne ${col.name} ajoutée`);
      } catch (e) {
        if (e.message.includes('Duplicate column') || e.message.includes('duplicate column')) {
          console.log(`⏭️ Colonne ${col.name} existe déjà`);
        } else {
          console.error(`❌ Erreur colonne ${col.name}:`, e.message);
        }
      }
    }

    // Récupérer tous les vrais joueurs (pas bots)
    const joueurs = await Joueur.findAll({
      include: [{
        model: Utilisateur,
        where: { typeUtilisateur: 'joueur' }
      }]
    });

    if (joueurs.length === 0) {
      console.log('⚠️ Aucun joueur trouvé');
      return;
    }

    // Récupérer les bots pour les adversaires
    const bots = await Joueur.findAll({
      include: [{
        model: Utilisateur,
        where: { typeUtilisateur: 'bot' }
      }]
    });

    // Récupérer ou créer un quiz
    let quiz = await Quiz.findOne();
    if (!quiz) {
      console.log('⚠️ Aucun quiz trouvé, création d\'un quiz par défaut...');
      quiz = await Quiz.create({
        titre: 'Quiz Général AfroCards',
        description: 'Quiz de culture générale africaine',
        difficulte: 'moyen',
        langue: 'fr',
        duree: 300,
        statut: 'actif'
      });
      console.log(`✅ Quiz créé avec ID: ${quiz.idQuiz}`);
    }

    const quizId = quiz.idQuiz;

    // ⚠️ Les données d'historique ne sont plus ajoutées ici
    // Elles seront créées uniquement par les vraies parties jouées
    console.log('\n📊 Colonnes de la table parties sont à jour');
    console.log('✅ L\'historique sera aliementé uniquement par les vraies parties jouées');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

seedHistorique();
