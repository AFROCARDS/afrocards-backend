const { Partenaire, ChallengeSponsorise, Trophee, Utilisateur, sequelize } = require('../models');

/**
 * Seeder pour les challenges sponsorisés
 * Crée des partenaires, des challenges sponsorisés et des trophées associés
 */
async function seedChallengesSponsorisees() {
  const t = await sequelize.transaction();
  
  try {
    console.log('🌱 Début du seeding des challenges sponsorisés...');

    // ==========================================
    // 1. CRÉER LES UTILISATEURS PARTENAIRES
    // ==========================================
    console.log('📝 Création des utilisateurs partenaires...');

    const partenairesData = [
      {
        email: 'google@partner.com',
        mot_de_passe: 'hashedPassword123', // À remplacer par du vrai hash
        role: 'partenaire',
        nom: 'Google'
      },
      {
        email: 'microsoft@partner.com',
        mot_de_passe: 'hashedPassword123',
        role: 'partenaire',
        nom: 'Microsoft'
      },
      {
        email: 'apple@partner.com',
        mot_de_passe: 'hashedPassword123',
        role: 'partenaire',
        nom: 'Apple'
      },
      {
        email: 'amazon@partner.com',
        mot_de_passe: 'hashedPassword123',
        role: 'partenaire',
        nom: 'Amazon'
      },
      {
        email: 'netflix@partner.com',
        mot_de_passe: 'hashedPassword123',
        role: 'partenaire',
        nom: 'Netflix'
      }
    ];

    const utilisateurs = [];
    for (const userData of partenairesData) {
      const existing = await Utilisateur.findOne({
        where: { email: userData.email },
        transaction: t
      });
      
      if (!existing) {
        const user = await Utilisateur.create(userData, { transaction: t });
        utilisateurs.push(user);
        console.log(`  ✅ Utilisateur créé: ${userData.nom}`);
      } else {
        utilisateurs.push(existing);
        console.log(`  ℹ️  Utilisateur déjà existant: ${userData.nom}`);
      }
    }

    // ==========================================
    // 2. CRÉER LES PARTENAIRES
    // ==========================================
    console.log('🤝 Création des partenaires...');

    const partenairesInfo = [
      {
        idUtilisateur: utilisateurs[0].idUtilisateur,
        entreprise: 'Google',
        secteur: 'Technologie',
        statut: 'actif'
      },
      {
        idUtilisateur: utilisateurs[1].idUtilisateur,
        entreprise: 'Microsoft',
        secteur: 'Logiciels',
        statut: 'actif'
      },
      {
        idUtilisateur: utilisateurs[2].idUtilisateur,
        entreprise: 'Apple',
        secteur: 'Électronique',
        statut: 'actif'
      },
      {
        idUtilisateur: utilisateurs[3].idUtilisateur,
        entreprise: 'Amazon',
        secteur: 'E-commerce',
        statut: 'actif'
      },
      {
        idUtilisateur: utilisateurs[4].idUtilisateur,
        entreprise: 'Netflix',
        secteur: 'Divertissement',
        statut: 'actif'
      }
    ];

    const partenaires = [];
    for (const partData of partenairesInfo) {
      const existing = await Partenaire.findOne({
        where: { idUtilisateur: partData.idUtilisateur },
        transaction: t
      });

      if (!existing) {
        const partenaire = await Partenaire.create(partData, { transaction: t });
        partenaires.push(partenaire);
        console.log(`  ✅ Partenaire créé: ${partData.entreprise}`);
      } else {
        partenaires.push(existing);
        console.log(`  ℹ️  Partenaire déjà existant: ${partData.entreprise}`);
      }
    }

    // ==========================================
    // 3. CRÉER LES TROPHÉES
    // ==========================================
    console.log('🏆 Création des trophées...');

    const tropheeNames = [
      'Trophy_1_Google',
      'Trophy_2_Microsoft',
      'Trophy_3_Apple',
      'Trophy_4_Amazon',
      'Trophy_5_Netflix'
    ];

    const trophees = [];
    for (let i = 0; i < tropheeNames.length; i++) {
      const existing = await Trophee.findOne({
        where: { nom: tropheeNames[i] },
        transaction: t
      });

      if (!existing) {
        const trophee = await Trophee.create({
          nom: tropheeNames[i],
          description: `Trophée pour avoir gagné le défi ${partenairesInfo[i].entreprise}`,
          icone: '/trophees/sponsor.png',
          rareté: i === 0 ? 'legendaire' : (i === 1 ? 'epique' : 'rare')
        }, { transaction: t });
        trophees.push(trophee);
        console.log(`  ✅ Trophée créé: ${tropheeNames[i]} (${trophee.rareté})`);
      } else {
        trophees.push(existing);
        console.log(`  ℹ️  Trophée déjà existant: ${tropheeNames[i]}`);
      }
    }

    // ==========================================
    // 4. CRÉER LES CHALLENGES SPONSORISÉS
    // ==========================================
    console.log('🎯 Création des challenges sponsorisés...');

    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours
    const recentDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 jours passés

    const challengesData = [
      {
        idPartenaire: partenaires[0].idPartenaire,
        titre: 'Google Search Master',
        description: 'Testez vos connaissances sur les moteurs de recherche et l\'histoire de Google. Répondez correctement à 10 questions pour gagner le trophée exclusif Google!',
        recompense: '500 XP + Badge Google',
        dateDebut: recentDate,
        dateFin: futureDate,
        statut: 'actif'
      },
      {
        idPartenaire: partenaires[1].idPartenaire,
        titre: 'Microsoft Innovation Challenge',
        description: 'Découvrez l\'univers Microsoft avec ce quiz sur ses produits phares. Windows, Office, Azure... Montrez votre expertise!',
        recompense: '400 XP + 1000 Coins',
        dateDebut: recentDate,
        dateFin: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        statut: 'actif'
      },
      {
        idPartenaire: partenaires[2].idPartenaire,
        titre: 'Apple Ecosystem Quiz',
        description: 'iPhone, MacBook, iPad, Watch... Maîtrisez l\'écosystème Apple avec ce quiz captivant.',
        recompense: '600 XP + Trophée Apple',
        dateDebut: recentDate,
        dateFin: futureDate,
        statut: 'actif'
      },
      {
        idPartenaire: partenaires[3].idPartenaire,
        titre: 'Amazon Web Services Challenge',
        description: 'Explorez le cloud avec AWS. 10 questions sur l\'infrastructure cloud, les services et les solutions d\'Amazon.',
        recompense: '550 XP + 800 Coins',
        dateDebut: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        dateFin: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        statut: 'actif'
      },
      {
        idPartenaire: partenaires[4].idPartenaire,
        titre: 'Netflix Movie Trivia',
        description: 'Testez votre culture cinématographique avec ce quiz sur les films et séries de Netflix. Êtes-vous prêt pour le défi?',
        recompense: '350 XP + 1 mois Netflix',
        dateDebut: recentDate,
        dateFin: futureDate,
        statut: 'actif'
      },
      {
        idPartenaire: partenaires[0].idPartenaire,
        titre: 'Google Cloud Platform Quiz',
        description: 'Plongez dans le monde du cloud computing avec Google Cloud. Ce défi teste vos connaissances sur GCP.',
        recompense: '480 XP + Badge Expert',
        dateDebut: recentDate,
        dateFin: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        statut: 'actif'
      }
    ];

    for (const challengeData of challengesData) {
      const existing = await ChallengeSponsorise.findOne({
        where: {
          idPartenaire: challengeData.idPartenaire,
          titre: challengeData.titre
        },
        transaction: t
      });

      if (!existing) {
        await ChallengeSponsorise.create(challengeData, { transaction: t });
        console.log(`  ✅ Challenge créé: ${challengeData.titre}`);
      } else {
        console.log(`  ℹ️  Challenge déjà existant: ${challengeData.titre}`);
      }
    }

    await t.commit();
    console.log('\n✅ Seeding des challenges sponsorisés terminé avec succès!\n');

  } catch (error) {
    await t.rollback();
    console.error('❌ Erreur lors du seeding:', error.message);
    throw error;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  seedChallengesSponsorisees()
    .then(() => {
      console.log('✨ Seeding complété!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur:', error);
      process.exit(1);
    });
}

module.exports = seedChallengesSponsorisees;
