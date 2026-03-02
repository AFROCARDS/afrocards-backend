/**
 * Script de seed pour créer les catégories, modes de jeu et niveaux initiaux
 * 
 * Exécuter avec: node src/seeds/seedCategoriesAndModes.js
 */

// Charger les variables d'environnement AVANT tout import
require('dotenv').config();

const sequelize = require('../config/database');
const { Categorie, ModeJeu, SousModeJeu, Niveau } = require('../models');

// Catégories à créer
const categories = [
  {
    nom: 'Géographie',
    description: 'Questions sur les pays, capitales, continents et géographie mondiale',
    icone: '🌍'
  },
  {
    nom: 'Histoire',
    description: 'Questions sur l\'histoire de l\'Afrique et du monde',
    icone: '📚'
  },
  {
    nom: 'Arts',
    description: 'Questions sur l\'art africain, musique, danse et culture',
    icone: '🎨'
  },
  {
    nom: 'Science',
    description: 'Questions sur les sciences et technologies',
    icone: '🔬'
  },
  {
    nom: 'Biologie',
    description: 'Questions sur la biologie, la faune et la flore africaine',
    icone: '🧬'
  },
  {
    nom: 'Politique',
    description: 'Questions sur la politique et les institutions africaines',
    icone: '⚖️'
  }
];

// Modes de jeu à créer
const modesJeu = [
  {
    nom: 'Stages',
    description: 'Progressez à travers des niveaux de difficulté croissante. Débloquez de nouveaux stages en réussissant les précédents !',
    type: 'solo',
    regles: {
      vies: 5,
      tempsParQuestion: 30,
      pointsParBonneReponse: 10,
      pointsBonusRapidite: 5,
      nombreNiveaux: 10,
      questionsParNiveau: 10
    }
  },
  {
    nom: 'Fiesta',
    description: 'Mode festif avec questions aléatoires ! Jouez sans pression et gagnez des récompenses bonus.',
    type: 'solo',
    regles: {
      vies: 3,
      tempsParQuestion: 20,
      pointsParBonneReponse: 15,
      bonusCombo: true,
      questionsAleatoires: true,
      recompensesDoubles: true
    }
  }
];

// Fonction pour générer les niveaux du mode Stages
const generateNiveaux = (idModeStages) => {
  const niveaux = [];
  
  // Configuration par difficulté
  const difficultyConfig = {
    facile: { tempsParQuestion: 30, nombreQuestions: 10, xpRecompense: 50, coinsRecompense: 10, scoreMinimum: 60 },
    moyen: { tempsParQuestion: 25, nombreQuestions: 12, xpRecompense: 75, coinsRecompense: 15, scoreMinimum: 70 },
    difficile: { tempsParQuestion: 20, nombreQuestions: 15, xpRecompense: 100, coinsRecompense: 25, scoreMinimum: 80 }
  };

  // Générer 10 niveaux
  for (let i = 1; i <= 10; i++) {
    let difficulte;
    if (i <= 3) difficulte = 'facile';
    else if (i <= 7) difficulte = 'moyen';
    else difficulte = 'difficile';

    const config = difficultyConfig[difficulte];

    niveaux.push({
      idMode: idModeStages,
      numero: i,
      nom: `Niveau ${i.toString().padStart(2, '0')}`,
      difficulte: difficulte,
      nombreQuestions: config.nombreQuestions,
      tempsParQuestion: config.tempsParQuestion,
      xpRecompense: config.xpRecompense + (i * 10), // Augmente avec le niveau
      coinsRecompense: config.coinsRecompense + (i * 5), // Augmente avec le niveau
      scoreMinimum: config.scoreMinimum,
      estDebloque: i === 1 // Seul le niveau 1 est débloqué par défaut
    });
  }

  return niveaux;
};

// Sous-modes pour le mode Fiesta
const sousModesFiresta = [
  {
    nom: 'Challenges',
    description: 'Relevez des défis quotidiens et hebdomadaires pour gagner des récompenses spéciales !',
    icone: 'trophy',
    ordre: 1,
    estActif: true,
    configuation: {
      tempsParQuestion: 20,
      nombreQuestions: 10,
      recompenseXp: 100,
      recompenseCoins: 50,
      typeChallenge: ['quotidien', 'hebdomadaire', 'special']
    }
  },
  {
    nom: 'Aleatoire',
    description: 'Questions aléatoires de toutes catégories. Testez vos connaissances générales !',
    icone: 'shuffle',
    ordre: 2,
    estActif: true,
    configuation: {
      tempsParQuestion: 25,
      nombreQuestions: 15,
      recompenseXp: 75,
      recompenseCoins: 30,
      categoriesAleatoires: true,
      difficulteMixte: true
    }
  },
  {
    nom: 'Defier des amis',
    description: 'Défiez vos amis en duel et prouvez que vous êtes le meilleur !',
    icone: 'people',
    ordre: 3,
    estActif: true,
    configuation: {
      tempsParQuestion: 15,
      nombreQuestions: 10,
      recompenseXpVictoire: 150,
      recompenseCoinsVictoire: 75,
      recompenseXpDefaite: 25,
      typeDuel: 'pvp',
      tempsAttente: 24 // heures pour répondre
    }
  }
];

async function seed() {
  try {
    // Connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Créer les catégories
    console.log('\n📚 Création des catégories...');
    for (const cat of categories) {
      const [categorie, created] = await Categorie.findOrCreate({
        where: { nom: cat.nom },
        defaults: cat
      });
      
      if (created) {
        console.log(`  ✅ Catégorie créée: ${categorie.nom}`);
      } else {
        console.log(`  ⏩ Catégorie existante: ${categorie.nom}`);
      }
    }

    // Créer les modes de jeu
    console.log('\n🎮 Création des modes de jeu...');
    let modeStages = null;
    let modeFiesta = null;
    
    for (const mode of modesJeu) {
      const [modeJeu, created] = await ModeJeu.findOrCreate({
        where: { nom: mode.nom },
        defaults: mode
      });
      
      if (created) {
        console.log(`  ✅ Mode de jeu créé: ${modeJeu.nom}`);
      } else {
        console.log(`  ⏩ Mode de jeu existant: ${modeJeu.nom}`);
      }

      // Garder une référence au mode Stages pour créer les niveaux
      if (modeJeu.nom === 'Stages') {
        modeStages = modeJeu;
      }
      
      // Garder une référence au mode Fiesta pour créer les sous-modes
      if (modeJeu.nom === 'Fiesta') {
        modeFiesta = modeJeu;
      }
    }

    // Créer les niveaux pour le mode Stages
    if (modeStages) {
      console.log('\n🎯 Création des niveaux pour le mode Stages...');
      const niveaux = generateNiveaux(modeStages.idMode);
      
      for (const niv of niveaux) {
        const [niveau, created] = await Niveau.findOrCreate({
          where: { 
            idMode: niv.idMode, 
            numero: niv.numero 
          },
          defaults: niv
        });
        
        if (created) {
          console.log(`  ✅ Niveau créé: ${niveau.nom} (${niveau.difficulte})`);
        } else {
          console.log(`  ⏩ Niveau existant: ${niveau.nom}`);
        }
      }
    }

    // Créer les sous-modes pour le mode Fiesta
    if (modeFiesta) {
      console.log('\n🎉 Création des sous-modes pour le mode Fiesta...');
      
      for (const sousMode of sousModesFiresta) {
        const [sousModeJeu, created] = await SousModeJeu.findOrCreate({
          where: { 
            idMode: modeFiesta.idMode, 
            nom: sousMode.nom 
          },
          defaults: {
            ...sousMode,
            idMode: modeFiesta.idMode
          }
        });
        
        if (created) {
          console.log(`  ✅ Sous-mode créé: ${sousModeJeu.nom}`);
        } else {
          console.log(`  ⏩ Sous-mode existant: ${sousModeJeu.nom}`);
        }
      }
    }

    console.log('\n🎉 Seed terminé avec succès !');
    
    // Afficher le résumé
    const totalCategories = await Categorie.count();
    const totalModes = await ModeJeu.count();
    const totalNiveaux = await Niveau.count();
    const totalSousModes = await SousModeJeu.count();
    console.log(`\n📊 Résumé:`);
    console.log(`   - Catégories: ${totalCategories}`);
    console.log(`   - Modes de jeu: ${totalModes}`);
    console.log(`   - Niveaux (Stages): ${totalNiveaux}`);
    console.log(`   - Sous-modes (Fiesta): ${totalSousModes}`);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Exécuter le seed
seed();
