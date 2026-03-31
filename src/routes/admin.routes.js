// ============================================
// ADMIN ROUTES - admin.routes.js (CORRIGÉ)
// ============================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const { adminValidator } = require('../utils/validators');
const { validate } = require('../middlewares/validation.middleware');

// PROTECTION GLOBALE : Authentifié ET rôle 'admin' requis
router.use(verifyToken);
router.use(checkRole('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administration et gestion des utilisateurs (accès admin uniquement)
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Obtenir les statistiques du dashboard admin
 *     description: Retourne les statistiques globales de la plateforme
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     global:
 *                       type: object
 *                       properties:
 *                         utilisateurs:
 *                           type: integer
 *                           example: 1250
 *                         joueurs:
 *                           type: integer
 *                           example: 1100
 *                         quiz:
 *                           type: integer
 *                           example: 45
 *                         partiesJouees:
 *                           type: integer
 *                           example: 5680
 *                     mensuel:
 *                       type: object
 *                       properties:
 *                         nouveauxInscrits:
 *                           type: integer
 *                           example: 78
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (non admin)
 *       500:
 *         description: Erreur serveur
 */
router.get('/dashboard', adminController.getDashboardStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Obtenir la liste de tous les utilisateurs
 *     description: Liste paginée des utilisateurs avec filtres optionnels
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de la page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [joueur, partenaire, admin]
 *         description: Filtrer par type d'utilisateur
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 1250
 *                 totalPages:
 *                   type: integer
 *                   example: 63
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idUtilisateur:
 *                         type: integer
 *                       nom:
 *                         type: string
 *                       email:
 *                         type: string
 *                       typeUtilisateur:
 *                         type: string
 *                       statutCompte:
 *                         type: string
 *                       dateCreation:
 *                         type: string
 *                         format: date-time
 *                       Joueur:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           pseudo:
 *                             type: string
 *                           niveau:
 *                             type: integer
 *                           pays:
 *                             type: string
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur récupération utilisateurs
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   put:
 *     summary: Modifier le statut d'un compte utilisateur
 *     description: Permet de suspendre, activer ou supprimer un compte
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [actif, suspendu, supprime]
 *                 example: "suspendu"
 *     responses:
 *       200:
 *         description: Statut modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Compte passé en statut : suspendu"
 *       403:
 *         description: Impossible de modifier son propre statut
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur modification statut
 */
router.put('/users/:id/status', adminValidator.updateStatus, validate, adminController.updateUserStatus);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   put:
 *     summary: Modifier le rôle d'un utilisateur
 *     description: Permet de promouvoir ou rétrograder un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [joueur, partenaire, admin]
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Rôle modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rôle utilisateur mis à jour : admin"
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur modification rôle
 */
router.put('/users/:id/role', adminValidator.updateRole, validate, adminController.updateUserRole);

// ============================================
// ROUTES STATISTIQUES AVANCÉES
// ============================================

/**
 * @swagger
 * /admin/stats/users-evolution:
 *   get:
 *     summary: Evolution des inscriptions sur les derniers mois
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Nombre de mois à récupérer
 *     responses:
 *       200:
 *         description: Données récupérées avec succès
 */
router.get('/stats/users-evolution', adminController.getUsersEvolution);

/**
 * @swagger
 * /admin/stats/parties-evolution:
 *   get:
 *     summary: Evolution des parties sur les derniers jours
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Nombre de jours à récupérer
 *     responses:
 *       200:
 *         description: Données récupérées avec succès
 */
router.get('/stats/parties-evolution', adminController.getPartiesEvolution);

/**
 * @swagger
 * /admin/stats/questions-by-category:
 *   get:
 *     summary: Répartition des questions par catégorie
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données récupérées avec succès
 */
router.get('/stats/questions-by-category', adminController.getQuestionsByCategory);

/**
 * @swagger
 * /admin/stats/top-players:
 *   get:
 *     summary: Top joueurs par score
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de joueurs à récupérer
 *     responses:
 *       200:
 *         description: Données récupérées avec succès
 */
router.get('/stats/top-players', adminController.getTopPlayers);

/**
 * @swagger
 * /admin/stats/signalements:
 *   get:
 *     summary: Statistiques des signalements
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données récupérées avec succès
 */
router.get('/stats/signalements', adminController.getSignalementsStats);

/**
 * @swagger
 * /admin/stats/users-distribution:
 *   get:
 *     summary: Répartition des utilisateurs par type
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données récupérées avec succès
 */
router.get('/stats/users-distribution', adminController.getUsersDistribution);

/**
 * @swagger
 * /admin/stats/players-by-country:
 *   get:
 *     summary: Répartition des joueurs par pays
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de pays à récupérer
 *     responses:
 *       200:
 *         description: Données récupérées avec succès
 */
router.get('/stats/players-by-country', adminController.getPlayersByCountry);

/**
 * @swagger
 * /admin/stats/recent-activity:
 *   get:
 *     summary: Activité récente (inscriptions et parties)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments à récupérer
 *     responses:
 *       200:
 *         description: Données récupérées avec succès
 */
router.get('/stats/recent-activity', adminController.getRecentActivity);

/**
 * @swagger
 * /admin/stats/challenges-sponsorises:
 *   get:
 *     summary: Statistiques des challenges sponsorisés
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données récupérées avec succès
 */
router.get('/stats/challenges-sponsorises', adminController.getChallengesSponsorisesStats);

module.exports = router;

