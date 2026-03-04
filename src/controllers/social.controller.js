const { Joueur, Message, Notification, NotificationParametre, Signalement, SignalementQuestion, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper pour récupérer l'ID joueur courant
const getJoueurId = async (userId) => {
  const joueur = await Joueur.findOne({ where: { idUtilisateur: userId } });
  if (!joueur) throw new Error('Joueur introuvable');
  return joueur.idJoueur;
};

// 1. Envoyer un message
exports.sendMessage = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const expediteurId = await getJoueurId(req.user.id);
    const { idDestinataire, contenu } = req.body;

    // Vérifier si le destinataire existe
    const destinataire = await Joueur.findByPk(idDestinataire);
    if (!destinataire) {
      await t.rollback();
      return res.status(404).json({ message: 'Destinataire introuvable' });
    }

    // Créer le message
    const message = await Message.create({
      idExpediteur: expediteurId,
      idDestinataire,
      contenu,
      statut: 'envoye'
    }, { transaction: t });

    // Vérifier les préférences de notification du destinataire
    let prefs = await NotificationParametre.findOne({ where: { idJoueur: idDestinataire } });
    
    // Si pas de préférences, on crée par défaut (tout activé)
    if (!prefs) {
      prefs = await NotificationParametre.create({ idJoueur: idDestinataire }, { transaction: t });
    }

    // Envoyer une notification si l'utilisateur l'accepte
    if (prefs.notifMessage) {
      await Notification.create({
        idJoueur: idDestinataire,
        type: 'message',
        titre: 'Nouveau message',
        contenu: `Vous avez reçu un message de l'utilisateur #${expediteurId}`,
        canal: 'in-app'
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ success: true, message: 'Message envoyé', data: message });

  } catch (error) {
    await t.rollback();
    console.error('Erreur envoi message:', error);
    res.status(500).json({ success: false, message: 'Erreur envoi message', error: error.message });
  }
};

// 2. Récupérer ma conversation avec un utilisateur
exports.getConversation = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    const { idAutreJoueur } = req.params;

    // Vérifier que l'autre joueur existe
    const autreJoueur = await Joueur.findByPk(idAutreJoueur);
    if (!autreJoueur) {
      return res.status(404).json({ success: false, message: 'Joueur introuvable' });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { idExpediteur: monId, idDestinataire: idAutreJoueur },
          { idExpediteur: idAutreJoueur, idDestinataire: monId }
        ]
      },
      order: [['dateEnvoi', 'ASC']],
      include: [
        { model: Joueur, as: 'expediteur', attributes: ['idJoueur', 'pseudo', 'avatarURL'] }
      ]
    });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Erreur récupération conversation:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération conversation', error: error.message });
  }
};

// 3. Récupérer mes notifications
exports.getNotifications = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    
    const notifs = await Notification.findAll({
      where: { idJoueur: monId },
      order: [['dateCreation', 'DESC']],
      limit: 50
    });

    res.status(200).json({ success: true, data: notifs });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération notifications', error: error.message });
  }
};

// 4. Marquer une notif comme lue
exports.markAsRead = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    const { id } = req.params;
    
    const notif = await Notification.findOne({
      where: { 
        idNotif: id,
        idJoueur: monId // Vérifier que la notification appartient bien à l'utilisateur
      }
    });
    
    if (!notif) return res.status(404).json({ 
      success: false, 
      message: 'Notification introuvable' 
    });

    await notif.update({ estLue: true });
    res.status(200).json({ success: true, message: 'Notification marquée comme lue', data: notif });
  } catch (error) {
    console.error('Erreur marquer comme lue:', error);
    res.status(500).json({ success: false, message: 'Erreur mise à jour notification', error: error.message });
  }
};

// 5. Gérer mes préférences de notification (CORRIGÉ pour correspondre au validator)
exports.updatePreferences = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    const { notifMessage, notifChallenge, notifPromo } = req.body;

    // Trouver ou créer les préférences
    let prefs = await NotificationParametre.findOne({ where: { idJoueur: monId } });

    if (!prefs) {
      prefs = await NotificationParametre.create({ 
        idJoueur: monId,
        notifMessage: notifMessage !== undefined ? notifMessage : true,
        notifChallenge: notifChallenge !== undefined ? notifChallenge : true,
        notifPromo: notifPromo !== undefined ? notifPromo : true
      });
    } else {
      // Mettre à jour uniquement les champs fournis
      const updates = {};
      if (notifMessage !== undefined) updates.notifMessage = notifMessage;
      if (notifChallenge !== undefined) updates.notifChallenge = notifChallenge;
      if (notifPromo !== undefined) updates.notifPromo = notifPromo;
      
      await prefs.update(updates);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Préférences de notification mises à jour', 
      data: prefs 
    });
  } catch (error) {
    console.error('Erreur mise à jour préférences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur mise à jour préférences', 
      error: error.message 
    });
  }
};

// 6. Nouvelle fonction: Marquer tous les messages comme lus (optionnel)
exports.markAllAsRead = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    
    await Notification.update(
      { estLue: true },
      { where: { idJoueur: monId, estLue: false } }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Toutes les notifications marquées comme lues' 
    });
  } catch (error) {
    console.error('Erreur marquer tout comme lu:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur opération', 
      error: error.message 
    });
  }
};

// Signaler un joueur
exports.signalerJoueur = async (req, res) => {
  try {
    const idSignaleur = await getJoueurId(req.user.id);
    const { idSignale, motif, details } = req.body;
    if (!idSignale || !motif) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants.' });
    }
    if (idSignaleur === idSignale) {
      return res.status(400).json({ success: false, message: 'Impossible de se signaler soi-même.' });
    }
    // Vérifier que le joueur signalé existe
    const joueur = await Joueur.findByPk(idSignale);
    if (!joueur) {
      return res.status(404).json({ success: false, message: 'Joueur à signaler introuvable.' });
    }
    // Créer le signalement
    const signalement = await Signalement.create({
      idSignaleur,
      idSignale,
      motif,
      details
    });
    res.status(201).json({ success: true, message: 'Signalement enregistré', data: signalement });
  } catch (error) {
    console.error('Erreur signalement joueur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du signalement', error: error.message });
  }
};

// Signaler une question
exports.signalerQuestion = async (req, res) => {
  try {
    const idSignaleur = await getJoueurId(req.user.id);
    const { idQuestion, motif, details } = req.body;
    if (!idQuestion || !motif) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants.' });
    }
    // Vérifier que la question existe
    const question = await require('../models/Question').findByPk(idQuestion);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question introuvable.' });
    }
    // Créer le signalement
    const signalement = await SignalementQuestion.create({
      idSignaleur,
      idQuestion,
      motif,
      details
    });
    res.status(201).json({ success: true, message: 'Signalement de question enregistré', data: signalement });
  } catch (error) {
    console.error('Erreur signalement question:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du signalement', error: error.message });
  }
};