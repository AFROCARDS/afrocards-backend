# Seeder: Challenges Sponsorisés

Ce seeder crée des données de test pour les challenges sponsorisés.

## Ce qu'il crée

### Partenaires (5)
- **Google** - Technologie
- **Microsoft** - Logiciels
- **Apple** - Électronique
- **Amazon** - E-commerce
- **Netflix** - Divertissement

### Challenges Sponsorisés (6)
1. **Google Search Master** - 500 XP + Badge
2. **Microsoft Innovation Challenge** - 400 XP + 1000 Coins
3. **Apple Ecosystem Quiz** - 600 XP + Trophée
4. **Amazon Web Services Challenge** - 550 XP + 800 Coins
5. **Netflix Movie Trivia** - 350 XP + 1 mois Netflix
6. **Google Cloud Platform Quiz** - 480 XP + Badge Expert

### Trophées (5)
- Associés à chaque partenaire
- Rareté variée (Legendaire, Épique, Rare)

## Comment utiliser

### Option 1: Via npm script (recommandé)
```bash
npm run seed:challenges
```

### Option 2: Node directement
```bash
node src/seeds/seedChallengesSponsorisees.js
```

## Notes

- Les partenaires et challenges **ne seront créés que s'ils n'existent pas déjà**
- Les données de test incluent des dates variées (actifs maintenant et futurs)
- Les dates d'expiration vont de 10 à 30 jours dans le futur
- Parfait pour tester le frontend avec des vraies données

## Pour tester l'app

1. Exécute le seeder:
   ```bash
   npm run seed:challenges
   ```

2. Démarre le serveur:
   ```bash
   npm run dev
   ```

3. Dans l'app Flutter, tu verras les défis sponsorisés dans:
   - Home Screen → Défis Partenaires
   - Game Modes → Challenge mode

## Données de test dans l'app

- Les challenges sont actifs et prêts à jouer
- Les récompenses, noms et descriptions sont réalistes
- 10 questions de test générées automatiquement pour chaque challenge
- Score minimum 70% pour gagner le trophée
