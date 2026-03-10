const { Joueur, Message, Notification, NotificationParametre, Signalement, SignalementQuestion, Ami, Trophee, sequelize } = require('../models');
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

    // Ajouter le champ isMe pour faciliter l'affichage côté frontend
    const formattedMessages = messages.map(msg => ({
      idMessage: msg.idMessage,
      idExpediteur: msg.idExpediteur,
      idDestinataire: msg.idDestinataire,
      contenu: msg.contenu,
      dateEnvoi: msg.dateEnvoi,
      lu: msg.lu,
      expediteur: msg.expediteur,
      isMe: msg.idExpediteur === monId
    }));

    res.status(200).json({ success: true, data: formattedMessages });
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

// ==========================================
// GESTION DES AMIS
// ==========================================

// Récupérer la liste de mes amis
exports.getMesAmis = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    
    // Récupérer les amitiés acceptées où je suis impliqué
    const amities = await Ami.findAll({
      where: {
        [Op.or]: [
          { idJoueur1: monId },
          { idJoueur2: monId }
        ],
        statut: 'accepte'
      },
      include: [
        { 
          model: Joueur, 
          as: 'demandeur', 
          attributes: ['idJoueur', 'pseudo', 'avatarURL', 'pointsXP', 'niveauActuel'] 
        },
        { 
          model: Joueur, 
          as: 'destinataire', 
          attributes: ['idJoueur', 'pseudo', 'avatarURL', 'pointsXP', 'niveauActuel'] 
        }
      ]
    });

    // Transformer pour n'avoir que les infos des amis (pas moi)
    const amis = amities.map(amitie => {
      const ami = amitie.idJoueur1 === monId ? amitie.destinataire : amitie.demandeur;
      return {
        idAmitie: amitie.idAmitie,
        idJoueur: ami?.idJoueur,
        pseudo: ami?.pseudo,
        avatarURL: ami?.avatarURL,
        totalXP: ami?.pointsXP || 0,
        niveau: ami?.niveauActuel || 1,
        niveauStage: 1,
        dateAmitie: amitie.dateReponse
      };
    });

    res.status(200).json({ success: true, data: amis, count: amis.length });
  } catch (error) {
    console.error('Erreur récupération amis:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération amis', error: error.message });
  }
};

// Récupérer les demandes d'amis en attente (reçues)
exports.getDemandesRecues = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    
    const demandes = await Ami.findAll({
      where: {
        idJoueur2: monId,
        statut: 'en_attente'
      },
      include: [
        { 
          model: Joueur, 
          as: 'demandeur', 
          attributes: ['idJoueur', 'pseudo', 'avatarURL', 'pointsXP', 'niveauActuel'] 
        }
      ],
      order: [['dateEnvoi', 'DESC']]
    });

    const data = demandes.map(d => ({
      idAmitie: d.idAmitie,
      demandeur: {
        idJoueur: d.demandeur?.idJoueur,
        pseudo: d.demandeur?.pseudo,
        avatarURL: d.demandeur?.avatarURL,
        totalXP: d.demandeur?.pointsXP || 0,
        niveau: d.demandeur?.niveauActuel || 1
      },
      dateEnvoi: d.dateEnvoi
    }));

    res.status(200).json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('Erreur récupération demandes:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération demandes', error: error.message });
  }
};

// Récupérer les demandes envoyées
exports.getDemandesEnvoyees = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    
    const demandes = await Ami.findAll({
      where: {
        idJoueur1: monId,
        statut: 'en_attente'
      },
      include: [
        { 
          model: Joueur, 
          as: 'destinataire', 
          attributes: ['idJoueur', 'pseudo', 'avatarURL', 'pointsXP', 'niveauActuel'] 
        }
      ],
      order: [['dateEnvoi', 'DESC']]
    });

    const data = demandes.map(d => ({
      idAmitie: d.idAmitie,
      destinataire: {
        idJoueur: d.destinataire?.idJoueur,
        pseudo: d.destinataire?.pseudo,
        avatarURL: d.destinataire?.avatarURL,
        totalXP: d.destinataire?.pointsXP || 0,
        niveau: d.destinataire?.niveauActuel || 1
      },
      dateEnvoi: d.dateEnvoi
    }));

    res.status(200).json({ success: true, data, count: data.length });
  } catch (error) {
    console.error('Erreur récupération demandes envoyées:', error);
    res.status(500).json({ success: false, message: 'Erreur', error: error.message });
  }
};

// Envoyer une demande d'ami
exports.envoyerDemandeAmi = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const monId = await getJoueurId(req.user.id);
    const { idJoueur } = req.body;

    if (!idJoueur) {
      return res.status(400).json({ success: false, message: 'ID joueur requis' });
    }

    if (monId === idJoueur) {
      return res.status(400).json({ success: false, message: 'Impossible de s\'ajouter soi-même' });
    }

    // Vérifier que le joueur existe
    const joueur = await Joueur.findByPk(idJoueur);
    if (!joueur) {
      return res.status(404).json({ success: false, message: 'Joueur introuvable' });
    }

    // Vérifier si une relation existe déjà
    const existingRelation = await Ami.findOne({
      where: {
        [Op.or]: [
          { idJoueur1: monId, idJoueur2: idJoueur },
          { idJoueur1: idJoueur, idJoueur2: monId }
        ]
      }
    });

    if (existingRelation) {
      if (existingRelation.statut === 'accepte') {
        return res.status(400).json({ success: false, message: 'Vous êtes déjà amis' });
      } else if (existingRelation.statut === 'en_attente') {
        return res.status(400).json({ success: false, message: 'Une demande est déjà en attente' });
      } else if (existingRelation.statut === 'bloque') {
        return res.status(400).json({ success: false, message: 'Impossible d\'ajouter ce joueur' });
      }
      // Si refuse, on peut renvoyer une demande - supprimer l'ancienne
      await existingRelation.destroy({ transaction: t });
    }

    // Créer la demande
    const demande = await Ami.create({
      idJoueur1: monId,
      idJoueur2: idJoueur,
      statut: 'en_attente',
      dateEnvoi: new Date()
    }, { transaction: t });

    // Créer une notification pour le destinataire
    const monProfil = await Joueur.findByPk(monId, { attributes: ['pseudo'] });
    await Notification.create({
      idJoueur: idJoueur,
      type: 'ami',
      titre: 'Demande d\'ami',
      contenu: `${monProfil.pseudo} vous a envoyé une demande d'ami`,
      canal: 'in-app'
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ success: true, message: 'Demande envoyée', data: demande });
  } catch (error) {
    await t.rollback();
    console.error('Erreur envoi demande ami:', error);
    res.status(500).json({ success: false, message: 'Erreur envoi demande', error: error.message });
  }
};

// Accepter une demande d'ami
exports.accepterDemandeAmi = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const monId = await getJoueurId(req.user.id);
    const { idAmitie } = req.params;

    const demande = await Ami.findOne({
      where: {
        idAmitie,
        idJoueur2: monId,
        statut: 'en_attente'
      }
    });

    if (!demande) {
      return res.status(404).json({ success: false, message: 'Demande introuvable ou déjà traitée' });
    }

    await demande.update({
      statut: 'accepte',
      dateReponse: new Date()
    }, { transaction: t });

    // Notifier le demandeur
    const monProfil = await Joueur.findByPk(monId, { attributes: ['pseudo'] });
    await Notification.create({
      idJoueur: demande.idJoueur1,
      type: 'ami',
      titre: 'Demande acceptée',
      contenu: `${monProfil.pseudo} a accepté votre demande d'ami`,
      canal: 'in-app'
    }, { transaction: t });

    await t.commit();
    res.status(200).json({ success: true, message: 'Demande acceptée' });
  } catch (error) {
    await t.rollback();
    console.error('Erreur acceptation demande:', error);
    res.status(500).json({ success: false, message: 'Erreur acceptation', error: error.message });
  }
};

// Refuser une demande d'ami
exports.refuserDemandeAmi = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    const { idAmitie } = req.params;

    const demande = await Ami.findOne({
      where: {
        idAmitie,
        idJoueur2: monId,
        statut: 'en_attente'
      }
    });

    if (!demande) {
      return res.status(404).json({ success: false, message: 'Demande introuvable' });
    }

    await demande.update({
      statut: 'refuse',
      dateReponse: new Date()
    });

    res.status(200).json({ success: true, message: 'Demande refusée' });
  } catch (error) {
    console.error('Erreur refus demande:', error);
    res.status(500).json({ success: false, message: 'Erreur refus', error: error.message });
  }
};

// Supprimer un ami
exports.supprimerAmi = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    const { idAmitie } = req.params;

    const amitie = await Ami.findOne({
      where: {
        idAmitie,
        [Op.or]: [
          { idJoueur1: monId },
          { idJoueur2: monId }
        ],
        statut: 'accepte'
      }
    });

    if (!amitie) {
      return res.status(404).json({ success: false, message: 'Amitié introuvable' });
    }

    await amitie.destroy();

    res.status(200).json({ success: true, message: 'Ami supprimé' });
  } catch (error) {
    console.error('Erreur suppression ami:', error);
    res.status(500).json({ success: false, message: 'Erreur suppression', error: error.message });
  }
};

// Bloquer un joueur
exports.bloquerJoueur = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const monId = await getJoueurId(req.user.id);
    const { idJoueur } = req.body;

    if (!idJoueur || monId === idJoueur) {
      return res.status(400).json({ success: false, message: 'ID joueur invalide' });
    }

    // Supprimer toute relation existante
    await Ami.destroy({
      where: {
        [Op.or]: [
          { idJoueur1: monId, idJoueur2: idJoueur },
          { idJoueur1: idJoueur, idJoueur2: monId }
        ]
      },
      transaction: t
    });

    // Créer un blocage
    await Ami.create({
      idJoueur1: monId,
      idJoueur2: idJoueur,
      statut: 'bloque',
      dateEnvoi: new Date()
    }, { transaction: t });

    await t.commit();
    res.status(200).json({ success: true, message: 'Joueur bloqué' });
  } catch (error) {
    await t.rollback();
    console.error('Erreur blocage:', error);
    res.status(500).json({ success: false, message: 'Erreur blocage', error: error.message });
  }
};

// Rechercher des joueurs
exports.rechercherJoueurs = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    const { pseudo } = req.query;

    if (!pseudo || pseudo.length < 2) {
      return res.status(400).json({ success: false, message: 'Pseudo trop court (min 2 caractères)' });
    }

    const joueurs = await Joueur.findAll({
      where: {
        pseudo: {
          [Op.like]: `%${pseudo}%`
        },
        idJoueur: {
          [Op.ne]: monId // Exclure moi-même
        }
      },
      attributes: ['idJoueur', 'pseudo', 'avatarURL', 'pointsXP', 'niveauActuel'],
      limit: 20
    });

    // Pour chaque joueur, vérifier le statut de relation
    const joueursAvecStatut = await Promise.all(joueurs.map(async (joueur) => {
      const relation = await Ami.findOne({
        where: {
          [Op.or]: [
            { idJoueur1: monId, idJoueur2: joueur.idJoueur },
            { idJoueur1: joueur.idJoueur, idJoueur2: monId }
          ]
        }
      });

      const joueurData = joueur.toJSON();
      return {
        idJoueur: joueurData.idJoueur,
        pseudo: joueurData.pseudo,
        avatarURL: joueurData.avatarURL,
        totalXP: joueurData.pointsXP || 0,
        niveau: joueurData.niveauActuel || 1,
        statut: relation ? relation.statut : 'inconnu',
        estDemandeur: relation ? relation.idJoueur1 === monId : false
      };
    }));

    res.status(200).json({ success: true, data: joueursAvecStatut });
  } catch (error) {
    console.error('Erreur recherche joueurs:', error);
    res.status(500).json({ success: false, message: 'Erreur recherche', error: error.message });
  }
};

// Obtenir le nombre d'amis d'un joueur
exports.getNombreAmis = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    
    const count = await Ami.count({
      where: {
        [Op.or]: [
          { idJoueur1: monId },
          { idJoueur2: monId }
        ],
        statut: 'accepte'
      }
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Erreur comptage amis:', error);
    res.status(500).json({ success: false, message: 'Erreur', error: error.message });
  }
};

// Obtenir le profil public d'un joueur
exports.getProfilJoueur = async (req, res) => {
  try {
    const monId = await getJoueurId(req.user.id);
    const { idJoueur } = req.params;

    if (!idJoueur) {
      return res.status(400).json({ success: false, message: 'ID joueur requis' });
    }

    // Récupérer le joueur avec ses trophées
    const joueur = await Joueur.findByPk(idJoueur, {
      attributes: [
        'idJoueur', 'pseudo', 'avatarURL', 'bio', 'nationalite', 
        'pointsXP', 'totalXP', 'niveauActuel', 'niveauStage',
        'scoreTotal', 'partiesJouees', 'partiesGagnees', 'dateInscription'
      ],
      include: [
        {
          model: Trophee,
          as: 'trophees',
          attributes: ['idTrophee', 'nom', 'description', 'icone', 'rareté'],
          through: { attributes: ['dateObtention'] }
        }
      ]
    });

    if (!joueur) {
      return res.status(404).json({ success: false, message: 'Joueur introuvable' });
    }

    // Vérifier si je suis bloqué par ce joueur ou si je l'ai bloqué
    const blocage = await Ami.findOne({
      where: {
        [Op.or]: [
          { idJoueur1: monId, idJoueur2: idJoueur, statut: 'bloque' },
          { idJoueur1: idJoueur, idJoueur2: monId, statut: 'bloque' }
        ]
      }
    });

    if (blocage) {
      return res.status(403).json({ success: false, message: 'Profil non accessible' });
    }

    // Vérifier le statut de relation
    const relation = await Ami.findOne({
      where: {
        [Op.or]: [
          { idJoueur1: monId, idJoueur2: idJoueur },
          { idJoueur1: idJoueur, idJoueur2: monId }
        ]
      }
    });

    // Compter les amis du joueur
    const nombreAmis = await Ami.count({
      where: {
        [Op.or]: [
          { idJoueur1: idJoueur },
          { idJoueur2: idJoueur }
        ],
        statut: 'accepte'
      }
    });

    // Calculer le badge basé sur les XP
    const getBadge = (xp) => {
      if (xp >= 10000) return { nom: 'Légende', couleur: '#FFD700' };
      if (xp >= 7500) return { nom: 'Maître', couleur: '#E040FB' };
      if (xp >= 5000) return { nom: 'Diamant', couleur: '#00BCD4' };
      if (xp >= 3000) return { nom: 'Platine', couleur: '#9C27B0' };
      if (xp >= 2000) return { nom: 'Or', couleur: '#FFB74D' };
      if (xp >= 1000) return { nom: 'Argent', couleur: '#BDBDBD' };
      if (xp >= 500) return { nom: 'Bronze', couleur: '#CD7F32' };
      if (xp >= 100) return { nom: 'Débutant', couleur: '#78909C' };
      return { nom: 'Novice', couleur: '#78909C' };
    };

    const joueurData = joueur.toJSON();
    const totalXP = joueurData.totalXP || joueurData.pointsXP || 0;

    // Définir le statut d'amitié
    let statutAmitie = 'none'; // Pas de relation
    let idAmitie = null;
    let estDemandeur = false;

    if (relation) {
      idAmitie = relation.idAmitie;
      estDemandeur = relation.idJoueur1 === monId;
      
      if (relation.statut === 'accepte') {
        statutAmitie = 'ami';
      } else if (relation.statut === 'en_attente') {
        statutAmitie = estDemandeur ? 'demande_envoyee' : 'demande_recue';
      } else if (relation.statut === 'refuse') {
        statutAmitie = 'none';
      }
    }

    res.status(200).json({
      success: true,
      data: {
        idJoueur: joueurData.idJoueur,
        pseudo: joueurData.pseudo,
        avatarURL: joueurData.avatarURL,
        bio: joueurData.bio,
        nationalite: joueurData.nationalite,
        pointsXP: joueurData.pointsXP,
        totalXP: totalXP,
        niveauActuel: joueurData.niveauActuel,
        niveauStage: joueurData.niveauStage,
        scoreTotal: joueurData.scoreTotal,
        partiesJouees: joueurData.partiesJouees,
        partiesGagnees: joueurData.partiesGagnees,
        dateInscription: joueurData.dateInscription,
        badge: getBadge(totalXP),
        nombreAmis: nombreAmis,
        nombreTrophees: joueurData.trophees?.length || 0,
        trophees: joueurData.trophees || [],
        // Statut de relation avec moi
        statutAmitie: statutAmitie,
        idAmitie: idAmitie,
        estMoi: parseInt(idJoueur) === monId
      }
    });
  } catch (error) {
    console.error('Erreur récupération profil joueur:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération profil', error: error.message });
  }
};