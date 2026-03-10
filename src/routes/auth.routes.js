const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateInscription, validateConnexion } = require('../middlewares/validation.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Gestion de l'authentification des utilisateurs
 */

/**
 * @swagger
 * /auth/inscription:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - email
 *               - motDePasse
 *               - typeUtilisateur
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Jean Dupont"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *               motDePasse:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "Password123"
 *               typeUtilisateur:
 *                 type: string
 *                 enum: [joueur, partenaire, admin]
 *                 example: "joueur"
 *               pseudo:
 *                 type: string
 *                 description: Requis pour les joueurs
 *                 example: "JeanD92"
 *               age:
 *                 type: integer
 *                 minimum: 13
 *                 maximum: 120
 *                 example: 25
 *               pays:
 *                 type: string
 *                 example: "Bénin"
 *               entreprise:
 *                 type: string
 *                 description: Requis pour les partenaires
 *                 example: "TechCorp SA"
 *     responses:
 *       201:
 *         description: Inscription réussie
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
 *                   example: "Inscription réussie"
 *                 data:
 *                   type: object
 *                   properties:
 *                     utilisateur:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         nom:
 *                           type: string
 *                         email:
 *                           type: string
 *                         type:
 *                           type: string
 *                     profil:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         pseudo:
 *                           type: string
 *                     token:
 *                       type: string
 *                       description: JWT token pour l'authentification
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cet email est déjà utilisé"
 */
router.post('/inscription', validateInscription, authController.inscription);

/**
 * @swagger
 * /auth/connexion:
 *   post:
 *     summary: Connexion d'un utilisateur existant
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - motDePasse
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *               motDePasse:
 *                 type: string
 *                 format: password
 *                 example: "Password123"
 *     responses:
 *       200:
 *         description: Connexion réussie
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
 *                   example: "Connexion réussie"
 *                 data:
 *                   type: object
 *                   properties:
 *                     utilisateur:
 *                       type: object
 *                     profil:
 *                       type: object
 *                     token:
 *                       type: string
 *       401:
 *         description: Email ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email ou mot de passe incorrect"
 */
router.post('/connexion', validateConnexion, authController.connexion);

/**
 * @swagger
 * /auth/profil:
 *   get:
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
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
 *                     utilisateur:
 *                       type: object
 *                       properties:
 *                         idUtilisateur:
 *                           type: integer
 *                         nom:
 *                           type: string
 *                         email:
 *                           type: string
 *                         typeUtilisateur:
 *                           type: string
 *                         statutCompte:
 *                           type: string
 *                         dateCreation:
 *                           type: string
 *                           format: date-time
 *                     profil:
 *                       type: object
 *                       description: Profil spécifique (Joueur ou Partenaire)
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/profil', verifyToken, authController.getProfil);

/**
 * @swagger
 * /auth/deconnexion:
 *   post:
 *     summary: Déconnexion de l'utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
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
 *                   example: "Déconnexion réussie"
 *       401:
 *         description: Non authentifié
 */
router.post('/deconnexion', verifyToken, authController.deconnexion);

// PUT /auth/profil - Modifier le profil
router.put('/profil', verifyToken, authController.updateProfil);

module.exports = router;