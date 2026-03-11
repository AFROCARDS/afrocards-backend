const authService = require('../services/auth.service');

class AuthController {
  // Inscription
  async inscription(req, res) {
    try {
      const result = await authService.inscription(req.body);

      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Connexion
  async connexion(req, res) {
    try {
      const { email, motDePasse } = req.body;
      const result = await authService.connexion(email, motDePasse);

      res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir le profil de l'utilisateur connecté
  async getProfil(req, res) {
    try {
      const { Utilisateur, Joueur, Partenaire, Badge, InventaireBadge } = require('../models');
      
      const utilisateur = await Utilisateur.findByPk(req.user.id, {
        attributes: { exclude: ['motDePasse'] }
      });

      if (!utilisateur) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Récupérer le profil spécifique
      let profil = null;
      let badges = [];
      let badgePrincipal = null;
      
      if (utilisateur.typeUtilisateur === 'joueur') {
        profil = await Joueur.findOne({
          where: { idUtilisateur: utilisateur.idUtilisateur }
        });
        
        // Récupérer les badges du joueur
        if (profil) {
          const inventaireBadges = await InventaireBadge.findAll({
            where: { idJoueur: profil.idJoueur },
            include: [{
              model: Badge,
              as: 'badge',
              attributes: ['idBadge', 'nom', 'description', 'icone', 'couleur', 'recompenseXP']
            }]
          });
          
          badges = inventaireBadges
            .filter(ib => ib.badge)
            .map(ib => ({
              ...ib.badge.toJSON(),
              dateObtention: ib.dateObtention
            }))
            .sort((a, b) => (b.recompenseXP || 0) - (a.recompenseXP || 0));
          
          // Badge principal = celui avec le plus de recompenseXP
          if (badges.length > 0) {
            badgePrincipal = badges[0];
          }
        }
      } else if (utilisateur.typeUtilisateur === 'partenaire') {
        profil = await Partenaire.findOne({
          where: { idUtilisateur: utilisateur.idUtilisateur }
        });
      }

      res.status(200).json({
        success: true,
        data: {
          utilisateur,
          profil,
          badges,
          badgePrincipal
        }
      });
    } catch (error) {
      console.error('Erreur getProfil:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Déconnexion (optionnel - surtout côté client)
  async deconnexion(req, res) {
    try {
      // Mise à jour de la dernière activité
      const { Utilisateur } = require('../models');
      await Utilisateur.update(
        { derniereActivite: new Date() },
        { where: { idUtilisateur: req.user.id } }
      );

      res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Modifier le profil de l'utilisateur connecté
  async updateProfil(req, res) {
    try {
      const { Utilisateur, Joueur } = require('../models');
      const bcrypt = require('bcryptjs');
      
      const { pseudo, age, nationalite, pays, avatarURL, motDePasse, ancienMotDePasse, bio } = req.body;

      const utilisateur = await Utilisateur.findByPk(req.user.id);
      if (!utilisateur) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Si changement de mot de passe, vérifier l'ancien
      if (motDePasse && ancienMotDePasse) {
        const isMatch = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasse);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Ancien mot de passe incorrect'
          });
        }
        const salt = await bcrypt.genSalt(10);
        utilisateur.motDePasse = await bcrypt.hash(motDePasse, salt);
        await utilisateur.save();
      }

      // Mettre à jour le profil joueur
      if (utilisateur.typeUtilisateur === 'joueur') {
        const joueur = await Joueur.findOne({
          where: { idUtilisateur: utilisateur.idUtilisateur }
        });

        if (joueur) {
          if (pseudo) {
            // Vérifier que le pseudo n'est pas déjà pris
            const existingPseudo = await Joueur.findOne({ 
              where: { 
                pseudo,
                idJoueur: { [require('sequelize').Op.ne]: joueur.idJoueur }
              } 
            });
            if (existingPseudo) {
              return res.status(400).json({
                success: false,
                message: 'Ce pseudo est déjà utilisé'
              });
            }
            joueur.pseudo = pseudo;
          }
          if (age !== undefined) joueur.age = age;
          if (nationalite) joueur.nationalite = nationalite;
          if (pays) joueur.pays = pays;
          if (avatarURL) joueur.avatarURL = avatarURL;
          if (bio !== undefined) joueur.bio = bio;
          
          await joueur.save();

          return res.status(200).json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: {
              idJoueur: joueur.idJoueur,
              pseudo: joueur.pseudo,
              age: joueur.age,
              nationalite: joueur.nationalite,
              pays: joueur.pays,
              avatarURL: joueur.avatarURL,
              bio: joueur.bio
            }
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Profil mis à jour'
      });
    } catch (error) {
      console.error('Erreur updateProfil:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();