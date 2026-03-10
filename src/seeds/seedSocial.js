/**
 * Seeder pour créer des amis communs (bots) et des badges/trophées basés sur XP
 * Exécuter avec: node src/seeds/seedSocial.js
 */

require('dotenv').config();
const sequelize = require('../config/database');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base OK');

    // Import des modèles après connexion
    const { Joueur, Badge, Trophee, Ami, Utilisateur } = require('../models');

    // Ajouter les colonnes manquantes à la table joueurs si elles n'existent pas
    console.log('\n🔄 Ajout des colonnes manquantes dans joueurs...');
    
    // Helper pour ajouter une colonne si elle n'existe pas
    const addColumnIfNotExists = async (table, column, definition) => {
      try {
        const [results] = await sequelize.query(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${table}' AND COLUMN_NAME = '${column}'
        `);
        if (results.length === 0) {
          await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
          console.log(`  ✅ Colonne ${column} ajoutée`);
        } else {
          console.log(`  ⏭️ Colonne ${column} existe déjà`);
        }
      } catch (e) {
        console.log(`  ⚠️ Erreur pour ${column}:`, e.message);
      }
    };

    await addColumnIfNotExists('joueurs', 'points_x_p', 'INT DEFAULT 0');
    await addColumnIfNotExists('joueurs', 'total_x_p', 'INT DEFAULT 0');
    await addColumnIfNotExists('joueurs', 'niveau_stage', 'INT DEFAULT 1');
    await addColumnIfNotExists('joueurs', 'xp_boost_multiplier', 'INT DEFAULT 1');
    await addColumnIfNotExists('joueurs', 'xp_boost_expiration', 'DATETIME NULL');
    await addColumnIfNotExists('joueurs', 'statut_premium', 'TINYINT(1) DEFAULT 0');
    await addColumnIfNotExists('joueurs', 'premium_expiration', 'DATETIME NULL');
    await addColumnIfNotExists('joueurs', 'coins', 'INT DEFAULT 0');
    await addColumnIfNotExists('joueurs', 'vies', 'INT DEFAULT 5');
    await addColumnIfNotExists('joueurs', 'niveau_actuel', "VARCHAR(50) DEFAULT 'Stage 1'");
    await addColumnIfNotExists('joueurs', 'max_niveau_debloque', 'INT DEFAULT 1');
    await addColumnIfNotExists('joueurs', 'parties_jouees', 'INT DEFAULT 0');
    await addColumnIfNotExists('joueurs', 'parties_gagnees', 'INT DEFAULT 0');
    await addColumnIfNotExists('joueurs', 'derniere_regeneration_vie', 'DATETIME NULL');
    await addColumnIfNotExists('joueurs', 'bio', 'TEXT NULL');
    await addColumnIfNotExists('joueurs', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    // Créer la table amis manuellement avec la bonne FK
    console.log('\n🔄 Création de la table amis...');
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS amis (
          id_amitie INT AUTO_INCREMENT PRIMARY KEY,
          id_joueur1 INT NOT NULL COMMENT 'Joueur qui a envoyé la demande',
          id_joueur2 INT NOT NULL COMMENT 'Joueur qui a reçu la demande',
          statut ENUM('en_attente', 'accepte', 'refuse', 'bloque') DEFAULT 'en_attente',
          date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
          date_reponse DATETIME NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (id_joueur1) REFERENCES joueurs(id_joueur) ON DELETE CASCADE,
          FOREIGN KEY (id_joueur2) REFERENCES joueurs(id_joueur) ON DELETE CASCADE,
          UNIQUE KEY unique_friendship (id_joueur1, id_joueur2)
        ) ENGINE=InnoDB
      `);
      console.log('✅ Table amis créée/vérifiée');
    } catch (e) {
      if (e.original?.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⏭️ Table amis existe déjà');
      } else {
        console.log('⚠️ Table amis:', e.message);
      }
    }

    // 1. =============== CRÉER DES JOUEURS BOTS (AMIS COMMUNS) ===============
    console.log('\n📱 Création des joueurs bots...');
    
    const botUsers = [
      { nom: 'Kwame Asante', email: 'kwame.bot@afrocards.com', pseudo: 'Kwame_Asante', pays: 'Ghana', avatarURL: 'https://api.dicebear.com/7.x/avataaars/png?seed=Kwame&backgroundColor=b6e3f4', pointsXP: 5000, niveau: 25, bio: 'Passionné de culture africaine 🌍 | Joueur depuis 2 ans' },
      { nom: 'Amara Diallo', email: 'amara.bot@afrocards.com', pseudo: 'Amara_Diallo', pays: 'Sénégal', avatarURL: 'https://api.dicebear.com/7.x/avataaars/png?seed=Amara&backgroundColor=c0aede', pointsXP: 4200, niveau: 22, bio: 'Teranga toujours 🇸🇳 | Quiz master' },
      { nom: 'Zuri Okonkwo', email: 'zuri.bot@afrocards.com', pseudo: 'Zuri_Okonkwo', pays: 'Nigeria', avatarURL: 'https://api.dicebear.com/7.x/avataaars/png?seed=Zuri&backgroundColor=d1d4f9', pointsXP: 3800, niveau: 20, bio: 'Naija to the world 🇳🇬 | History lover' },
      { nom: 'Fatou Ndiaye', email: 'fatou.bot@afrocards.com', pseudo: 'Fatou_Ndiaye', pays: 'Sénégal', avatarURL: 'https://api.dicebear.com/7.x/lorelei/png?seed=Fatou&backgroundColor=ffd5dc', pointsXP: 2500, niveau: 15, bio: 'Apprendre en s\'amusant ✨ | Défis acceptés!' },
      { nom: 'Kofi Mensah', email: 'kofi.bot@afrocards.com', pseudo: 'Kofi_Mensah', pays: 'Ghana', avatarURL: 'https://api.dicebear.com/7.x/avataaars/png?seed=Kofi&backgroundColor=ffdfbf', pointsXP: 3200, niveau: 18, bio: 'Akwaaba 🇬🇭 | Culture is everything' },
      { nom: 'Adama Traoré', email: 'adama.bot@afrocards.com', pseudo: 'Adama_Traore', pays: 'Mali', avatarURL: 'https://api.dicebear.com/7.x/notionists/png?seed=Adama&backgroundColor=c1f4c5', pointsXP: 1800, niveau: 12, bio: 'Mali ka faso 🇲🇱 | Toujours prêt pour un défi' },
      { nom: 'Mariama Sow', email: 'mariama.bot@afrocards.com', pseudo: 'Mariama_Sow', pays: 'Guinée', avatarURL: 'https://api.dicebear.com/7.x/lorelei/png?seed=Mariama&backgroundColor=c0aede', pointsXP: 1200, niveau: 8, bio: 'Guinée 🇬🇳 | Nouvelle joueuse passionnée' },
      { nom: 'Yemi Adeyemi', email: 'yemi.bot@afrocards.com', pseudo: 'Yemi_Adeyemi', pays: 'Nigeria', avatarURL: 'https://api.dicebear.com/7.x/notionists/png?seed=Yemi&backgroundColor=d1d4f9', pointsXP: 2100, niveau: 14, bio: 'Lagos vibes 🌴 | Knowledge is power' },
    ];

    for (const botData of botUsers) {
      // Vérifier si l'utilisateur bot existe déjà
      let user = await Utilisateur.findOne({ where: { email: botData.email } });
      
      if (!user) {
        user = await Utilisateur.create({
          nom: botData.nom,
          email: botData.email,
          motDePasse: 'bot_password_hash_not_usable', // Pas de vraie connexion
          typeUtilisateur: 'bot',
          statutCompte: 'actif'
        });
        console.log(`✅ Utilisateur bot créé: ${botData.nom}`);
      }

      // Créer le profil joueur
      const [joueur, created] = await Joueur.findOrCreate({
        where: { idUtilisateur: user.idUtilisateur },
        defaults: {
          pseudo: botData.pseudo,
          pays: botData.pays,
          nationalite: botData.pays,
          avatarURL: botData.avatarURL,
          bio: botData.bio,
          pointsXP: botData.pointsXP,
          totalXP: botData.pointsXP,
          niveau: botData.niveau,
          coins: Math.floor(botData.pointsXP / 10),
          vies: 5,
          niveauActuel: `Stage ${botData.niveau}`,
          niveauStage: botData.niveau,
          maxNiveauDebloque: botData.niveau,
          partiesJouees: Math.floor(botData.pointsXP / 50),
          partiesGagnees: Math.floor(botData.pointsXP / 80)
        }
      });

      if (created) {
        console.log(`✅ Joueur bot créé: ${botData.pseudo}`);
      } else {
        await joueur.update({
          avatarURL: botData.avatarURL,
          bio: botData.bio,
          nationalite: botData.pays,
          pointsXP: botData.pointsXP,
          totalXP: botData.pointsXP,
          niveau: botData.niveau,
          niveauStage: botData.niveau,
          niveauActuel: `Stage ${botData.niveau}`
        });
        console.log(`🔄 Joueur bot mis à jour: ${botData.pseudo}`);
      }
    }

    // 2. =============== AJOUTER LES BOTS COMME AMIS À TOUS LES VRAIS JOUEURS ===============
    console.log('\n👥 Ajout des amis bots aux joueurs...');
    
    const botJoueurs = await Joueur.findAll({
      include: [{
        model: Utilisateur,
        where: { typeUtilisateur: 'bot' }
      }]
    });

    const vraisJoueurs = await Joueur.findAll({
      include: [{
        model: Utilisateur,
        where: { typeUtilisateur: { [require('sequelize').Op.ne]: 'bot' } }
      }]
    });

    // Table amis déjà créée manuellement plus haut

    for (const vraiJoueur of vraisJoueurs) {
      for (const botJoueur of botJoueurs) {
        const [amitie, created] = await Ami.findOrCreate({
          where: {
            [require('sequelize').Op.or]: [
              { idJoueur1: vraiJoueur.idJoueur, idJoueur2: botJoueur.idJoueur },
              { idJoueur1: botJoueur.idJoueur, idJoueur2: vraiJoueur.idJoueur }
            ]
          },
          defaults: {
            idJoueur1: botJoueur.idJoueur,
            idJoueur2: vraiJoueur.idJoueur,
            statut: 'accepte',
            dateReponse: new Date()
          }
        });
        if (created) {
          console.log(`👥 Amitié créée: ${botJoueur.pseudo} ↔ ${vraiJoueur.pseudo}`);
        }
      }
    }

    // 3. =============== CRÉER LES BADGES BASÉS SUR XP ===============
    console.log('\n🏅 Création des badges...');
    
    const badges = [
      // Badges XP
      { nom: 'Débutant', description: 'Atteindre 100 XP', icone: '/badges/debutant.png', conditionType: 'xp_total', conditionValeur: 100, recompenseXP: 10 },
      { nom: 'Apprenti', description: 'Atteindre 500 XP', icone: '/badges/apprenti.png', conditionType: 'xp_total', conditionValeur: 500, recompenseXP: 25 },
      { nom: 'Amateur', description: 'Atteindre 1000 XP', icone: '/badges/amateur.png', conditionType: 'xp_total', conditionValeur: 1000, recompenseXP: 50 },
      { nom: 'Expert', description: 'Atteindre 2500 XP', icone: '/badges/expert.png', conditionType: 'xp_total', conditionValeur: 2500, recompenseXP: 100 },
      { nom: 'Maître', description: 'Atteindre 5000 XP', icone: '/badges/maitre.png', conditionType: 'xp_total', conditionValeur: 5000, recompenseXP: 200 },
      { nom: 'Légende', description: 'Atteindre 10000 XP', icone: '/badges/legende.png', conditionType: 'xp_total', conditionValeur: 10000, recompenseXP: 500 },
      
      // Badges Parties
      { nom: 'Première Partie', description: 'Jouer votre première partie', icone: '/badges/premiere_partie.png', conditionType: 'parties_jouees', conditionValeur: 1, recompenseXP: 10 },
      { nom: 'Joueur Régulier', description: 'Jouer 10 parties', icone: '/badges/regulier.png', conditionType: 'parties_jouees', conditionValeur: 10, recompenseXP: 25 },
      { nom: 'Passionné', description: 'Jouer 50 parties', icone: '/badges/passionne.png', conditionType: 'parties_jouees', conditionValeur: 50, recompenseXP: 75 },
      { nom: 'Acharné', description: 'Jouer 100 parties', icone: '/badges/acharne.png', conditionType: 'parties_jouees', conditionValeur: 100, recompenseXP: 150 },
      
      // Badges Quiz Parfaits
      { nom: 'Sans Faute', description: 'Obtenir un score parfait', icone: '/badges/parfait.png', conditionType: 'quiz_parfaits', conditionValeur: 1, recompenseXP: 20 },
      { nom: 'Perfectionniste', description: '10 quiz parfaits', icone: '/badges/perfectionniste.png', conditionType: 'quiz_parfaits', conditionValeur: 10, recompenseXP: 100 },
      
      // Badges Stage
      { nom: 'Stage 5', description: 'Atteindre le Stage 5', icone: '/badges/stage5.png', conditionType: 'niveau_stage', conditionValeur: 5, recompenseXP: 50 },
      { nom: 'Stage 10', description: 'Atteindre le Stage 10', icone: '/badges/stage10.png', conditionType: 'niveau_stage', conditionValeur: 10, recompenseXP: 100 },
      { nom: 'Stage 20', description: 'Atteindre le Stage 20', icone: '/badges/stage20.png', conditionType: 'niveau_stage', conditionValeur: 20, recompenseXP: 250 },
    ];

    for (const badgeData of badges) {
      const [badge, created] = await Badge.findOrCreate({
        where: { nom: badgeData.nom },
        defaults: badgeData
      });
      if (created) {
        console.log(`✅ Badge créé: ${badge.nom}`);
      } else {
        await badge.update(badgeData);
        console.log(`🔄 Badge mis à jour: ${badge.nom}`);
      }
    }

    // 4. =============== CRÉER LES TROPHÉES ===============
    console.log('\n🏆 Création des trophées...');
    
    const trophees = [
      { nom: 'Explorateur', description: 'Découvrir toutes les catégories', icone: '/trophees/explorateur.png', rareté: 'commun' },
      { nom: 'Champion du Mois', description: 'Terminer 1er au classement mensuel', icone: '/trophees/champion_mois.png', rareté: 'rare' },
      { nom: 'Roi des Quiz', description: 'Gagner 50 parties d\'affilée', icone: '/trophees/roi_quiz.png', rareté: 'epique' },
      { nom: 'Maître de l\'Afrique', description: 'Compléter tous les stages', icone: '/trophees/maitre_afrique.png', rareté: 'legendaire' },
      { nom: 'Social Butterfly', description: 'Avoir 20 amis', icone: '/trophees/social.png', rareté: 'rare' },
      { nom: 'Premier Challenge', description: 'Gagner votre premier défi ami', icone: '/trophees/premier_challenge.png', rareté: 'commun' },
      { nom: 'Invincible', description: '100 victoires en challenge', icone: '/trophees/invincible.png', rareté: 'legendaire' },
    ];

    for (const tropheeData of trophees) {
      const [trophee, created] = await Trophee.findOrCreate({
        where: { nom: tropheeData.nom },
        defaults: tropheeData
      });
      if (created) {
        console.log(`✅ Trophée créé: ${trophee.nom}`);
      } else {
        console.log(`⏩ Trophée existant: ${trophee.nom}`);
      }
    }

    console.log('\n✅ Seed social terminé avec succès!');
    
    const totalBots = await Joueur.count({ include: [{ model: Utilisateur, where: { typeUtilisateur: 'bot' } }] });
    const totalBadges = await Badge.count();
    const totalTrophees = await Trophee.count();
    const totalAmities = await Ami.count();
    
    console.log(`\n📊 Statistiques:`);
    console.log(`   - Joueurs bots: ${totalBots}`);
    console.log(`   - Badges: ${totalBadges}`);
    console.log(`   - Trophées: ${totalTrophees}`);
    console.log(`   - Amitiés: ${totalAmities}`);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

seed();
