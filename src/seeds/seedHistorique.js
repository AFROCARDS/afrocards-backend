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

    console.log(`\n📊 Création de l'historique pour ${joueurs.length} joueur(s)...`);

    // Modes de jeu disponibles
    const modes = ['Stage', 'Fiesta', 'Défi', 'Challenge'];
    const challenges = ['MTN-AGOJIE', 'Orange Money', 'Moov Africa', 'Canal+'];

    for (const joueur of joueurs) {
      console.log(`\n👤 Joueur: ${joueur.pseudo}`);

      // Vérifier si le joueur a déjà un historique
      const existingCount = await Partie.count({ where: { idJoueur: joueur.idJoueur } });
      if (existingCount > 5) {
        console.log(`  ⏭️ A déjà ${existingCount} parties, on passe`);
        continue;
      }

      // Créer 8-12 parties par joueur
      const nbParties = 8 + Math.floor(Math.random() * 5);
      
      for (let i = 0; i < nbParties; i++) {
        const mode = modes[Math.floor(Math.random() * modes.length)];
        const isChallenge = mode === 'Challenge';
        const isDuel = mode === 'Défi';
        
        // Sélectionner un adversaire pour les duels
        let adversaire = null;
        let nomAdversaire = null;
        
        if (isDuel && bots.length > 0) {
          adversaire = bots[Math.floor(Math.random() * bots.length)];
          nomAdversaire = adversaire.pseudo;
        } else if (isChallenge) {
          nomAdversaire = challenges[Math.floor(Math.random() * challenges.length)];
        }

        const bonnesReponses = Math.floor(Math.random() * 11); // 0-10
        const totalQuestions = 10;
        const score = bonnesReponses * 10;
        const niveauStage = mode === 'Stage' ? Math.floor(Math.random() * 5) + 1 : null;
        
        // XP et coins basés sur la performance
        const xpGagne = isDuel ? 200 : (isChallenge ? 100 : 20 * bonnesReponses);
        const coinsGagnes = isDuel ? 75 : (isChallenge ? 1000 : 5 * bonnesReponses);

        // Date aléatoire dans les 30 derniers jours
        const datePartie = new Date();
        datePartie.setDate(datePartie.getDate() - Math.floor(Math.random() * 30));

        await Partie.create({
          idJoueur: joueur.idJoueur,
          idQuiz: quizId,
          modeJeu: mode,
          score,
          bonnesReponses,
          totalQuestions,
          xpGagne,
          coinsGagnes,
          niveauStage,
          idAdversaire: adversaire?.idJoueur || null,
          nomAdversaire,
          dateDebut: datePartie,
          dateFin: new Date(datePartie.getTime() + 5 * 60 * 1000), // +5 min
          statut: 'termine',
          progression: 100
        });
      }

      console.log(`  ✅ ${nbParties} parties créées`);
    }

    console.log('\n✅ Historique créé avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

seedHistorique();
