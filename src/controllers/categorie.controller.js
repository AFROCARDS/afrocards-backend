const { Categorie, SousCategorie, Quiz } = require('../models');

// 1. Créer une catégorie
exports.createCategorie = async (req, res) => {
  try {
    const { nom, description, icone } = req.body;

    // Vérifier l'unicité du nom
    const existingCategorie = await Categorie.findOne({ where: { nom } });
    if (existingCategorie) {
      return res.status(400).json({ success: false, message: 'Une catégorie avec ce nom existe déjà' });
    }

    const newCategorie = await Categorie.create({
      nom,
      description,
      icone // Si null, la valeur par défaut du modèle sera utilisée
    });

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: newCategorie
    });
  } catch (error) {
    console.error('Erreur createCategorie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// 2. Récupérer toutes les catégories avec leurs sous-catégories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.findAll({
      include: [{
        model: SousCategorie,
        as: 'sousCategories',
        attributes: ['idSousCategorie', 'nom', 'description', 'icone']
      }],
      order: [['nom', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération catégories' });
  }
};

// 3. Récupérer une catégorie par ID (avec ses Quiz associés et sous-catégories)
exports.getCategorieById = async (req, res) => {
  try {
    const { id } = req.params;

    const categorie = await Categorie.findByPk(id, {
      include: [
        {
          model: SousCategorie,
          as: 'sousCategories',
          attributes: ['idSousCategorie', 'nom', 'description', 'icone']
        },
        {
          model: Quiz,
          attributes: ['idQuiz', 'titre', 'difficulte', 'statut'],
          through: { attributes: [] } // Masquer la table de liaison
        }
      ]
    });

    if (!categorie) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    res.status(200).json({
      success: true,
      data: categorie
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération catégorie' });
  }
};

// 4. Modifier une catégorie
exports.updateCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, icone } = req.body;

    const categorie = await Categorie.findByPk(id);
    if (!categorie) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    // Si on change le nom, vérifier qu'il n'existe pas déjà ailleurs
    if (nom && nom !== categorie.nom) {
      const existingName = await Categorie.findOne({ where: { nom } });
      if (existingName) {
        return res.status(400).json({ success: false, message: 'Ce nom de catégorie est déjà pris' });
      }
    }

    await categorie.update({
      nom,
      description,
      icone
    });

    res.status(200).json({
      success: true,
      message: 'Catégorie mise à jour',
      data: categorie
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur modification catégorie' });
  }
};

// 5. Supprimer une catégorie
exports.deleteCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    const categorie = await Categorie.findByPk(id);

    if (!categorie) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    await categorie.destroy();

    res.status(200).json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression catégorie' });
  }
};