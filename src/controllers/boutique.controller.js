const { Article, Joueur, HistoriqueTransaction, sequelize } = require('../models');

// GET /boutique/articles
exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      where: { actif: true },
      order: [['categorie', 'ASC'], ['prix', 'ASC']]
    });
    res.json({ success: true, data: articles });
  } catch (err) {
    console.error('Erreur getArticles:', err);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des articles' });
  }
};

// POST /boutique/acheter
exports.acheterArticle = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      await transaction.rollback();
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const { articleId } = req.body;
    if (!articleId) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Article ID requis' });
    }

    // Récupérer l'article
    const article = await Article.findByPk(articleId, { transaction });
    if (!article || !article.actif) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Article non trouvé ou indisponible' });
    }

    // Récupérer le joueur
    const joueur = await Joueur.findOne({ 
      where: { idUtilisateur: userId },
      transaction 
    });
    if (!joueur) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Joueur non trouvé' });
    }

    // Vérifier les pièces
    if ((joueur.coins || 0) < article.prix) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Pas assez de pièces',
        coinsActuels: joueur.coins || 0,
        prixArticle: article.prix
      });
    }

    // Déduire les pièces
    const nouveauSolde = (joueur.coins || 0) - article.prix;
    
    // Appliquer l'effet de l'article selon son type
    let updateData = { coins: nouveauSolde };
    let messageEffet = '';

    switch (article.type) {
      case 'vie':
        const nouvellesVies = Math.min((joueur.vies || 0) + article.valeur, 5);
        updateData.vies = nouvellesVies;
        messageEffet = `+${article.valeur} vie(s) ajoutée(s)`;
        break;
        
      case 'xp_boost':
        // Stocker le boost XP avec date d'expiration
        const expirationBoost = new Date();
        expirationBoost.setMinutes(expirationBoost.getMinutes() + (article.duree || 30));
        updateData.xpBoostMultiplier = article.valeur;
        updateData.xpBoostExpiration = expirationBoost;
        messageEffet = `Boost XP x${article.valeur} activé pour ${article.duree} minutes`;
        break;
        
      case 'coins':
        updateData.coins = nouveauSolde + article.valeur;
        messageEffet = `+${article.valeur} pièces ajoutées`;
        break;
        
      case 'premium':
        const expirationPremium = new Date();
        expirationPremium.setMinutes(expirationPremium.getMinutes() + (article.duree || 10080));
        updateData.statutPremium = true;
        updateData.premiumExpiration = expirationPremium;
        messageEffet = `Pass VIP activé jusqu'au ${expirationPremium.toLocaleDateString()}`;
        break;
        
      case 'avatar':
        // Stocker l'avatar dans une liste d'avatars débloqués (à implémenter)
        messageEffet = `Avatar "${article.nom}" débloqué`;
        break;
        
      default:
        messageEffet = 'Article acheté';
    }

    // Mettre à jour le joueur
    await joueur.update(updateData, { transaction });

    // Enregistrer la transaction dans l'historique
    await HistoriqueTransaction.create({
      idJoueur: joueur.idJoueur,
      type: 'achat',
      montant: -article.prix,
      description: `Achat: ${article.nom}`,
      dateTransaction: new Date()
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: `Achat réussi: ${article.nom}`,
      effet: messageEffet,
      data: {
        articleAchete: article.nom,
        prixPaye: article.prix,
        nouveauSolde: updateData.coins,
        nouvellesVies: updateData.vies ?? joueur.vies,
        xpBoostActif: updateData.xpBoostMultiplier > 1,
        xpBoostExpiration: updateData.xpBoostExpiration
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erreur acheterArticle:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'achat',
      error: error.message 
    });
  }
};

// GET /boutique/mes-achats
exports.getMesAchats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }

    const joueur = await Joueur.findOne({ where: { idUtilisateur: userId } });
    if (!joueur) {
      return res.status(404).json({ success: false, message: 'Joueur non trouvé' });
    }

    const achats = await HistoriqueTransaction.findAll({
      where: { 
        idJoueur: joueur.idJoueur,
        type: 'achat'
      },
      order: [['dateTransaction', 'DESC']],
      limit: 50
    });

    res.json({ success: true, data: achats });

  } catch (error) {
    console.error('Erreur getMesAchats:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération achats' });
  }
};
