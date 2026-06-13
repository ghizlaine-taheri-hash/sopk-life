import { useState, useEffect, useRef } from "react";

// ─── COULEURS ────────────────────────────────────────────────────────────────
const C = {
  cream:"#FAF7F2",terra:"#CB9A79",mauve:"#C2AEBA",gold:"#D4A56A",
  brown:"#3D2B1F",mid:"#7A5C45",light:"#C4A882",border:"#E8DDD3",
  white:"#FFFFFF",bubble:"#F5EDE3",sage:"#B8C5A0",orange:"#D97706",blue:"#5B7FA6",
  profils:{
    metabolique:{p:"#CB9A79",l:"#FDF4EE",label:"Profil Métabolique",emoji:"⚡"},
    androgenique:{p:"#C2AEBA",l:"#F3EEF3",label:"Profil Androgénique",emoji:"🌿"},
    inflammatoire:{p:"#D4A56A",l:"#FDF0E0",label:"Profil Inflammatoire",emoji:"🔥"},
    mixte_ma:{p:"#B8909A",l:"#F5EEF0",label:"Mixte Métabolique + Androgénique",emoji:"⚡🌿"},
    mixte_mi:{p:"#C49870",l:"#FDF2E8",label:"Mixte Métabolique + Inflammatoire",emoji:"⚡🔥"},
    mixte_ai:{p:"#A89AB8",l:"#F0EDF5",label:"Mixte Androgénique + Inflammatoire",emoji:"🌿🔥"},
  }
};


// ─── PROFILS HIÉRARCHIQUES ────────────────────────────────────────────────────
const PROFIL_HIERARCHIE = {
  metabolique:{
    dominant:{label:"Métabolique",desc:"insuline · glycémie · fringales",col:"#CB9A79",em:"⚡"},
    secondaire:{label:"Androgénique léger",desc:"SHBG · sébum",col:"#C2AEBA",em:"🌿"},
    trace:{label:"Inflammatoire trace",desc:"terrain à surveiller",col:"#D4A56A",em:"🔥"},
  },
  androgenique:{
    dominant:{label:"Androgénique",desc:"DHT · testostérone libre · SHBG",col:"#C2AEBA",em:"🌿"},
    secondaire:{label:"Métabolique",desc:"insuline en arrière-plan",col:"#CB9A79",em:"⚡"},
    trace:{label:"Inflammatoire trace",desc:"foie · élimination",col:"#D4A56A",em:"🔥"},
  },
  inflammatoire:{
    dominant:{label:"Inflammatoire",desc:"cortisol · NF-kB · microbiome",col:"#D4A56A",em:"🔥"},
    secondaire:{label:"Surrénalien",desc:"DHEAS · axe HPA",col:"#A89AB8",em:"🧠"},
    trace:{label:"Androgénique trace",desc:"androgènes réactionnels",col:"#C2AEBA",em:"🌿"},
  },
  mixte_ma:{
    dominant:{label:"Métabolique",desc:"insuline · glycémie",col:"#CB9A79",em:"⚡"},
    secondaire:{label:"Androgénique",desc:"testostérone libre · SHBG",col:"#C2AEBA",em:"🌿"},
    trace:{label:"Inflammatoire trace",desc:"stress oxydatif",col:"#D4A56A",em:"🔥"},
  },
  mixte_mi:{
    dominant:{label:"Métabolique",desc:"insuline",col:"#CB9A79",em:"⚡"},
    secondaire:{label:"Inflammatoire",desc:"cortisol · NF-kB",col:"#D4A56A",em:"🔥"},
    trace:{label:"Androgénique trace",desc:"réactionnel",col:"#C2AEBA",em:"🌿"},
  },
  mixte_ai:{
    dominant:{label:"Inflammatoire",desc:"feu de fond · surrénales",col:"#D4A56A",em:"🔥"},
    secondaire:{label:"Androgénique",desc:"DHEAS · androgènes surrénaliens",col:"#C2AEBA",em:"🌿"},
    trace:{label:"Métabolique trace",desc:"glycémie réactionnelle",col:"#CB9A79",em:"⚡"},
  },
};


// ─── PRIORITÉS PAR PROFIL (Centre de Priorités J0) ────────────────────────────
const PRIORITES_PROFIL = {
  metabolique:[
    {n:"01",em:"⚡",t:"Stabiliser ta glycémie",col:"#CB9A79",res:["Moins de fringales","Plus d'énergie entre les repas","Moins de stockage abdominal"],quand:"2 à 4 semaines",geste:"L'ordre des aliments — dès aujourd'hui"},
    {n:"02",em:"✨",t:"Corriger les carences silencieuses",col:"#D4A56A",res:["Énergie au réveil","Meilleur sommeil","Moins de fatigue profonde"],quand:"1 à 3 semaines",geste:"Magnésium bisglycinate ce soir"},
    {n:"03",em:"🌱",t:"Soutenir ton foie",col:"#B8C5A0",res:["Moins de gonflements","Peau qui s'améliore","Androgènes mieux éliminés"],quand:"3 à 6 semaines",geste:"Cure Détox demain matin à jeun"},
  ],
  androgenique:[
    {n:"01",em:"🌿",t:"Réduire les androgènes actifs",col:"#C2AEBA",res:["Moins d'acné hormonale","Pilosité qui ralentit","Chute de cheveux freinée"],quand:"4 à 8 semaines",geste:"Zinc ce soir avec le repas"},
    {n:"02",em:"⚡",t:"Stabiliser ton insuline",col:"#CB9A79",res:["Signal androgénique réduit","Moins de fringales","Énergie stable"],quand:"2 à 4 semaines",geste:"L'ordre des aliments — dès aujourd'hui"},
    {n:"03",em:"🌱",t:"Booster ton foie",col:"#B8C5A0",res:["Élimination des androgènes","Peau plus nette","Moins de gonflements"],quand:"3 à 6 semaines",geste:"Cure Détox demain matin à jeun"},
  ],
  inflammatoire:[
    {n:"01",em:"🔥",t:"Calmer l'inflammation de fond",col:"#D4A56A",res:["Moins de douleurs","Brouillard qui se lève","Énergie qui revient"],quand:"3 à 6 semaines",geste:"Oméga-3 dès aujourd'hui"},
    {n:"02",em:"🧠",t:"Réguler ton cortisol",col:"#A89AB8",res:["Meilleur sommeil","Moins de réveils nocturnes","Stress mieux géré"],quand:"2 à 4 semaines",geste:"Cohérence cardiaque ce soir"},
    {n:"03",em:"🌱",t:"Soutenir ton terrain",col:"#B8C5A0",res:["Microbiome équilibré","Digestion apaisée","Inflammation réduite"],quand:"4 à 8 semaines",geste:"Cure Détox demain matin à jeun"},
  ],
  mixte_ma:[
    {n:"01",em:"⚡",t:"Stabiliser ta glycémie",col:"#CB9A79",res:["Moins de fringales","Signal androgénique réduit","Énergie stable"],quand:"2 à 4 semaines",geste:"L'ordre des aliments — dès aujourd'hui"},
    {n:"02",em:"🌿",t:"Réduire les androgènes",col:"#C2AEBA",res:["Moins d'acné","Pilosité ralentie","Cheveux préservés"],quand:"4 à 8 semaines",geste:"Zinc ce soir avec le repas"},
    {n:"03",em:"🌱",t:"Soutenir ton foie",col:"#B8C5A0",res:["Androgènes éliminés","Peau qui s'améliore","Moins de gonflements"],quand:"3 à 6 semaines",geste:"Cure Détox demain matin à jeun"},
  ],
  mixte_mi:[
    {n:"01",em:"⚡",t:"Stabiliser ta glycémie",col:"#CB9A79",res:["Moins de fringales","Énergie stable","Inflammation réduite"],quand:"2 à 4 semaines",geste:"L'ordre des aliments — dès aujourd'hui"},
    {n:"02",em:"🔥",t:"Calmer l'inflammation",col:"#D4A56A",res:["Moins de douleurs","Brouillard levé","Récupération améliorée"],quand:"3 à 6 semaines",geste:"Oméga-3 dès aujourd'hui"},
    {n:"03",em:"🌱",t:"Soutenir ton terrain",col:"#B8C5A0",res:["Foie soutenu","Digestion apaisée","Élimination optimisée"],quand:"4 à 8 semaines",geste:"Cure Détox demain matin à jeun"},
  ],
  mixte_ai:[
    {n:"01",em:"🔥",t:"Calmer l'inflammation de fond",col:"#D4A56A",res:["Moins de douleurs","Brouillard levé","Androgènes apaisés"],quand:"3 à 6 semaines",geste:"Oméga-3 dès aujourd'hui"},
    {n:"02",em:"🌿",t:"Réduire les androgènes",col:"#C2AEBA",res:["Moins d'acné","Pilosité ralentie","Cheveux préservés"],quand:"4 à 8 semaines",geste:"Zinc ce soir avec le repas"},
    {n:"03",em:"🧠",t:"Réguler ton cortisol",col:"#A89AB8",res:["Meilleur sommeil","Stress géré","Surrénales apaisées"],quand:"2 à 4 semaines",geste:"Cohérence cardiaque ce soir"},
  ],
};

// ─── PHASES CYCLE ─────────────────────────────────────────────────────────────
const getPhase = (day) => {
  const phases = [
    {min:1,max:7,nom:"Phase menstruelle",desc:"énergie basse — missions douces privilégiées",tip:"repos actif",col:"#C2AEBA"},
    {min:8,max:13,nom:"Phase folliculaire",desc:"énergie qui monte — bon moment pour le renforcement",tip:"renforcement musculaire",col:"#CB9A79"},
    {min:14,max:16,nom:"Ovulation probable",desc:"énergie au maximum — profite-en",tip:"séance intense possible",col:"#D4A56A"},
    {min:17,max:28,nom:"Phase lutéale",desc:"énergie qui descend — magnésium et sommeil prioritaires",tip:"récupération active",col:"#B8C5A0"},
  ];
  const d = ((day-1) % 28)+1;
  return phases.find(p=>d>=p.min&&d<=p.max)||phases[0];
};


// ─── BASE ALIMENTS (index glycémique + protéines, source USDA) ────────────────
// ig: "bas"|"modere"|"eleve" — prot: g/100g — verdict SOPK
const ALIMENTS = [
  // Protéines animales
  {nom:"Blanc de poulet",cat:"Protéines",ig:"bas",prot:32,kcal:157,sopk:"excellent",note:"protéine maigre idéale — stabilise la glycémie sans pic"},
  {nom:"Blanc de dinde",cat:"Protéines",ig:"bas",prot:29,kcal:136,sopk:"excellent",note:"très riche en protéines, parfait au petit-déjeuner"},
  {nom:"Bœuf maigre",cat:"Protéines",ig:"bas",prot:26,kcal:250,sopk:"bon",note:"riche en fer et zinc — utile contre la chute de cheveux"},
  {nom:"Thon",cat:"Protéines",ig:"bas",prot:26,kcal:140,sopk:"excellent",note:"oméga-3 anti-inflammatoires — privilégie le thon en boîte au naturel"},
  {nom:"Saumon",cat:"Protéines",ig:"bas",prot:22,kcal:206,sopk:"excellent",note:"oméga-3 puissants — excellent pour le terrain inflammatoire"},
  {nom:"Cabillaud",cat:"Protéines",ig:"bas",prot:23,kcal:105,sopk:"excellent",note:"maigre, digeste, riche en protéines"},
  {nom:"Crevette",cat:"Protéines",ig:"bas",prot:24,kcal:99,sopk:"bon",note:"protéine très maigre, riche en zinc"},
  {nom:"Œufs",cat:"Protéines",ig:"bas",prot:12.6,kcal:143,sopk:"excellent",note:"le petit-déjeuner SOPK par excellence — 6g de protéines par œuf"},
  // Produits laitiers
  {nom:"Parmesan",cat:"Laitiers",ig:"bas",prot:29.6,kcal:392,sopk:"bon",note:"très protéiné, à consommer en petite quantité"},
  {nom:"Fromage blanc",cat:"Laitiers",ig:"bas",prot:8,kcal:72,sopk:"excellent",note:"parfait au petit-déjeuner avec des oléagineux"},
  {nom:"Skyr",cat:"Laitiers",ig:"bas",prot:11,kcal:63,sopk:"excellent",note:"ultra protéiné, peu de sucre — idéal SOPK"},
  {nom:"Feta",cat:"Laitiers",ig:"bas",prot:19.7,kcal:265,sopk:"bon",note:"protéinée, à intégrer dans une salade en entrée"},
  {nom:"Mozzarella",cat:"Laitiers",ig:"bas",prot:24,kcal:300,sopk:"bon",note:"bonne source de protéines"},
  // Légumineuses
  {nom:"Lentilles",cat:"Légumineuses",ig:"bas",prot:9,kcal:116,sopk:"excellent",note:"fibres + protéines végétales — index glycémique bas, parfait SOPK"},
  {nom:"Pois chiches",cat:"Légumineuses",ig:"bas",prot:8.9,kcal:164,sopk:"excellent",note:"fibres rassasiantes, lissent la glycémie"},
  {nom:"Haricots noirs",cat:"Légumineuses",ig:"bas",prot:8.9,kcal:132,sopk:"excellent",note:"riches en fibres et antioxydants"},
  {nom:"Haricots rouges",cat:"Légumineuses",ig:"bas",prot:8.7,kcal:127,sopk:"excellent",note:"excellente source de fibres et fer végétal"},
  {nom:"Pois cassés",cat:"Légumineuses",ig:"bas",prot:8.3,kcal:118,sopk:"excellent",note:"rassasiants, parfaits en soupe d'entrée"},
  {nom:"Soja / Edamame",cat:"Légumineuses",ig:"bas",prot:12.4,kcal:141,sopk:"bon",note:"protéine complète — avec modération si profil androgénique"},
  {nom:"Tofu",cat:"Légumineuses",ig:"bas",prot:17,kcal:144,sopk:"bon",note:"protéine végétale complète, index glycémique bas"},
  // Céréales
  {nom:"Quinoa",cat:"Céréales",ig:"modere",prot:4.4,kcal:120,sopk:"bon",note:"protéine complète — meilleur choix parmi les féculents, à manger en dernier"},
  {nom:"Riz sauvage",cat:"Céréales",ig:"modere",prot:4,kcal:101,sopk:"bon",note:"meilleur que le riz blanc, plus de fibres"},
  {nom:"Sarrasin",cat:"Céréales",ig:"modere",prot:3.4,kcal:92,sopk:"bon",note:"sans gluten, index glycémique modéré"},
  {nom:"Avoine",cat:"Céréales",ig:"modere",prot:2.5,kcal:71,sopk:"bon",note:"fibres bêta-glucanes — privilégie les flocons complets, pas les instantanés"},
  {nom:"Riz blanc",cat:"Céréales",ig:"eleve",prot:2.7,kcal:130,sopk:"limite",note:"index glycémique élevé — à manger en petite quantité et en dernier"},
  {nom:"Pâtes blanches",cat:"Céréales",ig:"eleve",prot:5,kcal:131,sopk:"limite",note:"pic glycémique — préfère les pâtes complètes, mange-les al dente et en dernier"},
  {nom:"Pain blanc",cat:"Céréales",ig:"eleve",prot:8,kcal:265,sopk:"eviter",note:"pic glycémique fort — remplace par du pain complet au levain"},
  {nom:"Pain complet",cat:"Céréales",ig:"modere",prot:9,kcal:247,sopk:"bon",note:"fibres qui lissent la glycémie — bien meilleur que le pain blanc"},
  // Légumes
  {nom:"Brocoli",cat:"Légumes",ig:"bas",prot:2.4,kcal:35,sopk:"excellent",note:"crucifère — soutient le foie dans l'élimination des androgènes"},
  {nom:"Chou-fleur",cat:"Légumes",ig:"bas",prot:1.8,kcal:23,sopk:"excellent",note:"crucifère, très peu calorique, soutient la détox hépatique"},
  {nom:"Épinard",cat:"Légumes",ig:"bas",prot:3,kcal:23,sopk:"excellent",note:"riche en fer et magnésium"},
  {nom:"Chou de Bruxelles",cat:"Légumes",ig:"bas",prot:2.6,kcal:36,sopk:"excellent",note:"crucifère puissant pour l'élimination des androgènes"},
  {nom:"Roquette",cat:"Légumes",ig:"bas",prot:2.6,kcal:25,sopk:"excellent",note:"crucifère à manger cru en entrée"},
  {nom:"Artichaut",cat:"Légumes",ig:"bas",prot:2.9,kcal:53,sopk:"excellent",note:"soutient le foie, riche en fibres"},
  {nom:"Courgette",cat:"Légumes",ig:"bas",prot:1.1,kcal:15,sopk:"excellent",note:"légère, parfaite à commencer le repas"},
  {nom:"Carotte (crue)",cat:"Légumes",ig:"bas",prot:0.9,kcal:41,sopk:"bon",note:"crue, index bas — cuite l'index monte un peu"},
  // Oléagineux
  {nom:"Amandes",cat:"Oléagineux",ig:"bas",prot:6.3,kcal:179,sopk:"excellent",note:"gras + protéines — parfaites en cas de fringale"},
  {nom:"Noix",cat:"Oléagineux",ig:"bas",prot:4.6,kcal:196,sopk:"excellent",note:"oméga-3 anti-inflammatoires"},
  {nom:"Graines de chia",cat:"Oléagineux",ig:"bas",prot:5,kcal:146,sopk:"excellent",note:"fibres + oméga-3 — à ajouter au fromage blanc"},
  {nom:"Graines de courge",cat:"Oléagineux",ig:"bas",prot:9.1,kcal:168,sopk:"excellent",note:"riches en zinc — utiles contre l'acné et la chute de cheveux"},
  {nom:"Graines de lin",cat:"Oléagineux",ig:"bas",prot:5.5,kcal:160,sopk:"excellent",note:"oméga-3 et lignanes — à moudre pour mieux les absorber"},
  // Fruits
  {nom:"Myrtilles",cat:"Fruits",ig:"bas",prot:0.7,kcal:57,sopk:"excellent",note:"antioxydants, index glycémique bas parmi les fruits"},
  {nom:"Framboises",cat:"Fruits",ig:"bas",prot:1.5,kcal:52,sopk:"excellent",note:"riches en fibres, peu de sucre"},
  {nom:"Pomme",cat:"Fruits",ig:"bas",prot:0.3,kcal:52,sopk:"bon",note:"fibres + le fruit entier (pas en jus)"},
  {nom:"Avocat",cat:"Fruits",ig:"bas",prot:2,kcal:160,sopk:"excellent",note:"bons gras — rassasiant, lisse la glycémie"},
  {nom:"Banane",cat:"Fruits",ig:"modere",prot:1.1,kcal:89,sopk:"bon",note:"plus l'index monte quand elle est mûre — préfère-la un peu verte"},
  {nom:"Raisin",cat:"Fruits",ig:"eleve",prot:0.6,kcal:69,sopk:"limite",note:"riche en sucre — petite quantité, jamais à jeun"},
  {nom:"Datte",cat:"Fruits",ig:"eleve",prot:1.8,kcal:282,sopk:"limite",note:"très sucrée — 1 à 2 max, accompagnée d'oléagineux"},
  {nom:"Poire",cat:"Fruits",ig:"bas",prot:0.4,kcal:57,sopk:"bon",note:"IG 38 — fibres rassasiantes, à manger entière avec la peau"},
  {nom:"Pêche",cat:"Fruits",ig:"bas",prot:0.9,kcal:39,sopk:"bon",note:"IG bas, peu calorique"},
  {nom:"Abricot",cat:"Fruits",ig:"bas",prot:1.4,kcal:48,sopk:"bon",note:"IG 34 frais — attention aux abricots secs, bien plus concentrés"},
  {nom:"Cerise",cat:"Fruits",ig:"bas",prot:1,kcal:50,sopk:"excellent",note:"IG 22 — l'un des fruits à IG le plus bas"},
  {nom:"Fraise",cat:"Fruits",ig:"bas",prot:0.7,kcal:32,sopk:"excellent",note:"très peu de sucre, riche en vitamine C"},
  {nom:"Mûre",cat:"Fruits",ig:"bas",prot:1.4,kcal:43,sopk:"excellent",note:"fruit rouge à IG très bas, riche en fibres"},
  {nom:"Cassis",cat:"Fruits",ig:"bas",prot:1.4,kcal:63,sopk:"excellent",note:"IG 15 — antioxydants puissants"},
  {nom:"Groseille",cat:"Fruits",ig:"bas",prot:1.4,kcal:43,sopk:"excellent",note:"IG 25, très peu de sucre"},
  {nom:"Pamplemousse",cat:"Fruits",ig:"bas",prot:0.8,kcal:42,sopk:"excellent",note:"IG 25 — améliore la sensibilité à l'insuline (attention si tu prends des statines)"},
  {nom:"Orange",cat:"Fruits",ig:"bas",prot:0.9,kcal:47,sopk:"bon",note:"IG 40 — le fruit entier, jamais en jus"},
  {nom:"Kiwi",cat:"Fruits",ig:"modere",prot:1.1,kcal:61,sopk:"bon",note:"IG 50, riche en vitamine C et fibres"},
  {nom:"Clémentine",cat:"Fruits",ig:"bas",prot:0.9,kcal:47,sopk:"bon",note:"agrume à IG bas, pratique en collation"},
  {nom:"Prune",cat:"Fruits",ig:"bas",prot:0.7,kcal:46,sopk:"bon",note:"IG bas, à consommer fraîche"},
  {nom:"Grenade",cat:"Fruits",ig:"bas",prot:1.7,kcal:83,sopk:"bon",note:"IG 35, antioxydants"},
  {nom:"Melon",cat:"Fruits",ig:"eleve",prot:0.8,kcal:34,sopk:"bon",note:"IG 65 mais peu de glucides — petite portion ok grâce à sa faible charge glycémique"},
  {nom:"Pastèque",cat:"Fruits",ig:"eleve",prot:0.6,kcal:30,sopk:"bon",note:"IG 72 mais charge glycémique faible — une tranche, jamais à jeun"},
  {nom:"Ananas",cat:"Fruits",ig:"eleve",prot:0.5,kcal:50,sopk:"limite",note:"IG 66 — petite portion, accompagné de protéines"},
  {nom:"Mangue",cat:"Fruits",ig:"modere",prot:0.8,kcal:60,sopk:"limite",note:"IG 56 — riche en sucre, petite portion"},
  {nom:"Figue fraîche",cat:"Fruits",ig:"modere",prot:0.8,kcal:74,sopk:"limite",note:"sucrée — figue sèche encore plus concentrée"},
  {nom:"Raisins secs",cat:"Fruits",ig:"eleve",prot:3,kcal:299,sopk:"eviter",note:"IG 65, très concentré en sucre"},
  // Légumes supplémentaires
  {nom:"Tomate",cat:"Légumes",ig:"bas",prot:0.9,kcal:18,sopk:"excellent",note:"IG bas, riche en lycopène"},
  {nom:"Concombre",cat:"Légumes",ig:"bas",prot:0.7,kcal:15,sopk:"excellent",note:"très léger, parfait en entrée"},
  {nom:"Poivron",cat:"Légumes",ig:"bas",prot:1,kcal:31,sopk:"excellent",note:"riche en vitamine C, IG bas"},
  {nom:"Aubergine",cat:"Légumes",ig:"bas",prot:1,kcal:25,sopk:"excellent",note:"fibres, peu calorique"},
  {nom:"Haricots verts",cat:"Légumes",ig:"bas",prot:1.8,kcal:31,sopk:"excellent",note:"fibres, parfaits à commencer le repas"},
  {nom:"Champignons",cat:"Légumes",ig:"bas",prot:3.4,kcal:22,sopk:"excellent",note:"protéines végétales, IG quasi nul"},
  {nom:"Salade verte",cat:"Légumes",ig:"bas",prot:1.4,kcal:15,sopk:"excellent",note:"à commencer absolument le repas"},
  {nom:"Poireau",cat:"Légumes",ig:"bas",prot:1.5,kcal:31,sopk:"excellent",note:"prébiotique, soutient le microbiote"},
  {nom:"Asperge",cat:"Légumes",ig:"bas",prot:2.4,kcal:22,sopk:"excellent",note:"diurétique, riche en folates"},
  {nom:"Betterave",cat:"Légumes",ig:"modere",prot:1.6,kcal:43,sopk:"bon",note:"IG modéré cuite — crue c'est mieux"},
  {nom:"Patate douce",cat:"Légumes",ig:"modere",prot:1.6,kcal:86,sopk:"bon",note:"IG 50, bien meilleure que la pomme de terre — à manger en dernier"},
  {nom:"Pomme de terre",cat:"Légumes",ig:"eleve",prot:2,kcal:77,sopk:"limite",note:"IG 70+ surtout en purée — préfère-la froide en salade (l'amidon résistant baisse l'IG)"},
  {nom:"Potiron",cat:"Légumes",ig:"eleve",prot:1,kcal:26,sopk:"bon",note:"IG 75 mais charge glycémique faible — petite portion ok"},
  {nom:"Maïs",cat:"Légumes",ig:"modere",prot:3.3,kcal:96,sopk:"limite",note:"IG 55 — c'est un féculent déguisé en légume, à manger en dernier"},
  // Céréales supplémentaires
  {nom:"Boulgour",cat:"Céréales",ig:"modere",prot:3.1,kcal:83,sopk:"bon",note:"IG 48, fibres — meilleur que le couscous blanc"},
  {nom:"Semoule / Couscous",cat:"Céréales",ig:"eleve",prot:3.8,kcal:112,sopk:"limite",note:"IG élevé — préfère la version complète, en petite quantité"},
  {nom:"Orge",cat:"Céréales",ig:"bas",prot:2.3,kcal:123,sopk:"bon",note:"IG 25 — l'une des céréales à IG le plus bas"},
  {nom:"Millet",cat:"Céréales",ig:"modere",prot:3.5,kcal:119,sopk:"bon",note:"sans gluten, index modéré"},
  {nom:"Galette de riz soufflé",cat:"Céréales",ig:"eleve",prot:7.5,kcal:387,sopk:"eviter",note:"IG 85 — pic glycémique fort malgré l'image healthy"},
  {nom:"Muesli sans sucre",cat:"Céréales",ig:"modere",prot:10,kcal:360,sopk:"bon",note:"choisis-le sans sucre ajouté, avec oléagineux"},
  // Protéines supplémentaires
  {nom:"Sardine",cat:"Protéines",ig:"bas",prot:25,kcal:208,sopk:"excellent",note:"oméga-3, calcium — excellente en boîte"},
  {nom:"Maquereau",cat:"Protéines",ig:"bas",prot:19,kcal:205,sopk:"excellent",note:"riche en oméga-3 anti-inflammatoires"},
  {nom:"Jambon blanc",cat:"Protéines",ig:"bas",prot:18,kcal:107,sopk:"bon",note:"protéine pratique — choisis-le sans nitrites"},
  {nom:"Steak haché 5%",cat:"Protéines",ig:"bas",prot:21,kcal:130,sopk:"bon",note:"maigre, riche en fer"},
  // Laitiers supplémentaires
  {nom:"Yaourt grec nature",cat:"Laitiers",ig:"bas",prot:9,kcal:97,sopk:"excellent",note:"protéiné — nature uniquement, jamais les aromatisés sucrés"},
  {nom:"Comté / Emmental",cat:"Laitiers",ig:"bas",prot:28,kcal:380,sopk:"bon",note:"protéiné et riche en calcium, petite quantité"},
  // Oléagineux supplémentaires
  {nom:"Noisettes",cat:"Oléagineux",ig:"bas",prot:15,kcal:628,sopk:"excellent",note:"bons gras, à doser car caloriques"},
  {nom:"Noix de cajou",cat:"Oléagineux",ig:"bas",prot:18,kcal:553,sopk:"bon",note:"protéines végétales, IG bas"},
  {nom:"Pistaches",cat:"Oléagineux",ig:"bas",prot:20,kcal:560,sopk:"bon",note:"protéinées, en collation nature non salée"},
  {nom:"Beurre de cacahuète",cat:"Oléagineux",ig:"bas",prot:25,kcal:588,sopk:"bon",note:"sans sucre ajouté uniquement — vérifie l'étiquette"},
  // Autres
  {nom:"Chocolat noir 85%",cat:"Autres",ig:"bas",prot:10,kcal:600,sopk:"bon",note:"IG bas — 2 carrés en cas de fringale, stabilise sans pic"},
  {nom:"Miel",cat:"Autres",ig:"eleve",prot:0.3,kcal:304,sopk:"limite",note:"reste du sucre — petite quantité, pas une alternative libre"},
  {nom:"Houmous",cat:"Autres",ig:"bas",prot:8,kcal:166,sopk:"excellent",note:"pois chiches + tahini — collation parfaite avec des crudités"},
];


// ─── BANQUE DE REPAS (exemples concrets, SMOP-friendly) ───────────────────────
// moment: matin|midi|soir|collation — tags: tableau d'étiquettes
// profils: tableau des profils pour qui c'est un atout spécifique (sourcé)
const REPAS = [
  // ── PETITS-DÉJEUNERS ──
  {moment:"matin",nom:"Œufs brouillés à l'avocat",
   compo:"2 œufs brouillés + ½ avocat + tomates cerises + thé vert ou café sans sucre",
   pourquoi:"protéines + bons gras = aucun pic de glycémie. tu tiens jusqu'au déjeuner sans fringale.",
   prot:"~20g",tags:["rapide","anti-fringale"],profils:[]},
  {moment:"matin",nom:"Skyr, oléagineux & cannelle",
   compo:"150g de skyr nature + 1 poignée d'amandes + ½ c. à café de cannelle de Ceylan + quelques myrtilles",
   pourquoi:"le skyr est très protéiné, les amandes apportent de bons gras, la cannelle de Ceylan soutient la glycémie.",
   prot:"~17g",tags:["rapide","sans cuisson"],profils:["metabolique"]},
  {moment:"matin",nom:"Porridge chia-myrtilles",
   compo:"3 c. à soupe de graines de chia + lait végétal non sucré + myrtilles, laissé une nuit au frigo",
   pourquoi:"les graines de chia apportent des oméga-3 qui soutiennent le terrain anti-inflammatoire. à préparer la veille.",
   prot:"~10g",tags:["végé","à préparer la veille"],profils:["inflammatoire"]},
  {moment:"matin",nom:"Omelette épinards-feta",
   compo:"2-3 œufs + une poignée d'épinards + un peu de feta émiettée + filet d'huile d'olive",
   pourquoi:"protéines complètes + légumes verts dès le matin. les épinards apportent fer et magnésium.",
   prot:"~22g",tags:["rapide","rassasiant"],profils:[]},
  {moment:"matin",nom:"Tartine salée au saumon",
   compo:"1 tranche de pain complet au levain + avocat écrasé + saumon fumé + citron",
   pourquoi:"le pain au levain a un index plus bas que le pain blanc, le saumon apporte des oméga-3 anti-inflammatoires.",
   prot:"~18g",tags:["rapide"],profils:["inflammatoire"]},

  // ── DÉJEUNERS ──
  {moment:"midi",nom:"Assiette dans le bon ordre",
   compo:"crudités en entrée + blanc de poulet + brocoli + une portion de quinoa, mangés dans cet ordre",
   pourquoi:"l'assiette modèle : légumes d'abord, protéines, féculent en dernier. le brocoli soutient l'élimination des androgènes par le foie.",
   prot:"~35g",tags:["équilibré","batch-cookable"],profils:["metabolique","androgenique"]},
  {moment:"midi",nom:"Bowl saumon-quinoa",
   compo:"saumon + quinoa + avocat + roquette + graines de courge + huile d'olive citron",
   pourquoi:"saumon et graines de courge apportent oméga-3 et zinc. la roquette est un crucifère qui soutient le foie.",
   prot:"~30g",tags:["rassasiant","anti-fringale"],profils:["inflammatoire","androgenique"]},
  {moment:"midi",nom:"Salade de lentilles complète",
   compo:"lentilles + œuf dur + dés de feta + tomates + concombre + persil + vinaigrette huile d'olive",
   pourquoi:"les lentilles (IG bas) + l'œuf donnent des protéines végé et animales avec beaucoup de fibres rassasiantes.",
   prot:"~22g",tags:["végé option","batch-cookable","petit budget"],profils:["metabolique"]},
  {moment:"midi",nom:"Poulet rôti & légumes verts",
   compo:"cuisse ou blanc de poulet + haricots verts + chou-fleur rôti + un filet d'huile d'olive",
   pourquoi:"protéine + double dose de légumes verts dont un crucifère. simple, rassasiant, sans pic glycémique.",
   prot:"~32g",tags:["équilibré","petit budget"],profils:["androgenique"]},
  {moment:"midi",nom:"Wrap de sarrasin au thon",
   compo:"galette de sarrasin + thon + crudités râpées + fromage blanc citronné en sauce",
   pourquoi:"le sarrasin a un index modéré et est sans gluten. le thon apporte protéines et oméga-3.",
   prot:"~28g",tags:["rapide","nomade"],profils:["inflammatoire"]},

  // ── DÎNERS ──
  {moment:"soir",nom:"Saumon & brocoli vapeur",
   compo:"pavé de saumon + brocoli vapeur + un peu de patate douce + huile d'olive citron",
   pourquoi:"saumon (oméga-3 anti-inflammatoires) + brocoli (crucifère). dîner léger qui n'alourdit pas la glycémie du soir.",
   prot:"~30g",tags:["rapide","léger le soir"],profils:["inflammatoire","androgenique"]},
  {moment:"soir",nom:"Omelette aux champignons & salade",
   compo:"2-3 œufs + champignons poêlés + grande salade verte + vinaigrette huile d'olive",
   pourquoi:"protéine légère et digeste pour le soir. les champignons sont rassasiants pour très peu de glucides.",
   prot:"~20g",tags:["rapide","léger le soir","petit budget"],profils:[]},
  {moment:"soir",nom:"Curry de pois chiches",
   compo:"pois chiches + lait de coco + épinards + curcuma + gingembre, servi avec un peu de riz complet",
   pourquoi:"les pois chiches (IG bas, fibres) + curcuma et gingembre, des épices au profil anti-inflammatoire.",
   prot:"~16g",tags:["végé","batch-cookable"],profils:["inflammatoire"]},
  {moment:"soir",nom:"Cabillaud & légumes rôtis",
   compo:"dos de cabillaud + courgettes et poivrons rôtis + filet d'huile d'olive + herbes",
   pourquoi:"poisson blanc maigre, très protéiné et léger. les légumes rôtis remplissent l'assiette sans pic glycémique.",
   prot:"~28g",tags:["léger le soir","équilibré"],profils:["metabolique"]},
  {moment:"soir",nom:"Soupe de légumes & œuf poché",
   compo:"soupe de légumes maison (non sucrée) + 1-2 œufs pochés + un filet d'huile d'olive",
   pourquoi:"réconfortant et léger. on ajoute l'œuf pour les protéines, sinon une soupe seule ne rassasie pas assez.",
   prot:"~14g",tags:["rapide","léger le soir","petit budget"],profils:[]},

  // ── COLLATIONS ──
  {moment:"collation",nom:"Pomme & amandes",
   compo:"1 pomme + une poignée d'amandes",
   pourquoi:"le grand classique anti-fringale : les fibres de la pomme + les gras des amandes lissent la glycémie.",
   prot:"~6g",tags:["rapide","nomade","anti-fringale"],profils:["metabolique"]},
  {moment:"collation",nom:"Houmous & crudités",
   compo:"3 c. à soupe de houmous + bâtonnets de concombre, carotte, poivron",
   pourquoi:"les pois chiches du houmous apportent protéines et fibres. parfait pour tenir l'après-midi.",
   prot:"~7g",tags:["végé","anti-fringale"],profils:[]},
  {moment:"collation",nom:"Carré de chocolat 85% & noix",
   compo:"2 carrés de chocolat noir 85% + quelques noix",
   pourquoi:"pour l'envie de sucré sans le pic : le 85% a un index bas, les noix apportent des oméga-3.",
   prot:"~4g",tags:["rapide","plaisir"],profils:["inflammatoire"]},

  // ── PETITS-DÉJEUNERS (suite) ──
  {moment:"matin",nom:"Pancakes flocons-banane",
   compo:"flocons d'avoine mixés + 1 œuf + ½ banane écrasée + cannelle, cuits à la poêle",
   pourquoi:"une alternative gourmande au petit-déj sucré : l'avoine et l'œuf ralentissent l'absorption du sucre de la banane.",
   prot:"~12g",tags:["plaisir","week-end"],profils:["metabolique"]},
  {moment:"matin",nom:"Yaourt grec, noix & graines",
   compo:"yaourt grec nature + noix + graines de courge + graines de lin moulues + quelques framboises",
   pourquoi:"protéines + zinc (graines de courge) + oméga-3 (lin) + antioxydants. un petit-déj complet sans cuisson.",
   prot:"~16g",tags:["rapide","sans cuisson"],profils:["androgenique","inflammatoire"]},
  {moment:"matin",nom:"Avocat-œuf au four",
   compo:"½ avocat évidé + 1 œuf cassé dedans + cuit au four 12 min + sel poivre",
   pourquoi:"100% rassasiant, zéro glucide rapide. les bons gras de l'avocat + la protéine de l'œuf tiennent toute la matinée.",
   prot:"~10g",tags:["original","anti-fringale"],profils:["metabolique"]},

  // ── DÉJEUNERS (suite) ──
  {moment:"midi",nom:"Buddha bowl complet",
   compo:"quinoa + pois chiches rôtis + avocat + carottes râpées + épinards + sauce tahini citron",
   pourquoi:"un bol végé complet : protéines végétales, fibres, bons gras. rassasiant longtemps grâce aux pois chiches (IG bas).",
   prot:"~18g",tags:["végé","batch-cookable"],profils:["metabolique"]},
  {moment:"midi",nom:"Sardines & salade de pommes de terre",
   compo:"sardines en boîte + pommes de terre froides + haricots verts + œuf dur + vinaigrette moutarde",
   pourquoi:"les sardines sont riches en oméga-3. les pommes de terre FROIDES forment de l'amidon résistant, qui lisse la glycémie.",
   prot:"~26g",tags:["petit budget","anti-fringale"],profils:["inflammatoire"]},
  {moment:"midi",nom:"Tofu sauté & légumes croquants",
   compo:"tofu ferme doré + brocoli + poivrons + sauce soja + graines de sésame + un peu de riz complet",
   pourquoi:"protéine végétale complète + crucifère. le tofu et le brocoli en font un repas intéressant pour le versant hormonal.",
   prot:"~20g",tags:["végé","rapide"],profils:["androgenique"]},
  {moment:"midi",nom:"Steak haché & ratatouille",
   compo:"steak haché 5% + ratatouille maison (courgette, aubergine, poivron, tomate) + filet d'huile d'olive",
   pourquoi:"protéine riche en fer + une montagne de légumes. rassasiant, sans féculent à index élevé.",
   prot:"~25g",tags:["équilibré","batch-cookable"],profils:[]},

  // ── DÎNERS (suite) ──
  {moment:"soir",nom:"Papillote de poisson blanc",
   compo:"filet de cabillaud ou colin + courgettes + tomates + citron + herbes, en papillote au four",
   pourquoi:"léger, digeste, zéro matière grasse ajoutée nécessaire. parfait pour un dîner qui ne pèse pas sur la nuit.",
   prot:"~26g",tags:["léger le soir","facile"],profils:["metabolique"]},
  {moment:"soir",nom:"Velouté de courge & œuf mollet",
   compo:"velouté de courge maison + 1-2 œufs mollets + graines de courge torréfiées",
   pourquoi:"réconfortant et automnal. on ajoute œufs et graines pour les protéines et le zinc, sinon la courge seule fait monter la glycémie.",
   prot:"~14g",tags:["réconfortant","léger le soir"],profils:["androgenique"]},
  {moment:"soir",nom:"Dahl de lentilles corail",
   compo:"lentilles corail + lait de coco + curcuma + gingembre + épinards, avec un peu de riz basmati",
   pourquoi:"les lentilles (IG bas, protéines, fibres) + curcuma et gingembre anti-inflammatoires. plat végé rassasiant.",
   prot:"~17g",tags:["végé","batch-cookable","petit budget"],profils:["inflammatoire","metabolique"]},
  {moment:"soir",nom:"Tartare de saumon & avocat",
   compo:"saumon cru coupé en dés + avocat + citron vert + ciboulette + graines de sésame",
   pourquoi:"saumon cru = oméga-3 préservés. un dîner frais, protéiné, sans aucun glucide rapide.",
   prot:"~24g",tags:["original","léger le soir"],profils:["inflammatoire"]},

  // ── COLLATIONS (suite) ──
  {moment:"collation",nom:"Skyr & cannelle",
   compo:"1 pot de skyr nature + cannelle de Ceylan + 1 c. à café de purée d'amande",
   pourquoi:"ultra protéiné pour couper une fringale, la cannelle de Ceylan soutient la glycémie.",
   prot:"~12g",tags:["rapide","anti-fringale"],profils:["metabolique"]},
  {moment:"collation",nom:"Œuf dur & crudités",
   compo:"1-2 œufs durs + bâtonnets de concombre ou tomates cerises",
   pourquoi:"la collation salée parfaite : protéine pure, zéro sucre, transportable partout.",
   prot:"~12g",tags:["nomade","petit budget","anti-fringale"],profils:[]},
  {moment:"collation",nom:"Poignée d'oléagineux & thé",
   compo:"amandes + noix + noisettes (une poignée) + thé vert ou infusion",
   pourquoi:"bons gras rassasiants qui calment la fringale sans toucher à la glycémie. le thé vert accompagne bien.",
   prot:"~5g",tags:["rapide","nomade"],profils:[]},
];

// ─── SUCRES CACHÉS ────────────────────────────────────────────────────────────
const SUCRES_CACHES = [
  "sirop de glucose-fructose","sirop de maïs","dextrose","maltose","saccharose",
  "sirop de riz","maltodextrine","sucre inverti","sirop d'agave","jus de canne évaporé",
  "concentré de jus de fruits","sirop de malt","fructose","glucose","caramel",
  "mélasse","sucre de coco","sirop d'érable","miel","sirop de blé",
];

// ─── COMPLÉMENTS SOPK ─────────────────────────────────────────────────────────
const COMPLEMENTS = [
  {nom:"Inositol (myo + D-chiro 40:1)",pour:["metabolique","mixte_ma","mixte_mi"],dose:"2g myo + 50mg D-chiro, 2x/jour",timing:"matin et soir",effet:"améliore la sensibilité à l'insuline et réduit les androgènes ovariens",delai:"8 à 12 semaines",note:"l'un des compléments les mieux étudiés dans le SMOP"},
  {nom:"Magnésium bisglycinate",pour:["metabolique","inflammatoire","androgenique","mixte_ma","mixte_mi","mixte_ai"],dose:"200 à 400mg",timing:"le soir au coucher",effet:"améliore la sensibilité à l'insuline, réduit le cortisol, améliore le sommeil",delai:"2 à 4 semaines",note:"carencé chez la majorité des femmes SMOP"},
  {nom:"Zinc",pour:["androgenique","inflammatoire","mixte_ma","mixte_ai"],dose:"15 à 25mg",timing:"avec un repas, jamais à jeun",effet:"inhibe la 5-alpha-réductase (DHT), régule le sébum, anti-inflammatoire",delai:"6 à 12 semaines",note:"utile contre l'acné et la chute de cheveux"},
  {nom:"Vitamine D3 + K2",pour:["metabolique","inflammatoire","androgenique","mixte_ma","mixte_mi","mixte_ai"],dose:"2000 à 4000 UI",timing:"avec un repas gras",effet:"améliore la sensibilité à l'insuline, soutient l'équilibre hormonal",delai:"4 à 8 semaines",note:"toujours D3 + K2 ensemble, jamais D seule"},
  {nom:"Oméga-3 (EPA/DHA)",pour:["inflammatoire","mixte_mi","mixte_ai"],dose:"1 à 2g d'EPA+DHA",timing:"avec un repas",effet:"réduit l'inflammation de fond, soutient l'humeur",delai:"4 à 8 semaines",note:"privilégie une source purifiée en métaux lourds"},
  {nom:"Oméga-3",pour:["metabolique","androgenique","mixte_ma"],dose:"1g d'EPA+DHA",timing:"avec un repas",effet:"soutien anti-inflammatoire général",delai:"4 à 8 semaines",note:"utile pour tous les profils en soutien"},
];

// ─── LOCALSTORAGE ─────────────────────────────────────────────────────────────
const save = (key, val) => { try { localStorage.setItem("sopklife_"+key, JSON.stringify(val)); } catch(e) {} };
const load = (key, def) => { try { const v = localStorage.getItem("sopklife_"+key); return v ? JSON.parse(v) : def; } catch(e) { return def; } };

// ─── 15 FICHES SOS ───────────────────────────────────────────────────────────
const SOS_DATA = [
  {
    id:"fringale", emoji:"⚡", titre:"Fringale sucrée", couleur:"#D97706",
    validation:"c'est pas ta volonté.\nc'est ton insuline qui vient de chuter.\nton cerveau envoie une alarme biologique. c'est de la physiologie — pas un défaut de caractère.",
    actions5min:[
      {em:"💧", t:"Bois 300ml d'eau", why:"coupe le faux signal de faim"},
      {em:"🍫", t:"2 carrés chocolat 85%", why:"graisses = stabilise sans nouveau pic"},
      {em:"🚶‍♀️", t:"Marche 5 minutes", why:"tes muscles absorbent le glucose directement"},
    ],
    action1h:"mange un vrai repas — protéines + graisses + légumes. dans le bon ordre.",
    mecanisme:"ton insuline a fait une montagne russe. elle a chuté. ton cerveau interprète ça comme une urgence et envoie l'alarme 'sucre maintenant'. c'est automatique. ce n'est pas toi.",
    kamila:"chaque fringale que tu comprends est une fringale que tu subis moins la prochaine fois. 🌿"
  },
  {
    id:"fatigue", emoji:"😴", titre:"Fatigue profonde", couleur:"#7A5C45",
    validation:"t'es pas paresseuse.\nt'es pas faible.\nton corps porte une charge invisible que personne ne voit.",
    actions5min:[
      {em:"☀️", t:"Lumière naturelle 5 minutes", why:"réinitialise le cortisol matinal"},
      {em:"💧", t:"Grand verre d'eau froide", why:"déshydratation = fatigue aggravée"},
      {em:"🧘", t:"Cohérence cardiaque 3 min", why:"5 sec inspiration · 5 sec expiration"},
    ],
    action1h:"une protéine. maintenant. œuf, fromage blanc, amandes. pas de sucre.",
    mecanisme:"avec le SOPK, la fatigue peut venir de 6 endroits différents — l'insuline, l'inflammation, le cortisol, la thyroïde, les carences ou le rythme circadien. ce n'est pas une seule cause. c'est pour ça qu'elle résiste aux solutions simples.",
    kamila:"ton corps ne fait pas exprès. il essaie de te parler. aujourd'hui tu l'écoutes. 🌿"
  },
  {
    id:"brouillard", emoji:"🌫️", titre:"Brouillard mental", couleur:"#5B7FA6",
    validation:"ton cerveau ne fonctionne pas moins bien.\nil fonctionne dans un terrain difficile.\nc'est pas pareil.",
    actions5min:[
      {em:"🌬️", t:"Respiration 4-7-8", why:"inspire 4 sec · retiens 7 · expire 8 · 3 fois"},
      {em:"💧", t:"Eau froide sur les poignets", why:"activation du nerf vague — clarté immédiate"},
      {em:"🥜", t:"Poignée d'amandes ou noix", why:"glucose stable = cerveau qui repart"},
    ],
    action1h:"une seule tâche. pas trois. une. jusqu'au bout. puis la suivante.",
    mecanisme:"les cytokines inflammatoires traversent la barrière hémato-encéphalique et perturbent la neurotransmission. concrètement — ton cerveau reçoit des signaux parasites. ce n'est pas de la paresse. c'est de la neurobiologie.",
    kamila:"un seul truc à la fois Cyster. le reste peut attendre. 🌿"
  },
  {
    id:"acne", emoji:"🌡️", titre:"Poussée d'acné", couleur:"#C2AEBA",
    validation:"ce bouton n'est pas apparu par hasard.\nce n'est pas un manque d'hygiène.\nce n'est pas parce que tu as mal mangé hier.\nc'est hormonal. et ça a une cause précise.",
    actions5min:[
      {em:"🧊", t:"Glaçon 2 minutes sur la zone", why:"réduit l'inflammation locale immédiatement"},
      {em:"🚫", t:"Zéro toucher", why:"les bactéries de tes mains aggravent l'inflammation"},
      {em:"💊", t:"Zinc ce soir avec le repas", why:"inhibe la 5-alpha-réductase — réduit la DHT"},
    ],
    action1h:"pas de produit agressif ce soir. juste nettoyage doux. laisse la peau respirer.",
    mecanisme:"les androgènes en excès activent tes glandes sébacées. trop de sébum = pores obstrués = inflammation = bouton. c'est pour ça que les crèmes seules ne règlent jamais rien durablement — elles traitent la conséquence, pas la cause.",
    kamila:"ce bouton va partir. et le protocole s'attaque à ce qui le produit. 🌿"
  },
  {
    id:"cheveux", emoji:"💇‍♀️", titre:"Chute de cheveux", couleur:"#CB9A79",
    validation:"la brosse pleine — je sais à quel point c'est difficile à voir.\nce n'est pas dans ta tête.\net ce n'est pas irréversible.",
    actions5min:[
      {em:"🌿", t:"Huile de romarin sur le cuir chevelu", why:"microcirculation des follicules — cliniquement prouvé"},
      {em:"💊", t:"Zinc + biotine ce soir", why:"cofacteurs directs de la croissance capillaire"},
      {em:"🚫", t:"Zéro chignon serré aujourd'hui", why:"traction = follicules supplémentaires perdus"},
    ],
    action1h:"vérifier ta ferritine dans tes analyses. une ferritine < 70 est souvent la cause principale — même si ton médecin dit 'normale'.",
    mecanisme:"la DHT — dérivé de la testostérone — raccourcit la durée de vie de tes follicules capillaires. les cheveux poussent moins vite et tombent plus tôt. le protocole s'attaque à la DHT via plusieurs voies. la stabilisation arrive en 2-3 mois. la repousse en 4-6 mois.",
    kamila:"ce que tu perds maintenant reviendra. le protocole travaille sur la cause. 🌿"
  },
  {
    id:"regles", emoji:"🌙", titre:"Règles absentes", couleur:"#A89AB8",
    validation:"l'absence de règles avec un SOPK — c'est pas un oubli de ton corps.\nc'est ton corps qui dit que quelque chose n'est pas encore en place.\nc'est un signal. pas une défaillance.",
    actions5min:[
      {em:"📝", t:"Note la date du dernier cycle", why:"avoir des données précises pour le médecin"},
      {em:"🧘", t:"Cohérence cardiaque maintenant", why:"le cortisol élevé bloque l'ovulation directement"},
      {em:"📱", t:"Ouvre tes scripts médecin dans l'app", why:"prépare la demande de bilan hormonal"},
    ],
    action1h:"si > 90 jours sans règles — prends rendez-vous. les analyses à demander : LH, FSH, progestérone, prolactine, TSH.",
    mecanisme:"l'excès d'androgènes ou d'insuline perturbe la maturation des follicules. ils commencent à se développer mais n'arrivent pas à terme. pas d'ovulation = pas de règles. c'est mécanique. et ça se régule.",
    kamila:"chaque action du protocole travaille à ramener ce cycle. c'est lent. mais c'est réel. 🌿"
  },
  {
    id:"douleurs", emoji:"🌡️", titre:"Douleurs de règles", couleur:"#D4A56A",
    validation:"ces douleurs ne sont pas normales à ce niveau.\non t'a peut-être dit 'c'est normal d'avoir mal'.\nnon. une douleur qui t'empêche de fonctionner — ce n'est pas normal.",
    actions5min:[
      {em:"🌡️", t:"Bouillotte sur le bas ventre", why:"chaleur = relâchement des crampes utérines"},
      {em:"🧘", t:"Position fœtale + respiration lente", why:"réduit la pression intra-abdominale"},
      {em:"🫚", t:"Oméga-3 maintenant", why:"anti-inflammatoire naturel — même mécanisme que l'ibuprofène"},
    ],
    action1h:"ibuprofène si nécessaire — pas de culpabilité. et note l'intensité sur 10 pour ton dossier médecin.",
    mecanisme:"les prostaglandines pro-inflammatoires provoquent les contractions utérines. avec un terrain inflammatoire SOPK, leur production est souvent excessive. les oméga-3 et le magnésium réduisent cette production progressivement.",
    kamila:"ces douleurs méritent d'être prises au sérieux. par toi. et par ton médecin. 🌿"
  },
  {
    id:"decouragement", emoji:"💙", titre:"Découragement", couleur:"#5B7FA6",
    validation:"j'entends que c'est difficile.\net je vais pas te dire que ça va aller.\nce que je sais — c'est que le fait d'avoir ouvert cette app aujourd'hui, dans un jour comme ça, c'est déjà quelque chose.",
    actions5min:[
      {em:"💧", t:"Un verre d'eau", why:"la plus petite décision de soin possible"},
      {em:"📖", t:"Relis tes victoires dans le journal", why:"ton cerveau oublie les progrès — les données les rappellent"},
      {em:"🎙️", t:"Écoute le vocal Kamila 'jours difficiles'", why:"tu n'as pas à traverser ça seule"},
    ],
    action1h:"une seule mission. la plus petite. pas les 30 jours — juste la prochaine heure.",
    mecanisme:"le découragement avec le SOPK est souvent biologique autant qu'émotionnel. le cortisol élevé, l'inflammation, la résistance à l'insuline — tout ça affecte la dopamine et la sérotonine. tu ne 'penses trop'. ton cerveau reçoit de mauvais signaux chimiques.",
    kamila:"t'es pas en train d'échouer Cyster. t'es en train de traverser quelque chose de difficile. c'est pas la même chose. 🌿"
  },
  {
    id:"craquage", emoji:"🍪", titre:"Craquage alimentaire", couleur:"#CB9A79",
    validation:"stop.\nrespire.\nce que tu viens de manger ne définit pas ton protocole.\nune décision ne défait pas 10 jours de constance.",
    actions5min:[
      {em:"🚫", t:"Stop la culpabilité — maintenant", why:"la culpabilité augmente le cortisol qui aggrave les fringales"},
      {em:"💧", t:"Grand verre d'eau", why:"aide l'élimination du pic glycémique"},
      {em:"🚶‍♀️", t:"Marche 10 minutes", why:"coupe le pic insulinique post-craquage"},
    ],
    action1h:"prochain repas normal. pas de 'compensation'. pas de restriction. repas normal dans le bon ordre.",
    mecanisme:"la culpabilité après un craquage est le piège le plus courant. elle augmente le cortisol. le cortisol aggrave la résistance à l'insuline. qui aggrave les fringales. qui mène à un nouveau craquage. briser ce cycle — c'est ne pas culpabiliser.",
    kamila:"le prochain repas recommence tout. pas lundi. le prochain repas. 🌿"
  },
  {
    id:"stress", emoji:"😤", titre:"Stress aigu", couleur:"#D97706",
    validation:"ton corps est en mode survie là.\net avec un SOPK — le stress n'est pas juste inconfortable.\nil agit directement sur tes hormones.",
    actions5min:[
      {em:"🧘", t:"Cohérence cardiaque maintenant", why:"5 sec inspiration · 5 sec expiration · 5 minutes"},
      {em:"🚫", t:"Pas de café pour les 3 prochaines heures", why:"caféine + cortisol = spiral anxieux"},
      {em:"📵", t:"Notifications off", why:"chaque notification = micro-spike de cortisol"},
    ],
    action1h:"une chose à la fois. écrire sur papier la liste de ce qui stresse. puis choisir une seule chose. une.",
    mecanisme:"le stress active l'axe HPA. cortisol produit. cortisol élevé = résistance à l'insuline aggravée + surrénales qui sur-produisent des androgènes. un jour de stress intense peut aggraver tes symptômes SOPK pendant 48-72h.",
    kamila:"ce que tu ressens là est réel. et biologique. la cohérence cardiaque n'est pas du yoga — c'est de la neurobiologie appliquée. 🌿"
  },
  {
    id:"restaurant", emoji:"🍽️", titre:"Restaurant / sortie", couleur:"#B8C5A0",
    validation:"t'as pas à manger parfaitement pour que le protocole fonctionne.\nt'as juste à appliquer une règle simple.\nune seule.",
    actions5min:[
      {em:"🥗", t:"Commence par la salade ou les légumes", why:"l'ordre des aliments réduit le pic glycémique de 30%"},
      {em:"💧", t:"Eau avant de commander", why:"300ml avant = moins d'insuline produite"},
      {em:"👀", t:"Scan du menu — protéine + légumes d'abord", why:"choisir avant d'avoir faim = meilleure décision"},
    ],
    action1h:"protéine + légumes + féculent en dernier si tu veux. dessert si t'en as envie — deux bouchées conscientes valent mieux que frustration.",
    mecanisme:"l'ordre des aliments dans l'assiette change la courbe glycémique de tout le repas. légumes en premier = fibre qui ralentit l'absorption. protéines ensuite. féculents en dernier. même au restaurant. même avec les autres qui mangent différemment.",
    kamila:"une sortie ne brise pas un protocole. profite. et applique juste l'ordre des aliments. 🌿"
  },
  {
    id:"medecin", emoji:"👩‍⚕️", titre:"Mon médecin ne m'écoute pas", couleur:"#5B7FA6",
    validation:"c'est frustrant.\nc'est injuste.\net tu n'as pas à l'accepter comme une fatalité.",
    actions5min:[
      {em:"📝", t:"Note ce qui s'est passé exactement", why:"pour le prochain rendez-vous ou un deuxième avis"},
      {em:"📱", t:"Ouvre 'Plans d'action post-résultats'", why:"selon ce que le médecin a dit — il y a une réponse"},
      {em:"🔍", t:"Cherche un gynéco spécialisé hormones", why:"un généraliste n'est pas formé au SOPK comme un spécialiste"},
    ],
    action1h:"deuxième avis. ce n'est pas trahir ton médecin. c'est prendre soin de toi.",
    mecanisme:"le SOPK est encore mal enseigné en faculté de médecine. beaucoup de médecins appliquent les protocoles standards — pilule ou perte de poids — sans aller plus loin. ce n'est pas de la mauvaise volonté. c'est un manque de formation spécifique. tu as le droit de chercher mieux.",
    kamila:"tu mérites un médecin qui te prend au sérieux. si c'est pas celui-là — il y en a un autre. 🌿"
  },
  {
    id:"miroir", emoji:"🪞", titre:"Je ne me reconnais plus", couleur:"#C2AEBA",
    validation:"ce que tu ressens devant ce miroir — c'est réel.\nc'est pas de la coquetterie.\nc'est une perte d'identité.\net c'est l'un des aspects les plus difficiles du SOPK dont personne ne parle.",
    actions5min:[
      {em:"🚶‍♀️", t:"Sors de la pièce", why:"couper le cycle de rumination devant le miroir"},
      {em:"✍️", t:"Écris une chose que ton corps fait pour toi", why:"recadrer — pas toxic positivity, juste un fait"},
      {em:"🎙️", t:"Écoute le vocal Kamila 'jours difficiles'", why:"tu n'as pas à gérer ça seule"},
    ],
    action1h:"pas de solution rapide ici. juste — une action du protocole. n'importe laquelle. pour dire à ton corps que tu travailles pour lui.",
    mecanisme:"l'acné, la pilosité, la chute de cheveux, la prise de poids — ce sont des manifestations physiques de déséquilibres hormonaux. ton corps n'a pas changé de caractère. il envoie des signaux de détresse hormonale. le protocole s'attaque à ces signaux à la source.",
    kamila:"ton corps n'est pas ton ennemi. il essaie de te dire quelque chose. maintenant tu comprends la langue. 🌿"
  },
  {
    id:"voyage", emoji:"✈️", titre:"Voyage / déplacement", couleur:"#D4A56A",
    validation:"t'as pas à tout maintenir parfaitement en voyage.\ncinq règles non négociables. le reste — tu lâches.",
    actions5min:[
      {em:"💊", t:"Compléments dans le bagage cabine", why:"magnésium + zinc + vitamine D — jamais en soute"},
      {em:"🥜", t:"Amandes + chocolat 85% dans le sac", why:"survie glycémique pour les transports et hôtels"},
      {em:"💧", t:"Bouteille d'eau — toujours", why:"la déshydratation aggrave tout"},
    ],
    action1h:"repérer protéines + légumes disponibles dans l'endroit où tu es. supermarché, restaurant, room service. une option est toujours possible.",
    mecanisme:"le voyage stresse le corps — changement de rythme, de nourriture, de sommeil. le cortisol monte. les habitudes sautent. c'est normal. cinq choses suffisent : eau, protéines, compléments, sommeil, et une marche par jour.",
    kamila:"le protocole voyage avec toi. adapté. pas parfait. mais présent. 🌿"
  },
  {
    id:"insomnie", emoji:"🌙", titre:"Réveil nocturne", couleur:"#7A5C45",
    validation:"3h du matin et le cerveau qui s'emballe.\nc'est l'un des symptômes les plus épuisants du SOPK.\net l'un des moins expliqués.",
    actions5min:[
      {em:"📵", t:"Téléphone hors de portée — maintenant", why:"lumière bleue = mélatonine supprimée encore plus"},
      {em:"🧘", t:"Cohérence cardiaque allongée", why:"5 sec inspiration · 5 sec expiration · les yeux fermés"},
      {em:"🥛", t:"Une petite poignée d'amandes si tu as faim", why:"hypoglycémie nocturne = réveil à 3h — c'est biologique"},
    ],
    action1h:"si tu ne te rendors pas en 20 min — lève-toi 15 minutes. lumière tamisée. pas d'écran. retourne te coucher.",
    mecanisme:"deux causes principales du réveil nocturne SOPK : le cortisol élevé la nuit qui supprime la mélatonine, et l'hypoglycémie nocturne qui déclenche une alerte adrénaline. les deux sont biologiques. les deux répondent au protocole sur plusieurs semaines.",
    kamila:"demain tu seras fatiguée. et tu continueras quand même. parce que t'as prouvé que tu peux. 🌿"
  },
];

// ─── MISSIONS (profil métabolique — modèle) ─────────────────────────────────
const MISSIONS_META = [
  {day:1,emoji:"🌱",theme:"l'ordre dans l'assiette",
mission:"mange ton prochain repas dans le bon ordre — fibres/légumes d'abord, protéines et gras ensuite, féculents et sucres en dernier.",
msg:"la plupart des médecins ne t'ont jamais dit ça.\n\npourtant c'est l'un des gestes les plus puissants pour ton insuline — sans régime, sans privation.\n\naujourd'hui on commence par quelque chose que tu vas garder à vie.",
pourquoi:"quand tu manges des glucides en premier dans un estomac vide, ils sont digérés très vite. le sucre file dans ton sang d'un coup. pic de glycémie. ton pancréas envoie une grosse vague d'insuline.\n\navec un SMOP, c'est ce qu'on veut éviter — ton insuline élevée envoie un signal direct à tes ovaires : produisez plus d'androgènes. c'est cette cascade qui entretient l'acné, la pilosité, les cycles irréguliers.\n\nles légumes en premier — leurs fibres forment un gel dans ton intestin qui ralentit l'arrivée du sucre. le pic est lissé. même assiette, ordre différent, réponse hormonale changée.",
source:"une alimentation à index glycémique bas améliore les marqueurs hormonaux et métaboliques du SMOP (Marsh et al., 2010, American Journal of Clinical Nutrition).",
comment:["repère dans ton assiette où sont les légumes et où sont les féculents","mange tous tes légumes (ou au moins la moitié) en premier","passe aux protéines et au gras : viande, poisson, œuf, fromage, avocat","termine par les féculents et le sucré : riz, pâtes, pain, dessert","mange tranquillement — le gel de fibres a besoin d'un peu de temps"],
pieges:["mélanger tout dans la même bouchée annule l'effet — l'ordre compte vraiment","pas de légumes dans le repas ? garde un bol de crudités ou une soupe en entrée","être pressée n'est pas une excuse — même au resto l'ordre reste applicable, c'est gratuit et invisible"],
plus:"si tu n'as vraiment aucun légume sous la main — une cuillère à soupe de vinaigre de cidre dans un verre d'eau, bue juste avant le repas, a un effet similaire sur le lissage du pic glycémique. mon astuce de secours les jours à l'arrache.",
observes:["dès aujourd'hui : moins de coup de barre après le repas","dans quelques jours : moins de fringale 2h après manger","dans 2 semaines : une faim plus régulière, moins d'envies de sucre l'après-midi"],
victoire:"tu viens de faire quelque chose que la plupart des médecins n'ont jamais pris le temps de t'expliquer.",
outil:{emoji:"🍴",label:"Découvre le modèle de l'assiette SOPK",desc:"comment composer ton assiette sans rien peser",cible:"assiette"},
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"avant tout le reste — on prépare ton foie. c'est lui qui élimine l'excès d'androgènes. la Cure Détox commence aujourd'hui."}},
  {day:2,emoji:"🥚",theme:"le petit-déjeuner qui change tout",
mission:"remplace ton petit-déjeuner sucré par une version riche en protéines — et note comment tu te sens à 11h.",
msg:"le petit-déjeuner c'est le repas qui donne le ton de toute ta journée.\n\nun mauvais départ le matin et c'est les montagnes russes jusqu'au soir.\n\naujourd'hui on casse ce cycle.",
pourquoi:"un petit-déjeuner sucré ou à base de céréales raffinées — jus, biscottes, viennoiseries, céréales — crée un énorme pic d'insuline dès le réveil, sur un corps à jeun particulièrement sensible.\n\nce pic redescend brutalement vers 10-11h. c'est l'hypoglycémie réactionnelle. résultat : coup de barre, fringale, besoin urgent de sucre. et c'est reparti pour un tour toute la journée.\n\nles protéines, elles, ne déclenchent quasiment pas d'insuline. elles stabilisent ta glycémie sur 4 à 5 heures. tu tiens jusqu'au déjeuner sans craquer.",
source:"la résistance à l'insuline est présente chez la majorité des femmes SMOP, même celles qui ne sont pas en surpoids (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["vise 20 à 30g de protéines au petit-déjeuner","œufs sous toutes les formes : brouillés, à la coque, omelette","ou : fromage blanc/skyr + oléagineux + graines de chia","ou : restes de la veille (oui, salé le matin, c'est permis)","ajoute un gras : avocat, beurre, huile d'olive — ça rassasie"],
pieges:["le jus d'orange 'healthy' du matin est une bombe de sucre rapide — remplace par le fruit entier","les céréales ou granola sont souvent très sucrés — lis les étiquettes","sauter le petit-déjeuner peut marcher pour certaines, mais pas si ça te fait craquer à 11h"],
plus:"si tu n'as pas faim le matin, ne te force pas — mais prépare ton premier repas pour qu'il soit protéiné. l'important c'est de ne jamais ouvrir ta journée alimentaire sur du sucre rapide.",
observes:["ce matin : note ton niveau d'énergie à 11h sur 10","dans quelques jours : la fringale de 11h disparaît","dans 2 semaines : tu n'penses plus au sucre en milieu de matinée"],
victoire:"si tu te sens différente à 11h — tu viens de trouver une cause directe de ta fatigue.",
outil:{emoji:"🌅",label:"Vois des idées de petits-déjeuners",desc:"des petits-déj protéinés concrets et testés",cible:"repas",moment:"matin"}},
  {day:3,emoji:"📋",theme:"lire ses fringales comme des données",
mission:"note chaque fringale aujourd'hui — l'heure, le contexte, ce que tu ressentais juste avant.",
msg:"tes fringales ne sont pas ton ennemi.\n\nce sont des messages. des données.\n\naujourd'hui on arrête de les subir. on commence à les lire.",
pourquoi:"une fringale de sucre, ce n'est pas un manque de volonté. c'est de la biologie pure.\n\nquand ton insuline fait un pic puis chute brutalement, ton taux de sucre sanguin tombe. ton cerveau interprète ça comme une urgence vitale et envoie une alarme : sucre, maintenant. c'est automatique, c'est puissant, et ça n'a rien à voir avec ton caractère.\n\nen notant tes fringales, tu vas voir apparaître des schémas. souvent elles arrivent 2-3h après un repas trop sucré, ou dans les moments de stress, ou en fin d'après-midi. ces schémas sont la carte de ton mécanisme à toi.",
source:"le lien entre résistance à l'insuline, hyperandrogénie et symptômes SMOP est un mécanisme bien documenté (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["garde une note ouverte sur ton téléphone aujourd'hui","à chaque envie de grignoter sucré, note l'heure","note le contexte : seule ? stressée ? après quel repas ?","note l'intensité sur 10","ne juge pas, n'empêche pas — observe seulement"],
pieges:["culpabiliser à chaque note fausse les données — tu observes, tu ne te punis pas","oublier de noter les petites envies — même un carré de chocolat compte","analyser trop vite — aujourd'hui tu collectes, tu analyseras après"],
plus:"si tu repères qu'une fringale arrive toujours à la même heure, ce n'est pas un hasard. c'est souvent le contrecoup d'un repas précédent. demain tu pourras agir dessus en amont.",
observes:["aujourd'hui : tu vois tes propres schémas pour la première fois","dans quelques jours : tu anticipes les moments à risque","dans 2 semaines : tu manges en amont pour éviter la chute"],
victoire:"passer de 'je manque de volonté' à 'je comprends mon mécanisme' — c'est la vraie victoire."},
  {day:4,emoji:"💧",theme:"le geste le plus sous-estimé",
mission:"bois 300ml d'eau 10 à 15 minutes avant chacun de tes repas aujourd'hui.",
msg:"celui-là est tellement simple que personne n'y croit.\n\ngratuit. immédiat. et presque personne ne le fait.\n\naujourd'hui tu testes.",
pourquoi:"boire de l'eau avant le repas remplit partiellement ton estomac et ralentit la vitesse à laquelle la nourriture — et donc le sucre — passe dans ton intestin.\n\nrésultat : le pic glycémique est plus doux, l'insuline monte moins vite. tu manges aussi naturellement un peu moins, parce qu'une partie de la sensation de faim était en réalité de la soif.\n\nbeaucoup de Cysters confondent faim et déshydratation. l'eau avant le repas coupe ce faux signal et t'aide à mieux ressentir ta vraie satiété.",
source:"des habitudes qui réduisent la charge glycémique améliorent les marqueurs métaboliques du SMOP (Marsh et al., 2010, American Journal of Clinical Nutrition).",
comment:["pose un verre d'eau de 300ml à portée 15 min avant de manger","bois-le tranquillement, pas d'un trait","attends quelques minutes avant de passer à table","répète avant chaque repas principal","eau plate ou pétillante, peu importe — pas de jus ni soda"],
pieges:["boire pendant le repas dilue moins efficacement — c'est avant que ça compte le plus","attendre d'avoir soif, c'est déjà trop tard — la soif est un signal tardif","remplacer l'eau par du thé sucré ou un soda annule tout l'intérêt"],
plus:"ajoute le jus d'un demi-citron dans ton eau du matin. l'acidité a un léger effet supplémentaire sur le lissage glycémique du premier repas, et ça soutient ton foie.",
observes:["aujourd'hui : tu manges peut-être un peu moins sans effort","dans quelques jours : ta digestion est plus légère","dans 2 semaines : boire avant les repas est devenu un réflexe"],
victoire:"tu agis sur ton insuline sans rien changer à ce que tu manges."},
  {day:5,emoji:"🚶‍♀️",theme:"le mouvement qui change la glycémie",
mission:"marche activement 15 minutes après ton dîner ce soir.",
msg:"c'est l'outil le plus puissant et le moins prescrit du profil métabolique.\n\nles médecins disent 'faites du sport'. ils ne disent jamais quand ni pourquoi.\n\naujourd'hui tu vas comprendre le timing.",
pourquoi:"pendant que tu marches, tes muscles ont besoin d'énergie. et ils vont la chercher directement dans le sucre de ton sang — sans avoir besoin d'insuline pour ça.\n\nconcrètement : une marche juste après le repas, au moment où ta glycémie monte, permet à tes muscles d'absorber ce sucre avant qu'il ne déclenche un gros pic d'insuline. on a mesuré qu'une marche post-repas peut réduire le pic glycémique de 20 à 30%.\n\nle dîner est souvent le repas le plus à risque — on bouge moins le soir, et le sucre stagne. d'où le timing : après le dîner.",
source:"l'activité physique améliore la sensibilité à l'insuline, mécanisme central du SMOP métabolique (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["dès la fin du dîner, ne t'assois pas dans le canapé","sors marcher 15 minutes, ou marche chez toi","allure active : tu dois pouvoir parler mais sentir que tu bouges","pas besoin de tenue de sport — tu marches, c'est tout","si tu ne peux pas sortir, monte et descends les escaliers"],
pieges:["attendre 1h après le repas réduit l'effet — c'est dans les 30 min que c'est le plus utile","marcher mollement ne suffit pas — il faut que les muscles travaillent un minimum","croire qu'il faut 1h de sport — 15 minutes bien placées valent mieux qu'1h au mauvais moment"],
plus:"si tu ne peux vraiment pas marcher, même rester debout à faire la vaisselle ou ranger 15 minutes après le repas est mieux que de t'asseoir. le but c'est de ne pas être immobile pendant que ta glycémie grimpe.",
observes:["ce soir : tu te sens moins lourde après le dîner","dans quelques jours : meilleur sommeil après une marche du soir","dans 2 semaines : c'est devenu ton rituel de fin de journée"],
victoire:"tu viens d'utiliser ton corps comme outil thérapeutique. sans ordonnance."},
  {day:6,emoji:"🔍",theme:"trouver le sucre caché",
mission:"lis les étiquettes de 3 produits que tu manges souvent — repère les noms cachés du sucre.",
msg:"beaucoup de Cysters pensent manger correctement.\n\net découvrent aujourd'hui où se cachent les sucres qui entretiennent leurs fringales.\n\naujourd'hui tu deviens détective.",
pourquoi:"le sucre se cache sous des dizaines de noms différents sur les étiquettes. il est dans le pain de mie, la sauce tomate industrielle, les yaourts aromatisés, les plats préparés — là où tu ne l'attends pas.\n\nle plus piégeux c'est le fructose ajouté (sirop de glucose-fructose). il est traité directement par ton foie, et il aggrave la résistance à l'insuline sans jamais déclencher la sensation de satiété. tu en manges sans t'en rendre compte, et ça entretient le cercle.\n\nrepérer ces sucres cachés, c'est couper une source d'insuline que tu ne soupçonnais même pas.",
source:"une alimentation à charge glycémique réduite améliore les marqueurs hormonaux et métaboliques du SMOP (Marsh et al., 2010, American Journal of Clinical Nutrition).",
comment:["prends 3 produits de ton placard ou frigo","lis la liste des ingrédients, pas le tableau nutritionnel","cherche tout mot finissant en -ose (glucose, maltose, dextrose)","repère sirop, sirop de glucose-fructose, concentré de jus","plus c'est haut dans la liste, plus il y en a"],
pieges:["se fier au devant du paquet ('sans sucre ajouté' cache parfois d'autres sucres)","croire que 'bio' ou 'naturel' veut dire sans sucre — faux","oublier les sauces et condiments, souvent très sucrés"],
plus:"si tu vois 2 ou 3 noms de sucre différents dans la même liste, c'est une technique connue : on découpe le sucre en plusieurs sources pour qu'aucune n'apparaisse en tête de liste. ne te fais pas avoir.",
observes:["aujourd'hui : tu réalises où se cachait le sucre","dans quelques jours : tu lis les étiquettes par réflexe","dans 2 semaines : tu choisis des produits plus bruts sans y penser"],
victoire:"tu viens peut-être de trouver une pièce importante de ton puzzle.",
outil:{emoji:"🔍",label:"La liste des sucres cachés",desc:"tous les noms du sucre à repérer sur les étiquettes",cible:"sucres"}},
  {day:7,emoji:"🎯",theme:"bilan de semaine 1",
mission:"note 3 choses qui ont changé cette semaine — même infimes, même invisibles dans le miroir.",
msg:"une semaine entière. tu l'as fait.\n\nmême les jours difficiles.\n\naujourd'hui on prend un moment pour regarder le chemin.",
pourquoi:"à J7, ton pancréas produit déjà moins d'insuline à chaque repas. la Cure Détox a commencé à soutenir ton foie. ton corps a enregistré une semaine de signaux différents.\n\nmais voilà ce que personne ne te dit : les premiers changements sont biologiques, pas visuels. ils se passent dans ton sang, ton énergie, ton sommeil — bien avant le miroir. c'est pour ça que tant de femmes abandonnent à J7 : elles cherchent au mauvais endroit.\n\nfaire le bilan des petits signaux (moins de fringales, meilleure énergie, sommeil plus profond) c'est apprendre à voir les vrais résultats.",
source:"la résistance à l'insuline est au cœur des mécanismes du SMOP, et son amélioration précède les changements visibles (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["repense à ta semaine, jour par jour","note les changements d'énergie, de faim, de sommeil","note les changements d'humeur ou de digestion","ne cherche pas le poids ou le miroir — trop tôt","garde cette liste, tu la reliras à J14 et J30"],
pieges:["juger la semaine sur la balance — elle ne dit rien à J7","se dévaloriser pour les jours imparfaits — la cohérence n'est pas la perfection","ne rien noter en pensant que rien n'a changé — les petits signaux comptent"],
plus:"écris ce bilan dans l'onglet Journal. dans 3 semaines, le relire te montrera noir sur blanc le chemin parcouru. c'est ta meilleure arme les jours de doute.",
observes:["aujourd'hui : tu mesures ta première semaine autrement","dans 2 semaines : tu compares et tu vois la progression","dans 3 semaines : ce bilan devient ta preuve personnelle"],
victoire:"une semaine de cohérence. c'est déjà infiniment plus que rien."},
  {day:8,emoji:"💪",theme:"les protéines et tes hormones",
mission:"mets une source de protéines à chacun de tes repas aujourd'hui — petit-déjeuner inclus.",
msg:"semaine 2.\n\nle cap le plus difficile est derrière toi.\n\naujourd'hui on consolide ce qui marche.",
pourquoi:"voici le mécanisme central de ton profil : quand ton insuline est élevée, elle envoie un signal direct à tes ovaires — produisez plus d'androgènes. ce sont ces androgènes en excès qui nourrissent l'acné, la pilosité, les cycles déréglés.\n\nles protéines sont ton levier le plus fiable. elles ne déclenchent quasiment pas d'insuline, et elles stabilisent ta glycémie pendant 4 à 5 heures. à chaque repas où tu mets des protéines, tu coupes un peu plus ce signal androgénique.\n\nc'est pour ça qu'on insiste autant : ce n'est pas une mode 'protéines', c'est de la biologie hormonale appliquée.",
source:"le lien insuline élevée → hyperandrogénie est un mécanisme central et documenté du SMOP (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["petit-déjeuner : œufs, skyr, ou restes protéinés","déjeuner : viande, poisson, légumineuses + légumes","dîner : protéine légère (poisson, œufs, tofu)","collation si besoin : oléagineux, fromage blanc","vise environ une portion de la taille de ta paume par repas"],
pieges:["oublier les protéines au petit-déjeuner — c'est le repas le plus important pour ça","croire qu'une salade verte seule suffit — il faut la protéine avec","compter le pain ou les féculents comme des protéines — ce n'en sont pas"],
plus:"si tu manques d'idées, va dans l'onglet Outils → Aliments et cherche par catégorie 'Protéines'. tu y trouveras des dizaines d'options avec leur teneur exacte.",
observes:["aujourd'hui : tu tiens mieux entre les repas","dans quelques jours : moins de fringales de sucre","dans 2 semaines : une satiété plus stable, une énergie plus régulière"],
victoire:"chaque repas avec des protéines est un repas où ton insuline travaille pour toi.",
outil:{emoji:"🍽️",label:"Trouve tes sources de protéines",desc:"toutes les protéines classées par teneur",cible:"aliments",recherche:""},
tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:"aujourd'hui la fondation hormonale entre dans ton protocole. 8 plantes certifiées bio. laisse 2h avec la Cure Détox du matin."}},
  {day:9,emoji:"✨",theme:"le magnésium",
mission:"commence le magnésium bisglycinate ce soir — 200 à 400mg au coucher.",
msg:"trois problèmes du SMOP Métabolique. un seul complément.\n\nparfois la simplicité fait le plus gros du travail.",
pourquoi:"le magnésium est l'un des minéraux les plus souvent bas chez les femmes avec un SMOP. et c'est un problème, parce qu'il intervient à trois endroits clés de ton profil.\n\nun : il participe à la sensibilité à l'insuline — tes cellules entendent mieux le signal. deux : il aide à réguler le cortisol, l'hormone du stress qui aggrave le SMOP. trois : il améliore la qualité de ton sommeil profond, le moment où ton corps répare le plus.\n\nla forme compte. le bisglycinate est bien absorbé et doux pour le ventre, contrairement à l'oxyde de magnésium (souvent dans les produits bas de gamme) qui passe mal et peut donner des maux de ventre.",
source:"en co-supplémentation (magnésium, zinc, calcium, vitamine D), une amélioration des symptômes du SMOP a été observée en essai contrôlé (Maktabi et al., 2018). Le magnésium est fréquemment bas chez les femmes SMOP.",
comment:["choisis du magnésium bisglycinate (pas oxyde)","commence par 200mg, tu peux monter à 400mg","prends-le le soir, environ 30 min avant le coucher","avec un peu d'eau, pendant ou après le repas du soir","sois régulière — l'effet se construit sur quelques semaines"],
pieges:["prendre de l'oxyde de magnésium — mal absorbé, effet laxatif","prendre le magnésium le matin — il favorise la détente, mieux le soir","attendre un effet immédiat — il se construit sur 2 à 4 semaines"],
plus:"si tu as des crampes, des paupières qui sautent, ou un sommeil léger, ce sont souvent des signes d'un magnésium bas. tu pourrais sentir une différence sur le sommeil dès les premières nuits.",
observes:["les premières nuits : un endormissement parfois plus facile","dans 2 semaines : un sommeil plus profond, moins de réveils","dans un mois : moins de tension nerveuse, meilleure récupération"],
victoire:"tu viens de commencer quelque chose qui travaille pour toi même quand tu dors.",
outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"dosage, timing et délai pour ton profil",cible:"complements"}},
  {day:10,emoji:"🥦",theme:"le foie dans le SMOP",
mission:"ajoute des légumes crucifères à un repas aujourd'hui — brocoli, chou, roquette, radis, chou-fleur.",
msg:"personne ne t'avait parlé du foie dans ton cabinet médical.\n\npourtant c'est lui qui élimine l'excès d'androgènes.\n\naujourd'hui on s'occupe de cet organe oublié.",
pourquoi:"ton foie a un rôle énorme dans le SMOP qu'on ne t'explique jamais : c'est lui qui transforme et élimine l'excès d'androgènes qui circule dans ton corps. s'il est surchargé, ces androgènes restent en circulation plus longtemps.\n\nles légumes crucifères (brocoli, chou, chou-fleur, roquette) contiennent des composés soufrés qui soutiennent les voies de détoxification du foie — celles qui aident à éliminer les hormones en excès. c'est un soutien doux mais réel, jour après jour.\n\nc'est aussi pour ça que la Cure Détox du matin existe dans ton protocole : préparer le foie, c'est s'attaquer à la source, pas juste aux symptômes.",
source:"le lien entre métabolisme hépatique des androgènes et SMOP est documenté ; une alimentation riche en légumes soutient l'équilibre métabolique (Marsh et al., 2010, American Journal of Clinical Nutrition).",
comment:["choisis un crucifère : brocoli, chou-fleur, chou, roquette","crus ou légèrement cuits à la vapeur (mieux que trop cuits)","ajoute-les à ton déjeuner ou dîner, en entrée","vise au moins 3 à 4 fois par semaine sur la durée","varie les crucifères pour ne pas te lasser"],
pieges:["trop cuire les crucifères — ça réduit leurs composés actifs","les manger en toute fin de repas — mets-les plutôt au début","en manger énormément d'un coup — la régularité vaut mieux que la quantité"],
plus:"si les crucifères crus te ballonnent, commence par de petites quantités cuites à la vapeur et augmente progressivement. ton microbiote s'adapte en quelques semaines.",
observes:["les premiers jours : une digestion qui s'habitue","dans 2 semaines : un transit plus régulier","sur la durée : un soutien de fond à l'élimination des androgènes"],
victoire:"dix jours. ton foie commence à travailler différemment.",
outil:{emoji:"🍽️",label:"Explore les légumes crucifères",desc:"cherche brocoli, chou-fleur, roquette",cible:"aliments",recherche:"chou"}},
  {day:11,emoji:"🏋️‍♀️",theme:"le renforcement musculaire",
mission:"fais 20 minutes de renforcement aujourd'hui — Squats 3×15, Fentes 3×12, Pompes 3×10, Gainage 3×30s.",
msg:"tu ne fais pas du sport pour brûler des calories.\n\ntu construis un muscle qui travaille pour toi 24h/24.\n\naujourd'hui on pose la première brique.",
pourquoi:"voici un fait que peu de gens connaissent : tes muscles captent 70 à 80% du glucose de ton corps. plus tu as de masse musculaire, plus tu as de 'réservoirs' pour absorber le sucre de ton sang — et le mieux, c'est qu'à l'effort, tes muscles le font sans avoir besoin d'insuline.\n\nconcrètement : construire du muscle, c'est agrandir ta capacité à gérer la glycémie en permanence, même au repos. un corps plus musclé est un corps plus sensible à l'insuline.\n\nle renforcement n'est pas réservé aux sportives. pour le SMOP métabolique, c'est un des leviers les plus puissants sur le long terme.",
source:"l'activité physique, en particulier le renforcement musculaire, améliore la sensibilité à l'insuline dans le SMOP (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["échauffe-toi 2-3 minutes (montées de genoux, rotations)","Squats : 3 séries de 15 — assise imaginaire sur une chaise","Fentes : 3 séries de 12 par jambe","Pompes : 3×10 (sur les genoux ou contre un mur si besoin)","Gainage : 3×30 secondes — dos droit, ventre serré"],
pieges:["aller trop vite — la lenteur fait travailler le muscle davantage","sauter l'échauffement — risque de blessure","viser la perfection dès la première fois — la régularité prime"],
plus:"si certains exercices sont trop durs, adapte sans culpabiliser : pompes contre un mur, demi-squats, gainage plus court. ce qui compte c'est de solliciter le muscle, pas de faire un exploit.",
observes:["après la séance : une fatigue saine, pas un épuisement","2-3 jours après : de légères courbatures (signe que ça marche)","dans 3 semaines : plus de force, des gestes du quotidien plus faciles"],
victoire:"première séance. c'est la plus difficile. tu l'as faite."},
  {day:12,emoji:"🌿",theme:"la cannelle de Ceylan",
mission:"ajoute ½ cuillère à café de cannelle de Ceylan à ton petit-déjeuner — Ceylan, pas Cassia.",
msg:"c'est un des secrets les plus documentés du profil Métabolique.\n\net presque personne ne le sait.\n\naujourd'hui il entre dans ton quotidien.",
pourquoi:"la cannelle de Ceylan a montré dans des études cliniques des effets sur la sensibilité à l'insuline et la régularité des cycles menstruels. elle aide tes cellules à mieux entendre le signal de l'insuline.\n\nmais attention à une distinction cruciale : il existe deux cannelles. la Ceylan (la 'vraie') et la Cassia (la moins chère, la plus courante en supermarché). la Cassia contient de la coumarine, une substance potentiellement toxique pour le foie à dose régulière. pour un usage quotidien, c'est la Ceylan qu'il te faut, toujours.\n\nun petit geste, à condition de choisir la bonne.",
source:"la cannelle de Ceylan a montré des effets sur la régularité des cycles (Kort & Lobo, 2014, American Journal of Obstetrics & Gynecology) et sur la sensibilité à l'insuline (méta-analyse F1000Research, 2021).",
comment:["achète bien de la cannelle de Ceylan (vérifie l'étiquette)","saupoudre ½ cuillère à café sur ton petit-déjeuner","fromage blanc, flocons d'avoine, ou même ton café","tu peux aussi l'ajouter à une compote sans sucre","régularité quotidienne pour un effet de fond"],
pieges:["acheter de la Cassia par erreur — la coumarine est à éviter au quotidien","en mettre d'énormes quantités — ½ à 1 cuillère à café suffit","l'ajouter à un petit-déjeuner sucré — ça n'annule pas le sucre"],
plus:"la cannelle de Ceylan est plus claire, plus friable, et ses bâtons sont faits de fines couches enroulées (comme un cigare), alors que la Cassia est dure et creuse. au moindre doute, achète-la étiquetée 'Ceylan' ou 'verum'.",
observes:["dès maintenant : un petit-déjeuner plus parfumé et réconfortant","sur quelques semaines : un soutien de fond à ta glycémie","sur la durée : un geste anti-pic devenu automatique"],
victoire:"un allié puissant. sans effort. sans coût. sans ordonnance."},
  {day:13,emoji:"🌙",theme:"le sommeil est médecine",
mission:"couche-toi 30 minutes plus tôt ce soir — écrans coupés 30 min avant, chambre fraîche et sombre.",
msg:"dormir c'est agir.\n\nton corps guérit la nuit. pas pendant que tu scrolles.\n\naujourd'hui on prend le sommeil au sérieux.",
pourquoi:"le sommeil n'est pas un luxe pour ton SMOP, c'est un traitement. chaque nuit trop courte augmente ta résistance à l'insuline dès le lendemain — c'est mesurable.\n\nle mécanisme : le manque de sommeil fait grimper ton cortisol (l'hormone du stress). et ce cortisol élevé aggrave directement l'insulinorésistance, qui elle-même nourrit l'excès d'androgènes. tout est lié. une mauvaise nuit, et toute ta cascade hormonale travaille contre toi le jour suivant.\n\nà l'inverse, un sommeil profond et suffisant, c'est plusieurs heures où ton corps répare, régule ton cortisol et améliore ta sensibilité à l'insuline. gratuitement.",
source:"le SMOP et le stress (cortisol) ont une relation bidirectionnelle, chacun aggrave l'autre ; l'axe HPA est altéré dans le SMOP (Pasquali et al., 1993, 2006).",
comment:["fixe une heure de coucher 30 min plus tôt que d'habitude","coupe les écrans 30 minutes avant (la lumière bleue retarde l'endormissement)","baisse la température de ta chambre (18-19°C idéal)","fais le noir complet, ou utilise un masque","une tisane apaisante ou quelques pages de lecture pour signaler la fin de journée"],
pieges:["scroller au lit 'juste 5 minutes' — ça repousse l'endormissement","faire du sport intense tard le soir — ça réveille le système","compenser le manque de semaine par des grasses matinées — le rythme régulier compte plus"],
plus:"le magnésium que tu prends depuis le Jour 9 agit aussi sur la qualité du sommeil. les deux gestes se renforcent. si tu rumines au coucher, pose un carnet à côté du lit pour vider ta tête sur papier.",
observes:["dès demain matin : moins de coup de barre, esprit plus clair","dans une semaine : un endormissement plus facile","dans 2 semaines : une énergie plus stable, moins de fringales (le manque de sommeil donne faim)"],
victoire:"tu viens de prescrire à ton corps une dose de rééquilibrage hormonal."},
  {day:14,emoji:"🏆",theme:"mi-parcours",
mission:"compare ton score de brouillard d'aujourd'hui avec celui du Jour 1 — et note la différence, quelle qu'elle soit.",
msg:"à J14 la plupart des Cysters ne voient pas encore.\n\nc'est normal. la biologie précède toujours le visible.\n\naujourd'hui on marque une étape.",
pourquoi:"deux semaines. ça paraît peu, mais en biologie c'est déjà beaucoup. ton pancréas produit moins d'insuline à chaque repas. tes ovaires reçoivent un signal androgénique plus faible. ton foie est mieux soutenu. ton sommeil et ton magnésium travaillent en coulisses.\n\nvoici la vérité que personne ne te dit assez fort : à mi-parcours, les changements sont là, mais ils sont surtout internes. l'énergie, le sommeil, les fringales bougent avant la peau, les poils ou le poids. ceux-là demandent souvent 2 à 3 mois.\n\ncomparer ton score de brouillard, c'est mesurer ce qui change vraiment en premier : ta clarté, ton énergie, ton ressenti.",
source:"l'amélioration de la sensibilité à l'insuline précède les changements cliniques visibles dans le SMOP (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["ouvre ton score de brouillard du jour","compare-le à celui du Jour 1","relis aussi le bilan que tu as noté au Jour 7","note ce qui a bougé : énergie, sommeil, fringales, humeur","écoute le vocal de mi-parcours de Kamila, il est là pour toi aujourd'hui"],
pieges:["chercher des résultats visibles (peau, poids) et être déçue — trop tôt","minimiser les changements internes — ce sont les plus importants au début","abandonner parce que 'ça ne se voit pas' — c'est exactement le piège de J14"],
plus:"si tu ne vois pas encore de grand changement, ce n'est pas un échec — c'est le rythme normal du corps. les femmes qui réussissent ne sont pas celles qui changent vite, ce sont celles qui ne lâchent pas à mi-parcours.",
observes:["aujourd'hui : tu mesures ta progression interne","dans 2 semaines (J30) : un nouveau bilan, encore plus net","dans 2-3 mois : les changements visibles commencent à apparaître"],
victoire:"ce que tu vois aujourd'hui c'est la preuve que la constance produit des résultats.",
tisane:{nom:"Stabilitea",timing:"après les repas",lien:"https://sopklife.com/products/stabili-tea",texte:"le terrain est préparé. aujourd'hui la Stabilitea entre — feuilles de mûrier, cannelle de Ceylan, eucalyptus. glycémie ciblée directement."}},
  {day:15,emoji:"🏥",theme:"préparer ton rendez-vous",
mission:"ouvre l'onglet Médecin, prépare ton dossier et note les analyses à demander à ton prochain rendez-vous.",
msg:"tu n'attends plus qu'on te sauve.\n\ntu collabores avec ton médecin.\n\nc'est différent.\n\naujourd'hui tu prépares tes armes.",
pourquoi:"trop de Cysters sortent de chez le médecin frustrées, sans les bonnes analyses, parce qu'elles ne savaient pas quoi demander. la préparation change tout.\n\npour un profil métabolique, certaines analyses sont prioritaires : insuline à jeun et HOMA-IR (qui mesurent ta résistance à l'insuline — souvent oubliés), idéalement une HGPO avec insuline, testostérone libre + SHBG (pour le versant hormonal), et vitamine D.\n\narriver avec une liste précise, c'est transformer le rendez-vous : tu ne subis plus, tu collabores. et un médecin face à une patiente informée et structurée répond différemment.",
source:"la résistance à l'insuline (mesurée par HOMA-IR) est présente chez la majorité des femmes SMOP et doit être évaluée (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["ouvre l'onglet Médecin de l'app","note les analyses à demander (insuline à jeun, HOMA-IR, testostérone libre, SHBG, vitamine D)","prépare la liste de tes symptômes principaux","note tes questions précises pour le médecin","prends rendez-vous si ce n'est pas déjà fait"],
pieges:["demander juste 'une prise de sang' sans préciser — tu risques de repartir sans l'insuline","oublier de demander le HOMA-IR — c'est la clé du profil métabolique","ne pas noter tes symptômes — sur le moment on oublie la moitié"],
plus:"l'onglet Médecin contient des scripts prêts à l'emploi pour formuler tes demandes sans te sentir illégitime. tu peux même générer un document à montrer ou envoyer à ton médecin.",
observes:["aujourd'hui : tu te sens plus en contrôle de ta santé","au rendez-vous : un échange plus précis et plus utile","après : des analyses qui éclairent vraiment ton profil"],
victoire:"préparer son rendez-vous c'est reprendre le contrôle de sa santé."},
  {day:16,emoji:"💊",theme:"l'inositol",
mission:"si tu choisis de l'essayer : commence l'inositol — 2g de myo-inositol + 50mg de D-chiro-inositol, 2x/jour (ratio 40:1).",
msg:"les vraies transformations prennent le temps de la biologie.\n\ncontinue.\n\naujourd'hui on parle d'un complément très étudié.",
pourquoi:"l'inositol est l'un des compléments les plus étudiés dans le SMOP. il agit comme un 'second messager' de l'insuline : il aide tes cellules à mieux répondre au signal insulinique.\n\nplusieurs méta-analyses ont montré des améliorations de l'insuline à jeun, du HOMA-IR et de la testostérone. c'est encourageant. mais sois honnête avec toi-même sur le niveau de preuve : les guidelines internationales 2023 sur le SMOP considèrent que les données restent limitées et pas définitivement concluantes. autrement dit — c'est prometteur et bien toléré, mais ce n'est pas une garantie.\n\nle ratio 40:1 (myo / D-chiro) est celui qui reproduit l'équilibre naturel du corps et qui a été le plus utilisé dans les études.",
source:"méta-analyses montrant des bénéfices métaboliques (insuline à jeun, HOMA-IR, testostérone) ; les guidelines internationales 2023 nuancent toutefois le niveau de preuve (Inositol for PCOS, J Clin Endocrinol Metab, 2024).",
comment:["choisis un inositol au ratio 40:1 (myo + D-chiro)","2g de myo-inositol, matin et soir","mélange la poudre dans de l'eau ou une boisson","sois régulière — l'effet se construit sur 8 à 12 semaines","parles-en à ton médecin, surtout si tu es enceinte ou en désir d'enfant"],
pieges:["attendre un effet en quelques jours — il faut 2 à 3 mois","arrêter trop tôt — c'est l'erreur la plus fréquente","prendre du D-chiro seul à haute dose — le ratio 40:1 est mieux étudié"],
plus:"l'inositol est généralement bien toléré, avec beaucoup moins d'effets digestifs que la metformine. mais ce n'est pas un médicament miracle : il agit en soutien d'une alimentation et d'une hygiène de vie adaptées — pas à leur place.",
observes:["les premières semaines : rien de spectaculaire, c'est normal","vers 6-8 semaines : possible amélioration de l'énergie et des cycles","vers 3 mois : c'est là qu'on évalue vraiment l'effet"],
victoire:"tu viens de commencer quelque chose que beaucoup abandonnent trop tôt.",
outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"dosage, timing et délai pour ton profil",cible:"complements"}},
  {day:17,emoji:"🥑",theme:"les graisses contre les sucres",
mission:"fais un échange aujourd'hui : pain blanc → avocat, ou céréales sucrées → oléagineux, ou biscuit → chocolat 85%.",
msg:"ce que tu fais aujourd'hui contredit tout ce qu'on t'a appris sur les régimes.\n\net pourtant c'est ça qui marche pour ton profil.",
pourquoi:"on t'a appris à avoir peur du gras. pour le SMOP métabolique, c'est une erreur qui t'a freinée pendant des années.\n\nles bons gras (avocat, oléagineux, huile d'olive, poisson gras) ne stimulent quasiment pas l'insuline. au contraire : ils ralentissent la digestion et lissent ta réponse glycémique quand tu les associes à un repas. ton vrai problème, ce n'est pas le gras — c'est le sucre raffiné qui fait flamber ton insuline.\n\nremplacer un aliment sucré-raffiné par un bon gras, c'est attaquer le bon ennemi. tu te rassasies plus longtemps, et ta glycémie reste calme.",
source:"une alimentation à charge glycémique basse, incluant de bonnes graisses, améliore les marqueurs métaboliques du SMOP (Marsh et al., 2010, American Journal of Clinical Nutrition).",
comment:["repère un aliment sucré-raffiné de ta journée","remplace-le par un bon gras rassasiant","pain blanc du matin → avocat ou œuf + avocat","grignotage sucré → poignée d'amandes ou de noix","envie de dessert → 2 carrés de chocolat 85%"],
pieges:["croire que tous les gras se valent — fuis les fritures et gras trans","ajouter le gras SANS retirer le sucre — l'idée c'est l'échange","abuser des oléagineux — ils sont bons mais caloriques, une poignée suffit"],
plus:"les bons gras à privilégier : avocat, huile d'olive, oléagineux, poissons gras (saumon, sardine, maquereau), graines (chia, lin). ce sont aussi tes alliés anti-inflammatoires.",
observes:["aujourd'hui : tu es rassasiée plus longtemps","dans quelques jours : moins de fringales entre les repas","dans 2 semaines : ta peur du gras s'efface, remplacée par du bon sens"],
victoire:"tu viens de désactiver une croyance nutritionnelle qui t'a freinée pendant des années.",
outil:{emoji:"🍽️",label:"Explore les bons gras",desc:"cherche avocat, amandes, noix, chocolat",cible:"aliments",recherche:"avocat"}},
  {day:18,emoji:"🔥",theme:"deuxième séance de renforcement",
mission:"fais ta 2e séance : Rowing avec bouteilles 3×15, Élévations 3×15, Squat+press 3×12, Superman 3×15.",
msg:"deux séances. tu atteins le seuil qui fait la différence.\n\nce n'est plus un essai, c'est un rythme.",
pourquoi:"une séance par semaine, c'est bien. deux séances, c'est là que la magie opère. à ce rythme, les fenêtres d'amélioration de la sensibilité à l'insuline commencent à se chevaucher : ton corps reste 'amélioré' plus longtemps entre les séances.\n\naujourd'hui on travaille le haut du corps, qu'on néglige souvent. or le muscle, où qu'il soit, agrandit ta capacité à capter le glucose. plus tu construis de muscle réparti sur tout le corps, plus tu as de réservoirs pour gérer ta glycémie au repos.\n\ndeux séances hebdo de renforcement, c'est un des piliers les plus solides du SMOP métabolique sur le long terme.",
source:"l'entraînement en résistance améliore la sensibilité à l'insuline dans le SMOP (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["échauffe-toi 2-3 minutes","Rowing : penchée en avant, tire 2 bouteilles d'eau vers toi, 3×15","Élévations latérales : bras sur les côtés avec bouteilles, 3×15","Squat + press : squat puis pousse les bouteilles au-dessus de la tête, 3×12","Superman : allongée sur le ventre, soulève bras et jambes, 3×15"],
pieges:["négliger le haut du corps — il compte autant que les jambes","forcer sur une charge trop lourde — la technique d'abord","sauter cette 2e séance — c'est elle qui fait passer un cap"],
plus:"pas de bouteilles ? des packs de lait, des boîtes de conserve, ou même ton propre poids font l'affaire. l'important c'est de créer une résistance pour le muscle, pas d'avoir du matériel.",
observes:["après la séance : une fatigue saine du haut du corps","dans 2 semaines : une posture qui se redresse, plus de force","sur la durée : un métabolisme qui gère mieux le sucre en continu"],
victoire:"ce n'est plus un essai. c'est un rythme."},
  {day:19,emoji:"⚡",theme:"le zinc",
mission:"commence le zinc — 15 à 25mg avec un repas, jamais à jeun.",
msg:"un complément. trois mécanismes SMOP.\n\nc'est pour ça qu'il est prioritaire.\n\naujourd'hui il rejoint ton protocole.",
pourquoi:"le zinc est un minéral souvent bas chez les femmes SMOP, et il agit sur plusieurs fronts qui te concernent directement.\n\nun : il freine la 5-alpha-réductase, l'enzyme qui transforme la testostérone en DHT (la forme la plus agressive pour les cheveux et la peau). deux : il régule la production de sébum, donc il aide sur l'acné. trois : c'est un anti-inflammatoire.\n\ndes essais contrôlés ont montré que la supplémentation en zinc réduisait l'acné, l'hirsutisme et la chute de cheveux chez des femmes SMOP. c'est l'un des compléments les plus utiles quand tu as des symptômes liés aux androgènes.",
source:"un essai randomisé a montré que la supplémentation en zinc réduit significativement l'acné, l'hirsutisme, l'insuline à jeun et la testostérone chez les femmes SMOP (Jamilian et al., 2016, J Research Medical Sciences ; Maktabi et al., 2018).",
comment:["choisis du zinc bisglycinate ou picolinate (mieux absorbés)","15 à 25mg par jour","toujours avec un repas — à jeun ça donne la nausée","sois régulière, l'effet sur peau/cheveux prend 6 à 12 semaines","si tu en prends longtemps, espace ou ajoute un peu de cuivre (le zinc peut le faire baisser)"],
pieges:["prendre du zinc à jeun — nausées presque garanties","prendre de l'oxyde de zinc — mal absorbé","en prendre énormément longtemps sans cuivre — déséquilibre possible"],
plus:"le zinc se trouve aussi dans l'alimentation : huîtres, graines de courge, viande, légumineuses. la supplémentation est utile si tu as des symptômes androgéniques marqués (acné, pilosité, chute de cheveux).",
observes:["les premières semaines : rien de visible, c'est normal","vers 6-8 semaines : possible amélioration de la peau","vers 3 mois : effet sur l'acné et la chute de cheveux mieux visible"],
victoire:"protocole compléments en place : magnésium + inositol + zinc.",
outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"dosage, timing et délai pour ton profil",cible:"complements"}},
  {day:20,emoji:"👣",theme:"marche double",
mission:"marche 15 minutes après le déjeuner ET 15 minutes après le dîner aujourd'hui.",
msg:"vingt jours. ce n'est plus un effort.\n\nc'est ce que tu fais.\n\naujourd'hui on double la mise.",
pourquoi:"au Jour 5 tu as appris la marche après le dîner. aujourd'hui on l'étend au déjeuner.\n\npourquoi les deux ? parce que le déjeuner et le dîner sont les deux repas qui créent les pics glycémiques les plus importants de ta journée. marcher après chacun, c'est demander à tes muscles d'absorber le sucre aux deux moments les plus à risque — sans insuline supplémentaire.\n\nle résultat sur la journée entière : ton exposition à l'insuline baisse nettement. deux marches de 15 minutes, c'est plus puissant qu'une seule séance de sport, parce que c'est placé pile au bon moment, deux fois.",
source:"l'activité physique post-repas améliore la captation du glucose et la sensibilité à l'insuline (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["après le déjeuner, ne t'assois pas tout de suite","marche 15 minutes, à allure active","refais la même chose après le dîner","si tu travailles, une marche autour du bâtiment compte","les jours pressés, même 10 minutes valent mieux que rien"],
pieges:["attendre trop longtemps après le repas — c'est dans les 30 min que c'est le plus efficace","marcher trop mollement — il faut que les muscles travaillent un peu","croire qu'il faut absolument 15 min pile — 10 min bien placées comptent déjà"],
plus:"si tu ne peux marcher qu'une seule fois, privilégie le repas qui contient le plus de féculents. c'est là que la marche a le plus d'impact sur ton pic glycémique.",
observes:["aujourd'hui : tu te sens plus légère après les deux repas","dans une semaine : une énergie d'après-midi plus stable","dans 2 semaines : c'est devenu un automatisme, plus une corvée"],
victoire:"20 jours de cohérence. c'est ce que tu as construit."},
  {day:21,emoji:"📈",theme:"rendre visible ce qui a changé",
mission:"note ce qui a changé depuis le Jour 14 — traque les micro-victoires, même les plus discrètes.",
msg:"regarde déjà tout ce que tu comprends aujourd'hui\nque tu ne comprenais pas il y a 3 semaines.\n\naujourd'hui on rend visible l'invisible.",
pourquoi:"la troisième semaine est souvent celle où les premiers changements deviennent perceptibles. pas de façon spectaculaire — de façon subtile. une énergie plus stable dans l'après-midi. des fringales moins violentes. un réveil un peu plus clair.\n\nle problème, c'est que ces changements sont progressifs, donc on s'y habitue sans les remarquer. ton cerveau normalise vite. c'est pour ça qu'il faut les écrire : pour les rendre visibles à toi-même.\n\nnoter tes micro-victoires, ce n'est pas de l'optimisme forcé. c'est de la donnée. c'est la preuve concrète que ton corps répond.",
source:"l'amélioration des marqueurs métaboliques dans le SMOP est progressive et précède les changements cliniques majeurs (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["relis tes bilans des Jours 7 et 14","note tout ce qui a bougé depuis 3 semaines","énergie, sommeil, fringales, digestion, humeur, peau","même un mieux léger compte — écris-le","garde tout dans l'onglet Journal"],
pieges:["attendre un changement spectaculaire — la vraie progression est discrète","oublier les changements non physiques (humeur, clarté mentale)","comparer ta vitesse à celle des autres — chaque corps a son rythme"],
plus:"prends une photo ou note tes mensurations si tu veux un repère objectif. mais souviens-toi : à 3 semaines, le plus grand changement est souvent dans ta tête et ton énergie, pas dans le miroir.",
observes:["aujourd'hui : tu vois noir sur blanc ce qui a changé","dans une semaine (J30) : le bilan final, encore plus parlant","sur les mois suivants : les changements physiques s'installent"],
victoire:"la progression se mesure en compréhension autant qu'en symptômes."},
  {day:22,emoji:"🔬",theme:"relire tes analyses",
mission:"si tu as des analyses récentes, ouvre le Traducteur dans l'app et relis-les avec un œil neuf.",
msg:"tu n'as plus besoin d'attendre qu'on t'explique.\n\ntu lis ton propre corps.\n\naujourd'hui tu deviens actrice de tes résultats.",
pourquoi:"il y a une nuance que peu de patientes connaissent : les normes de laboratoire ne sont pas les normes optimales. les normes de labo définissent ce qui est 'pathologique', pas ce qui est 'idéal'.\n\nrésultat : ton insuline à jeun peut être affichée comme 'dans les normes' alors qu'elle est déjà trop haute pour un fonctionnement optimal. c'est exactement pour ça que tant de Cysters s'entendent dire 'tout va bien' alors qu'elles se sentent mal. les valeurs sont 'normales' au sens du labo, mais pas fonctionnelles.\n\nsavoir lire la différence entre 'normal' et 'optimal', c'est arrêter de douter de ton ressenti. ton corps ne ment pas.",
source:"la résistance à l'insuline est sous-diagnostiquée dans le SMOP car les normes de laboratoire ne reflètent pas toujours l'optimal fonctionnel (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["récupère tes analyses (insuline à jeun, glycémie, HOMA-IR…)","ouvre l'onglet Analyses → Traducteur","entre tes valeurs pour les comprendre en langage clair","repère l'écart entre 'normal labo' et 'optimal'","note tes questions pour ton médecin"],
pieges:["paniquer devant un chiffre hors norme — l'app t'aide à le mettre en contexte","prendre les normes de labo pour des objectifs de santé — ce n'est pas pareil","te passer de ton médecin — l'app éclaire, elle ne remplace pas un avis médical"],
plus:"si tu n'as pas encore d'analyses, ce n'est pas grave : le Jour 15 t'a préparée à les demander. reviens à cette mission quand tu les auras. comprendre ses propres analyses, c'est une compétence que tu gardes à vie.",
observes:["aujourd'hui : tu comprends tes chiffres sans angoisse","à ton prochain bilan : tu suis ton évolution toi-même","sur la durée : tu dialogues d'égale à égale avec les soignants"],
victoire:"relire ses analyses sans panique — c'est une des plus grandes victoires du protocole.",
outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"pour soutenir l'amélioration de tes marqueurs",cible:"complements"}},
  {day:23,emoji:"☀️",theme:"vitamine D",
mission:"commence la vitamine D3 + K2 — 2000 à 4000 UI avec un repas contenant des graisses.",
msg:"quatre compléments en place.\nmagnésium · inositol · zinc · vitamine D.\n\naujourd'hui on complète les fondations.",
pourquoi:"la carence en vitamine D est extrêmement fréquente chez les femmes SMOP, et ce n'est pas anodin : des récepteurs à la vitamine D sont présents un peu partout, y compris sur les cellules qui gèrent l'insuline.\n\ndes études ont montré qu'une supplémentation en vitamine D, surtout en co-supplémentation et à dose régulière, peut améliorer la sensibilité à l'insuline (baisse du HOMA-IR) et, à dose plus élevée, réduire la testostérone et l'hirsutisme.\n\npourquoi D3 + K2 ensemble ? parce que la K2 dirige le calcium vers les os plutôt que vers les artères. les deux se complètent. ne prends jamais de la D seule à dose élevée sur le long terme.",
source:"une méta-analyse de RCT a montré que la vitamine D (faible dose continue ou en co-supplément) améliore la sensibilité à l'insuline dans le SMOP ; à 4000 UI elle réduit la testostérone et l'hirsutisme (revue 2018, PMC6266903 ; RCT PMC5748731).",
comment:["choisis une vitamine D3 associée à la K2","2000 à 4000 UI par jour","prends-la avec un repas contenant des graisses (elle est liposoluble)","idéalement le matin ou le midi","fais doser ta vitamine D au moins une fois pour ajuster"],
pieges:["prendre de la D à jeun ou sans gras — mal absorbée","prendre de la D seule à haute dose longtemps sans K2","dépasser les doses sans contrôle sanguin — la D s'accumule"],
plus:"l'idéal est de connaître ton taux sanguin de vitamine D avant de doser (c'est une des analyses du Jour 15). en France, une grande partie de la population est carencée, surtout d'octobre à avril.",
observes:["les premières semaines : rien de visible (la D travaille en fond)","dans 2-3 mois : possible amélioration de l'énergie et de l'humeur","au prochain dosage : un taux qui remonte vers l'optimal"],
victoire:"tu construis des fondations que tu porteras longtemps après ces 30 jours.",
outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"dosage, timing et délai pour ton profil",cible:"complements"}},
  {day:24,emoji:"💥",theme:"troisième séance",
mission:"refais ta séance de renforcement (comme au Jour 18) — tu en es à 3 séances cette semaine.",
msg:"trois séances. tu atteins la fréquence optimale.\n\naujourd'hui tu passes un cap réservé à peu de monde.",
pourquoi:"à trois séances de renforcement par semaine, quelque chose de spécial se produit : l'amélioration de ta sensibilité à l'insuline devient quasi continue. les effets de chaque séance se chevauchent, ton corps reste 'optimisé' en permanence.\n\net il y a un bonus que peu de gens connaissent : pendant l'exercice, tes muscles sécrètent des myokines — des molécules anti-inflammatoires. comme l'inflammation de fond fait partie du tableau du SMOP, c'est un effet doublement utile.\n\ntrois séances hebdo, ce n'est pas réservé aux athlètes. c'est la fréquence où le renforcement devient un vrai traitement de fond pour ton métabolisme.",
source:"l'entraînement en résistance régulier améliore durablement la sensibilité à l'insuline et réduit l'inflammation dans le SMOP (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["reprends le programme du Jour 18","échauffe-toi avant de commencer","respecte les temps de repos entre les séries","reste à l'écoute de ton corps (la fatigue normale ≠ douleur)","note ta séance dans le Journal pour suivre ta régularité"],
pieges:["enchaîner sans aucun jour de repos — le muscle se construit au repos","vouloir progresser trop vite en charge — la régularité prime","culpabiliser si tu n'as fait que 2 séances — 2 c'est déjà excellent"],
plus:"si 3 séances te paraît trop, garde 2 séances : c'est déjà très efficace. l'objectif n'est pas la performance, c'est la régularité sur les mois et les années à venir.",
observes:["cette semaine : une force qui progresse nettement","dans un mois : des gestes du quotidien plus faciles","sur la durée : un métabolisme transformé en profondeur"],
victoire:"trois séances. c'est là où l'impact devient durable."},
  {day:25,emoji:"🌅",theme:"ancrer l'habitude",
mission:"engage-toi sur 5 petits-déjeuners protéinés consécutifs — jusqu'à ce que ça devienne automatique.",
msg:"la différence entre 'j'essaie de changer' et\n'c'est comme ça que je mange' — tu y es.\n\naujourd'hui on grave l'habitude.",
pourquoi:"une habitude ne se crée pas par la volonté — elle se crée par la répétition. les recherches montrent qu'un comportement s'automatise généralement entre 21 et 66 jours de répétition régulière.\n\nce qui se passe dans ton cerveau : chaque fois que tu refais le même geste, tu renforces un circuit neuronal. au début ça demande un effort conscient. puis, à force, le circuit devient automatique — tu le fais sans y penser. c'est de la neuroplasticité, pas de la discipline.\n\nle petit-déjeuner protéiné est le geste parfait à ancrer : il donne le ton de toute ta journée glycémique. quand il devient automatique, c'est toute ta journée qui se stabilise sans effort.",
source:"l'alimentation à charge glycémique basse, ancrée dans la durée, améliore les marqueurs du SMOP (Marsh et al., 2010, American Journal of Clinical Nutrition).",
comment:["prévois tes 5 petits-déjeuners protéinés à l'avance","prépare ce qu'il faut la veille pour ne pas improviser","varie : œufs, skyr, fromage blanc + oléagineux, restes","coche chaque matin réussi dans le Journal","ne vise pas la perfection, vise la répétition"],
pieges:["vouloir tout changer d'un coup — un seul geste ancré vaut mieux que dix tentés","abandonner après un matin raté — reprends le lendemain sans culpabiliser","compter sur la motivation — c'est la routine qui gagne, pas l'envie"],
plus:"l'astuce des habitudes durables : associe ton nouveau geste à un geste déjà automatique (ton café, par exemple). 'après mon café, je prends mes protéines'. l'ancien geste devient le déclencheur du nouveau.",
observes:["dès cette semaine : le petit-déjeuner demande moins d'effort mental","dans 2 semaines : tu le fais sans y penser","dans quelques mois : c'est devenu une partie de qui tu es"],
victoire:"ce n'est plus un effort. c'est une identité.",
outil:{emoji:"🌅",label:"Pioche dans les idées de petits-déjeuners",desc:"varie tes petits-déj pour ne pas te lasser",cible:"repas",moment:"matin"}},
  {day:26,emoji:"📁",theme:"prendre rendez-vous",
mission:"prends rendez-vous chez ton médecin, avec ton dossier préparé au Jour 15.",
msg:"tu n'attends plus que quelqu'un te sauve.\n\ntu collabores. c'est différent.\n\naujourd'hui tu passes à l'action.",
pourquoi:"tu n'es plus la même patiente qu'il y a 26 jours. tu entres maintenant dans ce cabinet avec une compréhension réelle de ton propre corps, de ton profil, de tes mécanismes.\n\ntu sais quelles analyses demander (insuline à jeun, HOMA-IR, testostérone libre, SHBG, vitamine D). tu sais reconnaître quand on te dit 'tout est normal' alors que tes valeurs ne sont pas optimales. et tu sais comment formuler tes demandes sans te sentir illégitime.\n\nça change la nature même du rendez-vous : tu ne quémandes plus, tu collabores. et un médecin face à une patiente structurée et informée travaille différemment avec toi.",
source:"une évaluation de la résistance à l'insuline (HOMA-IR) est recommandée dans le bilan du SMOP (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["prends le rendez-vous (généraliste, gynéco ou endocrino)","rassemble ton dossier préparé au Jour 15","apporte tes analyses si tu en as","utilise les scripts de l'onglet Médecin si tu bloques","note tes 3 priorités à aborder en premier"],
pieges:["repousser indéfiniment le rendez-vous — la préparation ne sert que si tu y vas","arriver sans dossier — tu perds le bénéfice de ta préparation","te laisser décourager par un premier refus — tu peux demander un autre avis"],
plus:"si ton médecin actuel ne t'écoute pas malgré ta préparation, c'est une information : tu as le droit d'en chercher un autre, plus à l'aise avec le SMOP. l'onglet Médecin peut t'aider à trouver les bons mots ou un document à transmettre.",
observes:["aujourd'hui : tu reprends la main sur ton parcours de soin","au rendez-vous : un échange plus utile et plus respectueux","après : des décisions prises avec toi, pas à ta place"],
victoire:"transformer une consultation en collaboration — c'est énorme."},
  {day:27,emoji:"🎯",theme:"bilan honnête",
mission:"identifie l'obstacle principal de ces 4 semaines — sans jugement, juste avec lucidité.",
msg:"tu ne fais pas le bilan pour te juger.\n\ntu le fais pour ne plus jamais repartir de zéro.\n\naujourd'hui on regarde la vérité en face, avec douceur.",
pourquoi:"voici ce que des milliers de parcours montrent : l'obstacle numéro un n'est presque jamais le manque de volonté. c'est la praticité. manger protéiné quand on déjeune dehors. trouver 20 minutes pour le renforcement. préparer le petit-déjeuner quand on court le matin.\n\nc'est important de le savoir, parce que si tu crois que ton obstacle c'est 'je manque de volonté', tu te juges. alors que si tu identifies que c'est 'je n'ai pas de solution protéinée pour mes déjeuners au travail', là tu peux résoudre le vrai problème.\n\nnommer ton obstacle réel et concret, sans te flageller, c'est la condition pour ne plus jamais repartir de zéro.",
source:"l'adhésion aux changements de mode de vie est le facteur déterminant des résultats dans le SMOP (Marsh et al., 2010, American Journal of Clinical Nutrition).",
comment:["repense aux 4 semaines : où ça a coincé le plus ?","sois précise : quel geste, dans quel contexte ?","ne dis pas 'je manque de volonté' — cherche le vrai blocage pratique","écris l'obstacle ET une solution concrète possible","note tout dans le Journal"],
pieges:["te juger au lieu d'analyser — la culpabilité ne résout rien","rester vague ('je n'y arrive pas') — précise le contexte exact","ignorer l'obstacle en espérant qu'il disparaisse seul"],
plus:"pour chaque obstacle, demande-toi : 'qu'est-ce qui rendrait ce geste plus facile ?'. souvent la solution est logistique (préparer la veille, avoir un stock d'amandes au bureau) — pas une question de caractère.",
observes:["aujourd'hui : tu vois clairement ce qui te freine","dans les semaines à venir : tu attaques le vrai problème","sur la durée : tu construis un système qui te ressemble"],
victoire:"nommer ses obstacles honnêtement — c'est déjà les réduire."},
  {day:28,emoji:"⚡",theme:"tout ensemble",
mission:"combine aujourd'hui tout ce que tu as appris : une séance de renforcement + une marche après le dîner + tes tisanes.",
msg:"tu n'es plus en train d'essayer de te soigner.\n\ntu sais comment prendre soin de toi.\n\naujourd'hui tout converge.",
pourquoi:"jusqu'ici tu as appris chaque levier séparément. aujourd'hui on les empile, parce que c'est là que la vraie puissance apparaît.\n\nle renforcement améliore ta sensibilité à l'insuline pendant 24 à 48h. la marche après le repas amplifie l'effet immédiatement, au moment du pic. et les tisanes agissent en couches de fond, en continu. quand tu combines les trois sur une même journée, leurs effets ne s'additionnent pas seulement — ils se renforcent mutuellement.\n\nc'est tout l'inverse de la pilule unique qu'on cherche souvent. ton SMOP répond à un système cohérent de petits gestes, pas à un seul geste héroïque.",
source:"l'approche multimodale (alimentation, activité, mode de vie) est la plus efficace pour améliorer les marqueurs du SMOP (Marsh et al., 2010 ; Diamanti-Kandarakis & Dunaif, 2012).",
comment:["planifie ta journée pour caler les 3 leviers","fais ta séance de renforcement quand ça t'arrange","marche 15 min après ton dîner","prends tes tisanes aux moments dédiés","savoure le fait que tout ça est maintenant naturel pour toi"],
pieges:["te mettre la pression pour une journée 'parfaite' — fais de ton mieux","oublier que c'est la régularité, pas une journée isolée, qui compte","te décourager si tout ne s'enchaîne pas parfaitement"],
plus:"cette journée 'tout-en-un' n'a pas vocation à être tous les jours. c'est un aperçu de ce que ton corps reçoit quand les leviers s'alignent. certains jours tu feras tout, d'autres un seul — et c'est très bien.",
observes:["ce soir : un sentiment d'accomplissement et de cohérence","dans les semaines suivantes : ces gestes s'assemblent sans effort","sur la durée : un système de soin de toi qui tient tout seul"],
victoire:"les deux leviers ensemble. c'est ton jour le plus puissant."},
  {day:29,emoji:"📊",theme:"mesurer le chemin parcouru",
mission:"compare tes symptômes d'aujourd'hui avec ceux que tu avais au Jour 1 — point par point.",
msg:"les améliorations sont souvent plus grandes\nqu'on ne les perçoit de l'intérieur.\n\naujourd'hui on mesure tout le chemin.",
pourquoi:"après presque 30 jours, ton corps n'est plus dans le même état qu'au départ. ton insuline à jeun a probablement baissé. tes ovaires reçoivent un signal androgénique réduit. ton foie est mieux soutenu, ton sommeil et tes compléments travaillent en fond, et tes tisanes agissent depuis des semaines.\n\nmais voici le piège du cerveau : il normalise les améliorations au fur et à mesure. tu t'habitues à avoir plus d'énergie, moins de fringales — au point d'oublier d'où tu es partie. c'est pour ça que la comparaison directe avec le Jour 1 est si puissante.\n\nquand tu mets côte à côte ton état d'il y a un mois et celui d'aujourd'hui, tu vois enfin l'ampleur réelle du changement.",
source:"l'amélioration des marqueurs métaboliques et hormonaux du SMOP par le mode de vie est mesurable sur quelques semaines à mois (Marsh et al., 2010 ; Diamanti-Kandarakis & Dunaif, 2012).",
comment:["ressors ton tout premier bilan (Jour 1, score de brouillard)","liste tes symptômes d'il y a un mois","liste tes symptômes d'aujourd'hui","compare point par point, honnêtement","célèbre chaque ligne qui a bougé dans le bon sens"],
pieges:["minimiser les progrès ('c'est normal maintenant') — non, c'est un acquis","attendre que TOUT soit réglé — certains changements prennent des mois","oublier les changements non-physiques (confiance, compréhension, énergie)"],
plus:"si certains symptômes physiques (peau, pilosité, cycles) n'ont pas encore bougé, c'est normal : ils demandent souvent 2 à 6 mois. ce que tu as construit en 30 jours, ce sont les fondations qui les feront évoluer ensuite.",
observes:["aujourd'hui : tu vois l'ampleur réelle de ta progression","dans 2-3 mois : les changements physiques s'affirment","sur le long terme : un terrain hormonal transformé"],
victoire:"tu n'es plus la même femme qu'au Jour 1."},
  {day:30,emoji:"🌸",theme:"ce que tu emmènes",
mission:"écris deux choses aujourd'hui : ce que tu emmènes de ces 30 jours, et ce que tu laisses derrière toi.",
msg:"tu avances peut-être plus lentement que tu le voudrais.\n\nmais tu avances.\n\net c'est tout ce qui compte.\n\nKamila 🌿",
pourquoi:"en 30 jours, tu n'as pas suivi un régime. tu as construit un système. une alimentation qui soutient ton insuline au lieu de l'affoler. un foie mieux soutenu. du muscle qui gère ta glycémie en continu. un protocole de compléments adapté à ton profil. des tisanes qui agissent en couches. et surtout : des mots pour parler à ton médecin, et une compréhension de ton propre corps que personne ne pourra plus t'enlever.\n\nle SMOP est chronique — aucun programme ne le 'guérit', et méfie-toi de quiconque te le promet. mais ce que tu as appris ici, tu le gardes à vie. tu sais maintenant comment soutenir ton corps, jour après jour.\n\nces 30 jours ne sont pas une ligne d'arrivée. c'est ta nouvelle base de départ.",
source:"le SMOP est une condition chronique qui se gère par le mode de vie sur le long terme, sans guérison définitive (Marsh et al., 2010 ; Diamanti-Kandarakis & Dunaif, 2012).",
comment:["prends un moment au calme pour cet exercice","écris ce que tu emmènes : les gestes, les compréhensions, les habitudes","écris ce que tu laisses : la culpabilité, les fausses croyances, l'attente passive","relis tes bilans des Jours 7, 14, 21, 29","choisis 2 ou 3 gestes que tu veux garder pour toujours"],
pieges:["voir le Jour 30 comme une fin — c'est un nouveau départ","tout vouloir garder d'un coup — choisis tes 2-3 piliers","oublier de célébrer le chemin — tu l'as fait, c'est énorme"],
plus:"les Cysters qui transforment durablement leur SMOP ne sont pas celles qui ont été parfaites pendant 30 jours. ce sont celles qui ont gardé 2 ou 3 gestes pour la vie. choisis les tiens aujourd'hui — ceux qui te ressemblent et que tu peux tenir.",
observes:["aujourd'hui : tu mesures tout ce que tu as construit","dans les mois à venir : les gestes ancrés portent leurs fruits","sur la durée : un rapport à ton corps transformé pour de bon"],
victoire:"ce ne sont pas 30 jours terminés. c'est une baseline."},
];

const VOCAUX = [
  {id:"bienvenue",titre:"Bienvenue Cyster",when:"J0",unlockDay:1,desc:"Le message de départ",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262265/Nouvel_enregistrement_2_dzgugj.mp3"},
  {id:"miParcours",titre:"Mi-parcours",when:"J14",unlockDay:14,desc:"Pour la deuxième moitié",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262394/Nouvel_enregistrement_3_oktybp.mp3"},
  {id:"difficile",titre:"Pour les jours difficiles",when:"SOS",unlockDay:1,desc:"Quand c'est dur",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262416/Nouvel_enregistrement_4_ngzb7h.mp3"},
  {id:"rdv",titre:"Avant ton rendez-vous",when:"RDV",unlockDay:1,desc:"Pour entrer préparée",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262416/Nouvel_enregistrement_5_zyqlh5.mp3"},
  {id:"fin",titre:"30 jours — La fin",when:"J30",unlockDay:30,desc:"Ce que tu as construit",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262415/Nouvel_enregistrement_6_t0wubb.mp3"},
];

const GPS_DATA = [
  {s:"Je suis épuisée",a:["Ferritine","Vitamine D","TSH + T3 libre","Insuline à jeun","Cortisol matinal 8h"]},
  {s:"Je n'arrive pas à perdre du poids",a:["Insuline à jeun","HOMA-IR","HGPO (75g sur 2h)","Glycémie à jeun","Testostérone libre","SHBG"]},
  {s:"J'ai de l'acné hormonale",a:["Testostérone libre","DHEAS","SHBG","LH/FSH","Insuline à jeun"]},
  {s:"Mes cheveux tombent",a:["Ferritine","Testostérone libre","DHT","TSH + T3 libre","Zinc"]},
  {s:"Mes cycles sont longs ou absents",a:["LH/FSH","AMH","Progestérone J21","Prolactine","Estradiol J3"]},
  {s:"J'ai du brouillard mental",a:["Vitamine D","Ferritine","TSH + T3 libre","CRP ultra-sensible","Vitamine B12"]},
  {s:"J'ai des fringales incontrôlables",a:["Insuline à jeun","HOMA-IR","HGPO","HbA1c","Magnésium"]},
  {s:"Mes analyses sont normales mais je souffre",a:["Insuline à jeun (≠ glycémie)","HGPO (75g sur 2h)","CRP ultra-sensible","Testostérone libre + SHBG","T3 libre (≠ TSH seule)"]},
];

const SCRIPTS = [
  {t:"Insuline + HOMA-IR",s:"j'ai un SOPK avec des symptômes d'insulinorésistance — fringales, fatigue après les repas. est-ce qu'on peut ajouter l'insuline à jeun pour calculer le HOMA-IR ?",r:"est-ce que je peux le faire sans ordonnance pour avoir une mesure de départ ?"},
  {t:"HGPO — le test oublié",s:"j'aimerais faire une HGPO — hyperglycémie provoquée par voie orale. ma glycémie à jeun est normale mais j'ai tous les symptômes d'une insulinorésistance.",r:"c'est le test qui révèle ce que la glycémie à jeun seule ne voit pas encore."},
  {t:"Testostérone libre + SHBG",s:"j'aimerais la testostérone libre et la SHBG avec la testostérone totale. la SHBG basse peut révéler un excès d'androgènes actifs même avec une totale normale.",r:"la totale seule peut être trompeuse pour mon profil."},
  {t:"DHEAS — androgènes surrénaliens",s:"j'aimerais qu'on dose la DHEAS. je veux comprendre si mes androgènes viennent des ovaires ou des surrénales — ce n'est pas le même traitement.",r:"c'est une distinction importante pour mon profil spécifique."},
  {t:"CRP ultra-sensible",s:"une CRP ultra-sensible plutôt que standard pour évaluer une inflammation chronique de bas grade.",r:"la différence entre les deux est importante pour mon profil."},
];

const MARKERS = [
  {id:"insuline",label:"Insuline à jeun",unit:"µUI/mL",ph:"ex: 12"},
  {id:"glycemie",label:"Glycémie à jeun",unit:"mmol/L",ph:"ex: 5.2"},
  {id:"tsh",label:"TSH",unit:"µUI/mL",ph:"ex: 2.1"},
  {id:"vitD",label:"Vitamine D",unit:"ng/mL",ph:"ex: 22"},
  {id:"testoLibre",label:"Testostérone libre",unit:"pg/mL",ph:"ex: 1.3"},
  {id:"shbg",label:"SHBG",unit:"nmol/L",ph:"ex: 35"},
  {id:"ferritine",label:"Ferritine",unit:"µg/L",ph:"ex: 18"},
  {id:"amh",label:"AMH",unit:"ng/mL",ph:"ex: 7.6"},
  {id:"dheas",label:"DHEAS",unit:"µg/dL",ph:"ex: 180"},
  {id:"crp",label:"CRP ultra-sensible",unit:"mg/L",ph:"ex: 2.3"},
];

const VICTORIES_LIST = [
  "j'ai compris quelque chose sur mon corps","j'ai mieux dormi au moins une nuit",
  "j'ai moins culpabilisé","j'ai bougé différemment","j'ai pris un rendez-vous",
  "j'ai dit non à quelque chose qui ne me faisait pas de bien",
  "j'ai remarqué une amélioration même petite","j'ai été constante",
  "j'ai pris soin de moi autrement","j'ai parlé de mon SOPK",
];

const callAPI = async (prompt) => {
  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})
  });
  const d = await r.json();
  return d.content?.[0]?.text||"";
};

// ─── APP PRINCIPALE ──────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState(() => load("screen","name"));
  const [prenom, setPrenom] = useState(() => load("prenom",""));
  const [profil, setProfil] = useState(() => load("profil","metabolique"));
  const [tab, setTab] = useState("kamila");
  const [day, setDay] = useState(() => load("day",1));
  const [checked, setChecked] = useState(() => load("checked",{}));
  const [victories, setVictories] = useState(() => load("victories",{}));
  const [notes, setNotes] = useState(() => load("notes",{}));
  const [symptoms, setSymptoms] = useState(() => load("symptoms",{}));
  const [markers, setMarkers] = useState(() => load("markers",{}));
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [transErr, setTransErr] = useState(null);
  const [gpsOpen, setGpsOpen] = useState(null);
  const [copyOk, setCopyOk] = useState(null);
  const [sosOpen, setSosOpen] = useState(null);
  const [sosTab, setSosTab] = useState(null);
  const [criseMode, setCriseMode] = useState(false);
  const [modePrio, setModePrio] = useState(false);
  const [prenomInput, setPrenomInput] = useState("");
  const [foodSearch, setFoodSearch] = useState("");
  const [outilOpen, setOutilOpen] = useState("aliments");
  const [repasMoment, setRepasMoment] = useState("matin");
  const inputRef = useRef(null);

  const pc = C.profils[profil];

  useEffect(()=>{
    const s=document.createElement("style");
    s.innerHTML=`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}@keyframes breathe{0%,100%{opacity:1;}50%{opacity:0.92;}}.fu{animation:fadeUp 0.35s ease forwards;}.breathe{animation:breathe 5s ease-in-out infinite;}input:focus,textarea:focus{outline:none;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#E8DDD3;border-radius:99px;}`;
    document.head.appendChild(s);
    return()=>document.head.removeChild(s);
  },[]);

  useEffect(()=>{ save("screen",screen); },[screen]);
  useEffect(()=>{ save("prenom",prenom); },[prenom]);
  useEffect(()=>{ save("profil",profil); },[profil]);
  useEffect(()=>{ save("day",day); },[day]);
  useEffect(()=>{ window.scrollTo({top:0,behavior:"smooth"}); }, [day, tab]);
  useEffect(()=>{ save("checked",checked); },[checked]);
  useEffect(()=>{ save("victories",victories); },[victories]);
  useEffect(()=>{ save("notes",notes); },[notes]);
  useEffect(()=>{ save("symptoms",symptoms); },[symptoms]);
  useEffect(()=>{ save("markers",markers); },[markers]);

  const completedCount = Object.values(checked).filter(Boolean).length;
  const baseScore = 76;
  const score = Math.max(8, baseScore - completedCount * 1.5);
  const week = Math.ceil(day/7);
  const weekWins = victories[week]||[];
  const todayData = MISSIONS_META[day-1]||MISSIONS_META[0];

  const translate = async () => {
    const filled = Object.entries(markers).filter(([,v])=>v&&v.trim());
    if(!filled.length) return;
    setTranslating(true); setTranslation(null); setTransErr(null);
    const lines = filled.map(([k,v])=>{const m=MARKERS.find(x=>x.id===k);return`${m?.label||k}: ${v} ${m?.unit||""}`;}).join("\n");
    try {
      const res = await callAPI(`Tu es Kamila, fondatrice de SOPK Life. Grande sœur. Voix orale directe. Ton : proche, "Cyster".\n\nAnalyses de ${prenom||"cette Cyster"} :\n${lines}\n\nRéponds en 4 parties séparées par une ligne vide :\n\nCE QUE ÇA DIT EN LANGAGE HUMAIN\nChaque valeur avec normes fonctionnelles (insuline idéal < 8 µUI/mL, vitamine D idéal > 40 ng/mL, SHBG idéal > 60 nmol/L). Direct. Pas de jargon.\n\nCE QUI MÉRITE TON ATTENTION MAINTENANT\nMax 3 priorités concrètes.\n\nCE QUI EST RASSURANT\nCe qui est dans des zones satisfaisantes.\n\nLES QUESTIONS À POSER À TON MÉDECIN\n2-3 formulations exactes. Inclus HGPO si insuline ou glycémie limites.`);
      setTranslation(res);
    } catch(e) { setTransErr("réessaie dans quelques secondes Cyster 🌿"); }
    setTranslating(false);
  };

  const ScoreRing = ({s,size=56,stroke=4}) => {
    const r=(size-stroke)/2,circ=2*Math.PI*r,dash=((100-s)/100)*circ;
    return(
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 1s ease"}}/>
      </svg>
    );
  };

  const TABS=[{id:"kamila",icon:"🌿",label:"Kamila"},{id:"sos",icon:"⚡",label:"SOS"},{id:"outils",icon:"🧰",label:"Outils"},{id:"analyses",icon:"🔬",label:"Analyses"},{id:"medecin",icon:"👩‍⚕️",label:"Médecin"},{id:"journal",icon:"📒",label:"Journal"}];

  // ── ÉCRAN NOM ──────────────────────────────────────────────────────────────
  if(screen==="name") return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:"2rem 1.5rem"}}>
      <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"2rem",color:C.brown,marginBottom:8}}>Bienvenue</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1rem",color:C.light,fontStyle:"italic"}}>Revenir à soi.</div>
      </div>
      <div style={{background:C.white,borderRadius:24,padding:"2rem",boxShadow:"0 8px 32px rgba(61,43,31,0.08)"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",color:C.brown,marginBottom:6,textAlign:"center"}}>Comment tu t'appelles ?</div>
        <div style={{fontSize:12,color:C.light,textAlign:"center",marginBottom:20,lineHeight:1.5}}>pour que tout soit vraiment personnalisé pour toi</div>
        <input
          ref={inputRef}
          type="text" placeholder="Ton prénom…"
          value={prenomInput}
          onChange={e=>setPrenomInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&prenomInput.trim()&&(setPrenom(prenomInput.trim()),setScreen("profil-select"))}
          style={{width:"100%",padding:"14px 16px",border:`2px solid ${C.border}`,borderRadius:14,fontFamily:"inherit",fontSize:16,color:C.brown,background:C.cream,textAlign:"center",transition:"border-color 0.2s"}}
          autoFocus
        />
        <button
          onClick={()=>prenomInput.trim()&&(setPrenom(prenomInput.trim()),setScreen("profil-select"))}
          style={{width:"100%",background:prenomInput.trim()?pc.p:C.border,border:"none",padding:"14px",borderRadius:14,color:"white",fontFamily:"inherit",fontSize:15,fontWeight:600,cursor:prenomInput.trim()?"pointer":"not-allowed",marginTop:12,transition:"background 0.2s"}}>
          Commencer mon Protocole →
        </button>
      </div>
      <div style={{textAlign:"center",marginTop:16,fontSize:11,color:C.light,lineHeight:1.6}}>
        Protocole SOPK Life · Profil Métabolique
      </div>
    </div>
  );

  // ── SÉLECTION DU PROFIL (temporaire — pour tests) ──────────────────────────
  if(screen==="profil-select") return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:430,margin:"0 auto",padding:"2rem 1.5rem"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.6rem",color:C.brown,marginBottom:8}}>
          {prenom}, quel est ton profil ?
        </div>
        <div style={{fontSize:12,color:C.light,lineHeight:1.5}}>
          ton profil a été déterminé par le Décodeur.<br/>sélectionne-le pour personnaliser ton protocole.
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {Object.entries(C.profils).map(([key,p])=>(
          <button key={key}
            onClick={()=>{setProfil(key);setScreen("priorites");}}
            style={{display:"flex",alignItems:"center",gap:14,padding:"16px",border:`2px solid ${C.border}`,borderRadius:16,background:C.white,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.2s"}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:`${p.p}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{p.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:C.brown}}>{p.label}</div>
              <div style={{fontSize:11,color:C.light,marginTop:2}}>
                {key==="metabolique"&&"insuline · glycémie · fringales"}
                {key==="androgenique"&&"acné · pilosité · chute de cheveux"}
                {key==="inflammatoire"&&"fatigue · douleurs · brouillard"}
                {key==="mixte_ma"&&"métabolique + androgénique"}
                {key==="mixte_mi"&&"métabolique + inflammatoire"}
                {key==="mixte_ai"&&"androgénique + inflammatoire"}
              </div>
            </div>
            <div style={{fontSize:18,color:p.p}}>→</div>
          </button>
        ))}
      </div>

      <div style={{textAlign:"center",marginTop:20,fontSize:10,color:C.light,fontStyle:"italic",lineHeight:1.5}}>
        dans la version finale, ce profil sera transmis<br/>automatiquement depuis le Décodeur
      </div>
    </div>
  );

  // ── CENTRE DE PRIORITÉS J0 ─────────────────────────────────────────────────
  if(screen==="priorites"||modePrio) return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:430,margin:"0 auto"}}>
      <div style={{background:`linear-gradient(135deg,${pc.p},#9A6040)`,padding:"2rem 1.5rem",color:"white"}}>
        <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",opacity:.7,marginBottom:6}}>Protocole SOPK Life · Avant de commencer</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.8rem",marginBottom:6}}>
          {prenom}, tes 3 batailles.
        </div>
        <div style={{fontSize:13,opacity:.85,lineHeight:1.6}}>
          tu as beaucoup de symptômes.<br/>tu n'as pas beaucoup de priorités.
        </div>
      </div>
      <div style={{padding:"1.5rem"}}>

        {/* ── PROFIL HIÉRARCHIQUE ── */}
        {(()=>{const h=PROFIL_HIERARCHIE[profil];if(!h)return null;return(
          <div style={{background:C.white,borderRadius:16,padding:"14px",marginBottom:14,border:`1.5px solid ${C.border}`}}>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.light,marginBottom:10}}>Ton profil SOPK</div>
            {[
              {niveau:"DOMINANT",data:h.dominant,size:14,bold:true},
              {niveau:"SECONDAIRE",data:h.secondaire,size:12,bold:false},
              {niveau:"TRACE",data:h.trace,size:11,bold:false,opacity:0.7},
            ].map((row,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<2?`1px solid ${C.border}`:"none",opacity:row.opacity||1}}>
                <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.light,width:70,flexShrink:0}}>{row.niveau}</div>
                <div style={{width:28,height:28,borderRadius:"50%",background:`${row.data.col}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{row.data.em}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:row.size,fontWeight:row.bold?700:500,color:C.brown}}>{row.data.label}</div>
                  <div style={{fontSize:9,color:C.light}}>{row.data.desc}</div>
                </div>
                {i===0&&<div style={{background:`${row.data.col}20`,border:`1px solid ${row.data.col}`,borderRadius:99,padding:"2px 8px",fontSize:8,color:row.data.col}}>prioritaire</div>}
              </div>
            ))}
          </div>
        )})()}

        <div style={{background:C.bubble,borderRadius:16,padding:"12px 14px",marginBottom:16,border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:C.brown,lineHeight:1.7,fontStyle:"italic"}}>
            "j'ai construit ce protocole parce que j'aurais eu besoin de quelque chose comme ça quand j'ai reçu mon diagnostic. voilà par où commencer. dans l'ordre qui a du sens biologiquement."
          </div>
          <div style={{fontSize:10,color:C.light,marginTop:6}}>— Kamila 🌿</div>
        </div>

        {(PRIORITES_PROFIL[profil]||PRIORITES_PROFIL.metabolique).map((p,i)=>(
          <div key={i} style={{border:`1.5px solid ${i===0?p.col:C.border}`,borderRadius:16,padding:"14px",marginBottom:10,background:i===0?`${p.col}06`:C.white}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:600,color:C.brown}}>{p.em} {p.t}</div>
              <div style={{background:`${p.col}15`,borderRadius:99,padding:"3px 9px",fontSize:9,color:p.col,flexShrink:0}}>{p.quand}</div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
              {p.res.map((r,j)=>(
                <span key={j} style={{background:`${p.col}12`,border:`1px solid ${p.col}`,borderRadius:99,padding:"2px 9px",fontSize:9,color:p.col}}>✓ {r}</span>
              ))}
            </div>
            <div style={{fontSize:10,color:p.col,fontWeight:500}}>→ {p.geste}</div>
          </div>
        ))}

        <div style={{background:`${C.sage}25`,borderRadius:14,padding:"12px 14px",marginBottom:16,border:`1px solid ${C.sage}`}}>
          <div style={{fontSize:10,fontWeight:600,color:"#5A7040",marginBottom:6}}>📅 Ce que tu peux observer</div>
          <div style={{fontSize:10,color:"#5A7040",lineHeight:1.7}}>
            <strong>dans 14 jours</strong> → moins de fatigue après les repas · fringales qui diminuent · réveils plus faciles<br/>
            <strong>dans 30 jours</strong> → énergie plus stable · brouillard qui se lève · premiers signes sur la peau<br/>
            <strong>dans 3 mois</strong> → cycle qui se régularise · analyses qui bougent · terrain transformé
          </div>
        </div>

        <div style={{background:C.bubble,borderRadius:12,padding:"10px 14px",marginBottom:16,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.mid,lineHeight:1.6,fontStyle:"italic"}}>ce qui prend plus de temps : perte de poids durable (3-6 mois) · cycles réguliers (3-9 mois) · pilosité (6-18 mois avec électrolyse)</div>
        </div>

        <button onClick={()=>{setScreen("app");setModePrio(false);}}
          style={{width:"100%",background:pc.p,border:"none",padding:"15px",borderRadius:14,color:"white",fontFamily:"inherit",fontSize:15,fontWeight:600,cursor:"pointer"}}>
          Commencer le Jour 1 →
        </button>
      </div>
    </div>
  );

  // ── MODE CRISE ─────────────────────────────────────────────────────────────
  if(criseMode) return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.white,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:"3rem 2rem",textAlign:"center"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",color:C.brown,marginBottom:8}}>là. maintenant.</div>
      <div style={{fontSize:13,color:C.light,marginBottom:"3rem"}}>trois choses. c'est tout.</div>
      {[
        {n:"1",t:"Bois un verre d'eau"},
        {n:"2",t:"Respire — 5 secondes inspiration · 5 secondes expiration · 3 fois"},
        {n:"3",t:"Une seule chose. la plus petite possible. maintenant."},
      ].map((a,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:16,padding:"16px 0",borderBottom:i<2?`1px solid ${C.border}`:"none",textAlign:"left"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:`${pc.p}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:pc.p,flexShrink:0}}>{a.n}</div>
          <div style={{fontSize:15,color:C.brown,lineHeight:1.5,paddingTop:4}}>{a.t}</div>
        </div>
      ))}
      <div style={{marginTop:"3rem",fontFamily:"'Playfair Display',serif",fontSize:13,color:C.light,fontStyle:"italic",lineHeight:1.7}}>
        "c'est tout pour maintenant.<br/>demain on reprend." — Kamila 🌿
      </div>
      <button onClick={()=>setCriseMode(false)} style={{marginTop:"2rem",background:"none",border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 20px",fontFamily:"inherit",fontSize:12,color:C.light,cursor:"pointer"}}>
        revenir à l'application
      </button>
    </div>
  );

  // ── VUE FICHE SOS ──────────────────────────────────────────────────────────
  if(sosOpen) {
    const sos = SOS_DATA.find(s=>s.id===sosOpen);
    return (
      <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:430,margin:"0 auto"}}>
        <div style={{background:`linear-gradient(135deg,${sos.couleur},${sos.couleur}BB)`,padding:"1.5rem",color:"white"}}>
          <button onClick={()=>{setSosOpen(null);setTab("sos");}} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:99,padding:"6px 12px",color:"white",fontFamily:"inherit",fontSize:11,cursor:"pointer",marginBottom:12}}>← retour</button>
          <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",opacity:.8,marginBottom:4}}>Fiche SOS</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.6rem",marginBottom:4}}>{sos.emoji} {sos.titre}</div>
        </div>
        <div style={{padding:"1.25rem"}}>
          <div style={{background:`${sos.couleur}15`,borderRadius:14,padding:"12px 14px",marginBottom:14,borderLeft:`3px solid ${sos.couleur}`}}>
            <div style={{fontSize:13,color:C.brown,fontWeight:600,lineHeight:1.7,whiteSpace:"pre-line"}}>{sos.validation}</div>
          </div>
          <div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.light,marginBottom:8}}>dans les 5 minutes</div>
          {sos.actions5min.map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:C.white,border:`1px solid ${C.border}`,borderRadius:12,marginBottom:6}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`${sos.couleur}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{a.em}</div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:C.brown}}>{a.t}</div>
                <div style={{fontSize:10,color:C.light,marginTop:1}}>{a.why}</div>
              </div>
            </div>
          ))}
          <div style={{background:C.white,borderRadius:12,padding:"10px 12px",marginBottom:10,border:`1px solid ${C.border}`,marginTop:8}}>
            <div style={{fontSize:10,fontWeight:600,color:C.brown,marginBottom:4}}>dans l'heure</div>
            <div style={{fontSize:12,color:C.mid,lineHeight:1.6}}>{sos.action1h}</div>
          </div>
          <div style={{background:`${sos.couleur}08`,borderRadius:12,padding:"10px 12px",marginBottom:10,border:`1px solid ${sos.couleur}30`}}>
            <div style={{fontSize:10,fontWeight:600,color:sos.couleur,marginBottom:4}}>pourquoi ça arrive</div>
            <div style={{fontSize:11,color:C.mid,lineHeight:1.7}}>{sos.mecanisme}</div>
          </div>
          <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.border}`}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:12,color:C.brown,lineHeight:1.7,fontStyle:"italic"}}>"{sos.kamila}"</div>
          </div>
        </div>
      </div>
    );
  }

  // ── APP PRINCIPALE ─────────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:430,margin:"0 auto",paddingBottom:80}}>

      {/* HEADER */}
      <div style={{background:`linear-gradient(135deg,${pc.p},#9A6040)`,padding:"1rem 1.25rem",color:"white"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",opacity:.6,marginBottom:2}}>Protocole SOPK Life · J{day}</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.15rem"}}>Bonjour {prenom} 🌿</div>
            {(()=>{const ph=getPhase(day);return(
              <div style={{fontSize:9,opacity:.8,marginTop:2,background:"rgba(255,255,255,.12)",borderRadius:99,padding:"2px 10px",display:"inline-block"}}>
                {ph.nom} · {ph.tip}
              </div>
            )})()}
          </div>
          <div style={{position:"relative",cursor:"pointer"}} onClick={()=>setModePrio(true)}>
            <ScoreRing s={Math.round(score)} size={56} stroke={4}/>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:15,fontWeight:700,lineHeight:1}}>{Math.round(score)}</div>
              <div style={{fontSize:7,opacity:.75}}>brouillard</div>
            </div>
          </div>
        </div>
        <div style={{marginTop:8,background:"rgba(255,255,255,.18)",borderRadius:99,height:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(completedCount/30)*100}%`,background:"rgba(255,255,255,.9)",borderRadius:99,transition:"width 0.6s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
          <div style={{fontSize:8,opacity:.55}}>{completedCount}/30 missions</div>
          <button onClick={()=>setCriseMode(true)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:99,padding:"2px 10px",fontSize:9,color:"white",cursor:"pointer",fontFamily:"inherit"}}>
            mode crise
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:C.white,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:20}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:"8px 1px 6px",border:"none",background:"none",cursor:"pointer",fontSize:8,color:tab===t.id?pc.p:C.light,borderBottom:tab===t.id?`2px solid ${pc.p}`:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontFamily:"inherit"}}>
            <span style={{fontSize:14}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"1.25rem"}}>

        {/* ── KAMILA ── */}
        {tab==="kamila"&&(
          <div className="fu">
            {/* Sélecteur jours */}
            <div style={{display:"flex",gap:5,marginBottom:14,overflowX:"auto",paddingBottom:2}}>
              {Array.from({length:30},(_,i)=>i+1).slice(Math.max(0,day-4),day+5).map(d=>(
                <button key={d} onClick={()=>setDay(d)}
                  style={{flexShrink:0,width:32,height:32,borderRadius:"50%",border:`2px solid ${d===day?pc.p:checked[d]?pc.p:C.border}`,background:d===day?pc.p:checked[d]?`${pc.p}20`:C.white,color:d===day?"white":C.brown,fontSize:10,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                  {checked[d]&&d!==day?"✓":d}
                </button>
              ))}
            </div>

            {/* ── AUJOURD'HUI TON CORPS ── */}
            {(()=>{const ph=getPhase(day);return(
              <div style={{background:`${ph.col}12`,border:`1px solid ${ph.col}30`,borderRadius:12,padding:"10px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:600,color:C.brown}}>Aujourd'hui ton corps · Jour {day}</div>
                  <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{ph.nom} · {ph.desc}</div>
                </div>
                <div style={{fontSize:9,color:ph.col,fontWeight:600,background:`${ph.col}15`,borderRadius:99,padding:"3px 9px",flexShrink:0,textAlign:"center"}}>
                  {ph.tip}
                </div>
              </div>
            )})()}

            {/* Message Kamila */}
            <div className="breathe" style={{background:C.bubble,borderRadius:20,padding:"1.25rem",marginBottom:12,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:pc.p,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🌿</div>
                <div>
                  <div style={{fontSize:12,fontWeight:500,color:C.brown}}>Kamila</div>
                  <div style={{fontSize:9,color:C.light}}>Jour {day}</div>
                </div>
              </div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1rem",color:C.brown,lineHeight:1.85,whiteSpace:"pre-line",fontStyle:"italic"}}>
                "{todayData.msg}"
              </div>
            </div>

            {/* Mission */}
            <div style={{background:C.white,borderRadius:16,padding:"1.1rem",marginBottom:10,border:`1.5px solid ${checked[day]?pc.p:C.border}`,transition:"border-color 0.3s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{flex:1,paddingRight:10}}>
                  <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.light,marginBottom:3}}>{todayData.emoji} {todayData.theme}</div>
                  <div style={{fontSize:13,fontWeight:600,color:C.brown,lineHeight:1.35,whiteSpace:"pre-line"}}>{todayData.mission}</div>
                </div>
                <button onClick={()=>setChecked(p=>({...p,[day]:!p[day]}))}
                  style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${checked[day]?pc.p:C.border}`,background:checked[day]?pc.p:"transparent",cursor:"pointer",fontSize:15,color:"white",flexShrink:0,transition:"all 0.25s",fontFamily:"inherit"}}>
                  {checked[day]?"✓":""}
                </button>
              </div>

              {/* POURQUOI */}
              <div style={{marginTop:10}}>
                <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:pc.p,fontWeight:600,marginBottom:4}}>💡 pourquoi — ce qui se passe dans ton corps</div>
                <div style={{fontSize:11,color:C.mid,lineHeight:1.7,background:C.cream,borderRadius:10,padding:"10px 12px",whiteSpace:"pre-line"}}>{todayData.pourquoi||todayData.biologie}</div>
                {todayData.source&&(
                  <div style={{fontSize:9,color:C.light,fontStyle:"italic",lineHeight:1.5,marginTop:5,paddingLeft:4}}>📚 {todayData.source}</div>
                )}
              </div>

              {/* COMMENT */}
              {todayData.comment&&(
                <div style={{marginTop:12}}>
                  <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:pc.p,fontWeight:600,marginBottom:5}}>👣 comment faire concrètement</div>
                  <div style={{background:C.cream,borderRadius:10,padding:"10px 12px"}}>
                    {todayData.comment.map((c,i)=>(
                      <div key={i} style={{display:"flex",gap:8,marginBottom:i<todayData.comment.length-1?6:0,alignItems:"flex-start"}}>
                        <div style={{width:16,height:16,borderRadius:"50%",background:`${pc.p}20`,color:pc.p,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</div>
                        <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{c}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PIEGES */}
              {todayData.pieges&&(
                <div style={{marginTop:12}}>
                  <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"#B07050",fontWeight:600,marginBottom:5}}>⚠️ les pièges à éviter</div>
                  <div style={{background:"#FDF0E8",borderRadius:10,padding:"10px 12px",border:"1px solid #F0D5C5"}}>
                    {todayData.pieges.map((p,i)=>(
                      <div key={i} style={{display:"flex",gap:7,marginBottom:i<todayData.pieges.length-1?6:0,alignItems:"flex-start"}}>
                        <div style={{color:"#B07050",fontSize:11,flexShrink:0}}>✗</div>
                        <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{p}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LE + DE KAMILA */}
              {todayData.plus&&(
                <div style={{marginTop:12}}>
                  <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"#5A7040",fontWeight:600,marginBottom:5}}>🌿 le + de Kamila</div>
                  <div style={{background:`${C.sage}22`,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.sage}`}}>
                    <div style={{fontSize:11,color:"#4F6038",lineHeight:1.6,fontStyle:"italic"}}>{todayData.plus}</div>
                  </div>
                </div>
              )}

              {/* CE QUE TU OBSERVES */}
              {todayData.observes&&(
                <div style={{marginTop:12}}>
                  <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:pc.p,fontWeight:600,marginBottom:5}}>📈 ce que tu observes si ça marche</div>
                  <div style={{background:C.cream,borderRadius:10,padding:"10px 12px"}}>
                    {todayData.observes.map((o,i)=>(
                      <div key={i} style={{display:"flex",gap:7,marginBottom:i<todayData.observes.length-1?5:0,alignItems:"flex-start"}}>
                        <div style={{color:pc.p,fontSize:10,flexShrink:0,marginTop:1}}>→</div>
                        <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{o}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {checked[day]&&<div style={{marginTop:12,fontSize:11,color:pc.p,fontWeight:500,textAlign:"center",padding:"8px",background:`${pc.p}08`,borderRadius:8}}>✓ {todayData.victoire}</div>}
            </div>

            {/* Lien vers un outil */}
            {todayData.outil&&(
              <button onClick={()=>{setTab("outils");setOutilOpen(todayData.outil.cible);if(todayData.outil.recherche!==undefined)setFoodSearch(todayData.outil.recherche);if(todayData.outil.cible==="repas"&&todayData.outil.moment)setRepasMoment(todayData.outil.moment);}}
                style={{width:"100%",background:"linear-gradient(135deg, #D4A56A, #C49355)",border:"none",borderRadius:14,padding:"15px 16px",marginBottom:10,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left",boxShadow:"0 4px 14px rgba(212,165,106,0.4)"}}>
                <div style={{fontSize:26,flexShrink:0,background:"rgba(255,255,255,0.25)",borderRadius:12,width:46,height:46,display:"flex",alignItems:"center",justifyContent:"center"}}>{todayData.outil.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"rgba(255,255,255,0.9)",marginBottom:2,fontWeight:700}}>👆 appuie pour ouvrir l'outil</div>
                  <div style={{fontSize:13,fontWeight:700,color:"white",lineHeight:1.2}}>{todayData.outil.label}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.9)",marginTop:1}}>{todayData.outil.desc}</div>
                </div>
                <div style={{fontSize:22,color:"white",flexShrink:0,fontWeight:700}}>→</div>
              </button>
            )}

            {/* Tisane */}
            {todayData.tisane&&(
              <div style={{background:`linear-gradient(135deg,${C.bubble},#ECD8C4)`,borderRadius:14,padding:"1rem",marginBottom:10,border:`1.5px solid ${pc.p}`}}>
                <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:pc.p,marginBottom:5}}>🌿 option recommandée — {todayData.tisane.nom}</div>
                <div style={{fontSize:11,color:C.mid,lineHeight:1.6,marginBottom:8}}>{todayData.tisane.texte}</div>
                <div style={{fontSize:9,color:C.light,marginBottom:8}}>timing : {todayData.tisane.timing}</div>
                <a href={todayData.tisane.lien} target="_blank" rel="noreferrer"
                  style={{display:"block",background:pc.p,borderRadius:9,padding:"9px",textAlign:"center",fontSize:11,color:"white",textDecoration:"none",fontWeight:600}}>
                  Commander {todayData.tisane.nom} →
                </a>
              </div>
            )}

            {/* Vocaux */}
            <div style={{background:C.white,borderRadius:14,padding:"1rem",marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,fontWeight:600,color:C.brown,marginBottom:8}}>🎙️ Messages de Kamila</div>
              {VOCAUX.map((v,i)=>{
                const locked = day < v.unlockDay;
                return(
                  <div key={i} style={{background:locked?"#F0EBE3":C.cream,borderRadius:10,marginBottom:6,overflow:"hidden",opacity:locked?0.65:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px"}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:locked?C.border:`${pc.p}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{locked?"🔒":"🎙️"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,fontWeight:500,color:C.brown}}>{v.titre}</div>
                        <div style={{fontSize:9,color:C.light}}>{locked?`se débloque au Jour ${v.unlockDay}`:v.desc}</div>
                      </div>
                      <div style={{fontSize:9,color:C.light,background:C.border,borderRadius:99,padding:"2px 7px"}}>{v.when}</div>
                    </div>
                    {!locked&&v.file&&(
                      <audio controls style={{width:"100%",height:32,marginTop:2}}
                        controlsList="nodownload"
                        src={v.file}>
                      </audio>
                    )}
                  </div>
                );
              })}
              <div style={{fontSize:9,color:C.light,textAlign:"center",marginTop:4}}>certains messages se débloquent au fil de ton protocole</div>
            </div>

            {/* Navigation */}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setDay(d=>Math.max(1,d-1))} disabled={day<=1}
                style={{flex:1,padding:"9px",border:`1.5px solid ${C.border}`,borderRadius:12,background:C.white,fontFamily:"inherit",fontSize:11,color:day<=1?C.light:C.mid,cursor:day<=1?"not-allowed":"pointer"}}>
                ← précédent
              </button>
              <button onClick={()=>setDay(d=>Math.min(30,d+1))} disabled={day>=30}
                style={{flex:1,padding:"9px",border:`1.5px solid ${checked[day]?pc.p:C.border}`,borderRadius:12,background:checked[day]?`${pc.p}10`:C.white,fontFamily:"inherit",fontSize:11,color:day>=30?C.light:pc.p,cursor:day>=30?"not-allowed":"pointer",fontWeight:500}}>
                suivant →
              </button>
            </div>
          </div>
        )}

        {/* ── FICHES SOS ── */}
        {tab==="sos"&&(
          <div className="fu">
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",color:C.brown,marginBottom:4}}>Fiches SOS</div>
            <div style={{fontSize:12,color:C.mid,marginBottom:6,lineHeight:1.5}}>la réponse immédiate aux moments difficiles.</div>
            <div style={{background:C.bubble,borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,fontStyle:"italic",border:`1px solid ${C.border}`}}>
              "t'as pas à gérer ça seule. chaque fiche SOS est là pour le moment exact où tu en as besoin." — Kamila 🌿
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {SOS_DATA.map((sos,i)=>(
                <button key={i} onClick={()=>setSosOpen(sos.id)}
                  style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:14,padding:"12px",textAlign:"left",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
                  <div style={{fontSize:20,marginBottom:5}}>{sos.emoji}</div>
                  <div style={{fontSize:11,fontWeight:600,color:C.brown,lineHeight:1.3,marginBottom:3}}>{sos.titre}</div>
                  <div style={{fontSize:9,color:C.light,lineHeight:1.4}}>{sos.actions5min[0].t}</div>
                  <div style={{marginTop:8,background:`${sos.couleur}15`,borderRadius:99,padding:"3px 8px",display:"inline-block",fontSize:9,color:sos.couleur}}>
                    voir la fiche →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYSES ── */}
        {/* ── OUTILS ── */}
        {tab==="outils"&&(
          <div className="fu">
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",color:C.brown,marginBottom:4}}>Tes outils</div>
            <div style={{fontSize:12,color:C.light,marginBottom:14}}>tes références pratiques, toujours à portée.</div>

            {/* Sélecteur d'outil */}
            <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}}>
              {[
                {id:"aliments",label:"🍽️ Aliments"},
                {id:"repas",label:"🍲 Idées repas"},
                {id:"sucres",label:"🔍 Sucres cachés"},
                {id:"complements",label:"💊 Compléments"},
                {id:"assiette",label:"🍴 L'assiette"},
              ].map(o=>(
                <button key={o.id} onClick={()=>setOutilOpen(o.id)}
                  style={{flexShrink:0,padding:"8px 12px",borderRadius:99,border:`1.5px solid ${outilOpen===o.id?pc.p:C.border}`,background:outilOpen===o.id?`${pc.p}12`:C.white,color:outilOpen===o.id?pc.p:C.mid,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                  {o.label}
                </button>
              ))}
            </div>

            {/* OUTIL : RECHERCHE D'ALIMENTS */}
            {outilOpen==="aliments"&&(
              <div className="fu">
                <div style={{background:C.bubble,borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                  tape un aliment pour voir son index glycémique, ses protéines, et s'il est bon pour ton SMOP. 🌿
                </div>
                <input type="text" placeholder="ex: lentilles, riz, banane…" value={foodSearch}
                  onChange={e=>setFoodSearch(e.target.value)}
                  style={{width:"100%",padding:"12px 14px",border:`2px solid ${C.border}`,borderRadius:12,fontFamily:"inherit",fontSize:14,color:C.brown,background:C.white,marginBottom:12}}/>

                <div style={{display:"flex",gap:8,marginBottom:12,fontSize:9,flexWrap:"wrap"}}>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:9,height:9,borderRadius:"50%",background:"#7A9A5A"}}/>index bas</span>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:9,height:9,borderRadius:"50%",background:"#E8C96A"}}/>modéré</span>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:9,height:9,borderRadius:"50%",background:"#D08770"}}/>élevé</span>
                </div>

                {(()=>{
                  const igCol={bas:"#7A9A5A",modere:"#E8C96A",eleve:"#D08770"};
                  const sopkBadge={excellent:{l:"excellent",c:"#7A9A5A"},bon:{l:"bon",c:"#8DA86A"},limite:{l:"à limiter",c:"#E8A04A"},eviter:{l:"à éviter",c:"#D08770"}};
                  const filtered = foodSearch.trim()
                    ? ALIMENTS.filter(a=>a.nom.toLowerCase().includes(foodSearch.toLowerCase().trim())||a.cat.toLowerCase().includes(foodSearch.toLowerCase().trim()))
                    : ALIMENTS;
                  if(filtered.length===0) return(
                    <div style={{textAlign:"center",padding:"24px",color:C.light,fontSize:12}}>
                      aucun aliment trouvé pour "{foodSearch}".<br/>essaie un autre mot 🌿
                    </div>
                  );
                  // Group by category
                  const cats=[...new Set(filtered.map(a=>a.cat))];
                  return cats.map(cat=>(
                    <div key={cat} style={{marginBottom:14}}>
                      <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.light,marginBottom:6,fontWeight:600}}>{cat}</div>
                      {filtered.filter(a=>a.cat===cat).map((a,i)=>{
                        const sb=sopkBadge[a.sopk];
                        return(
                          <div key={i} style={{background:C.white,borderRadius:12,padding:"11px 13px",marginBottom:6,border:`1px solid ${C.border}`}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                              <div style={{width:10,height:10,borderRadius:"50%",background:igCol[a.ig],flexShrink:0}}/>
                              <div style={{fontSize:13,fontWeight:600,color:C.brown,flex:1}}>{a.nom}</div>
                              <div style={{background:`${sb.c}18`,border:`1px solid ${sb.c}`,borderRadius:99,padding:"2px 9px",fontSize:9,color:sb.c,fontWeight:600}}>{sb.l}</div>
                            </div>
                            <div style={{display:"flex",gap:12,fontSize:10,color:C.light,marginBottom:5,paddingLeft:18}}>
                              <span>🥩 {a.prot}g protéines</span>
                              <span>🔥 {a.kcal} kcal</span>
                            </div>
                            <div style={{fontSize:11,color:C.mid,lineHeight:1.5,paddingLeft:18}}>{a.note}</div>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            )}

            {/* OUTIL : IDÉES REPAS */}
            {outilOpen==="repas"&&(
              <div className="fu">
                <div style={{background:C.bubble,borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                  des idées de repas concrets, pensés pour le SMOP. tous conviennent à toutes les Cysters — l'étoile ⭐ signale un atout spécifique pour ton profil. 🌿
                </div>

                {/* Filtre par moment */}
                <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}}>
                  {[
                    {id:"matin",label:"🌅 Petit-déj"},
                    {id:"midi",label:"☀️ Déjeuner"},
                    {id:"soir",label:"🌙 Dîner"},
                    {id:"collation",label:"🍎 Collation"},
                  ].map(m=>(
                    <button key={m.id} onClick={()=>setRepasMoment(m.id)}
                      style={{flexShrink:0,padding:"8px 12px",borderRadius:99,border:`1.5px solid ${repasMoment===m.id?pc.p:C.border}`,background:repasMoment===m.id?`${pc.p}12`:C.white,color:repasMoment===m.id?pc.p:C.mid,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                      {m.label}
                    </button>
                  ))}
                </div>

                {REPAS.filter(r=>r.moment===repasMoment).map((r,i)=>{
                  const profilLabels={metabolique:"Métabolique",androgenique:"Androgénique",inflammatoire:"Inflammatoire",mixte_ma:"Mixte M-A",mixte_mi:"Mixte M-I",mixte_ai:"Mixte A-I"};
                  const estPourMonProfil=r.profils.includes(profil);
                  return(
                    <div key={i} style={{background:C.white,borderRadius:14,padding:"13px",marginBottom:8,border:`1.5px solid ${estPourMonProfil?pc.p:C.border}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.brown,flex:1}}>{r.nom}</div>
                        <div style={{fontSize:10,color:pc.p,fontWeight:600,background:`${pc.p}10`,borderRadius:99,padding:"2px 8px"}}>{r.prot} prot.</div>
                      </div>
                      {/* tags */}
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                        {r.tags.map((t,j)=>(
                          <span key={j} style={{fontSize:9,color:C.light,background:C.cream,borderRadius:99,padding:"2px 8px"}}>{t}</span>
                        ))}
                        {r.profils.map((p,j)=>(
                          <span key={"p"+j} style={{fontSize:9,fontWeight:600,color:p===profil?pc.p:"#8DA86A",background:p===profil?`${pc.p}12`:`${C.sage}22`,border:`1px solid ${p===profil?pc.p:C.sage}`,borderRadius:99,padding:"2px 8px"}}>⭐ idéal {profilLabels[p]}</span>
                        ))}
                      </div>
                      <div style={{fontSize:11,color:C.brown,lineHeight:1.6,marginBottom:8,background:C.cream,borderRadius:10,padding:"9px 11px"}}>{r.compo}</div>
                      <div style={{fontSize:11,color:C.mid,lineHeight:1.6,fontStyle:"italic"}}>💡 {r.pourquoi}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* OUTIL : SUCRES CACHÉS */}
            {outilOpen==="sucres"&&(
              <div className="fu">
                <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                  le sucre se cache sous des dizaines de noms sur les étiquettes. si tu vois l'un de ces mots dans les premiers ingrédients — méfie-toi. 🌿
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {SUCRES_CACHES.map((s,i)=>(
                    <div key={i} style={{background:"#FDF0E8",border:"1px solid #F0D5C5",borderRadius:99,padding:"6px 12px",fontSize:11,color:"#B07050"}}>{s}</div>
                  ))}
                </div>
                <div style={{background:`${C.sage}22`,borderRadius:12,padding:"12px 14px",marginTop:16,border:`1px solid ${C.sage}`}}>
                  <div style={{fontSize:11,color:"#4F6038",lineHeight:1.6}}>
                    <strong>l'astuce :</strong> plus un sucre est haut dans la liste des ingrédients, plus le produit en contient. et si tu vois 2-3 noms de sucre différents, c'est qu'on a découpé le sucre pour qu'il paraisse moins présent.
                  </div>
                </div>
              </div>
            )}

            {/* OUTIL : COMPLÉMENTS */}
            {outilOpen==="complements"&&(
              <div className="fu">
                <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                  les compléments adaptés à ton profil ({pc.label}). dosage, timing, et délai d'action. 🌿
                </div>
                {COMPLEMENTS.filter(c=>c.pour.includes(profil)).map((c,i)=>(
                  <div key={i} style={{background:C.white,borderRadius:14,padding:"13px",marginBottom:8,border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.brown,marginBottom:6}}>💊 {c.nom}</div>
                    <div style={{fontSize:11,color:C.mid,lineHeight:1.6,marginBottom:8}}>{c.effet}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                      <div style={{background:C.cream,borderRadius:8,padding:"6px 9px"}}>
                        <div style={{fontSize:8,color:C.light,textTransform:"uppercase",letterSpacing:0.5}}>dosage</div>
                        <div style={{fontSize:10,color:C.brown,fontWeight:500}}>{c.dose}</div>
                      </div>
                      <div style={{background:C.cream,borderRadius:8,padding:"6px 9px"}}>
                        <div style={{fontSize:8,color:C.light,textTransform:"uppercase",letterSpacing:0.5}}>timing</div>
                        <div style={{fontSize:10,color:C.brown,fontWeight:500}}>{c.timing}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontSize:9,color:C.light}}>⏱️ effet visible en {c.delai}</div>
                    </div>
                    <div style={{fontSize:10,color:C.mid,lineHeight:1.5,marginTop:6,fontStyle:"italic",paddingTop:6,borderTop:`1px solid ${C.border}`}}>{c.note}</div>
                  </div>
                ))}
                <div style={{background:"#FEF9E7",borderRadius:12,padding:"10px 13px",marginTop:8,border:"1px solid #F0E0A0"}}>
                  <div style={{fontSize:10,color:"#8A6D2A",lineHeight:1.6}}>⚠️ les compléments ne remplacent pas un avis médical. parles-en à ton médecin, surtout en cas de traitement ou de grossesse.</div>
                </div>
              </div>
            )}

            {/* OUTIL : L'ASSIETTE SOPK */}
            {outilOpen==="assiette"&&(
              <div className="fu">
                <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                  le modèle de l'assiette SOPK — pour composer un repas qui stabilise ta glycémie, sans rien peser. 🌿
                </div>
                {[
                  {pct:"½",t:"Légumes & fibres",c:"#7A9A5A",ex:"légumes verts, crucifères, salade, légumes colorés — à manger en premier"},
                  {pct:"¼",t:"Protéines",c:"#CB9A79",ex:"viande, poisson, œufs, tofu, légumineuses — le pilier de la satiété"},
                  {pct:"¼",t:"Féculents complets",c:"#D4A56A",ex:"quinoa, riz complet, patate douce, pain au levain — à manger en dernier"},
                  {pct:"+",t:"Bons gras",c:"#B8C5A0",ex:"avocat, huile d'olive, oléagineux — une touche, ça ralentit la glycémie"},
                ].map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",background:C.white,borderRadius:14,padding:"13px",marginBottom:8,border:`1px solid ${C.border}`}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:`${p.c}20`,border:`2px solid ${p.c}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:p.c,flexShrink:0}}>{p.pct}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.brown,marginBottom:3}}>{p.t}</div>
                      <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{p.ex}</div>
                    </div>
                  </div>
                ))}
                <div style={{background:`${C.sage}22`,borderRadius:12,padding:"12px 14px",marginTop:8,border:`1px solid ${C.sage}`}}>
                  <div style={{fontSize:11,color:"#4F6038",lineHeight:1.6}}>
                    <strong>la règle d'or :</strong> commence toujours par les légumes, finis par les féculents. même assiette, bon ordre, ta glycémie te dit merci.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="analyses"&&(
          <div className="fu">
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",color:C.brown,marginBottom:4}}>Tes analyses</div>
            <div style={{fontSize:12,color:C.light,marginBottom:14}}>en langage humain — pas en normes de laboratoire.</div>

            {/* GPS */}
            <div style={{background:C.white,borderRadius:16,padding:"1rem",marginBottom:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,fontWeight:600,color:C.brown,marginBottom:8}}>🗺️ GPS — quel symptôme → quelles analyses</div>
              {GPS_DATA.map((g,i)=>(
                <button key={i} onClick={()=>setGpsOpen(gpsOpen===i?null:i)}
                  style={{width:"100%",background:gpsOpen===i?C.bubble:C.cream,border:`1.5px solid ${gpsOpen===i?pc.p:C.border}`,borderRadius:10,padding:"9px 11px",textAlign:"left",cursor:"pointer",fontFamily:"inherit",fontSize:11,color:C.brown,marginBottom:5,transition:"all 0.2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span>{g.s}</span>
                    <span style={{fontSize:10,color:C.light,display:"inline-block",transform:gpsOpen===i?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▼</span>
                  </div>
                  {gpsOpen===i&&(
                    <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:5}}>
                      {g.a.map((a,j)=>(
                        <span key={j} style={{background:C.white,border:`1px solid ${pc.p}`,borderRadius:99,padding:"3px 9px",fontSize:10,color:pc.p}}>{a}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Traducteur */}
            <div style={{background:C.white,borderRadius:16,padding:"1rem",marginBottom:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,fontWeight:600,color:C.brown,marginBottom:4}}>🔬 Traducteur d'analyses</div>
              <div style={{fontSize:10,color:C.mid,marginBottom:10,lineHeight:1.5,background:C.cream,borderRadius:9,padding:"7px 10px"}}>
                entre tes valeurs. Kamila t'explique ce qu'elles signifient vraiment.
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}>
                {MARKERS.map(m=>(
                  <div key={m.id}>
                    <div style={{fontSize:9,color:C.light,marginBottom:2}}>{m.label} ({m.unit})</div>
                    <input type="number" placeholder={m.ph} value={markers[m.id]||""}
                      onChange={e=>setMarkers(p=>({...p,[m.id]:e.target.value}))}
                      style={{width:"100%",padding:"8px 9px",border:`1.5px solid ${C.border}`,borderRadius:9,fontFamily:"inherit",fontSize:12,color:C.brown,background:C.cream}}/>
                  </div>
                ))}
              </div>
              <button onClick={translate} disabled={translating||!Object.values(markers).some(v=>v&&v.trim())}
                style={{width:"100%",background:Object.values(markers).some(v=>v&&v.trim())?pc.p:C.border,border:"none",padding:"12px",borderRadius:11,color:"white",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:translating||translation||transErr?10:0}}>
                {translating?"Kamila analyse…":"Traduire mes analyses →"}
              </button>
              {translating&&<div style={{textAlign:"center",padding:"8px"}}><div style={{width:22,height:22,border:`3px solid ${C.border}`,borderTopColor:pc.p,borderRadius:"50%",margin:"0 auto",animation:"spin 0.8s linear infinite"}}/></div>}
              {transErr&&<div style={{background:`${pc.p}12`,borderRadius:10,padding:"10px 12px",fontSize:11,color:C.brown,lineHeight:1.5}}>{transErr}</div>}
              {translation&&(
                <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px"}}>
                  <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.light,marginBottom:6}}>🌿 Kamila te répond</div>
                  <div style={{fontSize:12,lineHeight:1.85,color:C.brown,whiteSpace:"pre-wrap"}}>{translation}</div>
                </div>
              )}
            </div>

            {/* HOMA-IR */}
            <div style={{background:C.white,borderRadius:14,padding:"1rem",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,fontWeight:600,color:C.brown,marginBottom:8}}>🧮 HOMA-IR</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                {[{id:"insuline",l:"Insuline à jeun (µUI/mL)",ph:"ex: 12"},{id:"glycemie",l:"Glycémie à jeun (mmol/L)",ph:"ex: 5.2"}].map(f=>(
                  <div key={f.id}>
                    <div style={{fontSize:9,color:C.mid,marginBottom:3}}>{f.l}</div>
                    <input type="number" placeholder={f.ph} value={markers[f.id]||""}
                      onChange={e=>setMarkers(p=>({...p,[f.id]:e.target.value}))}
                      style={{width:"100%",padding:"9px 10px",border:`1.5px solid ${C.border}`,borderRadius:10,fontFamily:"inherit",fontSize:13,color:C.brown,background:C.cream}}/>
                  </div>
                ))}
              </div>
              {markers.insuline&&markers.glycemie&&(()=>{
                const v=(parseFloat(markers.insuline)*parseFloat(markers.glycemie))/22.5;
                const info=v<1.5?{l:"excellente sensibilité à l'insuline",c:"#7A9A5A"}:v<2?{l:"sensibilité normale",c:"#7A9A5A"}:v<2.5?{l:"résistance légère — terrain à travailler",c:"#E8C96A"}:v<3.5?{l:"résistance modérée — priorité élevée",c:pc.p}:{l:"résistance importante — consulte ton médecin",c:"#B07050"};
                return(
                  <div style={{background:C.cream,borderRadius:12,padding:"12px",textAlign:"center"}}>
                    <div style={{fontSize:28,fontWeight:800,color:C.brown}}>{v.toFixed(2)}</div>
                    <div style={{fontSize:9,color:C.light,marginBottom:5}}>ton score HOMA-IR</div>
                    <div style={{background:`${info.c}25`,borderRadius:99,padding:"5px 12px",fontSize:11,color:C.brown,fontWeight:500,display:"inline-block"}}>{info.l}</div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── MÉDECIN ── */}
        {tab==="medecin"&&(
          <div className="fu">
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",color:C.brown,marginBottom:4}}>Mon médecin</div>
            <div style={{fontSize:12,color:C.mid,marginBottom:14}}>entre préparée. pose les bonnes questions.</div>

            <div style={{background:C.bubble,borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:11,color:C.mid,lineHeight:1.6,fontStyle:"italic",border:`1px solid ${C.border}`}}>
              "tu n'attends plus qu'on te sauve. tu collabores avec ton médecin. c'est très différent." — Kamila 🌿
            </div>

            {SCRIPTS.map((sc,i)=>(
              <div key={i} style={{background:C.white,borderRadius:12,padding:"12px",marginBottom:8,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:11,fontWeight:600,color:C.brown,marginBottom:5}}>{sc.t}</div>
                <div style={{background:C.cream,borderRadius:9,padding:"8px 10px",fontSize:10,color:C.mid,lineHeight:1.6,fontStyle:"italic",marginBottom:5}}>"{sc.s}"</div>
                <div style={{background:"#FEF9C3",borderRadius:8,padding:"5px 8px",fontSize:9,color:"#92400E",marginBottom:7}}>si résistance : "{sc.r}"</div>
                <button onClick={()=>{navigator.clipboard?.writeText(sc.s);setCopyOk(i);setTimeout(()=>setCopyOk(null),2000);}}
                  style={{background:copyOk===i?C.sage:C.bubble,border:"none",padding:"6px 12px",borderRadius:8,fontFamily:"inherit",fontSize:10,color:C.brown,cursor:"pointer",transition:"background 0.3s"}}>
                  {copyOk===i?"✓ copié !":"copier ce script"}
                </button>
              </div>
            ))}

            {/* PDF */}
            <div style={{background:`${pc.p}12`,borderRadius:14,padding:"14px",border:`1.5px solid ${pc.p}`,marginTop:8}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div style={{fontSize:26}}>📄</div>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:C.brown}}>Mon dossier médecin PDF</div>
                  <div style={{fontSize:10,color:C.mid}}>Exportable · Imprimable · À poser sur la table</div>
                </div>
              </div>
              <div style={{fontSize:10,color:C.mid,lineHeight:1.6,marginBottom:10}}>
                profil · mécanisme · 3 priorités · analyses à demander · scripts préparés · progression 30 jours
              </div>
              <button style={{width:"100%",background:pc.p,border:"none",padding:"10px",borderRadius:10,color:"white",fontFamily:"inherit",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                Générer mon dossier PDF →
              </button>
            </div>
          </div>
        )}

        {/* ── JOURNAL ── */}
        {tab==="journal"&&(
          <div className="fu">
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",color:C.brown,marginBottom:14}}>Mon journal</div>

            {/* ── SCORE TERRAIN VISUEL ── */}
            {(()=>{
              const scoreJ1=76;
              const scoreMaintenant=Math.round(score);
              const diff=scoreJ1-scoreMaintenant;
              const pct=Math.round((diff/scoreJ1)*100);
              const barWidth=Math.max(5,Math.round((scoreMaintenant/100)*100));
              return(
                <div style={{background:C.white,borderRadius:16,padding:"1.1rem",marginBottom:14,border:`1.5px solid ${C.border}`}}>
                  <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.light,marginBottom:10}}>Ton terrain SOPK — évolution</div>
                  <div style={{display:"flex",gap:16,marginBottom:12}}>
                    <div style={{flex:1,background:C.cream,borderRadius:12,padding:"10px",textAlign:"center"}}>
                      <div style={{fontSize:24,fontWeight:800,color:"#B07050"}}>76</div>
                      <div style={{fontSize:9,color:C.light}}>Jour 1</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",fontSize:16,color:C.border}}>→</div>
                    <div style={{flex:1,background:`${pc.p}10`,borderRadius:12,padding:"10px",textAlign:"center",border:`1.5px solid ${pc.p}`}}>
                      <div style={{fontSize:24,fontWeight:800,color:pc.p}}>{scoreMaintenant}</div>
                      <div style={{fontSize:9,color:C.light}}>Aujourd'hui</div>
                    </div>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.light,marginBottom:4}}>
                      <span>Score de brouillard</span>
                      <span style={{color:diff>0?"#7A9A5A":C.light}}>
                        {diff>0?`-${diff} points`:"Jour 1 — continue"}
                      </span>
                    </div>
                    <div style={{height:8,background:C.border,borderRadius:99,overflow:"hidden"}}>
                      <div style={{width:`${barWidth}%`,height:"100%",background:`linear-gradient(90deg,#7A9A5A,${pc.p})`,borderRadius:99,transition:"width 1s ease"}}/>
                    </div>
                  </div>
                  {diff>0&&(
                    <div style={{background:`${"#7A9A5A"}15`,borderRadius:10,padding:"8px 12px",border:`1px solid ${"#7A9A5A"}`,marginBottom:8}}>
                      <div style={{fontSize:11,color:"#5A7040",fontWeight:500}}>
                        🎯 {diff} points de brouillard éliminés depuis le Jour 1
                      </div>
                      <div style={{fontSize:9,color:"#7A9A5A",marginTop:2}}>
                        {completedCount} missions complétées · semaine {week} en cours
                      </div>
                    </div>
                  )}
                  <button
                    onClick={()=>{
                      const text=`Mon terrain SOPK après ${completedCount} missions\n\nJour 1 : 76 pts de brouillard\nAujourd'hui : ${scoreMaintenant} pts\n\n${diff>0?`-${diff} points éliminés 🌿`:"Je commence mon protocole SOPK Life"}\n\n@sopk.life — Protocole SOPK Life`;
                      navigator.clipboard?.writeText(text);
                      alert("Copié ! Partage ça en story 🌿");
                    }}
                    style={{width:"100%",background:pc.p,border:"none",borderRadius:10,padding:"9px",color:"white",fontFamily:"inherit",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                    📲 Partager ma progression en story
                  </button>
                </div>
              );
            })()}

            {/* Victoires */}
            <div style={{background:`linear-gradient(135deg,${C.bubble},${C.sage}33)`,borderRadius:16,padding:"1rem",marginBottom:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.light,marginBottom:3}}>semaine {week} — mes victoires</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"0.9rem",color:C.brown,marginBottom:10,fontStyle:"italic"}}>"le but n'est pas d'être parfaite. c'est de remarquer ce qui change."</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {VICTORIES_LIST.map((v,i)=>{
                  const sel=weekWins.includes(i);
                  return(
                    <button key={i} onClick={()=>setVictories(p=>{const c=p[week]||[];return{...p,[week]:sel?c.filter(x=>x!==i):[...c,i]};})}
                      style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",border:`1.5px solid ${sel?pc.p:C.border}`,borderRadius:11,background:sel?`${pc.p}10`:C.white,cursor:"pointer",fontFamily:"inherit",fontSize:11,color:C.brown,textAlign:"left",transition:"all 0.15s"}}>
                      <div style={{width:16,height:16,borderRadius:"50%",border:`1.5px solid ${sel?pc.p:C.border}`,background:sel?pc.p:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {sel&&<span style={{color:"white",fontSize:9}}>✓</span>}
                      </div>
                      {v}
                    </button>
                  );
                })}
              </div>
              {weekWins.length>0&&<div style={{marginTop:8,background:`${pc.p}15`,borderRadius:9,padding:"7px 10px",fontSize:11,color:C.brown,fontWeight:500}}>🎯 {weekWins.length} victoire{weekWins.length>1?"s":""} cette semaine.</div>}
            </div>

            {/* Suivi symptômes */}
            <div style={{background:C.white,borderRadius:14,padding:"1rem",marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,fontWeight:600,color:C.brown,marginBottom:8}}>suivi — semaine {week}</div>
              {["Énergie le matin","Fringales","Fatigue après repas","Humeur","Sommeil","Brouillard"].map((sym,i)=>{
                const val=symptoms[`${week}_${i}`]||0;
                const col=val>=4?"#7A9A5A":val>=3?pc.p:C.border;
                return(
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <div style={{fontSize:11,color:C.brown}}>{sym}</div>
                      <div style={{fontSize:11,fontWeight:600,color:val>0?col:C.light}}>{val>0?`${val}/5`:"—"}</div>
                    </div>
                    <div style={{display:"flex",gap:5}}>
                      {[1,2,3,4,5].map(n=>(
                        <button key={n} onClick={()=>setSymptoms(p=>({...p,[`${week}_${i}`]:n}))}
                          style={{flex:1,height:7,borderRadius:99,border:"none",background:n<=val?col:C.border,cursor:"pointer",transition:"all 0.2s"}}/>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notes */}
            {[1,2,3,4].map(w=>(
              <div key={w} style={{background:C.white,borderRadius:12,padding:"10px",marginBottom:7,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:500,color:C.brown,marginBottom:5}}>semaine {w}</div>
                <textarea placeholder="ce que j'ai vécu, ressenti, compris…" value={notes[w]||""} onChange={e=>setNotes(p=>({...p,[w]:e.target.value}))}
                  style={{width:"100%",padding:"8px 10px",border:`1.5px solid ${C.border}`,borderRadius:9,fontFamily:"inherit",fontSize:11,color:C.brown,background:C.cream,resize:"vertical",minHeight:55}}/>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.white,borderTop:`1px solid ${C.border}`,padding:"7px 0 10px",display:"flex",justifyContent:"space-around",zIndex:30}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{background:tab===t.id?`${pc.p}10`:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 4px",borderRadius:10,fontFamily:"inherit",flex:1}}>
            <span style={{fontSize:15}}>{t.icon}</span>
            <span style={{fontSize:9,color:tab===t.id?pc.p:C.light,fontWeight:tab===t.id?600:400}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
