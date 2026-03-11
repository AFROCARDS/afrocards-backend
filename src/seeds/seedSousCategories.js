/**
 * Script pour ajouter les sous-catégories
 * Ces sous-catégories seront liées aux catégories existantes
 * Exécution: node src/seeds/seedSousCategories.js
 */

const sequelize = require('../config/database');
const { Categorie, SousCategorie } = require('../models');

async function seedSousCategories() {
  try {
    console.log('🔄 Ajout des sous-catégories...\n');

    // Récupérer toutes les catégories
    const categories = await Categorie.findAll();

    if (categories.length === 0) {
      console.log('⚠️ Aucune catégorie trouvée. Créez d\'abord les catégories.');
      return;
    }

    // Définir les sous-catégories par catégorie (par ID)
    const sousCategoriesToAdd = {
      1: [ // Géographie
        { nom: 'Capitales', description: 'Questions sur les capitales du monde' },
        { nom: 'Continents', description: 'Questions sur les continents et régions' },
        { nom: 'Fleuves et montagnes', description: 'Questions sur la géographie physique' },
        { nom: 'Pays africains', description: 'Questions spécifiques sur l\'Afrique' }
      ],
      2: [ // Histoire
        { nom: 'Préhistoire', description: 'Les débuts de l\'humanité' },
        { nom: 'Histoire africaine', description: 'Royaumes et empires africains' },
        { nom: 'Histoire moderne', description: 'À partir du 15ème siècle' },
        { nom: 'Personnages historiques', description: 'Les grands leaders de l\'histoire' }
      ],
      3: [ // Culture
        { nom: 'Arts et musique', description: 'Arts visuels, musique, danse' },
        { nom: 'Traditions africaines', description: 'Coutumes et traditions du continent' },
        { nom: 'Littérature', description: 'Écrivains et œuvres littéraires' },
        { nom: 'Cinéma africain', description: 'Films et réalisateurs africains' }
      ],
      4: [ // Littérature
        { nom: 'Auteurs africains', description: 'Écrivains du continent africain' },
        { nom: 'Poésie', description: 'Poètes et poésies du monde' },
        { nom: 'Contes et légendes', description: 'Contes traditionnels africains' },
        { nom: 'Romans modernes', description: 'Littérature contemporaine' }
      ],
      5: [ // Science
        { nom: 'Biologie', description: 'Faits sur les êtres vivants' },
        { nom: 'Chimie', description: 'Éléments et réactions chimiques' },
        { nom: 'Astronomie', description: 'Système solaire et univers' },
        { nom: 'Écologie', description: 'Environnement et biodiversité' }
      ]
    };

    let totalAdded = 0;

    for (const categorie of categories) {
      const sousCategories = sousCategoriesToAdd[categorie.idCategorie];
      
      if (sousCategories && sousCategories.length > 0) {
        for (const sousCat of sousCategories) {
          // Vérifier si la sous-catégorie n'existe pas déjà
          const existing = await SousCategorie.findOne({
            where: {
              idCategorie: categorie.idCategorie,
              nom: sousCat.nom
            }
          });

          if (!existing) {
            await SousCategorie.create({
              idCategorie: categorie.idCategorie,
              nom: sousCat.nom,
              description: sousCat.description,
              icone: null
            });
            totalAdded++;
            console.log(`✅ ${sousCat.nom} → ${categorie.nom}`);
          } else {
            console.log(`⏭️ ${sousCat.nom} existe déjà pour ${categorie.nom}`);
          }
        }
        console.log('');
      }
    }

    console.log(`\n✅ ${totalAdded} nouvelles sous-catégories ajoutées!`);
    console.log('Les sous-catégories seront maintenant retournées avec les catégories');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

seedSousCategories();
