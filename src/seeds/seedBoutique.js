
/**
 * Script de seed pour créer les articles de la boutique
 * Exécuter avec: node src/seeds/seedBoutique.js
 */

require('dotenv').config();
const { Article } = require('../models');
const sequelize = require('../config/database');

const articles = [
  {
    nom: 'Carte Premium',
    description: 'Débloquez des avantages exclusifs',
    prix: 2000,
    image: 'premium.png',
  },
  {
    nom: 'Pack de vies',
    description: 'Rechargez vos vies pour continuer à jouer',
    prix: 1500,
    image: 'lives.png',
  },
  {
    nom: 'Avatar spécial',
    description: 'Personnalisez votre profil avec un avatar unique',
    prix: 1000,
    image: 'avatar.png',
  },
  {
    nom: 'Boost XP',
    description: 'Doublez vos points XP pendant 1h',
    prix: 2500,
    image: 'xp.png',
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base OK');
    for (const article of articles) {
      const [a, created] = await Article.findOrCreate({
        where: { nom: article.nom },
        defaults: article,
      });
      if (created) {
        console.log(`✅ Article créé: ${a.nom}`);
      } else {
        console.log(`⏩ Article existant: ${a.nom}`);
      }
    }
    const total = await Article.count();
    console.log(`\n📊 Total articles boutique: ${total}`);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

seed();
