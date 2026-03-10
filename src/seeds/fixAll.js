require('dotenv').config();
const sequelize = require('../config/database');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion OK');

    // 0. Modifier l'ENUM pour inclure 'bot'
    await sequelize.query(
      "ALTER TABLE utilisateurs MODIFY COLUMN type_utilisateur ENUM('joueur','partenaire','admin','bot') NOT NULL"
    );
    console.log('✅ ENUM modifié pour inclure bot');

    // 1. Corriger les bots
    const [updateResult] = await sequelize.query(
      "UPDATE utilisateurs SET type_utilisateur='bot' WHERE email LIKE '%.bot@afrocards.com'"
    );
    console.log('✅ Bots corrigés, affected rows:', updateResult.affectedRows);
    
    // Debug: vérifier immédiatement
    const [checkBots] = await sequelize.query(
      "SELECT id_utilisateur, email, type_utilisateur FROM utilisateurs WHERE email LIKE '%.bot@afrocards.com'"
    );
    console.log('Debug bots après update:', checkBots);

    // 2. Récupérer les vrais joueurs (non-bots)
    const [joueurs] = await sequelize.query(`
      SELECT j.id_joueur 
      FROM joueurs j 
      JOIN utilisateurs u ON j.id_utilisateur = u.id_utilisateur 
      WHERE u.type_utilisateur != 'bot' OR u.type_utilisateur IS NULL
    `);
    console.log(`Found ${joueurs.length} real players`);

    // 3. Récupérer les bots
    const [bots] = await sequelize.query(`
      SELECT j.id_joueur 
      FROM joueurs j 
      JOIN utilisateurs u ON j.id_utilisateur = u.id_utilisateur 
      WHERE u.type_utilisateur = 'bot'
    `);
    console.log(`Found ${bots.length} bots`);

    // 4. Créer les amitiés
    let count = 0;
    for (const joueur of joueurs) {
      for (const bot of bots) {
        try {
          await sequelize.query(`
            INSERT IGNORE INTO amis (id_joueur1, id_joueur2, statut, date_envoi, date_reponse, created_at, updated_at) 
            VALUES (?, ?, 'accepte', NOW(), NOW(), NOW(), NOW())
          `, { replacements: [bot.id_joueur, joueur.id_joueur] });
          count++;
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
    console.log(`✅ ${count} amitiés créées/vérifiées`);

    // 5. Vérifier
    const [result] = await sequelize.query('SELECT COUNT(*) as total FROM amis');
    console.log(`📊 Total amitiés en base: ${result[0].total}`);

  } catch (e) {
    console.error('❌ Erreur:', e.message);
  } finally {
    process.exit();
  }
}

fix();
