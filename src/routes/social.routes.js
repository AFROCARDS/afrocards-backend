const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { socialValidator } = require('../utils/validators');
const { validate } = require('../middlewares/validation.middleware');

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: Social
 *     description: Messagerie, notifications et préférences
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         expediteurId:
 *           type: integer
 *           example: 2
 *         destinataireId:
 *           type: integer
 *           example: 3
 *         contenu:
 *           type: string
 *           example: "Salut !"
 *         dateEnvoi:
 *           type: string
 *           format: date-time
 *           example: "2025-12-05T12:00:00Z"
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         message:
 *           type: string
 *           example: "Vous avez un nouveau message"
 *         lue:
 *           type: boolean
 *           example: false
 *         dateCreation:
 *           type: string
 *           format: date-time
 *           example: "2025-12-05T12:00:00Z"
 *     PreferencesNotif:
 *       type: object
 *       properties:
 *         email:
 *           type: boolean
 *           example: true
 *         push:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /social/messages:
 *   post:
 *     summary: Envoyer un message à un autre joueur
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destinataireId
 *               - contenu
 *             properties:
 *               destinataireId:
 *                 type: integer
 *                 example: 3
 *               contenu:
 *                 type: string
 *                 example: "Salut !"
 *     responses:
 *       201:
 *         description: Message envoyé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Données invalides
 */
router.post('/messages', socialValidator.sendMessage, validate, socialController.sendMessage);

/**
 * @swagger
 * /social/messages/{idAutreJoueur}:
 *   get:
 *     summary: Voir la conversation avec un autre joueur
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAutreJoueur
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'autre joueur
 *     responses:
 *       200:
 *         description: Conversation récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       404:
 *         description: Conversation introuvable
 */
router.get('/messages/:idAutreJoueur', socialController.getConversation);

/**
 * @swagger
 * /social/notifications:
 *   get:
 *     summary: Récupérer mes notifications
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get('/notifications', socialController.getNotifications);

/**
 * @swagger
 * /social/notifications/{id}/read:
 *   put:
 *     summary: Marquer une notification comme lue
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       404:
 *         description: Notification introuvable
 */
router.put('/notifications/:id/read', socialController.markAsRead);

/**
 * @swagger
 * /social/notifications/read-all:
 *   put:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
 */
router.put('/notifications/read-all', socialController.markAllAsRead);

/**
 * @swagger
 * /social/preferences:
 *   put:
 *     summary: Modifier les préférences de notifications
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PreferencesNotif'
 *     responses:
 *       200:
 *         description: Préférences mises à jour
 *       400:
 *         description: Données invalides
 */
router.put('/preferences', socialValidator.updateNotificationSettings, validate, socialController.updatePreferences);

/**
 * @swagger
 * /social/report:
 *   post:
 *     summary: Signaler un joueur
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idSignale
 *               - motif
 *             properties:
 *               idSignale:
 *                 type: integer
 *                 example: 2
 *               motif:
 *                 type: string
 *                 example: "Langage inapproprié"
 *               details:
 *                 type: string
 *                 example: "Ce joueur a utilisé des insultes dans le chat."
 *     responses:
 *       201:
 *         description: Signalement enregistré
 *       400:
 *         description: Données invalides
 */
router.post('/report', socialController.signalerJoueur);

/**
 * @swagger
 * /social/report-question:
 *   post:
 *     summary: Signaler une question (erreur, explication, etc.)
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idQuestion
 *               - motif
 *             properties:
 *               idQuestion:
 *                 type: integer
 *                 example: 123
 *               motif:
 *                 type: string
 *                 example: "Erreur sur la réponse"
 *               details:
 *                 type: string
 *                 example: "La bonne réponse n'est pas correcte."
 *     responses:
 *       201:
 *         description: Signalement enregistré
 *       400:
 *         description: Données invalides
 */
router.post('/report-question', socialController.signalerQuestion);

// ==========================================
// ROUTES GESTION DES AMIS
// ==========================================

/**
 * @swagger
 * /social/amis:
 *   get:
 *     summary: Récupérer ma liste d'amis
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des amis
 */
router.get('/amis', socialController.getMesAmis);

/**
 * @swagger
 * /social/amis/demandes/recues:
 *   get:
 *     summary: Récupérer les demandes d'amis reçues
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes reçues
 */
router.get('/amis/demandes/recues', socialController.getDemandesRecues);

/**
 * @swagger
 * /social/amis/demandes/envoyees:
 *   get:
 *     summary: Récupérer les demandes d'amis envoyées
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes envoyées
 */
router.get('/amis/demandes/envoyees', socialController.getDemandesEnvoyees);

/**
 * @swagger
 * /social/amis/count:
 *   get:
 *     summary: Obtenir le nombre d'amis
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre d'amis
 */
router.get('/amis/count', socialController.getNombreAmis);

/**
 * @swagger
 * /social/amis/demande:
 *   post:
 *     summary: Envoyer une demande d'ami
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idJoueur
 *             properties:
 *               idJoueur:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Demande envoyée
 */
router.post('/amis/demande', socialController.envoyerDemandeAmi);

/**
 * @swagger
 * /social/amis/{idAmitie}/accepter:
 *   put:
 *     summary: Accepter une demande d'ami
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAmitie
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Demande acceptée
 */
router.put('/amis/:idAmitie/accepter', socialController.accepterDemandeAmi);

/**
 * @swagger
 * /social/amis/{idAmitie}/refuser:
 *   put:
 *     summary: Refuser une demande d'ami
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAmitie
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Demande refusée
 */
router.put('/amis/:idAmitie/refuser', socialController.refuserDemandeAmi);

/**
 * @swagger
 * /social/amis/{idAmitie}:
 *   delete:
 *     summary: Supprimer un ami
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAmitie
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ami supprimé
 */
router.delete('/amis/:idAmitie', socialController.supprimerAmi);

/**
 * @swagger
 * /social/amis/bloquer:
 *   post:
 *     summary: Bloquer un joueur
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idJoueur
 *             properties:
 *               idJoueur:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Joueur bloqué
 */
router.post('/amis/bloquer', socialController.bloquerJoueur);

/**
 * @swagger
 * /social/joueurs/rechercher:
 *   get:
 *     summary: Rechercher des joueurs par pseudo
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pseudo
 *         required: true
 *         schema:
 *           type: string
 *         description: Pseudo à rechercher (min 2 caractères)
 *     responses:
 *       200:
 *         description: Liste des joueurs trouvés
 */
router.get('/joueurs/rechercher', socialController.rechercherJoueurs);

/**
 * @swagger
 * /social/joueurs/{idJoueur}/profil:
 *   get:
 *     summary: Voir le profil public d'un joueur
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idJoueur
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du joueur
 *     responses:
 *       200:
 *         description: Profil du joueur
 *       404:
 *         description: Joueur introuvable
 *       403:
 *         description: Profil non accessible (bloqué)
 */
router.get('/joueurs/:idJoueur/profil', socialController.getProfilJoueur);

module.exports = router;
