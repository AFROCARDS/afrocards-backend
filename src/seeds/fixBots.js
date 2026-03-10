require('dotenv').config();
const sequelize = require('../config/database');

async function fix() {
  try {
    await sequelize.authenticate();
    const [result] = await sequelize.query(
      "UPDATE utilisateurs SET type_utilisateur='bot' WHERE email LIKE '%.bot@afrocards.com'"
    );
    console.log('✅ Bots mis à jour:', result.affectedRows);
  } catch (e) {
    console.error('Erreur:', e.message);
  } finally {
    process.exit();
  }
}
fix();
