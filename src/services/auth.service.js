const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur, Joueur, Partenaire, Coin, PointsVie, XP, Ami } = require('../models');

class AuthService {
  // Générer un token JWT
  generateToken(userId, email, type) {
    return jwt.sign(
      { id: userId, email, type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  // Hasher le mot de passe
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Comparer les mots de passe
  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  // Inscrire un nouvel utilisateur
  async inscription(data) {
    const { nom, email, motDePasse, typeUtilisateur, pseudo, entreprise, age, pays } = data;

    // Vérifier si l'email existe déjà
    const emailExist = await Utilisateur.findOne({ where: { email } });
    if (emailExist) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await this.hashPassword(motDePasse);

    // Créer l'utilisateur
    const utilisateur = await Utilisateur.create({
      nom,
      email,
      motDePasse: hashedPassword,
      typeUtilisateur,
      statutCompte: 'actif'
    });

    // Créer le profil spécifique selon le type
    let profil = null;

    if (typeUtilisateur === 'joueur') {
      // Vérifier si le pseudo existe
      const pseudoExist = await Joueur.findOne({ where: { pseudo } });
      if (pseudoExist) {
        await utilisateur.destroy();
        throw new Error('Ce pseudo est déjà utilisé');
      }

      // Créer le joueur
      profil = await Joueur.create({
        idUtilisateur: utilisateur.idUtilisateur,
        pseudo,
        age,
        pays,
        avatarURL: 'assets/images/avatars/default.png',
        scoreTotal: 0,
        niveau: 1,
        pointsXP: 0,
        totalXP: 0,
        niveauStage: 1,
        coins: 100,
        vies: 5,
        niveauActuel: 'Stage 1',
        maxNiveauDebloque: 1,
        partiesJouees: 0,
        partiesGagnees: 0,
        statutPremium: false,
        xpBoostMultiplier: 1
      });

      // Initialiser les ressources du joueur
      await Promise.all([
        Coin.create({
          idJoueur: profil.idJoueur,
          solde: 100 // Coins de départ
        }),
        PointsVie.create({
          idJoueur: profil.idJoueur,
          solde: 5 // Points de vie de départ
        }),
        XP.create({
          idJoueur: profil.idJoueur,
          niveau: 1,
          xpActuel: 0,
          xpProchainNiveau: 100
        })
      ]);

      // Ajouter les bots comme amis automatiquement
      try {
        const bots = await Joueur.findAll({
          include: [{
            model: Utilisateur,
            where: { typeUtilisateur: 'bot' }
          }]
        });
        
        for (const bot of bots) {
          await Ami.findOrCreate({
            where: {
              idJoueur1: bot.idJoueur,
              idJoueur2: profil.idJoueur
            },
            defaults: {
              statut: 'accepte',
              dateReponse: new Date()
            }
          });
        }
      } catch (botError) {
        console.error('Erreur ajout bots comme amis:', botError.message);
        // On ne bloque pas l'inscription si les bots échouent
      }
    } else if (typeUtilisateur === 'partenaire') {
      profil = await Partenaire.create({
        idUtilisateur: utilisateur.idUtilisateur,
        entreprise: entreprise || nom,
        statut: 'en_attente' // Nécessite validation admin
      });
    }

    // Générer le token
    const token = this.generateToken(
      utilisateur.idUtilisateur,
      utilisateur.email,
      utilisateur.typeUtilisateur
    );

    return {
      utilisateur: {
        id: utilisateur.idUtilisateur,
        nom: utilisateur.nom,
        email: utilisateur.email,
        type: utilisateur.typeUtilisateur
      },
      profil: typeUtilisateur === 'joueur' ? {
        id: profil.idJoueur,
        pseudo: profil.pseudo
      } : profil,
      token
    };
  }

  // Connexion
  async connexion(email, motDePasse) {
    // Trouver l'utilisateur
    const utilisateur = await Utilisateur.findOne({ where: { email } });

    if (!utilisateur) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isValid = await this.comparePassword(motDePasse, utilisateur.motDePasse);

    if (!isValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le statut du compte
    if (utilisateur.statutCompte !== 'actif') {
      throw new Error('Compte suspendu ou supprimé');
    }

    // Mettre à jour la date de dernière connexion
    await utilisateur.update({ dernierLogin: new Date() });

    // Récupérer le profil
    let profil = null;
    if (utilisateur.typeUtilisateur === 'joueur') {
      profil = await Joueur.findOne({
        where: { idUtilisateur: utilisateur.idUtilisateur }
      });
    } else if (utilisateur.typeUtilisateur === 'partenaire') {
      profil = await Partenaire.findOne({
        where: { idUtilisateur: utilisateur.idUtilisateur }
      });
    }

    // Générer le token
    const token = this.generateToken(
      utilisateur.idUtilisateur,
      utilisateur.email,
      utilisateur.typeUtilisateur
    );

    return {
      utilisateur: {
        id: utilisateur.idUtilisateur,
        nom: utilisateur.nom,
        email: utilisateur.email,
        type: utilisateur.typeUtilisateur
      },
      profil: utilisateur.typeUtilisateur === 'joueur' && profil ? {
        id: profil.idJoueur,
        pseudo: profil.pseudo,
        niveau: profil.niveau,
        scoreTotal: profil.scoreTotal
      } : profil,
      token
    };
  }
}

module.exports = new AuthService();