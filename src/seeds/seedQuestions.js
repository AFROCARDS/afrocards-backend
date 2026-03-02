/**
 * Seeder pour les questions du quiz Afrocards
 * Contient des questions avec images pour chaque catégorie
 */

require('dotenv').config();
const { Categorie, Question, Reponse, Explication } = require('../models');

// Images gratuites depuis Unsplash/Pexels pour chaque catégorie
const images = {
  geographie: [
    'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400', // Afrique carte
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400', // Montagne Kilimandjaro
    'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400', // Nil
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400', // Safari savane
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400', // Pyramides
  ],
  histoire: [
    'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400', // Ancient Egypt
    'https://images.unsplash.com/photo-1568322503122-d5a1e02c3da1?w=400', // African masks
    'https://images.unsplash.com/photo-1580746738099-78d6833213c1?w=400', // Historical monument
    'https://images.unsplash.com/photo-1590845947670-c009801ffa74?w=400', // African art
    'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400', // Old map
  ],
  arts: [
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400', // African drums
    'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=400', // Dance
    'https://images.unsplash.com/photo-1495573020741-c7c9c6a51cc4?w=400', // African textile
    'https://images.unsplash.com/photo-1590845947670-c009801ffa74?w=400', // Sculpture
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', // Music concert
  ],
  science: [
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400', // Science lab
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', // Technology
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', // Space
    'https://images.unsplash.com/photo-1581093458791-9d15482aec9e?w=400', // Innovation
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', // Tech Africa
  ],
  biologie: [
    'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=400', // Lion
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400', // Elephant
    'https://images.unsplash.com/photo-1551085254-e96b210db58a?w=400', // Gorilla
    'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=400', // Giraffe
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400', // Zebras
  ],
  politique: [
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400', // Parliament
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400', // Government
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400', // Flag
    'https://images.unsplash.com/photo-1494172961521-33799ddd43a5?w=400', // Meeting
    'https://images.unsplash.com/photo-1596443686812-2f45229b31b4?w=400', // Conference
  ]
};

// Questions par catégorie avec difficulté, réponses et explications
const questionsData = {
  'Géographie': [
    {
      texte: 'Quel est le plus grand pays d\'Afrique en superficie ?',
      difficulte: 'facile',
      tempsReponse: 30,
      points: 10,
      imageIndex: 0,
      reponses: [
        { texte: 'Algérie', estCorrecte: true },
        { texte: 'Soudan', estCorrecte: false },
        { texte: 'République Démocratique du Congo', estCorrecte: false },
        { texte: 'Libye', estCorrecte: false }
      ],
      explication: {
        texte: 'L\'Algérie est le plus grand pays d\'Afrique avec une superficie de 2 381 741 km². Après la sécession du Soudan du Sud en 2011, l\'Algérie est devenue le plus grand pays du continent, dépassant le Soudan qui occupait auparavant cette première place.',
        source: 'Nations Unies - Statistiques géographiques',
        lienRessource: 'https://unstats.un.org/unsd/geographic'
      }
    },
    {
      texte: 'Quelle est la plus haute montagne d\'Afrique ?',
      difficulte: 'facile',
      tempsReponse: 25,
      points: 10,
      imageIndex: 1,
      reponses: [
        { texte: 'Mont Kenya', estCorrecte: false },
        { texte: 'Mont Kilimandjaro', estCorrecte: true },
        { texte: 'Mont Stanley', estCorrecte: false },
        { texte: 'Mont Cameroun', estCorrecte: false }
      ],
      explication: {
        texte: 'Le Mont Kilimandjaro en Tanzanie est la plus haute montagne d\'Afrique avec ses 5 895 mètres d\'altitude. C\'est un stratovolcan dormant composé de trois cônes volcaniques : Kibo, Mawenzi et Shira. Son sommet enneigé est emblématique du paysage africain.',
        source: 'National Geographic',
        lienRessource: 'https://www.nationalgeographic.com/travel/destinations/africa/tanzania/mount-kilimanjaro'
      }
    },
    {
      texte: 'Quel est le plus long fleuve d\'Afrique ?',
      difficulte: 'facile',
      tempsReponse: 25,
      points: 10,
      imageIndex: 2,
      reponses: [
        { texte: 'Le Congo', estCorrecte: false },
        { texte: 'Le Niger', estCorrecte: false },
        { texte: 'Le Nil', estCorrecte: true },
        { texte: 'Le Zambèze', estCorrecte: false }
      ],
      explication: {
        texte: 'Le Nil est le plus long fleuve d\'Afrique et l\'un des deux plus longs du monde avec environ 6 650 km. Il traverse 11 pays d\'Afrique de l\'Est et du Nord, dont l\'Ouganda, le Soudan et l\'Égypte, avant de se jeter dans la mer Méditerranée.',
        source: 'Encyclopédie Britannica',
        lienRessource: 'https://www.britannica.com/place/Nile-River'
      }
    },
    {
      texte: 'Combien de pays compte le continent africain ?',
      difficulte: 'moyen',
      tempsReponse: 30,
      points: 15,
      imageIndex: 3,
      reponses: [
        { texte: '48 pays', estCorrecte: false },
        { texte: '54 pays', estCorrecte: true },
        { texte: '56 pays', estCorrecte: false },
        { texte: '52 pays', estCorrecte: false }
      ],
      explication: {
        texte: 'L\'Afrique compte 54 pays reconnus par l\'Union Africaine. C\'est le deuxième continent le plus peuplé après l\'Asie avec plus de 1,4 milliard d\'habitants. Le dernier pays à avoir obtenu son indépendance est le Soudan du Sud en 2011.',
        source: 'Union Africaine',
        lienRessource: 'https://au.int/en/member_states/countryprofiles2'
      }
    },
    {
      texte: 'Dans quel pays africain se trouve la vallée des Rois ?',
      difficulte: 'moyen',
      tempsReponse: 25,
      points: 15,
      imageIndex: 4,
      reponses: [
        { texte: 'Maroc', estCorrecte: false },
        { texte: 'Tunisie', estCorrecte: false },
        { texte: 'Égypte', estCorrecte: true },
        { texte: 'Libye', estCorrecte: false }
      ],
      explication: {
        texte: 'La Vallée des Rois est située en Égypte, sur la rive ouest du Nil, près de Louxor. Elle servait de nécropole royale pendant le Nouvel Empire (1550-1069 av. J.-C.) et abrite les tombes de nombreux pharaons, dont celle de Toutânkhamon découverte en 1922.',
        source: 'UNESCO - Patrimoine mondial',
        lienRessource: 'https://whc.unesco.org/fr/list/87'
      }
    }
  ],
  'Histoire': [
    {
      texte: 'Qui était le premier président du Ghana indépendant ?',
      difficulte: 'moyen',
      tempsReponse: 30,
      points: 15,
      imageIndex: 0,
      reponses: [
        { texte: 'Kwame Nkrumah', estCorrecte: true },
        { texte: 'Jomo Kenyatta', estCorrecte: false },
        { texte: 'Julius Nyerere', estCorrecte: false },
        { texte: 'Léopold Sédar Senghor', estCorrecte: false }
      ],
      explication: {
        texte: 'Kwame Nkrumah (1909-1972) fut le premier dirigeant du Ghana indépendant en 1957. Il était un fervent défenseur du panafricanisme et a joué un rôle clé dans la création de l\'Organisation de l\'Unité Africaine (OUA) en 1963. Il est considéré comme l\'un des pères fondateurs de l\'Afrique moderne.',
        source: 'Archives historiques du Ghana',
        lienRessource: 'https://www.britannica.com/biography/Kwame-Nkrumah'
      }
    },
    {
      texte: 'En quelle année Nelson Mandela a-t-il été libéré de prison ?',
      difficulte: 'facile',
      tempsReponse: 25,
      points: 10,
      imageIndex: 1,
      reponses: [
        { texte: '1988', estCorrecte: false },
        { texte: '1990', estCorrecte: true },
        { texte: '1992', estCorrecte: false },
        { texte: '1994', estCorrecte: false }
      ],
      explication: {
        texte: 'Nelson Mandela a été libéré le 11 février 1990 après 27 ans d\'emprisonnement. Il était devenu le symbole mondial de la lutte contre l\'apartheid. Quatre ans plus tard, en 1994, il est devenu le premier président noir d\'Afrique du Sud.',
        source: 'Nelson Mandela Foundation',
        lienRessource: 'https://www.nelsonmandela.org/content/page/biography'
      }
    },
    {
      texte: 'Quel empire africain était dirigé par Mansa Moussa ?',
      difficulte: 'difficile',
      tempsReponse: 30,
      points: 20,
      imageIndex: 2,
      reponses: [
        { texte: 'Empire du Ghana', estCorrecte: false },
        { texte: 'Empire Songhaï', estCorrecte: false },
        { texte: 'Empire du Mali', estCorrecte: true },
        { texte: 'Empire Ashanti', estCorrecte: false }
      ],
      explication: {
        texte: 'Mansa Moussa (1280-1337) était le dixième empereur de l\'Empire du Mali. Il est célèbre pour son pèlerinage à La Mecque en 1324 durant lequel il distribua tellement d\'or qu\'il fit chuter le cours du métal précieux en Égypte et au Moyen-Orient. Il est souvent considéré comme l\'homme le plus riche de l\'histoire.',
        source: 'Histoire de l\'Afrique de l\'Ouest',
        lienRessource: 'https://www.britannica.com/biography/Mansa-Musa'
      }
    },
    {
      texte: 'Comment s\'appelait l\'Éthiopie dans l\'Antiquité ?',
      difficulte: 'difficile',
      tempsReponse: 30,
      points: 20,
      imageIndex: 3,
      reponses: [
        { texte: 'Numidie', estCorrecte: false },
        { texte: 'Abyssinie', estCorrecte: true },
        { texte: 'Carthage', estCorrecte: false },
        { texte: 'Axoum', estCorrecte: false }
      ],
      explication: {
        texte: 'L\'Éthiopie était connue sous le nom d\'Abyssinie jusqu\'au XXe siècle. Ce terme vient du mot arabe "Habesha" qui désignait les peuples des hauts plateaux éthiopiens. L\'Empire d\'Axoum, l\'un des plus puissants de l\'Antiquité, était situé dans cette région.',
        source: 'Histoire de l\'Éthiopie',
        lienRessource: 'https://www.britannica.com/place/Ethiopia'
      }
    },
    {
      texte: 'Quelle reine africaine a résisté à la colonisation italienne en Éthiopie ?',
      difficulte: 'difficile',
      tempsReponse: 35,
      points: 25,
      imageIndex: 4,
      reponses: [
        { texte: 'Reine Nzinga', estCorrecte: false },
        { texte: 'Impératrice Taytu Betul', estCorrecte: true },
        { texte: 'Reine Amina', estCorrecte: false },
        { texte: 'Reine Makeda', estCorrecte: false }
      ],
      explication: {
        texte: 'L\'impératrice Taytu Betul (1851-1918) était l\'épouse de l\'empereur Menelik II. Elle a joué un rôle stratégique majeur dans la victoire éthiopienne contre l\'Italie à la bataille d\'Adoua en 1896. Elle a personnellement dirigé des troupes et est considérée comme une héroïne nationale éthiopienne.',
        source: 'Histoire de l\'Éthiopie',
        lienRessource: 'https://www.blackpast.org/global-african-history/taytu-betul-empress-ethiopia-1851-1918/'
      }
    }
  ],
  'Arts': [
    {
      texte: 'Quel instrument de musique africain est constitué de lamelles métalliques ?',
      difficulte: 'facile',
      tempsReponse: 25,
      points: 10,
      imageIndex: 0,
      reponses: [
        { texte: 'Djembé', estCorrecte: false },
        { texte: 'Kalimba', estCorrecte: true },
        { texte: 'Kora', estCorrecte: false },
        { texte: 'Balafon', estCorrecte: false }
      ],
      explication: {
        texte: 'Le kalimba, aussi appelé "piano à pouces" ou "mbira", est un instrument de musique africain composé de lamelles métalliques fixées sur une caisse de résonance. Il est originaire d\'Afrique subsaharienne et produit un son mélodieux et hypnotique. C\'est l\'un des instruments les plus anciens du continent.',
        source: 'Musée des instruments de musique',
        lienRessource: 'https://www.britannica.com/art/kalimba'
      }
    },
    {
      texte: 'De quel pays africain est originaire la danse "Kizomba" ?',
      difficulte: 'moyen',
      tempsReponse: 30,
      points: 15,
      imageIndex: 1,
      reponses: [
        { texte: 'Sénégal', estCorrecte: false },
        { texte: 'Cap-Vert', estCorrecte: false },
        { texte: 'Angola', estCorrecte: true },
        { texte: 'Mozambique', estCorrecte: false }
      ],
      explication: {
        texte: 'La Kizomba est née en Angola dans les années 1980. Cette danse sensuelle de couple est issue du semba, une danse traditionnelle angolaise, avec des influences de zouk antillais. Son nom vient du kimbundu et signifie "fête". Elle s\'est depuis répandue dans le monde entier.',
        source: 'Culture angolaise',
        lienRessource: 'https://www.britannica.com/art/kizomba'
      }
    },
    {
      texte: 'Quel tissu africain est reconnu par l\'UNESCO comme patrimoine culturel immatériel ?',
      difficulte: 'difficile',
      tempsReponse: 30,
      points: 20,
      imageIndex: 2,
      reponses: [
        { texte: 'Bogolan', estCorrecte: false },
        { texte: 'Kanga', estCorrecte: false },
        { texte: 'Kente', estCorrecte: true },
        { texte: 'Ankara', estCorrecte: false }
      ],
      explication: {
        texte: 'Le Kente est un tissu royal originaire du Ghana, tissé par le peuple Ashanti et Ewe. Chaque motif et couleur a une signification symbolique. Le processus traditionnel de tissage du Kente est inscrit au patrimoine culturel immatériel de l\'UNESCO depuis 2023.',
        source: 'UNESCO',
        lienRessource: 'https://ich.unesco.org/fr/RL/le-kente-01959'
      }
    },
    {
      texte: 'Qui est considéré comme le "père de l\'Afrobeat" ?',
      difficulte: 'moyen',
      tempsReponse: 25,
      points: 15,
      imageIndex: 4,
      reponses: [
        { texte: 'Youssou N\'Dour', estCorrecte: false },
        { texte: 'Miriam Makeba', estCorrecte: false },
        { texte: 'Fela Kuti', estCorrecte: true },
        { texte: 'Salif Keita', estCorrecte: false }
      ],
      explication: {
        texte: 'Fela Anikulapo Kuti (1938-1997), musicien et activiste nigérian, est le créateur de l\'Afrobeat. Ce genre musical fusionne jazz, funk, highlife et musiques traditionnelles yoruba. Fela utilisait sa musique pour critiquer le gouvernement militaire nigérian et prôner le panafricanisme.',
        source: 'Histoire de la musique africaine',
        lienRessource: 'https://www.britannica.com/biography/Fela'
      }
    },
    {
      texte: 'Comment s\'appelle la cérémonie de masques traditionnels du Mali ?',
      difficulte: 'difficile',
      tempsReponse: 35,
      points: 25,
      imageIndex: 3,
      reponses: [
        { texte: 'Egungun', estCorrecte: false },
        { texte: 'Dama', estCorrecte: true },
        { texte: 'Gelede', estCorrecte: false },
        { texte: 'Poro', estCorrecte: false }
      ],
      explication: {
        texte: 'Le Dama est une cérémonie funéraire des Dogons du Mali qui honore les ancêtres décédés. Durant cette cérémonie spectaculaire, des danseurs portent des masques élaborés représentant différents êtres mythiques. Cette tradition est inscrite au patrimoine mondial de l\'UNESCO.',
        source: 'UNESCO - Culture Dogon',
        lienRessource: 'https://whc.unesco.org/fr/list/516'
      }
    }
  ],
  'Science': [
    {
      texte: 'Quel scientifique africain a reçu le prix Nobel de chimie en 1999 ?',
      difficulte: 'difficile',
      tempsReponse: 35,
      points: 25,
      imageIndex: 0,
      reponses: [
        { texte: 'Ahmed Zewail', estCorrecte: true },
        { texte: 'Wole Soyinka', estCorrecte: false },
        { texte: 'Wangari Maathai', estCorrecte: false },
        { texte: 'Denis Mukwege', estCorrecte: false }
      ],
      explication: {
        texte: 'Ahmed Zewail (1946-2016), scientifique égyptien-américain, a remporté le prix Nobel de chimie en 1999 pour ses travaux pionniers sur la femtochimie. Il a développé des techniques permettant d\'observer les réactions chimiques à l\'échelle de la femtoseconde (10^-15 secondes).',
        source: 'Fondation Nobel',
        lienRessource: 'https://www.nobelprize.org/prizes/chemistry/1999/zewail/biographical/'
      }
    },
    {
      texte: 'Quel pays africain a lancé son premier satellite en 2019 ?',
      difficulte: 'moyen',
      tempsReponse: 30,
      points: 15,
      imageIndex: 2,
      reponses: [
        { texte: 'Afrique du Sud', estCorrecte: false },
        { texte: 'Kenya', estCorrecte: false },
        { texte: 'Rwanda', estCorrecte: true },
        { texte: 'Égypte', estCorrecte: false }
      ],
      explication: {
        texte: 'Le Rwanda a lancé son premier satellite, RwaSat-1, en septembre 2019. Ce cube satellite de 3U (10x10x30 cm) a été développé par des ingénieurs rwandais formés au Japon. Il est utilisé pour surveiller les ressources en eau et l\'agriculture du pays depuis l\'espace.',
        source: 'Agence spatiale rwandaise',
        lienRessource: 'https://www.space.com/rwanda-first-satellite-rwasat-1-launch.html'
      }
    },
    {
      texte: 'Quel est le nom du premier accélérateur de particules d\'Afrique ?',
      difficulte: 'difficile',
      tempsReponse: 35,
      points: 25,
      imageIndex: 1,
      reponses: [
        { texte: 'SAFARI-1', estCorrecte: false },
        { texte: 'SESAME', estCorrecte: false },
        { texte: 'iThemba LABS', estCorrecte: true },
        { texte: 'ESRF-Africa', estCorrecte: false }
      ],
      explication: {
        texte: 'iThemba LABS (anciennement NAC) en Afrique du Sud abrite le seul accélérateur de particules d\'Afrique subsaharienne. Ce laboratoire de recherche produit des isotopes médicaux et mène des recherches en physique nucléaire. Son nom signifie "espoir" en zoulou.',
        source: 'iThemba LABS',
        lienRessource: 'https://www.tlabs.ac.za/'
      }
    },
    {
      texte: 'Quelle invention africaine aide à détecter le paludisme sans prise de sang ?',
      difficulte: 'moyen',
      tempsReponse: 30,
      points: 15,
      imageIndex: 3,
      reponses: [
        { texte: 'MalariaTest', estCorrecte: false },
        { texte: 'Matibabu', estCorrecte: true },
        { texte: 'AfriDiag', estCorrecte: false },
        { texte: 'MosquitoScan', estCorrecte: false }
      ],
      explication: {
        texte: 'Matibabu est un dispositif inventé par des étudiants ougandais qui détecte le paludisme en 2 minutes sans prise de sang. Il utilise un faisceau lumineux pour analyser les globules rouges à travers le doigt. Cette innovation a remporté de nombreux prix internationaux.',
        source: 'Innovation africaine en santé',
        lienRessource: 'https://www.bbc.com/news/world-africa-43tried0035'
      }
    },
    {
      texte: 'Quel pays africain produit le plus d\'énergie géothermique ?',
      difficulte: 'moyen',
      tempsReponse: 30,
      points: 15,
      imageIndex: 4,
      reponses: [
        { texte: 'Éthiopie', estCorrecte: false },
        { texte: 'Kenya', estCorrecte: true },
        { texte: 'Tanzanie', estCorrecte: false },
        { texte: 'Djibouti', estCorrecte: false }
      ],
      explication: {
        texte: 'Le Kenya est le leader africain de l\'énergie géothermique et le 7ème mondial. Le pays produit environ 900 MW grâce à ses centrales situées dans la vallée du Rift. La géothermie fournit près de 50% de l\'électricité du Kenya, faisant de lui un pionnier des énergies propres en Afrique.',
        source: 'Kenya Electricity Generating Company',
        lienRessource: 'https://www.kengen.co.ke/'
      }
    }
  ],
  'Biologie': [
    {
      texte: 'Quel animal africain peut dormir debout et ne dort que 30 minutes par jour ?',
      difficulte: 'facile',
      tempsReponse: 25,
      points: 10,
      imageIndex: 3,
      reponses: [
        { texte: 'L\'éléphant', estCorrecte: false },
        { texte: 'Le lion', estCorrecte: false },
        { texte: 'La girafe', estCorrecte: true },
        { texte: 'Le rhinocéros', estCorrecte: false }
      ],
      explication: {
        texte: 'La girafe est l\'animal qui dort le moins au monde avec seulement 30 minutes de sommeil par jour, divisées en micro-siestes de quelques secondes à 2 minutes. Elle peut dormir debout pour fuir rapidement les prédateurs, mais doit parfois se coucher pour atteindre le sommeil profond.',
        source: 'National Geographic - Faune africaine',
        lienRessource: 'https://www.nationalgeographic.com/animals/mammals/facts/giraffe'
      }
    },
    {
      texte: 'Quel grand singe africain partage 98% de son ADN avec l\'humain ?',
      difficulte: 'facile',
      tempsReponse: 25,
      points: 10,
      imageIndex: 2,
      reponses: [
        { texte: 'Le gorille', estCorrecte: false },
        { texte: 'L\'orang-outan', estCorrecte: false },
        { texte: 'Le chimpanzé', estCorrecte: true },
        { texte: 'Le bonobo', estCorrecte: false }
      ],
      explication: {
        texte: 'Le chimpanzé partage entre 98 et 99% de son ADN avec l\'être humain, ce qui en fait notre plus proche parent vivant. Ces primates vivent dans les forêts d\'Afrique centrale et occidentale. Ils sont capables d\'utiliser des outils, de communiquer par gestes et d\'exprimer des émotions complexes.',
        source: 'Jane Goodall Institute',
        lienRessource: 'https://www.janegoodall.org/our-story/chimpanzees/'
      }
    },
    {
      texte: 'Quel arbre africain peut stocker jusqu\'à 120 000 litres d\'eau dans son tronc ?',
      difficulte: 'moyen',
      tempsReponse: 30,
      points: 15,
      imageIndex: 0,
      reponses: [
        { texte: 'L\'acacia', estCorrecte: false },
        { texte: 'Le baobab', estCorrecte: true },
        { texte: 'Le karité', estCorrecte: false },
        { texte: 'L\'ébène', estCorrecte: false }
      ],
      explication: {
        texte: 'Le baobab, surnommé "arbre de vie", peut stocker jusqu\'à 120 000 litres d\'eau dans son tronc spongieux pour survivre aux longues saisons sèches. Certains baobabs peuvent vivre plus de 2000 ans. Toutes ses parties sont utilisables : fruits, feuilles, écorce et même le tronc creux qui peut servir d\'abri.',
        source: 'Botanical Society of Africa',
        lienRessource: 'https://www.britannica.com/plant/baobab'
      }
    },
    {
      texte: 'Quel est l\'animal terrestre le plus rapide d\'Afrique ?',
      difficulte: 'facile',
      tempsReponse: 20,
      points: 10,
      imageIndex: 0,
      reponses: [
        { texte: 'Le lion', estCorrecte: false },
        { texte: 'L\'autruche', estCorrecte: false },
        { texte: 'Le guépard', estCorrecte: true },
        { texte: 'L\'antilope', estCorrecte: false }
      ],
      explication: {
        texte: 'Le guépard est l\'animal terrestre le plus rapide au monde, capable d\'atteindre 110 km/h en seulement 3 secondes. Cependant, il ne peut maintenir cette vitesse que sur 400-600 mètres. Ses griffes semi-rétractables et sa colonne vertébrale flexible lui permettent cette accélération fulgurante.',
        source: 'African Wildlife Foundation',
        lienRessource: 'https://www.awf.org/wildlife-conservation/cheetah'
      }
    },
    {
      texte: 'Quel oiseau africain est connu pour guider les humains vers les ruches ?',
      difficulte: 'difficile',
      tempsReponse: 35,
      points: 25,
      imageIndex: 1,
      reponses: [
        { texte: 'Le calao', estCorrecte: false },
        { texte: 'L\'indicateur', estCorrecte: true },
        { texte: 'Le tisserin', estCorrecte: false },
        { texte: 'Le souimanga', estCorrecte: false }
      ],
      explication: {
        texte: 'L\'indicateur (Indicator indicator) est un oiseau africain unique qui guide les humains et les ratels vers les ruches d\'abeilles sauvages. Il attire l\'attention par ses cris et ses vols en direction de la ruche. Une fois le nid ouvert, l\'oiseau se nourrit de la cire et des larves restantes.',
        source: 'Ornithologie africaine',
        lienRessource: 'https://www.britannica.com/animal/honeyguide'
      }
    }
  ],
  'Politique': [
    {
      texte: 'En quelle année l\'Union Africaine a-t-elle été créée ?',
      difficulte: 'moyen',
      tempsReponse: 30,
      points: 15,
      imageIndex: 0,
      reponses: [
        { texte: '1999', estCorrecte: false },
        { texte: '2002', estCorrecte: true },
        { texte: '1963', estCorrecte: false },
        { texte: '2005', estCorrecte: false }
      ],
      explication: {
        texte: 'L\'Union Africaine (UA) a été officiellement lancée le 9 juillet 2002 à Durban, en Afrique du Sud. Elle a succédé à l\'Organisation de l\'Unité Africaine (OUA) créée en 1963. L\'UA compte 55 États membres et son siège est à Addis-Abeba, en Éthiopie.',
        source: 'Union Africaine',
        lienRessource: 'https://au.int/en/overview'
      }
    },
    {
      texte: 'Quel pays africain n\'a jamais été colonisé par une puissance européenne ?',
      difficulte: 'facile',
      tempsReponse: 25,
      points: 10,
      imageIndex: 2,
      reponses: [
        { texte: 'Liberia', estCorrecte: false },
        { texte: 'Éthiopie', estCorrecte: true },
        { texte: 'Ghana', estCorrecte: false },
        { texte: 'Égypte', estCorrecte: false }
      ],
      explication: {
        texte: 'L\'Éthiopie est l\'un des deux seuls pays africains (avec le Liberia) à n\'avoir jamais été colonisé. L\'Italie a tenté de la conquérir mais a été vaincue à la bataille d\'Adoua en 1896. L\'occupation italienne de 1936-1941 pendant la Seconde Guerre mondiale n\'est pas considérée comme une colonisation formelle.',
        source: 'Histoire de l\'Éthiopie',
        lienRessource: 'https://www.britannica.com/place/Ethiopia'
      }
    },
    {
      texte: 'Quelle femme africaine a été la première à recevoir le prix Nobel de la paix ?',
      difficulte: 'moyen',
      tempsReponse: 30,
      points: 15,
      imageIndex: 3,
      reponses: [
        { texte: 'Ellen Johnson Sirleaf', estCorrecte: false },
        { texte: 'Wangari Maathai', estCorrecte: true },
        { texte: 'Leymah Gbowee', estCorrecte: false },
        { texte: 'Graça Machel', estCorrecte: false }
      ],
      explication: {
        texte: 'Wangari Maathai (1940-2011), biologiste et militante kenyane, a reçu le prix Nobel de la paix en 2004. Elle est la fondatrice du Mouvement de la Ceinture Verte qui a planté plus de 51 millions d\'arbres en Afrique. Elle a été la première femme africaine à recevoir ce prix.',
        source: 'Fondation Nobel',
        lienRessource: 'https://www.nobelprize.org/prizes/peace/2004/maathai/biographical/'
      }
    },
    {
      texte: 'Quel est le siège de la Banque Africaine de Développement ?',
      difficulte: 'difficile',
      tempsReponse: 35,
      points: 20,
      imageIndex: 1,
      reponses: [
        { texte: 'Addis-Abeba, Éthiopie', estCorrecte: false },
        { texte: 'Abidjan, Côte d\'Ivoire', estCorrecte: true },
        { texte: 'Nairobi, Kenya', estCorrecte: false },
        { texte: 'Le Caire, Égypte', estCorrecte: false }
      ],
      explication: {
        texte: 'Le siège permanent de la Banque Africaine de Développement (BAD) est à Abidjan, en Côte d\'Ivoire. Fondée en 1964, la BAD est une institution financière multilatérale qui finance des projets de développement dans les 54 pays africains et 27 pays non africains membres.',
        source: 'Banque Africaine de Développement',
        lienRessource: 'https://www.afdb.org/fr'
      }
    },
    {
      texte: 'Quel ancien secrétaire général de l\'ONU était Ghanéen ?',
      difficulte: 'moyen',
      tempsReponse: 25,
      points: 15,
      imageIndex: 4,
      reponses: [
        { texte: 'Boutros Boutros-Ghali', estCorrecte: false },
        { texte: 'Ban Ki-moon', estCorrecte: false },
        { texte: 'Kofi Annan', estCorrecte: true },
        { texte: 'António Guterres', estCorrecte: false }
      ],
      explication: {
        texte: 'Kofi Annan (1938-2018) était un diplomate ghanéen qui a servi comme 7ème Secrétaire général des Nations Unies de 1997 à 2006. Il a reçu le prix Nobel de la paix en 2001 conjointement avec l\'ONU pour leur travail pour un monde mieux organisé et plus pacifique.',
        source: 'Nations Unies',
        lienRessource: 'https://www.un.org/sg/en/content/kofi-annan'
      }
    }
  ]
};

async function seedQuestions() {
  try {
    console.log('\n🔄 Connexion à la base de données...');
    await require('../config/database').authenticate();
    console.log('✅ Connexion réussie\n');

    // Récupérer les catégories
    const categories = await Categorie.findAll();
    const categoriesMap = {};
    categories.forEach(cat => {
      categoriesMap[cat.nom] = cat.idCategorie;
    });

    console.log('📚 Catégories trouvées:', Object.keys(categoriesMap).join(', '));

    let totalQuestions = 0;
    let totalReponses = 0;
    let totalExplications = 0;

    // Parcourir chaque catégorie et créer les questions
    for (const [categorieNom, questions] of Object.entries(questionsData)) {
      const idCategorie = categoriesMap[categorieNom];
      
      if (!idCategorie) {
        console.log(`⚠️  Catégorie "${categorieNom}" non trouvée, ignorée`);
        continue;
      }

      const imageKey = categorieNom.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z]/g, '');

      console.log(`\n🎯 Création des questions pour: ${categorieNom}`);

      for (const qData of questions) {
        // Vérifier si la question existe déjà
        const existingQuestion = await Question.findOne({
          where: { 
            texte: qData.texte,
            idCategorie: idCategorie
          }
        });

        if (existingQuestion) {
          console.log(`  ⏩ Question existante: "${qData.texte.substring(0, 40)}..."`);
          continue;
        }

        // Créer la question
        const imageUrl = images[imageKey]?.[qData.imageIndex] || null;
        
        const question = await Question.create({
          idCategorie,
          idQuiz: null, // Questions standalone
          texte: qData.texte,
          type: 'QCM',
          difficulte: qData.difficulte,
          tempsReponse: qData.tempsReponse,
          points: qData.points,
          mediaURL: imageUrl,
          estActive: true
        });

        totalQuestions++;
        console.log(`  ✅ Question créée: "${qData.texte.substring(0, 40)}..."`);

        // Créer les réponses
        for (let i = 0; i < qData.reponses.length; i++) {
          await Reponse.create({
            idQuestion: question.idQuestion,
            texte: qData.reponses[i].texte,
            estCorrecte: qData.reponses[i].estCorrecte,
            ordreAffichage: i + 1
          });
          totalReponses++;
        }

        // Créer l'explication
        if (qData.explication) {
          await Explication.create({
            idQuestion: question.idQuestion,
            texte: qData.explication.texte,
            source: qData.explication.source,
            lienRessource: qData.explication.lienRessource
          });
          totalExplications++;
        }
      }
    }

    console.log('\n🎉 Seed des questions terminé avec succès !');
    console.log('📊 Résumé:');
    console.log(`   - Questions créées: ${totalQuestions}`);
    console.log(`   - Réponses créées: ${totalReponses}`);
    console.log(`   - Explications créées: ${totalExplications}\n`);

    // Vérification finale
    const totalQuestionsDB = await Question.count();
    const totalReponsesDB = await Reponse.count();
    const totalExplicationsDB = await Explication.count();

    console.log('📈 Total en base de données:');
    console.log(`   - Questions: ${totalQuestionsDB}`);
    console.log(`   - Réponses: ${totalReponsesDB}`);
    console.log(`   - Explications: ${totalExplicationsDB}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

// Exécuter le seeder
seedQuestions();
