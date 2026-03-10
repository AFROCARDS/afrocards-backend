
/**
 * Script de seed pour créer les articles de la boutique
 * Exécuter avec: node src/seeds/seedBoutique.js
 */

require('dotenv').config();
const { Article } = require('../models');
const sequelize = require('../config/database');

const articles = [
  // === VIES ===
  {
    nom: '1 Vie',
    description: 'Récupérez une vie pour continuer à jouer',
    prix: 50,
    image: 'heart_1.png',
    type: 'vie',
    valeur: 1,
    categorie: 'consommable',
  },
  {
    nom: 'Pack 3 Vies',
    description: 'Rechargez 3 vies d\'un coup',
    prix: 120,
    image: 'heart_3.png',
    type: 'vie',
    valeur: 3,
    categorie: 'consommable',
  },
  {
    nom: 'Pack 5 Vies',
    description: 'Rechargez toutes vos vies (5 vies)',
    prix: 180,
    image: 'heart_5.png',
    type: 'vie',
    valeur: 5,
    categorie: 'consommable',
  },
  
  // === BOOST XP ===
  {
    nom: 'Boost XP x2 (30min)',
    description: 'Doublez vos gains XP pendant 30 minutes',
    prix: 100,
    image: 'xp_boost_2x.png',
    type: 'xp_boost',
    valeur: 2,
    duree: 30,
    categorie: 'boost',
  },
  {
    nom: 'Boost XP x2 (1h)',
    description: 'Doublez vos gains XP pendant 1 heure',
    prix: 180,
    image: 'xp_boost_2x_1h.png',
    type: 'xp_boost',
    valeur: 2,
    duree: 60,
    categorie: 'boost',
  },
  {
    nom: 'Boost XP x3 (30min)',
    description: 'Triplez vos gains XP pendant 30 minutes',
    prix: 250,
    image: 'xp_boost_3x.png',
    type: 'xp_boost',
    valeur: 3,
    duree: 30,
    categorie: 'boost',
  },
  
  // === COINS ===
  {
    nom: 'Pack 100 Pièces',
    description: 'Obtenez 100 pièces instantanément',
    prix: 0, // Gratuit (pub ou offre spéciale)
    image: 'coins_100.png',
    type: 'coins',
    valeur: 100,
    categorie: 'monnaie',
    actif: false, // Désactivé pour l'instant
  },
  
  // === PREMIUM ===
  {
    nom: 'Pass VIP (7 jours)',
    description: 'Vies illimitées + Boost XP x1.5 permanent pendant 7 jours',
    prix: 500,
    image: 'vip_7.png',
    type: 'premium',
    valeur: 1,
    duree: 10080, // 7 jours en minutes
    categorie: 'premium',
  },
  {
    nom: 'Pass VIP (30 jours)',
    description: 'Vies illimitées + Boost XP x1.5 permanent pendant 30 jours',
    prix: 1500,
    image: 'vip_30.png',
    type: 'premium',
    valeur: 1,
    duree: 43200, // 30 jours en minutes
    categorie: 'premium',
  },
  
  // === AVATARS ===
  {
    nom: 'Avatar Lion',
    description: 'Un avatar majestueux représentant le roi de la savane',
    prix: 200,
    image: 'avatar_lion.png',
    type: 'avatar',
    valeur: 1,
    categorie: 'cosmétique',
  },
  {
    nom: 'Avatar Elephant',
    description: 'Un avatar imposant symbolisant la sagesse africaine',
    prix: 200,
    image: 'avatar_elephant.png',
    type: 'avatar',
    valeur: 2,
    categorie: 'cosmétique',
  },
  {
    nom: 'Avatar Aigle',
    description: 'Un avatar noble représentant la liberté',
    prix: 300,
    image: 'avatar_aigle.png',
    type: 'avatar',
    valeur: 3,
    categorie: 'cosmétique',
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base OK');
    
    // Synchroniser le modèle pour créer/mettre à jour les colonnes
    await Article.sync({ alter: true });
    console.log('Table articles synchronisée');
    
    for (const article of articles) {
      const [a, created] = await Article.findOrCreate({
        where: { nom: article.nom },
        defaults: article,
      });
      if (created) {
        console.log(`✅ Article créé: ${a.nom}`);
      } else {
        // Mettre à jour l'article existant
        await a.update(article);
        console.log(`🔄 Article mis à jour: ${a.nom}`);
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
