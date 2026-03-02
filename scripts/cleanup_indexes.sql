-- Script pour nettoyer les index dupliqués sur la table utilisateurs
-- Exécutez ce script dans MySQL Workbench ou phpMyAdmin

-- 1. Voir tous les index actuels
SHOW INDEX FROM utilisateurs;

-- 2. Supprimer les index dupliqués sur email (garder seulement le premier)
-- Liste les index à supprimer (tous les email_* sauf le PRIMARY et un seul email unique)

-- Exécutez ces commandes une par une selon les index trouvés:
-- Ces noms d'index sont générés par Sequelize avec alter: true

-- Exemples de commandes pour supprimer les index dupliqués:
-- ALTER TABLE utilisateurs DROP INDEX email_2;
-- ALTER TABLE utilisateurs DROP INDEX email_3;
-- ALTER TABLE utilisateurs DROP INDEX email_4;
-- etc...

-- Script automatique pour lister et générer les DROP statements:
SELECT 
    CONCAT('ALTER TABLE utilisateurs DROP INDEX `', INDEX_NAME, '`;') AS drop_statement
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'utilisateurs' 
  AND INDEX_NAME LIKE 'email_%'
  AND INDEX_NAME != 'email'
ORDER BY INDEX_NAME;

-- Après avoir nettoyé, vous pouvez remettre alter: true dans server.js
