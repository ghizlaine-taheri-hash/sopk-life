import { useState, useEffect, useRef } from "react";

// ─── COULEURS ────────────────────────────────────────────────────────────────
const C = {
  cream:"#FBF8F3",terra:"#CB9A79",mauve:"#A89AB8",gold:"#D4A56A",
  brown:"#3A2A20",mid:"#857160",light:"#B8A590",border:"#EDE4D9",
  white:"#FFFFFF",bubble:"#F4ECE2",sage:"#A9BC8E",orange:"#D97706",blue:"#5B7FA6",mauveSoft:"#F2EEF6",
  profils:{
    metabolique:{p:"#CB9A79",l:"#FDF4EE",label:"Profil Métabolique",emoji:"⚡"},
    androgenique:{p:"#C2AEBA",l:"#F3EEF3",label:"Profil Androgénique",emoji:"🌿"},
    inflammatoire:{p:"#D4A56A",l:"#FDF0E0",label:"Profil Inflammatoire",emoji:"🔥"},
    surrenalien:{p:"#A89AB8",l:"#F0EDF5",label:"Profil Surrénalien",emoji:"🧠"},
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
  surrenalien:{
    dominant:{label:"Surrénalien",desc:"cortisol · axe HPA · DHEA-S",col:"#A89AB8",em:"🧠"},
    secondaire:{label:"Androgénique",desc:"androgènes surrénaliens",col:"#C2AEBA",em:"🌿"},
    trace:{label:"Métabolique trace",desc:"insuline sous stress",col:"#CB9A79",em:"⚡"},
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
  surrenalien:[
    {n:"01",em:"🧠",t:"Calmer ton axe du stress",col:"#A89AB8",res:["Cortisol qui redescend","Moins d'anxiété","SMOP moins réactif au stress"],quand:"2 à 4 semaines",geste:"Respiration 5s/5s ce soir"},
    {n:"02",em:"🌙",t:"Récupérer ton sommeil",col:"#5B7FA6",res:["Moins de réveils à 3h","Endormissement plus facile","Moins de résistance à l'insuline le lendemain"],quand:"1 à 2 semaines",geste:"Pas d'écran 30 min avant le lit"},
    {n:"03",em:"☕",t:"Arrêter de fouetter tes surrénales",col:"#CB9A79",res:["Énergie plus stable","Moins de coups de barre","Surrénales soutenues"],quand:"2 à 3 semaines",geste:"Pas de café après 14h"},
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

// ─── QUIZ "TON TYPE DE SMOP (SOPK)" ───────────────────────────────────────────────────
const QUIZ_AXES = {
  m:{label:"métabolique",emoji:"⚡",desc:"insuline · glycémie · fringales",col:"#CB9A79"},
  i:{label:"inflammatoire",emoji:"🔥",desc:"fatigue · douleurs · brouillard",col:"#D4A56A"},
  a:{label:"androgénique",emoji:"🌿",desc:"acné · pilosité · cheveux",col:"#C2AEBA"},
  s:{label:"surrénalien",emoji:"🧠",desc:"cortisol · stress · sommeil",col:"#A89AB8"},
  pp:{label:"après la pilule",emoji:"💊",desc:"contexte",col:"#9FB0C4"},
};
const QUIZ_SOPK = [
  {ax:"m",q:"Le poids se loge surtout autour du ventre, et il est difficile à perdre."},
  {ax:"m",q:"L'après-midi, j'ai une forte envie de sucré ou de féculent."},
  {ax:"m",q:"Environ une heure après un gros repas de glucides, je suis somnolente ou dans le brouillard."},
  {ax:"m",q:"Il y a du diabète de type 2 dans ma famille proche."},
  {ax:"m",q:"J'ai des plaques sombres et veloutées (cou, aisselles), ou de petites excroissances de peau."},
  {ax:"m",q:"Entre les repas, si j'attends trop longtemps, je deviens tremblante, irritable ou j'ai des sueurs."},
  {ax:"i",q:"J'ai mal aux articulations, ou des douleurs inexpliquées en général."},
  {ax:"i",q:"Ma digestion est un problème régulier — ballonnements, selles molles ou constipation."},
  {ax:"i",q:"J'ai souvent des maux de tête ou des migraines."},
  {ax:"i",q:"Je me sens fatiguée d'une façon que le sommeil ne répare pas."},
  {ax:"i",q:"Ma peau réagit facilement — rougeurs, eczéma, sensibilité."},
  {ax:"i",q:"Je réagis mal à certains aliments — gluten, laitages — digestion, peau ou énergie."},
  {ax:"a",q:"J'ai de l'acné hormonale — mâchoire, menton, bas du visage."},
  {ax:"a",q:"Mon acné revient toujours aux mêmes endroits et résiste aux crèmes classiques."},
  {ax:"a",q:"J'ai une pilosité qui me gêne — menton, lèvre, ventre, poitrine."},
  {ax:"a",q:"Mes cheveux s'éclaircissent — raie qui s'élargit, tempes, ou chute."},
  {ax:"a",q:"Ma peau et mes cheveux regraissent très vite."},
  {ax:"a",q:"Mes règles sont très espacées ou absentes."},
  {ax:"s",q:"Mes symptômes empirent nettement quand je traverse une période de stress."},
  {ax:"s",q:"Le soir je suis sous tension, le cerveau qui tourne — et le matin je suis à plat."},
  {ax:"s",q:"L'anxiété fait partie de mes plus gros problèmes, pas juste un détail."},
  {ax:"s",q:"Je tiens la journée à la caféine et au sucre, et je m'effondre en fin d'après-midi."},
  {ax:"s",q:"Je me réveille souvent entre 2h et 4h du matin, sans raison."},
  {ax:"s",q:"Mon SMOP est plutôt « maigre » — je ne suis pas en surpoids, mais j'ai les symptômes."},
  {ax:"pp",q:"Mes symptômes sont apparus, ou se sont aggravés, après l'arrêt de la pilule."},
  {ax:"pp",q:"J'avais des cycles réguliers avant la pilule, et c'est devenu irrégulier après l'avoir arrêtée."},
];
const QUIZ_CHOICES = [{v:0,l:"Pas moi"},{v:1,l:"Un peu"},{v:2,l:"Assez"},{v:3,l:"Beaucoup"}];
function computeProfilQuiz(ans){
  const s={m:0,i:0,a:0,s:0}; let pp=0;
  QUIZ_SOPK.forEach((qq,idx)=>{ const v=ans[idx]; if(typeof v!=="number") return; if(qq.ax==="pp") pp+=v; else s[qq.ax]+=v; });
  const total=s.m+s.i+s.a+s.s;
  const pct = total>0 ? {m:Math.round(s.m/total*100),i:Math.round(s.i/total*100),a:Math.round(s.a/total*100),s:Math.round(s.s/total*100)} : {m:25,i:25,a:25,s:25};
  const order=["m","i","a","s"].sort((x,y)=>pct[y]-pct[x]);
  const d1=order[0], d2=order[1];
  let profil, mixte=false, dominant=d1;
  // le surrénalien n'est le profil principal que s'il est EN TÊTE, ou quasi à égalité avec le 1er (≤3 pts)
  if(d1==="s" || (d2==="s" && (pct[d1]-pct.s)<=3)){
    profil="surrenalien"; dominant="s";
  } else {
    // logique sur les 3 axes m/i/a (on ignore l'axe s pour le NOM du profil)
    const mia=["m","i","a"].sort((x,y)=>pct[y]-pct[x]);
    const a1=mia[0], a2=mia[1];
    const gap=pct[a1]-pct[a2];
    dominant=a1;
    // si le surrénalien est le vrai 2e axe, on garde le profil pur dominant (+ note) plutôt qu'un mixte qui mettrait un axe plus faible en avant
    if(order[1]==="s" || gap>=34){ profil = a1==="m"?"metabolique":a1==="i"?"inflammatoire":"androgenique"; }
    else { mixte=true; const pair=[a1,a2].sort().join(""); profil = pair==="am"?"mixte_ma":pair==="im"?"mixte_mi":"mixte_ai"; }
  }
  // forte composante surrénalienne : surrénalien 2e axe ou ≥25% sans être le profil retenu → note, pas un profil de plus
  const surrenal = profil!=="surrenalien" && (order[1]==="s" || pct.s>=25);
  return {profil,mixte,dominant,pct,scores:s,postpill:pp>=3,surrenal};
}
const MARKERS_BY_PROFIL = {
  metabolique:["Glycémie à jeun","Insuline à jeun + HOMA-IR","HbA1c","Bilan lipidique"],
  androgenique:["Testostérone totale et libre","SHBG","DHEA-S","17-OHP"],
  inflammatoire:["CRP-us","TSH (thyroïde)","Ferritine","Vitamine D"],
  surrenalien:["Cortisol (le matin)","DHEA-S","17-OHP"],
  mixte_ma:["Insuline à jeun + HOMA-IR","Testostérone libre","SHBG","DHEA-S"],
  mixte_mi:["Insuline à jeun + HOMA-IR","CRP-us","TSH (thyroïde)"],
  mixte_ai:["Testostérone libre","DHEA-S","CRP-us","SHBG"],
};
const SUIVI_SCALES = {
  humeur:{label:"Humeur",opts:["rude","basse","stable","bonne","lumineuse"],col:"#C98B86"},
  energie:{label:"Énergie",opts:["vide","basse","suffisante","bonne","pleine"],col:"#CB9A79"},
  stress:{label:"Stress",opts:["calme","stable","tendue","à vif","à bout"],col:"#A89AB8"},
};
const SUIVI_SYMPTOMES = [
  {g:"Peau & cheveux",items:[{k:"acne",n:"Acné",d:"visage, mâchoire, dos"},{k:"pilosite",n:"Pilosité",d:"menton, lèvre, ventre"},{k:"cheveux",n:"Cheveux qui tombent",d:"raie, tempes, douche"}]},
  {g:"Ventre & digestion",items:[{k:"ballon",n:"Ballonnements",d:"ventre gonflé le soir"},{k:"digestion",n:"Digestion difficile",d:"transit, inconfort"},{k:"fringale",n:"Fringales de sucre",d:"envie irrépressible"}]},
  {g:"Énergie & tête",items:[{k:"fatigue",n:"Fatigue",d:"que le sommeil ne répare pas"},{k:"brouillard",n:"Brouillard mental",d:"les mots qui manquent"},{k:"douleurs",n:"Douleurs",d:"règles, bas-ventre, articulations"}]},
  {g:"Esprit",items:[{k:"humeurbasse",n:"Humeur basse",d:""},{k:"anxiete",n:"Anxiété",d:""},{k:"irritable",n:"Irritabilité",d:""}]},
];
const APERCU_METRICS = {
  symptomes:{label:"Charge des symptômes",yMax:5,col:"#C0603F",help:"plus c'est bas, mieux c'est"},
  energie:{label:"Énergie",yMax:5,col:"#CB9A79",help:"plus c'est haut, mieux c'est"},
  humeur:{label:"Humeur",yMax:5,col:"#C98B86",help:"plus c'est haut, mieux c'est"},
  stress:{label:"Stress",yMax:5,col:"#A89AB8",help:"plus c'est bas, mieux c'est"},
  sommeil:{label:"Sommeil (h)",yMax:10,col:"#5B7FA6",help:"vise 7 à 9h"},
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
// ig: "bas"|"modere"|"eleve" — prot: g/100g — verdict SMOP (SOPK)
const ALIMENTS = [
  // Protéines animales
  {nom:"Blanc de poulet",cat:"Protéines",ig:"bas",prot:32,kcal:157,sopk:"excellent",note:"protéine maigre idéale — stabilise la glycémie sans pic"},
  {nom:"Blanc de dinde",cat:"Protéines",ig:"bas",prot:29,kcal:136,sopk:"excellent",note:"très riche en protéines, parfait au petit-déjeuner"},
  {nom:"Bœuf maigre",cat:"Protéines",ig:"bas",prot:26,kcal:250,sopk:"bon",note:"riche en fer et zinc — utile contre la chute de cheveux"},
  {nom:"Thon",cat:"Protéines",ig:"bas",prot:26,kcal:140,sopk:"excellent",note:"oméga-3 anti-inflammatoires — privilégie le thon en boîte au naturel"},
  {nom:"Saumon",cat:"Protéines",ig:"bas",prot:22,kcal:206,sopk:"excellent",note:"oméga-3 puissants — excellent pour le terrain inflammatoire"},
  {nom:"Cabillaud",cat:"Protéines",ig:"bas",prot:23,kcal:105,sopk:"excellent",note:"maigre, digeste, riche en protéines"},
  {nom:"Crevette",cat:"Protéines",ig:"bas",prot:24,kcal:99,sopk:"bon",note:"protéine très maigre, riche en zinc"},
  {nom:"Œufs",cat:"Protéines",ig:"bas",prot:12.6,kcal:143,sopk:"excellent",note:"le petit-déjeuner SMOP (SOPK) par excellence — 6g de protéines par œuf"},
  // Produits laitiers
  {nom:"Parmesan",cat:"Laitiers",ig:"bas",prot:29.6,kcal:392,sopk:"bon",note:"très protéiné, à consommer en petite quantité"},
  {nom:"Fromage blanc",cat:"Laitiers",ig:"bas",prot:8,kcal:72,sopk:"excellent",note:"parfait au petit-déjeuner avec des oléagineux"},
  {nom:"Skyr",cat:"Laitiers",ig:"bas",prot:11,kcal:63,sopk:"excellent",note:"ultra protéiné, peu de sucre — idéal SMOP (SOPK)"},
  {nom:"Feta",cat:"Laitiers",ig:"bas",prot:19.7,kcal:265,sopk:"bon",note:"protéinée, à intégrer dans une salade en entrée"},
  {nom:"Mozzarella",cat:"Laitiers",ig:"bas",prot:24,kcal:300,sopk:"bon",note:"bonne source de protéines"},
  // Légumineuses
  {nom:"Lentilles",cat:"Légumineuses",ig:"bas",prot:9,kcal:116,sopk:"excellent",note:"fibres + protéines végétales — index glycémique bas, parfait SMOP (SOPK)"},
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

// ─── RECETTES DÉTAILLÉES (liées aux repas par le nom) ───
const RECETTES = {
  "Œufs brouillés à l'avocat":{
    moment:"matin", tags:["rapide","anti-fringale"], temps:"10 min", pour:"1 personne",
    ingredients:["2 œufs","½ avocat mûr","une poignée de tomates cerises","1 noix de beurre ou filet d'huile d'olive","sel, poivre"],
    etapes:["casse les œufs dans un bol, bats-les avec une pincée de sel.","fais chauffer le beurre à feu doux dans une poêle.","verse les œufs et remue doucement en continu, sans laisser trop cuire — ils doivent rester crémeux.","coupe l'avocat et les tomates cerises pendant ce temps.","sers les œufs avec l'avocat et les tomates à côté. mange les œufs et l'avocat avant les tomates si tu veux lisser encore plus la glycémie."],
    astuce:"feu doux = œufs crémeux et digestes. à feu fort ils deviennent caoutchouteux."
  },
  "Porridge chia-myrtilles":{
    moment:"matin", tags:["à préparer la veille","végé"], temps:"5 min + une nuit", pour:"1 personne",
    ingredients:["3 c. à soupe de graines de chia","200 ml de lait végétal non sucré (amande, coco...)","une poignée de myrtilles","½ c. à café de cannelle de Ceylan (optionnel)"],
    etapes:["dans un bocal, mélange les graines de chia et le lait végétal.","remue bien, attends 5 min, puis remue encore (ça évite les grumeaux).","ferme le bocal et laisse une nuit au frigo.","le matin, ajoute les myrtilles et la cannelle. c'est prêt."],
    astuce:"prépare 2-3 bocaux d'avance pour la semaine. ça se garde 3-4 jours au frigo."
  },
  "Bowl saumon-quinoa":{
    moment:"midi", tags:["anti-fringale"], temps:"20 min", pour:"1 personne",
    ingredients:["1 pavé de saumon (ou 100g)","60g de quinoa cru","½ avocat","une poignée de roquette","1 c. à soupe de graines de courge","huile d'olive, citron, sel"],
    etapes:["rince le quinoa, puis fais-le cuire 12-15 min dans 2 fois son volume d'eau à frémissement.","pendant ce temps, cuis le saumon à la poêle 3-4 min de chaque côté.","égoutte le quinoa, laisse tiédir.","dans un bol : quinoa, roquette, avocat coupé, saumon émietté.","parsème de graines de courge, assaisonne d'huile d'olive et citron."],
    astuce:"le saumon froid du lendemain est parfait dans ce bowl — cuis-en un peu plus la veille."
  },
  "Dahl de lentilles corail":{
    moment:"soir", tags:["végé","batch-cookable","réconfortant"], temps:"25 min", pour:"1 personne",
    ingredients:["80g de lentilles corail","150 ml de lait de coco","½ oignon","1 c. à café de curcuma","un morceau de gingembre frais râpé","une poignée d'épinards","un peu de riz complet (optionnel)"],
    etapes:["fais revenir l'oignon émincé dans un peu d'huile.","ajoute le curcuma et le gingembre, mélange 30 secondes.","ajoute les lentilles corail rincées, le lait de coco et un verre d'eau.","laisse mijoter 15-20 min à feu doux jusqu'à ce que les lentilles soient fondantes.","en fin de cuisson, ajoute les épinards, laisse-les tomber 2 min.","sers tel quel ou avec un peu de riz complet."],
    astuce:"les lentilles corail n'ont pas besoin de trempage — c'est la légumineuse la plus rapide à cuisiner."
  },
  "Houmous & crudités":{
    moment:"collation", tags:["végé","sans cuisson","anti-fringale"], temps:"10 min", pour:"1 personne",
    ingredients:["100g de pois chiches cuits (ou en bocal, égouttés)","1 c. à soupe de tahini (purée de sésame)","jus d'½ citron","1 petite gousse d'ail","filet d'huile d'olive","bâtonnets de concombre, carotte, poivron"],
    etapes:["mets les pois chiches, le tahini, le citron, l'ail et un filet d'huile dans un mixeur.","mixe jusqu'à obtenir une texture lisse — ajoute un peu d'eau si c'est trop épais.","goûte, ajuste le sel et le citron.","coupe les légumes en bâtonnets et trempe-les dans le houmous."],
    astuce:"le houmous se garde 3-4 jours au frigo. parfait en collation anti-fringale à garder prête."
  },
  "Curry de pois chiches":{
    moment:"soir", tags:["végé","batch-cookable","réconfortant"], temps:"25 min", pour:"1 personne",
    ingredients:["150g de pois chiches cuits","150 ml de lait de coco","½ oignon","1 c. à café de curry en poudre","½ c. à café de curcuma","une poignée d'épinards","un peu de riz complet"],
    etapes:["fais revenir l'oignon émincé dans un peu d'huile 3-4 min.","ajoute le curry et le curcuma, mélange 30 secondes pour libérer les arômes.","ajoute les pois chiches et le lait de coco, laisse mijoter 12-15 min.","ajoute les épinards en fin de cuisson, laisse-les fondre 2 min.","sers avec un peu de riz complet."],
    astuce:"curcuma et gingembre sont des épices au profil anti-inflammatoire — parfaites pour le terrain SMOP."
  },
  "Buddha bowl complet":{
    moment:"midi", tags:["végé","nomade","batch-cookable"], temps:"30 min", pour:"1 personne",
    ingredients:["60g de quinoa cru","100g de pois chiches cuits","½ avocat","1 carotte râpée","une poignée d'épinards","1 c. à soupe de tahini","jus de citron, huile d'olive"],
    etapes:["cuis le quinoa 12-15 min, égoutte, laisse tiédir.","fais rôtir les pois chiches à la poêle avec un peu d'huile et des épices jusqu'à ce qu'ils soient dorés.","prépare la sauce : tahini + citron + un peu d'eau pour détendre.","dans un bol, dispose le quinoa, les épinards, la carotte, l'avocat et les pois chiches en sections.","arrose de sauce tahini au moment de servir."],
    astuce:"un bowl, ça se compose à l'avance : prépare les éléments séparément, assemble au dernier moment."
  },
  "Tofu sauté & légumes croquants":{
    moment:"soir", tags:["végé","rapide"], temps:"20 min", pour:"1 personne",
    ingredients:["150g de tofu ferme","1 brocoli (quelques bouquets)","½ poivron","1 c. à soupe de sauce soja","1 c. à café de graines de sésame","un peu de riz complet"],
    etapes:["presse le tofu dans du papier absorbant, coupe-le en cubes.","fais-le dorer à la poêle dans un peu d'huile sur toutes les faces, réserve.","fais sauter le brocoli et le poivron 5-6 min — ils doivent rester croquants.","remets le tofu, ajoute la sauce soja, mélange 1 min.","parsème de graines de sésame, sers avec le riz."],
    astuce:"bien presser le tofu avant cuisson = il dore mieux et absorbe les saveurs."
  },
  "Steak haché & ratatouille":{
    moment:"soir", tags:["batch-cookable"], temps:"30 min", pour:"1 personne",
    ingredients:["1 steak haché 5%","½ courgette","½ aubergine","½ poivron","1 tomate","½ oignon","huile d'olive, herbes de Provence"],
    etapes:["coupe tous les légumes en dés.","fais revenir l'oignon, puis ajoute aubergine et poivron, laisse 5 min.","ajoute courgette et tomate, les herbes, sel, poivre.","laisse mijoter 20 min à feu doux, en remuant de temps en temps.","pendant ce temps, cuis le steak haché à ta convenance. sers ensemble."],
    astuce:"la ratatouille est meilleure réchauffée — fais-en plus, tu l'auras pour 2-3 repas."
  },
  "Papillote de poisson blanc":{
    moment:"soir", tags:["léger le soir","rapide"], temps:"25 min", pour:"1 personne",
    ingredients:["1 filet de cabillaud ou colin","½ courgette en rondelles","quelques tomates cerises","½ citron","filet d'huile d'olive, herbes, sel"],
    etapes:["préchauffe le four à 190°C.","pose le poisson au centre d'une feuille de papier cuisson.","dispose les rondelles de courgette et les tomates autour.","arrose d'huile, de jus de citron, ajoute herbes et sel.","referme la papillote hermétiquement et enfourne 18-20 min."],
    astuce:"la papillote cuit à la vapeur dans son jus : zéro matière grasse ajoutée nécessaire, et c'est ultra digeste le soir."
  },
  "Velouté de courge & œuf mollet":{
    moment:"soir", tags:["léger le soir","réconfortant"], temps:"30 min", pour:"1 personne",
    ingredients:["300g de courge (butternut, potimarron)","½ oignon","1-2 œufs","1 c. à soupe de graines de courge","sel, poivre, filet d'huile d'olive"],
    etapes:["coupe la courge en cubes, fais revenir l'oignon dans une casserole.","ajoute la courge et de l'eau à hauteur, laisse cuire 20 min.","mixe jusqu'à obtenir un velouté lisse, assaisonne.","pour l'œuf mollet : plonge-le 6 min dans l'eau bouillante, puis écale délicatement.","sers le velouté avec l'œuf mollet dessus et les graines de courge."],
    astuce:"on ajoute toujours l'œuf et les graines : la courge seule fait monter la glycémie, les protéines et le gras la lissent."
  },
  "Tartare de saumon & avocat":{
    moment:"soir", tags:["sans cuisson","plaisir"], temps:"15 min", pour:"1 personne",
    ingredients:["120g de saumon très frais (qualité sashimi)","½ avocat","½ citron vert","ciboulette","1 c. à café de graines de sésame","filet d'huile d'olive"],
    etapes:["coupe le saumon en petits dés au couteau.","coupe l'avocat en dés.","mélange délicatement saumon, avocat, jus de citron vert, ciboulette ciselée.","assaisonne d'un filet d'huile et de sel.","parsème de graines de sésame et sers frais."],
    astuce:"utilise du saumon extra-frais (dis à ton poissonnier que c'est pour manger cru), ou du saumon surgelé décongelé pour plus de sécurité."
  },
  "Sardines & salade de pommes de terre":{
    moment:"midi", tags:["petit budget","anti-fringale"], temps:"20 min", pour:"1 personne",
    ingredients:["1 boîte de sardines à l'huile d'olive","2 petites pommes de terre","une poignée de haricots verts","1 œuf dur","moutarde, vinaigre, huile d'olive"],
    etapes:["cuis les pommes de terre à l'eau 15-20 min, laisse-les REFROIDIR (étape importante).","cuis les haricots verts 8 min, l'œuf 9 min.","coupe les pommes de terre froides et l'œuf en rondelles.","prépare une vinaigrette moutarde-vinaigre-huile.","dispose tout dans l'assiette avec les sardines, assaisonne."],
    astuce:"les pommes de terre FROIDES forment de l'amidon résistant, qui lisse la glycémie — bien mieux que chaudes."
  },
  "Pancakes flocons-banane":{
    moment:"matin", tags:["plaisir","week-end"], temps:"15 min", pour:"1 personne",
    ingredients:["3 c. à soupe de flocons d'avoine","1 œuf","½ banane bien mûre","½ c. à café de cannelle de Ceylan","un peu d'huile pour la poêle"],
    etapes:["mixe les flocons d'avoine pour en faire une farine grossière.","écrase la banane à la fourchette, ajoute l'œuf, la farine d'avoine et la cannelle.","mélange jusqu'à obtenir une pâte homogène.","fais cuire de petits pancakes à feu doux, 2 min de chaque côté.","sers avec quelques fruits rouges plutôt que du sirop."],
    astuce:"l'avoine et l'œuf ralentissent l'absorption du sucre de la banane. garde-le pour le week-end."
  },
  "Lunchbox poulet-quinoa":{
    moment:"midi", temps:"20 min", pour:"1 personne", tags:["nomade","batch-cookable","anti-fringale"],
    ingredients:["100g de blanc de poulet","60g de quinoa cru","quelques tomates cerises","½ concombre","une poignée de roquette","huile d'olive, citron"],
    etapes:["cuis le quinoa 12-15 min, égoutte et laisse refroidir.","cuis le poulet à la poêle, coupe-le en lanières.","coupe le concombre et les tomates.","mets tout dans une boîte hermétique : quinoa au fond, légumes et poulet dessus.","mets la vinaigrette à part, à verser au moment de manger."],
    astuce:"vinaigrette à part = la salade ne détrempe pas. parfaite pour la pause déj au boulot."
  },
  "Wrap protéiné à emporter":{
    moment:"midi", temps:"10 min", pour:"1 personne", tags:["nomade","rapide"],
    ingredients:["1 galette de sarrasin ou tortilla complète","2 c. à soupe de houmous","quelques lanières de poulet ou de thon","salade, tomate, concombre râpé"],
    etapes:["étale le houmous sur la galette.","dispose la protéine et les légumes au centre.","roule serré en repliant les bords.","coupe en deux, emballe dans du papier cuisson pour transporter."],
    astuce:"se mange d'une main, sans couverts. l'idéal quand tu es en déplacement."
  },
  "Salade de pois chiches à emporter":{
    moment:"midi", temps:"10 min", pour:"1 personne", tags:["nomade","végé","petit budget","batch-cookable"],
    ingredients:["150g de pois chiches cuits","½ poivron","½ concombre","quelques tomates cerises","feta émiettée (optionnel)","huile d'olive, citron, persil"],
    etapes:["coupe tous les légumes en petits dés.","mélange avec les pois chiches égouttés.","ajoute la feta, l'huile, le citron et le persil.","se transporte parfaitement dans un bocal."],
    astuce:"meilleure le lendemain quand les saveurs ont infusé. prépare-la la veille pour le midi."
  },
  "Œufs durs & bâtonnets (snack-box)":{
    moment:"collation", temps:"12 min", pour:"1 personne", tags:["nomade","rapide","anti-fringale"],
    ingredients:["2 œufs","½ carotte","½ concombre","quelques amandes","une pincée de sel"],
    etapes:["cuis les œufs 9 min dans l'eau bouillante, refroidis-les sous l'eau froide.","coupe la carotte et le concombre en bâtonnets.","mets tout dans une petite boîte avec les amandes.","sale légèrement les œufs."],
    astuce:"la snack-box anti-fringale parfaite à garder dans ton sac. protéines + fibres + bons gras."
  },
  "Overnight oats protéiné":{
    moment:"matin", temps:"5 min + une nuit", pour:"1 personne", tags:["nomade","à préparer la veille","sans cuisson"],
    ingredients:["4 c. à soupe de flocons d'avoine","1 c. à soupe de graines de chia","150 ml de lait végétal non sucré","1 c. à soupe de fromage blanc ou skyr","quelques fruits rouges","cannelle"],
    etapes:["dans un bocal, mélange l'avoine, les graines de chia et le lait.","ajoute le skyr pour la dose de protéines.","ferme et laisse une nuit au frigo.","le matin, ajoute fruits rouges et cannelle. à emporter tel quel."],
    astuce:"se mange direct dans le bocal au bureau. plus rassasiant qu'un porridge classique grâce au skyr."
  },
  "Soupe-repas express":{
    moment:"soir", temps:"20 min", pour:"1 personne", tags:["réconfortant","léger le soir","batch-cookable"],
    ingredients:["1 courgette","1 poireau","½ brocoli","100g de pois chiches ou 1 œuf","bouillon, huile d'olive"],
    etapes:["coupe les légumes en morceaux.","fais-les revenir 5 min, couvre de bouillon.","laisse cuire 12-15 min.","mixe ou laisse en morceaux selon ton envie.","ajoute les pois chiches ou un œuf poché pour les protéines."],
    astuce:"toujours une protéine dans la soupe, sinon tu as faim 1h après. se garde 3 jours, se transporte en thermos."
  },
  "Bowl de skyr salté":{
    moment:"matin", temps:"5 min", pour:"1 personne", tags:["rapide","sans cuisson","anti-fringale"],
    ingredients:["150g de skyr ou fromage blanc","½ avocat","quelques tomates cerises","graines de courge","sel, poivre, huile d'olive"],
    etapes:["mets le skyr dans un bol.","ajoute l'avocat coupé et les tomates.","parsème de graines de courge.","sale, poivre, filet d'huile. version salée du petit-déj."],
    astuce:"surprenant mais ultra rassasiant. parfait si tu n'aimes pas le sucré le matin."
  },
  "Galette de sarrasin œuf-épinards":{
    moment:"midi", temps:"15 min", pour:"1 personne", tags:["rapide","végé"],
    ingredients:["1 galette de sarrasin","1 œuf","une poignée d'épinards","un peu de fromage râpé (optionnel)"],
    etapes:["fais chauffer la galette à la poêle.","casse l'œuf au centre, ajoute les épinards autour.","laisse cuire jusqu'à ce que le blanc soit pris.","replie les bords de la galette et sers."],
    astuce:"le sarrasin a un index modéré et est sans gluten. un déjeuner complet en 15 min."
  },
  "Poêlée haricots-œuf":{
    moment:"soir", temps:"15 min", pour:"1 personne", tags:["rapide","léger le soir","petit budget"],
    ingredients:["une portion de haricots verts","2 œufs","½ oignon","ail","huile d'olive, sel"],
    etapes:["fais revenir l'oignon et l'ail.","ajoute les haricots verts (frais ou surgelés), laisse cuire 8 min.","casse les œufs par-dessus, couvre 3 min.","sale, poivre, sers chaud."],
    astuce:"un dîner express, léger et protéiné, quand le frigo est presque vide."
  },
  "Salade complète thon-haricots":{
    moment:"midi", temps:"10 min", pour:"1 personne", tags:["nomade","rapide","petit budget"],
    ingredients:["1 boîte de thon au naturel","100g de haricots blancs cuits","½ oignon rouge","tomates","persil","huile d'olive, citron"],
    etapes:["égoutte le thon et les haricots.","émince finement l'oignon rouge.","mélange tout avec les tomates coupées et le persil.","assaisonne d'huile et de citron."],
    astuce:"protéines + fibres, zéro cuisson, se transporte. idéale les jours sans temps."
  },
  "Chia pudding cacao":{
    moment:"collation", temps:"5 min + 2h", pour:"1 personne", tags:["végé","à préparer la veille","plaisir"],
    ingredients:["3 c. à soupe de graines de chia","150 ml de lait végétal","1 c. à café de cacao non sucré","quelques copeaux de chocolat 85%"],
    etapes:["mélange chia, lait et cacao.","remue, attends 5 min, remue encore.","laisse prendre 2h ou une nuit au frigo.","ajoute les copeaux de chocolat avant de servir."],
    astuce:"l'envie de sucré sans le pic glycémique. le chia cale durablement."
  },
  "Assiette froide complète":{
    moment:"midi", temps:"10 min", pour:"1 personne", tags:["nomade","sans cuisson","rapide"],
    ingredients:["100g de jambon blanc sans nitrites ou blanc de poulet","½ avocat","quelques radis","une poignée de noix","crudités au choix"],
    etapes:["dispose la protéine, l'avocat et les crudités dans une boîte.","ajoute les noix pour les bons gras.","un filet d'huile d'olive, sel, poivre.","zéro cuisson, prêt à emporter."],
    astuce:"la solution « j'ai rien préparé » : juste assembler. plus rassasiant qu'un sandwich."
  },
  "Curry de légumes & lentilles":{
    moment:"soir", temps:"25 min", pour:"1 personne", tags:["végé","batch-cookable","réconfortant"],
    ingredients:["80g de lentilles vertes","½ courgette","½ poivron","100 ml de lait de coco","1 c. à café de curry","½ oignon"],
    etapes:["cuis les lentilles 18 min, égoutte.","fais revenir l'oignon, ajoute le curry.","ajoute les légumes coupés, laisse 8 min.","ajoute lentilles et lait de coco, mijote 5 min."],
    astuce:"les lentilles vertes ont un index plus bas que les corail. encore meilleur réchauffé."
  },
  "Toast avocat-œuf poé":{
    moment:"matin", temps:"10 min", pour:"1 personne", tags:["rapide"],
    ingredients:["1 tranche de pain complet au levain","½ avocat","1 œuf","citron, sel, poivre, graines"],
    etapes:["fais griller le pain.","écrase l'avocat dessus avec un peu de citron.","fais un œuf poé (3 min dans l'eau frémissante vinaigrée).","pose l'œuf sur l'avocat, parsème de graines."],
    astuce:"le pain au levain a un index plus bas que le pain classique. un petit-déj de café à la maison."
  },
  "Salade tiède lentilles-saumon":{
    moment:"midi", temps:"20 min", pour:"1 personne", tags:["anti-fringale","batch-cookable"],
    ingredients:["80g de lentilles vertes","1 pavé de saumon","½ échalote","persil","moutarde, huile d'olive, vinaigre"],
    etapes:["cuis les lentilles 18 min.","cuis le saumon à la poêle 3-4 min par face.","prépare une vinaigrette moutarde.","mélange lentilles tièdes, échalote, persil, ajoute le saumon émietté."],
    astuce:"lentilles + saumon = fer, protéines, oméga-3. un combo top pour le SMOP."
  },
  "Omelette roulée à emporter":{
    moment:"matin", temps:"10 min", pour:"1 personne", tags:["nomade","rapide","batch-cookable"],
    ingredients:["2-3 œufs","½ poivron","quelques épinards","sel, poivre"],
    etapes:["bats les œufs avec sel et poivre.","ajoute le poivron coupé fin et les épinards.","cuis en une fine omelette à la poêle.","roule-la sur elle-même, laisse refroidir, coupe en tronçons."],
    astuce:"se mange froide, d'une main, sans couverts. parfaite pour la lunchbox ou le train."
  },
  "Velouté brocoli express":{
    moment:"soir", temps:"15 min", pour:"1 personne", tags:["rapide","léger le soir","végé"],
    ingredients:["½ brocoli","½ pomme de terre","½ oignon","1 œuf dur ou portion de fromage","bouillon"],
    etapes:["fais revenir l'oignon, ajoute brocoli et pomme de terre.","couvre de bouillon, cuis 12 min.","mixe jusqu'à obtenir un velouté lisse.","sers avec un œuf dur écrasé ou un peu de fromage pour les protéines."],
    astuce:"le brocoli est un crucifère qui soutient l'élimination des androgènes. un velouté malin."
  },
  "Bowl de quinoa froid à emporter":{
    moment:"midi", temps:"20 min", pour:"1 personne", tags:["nomade","végé","batch-cookable"],
    ingredients:["60g de quinoa","100g de pois chiches","½ avocat","tomates séchées","roquette","graines de courge"],
    etapes:["cuis le quinoa, laisse refroidir complètement.","mélange avec les pois chiches et les tomates séchées.","ajoute l'avocat et la roquette au moment de manger.","parsème de graines de courge."],
    astuce:"le quinoa froid se transporte parfaitement. ajoute l'avocat sur place pour qu'il ne noircisse pas."
  },
  "Cabillaud poché minute":{
    moment:"soir", temps:"15 min", pour:"1 personne", tags:["léger le soir","rapide"],
    ingredients:["1 dos de cabillaud","bouillon de légumes","½ courgette","quelques tomates cerises","citron, herbes"],
    etapes:["porte le bouillon à frémissement.","ajoute la courgette en rondelles, cuis 5 min.","dépose le cabillaud, pochez 6-8 min à feu doux.","sers avec un trait de citron et les herbes."],
    astuce:"le pochage garde le poisson moelleux sans matière grasse. ultra digeste pour le soir."
  },
  "Pomme cannelle & beurre d'amande":{
    moment:"collation", tags:["rapide","sans cuisson","anti-fringale"], temps:"3 min", pour:"1 personne",
    ingredients:["1 pomme","1 c. à soupe de beurre d'amande (100% amandes)","une pincée de cannelle de Ceylan"],
    etapes:["coupe la pomme en quartiers.","saupoudre de cannelle.","trempe dans le beurre d'amande."],
    astuce:"la pomme seule fait monter la glycémie. avec le beurre d'amande (gras + protéines), le pic est lissé. la cannelle aide aussi la sensibilité à l'insuline."
  },
  "Energy balls dattes-cacao":{
    moment:"collation", tags:["végé","batch-cookable","plaisir"], temps:"15 min", pour:"6 boules",
    ingredients:["6 dattes dénoyautées","50g de poudre d'amande","1 c. à soupe de cacao non sucré","1 c. à soupe de graines de chia","un peu d'eau si besoin"],
    etapes:["mixe les dattes jusqu'à obtenir une pâte.","ajoute la poudre d'amande, le cacao et les graines de chia.","mixe encore, forme des petites boules à la main.","réserve au frigo 30 min pour qu'elles se tiennent."],
    astuce:"2 boules max en collation. la poudre d'amande et le chia compensent le sucre des dattes. garde-les au frigo pour la semaine."
  },
  "Yaourt grec, noix & graines":{
    moment:"collation", tags:["rapide","sans cuisson","anti-fringale"], temps:"3 min", pour:"1 personne",
    ingredients:["1 yaourt grec nature (ou skyr)","quelques noix","1 c. à café de graines de courge","½ c. à café de cannelle","quelques fruits rouges (optionnel)"],
    etapes:["verse le yaourt grec dans un bol.","ajoute les noix concassées et les graines.","saupoudre de cannelle, ajoute les fruits rouges."],
    astuce:"le yaourt grec est plus protéiné que le yaourt classique. l'en-cas anti-fringale parfait de 16h."
  },
  "Toast d'avocat & œuf dur":{
    moment:"collation", tags:["rapide","anti-fringale"], temps:"12 min", pour:"1 personne",
    ingredients:["1 tranche de pain complet au levain","½ avocat","1 œuf dur","citron, sel, poivre"],
    etapes:["fais cuire l'œuf 9 min, refroidis-le.","grille le pain.","écrase l'avocat dessus avec un peu de citron.","ajoute l'œuf dur en rondelles, sel et poivre."],
    astuce:"un en-cas qui tient au corps : fibres, bons gras, protéines. bien plus rassasiant qu'une barre de céréales."
  },
  "Houmous de betterave & bâtonnets":{
    moment:"collation", tags:["végé","batch-cookable","petit budget"], temps:"10 min", pour:"2 portions",
    ingredients:["100g de pois chiches cuits","1 petite betterave cuite","1 c. à soupe de tahini","jus d'½ citron","bâtonnets de légumes"],
    etapes:["mixe les pois chiches, la betterave, le tahini et le citron.","ajoute un peu d'eau pour la texture.","sers avec des bâtonnets de carotte et concombre."],
    astuce:"la betterave donne une couleur rose magnifique et des fibres en plus. se garde 3 jours au frigo."
  },
  "Cottage cheese & concombre":{
    moment:"collation", tags:["rapide","sans cuisson","anti-fringale"], temps:"3 min", pour:"1 personne",
    ingredients:["100g de cottage cheese (ou fromage blanc égoutté)","½ concombre","ciboulette","poivre, filet d'huile d'olive"],
    etapes:["mets le cottage cheese dans un bol.","ajoute le concombre en dés et la ciboulette.","poivre, filet d'huile."],
    astuce:"très riche en protéines, très peu de glucides. idéal si tu as faim mais que ce n'est pas l'heure du repas."
  },
  "Carré de chocolat 85% & amandes":{
    moment:"collation", tags:["rapide","sans cuisson","plaisir"], temps:"1 min", pour:"1 personne",
    ingredients:["2 carrés de chocolat noir 85%","une petite poignée d'amandes"],
    etapes:["savoure 2 carrés de chocolat noir.","accompagne d'une poignée d'amandes."],
    astuce:"l'envie de sucré gérée intelligemment : le 85% a peu de sucre, les amandes apportent le gras qui rassasie. mange en pleine conscience."
  },
  "Smoothie vert protéiné":{
    moment:"collation", tags:["rapide","végé","nomade"], temps:"5 min", pour:"1 personne",
    ingredients:["une poignée d'épinards frais","½ avocat","½ banane","150 ml de lait végétal non sucré","1 c. à soupe de graines de chia"],
    etapes:["mets tous les ingrédients dans un blender.","mixe jusqu'à obtenir une texture lisse.","bois aussitôt ou emporte dans une bouteille."],
    astuce:"l'avocat et le chia transforment ce smoothie en vraie collation rassasiante, pas juste un jus sucré. parfait à emporter."
  },
  "Œufs cocotte aux épinards":{
    moment:"matin", tags:["végé"], temps:"15 min", pour:"1 personne",
    ingredients:["2 œufs","une poignée d'épinards","1 c. à soupe de crème de soja","sel, poivre, muscade"],
    etapes:["préchauffe le four à 180°C.","fais tomber les épinards à la poêle 2 min.","répartis-les dans un ramequin, casse les œufs dessus.","ajoute la crème, sel, poivre, muscade.","enfourne 10-12 min."],
    astuce:"un petit-déj salué et réconfortant pour le week-end. les épinards ajoutent fer et fibres."
  },
  "Salade quinoa-feta-menthe":{
    moment:"midi", tags:["nomade","végé","batch-cookable"], temps:"20 min", pour:"1 personne",
    ingredients:["60g de quinoa","40g de feta","½ concombre","menthe fraîche","tomates cerises","huile d'olive, citron"],
    etapes:["cuis le quinoa, laisse refroidir.","coupe le concombre et les tomates en dés.","émiette la feta, ciselle la menthe.","mélange tout avec huile et citron."],
    astuce:"se transporte parfaitement en bocal. la menthe verte est même intéressante pour le terrain SMOP (étude sur la spearmint)."
  },
  "Poulet teriyaki maison & riz complet":{
    moment:"soir", tags:["batch-cookable"], temps:"25 min", pour:"1 personne",
    ingredients:["100g de blanc de poulet","1 c. à soupe de sauce soja","1 c. à café de miel","gingembre râpé","brocoli","50g de riz complet"],
    etapes:["cuis le riz complet selon le paquet.","coupe le poulet en dés, fais-le dorer à la poêle.","ajoute soja, miel et gingembre, laisse caraméliser 3 min.","cuis le brocoli vapeur à côté.","sers le poulet sur le riz avec le brocoli."],
    astuce:"version maison du teriyaki, sans les sucres ajoutés des sauces industrielles. juste une pointe de miel."
  },
  "Soupe lentilles-coco réconfort":{
    moment:"soir", tags:["végé","batch-cookable","réconfortant"], temps:"25 min", pour:"2 portions",
    ingredients:["80g de lentilles corail","150 ml de lait de coco","1 carotte","½ oignon","1 c. à café de curcuma","bouillon"],
    etapes:["fais revenir l'oignon et la carotte en dés.","ajoute le curcuma, puis les lentilles, le lait de coco et le bouillon.","laisse mijoter 18 min.","mixe pour une texture veloutée ou laisse en morceaux."],
    astuce:"les lentilles apportent protéines et fibres : cette soupe cale vraiment, contrairement à une soupe de légumes seule. se garde 3 jours."
  },
  "Bowl thon-avocat-edamame":{
    moment:"midi", tags:["nomade","rapide","anti-fringale"], temps:"10 min", pour:"1 personne",
    ingredients:["1 boîte de thon au naturel","½ avocat","une poignée d'edamame cuits","½ carotte râpée","sauce soja, graines de sésame"],
    etapes:["égoutte le thon, dispose-le dans une boîte.","ajoute l'avocat, les edamame et la carotte.","assaisonne d'un peu de soja et de graines de sésame."],
    astuce:"riche en protéines (thon + edamame) et bons gras. se transporte, se mange froid : top pour le bureau."
  },
  "Crackers de sarrasin & guacamole":{
    moment:"collation", tags:["végé","rapide"], temps:"8 min", pour:"1 personne",
    ingredients:["quelques crackers de sarrasin ou pain des fleurs","½ avocat","jus de citron","½ tomate","sel, poivre"],
    etapes:["écrase l'avocat avec le citron, sel et poivre.","ajoute la tomate en petits dés.","tartine sur les crackers de sarrasin."],
    astuce:"le sarrasin a un index plus bas que les crackers de blé. une collation croûillante sans pic de glycémie."
  },
  "Chia-coco à la mangue":{
    moment:"collation", tags:["végé","à préparer la veille","plaisir"], temps:"5 min + 2h", pour:"1 personne",
    ingredients:["3 c. à soupe de graines de chia","150 ml de lait de coco","quelques dés de mangue fraîche","noix de coco râpée"],
    etapes:["mélange le chia et le lait de coco.","remue, attends 5 min, remue encore.","laisse prendre 2h au frigo.","ajoute la mangue et la coco râpée avant de servir."],
    astuce:"un désert sain qui calme l'envie de sucré. la mangue en petite quantité + le gras du coco = pas de pic."
  },
  "Crevettes sautées & courgettes":{
    moment:"soir", tags:["rapide","léger le soir"], temps:"15 min", pour:"1 personne",
    ingredients:["120g de crevettes décortiquées","1 courgette","1 gousse d'ail","persil","citron, huile d'olive"],
    etapes:["coupe la courgette en demi-rondelles.","fais-la revenir 6-7 min à la poêle.","ajoute l'ail et les crevettes, cuis 3-4 min.","finis avec persil, citron, un filet d'huile."],
    astuce:"protéiné et très léger : parfait le soir, quand la digestion doit être facile pour bien dormir."
  },
};

const REPAS = [
  // ── PETITS-DÉJEUNERS ──
  {moment:"matin",nom:"Œufs brouillés à l'avocat",
   compo:"2 œufs brouillés + ½ avocat + tomates cerises + thé vert ou café sans sucre",
   pourquoi:"protéines + bons gras = aucun pic de glycémie. tu tiens jusqu'au déjeuner sans fringale.",
   prot:"~20g",tags:["rapide","anti-fringale"],profils:[],
   recette:{temps:"10 min",ingredients:["2 œufs","½ avocat mûr","une poignée de tomates cerises","1 c. à café d'huile d'olive ou de beurre","sel, poivre"],etapes:["casse les 2 œufs dans un bol, bats-les à la fourchette avec une pincée de sel","fais chauffer l'huile à feu doux dans une poêle","verse les œufs et remue doucement en continu jusqu'à la texture crémeuse (ne pas trop cuire)","coupe l'avocat en tranches et les tomates cerises en deux","dresse les œufs avec l'avocat et les tomates à côté, poivre et sers"]}},
  {moment:"matin",nom:"Skyr, oléagineux & cannelle",
   compo:"150g de skyr nature + 1 poignée d'amandes + ½ c. à café de cannelle de Ceylan + quelques myrtilles",
   pourquoi:"le skyr est très protéiné, les amandes apportent de bons gras, la cannelle de Ceylan soutient la glycémie.",
   prot:"~17g",tags:["rapide","sans cuisson"],profils:["metabolique"]},
  {moment:"matin",nom:"Porridge chia-myrtilles",
   compo:"3 c. à soupe de graines de chia + lait végétal non sucré + myrtilles, laissé une nuit au frigo",
   pourquoi:"les graines de chia apportent des oméga-3 qui soutiennent le terrain anti-inflammatoire. à préparer la veille.",
   prot:"~10g",tags:["végé","à préparer la veille"],profils:["inflammatoire"],
   recette:{temps:"5 min + une nuit",ingredients:["3 c. à soupe de graines de chia","200ml de lait végétal non sucré","une poignée de myrtilles","½ c. à café de cannelle de Ceylan","quelques amandes effilées (optionnel)"],etapes:["mélange les graines de chia, le lait végétal et la cannelle dans un bocal","remue bien pour éviter les grumeaux, attends 5 min puis remue encore","ferme le bocal et laisse une nuit au réfrigérateur","le matin, le mélange a la texture d'un pudding","ajoute les myrtilles et les amandes effilées par-dessus, et déguste"]}},
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
   prot:"~30g",tags:["rassasiant","anti-fringale"],profils:["inflammatoire","androgenique"],
   recette:{temps:"20 min",ingredients:["1 pavé de saumon (env. 120g)","50g de quinoa cru","½ avocat","une poignée de roquette","1 c. à soupe de graines de courge","huile d'olive, citron, sel"],etapes:["rince le quinoa, puis cuis-le 12-15 min dans 2 fois son volume d'eau bouillante salée","pendant ce temps, cuis le saumon à la poêle 3-4 min de chaque côté (ou au four)","égoutte le quinoa et laisse-le tiédir","dans un bol, dispose le quinoa, la roquette, l'avocat en tranches et le saumon émietté","parsème de graines de courge, arrose d'huile d'olive et de citron, sale légèrement"]}},
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
   prot:"~16g",tags:["végé","batch-cookable"],profils:["inflammatoire"],
   recette:{temps:"25 min",ingredients:["1 boîte de pois chiches (240g égouttés)","100ml de lait de coco","une poignée d'épinards frais","1 c. à café de curcuma","1 c. à café de gingembre râpé","½ oignon","30g de riz complet (optionnel)","huile d'olive, sel"],etapes:["fais revenir l'oignon émincé dans un peu d'huile à feu moyen","ajoute le curcuma et le gingembre, mélange 30 secondes pour libérer les arômes","ajoute les pois chiches égouttés et le lait de coco, laisse mijoter 10 min","incorpore les épinards en fin de cuisson jusqu'à ce qu'ils fondent","sale, et sers avec un peu de riz complet si tu veux un repas plus consistant"]}},
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
   prot:"~18g",tags:["végé","batch-cookable"],profils:["metabolique"],
   recette:{temps:"25 min",ingredients:["50g de quinoa cru","½ boîte de pois chiches (120g)","½ avocat","1 carotte","une poignée d'épinards","1 c. à soupe de tahini","jus de ½ citron","huile d'olive, sel, paprika"],etapes:["cuis le quinoa 12-15 min dans 2 fois son volume d'eau salée","égoutte les pois chiches, assaisonne-les de paprika et fais-les rôtir 15 min à la poêle ou au four jusqu'à ce qu'ils dorent","râpe la carotte, coupe l'avocat en tranches","prépare la sauce : mélange le tahini, le jus de citron, un filet d'eau et une pincée de sel","dans un bol, dispose le quinoa, les épinards, la carotte, les pois chiches et l'avocat, puis nappe de sauce tahini"]}},
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

// ─── COMPLÉMENTS SMOP (SOPK) ─────────────────────────────────────────────────────────
const COMPLEMENTS = [
  {nom:"Inositol (myo + D-chiro 40:1)",pour:["metabolique","mixte_ma","mixte_mi"],dose:"2g myo + 50mg D-chiro, 2x/jour",timing:"matin et soir",effet:"améliore la sensibilité à l'insuline et réduit les androgènes ovariens",delai:"8 à 12 semaines",note:"l'un des compléments les mieux étudiés dans le SMOP"},
  {nom:"Magnésium bisglycinate",pour:["metabolique","inflammatoire","androgenique","surrenalien","mixte_ma","mixte_mi","mixte_ai"],dose:"200 à 400mg",timing:"le soir au coucher",effet:"améliore la sensibilité à l'insuline, réduit le cortisol, améliore le sommeil",delai:"2 à 4 semaines",note:"carencé chez la majorité des femmes SMOP — particulièrement utile sur un terrain stress/sommeil"},
  {nom:"Zinc",pour:["androgenique","inflammatoire","mixte_ma","mixte_ai"],dose:"15 à 25mg",timing:"avec un repas, jamais à jeun",effet:"pourrait moduler l'activité de la 5-alpha-réductase (impliquée dans la DHT), soutien de la peau, anti-inflammatoire",delai:"6 à 12 semaines",note:"souvent évoqué pour l'acné et la chute de cheveux — preuves spécifiques au SMOP encore préliminaires"},
  {nom:"Vitamine D3 + K2",pour:["metabolique","inflammatoire","androgenique","surrenalien","mixte_ma","mixte_mi","mixte_ai"],dose:"2000 à 4000 UI",timing:"avec un repas gras",effet:"améliore la sensibilité à l'insuline, soutient l'équilibre hormonal",delai:"4 à 8 semaines",note:"toujours D3 + K2 ensemble, jamais D seule"},
  {nom:"Oméga-3 (EPA/DHA)",pour:["inflammatoire","mixte_mi","mixte_ai"],dose:"1 à 2g d'EPA+DHA",timing:"avec un repas",effet:"réduit l'inflammation de fond, soutient l'humeur",delai:"4 à 8 semaines",note:"privilégie une source purifiée en métaux lourds"},
  {nom:"Oméga-3",pour:["metabolique","androgenique","surrenalien","mixte_ma"],dose:"1g d'EPA+DHA",timing:"avec un repas",effet:"soutien anti-inflammatoire général, soutien de l'humeur",delai:"4 à 8 semaines",note:"utile pour tous les profils en soutien"},
  {nom:"Ashwagandha (extrait standardisé)",pour:["surrenalien"],dose:"300 à 600mg d'extrait",timing:"le soir, ou matin et soir",effet:"contribue à réduire le cortisol et la perception du stress (données générales, hors SMOP)",delai:"4 à 8 semaines",note:"pas d'étude spécifique au SMOP : agit sur le terrain stress, pas sur les ovaires. à éviter / demander un avis médical si traitement thyroïdien, sédatifs, grossesse ou allaitement. c'est la plante au cœur de ta Serenitea."},
  {nom:"N-acétylcystéine (NAC)",pour:["metabolique","androgenique","inflammatoire","mixte_ma","mixte_mi","mixte_ai"],dose:"600mg, 2 à 3x/jour",timing:"avec les repas",effet:"antioxydant ; étudié pour soutenir la sensibilité à l'insuline et l'ovulation dans le SMOP",delai:"8 à 12 semaines",note:"données encourageantes mais à confirmer ; demande un avis médical, surtout en cas de traitement."},
  {nom:"Berbérine",pour:["metabolique","mixte_ma","mixte_mi"],dose:"500mg, 2 à 3x/jour",timing:"avant les repas",effet:"soutient la glycémie et la sensibilité à l'insuline (effets observés dans plusieurs études sur le SMOP)",delai:"8 à 12 semaines",note:"interactions médicamenteuses possibles (dont diabète) ; déconseillée en grossesse/allaitement. avis médical requis avant de commencer."},
];

// ─── LOCALSTORAGE ─────────────────────────────────────────────────────────────
const save = (key, val) => { try { localStorage.setItem("sopklife_"+key, JSON.stringify(val)); } catch(e) {} };
const load = (key, def) => { try { const v = localStorage.getItem("sopklife_"+key); return v ? JSON.parse(v) : def; } catch(e) { return def; } };

// ─── SUPABASE (comptes + sauvegarde cloud) ───────────────────────────────────
const SUPABASE_URL = "https://jclummzuukxasfylzruy.supabase.co";
const SUPABASE_KEY = "sb_publishable_wrT10HfVR6p2CeP7feMHUw_p1OD5E-C";
// Clé publique VAPID (sans danger côté client — identifie l'app auprès des téléphones)
const VAPID_PUBLIC = "BHV0QWrRB3Mf8NNBhpEhuPJD1SDhf7gaq1MUpFw1Sl6Mb_meU5IPK1ZrM7FolTxNTlG-9atSocCkjo_7QzUFUEM";
const urlB64ToUint8 = (base64)=>{ const pad="=".repeat((4-base64.length%4)%4); const b=(base64+pad).replace(/-/g,"+").replace(/_/g,"/"); const raw=atob(b); const arr=new Uint8Array(raw.length); for(let i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i); return arr; };
let _sbPromise = null;
const getSupabase = () => {
  if(!_sbPromise){
    _sbPromise = import("https://esm.sh/@supabase/supabase-js@2")
      .then(m => m.createClient(SUPABASE_URL, SUPABASE_KEY, { auth:{ persistSession:true, autoRefreshToken:true } }));
  }
  return _sbPromise;
};
// miroir localStorage <-> cloud : on sauvegarde tout le bloc "sopklife_*"
const collectLocal = () => { const o={}; try { for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k && k.indexOf("sopklife_")===0) o[k]=localStorage.getItem(k); } } catch(e){} return o; };
const applyLocal = (obj) => { try { Object.entries(obj||{}).forEach(([k,v])=>{ if(k && k.indexOf("sopklife_")===0 && typeof v==="string") localStorage.setItem(k,v); }); } catch(e){} };
const authErrFr = (msg="") => {
  const m=String(msg).toLowerCase();
  if(m.includes("invalid login")) return "Email ou mot de passe incorrect.";
  if(m.includes("already registered")) return "Un compte existe déjà avec cet email. Connecte-toi.";
  if(m.includes("password")) return "Ton mot de passe doit faire au moins 6 caractères.";
  if(m.includes("email")) return "Vérifie ton adresse email.";
  return "Une erreur est survenue, réessaie.";
};

// ─── 15 FICHES SOS ───────────────────────────────────────────────────────────

// ─── COACH MINDSET KAMILA ───
// états émotionnels → message de Kamila (à retoucher par Ghiz, voix authentique)
const MINDSET = [
  {id:"decouragee", emoji:"😔", label:"découragée",
   message:"ok. respire un coup ma go.\n\nle découragement avec le SMOP c'est pas un manque de volonté — c'est l'épuisement d'avoir essayé mille trucs sans qu'on t'explique vraiment ton corps.\n\nt'as le droit d'en avoir marre. vraiment.\n\nmais regarde : t'es là, t'as ouvert l'app. c'est déjà un pas que beaucoup ne font pas. on n'a pas besoin d'un grand soir, juste du prochain petit geste. un seul.",
   geste:"fais juste UNE chose aujourd'hui. ta mission du jour, rien de plus. le reste attendra."},
  {id:"anxieuse", emoji:"😰", label:"anxieuse",
   message:"je suis là. pose-toi deux secondes avec moi.\n\nl'anxiété et le SMOP c'est un duo connu — tes hormones rendent ton système nerveux plus à vif. c'est pas toi qui « dramatises ». c'est biologique.\n\nlà maintenant t'as pas besoin de tout régler. juste de faire redescendre la vague.",
   geste:"respire avec moi : inspire 4 secondes, expire 6 secondes. cinq fois. l'expiration longue, c'est ce qui calme tout le système."},
  {id:"frustree", emoji:"😤", label:"frustrée",
   message:"t'as raison d'être frustrée. je vais pas te dire « reste positive », ça serait insultant.\n\nle SMOP c'est injuste. les résultats sont lents, le corps fait ce qu'il veut, et personne autour comprend vraiment. y'a de quoi péter un câble.\n\nmais la frustration, c'est aussi le signe que tu veux que ça change. et ça, c'est une force — pas un défaut.",
   geste:"défoule-toi pour de vrai : une marche rapide, de la musique fort, bouge ton corps. la frustration a besoin de sortir, pas d'être ravalée."},
  {id:"seule", emoji:"🤍", label:"seule",
   message:"se sentir seule avec ce truc, c'est un des poids les plus lourds. je le sais, je l'ai vécu.\n\npersonne autour comprend vraiment ce que c'est de se battre avec son propre corps tous les jours. et ça isole grave.\n\nmais là, maintenant, t'es pas seule. on est des milliers de Cysters à vivre exactement ça. moi la première.",
   geste:"écris un mot dans la communauté Cysters, ou à quelqu'un de confiance. juste un message. briser le silence, ça allège déjà."},
  {id:"epuisee", emoji:"😩", label:"épuisée",
   message:"t'es pas paresseuse. t'es épuisée. c'est pas pareil et c'est important.\n\nton corps porte une charge invisible — hormonale, glycémique, mentale — que personne ne voit. forcément, ça vide.\n\naujourd'hui, l'objectif c'est pas la performance. c'est de tenir, doucement. et c'est largement suffisant.",
   geste:"autorise-toi le repos sans culpabiliser. une vraie pause, de l'eau, une protéine. ton corps récupère mieux quand tu le brusques pas."},
  {id:"mal", emoji:"🌧️", label:"pas dans mon assiette",
   message:"pas besoin de mettre un mot précis dessus. parfois on est juste... pas bien. et c'est ok.\n\navec le SMOP, l'humeur peut tanguer sans raison apparente — c'est les hormones qui jouent en coulisses. tu fais pas semblant, c'est réel.\n\nsois douce avec toi aujourd'hui. comme tu le serais avec une amie qui file pas le moral.",
   geste:"fais un truc qui te fait du bien, même minuscule : une douche chaude, ta série, l'air dehors. pas pour « te soigner », juste pour souffler."},
  {id:"bien", emoji:"✨", label:"plutôt bien",
   message:"ah ça fait plaisir ça ma go !\n\nprends une seconde pour le savourer pour de vrai. les bons jours avec le SMOP, on les mérite et on les célèbre.\n\net retiens cette sensation : c'est la preuve que ton corps PEUT aller mieux. garde-la en tête les jours plus durs — ils repasseront, et celui-là aussi reviendra.",
   geste:"profite, et si tu peux, note dans ton journal ce qui va bien aujourd'hui. ça te servira de preuve les jours gris."},
];

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
    kamila:"chaque fringale que tu comprends est une fringale que tu subis moins la prochaine fois.",
    secret:"la fringale de l'après-midi vient souvent d'un petit-déjeuner trop sucré le matin — même un « healthy » jus + granola. le pic du matin programme la chute de 16h. règle ton matin, et la fringale de l'aprèm s'efface souvent toute seule. la cause n'est pas là où tu crois.",
    monMot:"longtemps, chaque craquage me faisait honte. je pensais manquer de contrôle, je me promettais d'être plus forte la prochaine fois — et à 16h je me retrouvais encore devant le placard, à culpabiliser. comprendre que ces fringales étaient liées à mon insuline a tout changé. parce qu'on ne combat pas un signal biologique avec de la culpabilité. aujourd'hui, quand une fringale arrive, je ne me traite plus de faible : je cherche d'abord ce qui l'a déclenchée. souvent, la réponse avait commencé bien plus tôt dans la journée. et ça, personne ne me l'avait jamais expliqué.",
    liens:["ta mission \"l'ordre dans l'assiette\" (Jour 1)","tes recettes collations anti-fringale","la fiche SOS \"fatigue après repas\" si ça t'arrive souvent"]
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
    mecanisme:"avec le SMOP (SOPK), la fatigue peut venir de 6 endroits différents — l'insuline, l'inflammation, le cortisol, la thyroïde, les carences ou le rythme circadien. ce n'est pas une seule cause. c'est pour ça qu'elle résiste aux solutions simples.",
    kamila:"ton corps ne fait pas exprès. il essaie de te parler. aujourd'hui tu l'écoutes.",
    secret:"avant de penser « je dors mal », fais vérifier ta ferritine ET ta vitamine D. une fatigue de fond avec un SMOP cache très souvent une ferritine basse (< 70) ou une vitamine D insuffisante — même quand le médecin dit que c'est « normal ». ce sont les deux premières choses à regarder.",
    monMot:"la fatigue a été l'un de mes symptômes les plus violents. parce qu'elle est invisible : les gens voient ton visage, pas le poids que tu portes à l'intérieur. je culpabilisais énormément, je me traitais de paresseuse. puis j'ai compris qu'on peut dormir toute une nuit et être épuisée quand même, quand le corps lutte en permanence. le jour où j'ai arrêté de me juger, j'ai commencé à chercher les vraies causes. aujourd'hui encore, quand la fatigue revient, je ne me demande plus « qu'est-ce qui ne va pas chez moi ? » mais « qu'est-ce que mon corps essaie de me dire ? »",
    liens:["l'onglet Analyses pour comprendre ta ferritine et ta vitamine D","tes recettes riches en fer (lentilles, saumon)","la fiche SOS \"réveil nocturne\" si ton sommeil est haché"]
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
    kamila:"un seul truc à la fois Cyster. le reste peut attendre.",
    secret:"le brouillard mental s'aggrave avec les pics et chutes de glycémie. après un repas trop sucré, le coup de barre cérébral est plus fort. stabiliser ta glycémie (protéines + bons gras à chaque repas) est souvent la première chose qui éclaircit les idées — avant même de penser au sommeil.",
    monMot:"il y a une fatigue que les gens comprennent. et puis il y a le brouillard mental : celui où tu cherches tes mots, où tu oublies ce que tu venais faire dans une pièce, où ton cerveau tourne au ralenti. parfois je me demandais si quelque chose n'allait pas dans ma tête — je me trouvais moins vive, moins efficace, moins moi. aujourd'hui je sais que quand le corps lutte en permanence, le cerveau finit souvent par payer une partie de la facture. ça ne veut pas dire que tu perds tes capacités. ça veut dire que ton corps réclame de l'aide.",
    liens:["ta mission du jour, une seule chose à la fois","tes recettes du matin riches en protéines","la fiche SOS \"fatigue profonde\" si le brouillard s'installe"]
  },
  {
    id:"acne", emoji:"🌡️", titre:"Poussée d'acné", couleur:"#C2AEBA",
    validation:"ce bouton n'est pas apparu par hasard.\nce n'est pas un manque d'hygiène.\nce n'est pas parce que tu as mal mangé hier.\nc'est hormonal. et ça a une cause précise.",
    actions5min:[
      {em:"🧊", t:"Glaçon 2 minutes sur la zone", why:"réduit l'inflammation locale immédiatement"},
      {em:"🚫", t:"Zéro toucher", why:"les bactéries de tes mains aggravent l'inflammation"},
      {em:"💊", t:"Zinc ce soir avec le repas", why:"pourrait moduler la 5-alpha-réductase (liée à la DHT)"},
    ],
    action1h:"pas de produit agressif ce soir. juste nettoyage doux. laisse la peau respirer.",
    mecanisme:"les androgènes en excès activent tes glandes sébacées. trop de sébum = pores obstrués = inflammation = bouton. c'est pour ça que les crèmes seules ne règlent jamais rien durablement — elles traitent la conséquence, pas la cause.",
    kamila:"ce bouton va partir. et le protocole s'attaque à ce qui le produit.",
    secret:"l'acné du SMOP n'est pas un problème de peau de surface — elle vient de l'intérieur, du versant hormonal. c'est pour ça que les crèmes seules ne suffisent souvent pas. travailler la glycémie et l'insuline agit sur une des racines, là où aucun soin local ne va. la peau est le messager, pas la cause.",
    monMot:"l'acné m'a volé une grande partie de ma confiance. au lycée c'est devenu profond, douloureux. je me cachais derrière le fond de teint, je vérifiais mon visage dix fois par jour, et un seul nouveau bouton suffisait à gâcher ma journée. ce qui me faisait le plus souffrir, ce n'était pas l'acné — c'était de ne pas comprendre pourquoi elle revenait malgré tous mes efforts. j'avais l'impression que mon corps me déclarait la guerre. puis j'ai découvert que ce n'était pas un problème de peau : c'était hormonal, et ça se montrait sur ma peau. cette différence a tout changé. parce qu'à partir du moment où tu comprends la cause, tu arrêtes de te battre contre ton reflet.",
    liens:["l'onglet Analyses pour comprendre ton versant hormonal","tes recettes à index glycémique bas","tes scripts médecin pour aborder l'acné hormonale"]
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
    kamila:"ce que tu perds maintenant reviendra. le protocole travaille sur la cause.",
    secret:"une chute de cheveux avec un SMOP n'est pas toujours « hormonale » : très souvent, c'est une ferritine trop basse qui en est la vraie cause. exige le chiffre exact de ta ferritine — pas un « c'est normal ». en dessous de 70, les cheveux tombent, même si la valeur est dans les normes du labo.",
    monMot:"je me souviens du moment où j'ai commencé à regarder la brosse avant même de regarder mes cheveux. chaque douche était une angoisse, chaque mèche tombée semblait confirmer que je perdais une partie de moi. ce qui m'a le plus aidée, ce n'est pas une solution miracle : c'est de comprendre que la chute avait une cause — et qu'une cause, ça se travaille. les cheveux sont souvent les derniers à montrer une amélioration. c'est frustrant. mais ça ne veut pas dire que rien ne se passe : pendant des semaines, ton corps répare avant que tes yeux voient le résultat. accroche-toi à ça les jours où le miroir te décourage.",
    liens:["l'onglet Analyses pour traduire ta ferritine","tes scripts médecin pour demander le bon bilan","la fiche SOS \"poussée d'acné\" (même mécanisme hormonal)"]
  },
  {
    id:"regles", emoji:"🌙", titre:"Règles absentes", couleur:"#A89AB8",
    validation:"l'absence de règles avec un SMOP (SOPK) — c'est pas un oubli de ton corps.\nc'est ton corps qui dit que quelque chose n'est pas encore en place.\nc'est un signal. pas une défaillance.",
    actions5min:[
      {em:"📝", t:"Note la date du dernier cycle", why:"avoir des données précises pour le médecin"},
      {em:"🧘", t:"Cohérence cardiaque maintenant", why:"le cortisol élevé bloque l'ovulation directement"},
      {em:"📱", t:"Ouvre tes scripts médecin dans l'app", why:"prépare la demande de bilan hormonal"},
    ],
    action1h:"si > 90 jours sans règles — prends rendez-vous. les analyses à demander : LH, FSH, progestérone, prolactine, TSH.",
    mecanisme:"l'excès d'androgènes ou d'insuline perturbe la maturation des follicules. ils commencent à se développer mais n'arrivent pas à terme. pas d'ovulation = pas de règles. c'est mécanique. et ça se régule.",
    kamila:"chaque action du protocole travaille à ramener ce cycle. c'est lent. mais c'est réel.",
    secret:"l'absence de règles n'est pas le problème en soi — c'est le signal d'une ovulation qui ne se fait pas régulièrement. noter tes cycles (même absents) sur plusieurs mois donne à ton médecin une information précieuse, bien plus utile qu'un simple « j'ai des cycles irréguliers ». tes données, c'est ton pouvoir en consultation.",
    monMot:"j'ai attendu mes règles pendant des mois, parfois presque un an. et quand elles arrivaient, elles ne repartaient plus — je pouvais saigner un mois, parfois deux. personne autour de moi ne vivait ça. je me sentais différente, cassée, comme si mon corps avait oublié comment fonctionner. longtemps j'ai cru que mes règles étaient le problème. avec le recul, je comprends qu'elles n'étaient que le signal : le vrai sujet se jouait en arrière-plan, dans mes hormones, mon ovulation, mon métabolisme. aujourd'hui je regarde mes cycles autrement. ils ne sont pas là pour me punir, mais pour me raconter ce qui se passe à l'intérieur.",
    liens:["ton Journal pour noter tes cycles dans le temps","l'onglet Analyses pour comprendre ton bilan hormonal","tes scripts médecin pour demander le bon suivi"]
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
    mecanisme:"les prostaglandines pro-inflammatoires provoquent les contractions utérines. avec un terrain inflammatoire SMOP (SOPK), leur production est souvent excessive. les oméga-3 et le magnésium réduisent cette production progressivement.",
    kamila:"ces douleurs méritent d'être prises au sérieux. par toi. et par ton médecin.",
    secret:"une douleur de règles qui te plie en deux, qui te réveille la nuit, n'est PAS « normale » — même si on te l'a répété. une douleur intense mérite toujours une vraie recherche de cause (et parfois un avis sur l'endométriose, fréquemment associée). soulager sans comprendre, ce n'est pas se soigner.",
    monMot:"ce qui me met encore en colère, c'est qu'on a longtemps cherché à calmer ma douleur sans chercher à la comprendre. des douleurs qui me réveillaient la nuit, qui me pliaient en deux. on me donnait des médicaments, on me disait que ça passerait — mais personne ne me disait pourquoi. pendant des années, j'ai cru que souffrir faisait partie du contrat. aujourd'hui je sais que non. la douleur est un signal. pas une personnalité, pas une fatalité, pas quelque chose qu'on doit simplement apprendre à supporter.",
    liens:["tes scripts médecin pour faire entendre ta douleur","l'onglet Analyses pour préparer ta consultation","la fiche SOS \"mon médecin ne m'écoute pas\""]
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
    mecanisme:"le découragement avec le SMOP (SOPK) est souvent biologique autant qu'émotionnel. le cortisol élevé, l'inflammation, la résistance à l'insuline — tout ça affecte la dopamine et la sérotonine. tu ne 'penses trop'. ton cerveau reçoit de mauvais signaux chimiques.",
    kamila:"t'es pas en train d'échouer Cyster. t'es en train de traverser quelque chose de difficile. c'est pas la même chose.",
    secret:"le découragement arrive presque toujours au même moment : autour de la 2e-3e semaine, quand l'effort est là mais que les résultats visibles ne sont pas encore arrivés. ce n'est pas que ça ne marche pas — c'est que ton corps change à l'intérieur avant que ça se voie dehors. ce creux est NORMAL et il annonce souvent que le tournant est proche.",
    monMot:"longtemps, j'ai cru que j'étais juste nulle en discipline. je recommençais chaque lundi, puis j'abandonnais — et chaque abandon devenait la preuve que je n'y arriverais jamais. ce que je ne comprenais pas, c'est que je me battais contre quelque chose que personne ne m'avait expliqué. le jour où j'ai découvert le SMOP, j'ai arrêté de me voir comme un échec, et j'ai commencé à me voir comme une femme qui avait enfin une explication. le découragement n'a pas disparu d'un coup. mais j'ai arrêté de confondre une journée difficile avec une vie ratée. aujourd'hui si t'as plus de force, ne pense pas aux 30 prochains jours. pense juste au prochain petit pas.",
    liens:["ton onglet Journal pour voir ton évolution noir sur blanc","le coach mindset de Kamila quand le moral est bas","tes victoires déjà accomplies cette semaine"]
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
    kamila:"le prochain repas recommence tout. pas lundi. le prochain repas.",
    secret:"un craquage suit presque toujours une restriction ou une glycémie en montagnes russes — pas un manque de volonté. plus tu te prives en journée, plus le cerveau réclame le soir. la solution n'est pas de te serrer encore plus la ceinture : c'est de manger ASSEZ et équilibré plus tôt, pour que le craquage n'ait plus de raison d'exister.",
    monMot:"pendant des années, j'ai cru que je manquais simplement de volonté. je tenais, puis je craquais, puis venait la culpabilité, puis la promesse de recommencer lundi — et le même scénario encore. ce que personne ne m'avait expliqué, c'est qu'un corps privé, épuisé ou soumis à des montagnes russes glycémiques finit souvent par réclamer de l'énergie. fort. très fort. aujourd'hui je vois ça autrement : un craquage n'est pas une preuve que tu es faible, c'est souvent une information, un message, une conséquence. quand j'ai commencé à chercher les causes plutôt qu'à me punir, j'ai enfin commencé à sortir du cycle.",
    liens:["ta mission \"l'ordre dans l'assiette\"","tes recettes collations anti-fringale","la fiche SOS \"fringale sucrée\""]
  },
  {
    id:"stress", emoji:"😤", titre:"Stress aigu", couleur:"#D97706",
    validation:"ton corps est en mode survie là.\net avec un SMOP (SOPK) — le stress n'est pas juste inconfortable.\nil agit directement sur tes hormones.",
    actions5min:[
      {em:"🧘", t:"Cohérence cardiaque maintenant", why:"5 sec inspiration · 5 sec expiration · 5 minutes"},
      {em:"🚫", t:"Pas de café pour les 3 prochaines heures", why:"caféine + cortisol = spiral anxieux"},
      {em:"📵", t:"Notifications off", why:"chaque notification = micro-spike de cortisol"},
    ],
    action1h:"une chose à la fois. écrire sur papier la liste de ce qui stresse. puis choisir une seule chose. une.",
    mecanisme:"le stress active l'axe HPA. cortisol produit. cortisol élevé = résistance à l'insuline aggravée + surrénales qui sur-produisent des androgènes. un jour de stress intense peut aggraver tes symptômes SMOP (SOPK) pendant 48-72h.",
    kamila:"ce que tu ressens là est réel. et biologique. la cohérence cardiaque n'est pas du yoga — c'est de la neurobiologie appliquée.",
    secret:"le SMOP et le stress s'aggravent mutuellement — c'est une relation bidirectionnelle bien documentée. un cortisol élevé en continu perturbe la glycémie et les hormones. ce n'est pas « juste dans la tête » : agir sur le stress (respiration, sommeil) agit aussi, concrètement, sur ton terrain hormonal.",
    monMot:"longtemps, j'ai cru que j'étais simplement quelqu'un de stressée. avec le recul, je vois surtout un corps qui tirait sur la corde depuis des années : les douleurs, les symptômes, les rendez-vous, les analyses, les inquiétudes. à force, le système d'alarme finit par rester allumé en permanence. le moindre imprévu me vidait, et je culpabilisais de ne pas gérer comme les autres. aujourd'hui je sais que quand un corps lutte depuis longtemps, il devient plus sensible aux signaux de danger. ça ne veut pas dire que tu es faible. ça veut souvent dire que tu es épuisée depuis trop longtemps.",
    liens:["le coach mindset de Kamila","la fiche SOS \"crise d'angoisse\" si ça monte fort","ton Journal pour relâcher la pression par écrit"]
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
    kamila:"une sortie ne brise pas un protocole. profite. et applique juste l'ordre des aliments.",
    secret:"au restaurant, ce qui compte n'est pas d'être parfaite — c'est l'ordre des aliments. commence par les légumes et les protéines, garde le féculent et le dessert pour après : tu lisses ton pic glycémique sans rien sacrifier du plaisir. un seul réflexe change tout, sans privation.",
    monMot:"je me souviens quand sortir manger devenait une source de stress. j'avais l'impression de devoir choisir entre profiter du moment ou prendre soin de moi — alors je culpabilisais avant, ou après. avec le temps, j'ai compris une chose importante : ce n'est pas un repas qui crée le problème, c'est ce qu'on fait 95% du temps qui compte. aujourd'hui je vais au restaurant, je profite, et je fais simplement les meilleurs choix possibles sans chercher la perfection. parce que la santé doit aussi laisser une place à la vie.",
    liens:["ta mission \"l'ordre dans l'assiette\"","la fiche SOS \"buffet / fête\"","la fiche SOS \"craquage alimentaire\""]
  },
  {
    id:"medecin", emoji:"👩‍⚕️", titre:"Mon médecin ne m'écoute pas", couleur:"#5B7FA6",
    validation:"c'est frustrant.\nc'est injuste.\net tu n'as pas à l'accepter comme une fatalité.",
    actions5min:[
      {em:"📝", t:"Note ce qui s'est passé exactement", why:"pour le prochain rendez-vous ou un deuxième avis"},
      {em:"📱", t:"Ouvre 'Plans d'action post-résultats'", why:"selon ce que le médecin a dit — il y a une réponse"},
      {em:"🔍", t:"Cherche un gynéco spécialisé hormones", why:"un généraliste n'est pas formé au SMOP (SOPK) comme un spécialiste"},
    ],
    action1h:"deuxième avis. ce n'est pas trahir ton médecin. c'est prendre soin de toi.",
    mecanisme:"le SMOP (SOPK) est encore mal enseigné en faculté de médecine. beaucoup de médecins appliquent les protocoles standards — pilule ou perte de poids — sans aller plus loin. ce n'est pas de la mauvaise volonté. c'est un manque de formation spécifique. tu as le droit de chercher mieux.",
    kamila:"tu mérites un médecin qui te prend au sérieux. si c'est pas celui-là — il y en a un autre.",
    secret:"le délai moyen de diagnostic du SMOP en France est de 2 à 4 ans, et 70% des femmes concernées l'ignorent encore. si tu sens qu'on ne t'écoute pas, tu n'es ni difficile ni « trop » : tu fais face à une vraie errance médicale documentée. arriver avec tes symptômes notés et tes questions écrites change radicalement une consultation.",
    monMot:"si je pouvais parler à la version plus jeune de moi, je lui dirais : tu n'inventes rien, tu n'exagères rien, et tu as le droit de poser des questions. j'ai passé des années à entendre des réponses à mes symptômes, mais rarement des explications. on traitait l'acné, les douleurs, les règles — mais personne ne reliait les points, personne ne me racontait l'histoire complète. ce n'est qu'en rencontrant les bonnes personnes que j'ai compris ce qui se passait. si aujourd'hui tu sens qu'on ne t'écoute pas, ne remets pas ton ressenti en question. tu vis dans ton corps tous les jours. ta voix compte. tes symptômes comptent. tes questions comptent.",
    liens:["tes scripts médecin prêts à l'emploi","l'onglet Analyses pour préparer ton bilan","ton Journal pour documenter tes symptômes"]
  },
  {
    id:"miroir", emoji:"🪞", titre:"Je ne me reconnais plus", couleur:"#C2AEBA",
    validation:"ce que tu ressens devant ce miroir — c'est réel.\nc'est pas de la coquetterie.\nc'est une perte d'identité.\net c'est l'un des aspects les plus difficiles du SMOP (SOPK) dont personne ne parle.",
    actions5min:[
      {em:"🚶‍♀️", t:"Sors de la pièce", why:"couper le cycle de rumination devant le miroir"},
      {em:"✍️", t:"Écris une chose que ton corps fait pour toi", why:"recadrer — pas toxic positivity, juste un fait"},
      {em:"🎙️", t:"Écoute le vocal Kamila 'jours difficiles'", why:"tu n'as pas à gérer ça seule"},
    ],
    action1h:"pas de solution rapide ici. juste — une action du protocole. n'importe laquelle. pour dire à ton corps que tu travailles pour lui.",
    mecanisme:"l'acné, la pilosité, la chute de cheveux, la prise de poids — ce sont des manifestations physiques de déséquilibres hormonaux. ton corps n'a pas changé de caractère. il envoie des signaux de détresse hormonale. le protocole s'attaque à ces signaux à la source.",
    kamila:"ton corps n'est pas ton ennemi. il essaie de te dire quelque chose. maintenant tu comprends la langue.",
    secret:"ne plus se reconnaître, ce n'est pas de la coquetterie — c'est l'effet d'une accumulation de symptômes visibles (peau, poils, poids) qui ont tous une même racine hormonale. travailler la cause commune, plutôt que chaque symptôme isolément, est ce qui te fait peu à peu te retrouver. tu n'as pas disparu : tu es enfouie sous des symptômes explicables.",
    monMot:"« je ne me reconnais plus. » cette phrase résume une grande partie de mon histoire. les poils, l'acné, le ventre, le visage gonflé, les sautes d'humeur, les douleurs. à force d'accumuler les symptômes, j'avais l'impression que mon corps devenait quelqu'un d'autre. je regardais les autres filles et je me demandais pourquoi ça semblait tellement plus simple pour elles. ce que je ne savais pas, c'est que je n'avais pas disparu : j'étais simplement enfouie sous des symptômes que personne ne m'avait appris à comprendre. et le jour où j'ai commencé à comprendre mon corps, j'ai commencé à me retrouver. pas parfaitement, pas tout de suite, mais assez pour savoir que je n'étais pas perdue.",
    liens:["l'encart \"ton parcours, fait pour toi\" sur l'accueil","le coach mindset de Kamila","ton Journal pour mesurer ton évolution réelle"]
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
    kamila:"le protocole voyage avec toi. adapté. pas parfait. mais présent.",
    secret:"en voyage, l'objectif n'est pas le protocole à 100% — c'est de garder 2-3 repères simples (protéines au petit-déj, ordre des aliments, marche). la vraie réussite, ce n'est pas la perfection pendant une semaine, c'est de revenir naturellement à tes habitudes après. la rigidité, elle, mène au craquage.",
    monMot:"avant, les voyages me stressaient. comment manger ? comment garder mes habitudes ? comment éviter de tout perdre ? puis un jour j'ai réalisé quelque chose : je ne pars pas en voyage pour être parfaite, je pars pour vivre. aujourd'hui j'emporte quelques repères simples, mais je laisse la perfection à la maison. parce que la vraie réussite, ce n'est pas de suivre un protocole à 100% pendant une semaine — c'est d'être capable de revenir naturellement à ses habitudes après. et ça, c'est une liberté que j'ai mis des années à construire.",
    liens:["tes recettes nomades à emporter","la fiche SOS \"restaurant / sortie\"","ta mission \"l'ordre dans l'assiette\""]
  },
  {
    id:"insomnie", emoji:"🌙", titre:"Réveil nocturne", couleur:"#7A5C45",
    validation:"3h du matin et le cerveau qui s'emballe.\nc'est l'un des symptômes les plus épuisants du SMOP (SOPK).\net l'un des moins expliqués.",
    actions5min:[
      {em:"📵", t:"Téléphone hors de portée — maintenant", why:"lumière bleue = mélatonine supprimée encore plus"},
      {em:"🧘", t:"Cohérence cardiaque allongée", why:"5 sec inspiration · 5 sec expiration · les yeux fermés"},
      {em:"🥛", t:"Une petite poignée d'amandes si tu as faim", why:"hypoglycémie nocturne = réveil à 3h — c'est biologique"},
    ],
    action1h:"si tu ne te rendors pas en 20 min — lève-toi 15 minutes. lumière tamisée. pas d'écran. retourne te coucher.",
    mecanisme:"deux causes fréquentes du réveil nocturne quand on a un SMOP : le cortisol élevé la nuit qui freine la mélatonine, et l'hypoglycémie nocturne qui déclenche une alerte adrénaline. les deux sont biologiques. les deux répondent au protocole sur plusieurs semaines.",
    kamila:"demain tu seras fatiguée. et tu continueras quand même. parce que t'as prouvé que tu peux.",
    secret:"le réveil nocturne vers 3-4h est souvent lié à une chute de glycémie pendant la nuit ou à un cortisol qui grimpe trop tôt. une collation protéinée légère le soir (pas sucrée) aide parfois à éviter la chute. ce n'est pas « juste du stress » : ton corps a des raisons physiologiques que tu peux apaiser.",
    monMot:"longtemps, je croyais que dormir était censé me reposer. sauf que je me réveillais en pleine nuit — 3h, 4h — les yeux grands ouverts, le cerveau en marche alors que mon corps était épuisé. je calculais combien d'heures il me restait, et plus je m'inquiétais, moins je me rendormais. je pensais que c'était le stress. parfois oui. mais j'ai découvert que les hormones, la glycémie, le cortisol et même les carences pouvaient jouer leur rôle. ce n'était pas que dans ma tête : c'était mon corps qui essayait de me parler. le jour où j'ai arrêté de me traiter comme une machine défectueuse, j'ai commencé à écouter les messages derrière les symptômes.",
    liens:["tes recettes collations du soir","la fiche SOS \"stress aigu\"","l'onglet Analyses pour vérifier tes carences"]
  },
  {
    id:"buffet", emoji:"🍽️", titre:"Buffet / fête", couleur:"#CB9A79",
    validation:"un buffet quand on a un SMOP, c'est pas juste de la nourriture.\nc'est l'abondance, le regard des autres, la peur de \"craquer\".\nrespire. tu peux traverser ça sereinement.",
    actions5min:[
      {em:"💧", t:"Un grand verre d'eau en arrivant", why:"calme la faim et ralentit le rythme"},
      {em:"🥗", t:"Repère les protéines et légumes d'abord", why:"remplis ton assiette d'eux en priorité"},
      {em:"🧘", t:"Trois respirations avant de te servir", why:"tu choisis, tu ne subis pas"},
    ],
    action1h:"sers-toi une assiette dans le bon ordre : légumes, protéines, puis une part de ce qui te fait plaisir. mange lentement. tu as le droit de te régaler sans culpabiliser.",
    mecanisme:"face à l'abondance, le cerveau passe en mode \"prends tout maintenant\". ce n'est pas de la gourmandise — c'est un réflexe ancien. en mangeant les légumes et protéines en premier, tu lisses ta glycémie et tu coupes les fringales qui te pousseraient au rab de sucré.",
    kamila:"un repas de fête ne défait pas des semaines de cohérence. profite, savoure, et reprends ton rythme demain.",
    secret:"l'envie de tout dévorer à un buffet vient souvent de la restriction — plus on s'est privée avant, plus le cerveau compense. se servir ce qui fait vraiment envie, lentement, sans interdit, désamorce justement la compulsion. la perfection alimentaire crée le craquage qu'elle prétend éviter.",
    monMot:"les buffets étaient mon piège préféré. tout avait l'air bon, tout donnait envie, et cette petite voix me disait : « profites-en, après tu recommenceras sérieusement. » je connais cette voix, je l'ai écoutée pendant des années. puis j'ai compris qu'elle venait souvent de la restriction : quand on se sent privée, le cerveau cherche à compenser. aujourd'hui je me sers ce qui me fait vraiment envie, je mange lentement, je profite, et je repars sans avoir besoin de me punir le lendemain. parce qu'un buffet ne définit pas ta santé, pas plus qu'un repas ne définit ta valeur.",
    liens:["la fiche SOS \"craquage alimentaire\"","la fiche SOS \"restaurant / sortie\"","ta mission \"l'ordre dans l'assiette\""]
  },
  {
    id:"poids-soudain", emoji:"⚖️", titre:"Prise de poids soudaine", couleur:"#B07050",
    validation:"avant tout : ce chiffre ne dit pas ta valeur.\nle SMOP fait fluctuer le poids et l'eau du corps de façon parfois brutale et injuste.\nce n'est pas un échec. ce n'est pas ta faute.",
    actions5min:[
      {em:"🚫", t:"Éloigne-toi de la balance", why:"une pesée isolée ne veut rien dire avec un SMOP"},
      {em:"💧", t:"Bois de l'eau", why:"la rétention d'eau gonfle le chiffre, paradoxalement l'eau aide"},
      {em:"📝", t:"Note ce que tu ressens, pas le chiffre", why:"énergie, sommeil, fringales comptent plus"},
    ],
    action1h:"reviens à tes fondamentaux sans punition : un repas dans le bon ordre, une marche douce, du sommeil. pas de restriction brutale — ça aggrave tout avec un SMOP.",
    mecanisme:"avec un SMOP, le poids peut grimper vite à cause de la rétention d'eau, des variations hormonales du cycle, du stress (cortisol) ou d'une nuit courte. ce n'est presque jamais de la \"vraie\" graisse installée en quelques jours. la restriction sévère, elle, fait flamber le cortisol et empire la situation.",
    kamila:"ton corps traverse une vague, pas une marée. sois douce avec lui — la dureté n'a jamais rien réglé."
  },
  {
    id:"fatigue-repas", emoji:"🥱", titre:"Fatigue après le repas", couleur:"#7A5C45",
    validation:"ce coup de barre juste après manger, tu le connais bien.\nce n'est pas de la paresse.\nc'est ta glycémie qui fait des montagnes russes.",
    actions5min:[
      {em:"🚶‍♀️", t:"Marche 10 minutes maintenant", why:"tes muscles absorbent le sucre et coupent la somnolence"},
      {em:"💧", t:"Un verre d'eau", why:"la déshydratation amplifie le coup de barre"},
      {em:"☀️", t:"Va à la lumière du jour", why:"elle relance la vigilance"},
    ],
    action1h:"au prochain repas, change l'ordre : légumes et protéines d'abord, féculents en dernier et en quantité modérée. le coup de barre vient souvent d'un repas trop riche en sucres rapides.",
    mecanisme:"après un repas riche en glucides rapides, ta glycémie monte fort puis redescend brutalement. cette chute déclenche la somnolence. avec un SMOP et une insuline déjà sollicitée, le phénomène est amplifié. manger dans le bon ordre lisse la courbe et garde ton énergie stable.",
    kamila:"ce n'est pas \"normal\" d'avoir besoin d'une sieste après chaque repas. tu peux changer ça, repas après repas."
  },
  {
    id:"angoisse", emoji:"💗", titre:"Crise d'angoisse", couleur:"#5B7FA6",
    validation:"là, maintenant, ton corps sonne l'alarme.\nton cœur s'emballe, ta poitrine se serre, tout s'accélère.\ntu n'es pas en danger. ça va passer. je reste avec toi.",
    actions5min:[
      {em:"🫁", t:"Respire : 4 sec inspire, 6 sec expire", why:"l'expiration longue calme le système nerveux"},
      {em:"🖐️", t:"Nomme 5 choses que tu vois autour de toi", why:"ça ramène ton cerveau dans le présent"},
      {em:"❄️", t:"De l'eau fraîche sur les poignets ou le visage", why:"ça apaise la réponse de panique"},
    ],
    action1h:"une fois la vague passée, sois douce : une boisson chaude, un endroit calme, pas d'écran anxiogène. l'angoisse épuise — laisse-toi récupérer sans culpabiliser.",
    mecanisme:"le SMOP et l'anxiété sont liés : les variations hormonales et un cortisol souvent élevé rendent le système nerveux plus réactif. une crise d'angoisse est une fausse alarme du corps — intense, mais sans danger réel. la respiration lente envoie au cerveau le signal que la menace est passée.",
    kamila:"ce que tu ressens est réel et tu n'exagères pas. mais ça va passer, comme à chaque fois. tu es plus solide que cette vague.",
    secret:"une crise d'angoisse est une fausse alarme du système nerveux — terrifiante sur le coup, mais sans danger réel. le SMOP, via les variations hormonales et un cortisol souvent élevé, rend ce système plus réactif. l'expiration longue (plus longue que l'inspiration) envoie au cerveau le signal physiologique que la menace est passée.",
    monMot:"je me souviens surtout de cette sensation de perdre le contrôle. le cœur qui s'emballe, la poitrine serrée, l'impression qu'il se passe quelque chose de grave — et plus tu essaies de te calmer, plus ton corps semble paniquer. quand ça m'arrivait, je croyais parfois avoir un vrai problème physique grave. puis j'ai compris qu'une crise d'angoisse est souvent un système d'alarme qui se déclenche au mauvais moment. sur le coup c'est terrifiant, mais ça ne définit pas qui tu es, et ça ne veut pas dire que tu deviens folle. aujourd'hui encore, quand mon corps me lance ce signal, j'essaie de me rappeler une chose : ce que je ressens est réel, mais le danger que mon cerveau imagine ne l'est pas forcément.",
    liens:["le coach mindset de Kamila","la fiche SOS \"stress aigu\"","ton Journal pour poser ce que tu ressens"]
  },
  {
    id:"solitude", emoji:"🤍", titre:"Je me sens seule", couleur:"#C2AEBA",
    validation:"se sentir seule avec un SMOP, c'est l'un des poids les plus lourds.\npersonne autour ne comprend vraiment ce que tu traverses.\nmais là, tu n'es pas seule. d'autres Cysters vivent exactement ça.",
    actions5min:[
      {em:"💬", t:"Écris dans la communauté Cysters", why:"d'autres comprennent sans que tu aies à expliquer"},
      {em:"🎧", t:"Écoute un vocal de Kamila", why:"une voix qui te comprend, là, maintenant"},
      {em:"📝", t:"Écris ce que tu ressens dans ton journal", why:"poser les mots allège le poids"},
    ],
    action1h:"contacte une personne de confiance, même juste pour parler d'autre chose. l'isolement nourrit la solitude — un seul lien, même petit, change la journée.",
    mecanisme:"le SMOP est souvent invisible et incompris, ce qui crée un vrai sentiment d'isolement. s'y ajoutent les effets hormonaux sur l'humeur. ce n'est pas \"dans ta tête\" : c'est une charge réelle. mais elle s'allège dès qu'elle est partagée avec des personnes qui vivent la même chose.",
    kamila:"tu as construit une communauté entière de femmes qui te ressemblent. tu n'as jamais été aussi entourée que maintenant.",
    secret:"le sentiment de solitude vient du fait que le SMOP est invisible et incompris — ce n'est pas « dans ta tête », c'est une charge réelle. et 70% des femmes concernées ignorent même qu'elles l'ont. tu fais partie d'une immense communauté silencieuse. mettre des mots et partager, c'est ce qui allège le plus vite ce poids.",
    monMot:"le pire avec le SMOP, ce ne sont pas toujours les symptômes. c'est parfois le sentiment que personne ne comprend vraiment. les autres voient les boutons, les poils, le poids — mais pas les heures passées à chercher des réponses, les analyses, les rendez-vous, les inquiétudes, les larmes. longtemps je me suis sentie seule. puis j'ai découvert d'autres femmes qui vivaient exactement la même chose, et ça a changé quelque chose d'immense. parce qu'à partir du moment où quelqu'un met des mots sur ce que tu vis, tu te sens un peu moins seule à le porter.",
    liens:["la communauté Cysters","le coach mindset de Kamila","ton Journal pour déposer ce que tu portes"]
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
outil:{emoji:"🍴",label:"Découvre le modèle de l'assiette SMOP (SOPK)",desc:"comment composer ton assiette sans rien peser",cible:"assiette"},
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
pourquoi:"le zinc est un minéral souvent bas chez les femmes SMOP, et il agit sur plusieurs fronts qui te concernent directement.\n\nun : il pourrait freiner la 5-alpha-réductase, l'enzyme qui transforme la testostérone en DHT (la forme la plus agressive pour les cheveux et la peau). deux : il régule la production de sébum, donc il aide sur l'acné. trois : c'est un anti-inflammatoire.\n\ndes essais contrôlés ont montré que la supplémentation en zinc réduisait l'acné, l'hirsutisme et la chute de cheveux chez des femmes SMOP. c'est l'un des compléments les plus utiles quand tu as des symptômes liés aux androgènes.",
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
msg:"tu avances peut-être plus lentement que tu le voudrais.\n\nmais tu avances.\n\net c'est tout ce qui compte.\n\nKamila",
pourquoi:"en 30 jours, tu n'as pas suivi un régime. tu as construit un système. une alimentation qui soutient ton insuline au lieu de l'affoler. un foie mieux soutenu. du muscle qui gère ta glycémie en continu. un protocole de compléments adapté à ton profil. des tisanes qui agissent en couches. et surtout : des mots pour parler à ton médecin, et une compréhension de ton propre corps que personne ne pourra plus t'enlever.\n\nle SMOP est chronique — aucun programme ne le 'guérit', et méfie-toi de quiconque te le promet. mais ce que tu as appris ici, tu le gardes à vie. tu sais maintenant comment soutenir ton corps, jour après jour.\n\nces 30 jours ne sont pas une ligne d'arrivée. c'est ta nouvelle base de départ.",
source:"le SMOP est une condition chronique qui se gère par le mode de vie sur le long terme, sans guérison définitive (Marsh et al., 2010 ; Diamanti-Kandarakis & Dunaif, 2012).",
comment:["prends un moment au calme pour cet exercice","écris ce que tu emmènes : les gestes, les compréhensions, les habitudes","écris ce que tu laisses : la culpabilité, les fausses croyances, l'attente passive","relis tes bilans des Jours 7, 14, 21, 29","choisis 2 ou 3 gestes que tu veux garder pour toujours"],
pieges:["voir le Jour 30 comme une fin — c'est un nouveau départ","tout vouloir garder d'un coup — choisis tes 2-3 piliers","oublier de célébrer le chemin — tu l'as fait, c'est énorme"],
plus:"les Cysters qui transforment durablement leur SMOP ne sont pas celles qui ont été parfaites pendant 30 jours. ce sont celles qui ont gardé 2 ou 3 gestes pour la vie. choisis les tiens aujourd'hui — ceux qui te ressemblent et que tu peux tenir.",
observes:["aujourd'hui : tu mesures tout ce que tu as construit","dans les mois à venir : les gestes ancrés portent leurs fruits","sur la durée : un rapport à ton corps transformé pour de bon"],
victoire:"ce ne sont pas 30 jours terminés. c'est une baseline."},
];


// ─── MISSIONS (profil inflammatoire — apaiser le terrain) ─────────────────────
const MISSIONS_INFLA = [
  {day:1,emoji:"🔥",theme:"l'assiette qui apaise",
mission:"à ton prochain repas, remplis la moitié de ton assiette de légumes colorés et de verdure — et garde les féculents en dernier.",
msg:"on t'a parlé de calories, de régimes, de privation.\n\npersonne ne t'a dit que ton corps est peut-être en inflammation permanente.\n\naujourd'hui on commence par l'apaiser, assiette après assiette.",
pourquoi:"avec un SMOP à dominante inflammatoire, ton corps est souvent dans un état d'inflammation de bas grade — une inflammation silencieuse, permanente, qui entretient la fatigue, les douleurs et le dérèglement hormonal.\n\nles légumes colorés et les verdures sont bourrés de polyphénols et d'antioxydants : ce sont eux qui calment ce feu de fond. plus ton assiette est colorée, plus tu donnes à ton corps de quoi se défendre.\n\net en gardant les féculents pour la fin, tu lisses aussi ta glycémie — parce que les pics de sucre nourrissent l'inflammation. les deux leviers travaillent ensemble.",
source:"l'inflammation de bas grade est une caractéristique fréquemment associée au SMOP, et une alimentation à index glycémique bas améliore les marqueurs métaboliques et hormonaux (Marsh et al., 2010, American Journal of Clinical Nutrition).",
comment:["vise la moitié de ton assiette en légumes — crus, cuits, peu importe","varie les couleurs : vert, rouge, orange, violet = familles d'antioxydants différentes","ajoute une source de bon gras (huile d'olive, avocat) qui aide à absorber les antioxydants","garde les féculents et le sucré pour la fin du repas","mange tranquillement, sans écran si tu peux"],
pieges:["« manger coloré » ne veut pas dire bonbons ou produits industriels colorés — on parle de vrais végétaux","les légumes en conserve très salés ou en sauce industrielle perdent une partie de l'intérêt","zéro légume dans le frigo ? les surgelés nature sont parfaits, aussi riches que les frais"],
plus:"une astuce que j'adore : prépare un bocal de crudités déjà lavées et coupées le dimanche. les jours où t'as la flemme, t'as toujours de quoi remplir la moitié de ton assiette sans réfléchir.",
observes:["dès aujourd'hui : un repas qui te laisse plus légère, moins ballonnée","dans quelques jours : une digestion plus calme","dans 2 semaines : des douleurs et une fatigue de fond qui commencent à desserrer"],
victoire:"tu viens de donner à ton corps ses premières munitions anti-inflammatoires — sans te priver de rien.",
outil:{emoji:"🍴",label:"Découvre le modèle de l'assiette SMOP (SOPK)",desc:"comment composer ton assiette sans rien peser",cible:"assiette"},
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"on commence par préparer ton foie — l'organe qui élimine l'excès d'hormones et les composés inflammatoires. la Cure Détox seule cette première semaine, à jeun."}},

  {day:2,emoji:"🌅",theme:"le petit-déjeuner qui n'enflamme pas",
mission:"remplace ton petit-déjeuner sucré ou industriel par une version simple et vraie — et observe ton énergie à 11h.",
msg:"le matin donne le ton de toute ta journée.\n\nun départ sucré ou ultra-transformé, et c'est l'inflammation qui s'allume dès le réveil.\n\naujourd'hui on change la première pierre.",
pourquoi:"les petits-déjeuners classiques — jus, céréales, viennoiseries, pain blanc — combinent deux déclencheurs : un gros pic de sucre ET des produits ultra-transformés, souvent riches en additifs et en mauvaises graisses.\n\nce combo relance l'inflammation chaque matin, sur un corps à jeun particulièrement réactif. et le pic de glycémie qui suit entretient le cercle.\n\nun petit-déjeuner vrai — protéines, bons gras, un peu de fibres — ne déclenche pas cette cascade. tu stabilises ton énergie et tu ne rajoutes pas d'huile sur le feu.",
source:"la résistance à l'insuline, présente chez la majorité des femmes SMOP, est liée à l'inflammation de bas grade (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["base ton matin sur une protéine : œufs, skyr, fromage blanc, tofu brouillé","ajoute un bon gras : avocat, oléagineux, graines","un fruit entier plutôt qu'un jus","si tu manges du pain : au levain ou complet, jamais blanc seul","pas faim le matin ? même une petite portion protéinée vaut mieux que rien"],
pieges:["les « granolas healthy » du commerce sont souvent très sucrés — lis l'étiquette","le jus de fruits « pur jus » reste un pic de sucre sans les fibres","les substituts de repas industriels : pratiques mais souvent ultra-transformés"],
plus:"mon petit-déj d'urgence anti-inflammatoire : un bol de skyr, une poignée de myrtilles, des graines de chia, un filet de miel. 2 minutes, zéro cuisson, et c'est bourré d'antioxydants.",
observes:["dès ce matin : plus de coup de barre vers 11h","dans quelques jours : moins de fringale de sucre dans la matinée","dans 2 semaines : un réveil un peu moins « dans le brouillard »"],
victoire:"tu viens d'éteindre un déclencheur d'inflammation que tu rallumais sans le savoir chaque matin.",
outil:{emoji:"📖",label:"Des idées de petits-déjeuners",desc:"rapides, anti-inflammatoires, SMOP-friendly",cible:"recettes"},
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"on continue la Cure Détox seule cette semaine : on prépare le terrain avant d'ajouter les autres plantes."}},

  {day:3,emoji:"📋",theme:"écouter ce qui t'enflamme",
mission:"aujourd'hui, note simplement comment tu te sens APRÈS chaque repas — ballonnée, fatiguée, lourde, ou bien ?",
msg:"ton corps te parle à chaque repas.\n\nla plupart du temps on n'écoute pas.\n\naujourd'hui on commence juste à observer — sans juger, sans changer.",
pourquoi:"l'inflammation est très personnelle. un aliment qui ne pose aucun problème à ta voisine peut, chez toi, déclencher ballonnements, fatigue ou douleurs.\n\nles signaux post-repas — ventre gonflé, coup de barre, lourdeur, brouillard mental dans l'heure qui suit — sont des indices précieux de ce que ton corps tolère mal.\n\naujourd'hui on ne supprime rien. on observe. parce qu'avant de changer quoi que ce soit, il faut d'abord savoir lire ses propres signaux. tu deviens ta meilleure observatrice.",
source:"les réponses alimentaires sont individuelles ; l'auto-observation est un outil reconnu pour identifier ses propres sensibilités.",
comment:["après chaque repas, pose-toi 2 minutes","note : mon ventre ? mon énergie ? ma tête ? (gonflé / lourd / fatiguée / ok)","note aussi ce que tu as mangé, grossièrement","ne juge pas, ne te prive pas aujourd'hui — tu collectes","utilise l'onglet Journal pour garder une trace"],
pieges:["culpabiliser fausse l'observation — tu n'es pas en train de te surveiller, tu apprends à te connaître","vouloir tout supprimer d'un coup : on observe d'abord, on ajuste après","oublier de noter les petits inconforts — même un léger ballonnement compte"],
plus:"les coupables les plus fréquents du ballonnement chez les femmes SMOP : les produits laitiers, le gluten raffiné, les édulcorants et les plats ultra-transformés. mais chacune est différente — c'est TON corps qui a la réponse, pas une règle générale.",
observes:["aujourd'hui : tu commences à repérer des schémas","dans quelques jours : tu identifies 1 ou 2 aliments qui te pèsent","dans 2 semaines : tu sais mieux ce qui t'apaise et ce qui t'enflamme"],
victoire:"tu viens de faire quelque chose que personne ne fait : écouter ton corps au lieu de suivre une règle générale.",
outil:null,
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"la Cure Détox accompagne ton élimination pendant que tu observes tes repas. une légère fatigue les premiers jours est normale — le foie travaille."}},

  {day:4,emoji:"💧",theme:"le geste le plus sous-estimé",
mission:"bois un grand verre d'eau au réveil, et vise à t'hydrater régulièrement toute la journée.",
msg:"c'est le geste le plus simple, le moins cher, et le plus négligé.\n\nl'eau ne guérit rien toute seule.\n\nmais mal t'hydrater entretient la fatigue et ralentit l'élimination.",
pourquoi:"ton corps a besoin d'eau pour éliminer — c'est par les reins et le foie que partent les déchets et l'excès d'hormones. une déshydratation, même légère, ralentit ce travail de nettoyage.\n\nla déshydratation accentue aussi la fatigue, les maux de tête et peut aggraver la sensation de brouillard mental — des symptômes déjà bien présents sur un terrain inflammatoire.\n\nce n'est pas magique, mais c'est un socle. un corps bien hydraté élimine mieux et fatigue moins.",
source:"l'hydratation soutient les fonctions rénales et hépatiques d'élimination ; sa carence majore fatigue et céphalées.",
comment:["un grand verre d'eau dès le réveil, avant le café","garde une bouteille ou une gourde visible toute la journée","si l'eau plate t'ennuie : eau + citron, ou une infusion tiède","vise une hydratation régulière plutôt qu'un litre d'un coup","écoute ta soif, et la couleur de tes urines (claires = bien)"],
pieges:["les sodas et jus ne comptent pas comme hydratation — ils rajoutent du sucre et de l'inflammation","le café en excès déshydrate et peut sur-stimuler le cortisol","attendre d'avoir soif : la soif arrive déjà en léger déficit"],
plus:"une eau tiède citronnée le matin est mon petit rituel : ça réveille la digestion en douceur et ça remplace le réflexe café-sur-estomac-vide qui n'aide pas ton cortisol.",
observes:["dès aujourd'hui : un peu plus de clarté, moins de maux de tête","dans quelques jours : une digestion et une élimination plus régulières","dans 2 semaines : une fatigue de fond allégée"],
victoire:"tu viens d'activer ton système d'élimination naturel — gratuitement.",
outil:null,
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"la Cure Détox et l'eau travaillent ensemble : les deux soutiennent tes reins et ton foie, tes organes d'élimination."}},

  {day:5,emoji:"🚶‍♀️",theme:"le mouvement qui apaise",
mission:"fais une marche de 15 à 20 minutes aujourd'hui — tranquille, pas une performance.",
msg:"on t'a dit « faites du sport ».\n\npersonne ne t'a dit que trop d'intensité peut, sur ton terrain, faire monter l'inflammation.\n\naujourd'hui on bouge autrement.",
pourquoi:"le mouvement régulier et modéré a un effet anti-inflammatoire reconnu : il améliore la circulation, soutient l'élimination et aide à réguler le cortisol.\n\nmais attention au piège sur un terrain inflammatoire : les séances très intenses et épuisantes (HIIT violent, cardio à bout de souffle) peuvent au contraire faire grimper le cortisol et le stress oxydatif — donc l'inflammation. ton corps n'a pas besoin qu'on le pousse à bout, il a besoin qu'on le soutienne.\n\nla marche, le yoga doux, le pilates, la nature : c'est le niveau d'effort qui apaise sans agresser.",
source:"l'activité physique modérée régulière a des effets anti-inflammatoires ; un stress physique excessif peut à l'inverse élever le cortisol, qui entretient le terrain SMOP (Pasquali et al.).",
comment:["choisis un moment où ça te fait du bien, pas où ça t'épuise","marche à un rythme où tu peux encore parler","dehors et à la lumière du jour si possible","si tu peux, marche un peu après un repas : double bénéfice","l'objectif c'est la régularité, pas l'intensité"],
pieges:["croire que « plus c'est dur, mieux c'est » — faux sur un terrain inflammatoire","sauter le mouvement les jours fatigués : une marche douce aide souvent plus que le repos total","se comparer aux routines sportives intenses des réseaux — ce n'est pas ton terrain"],
plus:"les jours où je suis vraiment à plat, je ne me force pas à une séance : je sors juste marcher 15 minutes au soleil. et presque à chaque fois, je reviens avec plus d'énergie qu'en partant. le mouvement doux, c'est de l'énergie, pas une dépense.",
observes:["dès aujourd'hui : l'esprit plus clair après la marche","dans quelques jours : un sommeil un peu plus profond","dans 2 semaines : moins de raideurs, plus d'énergie au quotidien"],
victoire:"tu viens de bouger d'une façon qui apaise ton corps au lieu de l'agresser.",
outil:null,
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"la Cure Détox continue en fond cette semaine, pendant que tu installes le mouvement doux."}},

  {day:6,emoji:"🔍",theme:"traquer les pro-inflammatoires cachés",
mission:"repère UN produit ultra-transformé de ton placard et lis sa liste d'ingrédients en entier.",
msg:"le sucre, on le voit.\n\nles pro-inflammatoires cachés, eux, se faufilent partout.\n\naujourd'hui on apprend à les repérer.",
pourquoi:"au-delà du sucre, trois familles entretiennent l'inflammation sans qu'on les remarque : les huiles raffinées de mauvaise qualité (tournesol, palme, soja raffiné), les additifs et conservateurs des produits ultra-transformés, et les graisses trans.\n\nle problème, c'est qu'ils sont partout — plats préparés, sauces, biscuits, snacks « healthy », même dans des produits salés. et plus la liste d'ingrédients est longue et incompréhensible, plus le risque est grand.\n\napprendre à lire une étiquette, c'est reprendre le pouvoir. tu n'as pas besoin d'être parfaite — juste de voir ce que tu mets vraiment dans ton corps.\n\net il n'y a pas que l'assiette : les perturbateurs endocriniens (plastiques chauffés, certains cosmétiques) peuvent aussi perturber ton équilibre hormonal. réduire l'exposition, c'est un geste de plus pour ton terrain.",
source:"les produits ultra-transformés et certaines graisses sont associés à une majoration de l'inflammation de bas grade.",
comment:["prends un produit transformé de ton placard","lis la liste complète des ingrédients","repère : huiles raffinées, sirop de glucose, additifs (E…), graisses hydrogénées","règle simple : plus la liste est courte et lisible, mieux c'est","tu n'es pas obligée de tout jeter — tu apprends à choisir"],
pieges:["« sans sucre » ne veut pas dire « anti-inflammatoire » — regarde les graisses et additifs aussi","les mentions « naturel » ou « healthy » sur l'emballage ne veulent rien dire légalement","vouloir tout supprimer d'un coup : vise le progrès, pas la perfection"],
plus:"ma règle des 5 : si un produit a plus de 5 ingrédients ou des noms que je ne reconnais pas, je repose et je cherche une version plus simple. ça m'évite 80% des pièges sans me prendre la tête.",
observes:["aujourd'hui : tu vois enfin ce qui se cache dans tes placards","dans quelques jours : tu choisis plus simple, naturellement","dans 2 semaines : moins de produits inflammatoires = un terrain qui s'apaise"],
victoire:"tu viens d'apprendre à décoder une étiquette — une compétence que tu gardes à vie.",
outil:{emoji:"🛒",label:"Apprendre à lire les étiquettes",desc:"repérer les pièges en 10 secondes",cible:"courses"},
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"en remplaçant une boisson sucrée par ta Cure Détox du matin, tu retires un pro-inflammatoire et tu soutiens ton foie."}},

  {day:7,emoji:"🎯",theme:"bilan de semaine 1",
mission:"prends 5 minutes pour noter les petits changements de cette première semaine — même minuscules.",
msg:"une semaine que tu apaises ton terrain.\n\net voilà ce que personne ne te dit : les premiers changements sont discrets, intérieurs, avant d'être visibles.\n\naujourd'hui on apprend à les voir.",
pourquoi:"en 7 jours, ton corps a déjà commencé à changer. tu as réduit les pics de sucre, les pro-inflammatoires, tu as mieux hydraté et bougé en douceur. ton inflammation de bas grade a commencé à desserrer son étreinte.\n\nmais voilà le piège : ces premiers changements ne se voient pas dans le miroir. ils se passent à l'intérieur — digestion, énergie, sommeil, ballonnements. c'est pour ça que tant de femmes abandonnent trop tôt : elles cherchent au mauvais endroit.\n\nfaire le bilan des petits signaux, c'est apprendre à reconnaître les vrais résultats, ceux qui annoncent les changements visibles à venir.",
source:"les changements métaboliques et inflammatoires précèdent les changements visibles ; les suivre soutient l'adhésion au long cours.",
comment:["ouvre l'onglet Journal","note ce qui a bougé : digestion, énergie, ballonnements, sommeil, humeur","même un mieux léger compte — écris-le","relis ce que tu as observé au Jour 3 sur tes repas","garde cette trace : dans 3 semaines, la relire te montrera le chemin"],
pieges:["chercher un résultat visible dans le miroir après 7 jours — c'est trop tôt, et ce n'est pas là que ça se passe","minimiser les petits progrès : « juste un peu moins ballonnée » est un vrai signal","oublier de noter : la mémoire oublie, le journal non"],
plus:"écris ce bilan dans l'onglet Journal. c'est ta meilleure arme les jours de doute — la preuve noir sur blanc que ton corps répond, même quand le miroir n'a pas encore suivi.",
observes:["aujourd'hui : tu mesures ta première semaine autrement","dans 2 semaines : tu compares et tu vois la progression","dans 3 semaines : ce bilan devient ta preuve personnelle"],
victoire:"tu as tenu une semaine à apaiser ton terrain — et tu commences à lire les vrais signaux de ton corps.",
outil:null,
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"dernière ligne de la semaine Détox seule. dès demain (Jour 8), on ajoute l'Équilibre Féminin — la fondation hormonale."}},

  {day:8,emoji:"🐟",theme:"le gras qui calme le feu",
mission:"ajoute une source d'oméga-3 à ton assiette aujourd'hui — sardines, maquereau, saumon, ou graines de lin/chia moulues.",
msg:"on t'a fait peur avec le gras pendant des années.\n\npourtant certains gras sont exactement ce dont ton corps enflammé a besoin.\n\naujourd'hui on fait entrer les bons.",
pourquoi:"tous les gras ne se valent pas. les oméga-3 (EPA et DHA) ont une action anti-inflammatoire reconnue : ils fournissent la matière première que ton corps utilise pour calmer l'inflammation.\n\nle problème, c'est que notre alimentation moderne est saturée d'oméga-6 (huiles raffinées, ultra-transformés) et pauvre en oméga-3. ce déséquilibre entretient le terrain inflammatoire. rééquilibrer, c'est donner à ton corps de quoi apaiser le feu de l'intérieur.\n\nles meilleures sources : les petits poissons gras (sardines, maquereau, hareng), le saumon, et côté végétal les graines de lin et de chia moulues, les noix.",
source:"les oméga-3 (EPA/DHA) ont une action anti-inflammatoire documentée ; les preuves spécifiques au SMOP restent préliminaires, l'effet s'inscrit dans un rééquilibrage global.",
comment:["vise 2 à 3 portions de petits poissons gras par semaine","côté végétal : 1 c. à soupe de graines de lin ou chia moulues par jour","les graines de lin doivent être moulues pour être assimilées","réduis en parallèle les huiles raffinées (tournesol, soja) au profit de l'huile d'olive","une poignée de noix en collation = un bon réflexe oméga-3"],
pieges:["les graines de lin entières passent sans être digérées — moulues, toujours","le saumon d'élevage bas de gamme est moins intéressant — privilégie les petits poissons","cuire les huiles oméga-3 à haute température les dégrade — l'huile de lin se consomme crue"],
plus:"les petits poissons (sardines, maquereau) sont mes chouchous : pas chers, en conserve ils se gardent, bourrés d'oméga-3, et peu contaminés aux métaux lourds contrairement aux gros poissons. une boîte de sardines sur des crudités = repas anti-inflammatoire express.",
observes:["dans quelques jours : une peau parfois un peu plus apaisée","dans 2 semaines : des articulations moins raides","au long cours : un terrain qui s'apaise, en soutien du reste"],
victoire:"tu viens de rééquilibrer tes gras — un des leviers les plus concrets contre l'inflammation.",
outil:{emoji:"🥑",label:"La fiche des bons gras",desc:"oméga-3 et gras protecteurs",cible:"telechargements"},
tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:"aujourd'hui on pose la fondation : l'Équilibre Féminin, la tisane centrale du protocole. 8 plantes qui soutiennent le cycle, la glycémie et le système nerveux. tu la gardes tout le reste du parcours."}},

  {day:9,emoji:"✨",theme:"le magnésium",
mission:"identifie une source de magnésium à ajouter aujourd'hui — cacao brut, oléagineux, légumes verts, ou commence une cure si tu te complémentes.",
msg:"si tu es épuisée, tendue, mal reposée.\n\nil y a de fortes chances que tu manques de ce minéral.\n\net il est au cœur de ton terrain.",
pourquoi:"le magnésium est l'un des minéraux les plus souvent bas chez les femmes avec un SMOP. et il agit pile là où ton terrain inflammatoire souffre.\n\nun : il aide à réguler le cortisol, l'hormone du stress — or un cortisol élevé en continu entretient l'inflammation. deux : il participe à un sommeil plus profond, le moment où ton corps répare et calme l'inflammation. trois : il soutient des centaines de réactions enzymatiques, dont celles de ton énergie.\n\nla forme compte : le bisglycinate est bien absorbé et doux pour le ventre, contrairement à l'oxyde (souvent dans les produits bas de gamme) qui passe mal.",
source:"le magnésium intervient dans la régulation du cortisol et la qualité du sommeil ; le stress et le SMOP ont une relation bidirectionnelle (Pasquali et al.).",
comment:["côté assiette : cacao brut, amandes, noix de cajou, graines de courge, légumes verts","si tu te complémentes : bisglycinate, le soir au coucher","200 à 400 mg selon les besoins, sur plusieurs semaines","associe-le à un bon sommeil : les deux se renforcent","patience : l'effet se ressent sur 2 à 4 semaines"],
pieges:["l'oxyde de magnésium (bas de gamme) est mal absorbé et peut donner mal au ventre","se complémenter à l'aveugle sans régularité : l'effet vient avec la durée","oublier l'alimentation : les aliments riches en magnésium comptent autant"],
plus:"mon réflexe du soir : un carré de chocolat noir 85% (riche en magnésium) avec ma tisane. c'est gourmand, ça participe à l'apport, et ça fait partie de mon rituel de fin de journée pour descendre en pression.",
observes:["dans quelques jours : un endormissement parfois plus facile","dans 2 semaines : moins de tension nerveuse, un sommeil plus profond","au long cours : une énergie plus stable"],
victoire:"tu viens d'agir sur le trio stress-sommeil-énergie avec un seul minéral.",
outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"dosage, timing et délai pour ton profil",cible:"complements"},
tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:"l'Équilibre Féminin contient de la mélisse et de l'ortie, qui soutiennent le système nerveux et reminéralisent — en synergie avec ton apport en magnésium."}},

  {day:10,emoji:"🥦",theme:"soutenir l'élimination",
mission:"ajoute un légume de la famille des crucifères aujourd'hui — brocoli, chou, chou-fleur, roquette.",
msg:"ton foie travaille pour toi en silence.\n\nc'est lui qui élimine l'excès d'hormones et les déchets.\n\naujourd'hui on lui donne un coup de main.",
pourquoi:"le foie est ton grand organe d'élimination : c'est lui qui transforme et évacue l'excès d'hormones et les composés inflammatoires. quand il est surchargé, tout s'accumule, et le terrain s'alourdit.\n\nles crucifères — brocoli, chou, chou-fleur, roquette, chou kale — contiennent des composés qui soutiennent les voies naturelles de détoxification du foie. ce ne sont pas des « détox miracle » (ça n'existe pas), mais une aide réelle et documentée au travail quotidien de ton foie.\n\nsoutenir l'élimination, c'est alléger la charge globale sur ton terrain.",
source:"les crucifères apportent des composés (glucosinolates) qui soutiennent les voies de détoxification hépatique ; soutenir l'élimination allège la charge globale.",
comment:["vise 3 à 4 portions de crucifères par semaine","varie : brocoli, chou-fleur, chou kale, roquette, choux de Bruxelles","légèrement cuits à la vapeur pour préserver leurs composés","associe à une bonne hydratation (le foie et les reins travaillent ensemble)","évite l'alcool et les ultra-transformés qui surchargent le foie"],
pieges:["« détox » en poudre ou jus miracle : marketing, pas de la biologie — les vrais alliés sont dans l'assiette","trop cuire les crucifères détruit une partie de leurs composés","les crucifères crus en grande quantité peuvent gêner la thyroïde chez certaines — légèrement cuits, c'est mieux"],
plus:"ta Cure Détox SOPK Life s'inscrit exactement dans cette logique : soutenir le foie, l'organe qui élimine l'excès d'androgènes et les composés inflammatoires. mais aucune tisane ne remplace l'assiette — elle l'accompagne.",
observes:["dans quelques jours : une digestion plus légère","dans 2 semaines : une sensation de « corps moins encrassé »","au long cours : un terrain qui s'allège"],
victoire:"tu viens de soutenir l'organe qui nettoie ton corps jour et nuit.",
outil:{emoji:"🍴",label:"Voir l'assiette SMOP (SOPK)",desc:"composer un repas qui soutient ton terrain",cible:"assiette"},
tisane:{nom:"Serenitea",timing:"le soir au coucher",lien:"https://sopklife.com/products/serenitea-detente-absolue",texte:"aujourd'hui on ajoute la Serenitea le soir. le stress et le cortisol entretiennent ton inflammation — la Serenitea aide à apaiser l'axe stress-cortisol et à mieux dormir. ton 3e pilier."}},

  {day:11,emoji:"🧘‍♀️",theme:"bouger pour désenflammer",
mission:"fais 15 minutes de mouvement qui mobilise ton corps en douceur — yoga, étirements, pilates, ou une marche active.",
msg:"ton corps n'a pas besoin d'être cassé à l'entraînement.\n\nil a besoin d'être mobilisé, oxygéné, détendu.\n\naujourd'hui on bouge pour apaiser, pas pour performer.",
pourquoi:"le mouvement régulier et modéré est anti-inflammatoire : il améliore la circulation, aide à drainer, régule le cortisol et soutient un sommeil réparateur. mais sur un terrain inflammatoire, c'est l'intensité DOUCE qui paie, pas l'épuisement.\n\nle renforcement doux (pilates, yoga dynamique, exercices au poids du corps) maintient la masse musculaire — importante pour le métabolisme — sans déclencher le pic de cortisol et de stress oxydatif d'une séance trop violente.\n\nle bon curseur : un effort qui te laisse tonique et détendue, pas vidée et courbaturée pendant 3 jours.",
source:"l'activité modérée régulière a des effets anti-inflammatoires ; un effort excessif élève le cortisol, qui entretient le terrain (Pasquali et al.).",
comment:["choisis une activité qui te fait du bien, pas qui te détruit","yoga, pilates, étirements, marche active : toutes valables","15 à 20 minutes suffisent si c'est régulier","respire profondément : l'oxygénation fait partie du bénéfice","finis par quelques étirements pour détendre"],
pieges:["croire qu'une séance « doit faire mal pour marcher » — faux sur ton terrain","enchaîner les HIIT intenses : contre-productif si ça t'épuise","le tout ou rien : 15 min douces valent mieux que 0"],
plus:"les vidéos de yoga doux ou de pilates de 15 min sur YouTube sont parfaites : gratuit, chez toi, à ton rythme. je garde une playlist de mes préférées pour les jours où je ne sais pas par où commencer.",
observes:["dès aujourd'hui : l'esprit plus clair, le corps détendu","dans quelques jours : moins de raideurs au réveil","dans 2 semaines : plus de tonus, un sommeil plus profond"],
victoire:"tu viens de bouger d'une façon qui apaise ton inflammation au lieu de l'attiser.",
outil:{emoji:"🧘‍♀️",label:null,desc:null,cible:null},
tisane:{nom:"Serenitea",timing:"le soir au coucher",lien:"https://sopklife.com/products/serenitea-detente-absolue",texte:"après une journée où tu as bougé, la Serenitea le soir accompagne la récupération et le retour au calme."}},

  {day:12,emoji:"🌿",theme:"curcuma & gingembre",
mission:"intègre du curcuma ou du gingembre à un plat ou une boisson aujourd'hui — et associe le curcuma à du poivre noir.",
msg:"certaines épices sont de vraies alliées anti-inflammatoires.\n\npas des remèdes miracles.\n\nmais des petits coups de pouce quotidiens qui comptent.",
pourquoi:"le curcuma (via la curcumine) et le gingembre ont montré des effets anti-inflammatoires dans plusieurs études. ce ne sont pas des médicaments et il ne faut pas en attendre des miracles, mais intégrés régulièrement à l'alimentation, ils participent à apaiser le terrain.\n\nle détail qui change tout pour le curcuma : la curcumine est très mal absorbée seule. associée au poivre noir (pipérine), son absorption est fortement augmentée. et un corps gras (huile, lait de coco) aide aussi.\n\nle gingembre, lui, soutient en plus la digestion — utile quand on travaille sur les ballonnements et l'inflammation digestive.",
source:"le curcuma et le gingembre ont montré des effets anti-inflammatoires dans certaines études ; les preuves spécifiques au SMOP restent à consolider. À utiliser comme soutien alimentaire, pas comme traitement.",
comment:["curcuma : toujours avec une pincée de poivre noir + un corps gras","dans un curry, un lait d'or (golden latte), une soupe, un dahl","gingembre : frais râpé dans l'eau chaude, les plats, les smoothies","régularité plutôt que grosse dose ponctuelle","en cuisine d'abord : simple, sûr, quotidien"],
pieges:["attendre un effet « médicament » : ce sont des soutiens, pas des traitements","le curcuma seul sans poivre ni gras : quasi pas absorbé","les compléments très dosés de curcumine : à voir avec un pro, surtout si traitement en cours (interactions possibles)"],
plus:"mon lait d'or du soir : lait végétal tiède, curcuma, pincée de poivre, gingembre, un peu de cannelle, filet de miel. réconfortant, anti-inflammatoire, et parfait pour clôturer la journée en douceur.",
observes:["au fil des semaines : un terrain un peu plus apaisé","côté digestion : le gingembre aide souvent assez vite","l'effet est progressif et s'inscrit dans l'ensemble"],
victoire:"tu viens d'ajouter deux alliées anti-inflammatoires à ton quotidien, et tu sais comment bien les utiliser.",
outil:{emoji:"📖",label:"Des recettes avec ces épices",desc:"les intégrer facilement",cible:"recettes"},
tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:"ton Équilibre Féminin contient déjà du gingembre, une des épices anti-inflammatoires du jour — un pont naturel entre équilibre hormonal et terrain apaisé."}},

  {day:13,emoji:"🌙",theme:"le sommeil répare l'inflammation",
mission:"ce soir, coupe les écrans 30 minutes avant de dormir et vise une heure de coucher régulière.",
msg:"le sommeil n'est pas un luxe.\n\nc'est le moment où ton corps répare et calme l'inflammation.\n\naujourd'hui on en fait une priorité.",
pourquoi:"pendant le sommeil profond, ton corps fait son travail de réparation et régule l'inflammation. un sommeil court ou haché fait l'inverse : il augmente le cortisol et les marqueurs inflammatoires, et dérègle l'appétit le lendemain.\n\nsur un terrain inflammatoire déjà fragile, mal dormir, c'est entretenir le feu. et le SMOP complique souvent le sommeil (cortisol, réveils nocturnes) — un vrai cercle à casser.\n\nles écrans le soir sont un des pires ennemis : leur lumière bleue retarde la mélatonine, l'hormone du sommeil. 30 minutes sans écran avant de dormir, c'est un des gestes les plus rentables qui existent.",
source:"le manque de sommeil élève le cortisol et les marqueurs inflammatoires ; le SMOP et le stress s'aggravent mutuellement (Pasquali et al.).",
comment:["coupe les écrans 30 min avant de dormir","vise une heure de coucher régulière, même le week-end","chambre fraîche, sombre, silencieuse","le magnésium le soir aide (voir Jour 9)","une tisane apaisante comme rituel de transition"],
pieges:["« je récupérerai le week-end » : le sommeil ne se rattrape pas vraiment","scroller au lit : la lumière bleue sabote ton endormissement","le café après 15h : il reste dans le corps bien plus longtemps qu'on croit"],
plus:"mon rituel du soir est devenu sacré : écrans coupés, lumière tamisée, tisane tiède, quelques pages de lecture. ce n'est pas de la routine « bien-être » pour faire joli — c'est ce qui fait la différence entre une nuit qui répare et une nuit qui subit.",
observes:["dès cette nuit : un endormissement un peu plus doux","dans quelques jours : des réveils moins difficiles","dans 2 semaines : une énergie et une humeur transformées par le sommeil"],
victoire:"tu viens de protéger le moment où ton corps répare le plus — ton sommeil.",
outil:{emoji:"⚡",label:"Le parcours fatigue complet",desc:"comprendre et retrouver ton énergie",cible:null},
tisane:{nom:"Serenitea",timing:"le soir au coucher",lien:"https://sopklife.com/products/serenitea-detente-absolue",texte:"la Serenitea est faite pour ça : passiflore et coquelicot apaisent le système nerveux et aident à l'endormissement, sans effet « lendemain difficile ». ton rituel sommeil."}},

  {day:14,emoji:"🏆",theme:"mi-parcours",
mission:"relis ton bilan du Jour 7 et note tout ce qui a changé depuis — même les plus petits signaux.",
msg:"deux semaines.\n\ntu as tenu deux semaines à apaiser ton terrain.\n\naujourd'hui on s'arrête un instant pour mesurer le chemin.",
pourquoi:"à mi-parcours, ton corps a changé plus que tu ne le crois. tu as réduit les pics de sucre et les pro-inflammatoires, rééquilibré tes gras, soutenu ton foie, mieux dormi et bougé en douceur. ton inflammation de bas grade a eu deux semaines pour commencer à desserrer.\n\nmais les changements sont encore surtout intérieurs : digestion, énergie, sommeil, humeur, ballonnements. le miroir vient plus tard. c'est normal, c'est biologique.\n\nfaire le point à mi-parcours, c'est voir noir sur blanc que ton corps répond — et c'est ça qui te donne la force de continuer les deux semaines qui restent.",
source:"les changements métaboliques et inflammatoires précèdent les changements visibles ; suivre les signaux soutient l'adhésion.",
comment:["relis ton bilan du Jour 7 dans le Journal","compare : digestion, énergie, ballonnements, sommeil, humeur, peau","note tout ce qui a bougé, même léger","célèbre ce que tu as tenu — deux semaines, c'est énorme","projette-toi : deux semaines encore pour ancrer tout ça"],
pieges:["ne pas voir ses progrès parce qu'on cherche au mauvais endroit (le miroir)","minimiser : « c'est rien » — non, chaque signal compte","vouloir aller plus vite : ton corps a son rythme, respecte-le"],
plus:"si aujourd'hui tu te dis « je ne vois pas de grand changement » — relis vraiment ton Jour 7. presque à chaque fois, il y a des petites choses qu'on a déjà oubliées : un ballonnement en moins, un réveil plus facile, une après-midi sans coup de barre. c'est ça, la vraie progression.",
observes:["aujourd'hui : tu mesures 2 semaines de travail de fond","dans 2 semaines (J30) : un bilan encore plus net","dans 2-3 mois : les changements visibles commencent à apparaître"],
victoire:"tu es à mi-chemin, et ton corps te répond déjà — tu es sur la bonne voie, Cyster.",
outil:{emoji:"📒",label:null,desc:null,cible:null},
tisane:{nom:"Inflamma Tea",timing:"milieu de journée",lien:"https://sopklife.com/products/inflamma-tea",texte:"mi-parcours, on ajoute enfin l'Inflamma Tea — ta tisane de profil. curcuma + gingembre (qui potentialise la curcumine), ortie et églantier : pensée pour le feu de fond. avec l'Équilibre Féminin, c'est la combo clé."}},


  {day:15,emoji:"🏥",theme:"préparer ton rendez-vous",
mission:"note les analyses à demander à ton prochain rendez-vous — et prépare la liste de tes symptômes.",
msg:"trop de femmes sortent du médecin frustrées.\n\nsans les bonnes analyses, sans réponses.\n\naujourd'hui on prépare ton rendez-vous pour que ça change.",
pourquoi:"arriver chez le médecin avec une demande précise transforme tout : tu ne subis plus, tu collabores. et un médecin face à une patiente informée répond différemment.\n\npour un terrain inflammatoire, certaines analyses éclairent particulièrement : la CRP ultra-sensible (un marqueur de l'inflammation de bas grade — les femmes avec un SMOP ont en moyenne une CRP environ 96% plus élevée que les femmes sans SMOP), le bilan hormonal classique (testostérone, SHBG), la glycémie et l'insuline à jeun (l'inflammation et l'insuline sont liées), la ferritine et la vitamine D (souvent impliquées dans la fatigue), et le bilan thyroïdien.\n\nnote aussi tes symptômes AVANT le rendez-vous : sur le moment, on en oublie toujours la moitié.",
source:"la CRP ultra-sensible est un marqueur de l'inflammation de bas grade ; les femmes avec un SMOP présentent en moyenne une CRP environ 96% plus élevée (méta-analyse Escobar-Morreale et al., 2011, Fertility & Sterility). Délai diagnostique en France : 2 à 4 ans (données épidémiologiques françaises).",
comment:["note les analyses : CRP ultra-sensible, bilan hormonal, glycémie + insuline à jeun, ferritine, vitamine D, TSH","prépare la liste de TES symptômes principaux","écris tes questions précises à l'avance","utilise l'onglet Médecin et tes scripts prêts à l'emploi","apporte tes anciennes analyses si tu en as"],
pieges:["demander juste « une prise de sang » sans préciser — tu repars incomplète","oublier la CRP : c'est elle qui parle de ton inflammation","ne pas noter tes symptômes : la mémoire flanche en consultation"],
plus:"si tu sens qu'on ne t'écoute pas ou qu'on balaie tes symptômes, tu as le droit de demander un deuxième avis. ton ressenti compte, tes symptômes comptent. tu vis dans ton corps tous les jours, pas le médecin.",
observes:["aujourd'hui : tu te sens en contrôle de ta santé","au rendez-vous : un échange plus précis et plus utile","après : des analyses qui éclairent vraiment ton terrain"],
victoire:"tu viens de reprendre le pouvoir sur ton parcours médical.",
outil:{emoji:"👩‍⚕️",label:"Préparer ton dossier médecin",desc:"scripts et analyses à demander",cible:null},
tisane:{nom:"Inflamma Tea",timing:"milieu de journée",lien:"https://sopklife.com/products/inflamma-tea",texte:"l'Inflamma Tea en milieu de journée soutient ton terrain pendant que tu prépares ton suivi médical."}},

  {day:16,emoji:"🫐",theme:"les antioxydants",
mission:"ajoute une poignée de fruits rouges ou un aliment très coloré à ta journée — myrtilles, grenade, chou rouge, betterave.",
msg:"la couleur dans ton assiette, ce n'est pas décoratif.\n\nc'est de la chimie anti-inflammatoire.\n\naujourd'hui on mise sur les antioxydants.",
pourquoi:"l'inflammation chronique s'accompagne de stress oxydatif — un excès de molécules qui abîment tes cellules. les antioxydants sont exactement ce qui neutralise ces molécules.\n\nles plus puissants se trouvent dans les aliments les plus colorés : les fruits rouges (myrtilles, mûres, framboises) et leurs anthocyanes, la grenade et ses polyphénols, le chou rouge, la betterave, les épinards, la vitamine C des agrumes et poivrons, la vitamine E des oléagineux.\n\nchaque couleur correspond à une famille d'antioxydants différente. varier les couleurs, c'est multiplier tes défenses.",
source:"les antioxydants alimentaires (polyphénols, vitamines C et E) neutralisent le stress oxydatif associé à l'inflammation chronique.",
comment:["vise « l'arc-en-ciel » : plusieurs couleurs par jour","les fruits rouges, surgelés nature, sont pratiques et aussi riches","grenade, chou rouge, betterave : des concentrés d'antioxydants","la vitamine C (agrumes, poivron, kiwi) : antioxydante ET aide à absorber le fer","un carré de chocolat noir 85% : riche en polyphénols aussi"],
pieges:["les jus de fruits « antioxydants » industriels : trop de sucre, peu de fibres","cuire longtemps détruit une partie des antioxydants et vitamines","croire qu'un seul « super-aliment » suffit : c'est la variété qui compte"],
plus:"mon réflexe : un bol de fruits rouges surgelés que je sors le matin, il décongèle tout seul, et je l'ajoute à mon skyr ou mon porridge. toute l'année, pas cher, et c'est un des gestes antioxydants les plus simples qui soient.",
observes:["au fil des semaines : une peau parfois plus lumineuse","au long cours : un terrain mieux défendu contre le stress oxydatif","un effet global, en soutien de tout le reste"],
victoire:"tu viens de renforcer tes défenses anti-inflammatoires, couleur après couleur.",
outil:{emoji:"⭐",label:"La fiche des super-aliments",desc:"les aliments les plus riches en antioxydants",cible:"telechargements"},
tisane:{nom:"Inflamma Tea",timing:"milieu de journée",lien:"https://sopklife.com/products/inflamma-tea",texte:"l'Inflamma Tea contient de l'églantier, une source naturelle de vitamine C antioxydante — en soutien de ton assiette colorée du jour."}},

  {day:17,emoji:"🦠",theme:"ton ventre, clé de l'inflammation",
mission:"ajoute un aliment fermenté OU une source de fibres nouvelle aujourd'hui — yaourt nature, kéfir, légumineuses, légumes variés.",
msg:"ton ventre, c'est bien plus qu'une digestion.\n\nc'est un des centres de contrôle de ton inflammation.\n\naujourd'hui on prend soin de ton microbiote.",
pourquoi:"ton intestin abrite des milliards de bactéries — ton microbiote. quand il est déséquilibré, la paroi intestinale peut devenir plus perméable et laisser passer des composés qui entretiennent l'inflammation dans tout le corps. un microbiote équilibré, à l'inverse, participe à réguler l'inflammation.\n\ncertains aliments peuvent fragiliser cette paroi intestinale : c'est souvent le cas du gluten (via des protéines appelées prolamines) et des produits laitiers (caséine, lactose), plus difficiles à digérer pour certaines. si tu les tolères bien, aucun souci — mais si ton ventre réagit, ça vaut le coup de l'observer.\n\ndeux leviers le nourrissent : les fibres (légumes, légumineuses, fruits entiers, céréales complètes) qui nourrissent les bonnes bactéries, et les aliments fermentés (yaourt nature, kéfir, choucroute) qui apportent des bactéries bénéfiques.\n\nla clé, c'est la diversité : plus tu varies les végétaux, plus ton microbiote est riche et résistant.",
source:"un microbiote intestinal déséquilibré est associé à une inflammation accrue ; fibres et aliments fermentés soutiennent son équilibre.",
comment:["vise la diversité végétale : l'objectif, c'est la variété, pas un aliment miracle","introduis les fibres progressivement si ton ventre n'y est pas habitué","un aliment fermenté par jour : yaourt nature, kéfir, choucroute crue","les légumineuses : trempées et bien cuites, elles passent mieux","hydrate-toi : les fibres ont besoin d'eau pour bien travailler"],
pieges:["augmenter les fibres trop vite : ballonnements assurés — vas-y doucement","les yaourts « probiotiques » sucrés : le sucre annule une partie du bénéfice","oublier la variété : manger toujours les mêmes légumes limite la richesse du microbiote"],
plus:"si tu as beaucoup de ballonnements, c'est justement le signe que ton ventre a besoin d'attention. vas-y très progressivement sur les fibres et les fermentés, observe (comme au Jour 3), et laisse ton microbiote s'adapter. et si tu suspectes un aliment précis (souvent le gluten ou les laitiers), tu peux l'exclure quelques semaines pour voir si tes symptômes s'améliorent — puis en parler à ton médecin, qui peut dépister une vraie intolérance. c'est un travail de fond, pas une course.",
observes:["dans quelques jours : une digestion qui se régule","dans 2 semaines : moins de ballonnements, un ventre plus apaisé","au long cours : un terrain inflammatoire soutenu par le ventre"],
victoire:"tu viens de prendre soin d'un des grands centres de contrôle de ton inflammation.",
outil:{emoji:"📚",label:"La fiche sur les fibres",desc:"les meilleures sources pour ton microbiote",cible:"telechargements"},
tisane:{nom:"Inflamma Tea",timing:"milieu de journée",lien:"https://sopklife.com/products/inflamma-tea",texte:"la menthe poivrée de l'Inflamma Tea apaise l'inflammation intestinale — 70% de ton immunité est dans ton ventre, le thème du jour."}},

  {day:18,emoji:"💪",theme:"ancrer le mouvement",
mission:"refais une séance de mouvement doux aujourd'hui — et remarque si c'est déjà un peu plus facile qu'au début.",
msg:"deux semaines et demie que tu bouges autrement.\n\nce qui semblait un effort devient une habitude.\n\naujourd'hui on ancre.",
pourquoi:"le bénéfice anti-inflammatoire du mouvement vient de la RÉGULARITÉ, pas de l'intensité ponctuelle. en bougeant doucement et régulièrement depuis deux semaines, tu as amélioré ta circulation, ton drainage, ta régulation du cortisol et ton sommeil.\n\naujourd'hui, l'enjeu n'est pas de faire plus dur, mais de confirmer que c'est en train de devenir TON rythme. le corps s'habitue : ce qui te coûtait au Jour 5 te coûte un peu moins maintenant.\n\nc'est ça, construire une habitude durable : pas la motivation des premiers jours, mais la routine qui tient dans le temps.",
source:"l'activité modérée régulière a un effet anti-inflammatoire ; c'est la constance qui produit le bénéfice (Pasquali et al. pour le lien cortisol).",
comment:["refais ton activité douce préférée : marche, yoga, pilates, étirements","remarque ce qui est devenu plus facile depuis le Jour 5","vise la régularité sur la semaine, pas la performance d'un jour","écoute ton corps : certains jours plus doux, d'autres plus toniques","célèbre le fait que tu tiens une habitude"],
pieges:["vouloir soudain « passer au niveau supérieur » en intensité : reste sur le doux","se décourager un jour sans énergie : une marche de 10 min compte aussi","comparer ta progression à celle des autres : c'est TON rythme qui compte"],
plus:"le vrai signe que ça marche, ce n'est pas de soulever plus lourd. c'est de te rendre compte qu'un geste du quotidien — monter les escaliers, porter tes courses — te coûte un peu moins qu'avant. ça, c'est ton corps qui se renforce en silence.",
observes:["aujourd'hui : un mouvement un peu plus fluide qu'au début","dans 2 semaines : une habitude vraiment installée","au long cours : un corps plus tonique et moins enflammé"],
victoire:"tu viens de transformer un effort en habitude — c'est ça qui dure.",
outil:{emoji:"💪",label:null,desc:null,cible:null},
tisane:null},

  {day:19,emoji:"⚡",theme:"le zinc",
mission:"intègre une source de zinc aujourd'hui — graines de courge, légumineuses, fruits de mer, ou viande maigre.",
msg:"un petit minéral, de grands rôles.\n\npeau, immunité, cicatrisation.\n\naujourd'hui on parle du zinc.",
pourquoi:"le zinc est souvent bas chez les femmes avec un SMOP, et il intervient à des endroits clés de ton terrain. il participe à la santé de la peau (utile si tu as de l'acné ou une peau réactive), au bon fonctionnement du système immunitaire, à la cicatrisation, et il a un rôle dans la régulation de l'inflammation.\n\nles meilleures sources : les huîtres et fruits de mer (les plus riches), la viande maigre, et côté végétal les graines de courge, les légumineuses, les noix de cajou — mais le zinc végétal est moins bien absorbé, d'où l'intérêt de varier.\n\ncomme toujours : l'alimentation d'abord, et une complémentation seulement après avis, car un excès de zinc déséquilibre le cuivre.",
source:"le zinc participe à la santé cutanée, à l'immunité et à la cicatrisation ; les preuves spécifiques au SMOP restent préliminaires, l'apport alimentaire reste la base.",
comment:["côté végétal : graines de courge, légumineuses, noix de cajou","côté animal : fruits de mer, viande maigre (mieux absorbés)","les graines de courge en collation : un geste zinc facile","varie les sources pour optimiser l'absorption","complémentation : seulement après avis, jamais à l'aveugle (équilibre avec le cuivre)"],
pieges:["se complémenter en zinc longtemps sans avis : ça peut déséquilibrer le cuivre","compter sur le seul zinc végétal : il est moins bien absorbé","attendre un effet « peau » immédiat : c'est un soutien de fond"],
plus:"les graines de courge sont mon snack zinc préféré : une petite poignée dans la journée, ça se glisse partout — sur une salade, dans un yaourt, telles quelles. simple et efficace.",
observes:["au fil des semaines : une peau parfois plus apaisée","côté immunité : un soutien de fond","l'effet s'inscrit dans l'ensemble de ton terrain"],
victoire:"tu viens d'ajouter un minéral clé pour ta peau et ton immunité.",
outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"dosage, timing et délai pour ton profil",cible:"complements"},
tisane:{nom:"Inflamma Tea",timing:"milieu de journée",lien:"https://sopklife.com/products/inflamma-tea",texte:"l'ortie de l'Inflamma Tea est reminéralisante (magnésium, zinc, fer) — les carences amplifient l'inflammation, elle aide à les combler."}},

  {day:20,emoji:"☀️",theme:"la nature & la lumière",
mission:"passe au moins 15 minutes dehors aujourd'hui, à la lumière du jour — idéalement le matin.",
msg:"ton corps a besoin de lumière et de nature.\n\npas comme un luxe.\n\ncomme un régulateur profond de ton terrain.",
pourquoi:"la lumière du jour, surtout le matin, règle ton horloge interne — celle qui gouverne ton cortisol et ton sommeil. une bonne exposition le matin aide ton cortisol à suivre son rythme naturel (haut le matin, bas le soir), ce qui apaise le terrain et améliore le sommeil la nuit.\n\nle soleil permet aussi à ta peau de synthétiser la vitamine D, souvent basse chez les femmes SMOP et impliquée dans l'immunité, l'humeur et l'inflammation.\n\net le simple fait d'être dans la nature fait baisser le stress perçu et le cortisol. marche en forêt, parc, bord de mer : c'est un apaisant puissant et gratuit.",
source:"l'exposition à la lumière du matin régule le rythme du cortisol et le sommeil ; le soleil permet la synthèse de vitamine D (le SMOP et le stress sont bidirectionnels, Pasquali et al.).",
comment:["sors le matin si possible : 15 min de lumière suffisent à caler ton horloge","marche dans un endroit vert si tu peux : l'effet nature s'ajoute","sans lunettes de soleil les premières minutes (lumière = signal pour l'horloge)","combine avec ta marche du jour : deux bénéfices en un","même par temps gris, la lumière extérieure reste bien plus forte qu'en intérieur"],
pieges:["rester enfermée toute la journée : ton horloge et ton cortisol se dérèglent","compter uniquement sur l'alimentation pour la vitamine D : le soleil compte beaucoup","le soir, à l'inverse, tamiser la lumière : l'horloge marche dans les deux sens"],
plus:"mon rituel préféré : ma marche du matin à la lumière, même courte. ça cale mon cortisol, ça me réveille mieux que le café, et ça me prépare une meilleure nuit le soir. c'est un des gestes les plus sous-estimés pour un terrain apaisé.",
observes:["dès aujourd'hui : un esprit plus clair, une humeur plus stable","dans quelques jours : un sommeil qui s'améliore","au long cours : un cortisol mieux réglé, un terrain plus calme"],
victoire:"tu viens d'utiliser la lumière et la nature comme régulateurs de ton terrain.",
outil:{emoji:"☀️",label:null,desc:null,cible:null},
tisane:null},

  {day:21,emoji:"📈",theme:"rendre visible ce qui a changé",
mission:"fais le point sur 3 semaines : qu'est-ce qui a changé dans ton quotidien, ton énergie, ton corps ?",
msg:"trois semaines.\n\ntu as changé énormément de choses en douceur.\n\naujourd'hui on rend tout ça visible, noir sur blanc.",
pourquoi:"après 3 semaines, les changements s'accumulent. mais notre cerveau s'habitue vite au mieux et oublie d'où on est parti. c'est pour ça qu'il faut rendre les progrès VISIBLES : les écrire, les comparer à tes bilans des Jours 7 et 14.\n\nsur un terrain inflammatoire, les signes qui bougent en premier sont souvent la digestion, l'énergie, le sommeil, les ballonnements, parfois la peau et les douleurs. ce sont des signaux réels, même s'ils ne se voient pas encore clairement dans le miroir.\n\nvoir le chemin parcouru, c'est ce qui te donne la force de tenir la dernière semaine — et de continuer après.",
source:"suivre ses progrès de façon concrète soutient la motivation et l'adhésion sur le long terme.",
comment:["relis tes bilans des Jours 7 et 14","note tout ce qui a bougé depuis 3 semaines","énergie, sommeil, digestion, ballonnements, humeur, peau, douleurs","compare : où en étais-tu il y a 3 semaines ?","garde tout dans l'onglet Journal"],
pieges:["ne pas voir ses progrès faute de les avoir notés","chercher LA grande transformation visible : ce sont les petits signaux cumulés qui comptent","se dévaloriser : 3 semaines de constance, c'est une vraie réussite"],
plus:"relis-toi vraiment, en détail. presque à chaque fois, en comparant avec le Jour 7, on découvre des changements qu'on avait déjà intégrés sans s'en rendre compte. c'est la preuve concrète que ton corps répond — garde-la précieusement pour les jours de doute.",
observes:["aujourd'hui : tu vois 3 semaines de travail rassemblées","dans une semaine (J30) : le bilan final, encore plus net","dans 2-3 mois : les changements visibles s'installent"],
victoire:"tu viens de rendre visible tout le chemin parcouru — et il est réel.",
outil:{emoji:"📒",label:null,desc:null,cible:null},
tisane:null},


  {day:22,emoji:"🔬",theme:"relire tes analyses",
mission:"si tu as des analyses récentes, ressors-les et repère tes marqueurs d'inflammation et tes carences.",
msg:"des chiffres sur une feuille.\n\nmais derrière, c'est l'état réel de ton terrain.\n\naujourd'hui on apprend à les lire.",
pourquoi:"tes analyses racontent ce qui se passe à l'intérieur. sur un terrain inflammatoire, trois éléments méritent ton attention : la CRP ultra-sensible (plus elle est basse, mieux c'est pour ton inflammation de fond), la ferritine (une ferritine basse entretient la fatigue, et une ferritine très haute peut aussi signaler de l'inflammation), et la vitamine D (souvent insuffisante).\n\nmais attention : lire ses analyses n'est pas poser un diagnostic. l'interprétation revient à ton médecin. l'objectif ici, c'est de comprendre les grandes lignes pour avoir une vraie conversation avec lui, pas de jouer au docteur.\n\nsi tu n'as pas d'analyses récentes, ce jour est l'occasion de planifier le rendez-vous pour les faire.",
source:"la CRP ultra-sensible reflète l'inflammation de bas grade ; la ferritine basse entretient la fatigue. L'interprétation reste du ressort médical.",
comment:["ressors tes analyses récentes si tu en as","repère : CRP, ferritine, vitamine D, glycémie/insuline","utilise l'onglet Analyses pour comprendre ce que chaque marqueur raconte","note tes questions pour ton médecin","compare avec d'anciennes analyses si tu en as, pour voir l'évolution"],
pieges:["interpréter seule un résultat comme un diagnostic : non, c'est le rôle du médecin","se fier à « c'est normal » sans le chiffre exact : demande les valeurs","paniquer devant un marqueur : un chiffre isolé ne dit pas tout, c'est l'ensemble qui compte"],
plus:"le guide des analyses SMOP (dans tes fiches à télécharger) t'explique chaque marqueur simplement. garde-le sous la main pour tes prochains rendez-vous — tu arriveras en comprenant ce dont on parle, et ça change tout dans l'échange avec le médecin.",
observes:["aujourd'hui : tu comprends mieux ton bilan","au rendez-vous : un échange plus éclairé","au long cours : tu suis l'évolution de ton terrain dans le temps"],
victoire:"tu viens d'apprendre à lire ton corps à travers tes analyses.",
outil:{emoji:"🩸",label:"Le guide des analyses SMOP",desc:"comprendre chaque marqueur simplement",cible:"telechargements"},
tisane:null},

  {day:23,emoji:"🌞",theme:"la vitamine D",
mission:"vérifie ton apport en vitamine D — exposition au soleil, alimentation, ou supplémentation si ton médecin l'a recommandée.",
msg:"la vitamine la plus souvent manquante.\n\net une des plus importantes pour ton terrain.\n\naujourd'hui on s'en occupe.",
pourquoi:"la vitamine D n'est pas qu'une histoire d'os. elle joue un rôle dans l'immunité, l'humeur, et la régulation de l'inflammation. or elle est très fréquemment insuffisante chez les femmes avec un SMOP, surtout en automne et en hiver.\n\nelle se fabrique sous l'action du soleil sur la peau — d'où l'importance de sortir (Jour 20). mais d'octobre à avril sous nos latitudes, le soleil ne suffit souvent pas. l'alimentation (poissons gras, jaune d'œuf) aide mais couvre rarement les besoins.\n\nc'est l'un des rares nutriments où la supplémentation est souvent justifiée — mais idéalement après un dosage sanguin et sur recommandation médicale, pour ajuster la dose.",
source:"la vitamine D participe à l'immunité et à la modulation de l'inflammation ; l'insuffisance est fréquente et se corrige après dosage, sur avis médical.",
comment:["côté soleil : l'exposition régulière, surtout d'avril à septembre","côté assiette : poissons gras, jaune d'œuf, aliments enrichis","fais doser ta vitamine D si ce n'est pas déjà fait","supplémentation : sur avis médical, avec la bonne dose","l'hiver, la supplémentation est souvent nécessaire"],
pieges:["se supplémenter à l'aveugle à forte dose : la vitamine D se stocke, l'excès existe","compter uniquement sur l'alimentation : elle couvre rarement les besoins","oublier que sans soleil l'hiver, le niveau chute pour presque tout le monde"],
plus:"c'est vraiment le complément que je recommande de faire doser en priorité, parce que la carence est tellement fréquente et qu'elle touche directement l'énergie, l'humeur et l'inflammation. demande-le à ton prochain bilan, c'est une analyse simple.",
observes:["au fil des semaines (si carence corrigée) : plus d'énergie, meilleure humeur","côté immunité : un soutien de fond","un effet global sur le terrain inflammatoire"],
victoire:"tu viens de t'occuper d'une des carences les plus fréquentes et les plus impactantes.",
outil:{emoji:"🩸",label:"Comprendre ta vitamine D",desc:"dans le guide des analyses",cible:"telechargements"},
tisane:null},

  {day:24,emoji:"🧠",theme:"le stress, ce grand déclencheur",
mission:"fais 5 minutes de cohérence cardiaque aujourd'hui — inspire 5 secondes, expire 5 secondes, pendant 5 minutes.",
msg:"on parle beaucoup d'alimentation.\n\nmais le stress chronique est un carburant direct de l'inflammation.\n\naujourd'hui on s'en occupe vraiment.",
pourquoi:"le stress n'est pas « juste dans la tête ». un stress chronique maintient ton cortisol élevé en permanence, et un cortisol élevé entretient directement l'inflammation et dérègle tes hormones. c'est documenté : le SMOP et le stress s'aggravent mutuellement.\n\nsur un terrain inflammatoire, apprendre à faire baisser le stress n'est pas un « bonus bien-être » : c'est agir sur une des racines du problème.\n\nla cohérence cardiaque est l'outil le plus simple et le plus étudié : en respirant à un rythme précis (environ 5 secondes à l'inspiration, 5 à l'expiration) pendant 5 minutes, tu envoies à ton système nerveux le signal que le danger est passé. le cortisol redescend. c'est de la neurobiologie, pas du yoga ésotérique.",
source:"le SMOP et le stress ont une relation bidirectionnelle, chacun aggravant l'autre (Pasquali et al.) ; la cohérence cardiaque agit sur le système nerveux autonome.",
comment:["installe-toi au calme, assise, dos droit","inspire doucement 5 secondes, expire doucement 5 secondes","continue pendant 5 minutes (environ 30 cycles)","idéalement 3 fois par jour, mais même 1 fois aide","des applications gratuites rythment la respiration pour toi"],
pieges:["croire que « gérer son stress » est secondaire : c'est une racine, pas un détail","attendre un calme parfait pour s'y mettre : on pratique justement pour l'obtenir","vouloir tout régler d'un coup : 5 minutes régulières valent mieux qu'une heure une fois"],
plus:"les moments où j'en ai le moins envie sont souvent ceux où j'en ai le plus besoin. 5 minutes de respiration avant un rendez-vous stressant, ou le soir quand ma tête tourne, et je sens physiquement la pression redescendre. c'est gratuit, ça marche, et personne ne le prescrit.",
observes:["dès aujourd'hui : un apaisement immédiat après la séance","dans quelques jours : une réactivité au stress un peu moindre","au long cours : un cortisol mieux régulé, un terrain plus calme"],
victoire:"tu viens d'agir sur une des vraies racines de ton inflammation : le stress.",
outil:{emoji:"🤍",label:"Le coach mindset de Kamila",desc:"quand le moral ou le stress montent",cible:null},
tisane:{nom:"Serenitea",timing:"le soir au coucher",lien:"https://sopklife.com/products/serenitea-detente-absolue",texte:"la Serenitea est ta tisane anti-stress : l'ashwagandha aide à réguler le cortisol, en complément direct de ta respiration du jour. le soir, en rituel."}},

  {day:25,emoji:"🌅",theme:"ancrer l'habitude",
mission:"regarde ton assiette d'aujourd'hui : est-ce qu'elle est déjà, naturellement, plus apaisante qu'il y a 25 jours ?",
msg:"la différence entre « j'essaie de manger mieux » et « c'est comme ça que je mange ».\n\ntu es en train de passer de l'un à l'autre.\n\naujourd'hui on grave l'habitude.",
pourquoi:"après 25 jours, beaucoup de tes nouveaux réflexes sont en train de devenir automatiques : remplir la moitié de ton assiette de légumes, garder les féculents pour la fin, choisir les bons gras, bouger en douceur. ce qui demandait un effort conscient commence à se faire tout seul.\n\nc'est exactement là que se joue la réussite sur le long terme : pas dans la motivation des débuts, qui retombe toujours, mais dans l'habitude installée, qui tient même les jours sans envie.\n\naujourd'hui, prends conscience du chemin : ton assiette d'aujourd'hui n'est probablement plus celle d'il y a 25 jours, sans même que tu y penses.",
source:"les comportements répétés deviennent automatiques avec le temps ; l'habitude installée est plus durable que la motivation.",
comment:["regarde ton assiette du jour avec recul","remarque les réflexes devenus automatiques","identifie 1 ou 2 habitudes vraiment ancrées","sois fière : c'est ça, le changement durable","ne vise pas la perfection, vise la constance"],
pieges:["croire qu'un écart casse tout : une habitude ancrée encaisse les écarts","attendre d'être « parfaite » : la constance imparfaite bat la perfection ponctuelle","oublier de reconnaître le chemin : c'est ce qui donne envie de continuer"],
plus:"le vrai signe que c'est ancré : tu commences à faire ces choix sans y penser, même quand tu es fatiguée ou pressée. c'est là que tu sais que ce n'est plus un « régime » que tu suis, mais ta façon de manger. et ça, personne ne pourra te l'enlever.",
observes:["aujourd'hui : tu mesures le chemin automatique parcouru","dans les mois à venir : ces habitudes continuent de travailler pour toi","au long cours : un terrain durablement plus apaisé"],
victoire:"tu n'essaies plus — tu vis différemment. c'est ça, la vraie victoire.",
outil:{emoji:"🍴",label:"Revoir l'assiette qui apaise",desc:"le modèle à garder à vie",cible:"assiette"},
tisane:{nom:"Inflamma Tea",timing:"milieu de journée",lien:"https://sopklife.com/products/inflamma-tea",texte:"l'Inflamma Tea fait maintenant partie de tes réflexes ancrés — un geste anti-inflammatoire quotidien, sans y penser."}},

  {day:26,emoji:"📁",theme:"passer à l'action médicale",
mission:"si ce n'est pas encore fait, prends ou planifie ton rendez-vous médical — avec ta liste d'analyses prête.",
msg:"comprendre, c'est la première étape.\n\nagir sur ton suivi médical, c'en est une autre.\n\naujourd'hui on passe à l'action.",
pourquoi:"tu as maintenant les clés pour un rendez-vous utile : tu sais quelles analyses demander (CRP, bilan hormonal, glycémie/insuline, ferritine, vitamine D, thyroïde), tu sais nommer tes symptômes, et tu comprends ton terrain. c'est le moment de transformer tout ça en action concrète.\n\nun bon suivi médical ne remplace pas ce que tu fais au quotidien — mais il le complète. il permet de vérifier tes marqueurs, de corriger une carence précise, d'écarter d'autres causes, et d'ajuster si besoin.\n\nprendre ce rendez-vous, c'est refuser de rester dans le flou. c'est t'occuper de toi pour de vrai.",
source:"un suivi médical régulier complète les mesures d'hygiène de vie ; le délai diagnostique du SMOP en France reste long (2 à 4 ans en moyenne).",
comment:["prends ou planifie le rendez-vous (médecin traitant, endocrino ou gynéco)","apporte ta liste d'analyses (vue au Jour 15)","apporte la liste de tes symptômes","apporte tes anciennes analyses si tu en as","utilise tes scripts médecin pour structurer l'échange"],
pieges:["repousser indéfiniment « quand j'aurai le temps » : prends le rendez-vous maintenant","y aller sans préparation : tu risques de repartir sans les bonnes analyses","te laisser décourager par un médecin pressé : tu as le droit à un deuxième avis"],
plus:"si tu appréhendes le rendez-vous, relis tes scripts médecin juste avant. arriver préparée et structurée change complètement la dynamique : tu n'es plus une patiente qui subit, tu es une femme qui connaît son corps et collabore. et les médecins le ressentent.",
observes:["aujourd'hui : tu reprends la main sur ton suivi","au rendez-vous : un échange utile et structuré","après : un plan clair, des marqueurs suivis"],
victoire:"tu viens de transformer ta compréhension en action concrète pour ta santé.",
outil:{emoji:"👩‍⚕️",label:"Tes scripts médecin",desc:"pour structurer ton rendez-vous",cible:null},
tisane:null},

  {day:27,emoji:"🎯",theme:"bilan honnête",
mission:"fais un bilan sincère : qu'est-ce qui a bien marché pour toi ? qu'est-ce qui a été difficile ?",
msg:"pas de langue de bois avec toi-même.\n\nce qui a marché, ce qui a coincé.\n\naujourd'hui on fait un vrai bilan honnête.",
pourquoi:"à quelques jours de la fin, un bilan sincère vaut de l'or. pas pour te juger — pour apprendre à te connaître. qu'est-ce qui s'est intégré facilement ? qu'est-ce qui a résisté ? quels jours ont été durs, et pourquoi ?\n\ncette lucidité, c'est ce qui te permettra de continuer APRÈS les 30 jours. parce que le but n'a jamais été de « tenir un mois », mais de construire une nouvelle façon de vivre avec ton terrain.\n\nsois honnête ET bienveillante. tu n'as pas à avoir tout réussi parfaitement. tu as à comprendre ce qui marche pour TOI, pour pouvoir le garder.",
source:"l'auto-évaluation bienveillante soutient le maintien des changements au-delà d'un programme.",
comment:["note ce qui a bien marché, ce qui t'a plu","note ce qui a été difficile, et essaie de comprendre pourquoi","distingue ce que tu veux garder de ce qui ne te convient pas","sois honnête sans te juger : tu apprends, tu ne te notes pas","projette : comment continuer après le Jour 30 ?"],
pieges:["ne retenir que le négatif : liste d'abord ce qui a marché","te culpabiliser pour les jours ratés : ils font partie du chemin","vouloir tout garder : choisis ce qui TE convient vraiment"],
plus:"les choses qui ont été difficiles ne sont pas des échecs : ce sont des informations. si un geste n'a pas tenu, ce n'est pas que tu as « manqué de volonté », c'est peut-être qu'il ne s'intégrait pas à ta vie. cherche la version qui TE convient, pas celle d'un programme idéal.",
observes:["aujourd'hui : tu sais ce qui marche pour toi","après le Jour 30 : tu gardes ce qui te convient","au long cours : une façon de vivre vraiment tienne"],
victoire:"tu viens de faire quelque chose de rare : un bilan honnête et bienveillant avec toi-même.",
outil:{emoji:"📒",label:null,desc:null,cible:null},
tisane:null},

  {day:28,emoji:"⚡",theme:"tout ensemble",
mission:"aujourd'hui, essaie de réunir le maximum de tes nouveaux réflexes en une seule journée type anti-inflammatoire.",
msg:"tu as appris les pièces une par une.\n\naujourd'hui on les assemble.\n\nune journée qui apaise, du matin au soir.",
pourquoi:"depuis 28 jours, tu as construit ton puzzle anti-inflammatoire pièce par pièce. aujourd'hui, l'idée est de voir comment tout s'emboîte sur une seule journée : un matin qui n'enflamme pas, une assiette colorée et équilibrée, du mouvement doux, de la lumière, un moment de respiration, un bon sommeil.\n\ntu verras que ce n'est pas une contrainte épuisante — c'est une journée qui, au contraire, te laisse plus d'énergie. parce que chaque geste travaille dans le même sens : apaiser ton terrain.\n\nce n'est pas un modèle à reproduire parfaitement tous les jours. c'est une référence, une « journée idéale » dont tu te rapproches quand tu peux, sans culpabiliser les autres jours.",
source:"les leviers d'hygiène de vie agissent en synergie ; leur combinaison a plus d'effet que chacun isolément.",
comment:["matin : lumière + petit-déj protéiné + hydratation","journée : assiette colorée, ordre des aliments, bons gras","mouvement doux à un moment qui te convient","5 min de respiration quand tu y penses","soir : repas léger, écrans coupés, rituel de sommeil"],
pieges:["viser la journée parfaite tous les jours : c'est une référence, pas une prison","se décourager si tout n'est pas coché : chaque geste compte, même seul","oublier le plaisir : une journée apaisante reste une journée agréable"],
plus:"n'attends pas d'avoir une journée « parfaite » pour être fière. certains jours tu cocheras tout, d'autres juste deux ou trois choses, et c'est très bien. ce qui compte, c'est la direction générale, pas la perfection quotidienne. tu as tous les outils maintenant.",
observes:["aujourd'hui : tu vois comment tout s'emboîte","dans les semaines à venir : tu t'en rapproches naturellement","au long cours : c'est devenu ton quotidien, sans effort"],
victoire:"tu sais maintenant à quoi ressemble une journée qui apaise ton terrain — et tu sais la créer.",
outil:{emoji:"📍",label:"Les guides du quotidien",desc:"petit-déj, repas, situations",cible:"situations"},
tisane:{nom:"Inflamma Tea",timing:"milieu de journée",lien:"https://sopklife.com/products/inflamma-tea",texte:"dans ta journée type, le trio gagnant : Équilibre Féminin en milieu de journée, Inflamma Tea pour le terrain, Serenitea le soir. ta routine complète."}},

  {day:29,emoji:"📊",theme:"mesurer le chemin parcouru",
mission:"relis tous tes bilans (Jours 7, 14, 21) et mesure tout ce qui a changé en un mois.",
msg:"presque un mois.\n\nregarde d'où tu es partie.\n\naujourd'hui on mesure vraiment le chemin.",
pourquoi:"c'est le moment de prendre de la hauteur. relis tes bilans des Jours 7, 14 et 21, et compare avec aujourd'hui. mets bout à bout tous les petits signaux : la digestion, l'énergie, le sommeil, les ballonnements, l'humeur, la peau, les douleurs.\n\nindividuellement, chaque changement peut sembler modeste. mis ensemble, sur un mois, ils dessinent souvent une vraie transformation — celle que tu ne vois pas au jour le jour parce que tu la vis de l'intérieur.\n\nce bilan global, c'est ta preuve. la preuve que ton terrain répond, que ce que tu fais marche, et que ça vaut la peine de continuer bien au-delà de ces 30 jours.",
source:"l'accumulation de petits changements mesurée dans le temps révèle une progression que l'observation quotidienne masque.",
comment:["relis tes bilans des Jours 7, 14 et 21","mets bout à bout tous les signaux qui ont bougé","compare ton état d'aujourd'hui à celui d'il y a un mois","écris ce bilan global dans ton Journal","garde-le : c'est ta preuve pour les jours de doute"],
pieges:["sous-estimer l'accumulation : chaque petit signe compte dans le total","chercher LA transformation spectaculaire : c'est la somme qui parle","oublier que les changements visibles arrivent souvent après, dans les mois suivants"],
plus:"garde précieusement ce bilan d'un mois. les jours où tu douteras, où tu auras envie de tout lâcher, relis-le. c'est la preuve noir sur blanc, écrite par toi, que ton corps répond quand tu prends soin de lui. aucune publicité, aucun « avant/après » ne vaut ta propre expérience.",
observes:["aujourd'hui : tu mesures un mois complet de travail","dans 2-3 mois : les changements visibles s'installent","au long cours : une trajectoire qui continue de monter"],
victoire:"tu viens de mesurer un mois entier de soin à ton terrain — et le chemin est réel.",
outil:{emoji:"📒",label:null,desc:null,cible:null},
tisane:null},

  {day:30,emoji:"🌸",theme:"ce que tu emmènes",
mission:"choisis les 3 habitudes que tu veux absolument garder — celles qui t'ont fait le plus de bien.",
msg:"30 jours.\n\ntu l'as fait.\n\naujourd'hui ce n'est pas une fin — c'est un début.",
pourquoi:"félicitations, Cyster. 30 jours à comprendre et à apaiser ton terrain inflammatoire. tu n'as pas suivi un régime, tu as appris une nouvelle façon de prendre soin de toi.\n\nmaintenant, le vrai enjeu : ne pas tout garder — garder l'essentiel. parce qu'on ne tient pas 30 nouvelles habitudes en même temps toute une vie. mais 3 habitudes vraiment ancrées, celles qui t'ont fait le plus de bien, ça, tu peux les garder pour toujours.\n\nce protocole restera là, tu pourras y revenir quand tu veux. mais à partir d'aujourd'hui, tu n'as plus besoin de quelqu'un pour te dire quoi faire : tu comprends ton corps, tu connais tes leviers, tu es devenue ta propre alliée.",
source:"se concentrer sur quelques habitudes clés favorise leur maintien durable, mieux que de vouloir tout tenir à la fois.",
comment:["choisis les 3 habitudes qui t'ont fait le plus de bien","écris-les, affiche-les si tu veux","garde-les comme ta base, le reste viendra en bonus","reviens au protocole quand tu en as besoin","sois fière : tu as pris soin de toi pendant 30 jours"],
pieges:["vouloir tout garder : choisis l'essentiel, c'est ça qui tient","croire que « c'est fini » : c'est un début, ton terrain se soigne sur la durée","oublier de célébrer : 30 jours de constance, c'est immense"],
plus:"tu es passée de « je ne comprends rien à ce qui m'arrive » à « je sais comment prendre soin de mon terrain ». c'est le plus beau cadeau que tu pouvais te faire. et quoi qu'il arrive maintenant, cette compréhension, personne ne pourra te l'enlever. tu n'es plus seule face à ton SMOP — tu as les clés.",
observes:["aujourd'hui : tu repars avec tes 3 habitudes clés","dans les mois à venir : les changements continuent, visibles cette fois","pour la vie : une compréhension de ton corps qui ne te quittera plus"],
victoire:"tu as terminé. tu comprends ton terrain, tu as tes outils, tu es ta propre alliée. je suis fière de toi, Cyster.",
outil:null,
tisane:{nom:"Inflamma Tea",timing:"milieu de journée",lien:"https://sopklife.com/products/inflamma-tea",texte:"l'Inflamma Tea et l'Équilibre Féminin restent ton duo de fond, bien au-delà de ces 30 jours — ton rituel de soin pour ton terrain."}},

];

// routeur de missions par profil (repli sur métabolique pour les jours non encore écrits)

const MISSIONS_ANDRO = [
  {day:1,emoji:"🌱",theme:"couper le signal androgénique",
mission:"mange ton prochain repas dans le bon ordre — légumes et fibres d'abord, protéines et gras ensuite, féculents et sucres en dernier.",
msg:"l'acné, la pilosité, les cheveux qui tombent.\n\nla plupart des médecins traitent les symptômes un par un.\n\naujourd'hui on s'attaque à ce qui les nourrit tous.",
pourquoi:"voici le mécanisme central de ton profil : quand ton insuline grimpe, elle envoie un signal direct à tes ovaires — produisez plus d'androgènes. et ce sont ces androgènes en excès (testostérone, DHT) qui nourrissent ton acné, ta pilosité et ta chute de cheveux.\n\ndonc même si tes symptômes sont « sur la peau », une partie de la solution est dans ton assiette. l'ordre des aliments est ton premier levier : les légumes en premier forment un gel de fibres qui ralentit l'arrivée du sucre, lisse le pic d'insuline, et coupe un peu plus ce signal androgénique à chaque repas.\n\nmême assiette, ordre différent, moins d'androgènes produits. c'est gratuit, invisible, et tu le gardes à vie.",
source:"la résistance à l'insuline stimule la production d'androgènes ovariens et entretient l'hyperandrogénie (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["repère dans ton assiette où sont les légumes et où sont les féculents","mange tes légumes (ou au moins la moitié) en premier","passe aux protéines et au gras : viande, poisson, œuf, avocat","termine par les féculents et le sucré","mange tranquillement — le gel de fibres a besoin d'un peu de temps"],
pieges:["mélanger tout dans la même bouchée annule l'effet — l'ordre compte","pas de légumes ? garde un bol de crudités ou une soupe en entrée","traiter seulement la peau en surface sans toucher à la cause hormonale"],
plus:"si tu n'as vraiment aucun légume sous la main — une cuillère à soupe de vinaigre de cidre dans un verre d'eau juste avant le repas lisse aussi le pic. mon astuce de secours les jours à l'arrache.",
observes:["dès aujourd'hui : moins de coup de barre après le repas","dans quelques jours : moins de fringales","dans 4 à 8 semaines : c'est le délai où la peau commence à répondre"],
victoire:"tu viens d'agir sur la racine de tes symptômes androgéniques, pas juste sur la surface.",
outil:{emoji:"🍴",label:"Découvre le modèle de l'assiette SMOP (SOPK)",desc:"comment composer ton assiette sans rien peser",cible:"assiette"},
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"avant tout le reste — on prépare ton foie. c'est lui qui élimine l'excès d'androgènes et produit la SHBG qui les neutralise. la Cure Détox commence aujourd'hui."}},

  {day:2,emoji:"🥚",theme:"le petit-déjeuner qui n'excite pas tes androgènes",
mission:"remplace ton petit-déjeuner sucré par une version riche en protéines — et note comment tu te sens à 11h.",
msg:"le petit-déjeuner donne le ton de toute ta journée hormonale.\n\nun mauvais départ, et c'est les montagnes russes jusqu'au soir.\n\naujourd'hui on casse ce cycle.",
pourquoi:"un petit-déjeuner sucré ou à base de céréales raffinées crée un énorme pic d'insuline dès le réveil, sur un corps à jeun particulièrement sensible. et tu le sais maintenant : insuline haute = signal aux ovaires de produire plus d'androgènes.\n\nce pic redescend brutalement vers 10-11h : coup de barre, fringale, besoin de sucre. et c'est reparti pour un tour toute la journée, avec le signal androgénique qui tourne en continu.\n\nles protéines ne déclenchent quasiment pas d'insuline et stabilisent ta glycémie sur 4 à 5 heures. un matin protéiné, c'est une matinée entière où tu ne nourris pas tes androgènes.",
source:"la résistance à l'insuline, présente chez la majorité des femmes SMOP, alimente l'hyperandrogénie (Diamanti-Kandarakis & Dunaif, 2012).",
comment:["base ton matin sur une protéine : œufs, skyr, fromage blanc, tofu","ajoute un bon gras : avocat, oléagineux, graines","un fruit entier plutôt qu'un jus","si tu manges du pain : au levain ou complet, jamais blanc seul","note ton énergie à 11h : c'est ton indicateur"],
pieges:["les granolas « healthy » du commerce : souvent très sucrés, lis l'étiquette","le jus de fruits « pur jus » reste un pic de sucre","sauter le petit-déj puis se jeter sur du sucre en milieu de matinée"],
plus:"mon petit-déj anti-androgènes express : œufs brouillés + avocat, ou skyr + graines de courge (riches en zinc, on en reparle) + quelques fruits rouges. rassasiant, et ta glycémie reste plate toute la matinée.",
observes:["dès ce matin : plus de coup de barre vers 11h","dans quelques jours : moins de fringales de sucre","au fil des semaines : un terrain hormonal plus calme"],
victoire:"tu viens d'éteindre un déclencheur d'androgènes que tu rallumais chaque matin sans le savoir.",
outil:{emoji:"📖",label:"Des idées de petits-déjeuners",desc:"protéinés, SMOP-friendly",cible:"recettes"},
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"on continue la Cure Détox seule cette semaine : elle soutient le foie, qui élimine l'excès d'androgènes."}},

  {day:3,emoji:"🪞",theme:"cartographier tes signes androgéniques",
mission:"fais le point honnête sur tes signes androgéniques : où en est ta peau, ta pilosité, tes cheveux aujourd'hui ?",
msg:"on va regarder les choses en face.\n\npas pour te juger.\n\npour avoir un point de départ clair, et mesurer le chemin.",
pourquoi:"l'acné hormonale (surtout sur la mâchoire, le menton, le bas du visage), la pilosité (menton, ventre, poitrine), la chute de cheveux ou l'affinement : ce sont les signes visibles de l'excès d'androgènes agissant sur tes récepteurs.\n\nfaire un état des lieux honnête aujourd'hui, c'est important pour deux raisons. un : ça te donne un point de départ précis pour mesurer tes progrès dans les semaines à venir (ces symptômes bougent lentement, on oublie vite d'où on est parties). deux : ça t'aide à cibler ta priorité.\n\net surtout rappelle-toi : ces symptômes ne sont pas « de ta faute ». ce ne sont pas des défauts d'hygiène ou de volonté. ce sont des signaux hormonaux, et les signaux, ça se travaille.",
source:"l'hyperandrogénie clinique (acné, hirsutisme, alopécie) reflète l'action des androgènes sur leurs récepteurs ; c'est un des critères diagnostiques du SMOP.",
comment:["note où en est ta peau : zones, fréquence des poussées","note ta pilosité : zones, intensité","note tes cheveux : chute, densité, cuir chevelu","prends une photo si tu veux un repère visuel objectif","garde tout dans le Journal — tu compareras dans quelques semaines"],
pieges:["te juger ou te dévaloriser : tu observes des signaux, tu ne notes pas ta valeur","attendre un changement visible en quelques jours : la peau et les poils bougent sur des semaines/mois","te comparer aux autres : c'est TON point de départ qui compte"],
plus:"les androgènes agissent lentement, donc les résultats visibles prennent du temps : compte 4 à 8 semaines pour l'acné, 3 à 6 mois pour la pilosité et les cheveux. ce point de départ d'aujourd'hui sera ta preuve, le jour où tu te diras « est-ce que ça marche vraiment ? ».",
observes:["aujourd'hui : tu as un point de départ clair","dans 4-8 semaines : tu compares ta peau","dans 3-6 mois : tu mesures la pilosité et les cheveux"],
victoire:"tu viens de poser un regard honnête et bienveillant sur ton corps — c'est le début du changement.",
outil:null,
tisane:null},

  {day:4,emoji:"💧",theme:"soutenir l'élimination des androgènes",
mission:"bois un grand verre d'eau au réveil, et ajoute un légume de la famille des crucifères aujourd'hui (brocoli, chou, roquette).",
msg:"ton foie élimine l'excès d'androgènes en silence.\n\nquand il est soutenu, il le fait mieux.\n\naujourd'hui on lui donne un coup de main.",
pourquoi:"ton foie a un rôle clé dans ton profil : c'est lui qui transforme et évacue l'excès d'androgènes, et qui produit la SHBG — une protéine qui « attrape » la testostérone libre et la neutralise. moins ton foie est surchargé, mieux il fait ce travail.\n\nl'eau soutient l'élimination par les reins et le foie. et les crucifères (brocoli, chou, chou-fleur, roquette) contiennent des composés qui aident les voies naturelles de détoxification du foie — utiles pour évacuer l'excès d'hormones.\n\nce ne sont pas des « détox miracle » (ça n'existe pas), mais une aide réelle au travail quotidien de ton foie, l'organe qui gère tes androgènes.",
source:"le foie métabolise les androgènes et produit la SHBG ; les crucifères apportent des composés soutenant la détoxification hépatique.",
comment:["un grand verre d'eau dès le réveil","ajoute un crucifère aujourd'hui : brocoli, chou, chou-fleur, roquette","garde une gourde visible toute la journée","légèrement cuits à la vapeur pour préserver leurs composés","évite l'alcool, qui surcharge le foie et aggrave l'hyperandrogénie"],
pieges:["les « détox » en poudre ou jus miracle : marketing, pas de biologie","trop cuire les crucifères détruit une partie de leurs composés","oublier l'eau : un foie et des reins déshydratés éliminent moins bien"],
plus:"ta Cure Détox SOPK Life s'inscrit exactement dans cette logique : soutenir le foie, l'organe qui élimine l'excès d'androgènes et fabrique la SHBG. mais aucune tisane ne remplace l'eau et les légumes — elle les accompagne.",
observes:["dans quelques jours : une digestion plus légère","au fil des semaines : un terrain hormonal mieux « nettoyé »","sur la peau : un des leviers qui participe à l'amélioration"],
victoire:"tu viens de soutenir l'organe qui neutralise tes androgènes jour et nuit.",
outil:{emoji:"🍴",label:"Voir l'assiette SMOP (SOPK)",desc:"composer un repas qui soutient ton terrain",cible:"assiette"},
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"la Cure Détox soutient ton foie, l'organe qui élimine l'excès d'androgènes et produit la SHBG. en soutien d'une bonne hydratation et des crucifères."}},

  {day:5,emoji:"🚶‍♀️",theme:"le mouvement qui calme les androgènes",
mission:"fais une marche de 15 à 20 minutes aujourd'hui, idéalement après un repas.",
msg:"on t'a dit « fais du sport ».\n\npersonne ne t'a expliqué pourquoi, ni comment, pour TON profil.\n\naujourd'hui tu comprends.",
pourquoi:"le mouvement agit directement sur ta cause : quand tes muscles bougent, ils absorbent le glucose du sang sans avoir besoin de beaucoup d'insuline. moins d'insuline = moins de signal androgénique. une simple marche après le repas peut réduire nettement le pic de glycémie.\n\nmais attention à l'intensité : les séances très épuisantes font grimper le cortisol, et un cortisol élevé peut stimuler les surrénales à produire encore plus d'androgènes (DHEA). sur ton profil, le mouvement régulier et modéré est bien plus intéressant que l'épuisement.\n\nle bon curseur : bouger assez pour aider ton insuline, sans stresser ton corps au point de relancer les androgènes par une autre voie.",
source:"l'activité modérée améliore la sensibilité à l'insuline ; un effort excessif élève le cortisol, qui peut stimuler la production surrénalienne d'androgènes (Pasquali et al.).",
comment:["marche 15 à 20 min, à un rythme où tu peux encore parler","après un repas si possible : l'effet sur la glycémie est maximal","privilégie la régularité à l'intensité","le renforcement musculaire doux aide aussi (plus de muscle = meilleure gestion du sucre)","évite d'enchaîner les séances très intenses et épuisantes"],
pieges:["croire que « plus c'est dur, mieux c'est » — le surentraînement peut relancer les androgènes","rester assise toute la journée : même 10 min de marche comptent","le tout ou rien : la régularité douce bat l'intensité ponctuelle"],
plus:"la marche digestive de 10-15 min après le déjeuner est mon réflexe préféré : ça lisse le pic, ça aide ton insuline, et c'est le genre de micro-habitude qui, répétée, fait une vraie différence sur ton terrain hormonal.",
observes:["dès aujourd'hui : l'esprit plus clair, moins de coup de barre","dans quelques jours : une énergie plus stable","au fil des semaines : un terrain androgénique plus calme"],
victoire:"tu viens de bouger d'une façon qui calme tes androgènes au lieu de les relancer.",
outil:{emoji:"🚶‍♀️",label:null,desc:null,cible:null},
tisane:null},

  {day:6,emoji:"🔍",theme:"traquer le sucre caché",
mission:"repère un produit de ton placard et lis sa teneur en sucres — tu vas être surprise.",
msg:"le sucre, c'est le carburant direct de tes androgènes.\n\net il se cache partout où tu ne l'attends pas.\n\naujourd'hui on apprend à le débusquer.",
pourquoi:"chaque pic de sucre = un pic d'insuline = un signal aux ovaires de produire plus d'androgènes. réduire les sucres cachés, c'est couper ce signal à la source, plusieurs fois par jour.\n\nle piège, c'est qu'on pense surtout aux bonbons et pâtisseries. mais le sucre se cache partout : sauces (ketchup, sauces toutes prêtes), plats préparés, yaourts aromatisés, céréales « équilibre », pains de mie, boissons, même des produits salés.\n\napprendre à lire la ligne « dont sucres » sur une étiquette, c'est un pouvoir que tu gardes à vie. tu n'as pas besoin d'être parfaite — juste de voir ce que tu mets vraiment dans ton corps.",
source:"les pics glycémiques répétés entretiennent l'hyperinsulinémie, qui alimente l'hyperandrogénie (Diamanti-Kandarakis & Dunaif, 2012).",
comment:["prends un produit de ton placard, regarde la ligne « dont sucres » pour 100g","sous 5g = ok, au-delà de 15-20g sur un produit salé = méfiance","traque les sucres déguisés : sirop de glucose, dextrose, maltodextrine","privilégie le fait-maison, où tu contrôles le sucre","remplace les boissons sucrées par de l'eau, des infusions, du thé vert"],
pieges:["« sans sucres ajoutés » ≠ sans sucre — vérifie quand même","les yaourts aux fruits : préfère nature + fruits frais","les jus de fruits : un pic de sucre sans les fibres"],
plus:"le thé vert est un super allié de ton profil : il contient de l'EGCG, qui aide à réduire l'action des androgènes, et il remplace parfaitement une boisson sucrée. 2-3 tasses par jour, c'est un petit geste anti-androgènes en plus.",
observes:["aujourd'hui : tu vois enfin le sucre caché dans tes placards","dans quelques jours : des choix plus simples, naturellement","au fil des semaines : moins de pics = moins de signal androgénique"],
victoire:"tu viens d'apprendre à couper le carburant de tes androgènes à la source.",
outil:{emoji:"🔍",label:"Repérer les sucres cachés",desc:"les pièges les plus fréquents",cible:"sucres"},
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"en remplaçant une boisson sucrée par ta Cure Détox du matin, tu coupes un pic de sucre et tu soutiens ton foie."}},

  {day:7,emoji:"🎯",theme:"bilan de semaine 1",
mission:"prends 5 minutes pour noter les petits changements de cette première semaine — même minuscules.",
msg:"une semaine que tu agis sur la cause de tes symptômes.\n\net voilà ce que personne ne te dit : les premiers changements sont intérieurs, bien avant d'être visibles sur ta peau.\n\naujourd'hui on apprend à les voir.",
pourquoi:"en 7 jours, tu as déjà commencé à lisser ton insuline, à soutenir ton foie, à couper le signal androgénique plusieurs fois par jour. ton terrain hormonal a commencé à changer.\n\nmais sur un profil androgénique, il faut être patiente avec le miroir : l'acné met 4 à 8 semaines à répondre, la pilosité et les cheveux 3 à 6 mois. c'est biologique : les androgènes agissent lentement, donc ils se calment lentement aussi.\n\nce qui bouge en premier, c'est l'intérieur : énergie, fringales, digestion, parfois l'aspect de la peau (moins de brillance). c'est là qu'il faut regarder au début. ces signaux annoncent les changements visibles à venir.",
source:"les changements métaboliques précèdent l'amélioration clinique de l'hyperandrogénie, qui s'étale sur plusieurs semaines à plusieurs mois.",
comment:["ouvre l'onglet Journal","note ce qui a bougé : énergie, fringales, digestion, peau (brillance, texture)","relis ta cartographie du Jour 3","même un mieux léger compte — écris-le","garde cette trace : dans quelques semaines, elle te montrera le chemin"],
pieges:["chercher un changement spectaculaire sur ta peau après 7 jours — c'est trop tôt","minimiser les petits progrès intérieurs : ils annoncent la suite","te décourager : le délai est NORMAL sur ce profil, ce n'est pas que ça ne marche pas"],
plus:"la patience est ta meilleure alliée sur ce profil. les femmes qui abandonnent le font souvent à 2-3 semaines, pile avant que la peau commence à répondre. ton bilan d'aujourd'hui, c'est ce qui te donnera la force de tenir jusqu'aux résultats visibles.",
observes:["aujourd'hui : tu mesures ta première semaine autrement","dans 4-8 semaines : la peau commence à répondre","dans 3-6 mois : la pilosité et les cheveux"],
victoire:"tu as tenu une semaine à agir sur la cause — et tu apprends à lire les vrais signaux de ton corps.",
outil:null,
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"dernière ligne de la semaine Détox seule. dès demain (Jour 8), on ajoute l'Équilibre Féminin — la fondation hormonale de ton protocole."}},
  {day:8,emoji:"💪",theme:"les protéines et tes androgènes",
mission:"mets une source de protéines à chacun de tes repas aujourd'hui.",
msg:"les protéines, ce n'est pas qu'une mode.\n\nc'est un de tes leviers les plus fiables contre l'excès d'androgènes.\n\naujourd'hui on en fait un réflexe.",
pourquoi:"tu connais maintenant le mécanisme central de ton profil : insuline haute = signal aux ovaires de produire plus d'androgènes. les protéines sont ton levier le plus fiable pour casser ça.\n\nelles ne déclenchent quasiment pas d'insuline, et elles stabilisent ta glycémie pendant 4 à 5 heures. à chaque repas où tu mets une vraie portion de protéines, tu coupes un peu plus ce signal androgénique.\n\nce n'est pas « manger plus », c'est manger dans le bon ordre et avec la bonne base. une protéine à chaque repas, c'est de la biologie hormonale appliquée, pas une tendance fitness.",
source:"la résistance à l'insuline stimule la production d'androgènes ovariens ; stabiliser la glycémie réduit ce signal (Diamanti-Kandarakis & Dunaif, 2012).",
comment:["une source de protéine à CHAQUE repas, petit-déj compris","animales : œufs, poulet, dinde, poisson, fruits de mer","végétales : lentilles, pois chiches, tofu, tempeh","laitières : skyr, fromage blanc, yaourt grec","pose-toi la question à chaque assiette : où est ma protéine ?"],
pieges:["un repas « que des glucides » (pâtes seules, salade de riz) relance le signal","grignoter du sucré entre les repas : chaque pic compte","oublier la protéine au petit-déj, le repas le plus stratégique"],
plus:"les graines de courge méritent une place spéciale dans ton profil : riches en protéines ET en zinc (le minéral de demain, clé contre tes androgènes). une poignée en collation, c'est deux leviers en un.",
observes:["dès aujourd'hui : moins de fringales, plus de satiété","dans quelques jours : une énergie plus stable","dans 4-8 semaines : le délai où la peau commence à répondre"],
victoire:"tu viens d'installer un réflexe anti-androgènes à chaque repas.",
outil:{emoji:"🍴",label:"La fiche des protéines",desc:"les meilleures sources",cible:"telechargements"},
tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:"aujourd'hui on pose la fondation : l'Équilibre Féminin. sa menthe poivrée a une action anti-androgénique douce (elle agit sur les récepteurs), en synergie avec la suite de ton protocole. tu la gardes tout le parcours."}},

  {day:9,emoji:"⚡",theme:"le zinc, ton minéral anti-androgènes",
mission:"ajoute une source de zinc aujourd'hui — graines de courge, légumineuses, fruits de mer, ou viande maigre.",
msg:"ta priorité n°1.\n\nun petit minéral qui agit pile là où tes androgènes font des dégâts.\n\naujourd'hui on parle du zinc.",
pourquoi:"le zinc est souvent bas chez les femmes avec un SMOP, et c'est un allié précieux de ton profil. il participe à limiter l'activité de la 5-alpha-réductase — l'enzyme qui transforme la testostérone en DHT, la forme d'androgène la plus agressive pour la peau et les cheveux.\n\nmoins de DHT, c'est potentiellement moins d'acné, une pilosité qui ralentit et une chute de cheveux freinée. le zinc soutient aussi la cicatrisation de la peau et l'immunité.\n\nles meilleures sources : les fruits de mer (les plus riches), la viande maigre, et côté végétal les graines de courge, les légumineuses, les noix de cajou. le zinc végétal est un peu moins bien absorbé, d'où l'intérêt de varier.",
source:"le zinc participe à la régulation de la 5-alpha-réductase et à la santé cutanée ; les preuves spécifiques au SMOP restent préliminaires, l'apport alimentaire reste la base.",
comment:["côté végétal : graines de courge (championnes), légumineuses, noix de cajou","côté animal : fruits de mer, viande maigre (mieux absorbés)","une poignée de graines de courge par jour : un réflexe simple","varie les sources pour optimiser l'absorption","complémentation : seulement après avis — un excès de zinc déséquilibre le cuivre"],
pieges:["se complémenter en zinc longtemps sans avis : déséquilibre du cuivre possible","compter sur le seul zinc végétal : moins bien absorbé","attendre un effet peau immédiat : c'est un soutien de fond, compte plusieurs semaines"],
plus:"le zinc fait partie des compléments les plus pertinents pour ton profil — mais toujours à la bonne dose et idéalement après un dosage. en attendant, les graines de courge quotidiennes sont ton geste zinc gratuit et sans risque.",
observes:["au fil des semaines : une peau parfois plus apaisée","sur la DHT : un soutien de fond contre la pilosité et la chute","l'effet s'installe sur plusieurs semaines, patience"],
victoire:"tu viens d'activer ta priorité n°1 : un minéral qui agit directement sur tes androgènes actifs.",
outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"dosage, timing et délai pour ton profil",cible:"complements"},
tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:"l'Équilibre Féminin contient de l'ortie, dont les composés aident la SHBG à neutraliser la testostérone libre — un soutien de fond sur ton versant hormonal."}},

  {day:10,emoji:"🧠",theme:"stress & androgènes surrénaliens",
mission:"fais 5 minutes de cohérence cardiaque aujourd'hui — inspire 5 secondes, expire 5 secondes, pendant 5 minutes.",
msg:"et si une partie de tes androgènes ne venait pas de tes ovaires.\n\nmais de ton stress ?\n\naujourd'hui on parle d'un angle que presque personne n'explique.",
pourquoi:"tes androgènes ne viennent pas que des ovaires : tes glandes surrénales en produisent aussi, via la DHEA. et voici le point clé : face au stress chronique, tes surrénales sécrètent du cortisol ET de la DHEA. plus le stress dure, plus elles produisent d'hormones « mâles ». c'est un vrai cercle vicieux.\n\nc'est ce qu'on appelle parfois le versant surrénalien du SMOP. si ton stress est intense et permanent, il peut entretenir ton hyperandrogénie par cette voie, en plus de la voie insuline.\n\nla bonne nouvelle : agir sur ton stress, ce n'est pas un « bonus bien-être ». c'est agir sur une source réelle de tes androgènes. la cohérence cardiaque (5 secondes à l'inspiration, 5 à l'expiration, 5 minutes) fait redescendre le cortisol en envoyant à ton système nerveux le signal que le danger est passé. de la neurobiologie, pas de l'ésotérisme.\n\net rappelle-toi : c'est ton SMOP qui te rend plus sensible au stress — ce n'est pas ta personnalité anxieuse qui a causé ton SMOP.",
source:"les surrénales produisent des androgènes (DHEA) en réponse au stress ; le SMOP et le stress s'aggravent mutuellement (Pasquali et al.).",
comment:["installe-toi au calme, assise, dos droit","inspire doucement 5 secondes, expire doucement 5 secondes, pendant 5 minutes","idéalement 3 fois par jour, mais même 1 fois aide","protège ton sommeil : il fait baisser le cortisol (on en parle au Jour 13)","évite le surentraînement et l'excès de caféine, qui stimulent le cortisol"],
pieges:["croire que « gérer son stress » est secondaire : c'est une source d'androgènes, pas un détail","attendre un calme parfait pour s'y mettre : on pratique justement pour l'obtenir","se culpabiliser d'être stressée : c'est biologique, pas un défaut de caractère"],
plus:"si ton stress est vraiment dominant (réveils à 3h, tension permanente, épuisement surrénalien), la Serenitea est la tisane pensée pour ce mécanisme précis — l'ashwagandha aide à réguler le cortisol. c'est une option à envisager en plus de ton protocole, selon ton ressenti.",
observes:["dès aujourd'hui : un apaisement immédiat après la séance","dans quelques jours : une réactivité au stress un peu moindre","au fil des semaines : un cortisol mieux régulé = moins d'androgènes surrénaliens"],
victoire:"tu viens d'agir sur une source de tes androgènes que personne ne t'avait expliquée.",
outil:{emoji:"🤍",label:"Le coach mindset de Kamila",desc:"quand le stress monte",cible:null},
tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:"l'Équilibre Féminin contient de la mélisse, un adaptogène doux qui aide à réguler l'axe du stress (HPA) — un soutien direct sur ton versant surrénalien."}},

  {day:11,emoji:"🧘‍♀️",theme:"bouger sans relancer tes androgènes",
mission:"fais 15 à 20 minutes de mouvement doux aujourd'hui — marche, yoga, pilates, étirements.",
msg:"le sport, oui.\n\nmais pas n'importe comment pour ton profil.\n\naujourd'hui on trouve le bon curseur.",
pourquoi:"le mouvement modéré améliore ta sensibilité à l'insuline — donc moins de signal androgénique par la voie ovarienne. c'est un vrai allié.\n\nmais attention au piège, surtout sur ton profil : les séances très intenses et épuisantes font grimper le cortisol, et un cortisol élevé pousse tes surrénales à produire plus d'androgènes (DHEA). tu l'as vu hier. autrement dit, te détruire à l'entraînement peut relancer tes androgènes par la voie surrénalienne.\n\nle bon curseur : bouger assez pour aider ton insuline, sans stresser ton corps au point de nourrir tes androgènes autrement. marche, yoga, pilates, renforcement doux : c'est ce qui apaise les deux voies à la fois.",
source:"l'activité modérée améliore la sensibilité à l'insuline ; l'effort excessif élève le cortisol et peut stimuler la production surrénalienne d'androgènes (Pasquali et al.).",
comment:["choisis une activité qui te fait du bien, pas qui te vide","marche, yoga, pilates, renforcement doux : toutes valables","15 à 20 minutes régulières valent mieux qu'une séance qui t'épuise","le renforcement doux maintient le muscle (meilleure gestion du sucre)","écoute ton corps : certains jours plus doux, d'autres plus toniques"],
pieges:["croire que « plus c'est dur, mieux c'est » : contre-productif sur ton profil","enchaîner les HIIT intenses : ça peut relancer tes androgènes surrénaliens","le tout ou rien : une marche de 10 min vaut mieux que 0"],
plus:"si tu aimes l'intensité, ce n'est pas interdit — mais dose. l'idée n'est pas de ne jamais forcer, c'est de ne pas vivre en épuisement permanent. ton corps a besoin d'être soutenu, pas cassé, pour calmer tes androgènes.",
observes:["dès aujourd'hui : l'esprit plus clair, le corps détendu","dans quelques jours : un sommeil un peu plus profond","au fil des semaines : les deux voies (insuline et surrénales) apaisées"],
victoire:"tu viens de bouger d'une façon qui calme tes androgènes au lieu de les relancer.",
outil:{emoji:"🧘‍♀️",label:null,desc:null,cible:null},
tisane:null},

  {day:12,emoji:"🌿",theme:"la menthe verte, alliée anti-androgènes",
mission:"bois une infusion de menthe verte aujourd'hui — et envisage d'en faire une habitude (idéalement 2 tasses par jour).",
msg:"une plante toute simple.\n\navec un des effets anti-androgéniques les mieux documentés.\n\naujourd'hui on l'invite dans ton quotidien.",
pourquoi:"la menthe verte (spearmint) est une des rares plantes dont l'effet anti-androgénique est confirmé par une vraie étude clinique. dans un essai contrôlé, boire 2 tasses d'infusion de menthe verte par jour pendant 30 jours a réduit significativement la testostérone libre chez des femmes avec un SMOP.\n\nelle agit en douceur sur les androgènes, et c'est un geste gratuit, agréable, que tu peux ajouter dès aujourd'hui. ce n'est pas un remède miracle, mais un soutien réel et régulier.\n\nc'est d'ailleurs un des piliers de ton Andro Tea (qu'on introduit au Jour 14) : la menthe verte y est associée à d'autres plantes anti-androgéniques pour une action complète.",
source:"la menthe verte a réduit significativement la testostérone libre chez des femmes SMOP dans un essai contrôlé (Grant, 2010, Phytotherapy Research — 2 tasses/jour, 30 jours).",
comment:["bois une infusion de menthe verte aujourd'hui","idéalement 2 tasses par jour pour viser l'effet étudié","menthe VERTE (spearmint), pas menthe poivrée — ce sont deux plantes","agréable chaude ou froide, après les repas par exemple","c'est un soutien régulier : la constance compte plus que la dose ponctuelle"],
pieges:["confondre menthe verte (spearmint) et menthe poivrée : vise bien la verte","attendre un effet en 3 jours : l'étude parle de 30 jours de régularité","en faire LE seul levier : c'est un soutien, pas un traitement à lui seul"],
plus:"c'est le genre de petit geste que j'adore : gratuit, agréable, et appuyé par une vraie étude. 2 tasses de menthe verte par jour, ça s'intègre sans effort — et ton Andro Tea viendra renforcer cette action dès le Jour 14.",
observes:["au fil des semaines : un soutien doux sur tes androgènes","sur la peau : un des leviers qui participe à l'amélioration","l'effet est progressif, il s'inscrit dans l'ensemble"],
victoire:"tu viens d'ajouter une alliée anti-androgènes documentée à ton quotidien.",
outil:null,
tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:"ton Équilibre Féminin contient déjà de la menthe poivrée (anti-androgénique douce) et de la cannelle de Ceylan (sensibilité à l'insuline) — deux leviers de ton profil réunis."}},

  {day:13,emoji:"🌙",theme:"le sommeil régule tes hormones",
mission:"ce soir, coupe les écrans 30 minutes avant de dormir et vise une heure de coucher régulière.",
msg:"mal dormir, c'est nourrir tes androgènes.\n\npar le cortisol, par l'insuline.\n\naujourd'hui on protège ton sommeil.",
pourquoi:"le sommeil est un régulateur hormonal puissant, et il agit sur TES deux voies androgéniques. un sommeil court ou haché augmente le cortisol (donc les androgènes surrénaliens) ET aggrave la résistance à l'insuline du lendemain (donc les androgènes ovariens). double peine.\n\nà l'inverse, un bon sommeil profond fait baisser le cortisol, améliore ta sensibilité à l'insuline, et c'est le moment où ton corps répare. sur ton profil, bien dormir n'est pas un luxe, c'est un levier anti-androgènes à part entière.\n\nles écrans le soir sont un des pires ennemis : leur lumière bleue retarde la mélatonine. 30 minutes sans écran avant de dormir, c'est un des gestes les plus rentables qui soient.",
source:"le manque de sommeil élève le cortisol et aggrave la résistance à l'insuline ; le SMOP et le stress s'aggravent mutuellement (Pasquali et al.).",
comment:["coupe les écrans 30 min avant de dormir","vise une heure de coucher régulière, même le week-end","chambre fraîche, sombre, silencieuse","le magnésium le soir peut aider à l'endormissement","une infusion apaisante comme rituel de transition"],
pieges:["« je récupérerai le week-end » : le sommeil ne se rattrape pas vraiment","scroller au lit : la lumière bleue sabote ton endormissement","le café après 15h : il reste dans le corps bien plus longtemps qu'on croit"],
plus:"sur ton profil, je considère le sommeil comme un vrai « traitement » gratuit : il agit à la fois sur ton cortisol et sur ton insuline, les deux moteurs de tes androgènes. protège-le comme tu protégerais un rendez-vous important.",
observes:["dès cette nuit : un endormissement un peu plus doux","dans quelques jours : des réveils moins difficiles","au fil des semaines : cortisol et insuline mieux régulés"],
victoire:"tu viens de protéger un de tes leviers anti-androgènes les plus puissants : ton sommeil.",
outil:{emoji:"⚡",label:"Le parcours fatigue complet",desc:"comprendre et retrouver ton énergie",cible:null},
tisane:null},

  {day:14,emoji:"🏆",theme:"mi-parcours",
mission:"relis ton bilan du Jour 7 et ta cartographie du Jour 3 — note tout ce qui a bougé.",
msg:"deux semaines.\n\ntu agis sur la cause de tes symptômes, par plusieurs voies à la fois.\n\naujourd'hui on mesure, et on ajoute ta tisane de profil.",
pourquoi:"à mi-parcours, tu as travaillé tes androgènes par plusieurs leviers : l'insuline (ordre des aliments, protéines, sucre), le foie (élimination, SHBG), le zinc (DHT), le stress (voie surrénalienne), le sommeil. c'est une approche complète, pas un seul angle.\n\naujourd'hui on ajoute l'Andro Tea, ta tisane de profil. elle réunit des plantes anti-androgéniques — dont la menthe verte (vue au Jour 12) — qui agissent sur deux fronts : réduire la production d'androgènes ET aider à les neutraliser. associée à l'Équilibre Féminin, elle complète ton protocole.\n\nmais sois patiente avec le miroir : la peau répond en 4 à 8 semaines, la pilosité et les cheveux en 3 à 6 mois. ce que tu mesures aujourd'hui, ce sont surtout les signaux intérieurs — et ils annoncent la suite.",
source:"la menthe verte de l'Andro Tea réduit la testostérone libre (Grant, 2010) ; l'approche multi-levier de l'hyperandrogénie est la plus cohérente.",
comment:["relis ton bilan du Jour 7 et ta cartographie du Jour 3","note ce qui a bougé : énergie, fringales, digestion, peau","célèbre ce que tu as tenu — deux semaines, c'est énorme","introduis l'Andro Tea le soir à partir d'aujourd'hui","projette-toi : deux semaines encore pour ancrer tout ça"],
pieges:["chercher une transformation visible de la peau après 2 semaines : c'est trop tôt","minimiser les signaux intérieurs : ils annoncent les résultats visibles","abandonner maintenant : tu es pile avant le moment où la peau répond"],
plus:"si aujourd'hui tu te dis « je ne vois pas encore de différence sur ma peau » — c'est NORMAL, et c'est même attendu sur ce profil. relis tes signaux intérieurs. la patience est ta meilleure alliée : les androgènes se calment lentement, mais ils se calment.",
observes:["aujourd'hui : tu mesures 2 semaines de travail multi-levier","dans 2-4 semaines : la peau commence à répondre","dans 3-6 mois : la pilosité et les cheveux"],
victoire:"tu es à mi-chemin, tu agis par toutes les voies, et ta tisane de profil entre en jeu.",
outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"dosage, timing et délai pour ton profil",cible:"complements"},
tisane:{nom:"Andro Tea",timing:"le soir, 1h après le dîner",lien:"https://sopklife.com/products/andro-tea",texte:"aujourd'hui on ajoute l'Andro Tea, ta tisane de profil. menthe verte, ortie, thé vert, romarin : des plantes qui réduisent les androgènes et aident à les neutraliser. avec l'Équilibre Féminin en journée, action anti-androgénique sur 24h."}},

  {day:15,emoji:"🏥",theme:"préparer ton rendez-vous",
mission:"note les analyses à demander à ton prochain rendez-vous — et prépare la liste de tes symptômes.",
msg:"trop de femmes sortent du médecin frustrées.\n\nsans les bonnes analyses, sans réponses.\n\naujourd'hui on prépare ton rendez-vous pour que ça change.",
pourquoi:"arriver chez le médecin avec une demande précise transforme tout : tu ne subis plus, tu collabores. pour un profil androgénique, certaines analyses éclairent particulièrement ton terrain.\n\ncôté androgènes : la testostérone totale et libre, la SHBG (la protéine qui neutralise la testostérone), la delta-4 androstènedione. côté surrénalien : la DHEA-S (le marqueur des androgènes qui viennent de tes surrénales) et le cortisol. côté métabolique : la glycémie et l'insuline à jeun.\n\net une analyse importante à ne pas oublier : la 17-OH-progestérone. elle sert à écarter une hyperplasie congénitale des surrénales (une autre cause d'hyperandrogénie qui ressemble au SMOP mais se gère différemment). c'est de la bonne médecine de la demander.\n\nattention : ces valeurs s'interprètent selon ton âge et ton labo, et c'est ton médecin qui pose le diagnostic — pas un seuil lu dans une app. ton rôle à toi, c'est d'arriver avec les bonnes demandes.",
source:"le bilan de l'hyperandrogénie comprend testostérone, SHBG, DHEA-S (origine surrénalienne) et 17-OH-progestérone (pour écarter une hyperplasie congénitale des surrénales) ; interprétation médicale selon l'âge et le laboratoire.",
comment:["note les analyses androgènes : testostérone totale + libre, SHBG, delta-4","note le volet surrénalien : DHEA-S, cortisol","note la 17-OH-progestérone (pour écarter l'hyperplasie congénitale des surrénales)","ajoute glycémie + insuline à jeun, ferritine, vitamine D, TSH","prépare la liste de TES symptômes et tes questions"],
pieges:["demander juste « une prise de sang » sans préciser : tu repars incomplète","oublier la DHEA-S et la 17-OHP : ce sont les clés du versant surrénalien","interpréter seule un chiffre comme un diagnostic : c'est le rôle du médecin, selon ton âge"],
plus:"pour les dosages hormonaux, le moment du cycle compte (souvent en début de cycle) et il faut parfois s'allonger 20-30 min avant la prise de sang pour la prolactine. demande à ton labo les conditions exactes — ça évite de refaire la prise pour rien.",
observes:["aujourd'hui : tu te sens en contrôle de ta santé","au rendez-vous : un échange plus précis et plus utile","après : des analyses qui éclairent vraiment ton terrain androgénique"],
victoire:"tu viens de reprendre le pouvoir sur ton parcours médical.",
outil:{emoji:"👩‍⚕️",label:"Préparer ton dossier médecin",desc:"scripts et analyses à demander",cible:null},
tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:"l'Équilibre Féminin continue en fond pendant que tu prépares ton suivi médical — la fondation de ton protocole."}},

  {day:16,emoji:"🥑",theme:"les bons gras et tes hormones",
mission:"ajoute une source d'oméga-3 et une cuillère de graines de lin moulues aujourd'hui.",
msg:"on t'a fait peur avec le gras.\n\npourtant certains gras aident directement ton équilibre hormonal.\n\naujourd'hui on fait entrer les bons.",
pourquoi:"les bons gras jouent sur deux tableaux pour ton profil. les oméga-3 (petits poissons gras, graines de lin et chia, noix) ont une action anti-inflammatoire et soutiennent l'équilibre hormonal global — or l'inflammation amplifie souvent l'hyperandrogénie.\n\net il y a un atout spécifique : les graines de lin sont riches en lignanes, des composés qui, dans de petites études, ont montré un effet sur l'augmentation de la SHBG — cette fameuse protéine qui neutralise la testostérone libre. plus de SHBG disponible, c'est potentiellement moins d'androgènes actifs.\n\nce n'est pas un remède miracle, mais un levier alimentaire intéressant et sans risque, à intégrer régulièrement.",
source:"les oméga-3 ont une action anti-inflammatoire reconnue ; les lignanes du lin ont montré un effet sur la SHBG dans de petites études (preuves à consolider).",
comment:["2 à 3 portions de petits poissons gras par semaine (sardines, maquereau)","1 c. à soupe de graines de lin MOULUES par jour (sinon elles passent sans être digérées)","des noix, des graines de chia en collation","réduis les huiles raffinées au profit de l'huile d'olive","les graines de lin : dans un yaourt, un porridge, une salade"],
pieges:["les graines de lin entières : non digérées, moulues toujours","cuire l'huile de lin : elle se consomme crue, à froid","attendre un effet miracle des lignanes : c'est un soutien, à consolider"],
plus:"les graines de lin moulues sont mon petit geste SHBG quotidien : une cuillère dans mon skyr du matin, et je sais que je soutiens en douceur la neutralisation de mes androgènes. simple, pas cher, et ça apporte aussi des fibres.",
observes:["au fil des semaines : un terrain hormonal mieux soutenu","sur la peau : un des leviers anti-inflammatoires qui participe","l'effet est progressif, en soutien de l'ensemble"],
victoire:"tu viens d'ajouter des gras qui travaillent pour ton équilibre hormonal.",
outil:{emoji:"🥑",label:"La fiche des bons gras",desc:"oméga-3 et gras protecteurs",cible:"telechargements"},
tisane:{nom:"Andro Tea",timing:"le soir, 1h après le dîner",lien:"https://sopklife.com/products/andro-tea",texte:"l'Andro Tea le soir poursuit son action anti-androgénique pendant la nuit, en complément de tes bons gras du jour."}},

  {day:17,emoji:"🌸",theme:"prendre soin de ta peau & tes cheveux",
mission:"adoucis UNE habitude peau ou cheveux aujourd'hui : routine plus douce, protection solaire, ou moins de chaleur sur tes cheveux.",
msg:"pendant qu'on agit sur la cause de l'intérieur.\n\non peut aussi prendre soin de l'extérieur.\n\naujourd'hui on est douce avec ton corps.",
pourquoi:"le gros du travail se fait de l'intérieur (hormones, insuline, stress) — mais comment tu traites ta peau et tes cheveux au quotidien compte aussi, et ça peut même aggraver les choses si on s'y prend mal.\n\nla peau acnéique a besoin de DOUCEUR, pas d'agression : une routine trop décapante (gommages agressifs, produits asséchants) abîme la barrière cutanée et peut relancer les poussées. et pour les marques post-acné et l'hyperpigmentation, la protection solaire est essentielle — le soleil fonce les taches.\n\nles cheveux fragilisés par l'excès d'androgènes n'ont pas besoin d'être agressés par la chaleur et les tractions. la douceur partout, c'est soutenir ce que tu répares de l'intérieur.",
source:"une routine cutanée douce préserve la barrière de la peau ; la protection solaire limite l'aggravation de l'hyperpigmentation post-inflammatoire.",
comment:["peau : une routine douce, sans gommage agressif ni produit décapant","protection solaire au quotidien : essentiel contre les marques et l'hyperpigmentation","cheveux : limite la chaleur (plaque, sèche-cheveux très chaud) et les tractions serrées","hydrate ta peau même si elle est grasse : une peau décapée produit plus de sébum","sois patiente et douce : la peau répare lentement"],
pieges:["décaper sa peau grasse : elle produit encore plus de sébum en réaction","oublier la protection solaire : les marques post-acné foncent au soleil","multiplier les produits actifs d'un coup : la peau sature et réagit"],
plus:"le réflexe que je trouve le plus sous-estimé, c'est la protection solaire quotidienne. tu peux faire tout le travail hormonal du monde, si tu laisses tes marques post-acné au soleil sans protection, elles s'incrustent. une crème solaire légère tous les matins, c'est un geste anti-taches tout simple.",
observes:["dès aujourd'hui : une peau moins agressée","dans quelques semaines : moins de réactivité, des marques qui s'estompent mieux","au long cours : un extérieur qui soutient ton travail intérieur"],
victoire:"tu viens d'arrêter d'agresser ton corps — tu le soutiens, dedans comme dehors.",
outil:{emoji:"✨",label:"La fiche peau, cheveux & ongles",desc:"les nutriments de la beauté de l'intérieur",cible:"telechargements"},
tisane:{nom:"Andro Tea",timing:"le soir, 1h après le dîner",lien:"https://sopklife.com/products/andro-tea",texte:"l'Andro Tea agit sur la cause de l'intérieur (le romarin soutient même la microcirculation du cuir chevelu) pendant que tu es douce avec ta peau à l'extérieur."}},

  {day:18,emoji:"💪",theme:"ancrer le mouvement",
mission:"refais une séance de mouvement doux aujourd'hui — et remarque si c'est déjà un peu plus facile qu'au début.",
msg:"deux semaines et demie que tu bouges autrement.\n\nce qui semblait un effort devient une habitude.\n\naujourd'hui on ancre.",
pourquoi:"le bénéfice du mouvement sur tes androgènes vient de la RÉGULARITÉ, pas de l'intensité. en bougeant doucement et régulièrement, tu améliores ta sensibilité à l'insuline (moins d'androgènes ovariens) sans faire grimper ton cortisol (donc sans relancer tes androgènes surrénaliens).\n\naujourd'hui, l'enjeu n'est pas de faire plus dur, mais de confirmer que c'est en train de devenir TON rythme. le corps s'habitue : ce qui te coûtait au Jour 5 te coûte un peu moins maintenant.\n\nc'est ça, construire une habitude durable : pas la motivation des débuts, mais la routine qui tient dans le temps, et qui apaise tes deux voies androgéniques à la fois.",
source:"l'activité modérée régulière améliore la sensibilité à l'insuline sans élever le cortisol de façon excessive (Pasquali et al. pour l'axe du stress).",
comment:["refais ton activité douce préférée : marche, yoga, pilates","remarque ce qui est devenu plus facile depuis le Jour 5","vise la régularité sur la semaine, pas la performance d'un jour","garde le curseur « doux » : on n'épuise pas le corps","célèbre le fait que tu tiens une habitude"],
pieges:["vouloir soudain passer à l'intensité : garde le doux pour ton profil","se décourager un jour sans énergie : une marche courte compte aussi","comparer ta progression à celle des autres : c'est TON rythme"],
plus:"le vrai signe que ça marche, ce n'est pas de soulever plus lourd. c'est qu'un geste du quotidien te coûte un peu moins qu'avant. ton corps se renforce en silence, et ton insuline te remercie.",
observes:["aujourd'hui : un mouvement un peu plus fluide qu'au début","dans 2 semaines : une habitude vraiment installée","au long cours : tes deux voies androgéniques apaisées"],
victoire:"tu viens de transformer un effort en habitude — c'est ça qui dure.",
outil:{emoji:"💪",label:null,desc:null,cible:null},
tisane:null},

  {day:19,emoji:"🍵",theme:"le thé vert, antioxydant anti-androgènes",
mission:"bois une tasse de thé vert aujourd'hui, à la place d'une boisson sucrée ou d'un café de trop.",
msg:"une boisson toute simple.\n\navec un double effet sur ton profil.\n\naujourd'hui on l'invite dans ta journée.",
pourquoi:"le thé vert est un allié intéressant de ton profil, sur deux plans. il est riche en EGCG, un antioxydant qui aide à limiter l'action de la 5-alpha-réductase (l'enzyme qui fabrique la DHT, l'androgène le plus agressif pour peau et cheveux). et il réduit le stress oxydatif, qui amplifie l'hyperandrogénie.\n\nil améliore aussi légèrement la sensibilité à l'insuline, et remplace parfaitement une boisson sucrée ou un café de trop (le café en excès stimule le cortisol, donc tes androgènes surrénaliens).\n\nc'est d'ailleurs un des piliers de ton Andro Tea. le boire pur en journée, c'est renforcer l'action de ta tisane de profil.",
source:"l'EGCG du thé vert a montré une action sur la 5-alpha-réductase et le stress oxydatif ; les preuves spécifiques au SMOP restent préliminaires.",
comment:["une à deux tasses de thé vert par jour","à la place d'une boisson sucrée ou d'un café de trop","évite le soir si tu es sensible à la caféine (sommeil)","nature, sans sucre : tu peux l'aromatiser à la menthe","c'est un soutien régulier, la constance compte"],
pieges:["le sucrer : ça annule une partie de l'intérêt","en boire le soir si tu dors mal : la caféine perturbe le sommeil","en attendre un effet miracle : c'est un soutien parmi d'autres"],
plus:"menthe verte (Jour 12) + thé vert, c'est mon duo anti-androgènes de la journée : deux boissons gratuites, agréables, documentées, qui renforcent ce que fait ton Andro Tea. un combo simple à intégrer sans y penser.",
observes:["au fil des semaines : un soutien doux sur tes androgènes","sur le stress oxydatif : un effet antioxydant global","l'effet s'inscrit dans l'ensemble de ton terrain"],
victoire:"tu viens d'ajouter une boisson qui travaille sur ta DHT et ton stress oxydatif.",
outil:null,
tisane:{nom:"Andro Tea",timing:"le soir, 1h après le dîner",lien:"https://sopklife.com/products/andro-tea",texte:"le thé vert que tu bois en journée est justement un des piliers de ton Andro Tea le soir — tu renforces l'action anti-androgénique sur 24h."}},

  {day:20,emoji:"☀️",theme:"la nature & la lumière",
mission:"passe au moins 15 minutes dehors aujourd'hui, à la lumière du jour — idéalement le matin.",
msg:"ton corps a besoin de lumière et de nature.\n\npas comme un luxe.\n\ncomme un régulateur de ton cortisol, donc de tes androgènes.",
pourquoi:"la lumière du matin règle ton horloge interne, celle qui gouverne ton cortisol. une bonne exposition le matin aide ton cortisol à suivre son rythme naturel (haut le matin, bas le soir) — et un cortisol mieux régulé, c'est moins d'androgènes surrénaliens.\n\nle soleil permet aussi à ta peau de fabriquer la vitamine D, souvent basse chez les femmes SMOP. et être dans la nature fait baisser le stress perçu et le cortisol : un apaisant puissant et gratuit pour ton versant surrénalien.\n\nattention cohérence avec le Jour 17 : exposition raisonnable + protection solaire sur le visage si tu as des marques. profiter de la lumière ne veut pas dire cramer ta peau.",
source:"la lumière du matin régule le rythme du cortisol ; le soleil permet la synthèse de vitamine D (SMOP et stress bidirectionnels, Pasquali et al.).",
comment:["sors le matin si possible : 15 min de lumière suffisent","marche dans un endroit vert si tu peux : l'effet nature s'ajoute","combine avec ta marche du jour : deux bénéfices en un","protège ton visage si tu as des marques (cohérence avec le Jour 17)","le soir, à l'inverse, tamise la lumière pour préparer le sommeil"],
pieges:["rester enfermée toute la journée : cortisol et horloge se dérèglent","exposer un visage marqué sans protection : les taches foncent","compter uniquement sur l'alimentation pour la vitamine D"],
plus:"ma marche du matin à la lumière est un de mes rituels préférés : elle cale mon cortisol, me réveille mieux que le café, et me prépare une meilleure nuit. pour ton profil, c'est un geste anti-androgènes surrénaliens déguisé en simple balade.",
observes:["dès aujourd'hui : un esprit plus clair, une humeur plus stable","dans quelques jours : un sommeil qui s'améliore","au fil des semaines : un cortisol mieux réglé = moins d'androgènes surrénaliens"],
victoire:"tu viens d'utiliser la lumière et la nature comme régulateurs de tes androgènes.",
outil:{emoji:"☀️",label:null,desc:null,cible:null},
tisane:null},

  {day:21,emoji:"📈",theme:"rendre visible ce qui a changé",
mission:"fais le point sur 3 semaines : qu'est-ce qui a changé dans ton énergie, ton corps, ta peau ?",
msg:"trois semaines.\n\ntu agis sur tes androgènes par toutes les voies.\n\naujourd'hui on rend tout ça visible, noir sur blanc.",
pourquoi:"après 3 semaines, les changements s'accumulent. mais sur un profil androgénique, il faut regarder au bon endroit : la peau commence tout juste à répondre (4-8 semaines), la pilosité et les cheveux viendront plus tard (3-6 mois). donc les signaux à noter maintenant sont surtout intérieurs — et parfois les premiers signes cutanés.\n\nrelis ta cartographie du Jour 3 et tes bilans des Jours 7 et 14. compare : énergie, fringales, sommeil, stress, et côté peau (brillance, texture, fréquence des poussées).\n\nindividuellement, chaque changement peut sembler modeste. mis bout à bout sur 3 semaines, ils dessinent souvent une vraie trajectoire — celle qui annonce les résultats visibles à venir. voir ce chemin, c'est ce qui te donne la force de tenir.",
source:"les améliorations de l'hyperandrogénie s'étalent sur plusieurs semaines à plusieurs mois ; suivre ses progrès soutient l'adhésion.",
comment:["relis ta cartographie du Jour 3 et tes bilans des Jours 7 et 14","note ce qui a bougé : énergie, fringales, sommeil, stress, peau","compare l'état de ta peau à celui d'il y a 3 semaines","même un léger mieux compte : écris-le","garde tout dans le Journal — c'est ta preuve"],
pieges:["chercher LA grande transformation visible : c'est encore tôt pour les androgènes","minimiser les signaux intérieurs : ils précèdent les résultats cutanés","te décourager : le délai est NORMAL, tu es sur la bonne voie"],
plus:"relis-toi vraiment, en comparant avec le Jour 3. presque à chaque fois, on découvre des changements qu'on avait déjà oubliés. et pour la peau, parfois c'est subtil au début : un peu moins de poussées, une texture un peu différente. ce sont les premiers signes que ça répond.",
observes:["aujourd'hui : tu vois 3 semaines de travail rassemblées","dans 1-5 semaines : la peau continue de répondre","dans 3-6 mois : la pilosité et les cheveux"],
victoire:"tu viens de rendre visible tout le chemin parcouru — et il est réel.",
outil:{emoji:"📒",label:null,desc:null,cible:null},
tisane:null},

  {day:22,emoji:"🔬",theme:"relire tes analyses",
mission:"si tu as des analyses récentes, ressors-les et repère tes marqueurs androgéniques et surrénaliens.",
msg:"des chiffres sur une feuille.\n\nmais derrière, c'est l'état réel de ton équilibre hormonal.\n\naujourd'hui on apprend à les lire.",
pourquoi:"tes analyses racontent ce qui se passe à l'intérieur. sur ton profil, les éléments à regarder : la testostérone (totale et libre) et la SHBG — c'est le rapport entre les deux qui compte le plus, pas la testostérone seule. une SHBG basse laisse plus de testostérone libre active, même si la testostérone totale paraît « normale ».\n\ncôté surrénalien : la DHEA-S (si elle est au-dessus de la norme de ton âge, tes surrénales contribuent à tes androgènes) et le cortisol. et la 17-OH-progestérone, si elle a été dosée, pour écarter l'hyperplasie congénitale des surrénales.\n\nmais lire ses analyses n'est pas poser un diagnostic : l'interprétation revient à ton médecin, selon ton âge et ton labo. l'objectif ici, c'est de comprendre les grandes lignes pour une vraie conversation avec lui.",
source:"le rapport testostérone/SHBG reflète l'androgénie active ; la DHEA-S situe l'origine surrénalienne. Interprétation médicale selon l'âge et le laboratoire.",
comment:["ressors tes analyses récentes si tu en as","repère : testostérone totale + libre, SHBG (et leur rapport)","repère le volet surrénalien : DHEA-S, cortisol, 17-OHP","utilise l'onglet Analyses et ton guide pour comprendre chaque marqueur","note tes questions pour ton médecin"],
pieges:["regarder la testostérone totale seule : c'est le rapport avec la SHBG qui parle","interpréter un chiffre comme un diagnostic : c'est le rôle du médecin, selon ton âge","paniquer devant un marqueur isolé : c'est l'ensemble qui compte"],
plus:"le guide des analyses SMOP (dans tes fiches à télécharger) t'explique chaque marqueur simplement. garde-le pour tes rendez-vous : arriver en comprenant le rapport testostérone/SHBG, ça change complètement l'échange avec le médecin.",
observes:["aujourd'hui : tu comprends mieux ton bilan","au rendez-vous : un échange plus éclairé","au long cours : tu suis l'évolution de ton terrain dans le temps"],
victoire:"tu viens d'apprendre à lire ton corps à travers tes analyses.",
outil:{emoji:"🩸",label:"Le guide des analyses SMOP",desc:"comprendre chaque marqueur simplement",cible:"telechargements"},
tisane:null},

  {day:23,emoji:"🌞",theme:"la vitamine D",
mission:"vérifie ton apport en vitamine D — exposition au soleil, alimentation, ou supplémentation si ton médecin l'a recommandée.",
msg:"la vitamine la plus souvent manquante.\n\net elle joue aussi sur ton équilibre hormonal.\n\naujourd'hui on s'en occupe.",
pourquoi:"la vitamine D est très fréquemment insuffisante chez les femmes avec un SMOP, surtout en automne et en hiver. elle joue un rôle dans l'immunité, l'humeur, et participe à l'équilibre hormonal global — certaines études la relient à une meilleure régulation des androgènes et de l'insuline, même si les preuves restent à consolider.\n\nelle se fabrique sous l'action du soleil sur la peau (d'où l'importance de sortir, Jour 20), mais d'octobre à avril le soleil ne suffit souvent pas. l'alimentation (poissons gras, jaune d'œuf) aide mais couvre rarement les besoins.\n\nc'est l'un des rares nutriments où la supplémentation est souvent justifiée — mais après un dosage sanguin et sur avis médical, pour ajuster la dose.",
source:"la vitamine D participe à l'immunité et à l'équilibre métabolique ; l'insuffisance est fréquente dans le SMOP et se corrige après dosage, sur avis médical.",
comment:["côté soleil : exposition régulière et raisonnable (avec protection du visage si marques)","côté assiette : poissons gras, jaune d'œuf, aliments enrichis","fais doser ta vitamine D si ce n'est pas déjà fait","supplémentation : sur avis médical, à la bonne dose","l'hiver, la supplémentation est souvent nécessaire"],
pieges:["se supplémenter à l'aveugle à forte dose : la vitamine D se stocke, l'excès existe","compter uniquement sur l'alimentation : elle couvre rarement les besoins","oublier que sans soleil l'hiver, le niveau chute pour presque tout le monde"],
plus:"c'est le complément que je recommande de faire doser en priorité : la carence est tellement fréquente, et elle touche l'énergie, l'humeur et l'équilibre hormonal. une analyse simple à demander à ton prochain bilan.",
observes:["au fil des semaines (si carence corrigée) : plus d'énergie, meilleure humeur","sur l'équilibre hormonal : un soutien de fond","un effet global sur ton terrain"],
victoire:"tu viens de t'occuper d'une des carences les plus fréquentes et les plus impactantes.",
outil:{emoji:"🩸",label:"Comprendre ta vitamine D",desc:"dans le guide des analyses",cible:"telechargements"},
tisane:null},

  {day:24,emoji:"🧠",theme:"ancrer la gestion du stress",
mission:"refais 5 minutes de cohérence cardiaque — et vois si c'est déjà plus naturel qu'au Jour 10.",
msg:"on a vu que, sur ton profil, le stress peut entretenir une partie de tes symptômes.\n\naujourd'hui on ancre l'habitude qui agit sur ce levier.",
pourquoi:"tu l'as compris au Jour 10 : face au stress chronique, tes surrénales produisent plus de cortisol ET de DHEA — donc plus d'androgènes. gérer ton stress n'est pas optionnel sur ton profil, c'est agir sur une vraie source de tes symptômes.\n\naprès deux semaines, la cohérence cardiaque devrait commencer à te sembler plus naturelle. l'enjeu aujourd'hui, c'est d'en faire une habitude ancrée, pas un geste qu'on fait une fois puis qu'on oublie. 5 minutes, une à trois fois par jour, aux moments où la pression monte.\n\net garde en tête ton mantra : c'est ton SMOP qui te rend plus sensible au stress, ce n'est pas ta sensibilité au stress qui a causé ton SMOP. tu n'as pas à culpabiliser — juste à outiller ton corps.",
source:"le stress chronique stimule la production surrénalienne d'androgènes ; les techniques de régulation du système nerveux aident à en limiter l'impact (Pasquali et al.).",
comment:["refais 5 min de cohérence cardiaque (inspire 5s, expire 5s)","remarque si c'est plus facile qu'au Jour 10","installe-la à un moment fixe pour en faire une habitude","identifie tes déclencheurs de stress et anticipe-les","si ton stress reste dominant, la Serenitea est l'option dédiée à ce mécanisme"],
pieges:["croire que c'est « réglé » après quelques séances : c'est une pratique régulière","attendre d'être en crise pour respirer : c'est la régularité qui protège","se culpabiliser d'être stressée : c'est biologique, pas un défaut"],
plus:"les habitudes anti-stress sont les plus faciles à laisser tomber, parce qu'on ne « voit » pas leur effet immédiatement. mais sur ton profil, elles agissent sur une vraie source d'androgènes. traite-les comme un levier hormonal, pas comme un bonus détente.",
observes:["aujourd'hui : une pratique plus naturelle qu'il y a 2 semaines","au fil des semaines : une réactivité au stress réduite","au long cours : un cortisol et des androgènes surrénaliens mieux régulés"],
victoire:"tu viens d'ancrer une habitude qui agit directement sur tes androgènes surrénaliens.",
outil:{emoji:"🤍",label:"Le coach mindset de Kamila",desc:"quand le stress monte",cible:null},
tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:"la mélisse de l'Équilibre Féminin soutient ton axe du stress au quotidien — et si le stress domine vraiment, la Serenitea est l'option à envisager en plus."}},

  {day:25,emoji:"🌅",theme:"ancrer l'habitude",
mission:"regarde ton assiette d'aujourd'hui : est-elle déjà, naturellement, plus anti-androgènes qu'il y a 25 jours ?",
msg:"la différence entre « j'essaie » et « c'est comme ça que je vis ».\n\ntu es en train de passer de l'un à l'autre.\n\naujourd'hui on grave l'habitude.",
pourquoi:"après 25 jours, beaucoup de tes réflexes sont devenus automatiques : l'ordre des aliments, une protéine à chaque repas, le zinc, les bons gras, le mouvement doux, la gestion du stress. ce qui demandait un effort conscient se fait de plus en plus tout seul.\n\nc'est exactement là que se joue la réussite sur un profil androgénique : pas dans un sprint de motivation, mais dans la constance qui tient dans la durée. parce que les androgènes se calment lentement, c'est la régularité sur des mois qui donne les résultats visibles.\n\naujourd'hui, prends conscience du chemin : ta façon de manger et de vivre n'est probablement plus celle d'il y a 25 jours, sans même que tu y penses.",
source:"les comportements répétés deviennent automatiques ; sur l'hyperandrogénie, c'est la constance dans la durée qui produit les résultats.",
comment:["regarde ton assiette et ta journée avec recul","remarque les réflexes devenus automatiques","identifie 1 ou 2 habitudes vraiment ancrées","sois fière : la constance, c'est ce qui fait bouger les androgènes","ne vise pas la perfection, vise la régularité dans le temps"],
pieges:["croire qu'un écart casse tout : une habitude ancrée encaisse les écarts","attendre d'être parfaite : la constance imparfaite bat la perfection ponctuelle","s'impatienter : les androgènes récompensent la durée, pas la précipitation"],
plus:"sur ton profil plus que tout autre, la patience et la constance sont tes meilleures armes. tu ne verras pas tout tout de suite — mais chaque jour de régularité travaille pour ta peau et tes cheveux des mois à venir. tu sèmes maintenant, tu récolteras.",
observes:["aujourd'hui : tu mesures le chemin automatique parcouru","dans les mois à venir : ces habitudes continuent de calmer tes androgènes","au long cours : des résultats visibles qui s'installent"],
victoire:"tu n'essaies plus — tu vis différemment. et c'est ça qui fera la différence sur la durée.",
outil:{emoji:"🍴",label:"Revoir l'assiette SMOP (SOPK)",desc:"le modèle à garder à vie",cible:"assiette"},
tisane:{nom:"Andro Tea",timing:"le soir, 1h après le dîner",lien:"https://sopklife.com/products/andro-tea",texte:"l'Andro Tea fait maintenant partie de ta routine du soir — ton geste anti-androgènes quotidien, ancré."}},

  {day:26,emoji:"📁",theme:"passer à l'action médicale",
mission:"si ce n'est pas encore fait, prends ou planifie ton rendez-vous médical — avec ta liste d'analyses prête.",
msg:"comprendre, c'est la première étape.\n\nagir sur ton suivi médical, c'en est une autre.\n\naujourd'hui on passe à l'action.",
pourquoi:"tu as maintenant les clés pour un rendez-vous utile : tu sais quelles analyses demander (testostérone, SHBG, DHEA-S, 17-OHP, cortisol, insuline), tu sais nommer tes symptômes, et tu comprends ton terrain androgénique et surrénalien.\n\nun bon suivi médical ne remplace pas ce que tu fais au quotidien — mais il le complète. il permet de confirmer l'origine de tes androgènes (ovarienne, surrénalienne, ou les deux), d'écarter d'autres causes comme l'hyperplasie congénitale, et d'ajuster si besoin.\n\nprendre ce rendez-vous, c'est refuser de rester dans le flou. c'est t'occuper de toi pour de vrai.",
source:"un suivi médical confirme l'origine de l'hyperandrogénie et écarte les diagnostics différentiels (hyperplasie congénitale des surrénales notamment).",
comment:["prends ou planifie le rendez-vous (médecin, endocrino ou gynéco)","apporte ta liste d'analyses (vue au Jour 15)","apporte la liste de tes symptômes et tes anciennes analyses","demande les conditions de prélèvement (jour du cycle, repos pour la prolactine)","utilise tes scripts médecin pour structurer l'échange"],
pieges:["repousser « quand j'aurai le temps » : prends le rendez-vous maintenant","y aller sans préparation : tu risques de repartir sans les bonnes analyses","te laisser décourager par un médecin pressé : tu as droit à un deuxième avis"],
plus:"si tu appréhendes, relis tes scripts médecin juste avant. arriver préparée change tout : tu n'es plus une patiente qui subit, tu es une femme qui connaît son corps et collabore. les médecins le ressentent.",
observes:["aujourd'hui : tu reprends la main sur ton suivi","au rendez-vous : un échange utile et structuré","après : un plan clair, des marqueurs suivis"],
victoire:"tu viens de transformer ta compréhension en action concrète pour ta santé.",
outil:{emoji:"👩‍⚕️",label:"Tes scripts médecin",desc:"pour structurer ton rendez-vous",cible:null},
tisane:null},

  {day:27,emoji:"🎯",theme:"bilan honnête",
mission:"fais un bilan sincère : qu'est-ce qui a bien marché pour toi ? qu'est-ce qui a été difficile ?",
msg:"pas de langue de bois avec toi-même.\n\nce qui a marché, ce qui a coincé.\n\naujourd'hui on fait un vrai bilan honnête.",
pourquoi:"à quelques jours de la fin, un bilan sincère vaut de l'or. pas pour te juger — pour apprendre à te connaître. qu'est-ce qui s'est intégré facilement ? qu'est-ce qui a résisté ? quels jours ont été durs, et pourquoi ?\n\ncette lucidité, c'est ce qui te permettra de continuer APRÈS les 30 jours — et sur un profil androgénique, c'est justement la suite qui compte, puisque les résultats visibles arrivent sur plusieurs mois.\n\nsois honnête ET bienveillante. tu n'as pas à avoir tout réussi parfaitement. tu as à comprendre ce qui marche pour TOI, pour pouvoir le garder sur la durée.",
source:"l'auto-évaluation bienveillante soutient le maintien des changements au long cours, essentiel quand les résultats s'étalent dans le temps.",
comment:["note ce qui a bien marché, ce qui t'a plu","note ce qui a été difficile, et pourquoi","distingue ce que tu veux garder de ce qui ne te convient pas","sois honnête sans te juger : tu apprends, tu ne te notes pas","projette : comment continuer sur les mois à venir ?"],
pieges:["ne retenir que le négatif : liste d'abord ce qui a marché","te culpabiliser pour les jours ratés : ils font partie du chemin","vouloir tout garder : choisis ce qui TE convient vraiment"],
plus:"les choses difficiles ne sont pas des échecs, ce sont des informations. si un geste n'a pas tenu, ce n'est pas un manque de volonté — c'est peut-être qu'il ne collait pas à ta vie. cherche la version qui TE convient, celle que tu tiendras des mois.",
observes:["aujourd'hui : tu sais ce qui marche pour toi","après le Jour 30 : tu gardes ce qui te convient","sur les mois à venir : la constance qui fait les résultats"],
victoire:"tu viens de faire quelque chose de rare : un bilan honnête et bienveillant avec toi-même.",
outil:{emoji:"📒",label:null,desc:null,cible:null},
tisane:null},

  {day:28,emoji:"⚡",theme:"tout ensemble",
mission:"aujourd'hui, essaie de réunir le maximum de tes réflexes anti-androgènes en une seule journée type.",
msg:"tu as appris les pièces une par une.\n\naujourd'hui on les assemble.\n\nune journée qui calme tes androgènes, du matin au soir.",
pourquoi:"depuis 28 jours, tu as construit ton approche anti-androgènes pièce par pièce : alimentation (ordre, protéines, bons gras, zinc), boissons alliées (menthe verte, thé vert), mouvement doux, gestion du stress, sommeil, et tes tisanes de profil.\n\naujourd'hui, l'idée est de voir comment tout s'emboîte sur une seule journée : un matin protéiné, une assiette équilibrée, tes boissons anti-androgènes, du mouvement doux, un moment de respiration, un bon sommeil, et ton duo Équilibre Féminin + Andro Tea.\n\nce n'est pas un modèle à reproduire parfaitement tous les jours. c'est une référence dont tu te rapproches quand tu peux, sans culpabiliser les autres jours.",
source:"les leviers d'hygiène de vie agissent en synergie sur l'hyperandrogénie (voies ovarienne et surrénalienne combinées).",
comment:["matin : lumière + petit-déj protéiné + Équilibre Féminin en journée","boissons alliées : menthe verte, thé vert dans la journée","mouvement doux à un moment qui te convient","5 min de respiration quand la pression monte","soir : repas léger, écrans coupés, Andro Tea, bon sommeil"],
pieges:["viser la journée parfaite tous les jours : c'est une référence, pas une prison","se décourager si tout n'est pas coché : chaque geste compte","oublier le plaisir : une journée qui prend soin de toi reste agréable"],
plus:"n'attends pas la journée parfaite pour être fière. certains jours tu cocheras tout, d'autres deux ou trois choses, et c'est très bien. ce qui compte, c'est la direction sur la durée — et tu as tous les outils maintenant.",
observes:["aujourd'hui : tu vois comment tout s'emboîte","dans les semaines à venir : tu t'en rapproches naturellement","sur les mois : c'est devenu ton quotidien, sans effort"],
victoire:"tu sais maintenant à quoi ressemble une journée qui calme tes androgènes — et tu sais la créer.",
outil:{emoji:"📍",label:"Les guides du quotidien",desc:"petit-déj, repas, situations",cible:"situations"},
tisane:{nom:"Andro Tea",timing:"le soir, 1h après le dîner",lien:"https://sopklife.com/products/andro-tea",texte:"dans ta journée type, le duo clé : Équilibre Féminin en journée + Andro Tea le soir, pour une action anti-androgénique sur 24h."}},

  {day:29,emoji:"📊",theme:"mesurer le chemin parcouru",
mission:"relis tous tes bilans (Jours 3, 7, 14, 21) et mesure tout ce qui a changé en un mois.",
msg:"presque un mois.\n\nregarde d'où tu es partie.\n\naujourd'hui on mesure vraiment le chemin.",
pourquoi:"c'est le moment de prendre de la hauteur. relis ta cartographie du Jour 3 et tes bilans des Jours 7, 14 et 21, et compare avec aujourd'hui. mets bout à bout tous les signaux : énergie, fringales, sommeil, stress, et l'évolution de ta peau.\n\nsur un profil androgénique, souviens-toi du calendrier : la peau commence à répondre vers 4-8 semaines, la pilosité et les cheveux sur 3-6 mois. donc à un mois, tu es sur la bonne trajectoire — les premiers signes cutanés peuvent apparaître, mais le gros des résultats visibles est encore devant toi.\n\nce bilan global, c'est ta preuve que ton terrain répond. et c'est ce qui te donnera la force de continuer les mois nécessaires pour les résultats visibles.",
source:"les améliorations de l'hyperandrogénie s'étalent sur plusieurs mois ; mesurer la trajectoire soutient la persévérance.",
comment:["relis ta cartographie du Jour 3 et tes bilans des Jours 7, 14, 21","mets bout à bout tous les signaux qui ont bougé","compare ton état d'aujourd'hui à celui d'il y a un mois","écris ce bilan global dans ton Journal","garde-le : c'est ta preuve pour les mois à venir"],
pieges:["attendre des résultats visibles complets à un mois : c'est encore tôt pour les androgènes","sous-estimer l'accumulation de petits signes : c'est la somme qui parle","oublier que le plus gros des résultats cutanés arrive dans les mois suivants"],
plus:"garde précieusement ce bilan d'un mois. sur ton profil, la tentation d'abandonner est forte justement parce que les résultats visibles prennent du temps. ce bilan est ta preuve, écrite par toi, que ton corps répond — relis-le les jours de doute.",
observes:["aujourd'hui : tu mesures un mois complet de travail","dans 1-5 semaines : la peau continue de répondre","dans 3-6 mois : la pilosité et les cheveux s'améliorent"],
victoire:"tu viens de mesurer un mois entier de travail sur tes androgènes — et la trajectoire est réelle.",
outil:{emoji:"📒",label:null,desc:null,cible:null},
tisane:null},

  {day:30,emoji:"🌸",theme:"ce que tu emmènes",
mission:"choisis les 3 habitudes que tu veux absolument garder — celles qui t'ont fait le plus de bien.",
msg:"30 jours.\n\ntu l'as fait.\n\net sur ton profil, ce n'est pas une fin — c'est vraiment un début.",
pourquoi:"félicitations, Cyster. 30 jours à agir sur tes androgènes par toutes les voies : insuline, foie, zinc, stress surrénalien, sommeil. tu n'as pas suivi un régime, tu as appris à comprendre et à apaiser ton terrain.\n\nsur ton profil plus que tout autre, la suite compte : les résultats visibles sur ta peau, ta pilosité et tes cheveux arrivent sur les semaines et mois à venir. c'est maintenant que la constance paie. alors garde l'essentiel : pas 30 habitudes, mais les 3 qui t'ont fait le plus de bien, celles que tu tiendras vraiment.\n\nce protocole restera là, tu pourras y revenir. mais à partir d'aujourd'hui, tu n'as plus besoin de quelqu'un pour te dire quoi faire : tu comprends ton corps, tu connais tes leviers, tu es devenue ta propre alliée.",
source:"se concentrer sur quelques habitudes clés favorise leur maintien ; sur l'hyperandrogénie, la durée est la clé des résultats.",
comment:["choisis les 3 habitudes qui t'ont fait le plus de bien","écris-les, affiche-les si tu veux","garde-les comme ta base, le reste viendra en bonus","continue tes tisanes : les résultats androgéniques se jouent sur la durée","reviens au protocole quand tu en as besoin"],
pieges:["vouloir tout garder : choisis l'essentiel, c'est ça qui tient","croire que « c'est fini » : sur ce profil, les résultats arrivent APRÈS","abandonner avant les résultats visibles : tu es sur la bonne voie, tiens bon"],
plus:"tu es passée de « je ne comprends rien à ce qui m'arrive » à « je sais comment apaiser mon terrain ». sur ton profil, les plus beaux résultats sont encore devant toi — ta peau, tes cheveux, ta confiance. continue, sois patiente et douce avec toi. tu as les clés, et tu n'es plus seule.",
observes:["aujourd'hui : tu repars avec tes 3 habitudes clés","dans les mois à venir : les résultats visibles s'installent","pour la vie : une compréhension de ton corps qui ne te quittera plus"],
victoire:"tu as terminé. tu comprends ton terrain, tu as tes outils, tu es ta propre alliée. je suis fière de toi, Cyster.",
outil:null,
tisane:{nom:"Andro Tea",timing:"le soir, 1h après le dîner",lien:"https://sopklife.com/products/andro-tea",texte:"l'Andro Tea et l'Équilibre Féminin restent ton duo de fond, bien au-delà de ces 30 jours — c'est la constance qui fera tes résultats."}},

];


// ─── MIXTE Métabolique + Androgénique (composé des parcours parents) ──────────
const _tD=(txt)=>({nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:txt});
const _tE=(txt)=>({nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:txt});
const _tS=(txt)=>({nom:"Stabilitea",timing:"après les repas",lien:"https://sopklife.com/products/stabili-tea",texte:txt});
const _tAT=(txt)=>({nom:"Andro Tea",timing:"le soir, 1h après le dîner",lien:"https://sopklife.com/products/andro-tea",texte:txt});
const MISSIONS_MIXTE_MA = [
  {...MISSIONS_ANDRO[0], tisane:_tD("on prépare d'abord ton foie — il élimine l'excès d'androgènes et aide à réguler ton métabolisme. la Cure Détox seule cette première semaine, à jeun.")},
  {...MISSIONS_ANDRO[1], tisane:null},
  {...MISSIONS_ANDRO[2], tisane:null},
  {...MISSIONS_ANDRO[3], tisane:null},
  {...MISSIONS_ANDRO[4], tisane:null},
  {...MISSIONS_ANDRO[5], tisane:null},
  {...MISSIONS_ANDRO[6], tisane:_tD("dernière ligne de la semaine Détox seule. dès demain, on ajoute l'Équilibre Féminin, la fondation hormonale.")},
  {...MISSIONS_ANDRO[7], tisane:_tE("aujourd'hui on pose la fondation : l'Équilibre Féminin. il agit à la fois sur l'insuline (cannelle de Ceylan) et sur les androgènes (menthe poivrée) — parfait pour ton profil mixte.")},
  {...MISSIONS_ANDRO[8], tisane:null},
  {...MISSIONS_META[8], tisane:null},
  {...MISSIONS_ANDRO[9], tisane:null},
  {...MISSIONS_ANDRO[11], tisane:_tE("ton Équilibre Féminin réunit cannelle (insuline) et menthe poivrée (androgènes) : tes deux moteurs dans une seule tisane.")},
  {...MISSIONS_ANDRO[12], tisane:null},
  {day:14,emoji:"🏆",theme:"mi-parcours",
   mission:"relis ta cartographie du Jour 3 et ton bilan du Jour 7 — note tout ce qui a bougé.",
   msg:"deux semaines.\n\ntu travailles tes DEUX moteurs à la fois : l'insuline et les androgènes.\n\naujourd'hui on mesure, et on ajoute ta première tisane de profil.",
   pourquoi:"ton profil mixte métabolique + androgénique veut dire deux leviers qui s'entretiennent : ta résistance à l'insuline pousse tes ovaires à produire plus d'androgènes. travailler les deux en même temps, c'est casser le cercle des deux côtés.\n\nen deux semaines, tu as agi sur l'insuline (ordre des aliments, protéines, sucre) ET sur les androgènes (zinc, foie, SHBG, stress). aujourd'hui on ajoute la Stabilitea, ta tisane métabolique, qui soutient la sensibilité à l'insuline après les repas. l'Andro Tea, elle, viendra au Jour 21 pour le versant androgénique.\n\nsois patiente avec le miroir : la peau répond en 4 à 8 semaines, la pilosité et les cheveux en 3 à 6 mois. ce que tu mesures aujourd'hui, ce sont surtout les signaux intérieurs.",
   source:"la résistance à l'insuline alimente l'hyperandrogénie ; agir sur les deux voies est l'approche la plus cohérente pour un profil mixte (Diamanti-Kandarakis & Dunaif, 2012).",
   comment:["relis ta cartographie du Jour 3 et ton bilan du Jour 7","note ce qui a bougé : énergie, fringales, digestion, peau","introduis la Stabilitea après les repas à partir d'aujourd'hui","célèbre deux semaines de travail sur tes deux moteurs","projette-toi : deux semaines encore pour ancrer"],
   pieges:["chercher un résultat visible après 2 semaines : c'est trop tôt pour les androgènes","négliger un des deux moteurs : ton profil a besoin des deux","abandonner maintenant, pile avant que la peau réponde"],
   plus:"ton profil mixte est exigeant mais logique : en soignant ton insuline, tu réduis aussi tes androgènes. chaque geste compte double. c'est ce qui rend ta progression parfois plus lente à voir, mais plus profonde.",
   observes:["aujourd'hui : tu mesures 2 semaines sur tes deux moteurs","dans 2-4 semaines : la peau commence à répondre","dans 3-6 mois : la pilosité et les cheveux"],
   victoire:"tu es à mi-chemin, tu travailles tes deux moteurs, et ta tisane métabolique entre en jeu.",
   outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"dosage, timing et délai pour ton profil",cible:"complements"},
   tisane:_tS("aujourd'hui on ajoute la Stabilitea, ta tisane métabolique. cannelle de Ceylan et feuilles de mûrier soutiennent ta sensibilité à l'insuline après les repas — un des deux piliers de ton profil mixte.")},
  {...MISSIONS_ANDRO[14], tisane:null},
  {...MISSIONS_META[15], tisane:_tS("la Stabilitea après tes repas continue de soutenir ta glycémie, le versant métabolique de ton profil.")},
  {...MISSIONS_ANDRO[16], tisane:null},
  {...MISSIONS_META[10], tisane:null},
  {...MISSIONS_ANDRO[18], tisane:null},
  {...MISSIONS_ANDRO[19], tisane:null},
  {day:21,emoji:"📈",theme:"rendre visible ce qui a changé",
   mission:"fais le point sur 3 semaines : énergie, corps, peau — et aujourd'hui, on complète ton protocole tisane.",
   msg:"trois semaines sur tes deux moteurs.\n\naujourd'hui on rend les progrès visibles, et on ajoute ta tisane anti-androgènes.",
   pourquoi:"après 3 semaines, tu as travaillé l'insuline et les androgènes en parallèle. les signaux intérieurs (énergie, fringales, sommeil) ont souvent déjà bougé ; la peau commence tout juste à répondre.\n\naujourd'hui on ajoute l'Andro Tea, ta tisane du versant androgénique. avec la Stabilitea (métabolique) et l'Équilibre Féminin (fondation), tu as maintenant ton protocole mixte complet : une tisane pour chaque levier. la menthe verte de l'Andro Tea réduit la testostérone libre, pendant que la Stabilitea travaille ton insuline.\n\nrelis tes bilans précédents et mesure le chemin : c'est ta preuve que ton terrain répond sur les deux fronts.",
   source:"la menthe verte de l'Andro Tea réduit la testostérone libre (Grant, 2010) ; l'approche multi-levier convient au profil mixte.",
   comment:["relis ta cartographie du Jour 3 et tes bilans des Jours 7 et 14","note ce qui a bougé : énergie, fringales, sommeil, peau","introduis l'Andro Tea le soir à partir d'aujourd'hui","tu as maintenant une tisane par levier : Équilibre, Stabilitea, Andro Tea","garde tout dans le Journal — c'est ta preuve"],
   pieges:["chercher une transformation visible complète : c'est encore tôt pour les androgènes","oublier un des deux versants : ton protocole couvre les deux, utilise-le","te décourager : le délai est normal, tu es sur la bonne voie"],
   plus:"ton protocole mixte est maintenant complet : chaque tisane cible un de tes leviers. ce n'est pas « trop » — c'est adapté à un profil qui a deux moteurs. introduis-les progressivement, écoute ton corps, et laisse-les travailler ensemble.",
   observes:["aujourd'hui : 3 semaines de travail sur tes deux moteurs","dans 1-5 semaines : la peau continue de répondre","dans 3-6 mois : la pilosité et les cheveux"],
   victoire:"tu viens de compléter ton protocole mixte — une tisane pour chacun de tes leviers.",
   outil:{emoji:"📒",label:null,desc:null,cible:null},
   tisane:_tAT("aujourd'hui on ajoute l'Andro Tea le soir — le versant androgénique de ton protocole. avec la Stabilitea et l'Équilibre Féminin, tu as maintenant une tisane par levier.")},
  {...MISSIONS_ANDRO[21], tisane:null},
  {...MISSIONS_ANDRO[22], tisane:null},
  {...MISSIONS_ANDRO[23], tisane:null},
  {...MISSIONS_ANDRO[24], tisane:null},
  {...MISSIONS_ANDRO[25], tisane:null},
  {...MISSIONS_ANDRO[26], tisane:null},
  {...MISSIONS_ANDRO[27], tisane:_tAT("dans ta journée type, ton trio : Équilibre Féminin en journée, Stabilitea après les repas, Andro Tea le soir — un levier à chaque moment.")},
  {...MISSIONS_ANDRO[28], tisane:null},
  {...MISSIONS_ANDRO[29], tisane:_tAT("tes tisanes restent ton soutien de fond au-delà des 30 jours : Équilibre, Stabilitea et Andro Tea, selon tes besoins.")},
].map((d,i)=>({...d,day:i+1}));


// ─── helpers tisanes supplémentaires (Serenitea, Inflamma) ────────────────────
const _tSer=(txt)=>({nom:"Serenitea",timing:"le soir au coucher",lien:"https://sopklife.com/products/serenitea-detente-absolue",texte:txt});
const _tInf=(txt)=>({nom:"Inflamma Tea",timing:"milieu de journée",lien:"https://sopklife.com/products/inflamma-tea",texte:txt});

// ─── MIXTE Métabolique + Inflammatoire ────────────────────────────────────────
const MISSIONS_MIXTE_MI = [
  {...MISSIONS_INFLA[0], tisane:_tD("on prépare d'abord ton foie — il élimine les composés inflammatoires et soutient ton métabolisme. Cure Détox seule cette première semaine, à jeun.")},
  {...MISSIONS_INFLA[1], tisane:null},
  {...MISSIONS_INFLA[2], tisane:null},
  {...MISSIONS_INFLA[3], tisane:null},
  {...MISSIONS_INFLA[4], tisane:null},
  {...MISSIONS_META[5], tisane:null},
  {...MISSIONS_INFLA[6], tisane:_tD("dernière ligne de la semaine Détox seule. dès demain, on ajoute l'Équilibre Féminin, la fondation.")},
  {...MISSIONS_INFLA[7], tisane:_tE("aujourd'hui on pose la fondation : l'Équilibre Féminin. sa cannelle soutient l'insuline, son gingembre et son ortie apaisent le terrain — tes deux versants réunis.")},
  {...MISSIONS_META[8], tisane:null},
  {day:10,emoji:"🧠",theme:"le stress, carburant des deux feux",
   mission:"fais 5 minutes de cohérence cardiaque aujourd'hui — inspire 5s, expire 5s, pendant 5 minutes.",
   msg:"ton stress nourrit tes DEUX moteurs à la fois.\n\nl'insuline ET l'inflammation.\n\naujourd'hui on s'en occupe.",
   pourquoi:"sur ton profil mixte métabolique + inflammatoire, le stress chronique est un accélérateur des deux côtés. un cortisol élevé en permanence aggrave la résistance à l'insuline ET entretient l'inflammation de bas grade. c'est un carburant commun à tes deux feux.\n\nagir sur ton stress n'est donc pas un « bonus bien-être » : c'est couper une source partagée de tes deux problèmes. la cohérence cardiaque (5 secondes à l'inspiration, 5 à l'expiration, 5 minutes) fait redescendre le cortisol en envoyant à ton système nerveux le signal que le danger est passé.\n\nc'est pour ça qu'on ajoute aujourd'hui la Serenitea : elle est pensée précisément pour apaiser l'axe du stress, le point commun de tes deux versants.",
   source:"le cortisol chronique aggrave la résistance à l'insuline et l'inflammation ; le SMOP et le stress s'aggravent mutuellement (Pasquali et al.).",
   comment:["installe-toi au calme, inspire 5s, expire 5s, pendant 5 minutes","idéalement 1 à 3 fois par jour","introduis la Serenitea le soir à partir d'aujourd'hui","protège ton sommeil : il fait baisser le cortisol","évite l'excès de caféine et le surentraînement"],
   pieges:["croire que gérer son stress est secondaire : c'est une source commune de tes deux feux","attendre un calme parfait pour s'y mettre : on pratique pour l'obtenir","se culpabiliser : c'est biologique, pas un défaut de caractère"],
   plus:"sur un profil mixte, le stress est souvent le fil qui relie tes deux versants. en l'apaisant, tu agis sur l'insuline et sur l'inflammation en même temps. c'est un des leviers les plus rentables pour toi.",
   observes:["dès aujourd'hui : un apaisement immédiat après la séance","dans quelques jours : une réactivité au stress moindre","au fil des semaines : insuline et inflammation mieux régulées"],
   victoire:"tu viens d'agir sur un carburant commun à tes deux moteurs : le stress.",
   outil:{emoji:"🤍",label:"Le coach mindset de Kamila",desc:"quand le stress monte",cible:null},
   tisane:_tSer("aujourd'hui on ajoute la Serenitea le soir : l'ashwagandha aide à réguler le cortisol, le point commun de tes deux versants. en rituel du soir.")},
  {...MISSIONS_INFLA[9], tisane:null},
  {...MISSIONS_INFLA[11], tisane:null},
  {...MISSIONS_INFLA[12], tisane:null},
  {day:14,emoji:"🏆",theme:"mi-parcours",
   mission:"relis ton bilan du Jour 7 et note tout ce qui a bougé depuis.",
   msg:"deux semaines.\n\ntu travailles l'insuline ET l'inflammation.\n\naujourd'hui on mesure, et on ajoute ta tisane métabolique.",
   pourquoi:"ton profil mixte métabolique + inflammatoire, c'est deux feux qui s'alimentent : la résistance à l'insuline entretient l'inflammation, et l'inflammation aggrave la résistance à l'insuline. les travailler ensemble, c'est casser le cercle des deux côtés.\n\nen deux semaines, tu as agi sur l'inflammation (oméga-3, assiette colorée, foie) ET sur l'insuline (ordre des aliments, sucre, magnésium), plus le stress (Serenitea) qui relie les deux. aujourd'hui on ajoute la Stabilitea, ta tisane métabolique, qui soutient la sensibilité à l'insuline après les repas. l'Inflamma Tea viendra au Jour 21 pour le versant inflammatoire.",
   source:"résistance à l'insuline et inflammation de bas grade s'entretiennent mutuellement dans le SMOP ; agir sur les deux est l'approche cohérente (Diamanti-Kandarakis & Dunaif, 2012).",
   comment:["relis ton bilan du Jour 7","note ce qui a bougé : énergie, digestion, ballonnements, fringales","introduis la Stabilitea après les repas à partir d'aujourd'hui","célèbre deux semaines de travail sur tes deux feux","projette-toi : deux semaines encore pour ancrer"],
   pieges:["négliger un des deux versants : ton profil a besoin des deux","chercher un grand résultat visible à 2 semaines : c'est intérieur d'abord","abandonner maintenant : tu es sur la bonne voie"],
   plus:"ton profil mixte est logique : en apaisant l'inflammation, tu aides ton insuline, et inversement. chaque geste compte double. c'est exigeant, mais c'est profond.",
   observes:["aujourd'hui : 2 semaines sur tes deux feux","dans 2 semaines : un bilan encore plus net","dans 2-3 mois : les changements visibles s'installent"],
   victoire:"tu es à mi-chemin, tu travailles tes deux moteurs, et ta tisane métabolique entre en jeu.",
   outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"dosage, timing et délai pour ton profil",cible:"complements"},
   tisane:_tS("aujourd'hui on ajoute la Stabilitea, ta tisane métabolique : cannelle et feuilles de mûrier soutiennent ta sensibilité à l'insuline après les repas.")},
  {...MISSIONS_INFLA[14], tisane:null},
  {...MISSIONS_META[15], tisane:null},
  {...MISSIONS_INFLA[16], tisane:null},
  {...MISSIONS_META[10], tisane:null},
  {...MISSIONS_INFLA[18], tisane:null},
  {...MISSIONS_INFLA[19], tisane:null},
  {day:21,emoji:"📈",theme:"rendre visible ce qui a changé",
   mission:"fais le point sur 3 semaines — et aujourd'hui, on complète ton protocole tisane.",
   msg:"trois semaines sur tes deux feux.\n\naujourd'hui on rend les progrès visibles, et on ajoute ta tisane anti-inflammatoire.",
   pourquoi:"après 3 semaines, tu as travaillé l'insuline et l'inflammation en parallèle, avec le stress comme fil conducteur. les signaux intérieurs — énergie, digestion, ballonnements, fringales — ont souvent déjà bougé.\n\naujourd'hui on ajoute l'Inflamma Tea, ta tisane du versant inflammatoire (curcuma, gingembre, ortie, églantier). avec la Stabilitea (métabolique), l'Équilibre Féminin (fondation) et la Serenitea (stress), ton protocole mixte est complet : une tisane par levier.\n\nrelis tes bilans et mesure le chemin : c'est ta preuve que ton terrain répond sur les deux fronts.",
   source:"curcuma et gingembre ont montré des effets anti-inflammatoires dans certaines études ; l'approche multi-levier convient au profil mixte.",
   comment:["relis tes bilans des Jours 7 et 14","note ce qui a bougé : énergie, digestion, ballonnements, sommeil","introduis l'Inflamma Tea en milieu de journée à partir d'aujourd'hui","tu as maintenant une tisane par levier : Équilibre, Serenitea, Stabilitea, Inflamma","garde tout dans le Journal"],
   pieges:["oublier un des versants : ton protocole couvre tout, utilise-le","chercher une transformation visible complète : c'est progressif","te décourager : le délai est normal"],
   plus:"ton protocole mixte est maintenant complet : chaque tisane cible un levier. introduis-les progressivement, écoute ton corps, et laisse-les travailler ensemble sur ton terrain.",
   observes:["aujourd'hui : 3 semaines sur tes deux feux","dans 2 semaines : un bilan final encore plus net","dans 2-3 mois : les changements visibles s'installent"],
   victoire:"tu viens de compléter ton protocole mixte — une tisane pour chacun de tes leviers.",
   outil:{emoji:"📒",label:null,desc:null,cible:null},
   tisane:_tInf("aujourd'hui on ajoute l'Inflamma Tea en milieu de journée — le versant inflammatoire de ton protocole. ton protocole mixte est complet.")},
  {...MISSIONS_INFLA[21], tisane:null},
  {...MISSIONS_INFLA[22], tisane:null},
  {...MISSIONS_INFLA[23], tisane:null},
  {...MISSIONS_INFLA[24], tisane:null},
  {...MISSIONS_META[25], tisane:null},
  {...MISSIONS_INFLA[26], tisane:null},
  {...MISSIONS_INFLA[27], tisane:_tInf("dans ta journée type, tes tisanes se répartissent : Équilibre en journée, Stabilitea après les repas, Inflamma Tea en milieu de journée, Serenitea le soir.")},
  {...MISSIONS_INFLA[28], tisane:null},
  {...MISSIONS_INFLA[29], tisane:_tInf("tes tisanes restent ton soutien de fond au-delà des 30 jours, selon tes besoins du moment.")},
].map((d,i)=>({...d,day:i+1}));

// ─── MIXTE Androgénique + Inflammatoire ───────────────────────────────────────
const MISSIONS_MIXTE_AI = [
  {...MISSIONS_ANDRO[0], tisane:_tD("on prépare d'abord ton foie — il élimine l'excès d'androgènes et les composés inflammatoires. Cure Détox seule cette première semaine, à jeun.")},
  {...MISSIONS_ANDRO[1], tisane:null},
  {...MISSIONS_ANDRO[2], tisane:null},
  {...MISSIONS_INFLA[3], tisane:null},
  {...MISSIONS_INFLA[4], tisane:null},
  {...MISSIONS_ANDRO[5], tisane:null},
  {...MISSIONS_ANDRO[6], tisane:_tD("dernière ligne de la semaine Détox seule. dès demain, on ajoute l'Équilibre Féminin, la fondation.")},
  {...MISSIONS_ANDRO[7], tisane:_tE("aujourd'hui on pose la fondation : l'Équilibre Féminin. menthe poivrée (androgènes), ortie et gingembre (terrain apaisé) — tes deux versants réunis.")},
  {...MISSIONS_ANDRO[8], tisane:null},
  {day:10,emoji:"🧠",theme:"le stress, source commune",
   mission:"fais 5 minutes de cohérence cardiaque aujourd'hui — inspire 5s, expire 5s, pendant 5 minutes.",
   msg:"ton stress nourrit tes DEUX versants.\n\nles androgènes surrénaliens ET l'inflammation.\n\naujourd'hui on s'en occupe.",
   pourquoi:"sur ton profil mixte androgénique + inflammatoire, le stress chronique attaque sur deux fronts. face au stress, tes surrénales produisent plus de cortisol ET de DHEA (donc plus d'androgènes). et le cortisol élevé en permanence entretient aussi l'inflammation de bas grade. c'est une source commune de tes deux versants.\n\nagir sur ton stress, c'est donc couper une racine partagée. la cohérence cardiaque (5 secondes à l'inspiration, 5 à l'expiration, 5 minutes) fait redescendre le cortisol.\n\nc'est pour ça qu'on ajoute aujourd'hui la Serenitea : l'ashwagandha aide à réguler le cortisol, exactement le point commun de tes deux versants. et rappelle-toi : c'est ton SMOP qui te rend sensible au stress, pas ta personnalité anxieuse qui a causé ton SMOP.",
   source:"le stress stimule la production surrénalienne d'androgènes (DHEA) et entretient l'inflammation ; SMOP et stress s'aggravent mutuellement (Pasquali et al.).",
   comment:["installe-toi au calme, inspire 5s, expire 5s, pendant 5 minutes","idéalement 1 à 3 fois par jour","introduis la Serenitea le soir à partir d'aujourd'hui","protège ton sommeil : il fait baisser le cortisol","évite l'excès de caféine et le surentraînement"],
   pieges:["croire que gérer son stress est secondaire : c'est une source commune de tes deux versants","attendre un calme parfait pour s'y mettre : on pratique pour l'obtenir","se culpabiliser : c'est biologique"],
   plus:"sur un profil mixte androgénique + inflammatoire, le stress est le fil qui relie tes deux problèmes. en l'apaisant, tu agis sur tes androgènes surrénaliens et sur ton inflammation en même temps.",
   observes:["dès aujourd'hui : un apaisement immédiat","dans quelques jours : une réactivité au stress moindre","au fil des semaines : androgènes surrénaliens et inflammation mieux régulés"],
   victoire:"tu viens d'agir sur une racine commune à tes deux versants : le stress.",
   outil:{emoji:"🤍",label:"Le coach mindset de Kamila",desc:"quand le stress monte",cible:null},
   tisane:_tSer("aujourd'hui on ajoute la Serenitea le soir : l'ashwagandha régule le cortisol, le point commun de tes deux versants. en rituel du soir.")},
  {...MISSIONS_INFLA[9], tisane:null},
  {...MISSIONS_ANDRO[11], tisane:null},
  {...MISSIONS_INFLA[12], tisane:null},
  {day:14,emoji:"🏆",theme:"mi-parcours",
   mission:"relis ta cartographie du Jour 3 et ton bilan du Jour 7 — note tout ce qui a bougé.",
   msg:"deux semaines.\n\ntu travailles les androgènes ET l'inflammation.\n\naujourd'hui on mesure, et on ajoute ta tisane anti-inflammatoire.",
   pourquoi:"ton profil mixte androgénique + inflammatoire, c'est deux versants liés : l'inflammation amplifie souvent l'hyperandrogénie, et le stress nourrit les deux. les travailler ensemble, c'est agir sur tout le terrain.\n\nen deux semaines, tu as agi sur les androgènes (zinc, menthe verte, foie, SHBG) ET sur l'inflammation (via l'assiette et le mode de vie), plus le stress (Serenitea) qui relie les deux. aujourd'hui on ajoute l'Inflamma Tea, ta tisane anti-inflammatoire. l'Andro Tea viendra au Jour 21 pour le versant androgénique.\n\nsois patiente avec le miroir : la peau répond en 4 à 8 semaines, la pilosité et les cheveux en 3 à 6 mois.",
   source:"l'inflammation de bas grade peut amplifier l'hyperandrogénie ; curcuma et gingembre ont montré des effets anti-inflammatoires dans certaines études.",
   comment:["relis ta cartographie du Jour 3 et ton bilan du Jour 7","note ce qui a bougé : énergie, digestion, peau, ballonnements","introduis l'Inflamma Tea en milieu de journée à partir d'aujourd'hui","célèbre deux semaines sur tes deux versants","projette-toi : deux semaines encore pour ancrer"],
   pieges:["négliger un des deux versants : ton profil a besoin des deux","chercher un résultat visible à 2 semaines : trop tôt pour les androgènes","abandonner maintenant : tu es sur la bonne voie"],
   plus:"ton profil mixte est exigeant mais cohérent : en apaisant l'inflammation, tu aides à calmer tes androgènes. chaque geste travaille sur plusieurs fronts à la fois.",
   observes:["aujourd'hui : 2 semaines sur tes deux versants","dans 2-4 semaines : la peau commence à répondre","dans 3-6 mois : la pilosité et les cheveux"],
   victoire:"tu es à mi-chemin, tu travailles tes deux versants, et ta tisane anti-inflammatoire entre en jeu.",
   outil:{emoji:"💊",label:"Voir tes compléments adaptés",desc:"dosage, timing et délai pour ton profil",cible:"complements"},
   tisane:_tInf("aujourd'hui on ajoute l'Inflamma Tea en milieu de journée : curcuma, gingembre, ortie, églantier, pour apaiser ton terrain inflammatoire.")},
  {...MISSIONS_ANDRO[14], tisane:null},
  {...MISSIONS_INFLA[15], tisane:null},
  {...MISSIONS_ANDRO[16], tisane:null},
  {...MISSIONS_INFLA[16], tisane:null},
  {...MISSIONS_ANDRO[18], tisane:null},
  {...MISSIONS_INFLA[19], tisane:null},
  {day:21,emoji:"📈",theme:"rendre visible ce qui a changé",
   mission:"fais le point sur 3 semaines — et aujourd'hui, on complète ton protocole tisane.",
   msg:"trois semaines sur tes deux versants.\n\naujourd'hui on rend les progrès visibles, et on ajoute ta tisane anti-androgènes.",
   pourquoi:"après 3 semaines, tu as travaillé les androgènes et l'inflammation en parallèle, avec le stress comme fil conducteur. les signaux intérieurs ont souvent déjà bougé ; la peau commence tout juste à répondre.\n\naujourd'hui on ajoute l'Andro Tea, ta tisane du versant androgénique (menthe verte, ortie, thé vert, romarin). avec l'Inflamma Tea (inflammation), la Serenitea (stress) et l'Équilibre Féminin (fondation), ton protocole mixte est complet : une tisane par levier.\n\nrelis tes bilans et mesure le chemin : c'est ta preuve que ton terrain répond sur les deux fronts.",
   source:"la menthe verte de l'Andro Tea réduit la testostérone libre (Grant, 2010) ; l'approche multi-levier convient au profil mixte.",
   comment:["relis ta cartographie du Jour 3 et tes bilans des Jours 7 et 14","note ce qui a bougé : énergie, digestion, peau, ballonnements","introduis l'Andro Tea le soir à partir d'aujourd'hui","tu as maintenant une tisane par levier : Équilibre, Serenitea, Inflamma, Andro Tea","garde tout dans le Journal"],
   pieges:["oublier un des versants : ton protocole couvre tout","chercher une transformation visible complète : c'est progressif","te décourager : le délai est normal sur le versant androgénique"],
   plus:"ton protocole mixte est maintenant complet : chaque tisane cible un levier. introduis-les progressivement, écoute ton corps, et laisse-les travailler ensemble.",
   observes:["aujourd'hui : 3 semaines sur tes deux versants","dans 1-5 semaines : la peau continue de répondre","dans 3-6 mois : la pilosité et les cheveux"],
   victoire:"tu viens de compléter ton protocole mixte — une tisane pour chacun de tes leviers.",
   outil:{emoji:"📒",label:null,desc:null,cible:null},
   tisane:_tAT("aujourd'hui on ajoute l'Andro Tea le soir — le versant androgénique de ton protocole. ton protocole mixte est complet.")},
  {...MISSIONS_ANDRO[21], tisane:null},
  {...MISSIONS_ANDRO[22], tisane:null},
  {...MISSIONS_ANDRO[23], tisane:null},
  {...MISSIONS_ANDRO[24], tisane:null},
  {...MISSIONS_ANDRO[25], tisane:null},
  {...MISSIONS_ANDRO[26], tisane:null},
  {...MISSIONS_ANDRO[27], tisane:_tAT("dans ta journée type, tes tisanes se répartissent : Équilibre en journée, Inflamma Tea en milieu de journée, Andro Tea et Serenitea le soir.")},
  {...MISSIONS_ANDRO[28], tisane:null},
  {...MISSIONS_ANDRO[29], tisane:_tAT("tes tisanes restent ton soutien de fond au-delà des 30 jours, selon tes besoins.")},
].map((d,i)=>({...d,day:i+1}));

const MISSIONS_SURRENALIEN = [
  {day:1,emoji:"🌬️",theme:"ton moteur, c'est le stress",
mission:"ce soir, avant de dormir : 3 minutes de respiration lente — 5 secondes j'inspire, 5 secondes j'expire.",
msg:"ton SMOP n'est pas comme les autres.\n\nchez toi, c'est le stress qui tient la barre — le cortisol qui emballe tout.\n\naujourd'hui on commence par le seul bouton que tu peux presser tout de suite.",
pourquoi:"le stress chronique emballe ton axe du stress (l'axe HPA). ton cortisol reste haut en permanence. et ce cortisol fait deux dégâts : il aggrave ta résistance à l'insuline, et il pousse tes surrénales à fabriquer des androgènes (DHEA). résultat : des symptômes qui peuvent s'intensifier quand la vie serre.\n\nla respiration lente, elle, agit en sens inverse et en temps réel. en allongeant ton expiration, tu actives ton nerf vague — le frein de ton système nerveux. 3 minutes suffisent à envoyer à ton corps le signal : le danger est passé.\n\nce n'est pas « dans ta tête ». c'est de la biologie, et tu viens d'apprendre à l'utiliser.",
source:"le SMOP et le stress ont une relation bidirectionnelle — chacun aggrave l'autre (Pasquali et al., 1993, 2006).",
comment:["installe-toi au calme, assise ou allongée","inspire par le nez en comptant jusqu'à 5","expire doucement, par la bouche, en comptant jusqu'à 5","recommence pendant 3 minutes, sans forcer","si ton esprit part, reviens juste au souffle — c'est normal"],
pieges:["vouloir « bien faire » ajoute du stress — il n'y a rien à réussir, juste à respirer","attendre d'être détendue pour commencer : c'est l'inverse, on respire POUR se détendre","zapper parce que « ça paraît trop simple » — c'est justement sa force"],
plus:"garde ce souffle en réserve : dans un embouteillage, avant un appel qui t'angoisse, après une dispute. 3 respirations suffisent déjà à faire redescendre la pression.",
observes:["ce soir : un endormissement un peu plus facile","dans quelques jours : tu y penses toute seule dans les moments tendus","dans 2 semaines : ton corps redescend plus vite après un pic de stress"],
victoire:"tu viens de comprendre que ton SMOP parle le langage du stress — et tu as déjà un outil pour lui répondre.",
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"avant tout le reste, on prépare ton foie — c'est lui qui élimine l'excès d'androgènes. la Cure Détox commence aujourd'hui, une tasse à jeun."}},

  {day:2,emoji:"☀️",theme:"la lumière du matin",
mission:"dès le réveil, 5 à 10 minutes de lumière du jour (à la fenêtre ou dehors) — avant de toucher ton téléphone.",
msg:"ton cortisol a un rythme.\n\nhaut le matin pour te lever, bas le soir pour t'endormir.\n\nchez toi il est souvent à l'envers. aujourd'hui on le remet à l'endroit.",
pourquoi:"ton cortisol est censé faire un pic le matin (il te réveille) puis redescendre toute la journée jusqu'au creux du soir (il te laisse dormir). dans le profil surrénalien, ce rythme est déréglé : tu es épuisée au réveil et « speed » le soir.\n\nla lumière du jour reçue tôt le matin, dans les yeux, est le signal le plus puissant pour recaler cette horloge. elle dit à ton cerveau : c'est le matin, le pic de cortisol c'est maintenant — pas à 22h.\n\ngratuit, rapide, et c'est l'un des leviers les plus sous-estimés de ton profil.",
comment:["en te levant, ouvre grand les rideaux ou va à la fenêtre","mieux encore : sors sur le pas de la porte ou le balcon","laisse la lumière entrer dans tes yeux (sans fixer le soleil)","profites-en pour boire ton verre d'eau ou respirer","garde le téléphone pour plus tard — la lumière d'abord"],
pieges:["les lunettes de soleil annulent une partie du signal — pas au réveil","rester derrière une vitre teintée réduit l'effet — ouvre si tu peux","un jour gris compte quand même : la lumière extérieure reste bien plus forte qu'une ampoule"],
plus:"le soir, fais l'inverse : baisse les lumières après le dîner. lumière forte le matin, lumière douce le soir — c'est ça qui rééduque ton horloge du cortisol.",
observes:["dès cette semaine : un réveil un peu moins « dans le brouillard »","dans quelques jours : un coup de barre de fin de journée plus net (bon signe, le rythme se recale)","dans 2 semaines : un endormissement plus naturel le soir"],
victoire:"tu utilises la lumière comme un médicament — sans ordonnance et sans effet secondaire."},

  {day:3,emoji:"☕",theme:"la caféine qui te trahit",
mission:"aujourd'hui : pas de café avant d'avoir mangé, et aucun café après 14h.",
msg:"le café, c'est ta béquille.\n\nmais pour ton profil, c'est aussi un piège.\n\naujourd'hui on ne te l'enlève pas — on le déplace.",
pourquoi:"la caféine fait monter le cortisol. quand tu la bois à jeun, sur un cortisol déjà trop haut le matin, tu empiles le stress sur le stress. et après 14h, elle reste assez longtemps dans ton corps pour saboter le sommeil dont tes surrénales ont besoin pour récupérer.\n\ntu tiens la journée au café, tu dors mal, tu es épuisée le lendemain, donc tu reprends du café : c'est une roue qui tourne. on ne la casse pas en supprimant tout d'un coup — on la casse en replaçant le café au bon moment.\n\naprès un vrai petit-déjeuner, un café fait beaucoup moins de dégâts.",
comment:["mange d'abord — même quelques bouchées de protéines","prends ton café après, pas à jeun","fixe-toi une heure limite : rien après 14h","l'après-midi, remplace par une tisane ou un déca","observe ton sommeil ce soir"],
pieges:["couper le café d'un coup = mal de tête et craquage — on déplace, on ne supprime pas","le thé et les sodas contiennent aussi de la caféine — compte-les","« un petit café à 16h ne compte pas » — chez toi, si"],
plus:"si tu es très sensible, même 14h peut être trop tard. teste : recule l'heure limite jusqu'à ce que tes nuits changent. ton corps te dira où est ta vraie limite.",
observes:["ce soir : un endormissement un peu plus facile","dans quelques jours : moins de ce « faux plat » anxieux de milieu de matinée","dans 2 semaines : moins besoin de café pour démarrer"],
victoire:"tu reprends la main sur ta béquille au lieu de la subir."},

  {day:4,emoji:"🍳",theme:"ne jamais partir le ventre vide",
mission:"un petit-déjeuner avec des protéines, dans l'heure qui suit ton réveil.",
msg:"sauter le petit-déj te paraît « sain ».\n\npour tes surrénales, c'est un stress de plus.\n\naujourd'hui on les rassure.",
pourquoi:"partir le ventre vide, ou tenir au seul café, c'est envoyer à ton corps un signal de manque — donc de stress. tes surrénales répondent en montant encore le cortisol. exactement ce qu'on veut éviter.\n\nun petit-déjeuner protéiné fait l'inverse : il stabilise ta glycémie sur plusieurs heures et dit à ton corps « il y a des ressources, tu peux te détendre ». la résistance à l'insuline étant présente même chez les femmes minces, ce petit-déj te protège sur deux fronts à la fois.\n\nmanger le matin n'est pas un détail pour toi — c'est un message de sécurité envoyé à tes surrénales.",
source:"la résistance à l'insuline est présente chez la majorité des femmes SMOP, même celles qui ne sont pas en surpoids (Diamanti-Kandarakis & Dunaif, 2012, Endocrine Reviews).",
comment:["vise 20 à 30g de protéines : œufs, skyr, fromage blanc, oléagineux","ajoute un gras : avocat, beurre, graines","évite d'ouvrir ta journée sur du sucre rapide (jus, viennoiserie)","si tu n'as pas faim : commence petit, mais salé et protéiné","garde le café pour après la première bouchée"],
pieges:["« je n'ai jamais faim le matin » : commence par très peu, le corps réapprend","le granola/les céréales sont souvent très sucrés — lis les étiquettes","le jeûne intermittent peut aggraver un profil surrénalien — on ne force pas le ventre vide ici"],
plus:"si vraiment rien ne passe le matin, prépare un premier repas protéiné pour dès que la faim arrive. l'important : ne jamais enchaîner réveil + café + stress sans ressources.",
observes:["ce matin : note ton énergie à 11h","dans quelques jours : moins de fringale et de coup de barre en fin de matinée","dans 2 semaines : une humeur plus stable le matin"],
victoire:"tu arrêtes de demander à ton corps de fonctionner à vide — et il te le rend."},

  {day:5,emoji:"🌙",theme:"le réveil de 3h",
mission:"ce soir : pas d'écran 30 minutes avant le lit, et ta chambre la plus sombre possible.",
msg:"ce réveil à 3h du matin, le cœur qui bat, impossible de te rendormir.\n\nce n'est pas « rien ».\n\nc'est ton cortisol. et on peut agir dessus.",
pourquoi:"le réveil nocturne entre 2h et 4h est une signature du profil surrénalien : un pic de cortisol qui arrive quand il devrait être au plus bas. la lumière des écrans le soir entretient ce dérèglement — elle retarde ton horloge interne et maintient ton système nerveux en alerte.\n\ncouper les écrans et plonger ta chambre dans le noir envoie le signal inverse : la nuit est là, le cortisol peut descendre, la mélatonine peut monter. tu protèges activement la fenêtre où tes surrénales récupèrent.\n\nchaque nuit mieux dormie réduit ta résistance à l'insuline du lendemain. le sommeil, pour toi, c'est du soin.",
comment:["coupe les écrans 30 min avant le lit (ou mets-les en mode nuit si tu ne peux pas)","baisse les lumières de la maison après le dîner","chambre la plus sombre possible : volets, rideaux, masque si besoin","garde la chambre fraîche","si tu te réveilles la nuit : respire 5s/5s plutôt que d'attraper le téléphone"],
pieges:["« je m'endors avec mon téléphone » : c'est souvent lui qui fragmente ta nuit","regarder l'heure en te réveillant relance l'anxiété — ne la regarde pas","forcer le rendormissement augmente le stress — respire, laisse venir"],
plus:"si le réveil de 3h persiste, note l'heure exacte quelques jours. un réveil très régulier est une info précieuse à montrer à ton médecin.",
observes:["cette nuit : un endormissement un peu plus doux","dans quelques jours : des réveils nocturnes moins « électriques »","dans 2 semaines : des nuits plus continues"],
victoire:"tu arrêtes de subir tes nuits — tu commences à les protéger."},

  {day:6,emoji:"🧾",theme:"ton rythme de stress",
mission:"note une seule chose aujourd'hui : à quel moment de la journée tu te sens le plus « à bout » ?",
msg:"ton stress n'est pas un brouillard permanent.\n\nil a un rythme, des heures, des déclencheurs.\n\naujourd'hui on commence à le cartographier.",
pourquoi:"quand on est épuisée, on a l'impression d'être stressée « tout le temps ». mais en observant, tu verras presque toujours apparaître des moments précis : le rush du matin, le creux de 16h, le moment où tout retombe sur toi le soir.\n\nconnaître ces moments, c'est pouvoir poser tes pauses AVANT le pic, pas après — quand il est déjà trop tard. tu passes de « je subis » à « je vois venir ».\n\net ce rythme est aussi une donnée que ton médecin ne te demandera peut-être jamais, mais qui en dit long sur ton axe du stress.",
comment:["garde une note ouverte sur ton téléphone","repère le moment où tu te sens le plus tendue, vidée, ou « à bout »","note l'heure et le contexte (qui, quoi, où)","ne cherche pas à changer quoi que ce soit aujourd'hui","observe, c'est tout"],
pieges:["te juger pour ton stress fausse l'observation — tu collectes, tu ne te punis pas","vouloir déjà tout résoudre — aujourd'hui on regarde seulement","oublier que la fatigue est aussi un signal de stress — compte-la"],
plus:"refais ce repérage quelques jours : si le même créneau revient, tu tiens ton moment-clé. c'est là qu'on posera une micro-pause (on y viendra).",
observes:["aujourd'hui : tu vois ton rythme pour la première fois","dans quelques jours : tu anticipes les moments à risque","dans 2 semaines : tu poses des pauses en amont"],
victoire:"tu transformes un stress « flou et permanent » en quelque chose de concret, donc d'agissable."},

  {day:7,emoji:"🤍",theme:"tu n'es pas faible",
mission:"aujourd'hui, 10 minutes rien que pour toi, sans culpabiliser. c'est un soin, pas un luxe.",
msg:"tu crois que te reposer, c'est être paresseuse.\n\npour ton corps en mode survie, c'est exactement l'inverse.\n\naujourd'hui, le repos est ta mission.",
pourquoi:"dans le profil surrénalien, ton corps vit en mode alerte depuis longtemps. il interprète chaque exigence de plus comme une menace, et répond par du cortisol. te reposer n'est pas un relâchement moral — c'est le geste qui fait redescendre ce cortisol.\n\nla culpabilité que tu ressens quand tu t'arrêtes, c'est justement le mode survie qui parle. lui obéir entretient le cercle. 10 minutes de vraie pause, c'est lui montrer qu'on peut s'arrêter sans danger.\n\nce n'est pas de la faiblesse. pour toi, c'est médical.",
comment:["choisis 10 minutes où tu ne « produis » rien","fais quelque chose qui t'apaise vraiment (pas scroller)","marche lente, thé, musique, t'allonger, regarder dehors","laisse la culpabilité passer sans la suivre","demain, on pose la fondation hormonale"],
pieges:["transformer la pause en tâche (« il faut que je me détende bien ») — lâche l'objectif","remplir les 10 min d'écran : ça occupe mais ça n'apaise pas le système nerveux","attendre d'avoir « mérité » le repos — tu n'as rien à mériter"],
plus:"si 10 minutes te paraissent impossibles à trouver, c'est le signal le plus clair que ton profil en a besoin. commence par 3 minutes. la régularité compte plus que la durée.",
observes:["aujourd'hui : un peu de culpabilité, puis du soulagement","dans quelques jours : tu t'autorises la pause plus facilement","dans 2 semaines : le repos devient un réflexe, pas une négociation"],
victoire:"tu commences à traiter ton repos comme un soin — parce que, pour toi, c'en est un.",
tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"dernier jour de Détox en solo. demain on ajoute l'Équilibre Féminin, la fondation de tous les profils."}},

  {day:8,emoji:"🌸",theme:"la fondation",
mission:"à partir d'aujourd'hui, ajoute l'Équilibre Féminin en milieu de journée (tu gardes la Détox le matin).",
msg:"ta semaine 1 a calmé le terrain.\n\nmaintenant on pose la base.\n\nl'Équilibre Féminin, c'est la fondation de tous les profils — y compris le tien.",
pourquoi:"la Cure Détox a préparé ton foie, qui élimine l'excès d'androgènes et produit la SHBG. place maintenant à la fondation.\n\nl'Équilibre Féminin agit sur plusieurs axes à la fois : cycle, glycémie, androgènes, système nerveux. pour ton profil, une plante compte particulièrement : la mélisse, un adaptogène doux qui aide à réguler l'axe stress-cortisol-hormones et améliore le sommeil. c'est souvent la première plante que les Cysters ressentent.\n\nla Détox a nettoyé le terrain, l'Équilibre Féminin pose les fondations. sans fondation, les murs ne tiennent pas.",
comment:["garde la Cure Détox le matin à jeun","ajoute l'Équilibre Féminin en milieu de journée","infuse 8 à 10 minutes, bois tranquillement","fais-en un petit rendez-vous avec toi-même","demain on continue à préparer l'arrivée de ta tisane de profil"],
pieges:["tout empiler d'un coup : on ajoute une tisane à la fois, en douceur","attendre un effet « choc » dès le premier jour — les plantes travaillent en profondeur","oublier une prise : la régularité fait tout l'effet"],
plus:"si tu es sous traitement hormonal, thyroïdien, ou si tu es enceinte / tu allaites, demande à ton médecin avant de commencer une tisane. certaines plantes ont des interactions réelles.",
observes:["cette semaine : digestion plus fluide, moins de gonflements","dans 2 à 3 semaines : premiers signes sur le sommeil et l'humeur","dans 6 à 8 semaines : effets hormonaux plus profonds"],
victoire:"ta fondation est posée — tout ce qu'on ajoute maintenant va pouvoir tenir.",
tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/equilibre-feminin",texte:"la fondation de ton protocole. sa mélisse apaise justement ton axe du stress. elle rejoint la Détox du matin."}},

  {day:9,emoji:"🧲",theme:"le magnésium, ton minéral anti-stress",
mission:"ajoute une vraie source de magnésium aujourd'hui : amandes, chocolat noir 70%+, légumes verts, ou une eau riche en magnésium.",
msg:"le stress te vide de ton magnésium.\n\net le manque de magnésium te rend plus sensible au stress.\n\naujourd'hui on casse ce cercle par l'assiette.",
pourquoi:"le stress chronique fait fuir le magnésium : plus tu es stressée, plus tu en élimines. or le magnésium est le minéral qui aide ton système nerveux à se calmer et ton sommeil à se poser. moins tu en as, plus tu es réactive au stress. et c'est reparti.\n\nles femmes SMOP sont souvent en déficit silencieux de magnésium. le ramener par l'alimentation, c'est redonner à ton système nerveux un de ses outils de base pour redescendre.\n\nce n'est pas magique, mais c'est un socle : sur un corps carencé, tout le reste coûte plus cher.",
comment:["une poignée d'amandes ou de noix dans la journée","2 carrés de chocolat noir 70%+ (oui, autorisé)","des légumes verts : épinards, blettes, brocoli","éventuellement une eau minérale riche en magnésium","répartis sur la journée plutôt qu'en une fois"],
pieges:["compter sur le chocolat au lait : trop de sucre, trop peu de magnésium","un seul aliment une fois ne suffit pas — c'est la régularité qui recharge","se supplémenter au hasard : si tu veux un complément, demande la forme et la dose à ton médecin"],
plus:"le magnésium bisglycinate le soir est souvent bien toléré et aide au sommeil, mais parles-en à ton médecin ou ton pharmacien avant — surtout si tu prends d'autres traitements.",
observes:["cette semaine : un sommeil un peu plus profond","dans quelques jours : moins de tension musculaire, moins de paupière qui saute","dans 2 semaines : une résistance au stress un peu meilleure"],
victoire:"tu recharges un socle que le stress te vidait en silence."},

  {day:10,emoji:"🌙",theme:"ta tisane du soir arrive",
mission:"ce soir, ta première Serenitea — 30 à 45 minutes avant le coucher. téléphone posé, assise, tu sens la vapeur. c'est ton rituel.",
msg:"voici ta tisane à toi.\n\ncelle qui vise ton levier prioritaire : le stress et le sommeil.\n\nmais elle ne marchera que si tu lui fais une vraie place.",
pourquoi:"Serenitea est la tisane de ton profil. elle agit sur le levier stress-sommeil, l'un de ceux qui comptent le plus pour toi : l'ashwagandha a montré dans des méta-analyses une réduction du cortisol ; la passiflore agit sur les récepteurs GABA pour apaiser le système nerveux ; le coquelicot aide à réduire l'agitation nocturne et le réveil de 3h.\n\nmais une tisane du soir n'est pas qu'une infusion : c'est un rituel. t'asseoir, poser le téléphone, sentir la chaleur — ce geste répété dit chaque soir à ton corps que la journée est finie. c'est le rituel autant que les plantes qui rééduque ton cortisol du soir.\n\ntu ne « bois » pas Serenitea. tu reviens à toi.",
comment:["prépare-la 30 à 45 min avant le coucher","assieds-toi vraiment, pose le téléphone loin","sens la vapeur, respire avant la première gorgée","bois-la lentement, lumières baissées","fais-en ton signal « la journée est finie »"],
pieges:["la boire devant un écran annule la moitié du bénéfice — c'est un sas, pas un geste de plus","attendre un effet « somnifère » : elle apaise en profondeur, progressivement, sans t'assommer","sauter des soirs : la régularité du rituel compte autant que les plantes"],
plus:"si tu prends des anxiolytiques, des sédatifs, un traitement thyroïdien, ou si tu es enceinte / tu allaites : demande à ton médecin avant Serenitea (l'ashwagandha notamment peut interagir).",
observes:["dès cette semaine : un endormissement plus rapide","dans quelques jours : moins de réveils nocturnes","progressivement : un SMOP moins réactif au stress"],
victoire:"tu tiens enfin une tisane pensée pour TON mécanisme — et un rituel qui la fait vraiment travailler.",
tisane:{nom:"Serenitea",timing:"le soir, au coucher",lien:"https://sopklife.com/products/serenitea",texte:"ta tisane de profil. 30 à 45 min avant le lit, en rituel : téléphone posé, lumières baissées. elle rejoint la Détox (matin) et l'Équilibre Féminin (midi)."}},

  {day:11,emoji:"🚶‍♀️",theme:"bouger sans te vider",
mission:"aujourd'hui, du mouvement DOUX : marche, yoga, étirements. pas de HIIT, pas de sport intense à jeun.",
msg:"on t'a dit « bouge plus, transpire, pousse ».\n\npour ton profil, le sport violent peut faire empirer les choses.\n\naujourd'hui, moins fort = plus efficace.",
pourquoi:"le sport intense, surtout à jeun, est un stress pour le corps : il fait monter le cortisol. pour la plupart des gens ce n'est pas un problème — mais toi, ton cortisol est déjà trop haut. tu ajoutes du stress sur du stress, et ton SMOP ne s'améliore pas, voire se braque.\n\nle mouvement doux fait l'inverse : marche, yoga, étirements abaissent le cortisol et activent ton système nerveux parasympathique (le frein). tu gagnes sans fouetter tes surrénales.\n\nce n'est pas « se ménager ». c'est choisir l'effort que ton corps peut transformer en mieux-être au lieu d'en alarme.",
comment:["privilégie la marche, surtout après les repas","yoga doux, pilates, étirements : parfaits pour toi","si tu veux de l'intensité, fais-la courte et jamais à jeun","écoute le signal : vidée après le sport = trop intense","régularité douce plutôt que séances épuisantes"],
pieges:["croire que « si je ne transpire pas, ça ne compte pas » — faux pour ton profil","le sport à jeun le matin : à éviter, c'est un double stress","s'épuiser pour « mériter » : tu refouettes tes surrénales"],
plus:"une marche de 10 à 15 minutes après le repas fait d'une pierre deux coups : elle abaisse ton cortisol ET lisse ta glycémie post-repas. l'exercice parfait pour ton profil.",
observes:["après la séance : apaisée plutôt que vidée","dans quelques jours : une énergie plus stable","dans 2 semaines : l'envie de bouger revient, sans la contrainte"],
victoire:"tu arrêtes de punir ton corps au nom de la santé — et tu choisis l'effort qui te répare."},

  {day:12,emoji:"🍬",theme:"le sucre qui calme, puis qui lâche",
mission:"repère un moment où tu manges du sucre « pour tenir ». une fois aujourd'hui, remplace-le par une poignée d'amandes + un carré de chocolat noir.",
msg:"le sucre, dans un moment de stress, ça soulage.\n\n20 minutes plus tard, tu replonges.\n\naujourd'hui on comprend pourquoi — et on fait autrement, une fois.",
pourquoi:"sous stress, le cortisol te pousse vers le sucre rapide : il promet de l'énergie immédiate. tu en prends, tu te sens mieux 20 minutes… puis ta glycémie chute, et cette chute est un stress de plus pour tes surrénales. qui réclament encore du sucre. la roue tourne.\n\nassocier des protéines et du gras (amandes + chocolat noir) ralentit l'arrivée du sucre dans le sang. le pic est lissé, la chute est douce, et tes surrénales ne sont pas rappelées à la rescousse.\n\ntu ne te prives pas. tu transformes un sucre qui te fouette en une collation qui te porte.",
comment:["repère ton moment « sucre pour tenir » (souvent 16-17h)","une fois, remplace-le : poignée d'amandes + 1-2 carrés de chocolat noir","mange-le assise, tranquillement","observe comment tu te sens 1h après","compare avec un jour où tu avais pris du sucre seul"],
pieges:["se l'interdire totalement : la frustration relance le craquage — on remplace, on n'interdit pas","le « sans sucre » bourré d'édulcorants n'est pas la solution","oublier le gras/protéine : c'est lui qui change tout, pas juste « moins de sucre »"],
plus:"les jours vraiment durs, garde un petit stock d'amandes dans ton sac. avoir la bonne option sous la main au moment du creux, c'est 80% du travail.",
observes:["1h après : pas de contrecoup, pas de rechute","dans quelques jours : les fringales de fin d'après-midi s'espacent","dans 2 semaines : moins d'attirance automatique vers le sucre"],
victoire:"tu désamorces un cercle que tu croyais être « un manque de volonté » — et qui n'était que de la biologie."},

  {day:13,emoji:"🛑",theme:"la charge mentale",
mission:"dis « non » à une seule chose aujourd'hui. une demande, une tâche, une sollicitation de trop.",
msg:"tu portes beaucoup. trop, souvent.\n\npour ton profil, cette charge mentale n'est pas qu'un ressenti.\n\nc'est un facteur hormonal. et dire non, c'est un soin.",
pourquoi:"chaque « oui » de trop, chaque tâche que tu ajoutes à une journée déjà pleine, maintient ton système en alerte — donc ton cortisol haut. dans le profil surrénalien, la charge mentale agit directement sur ton moteur hormonal. ce n'est pas « juste du stress » : c'est une des entrées du cercle.\n\ndire non à une chose, c'est retirer une bûche du feu. ce n'est pas de l'égoïsme ni de la fragilité — c'est reconnaître que ton corps a une limite réelle, biologique, et la respecter.\n\ntu n'es pas obligée de tout porter pour avoir le droit de te sentir bien.",
comment:["repère une sollicitation de trop aujourd'hui","dis non, sans te justifier longuement","« je ne peux pas cette fois » suffit","observe ce que tu ressens après (souvent soulagement + un peu de culpabilité)","laisse la culpabilité passer : elle ne veut pas dire que tu as mal fait"],
pieges:["sur-expliquer ton refus : plus tu te justifies, plus tu t'excuses d'exister","dire non puis culpabiliser toute la journée : la culpabilité est le mode survie qui proteste","croire qu'un seul non va tout régler — c'est un entraînement, pas un interrupteur"],
plus:"avant de dire oui à quelque chose, pose-toi une seconde : « est-ce que je dis oui par envie, ou par peur de décevoir ? » cette micro-pause change beaucoup de réponses.",
observes:["aujourd'hui : un soulagement, même teinté de culpabilité","dans quelques jours : dire non devient un peu moins coûteux","dans 2 semaines : tu protèges ton énergie sans drame"],
victoire:"tu traites ta charge mentale comme ce qu'elle est pour toi — un facteur hormonal, pas un défaut de caractère."},

  {day:14,emoji:"🧾",theme:"bilan de ta semaine 2",
mission:"fais le point sur tes nuits depuis la Serenitea : endormissement, réveils nocturnes. note ce que tu observes.",
msg:"deux semaines.\n\nle moment de regarder, sans juger, ce qui bouge.\n\net chez toi, le premier endroit où ça se voit, c'est la nuit.",
pourquoi:"le sommeil est ton marqueur de progrès numéro un. avant les analyses, avant la peau, avant le poids, c'est lui qui bouge en premier dans le profil surrénalien. s'il s'améliore, c'est le signe que ton cortisol du soir redescend — donc que ton terrain change.\n\nfaire ce bilan n'est pas un contrôle : c'est t'offrir la preuve que ton corps répond. sous stress chronique, le cerveau efface les progrès et ne retient que ce qui ne va pas. écrire ce qui s'améliore, c'est corriger ce biais.\n\net ces observations sur ton sommeil sont une mine d'or pour ton médecin.",
comment:["compare : t'endors-tu plus vite qu'il y a 2 semaines ?","les réveils nocturnes sont-ils moins fréquents, moins intenses ?","le réveil de 3h a-t-il changé ?","note aussi ton énergie au réveil","garde ces notes, elles serviront au J29 et pour ton médecin"],
pieges:["vouloir un sommeil « parfait » en 2 semaines : on cherche une direction, pas la perfection","ne regarder que ce qui cloche encore — note aussi ce qui va mieux","oublier qu'une mauvaise nuit isolée ne casse pas la tendance"],
plus:"si tes nuits n'ont pas bougé du tout, ce n'est pas un échec : le sommeil met parfois plus de temps. vérifie d'abord les bases (écrans, caféine après 14h, chambre sombre) avant de t'inquiéter.",
observes:["aujourd'hui : tu mesures, donc tu vois le chemin","dans quelques jours : tu ajustes ce qui coince","à la fin du mois : une tendance claire"],
victoire:"tu commences à lire ton sommeil comme un tableau de bord — pas comme une fatalité."},

  {day:15,emoji:"🩸",theme:"tes analyses surrénaliennes",
mission:"note les marqueurs à demander à ton médecin : cortisol (le matin), DHEA-S, 17-OHP.",
msg:"tu as le droit de comprendre tes propres chiffres.\n\nces marqueurs-là orientent vers ta piste à toi.\n\naujourd'hui, tu prépares de quoi reprendre la main sur ton suivi.",
pourquoi:"trois marqueurs aident à explorer la piste surrénalienne : le cortisol (idéalement dosé le matin, au pic), la DHEA-S (un androgène fabriqué par les surrénales), et la 17-OHP (pour écarter d'autres causes).\n\nmais attention, et c'est important : ces chiffres orientent, ils ne font pas un diagnostic à eux seuls. un taux doit toujours être lu par ton médecin, en fonction de ton âge et de l'ensemble de ton tableau. une DHEA-S un peu élevée chez une femme jeune n'a pas la même signification qu'ailleurs.\n\ndemander ces dosages, ce n'est pas jouer au médecin — c'est arriver en rendez-vous avec les bonnes questions.",
comment:["écris les 3 marqueurs : cortisol matinal, DHEA-S, 17-OHP","prévois de les demander à ton prochain rendez-vous","si tu as déjà des résultats, ne les interprète pas seule","note tes symptômes à côté (stress, sommeil, réveils) pour ton médecin","garde tout au même endroit pour le J22"],
pieges:["interpréter tes résultats toute seule sur internet : anxiété garantie, et souvent à tort","croire qu'un chiffre « normal » invalide ton ressenti — le vécu compte aussi","oublier que l'heure du prélèvement change tout pour le cortisol"],
plus:"le cortisol varie fortement dans la journée : un dosage le matin n'a pas la même valeur qu'en fin de journée. si ton médecin explore cette piste, l'heure du prélèvement est essentielle — note-la.",
observes:["aujourd'hui : tu sais quoi demander","à ton rendez-vous : une consultation plus précise","ensuite : un suivi qui tient compte de ton profil"],
victoire:"tu passes de patiente qui subit à Cyster qui arrive avec les bonnes questions."},

  {day:16,emoji:"💓",theme:"la cohérence cardiaque",
mission:"aujourd'hui, 5 minutes de cohérence cardiaque : respiration 5s/5s (ou une appli gratuite qui te guide).",
msg:"au J1 tu as appris à respirer dans l'urgence.\n\naujourd'hui on en fait un entraînement.\n\nparce que le calme, ça se muscle.",
pourquoi:"la cohérence cardiaque, c'est ta respiration du J1 pratiquée régulièrement et guidée. en respirant à ce rythme lent et régulier, tu synchronises ton cœur et ta respiration, et tu actives ton système nerveux parasympathique — le frein.\n\nfait une fois, ça apaise sur le moment. fait régulièrement, ça rééduque ton système nerveux à redescendre plus vite après chaque pic. c'est un entraînement : plus tu le pratiques, plus ton corps récupère tôt.\n\npour un profil piloté par le cortisol, c'est l'un des outils les mieux documentés et les plus accessibles.",
comment:["5 minutes, assise, le dos droit","inspire 5 secondes, expire 5 secondes","aide-toi d'une appli gratuite qui donne le rythme si besoin","idéalement le matin et/ou en fin d'après-midi","fais-en un rendez-vous quotidien, pas un geste au hasard"],
pieges:["attendre d'être stressée pour pratiquer : l'effet vient de la régularité, pas de l'urgence","juger ta « performance » : il n'y a rien à réussir","abandonner après 2 jours — c'est comme le sport, l'effet se construit"],
plus:"le meilleur moment pour toi : juste avant le créneau où tu te sens le plus « à bout » (celui repéré au J6). tu désamorces le pic avant qu'il arrive.",
observes:["dès la première fois : un calme un peu plus net après","dans quelques jours : tu redescends plus vite dans la journée","dans 2 semaines : une base anxieuse plus basse"],
victoire:"tu muscles ton frein intérieur — et il répond de mieux en mieux."},

  {day:17,emoji:"✨",theme:"ta peau, tes cheveux sous cortisol",
mission:"observe, sans juger : ton acné ou ta chute de cheveux empirent-elles dans tes semaines les plus stressées ?",
msg:"tu croyais que ta peau et tes hormones, c'était une chose, et ton stress, une autre.\n\nchez toi, c'est le même fil.\n\naujourd'hui on relie les points.",
pourquoi:"dans ton profil, le cortisol élevé pousse tes surrénales à produire des androgènes (DHEA). et ce sont les androgènes qui alimentent l'acné hormonale, la pilosité, la chute de cheveux. autrement dit : chez toi, une poussée de stress peut se lire sur ta peau quelques jours plus tard.\n\nc'est une bonne nouvelle, même si ça n'en a pas l'air : ça veut dire que gérer ton stress EST un soin de peau et de cheveux. tout ce que tu fais depuis le J1 agit aussi là, en amont.\n\ntu ne traites pas ta peau « en plus ». tu la traites en calmant ton moteur.",
comment:["repense à tes dernières poussées d'acné : quel était le contexte avant ?","même chose pour la chute de cheveux","note si tu vois un lien avec tes semaines stressées","ne culpabilise pas si tu vois le lien — tu viens de trouver un levier","continue tes gestes anti-stress, c'est déjà un soin de peau"],
pieges:["chercher à « tout contrôler » dès demain : le lien stress-peau a un décalage de plusieurs jours","croire que la peau va changer en une semaine : les cycles cutanés sont longs (4 à 8 semaines)","oublier qu'une routine de peau douce reste utile en parallèle"],
plus:"si l'hyperandrogénie est très marquée, ta tisane Andro Tea peut compléter Serenitea plus tard — mais une chose à la fois : on stabilise d'abord ton axe du stress, qui est ta porte d'entrée.",
observes:["aujourd'hui : tu relies stress et peau pour la première fois","dans quelques semaines : moins de poussées « inexpliquées »","à moyen terme : une peau qui suit l'apaisement de ton terrain"],
victoire:"tu comprends que calmer ton stress, c'est aussi soigner ta peau — deux combats qui n'en font qu'un."},

  {day:18,emoji:"🕯️",theme:"ancrer le rituel du soir",
mission:"ce soir, transforme ta Serenitea en vrai sas : même heure, lumière tamisée, zéro écran pendant que tu la bois.",
msg:"la Serenitea, tu la bois depuis une semaine.\n\nmaintenant on en fait un repère fixe.\n\nparce que la régularité, c'est elle qui rééduque ton horloge.",
pourquoi:"ton cortisol répond au rythme, à la régularité. un rituel du soir fait à heure variable, entre deux écrans, perd l'essentiel de son effet. fait chaque soir à la même heure, dans les mêmes conditions, il devient un signal puissant : ton corps apprend qu'à cette heure-là, on redescend.\n\nla tisane apporte ses plantes, mais c'est le cadre régulier autour qui rééduque ton horloge du cortisol. le rituel vaut autant que l'infusion.\n\nun même geste, répété, devient un repère pour ton système nerveux.",
comment:["choisis une heure fixe pour ta Serenitea","baisse les lumières avant de la préparer","range le téléphone hors de portée","assieds-toi au même endroit si possible","fais-en le signal officiel de fin de journée"],
pieges:["décaler l'heure chaque soir : tu perds l'effet « repère »","la boire en faisant autre chose : ce n'est plus un sas","sauter les soirs « chargés » — ce sont justement ceux où tu en as le plus besoin"],
plus:"ajoute un petit geste sensoriel toujours identique (une bougie, une musique douce, une couverture). ton cerveau associera ce geste au calme, et le calme viendra plus vite.",
observes:["cette semaine : tu t'endors dans un état plus apaisé","dans quelques jours : l'envie d'écran du soir diminue","dans 2 semaines : ton corps « sait » que le soir, on ralentit"],
victoire:"tu transformes une tisane en ancre — un repère fixe qui apprend à ton corps à lâcher."},

  {day:19,emoji:"📵",theme:"la frontière digitale",
mission:"ce soir, mets ton téléphone en charge HORS de la chambre.",
msg:"ton téléphone dort à côté de toi.\n\nc'est peut-être lui qui fragmente tes nuits.\n\nce soir, on l'éloigne.",
pourquoi:"la lumière et les notifications du soir maintiennent ton système nerveux en alerte et retardent la chute du cortisol. et le téléphone à portée de main, c'est la tentation de scroller au moindre réveil nocturne — ce qui réveille complètement ton cerveau au pire moment.\n\nle sortir de la chambre coupe les deux : plus de lumière bleue tardive, plus de scroll à 3h. tu protèges activement la fenêtre où tes surrénales récupèrent.\n\nun petit déplacement d'objet, un grand effet sur ta nuit.",
comment:["mets le chargeur dans une autre pièce","si tu l'utilises comme réveil : prends un vrai réveil, ou pose-le loin du lit","active le mode nuit / ne pas déranger","si tu te réveilles : respire 5s/5s au lieu d'attraper l'écran","teste quelques nuits avant de juger"],
pieges:["« j'en ai besoin pour le réveil » : un réveil à 5€ règle le problème","le garder « juste au cas où » : le cas, c'est justement le scroll de 3h","retomber dessus dès le réveil le matin — garde aussi le matin protégé (J2)"],
plus:"si l'éloigner complètement te stresse, commence par le mettre de l'autre côté de la chambre, écran retourné, en mode avion. l'important : qu'il ne soit pas dans ta main au moindre réveil.",
observes:["cette nuit : des réveils moins « réveillants »","dans quelques jours : tu te rendors plus facilement","dans 2 semaines : des nuits plus continues"],
victoire:"tu reprends le contrôle de ta nuit sur un objet qui te la grignotait."},

  {day:20,emoji:"🌳",theme:"la nature baisse le cortisol",
mission:"aujourd'hui, 15 à 20 minutes dehors, idéalement dans du vert (parc, arbres, jardin).",
msg:"pas de performance.\n\npas de compteur de pas.\n\njuste être dehors, dans le vert. ton cortisol, lui, saura quoi en faire.",
pourquoi:"passer du temps dans la nature fait baisser le cortisol et la tension, de façon mesurable. ce n'est pas une impression « bien-être » : c'est un effet physiologique sur ton système nerveux. le vert, la lumière naturelle, le rythme plus lent — tout envoie à ton corps un signal de sécurité.\n\npour un profil surrénalien, c'est une des façons les plus simples et les plus agréables de faire redescendre la pression, sans effort et sans matériel.\n\ntu n'as rien à atteindre dehors. le simple fait d'y être travaille pour toi.",
comment:["trouve 15 à 20 minutes dehors aujourd'hui","privilégie un endroit avec de la verdure","marche lentement, ou assieds-toi, peu importe","laisse le téléphone dans la poche","remarque ce que tu entends, vois, sens — sans analyser"],
pieges:["en faire une « séance de sport » chronométrée : tu rajoutes de la pression","attendre un grand parc parfait : un square, des arbres de rue, un balcon vert comptent","scroller dehors : le corps est dehors, mais le système nerveux reste en alerte"],
plus:"couple-la avec ta marche après repas (J11) : dehors, dans le vert, après le déjeuner. tu empiles trois bénéfices — cortisol, glycémie, lumière — dans une seule balade.",
observes:["aujourd'hui : un apaisement après, parfois subtil","dans quelques jours : l'envie d'y retourner","dans 2 semaines : une respiration plus ample sans y penser"],
victoire:"tu découvres un anti-stress gratuit, dehors, qui ne te demande aucune performance."},

  {day:21,emoji:"🌤️",theme:"ce qui a déjà changé",
mission:"note une seule chose qui va mieux depuis le J1 : sommeil, énergie, anxiété, peau, nuits…",
msg:"trois semaines.\n\nton cerveau sous stress ne retient que ce qui cloche.\n\naujourd'hui, on l'oblige à voir ce qui a bougé.",
pourquoi:"le stress chronique rend ton cerveau « négatif » par défaut : il efface les progrès et garde en mémoire ce qui ne va pas encore. c'est un mécanisme de survie — utile face à un danger, épuisant au quotidien.\n\nécrire noir sur blanc une chose qui s'est améliorée, c'est contrer activement ce biais. tu réapprends à ton cerveau à enregistrer aussi le positif. et ça, en soi, fait baisser la charge mentale.\n\nce n'est pas de la pensée positive forcée. c'est rétablir une vision juste : oui, des choses ont changé.",
comment:["repense au J1 : tes nuits, ton énergie, ton anxiété d'alors","trouve UNE chose, même petite, qui va mieux aujourd'hui","écris-la","relis-la quand tu doutes","garde-la pour le bilan du J29"],
pieges:["répondre « rien » trop vite : cherche le détail (un endormissement, une pause prise sans culpabiliser)","minimiser (« oui mais c'est normal ») : non, c'est le fruit de ce que tu fais","comparer à une Cyster qui va « mieux » : ton rythme est le tien"],
plus:"prends l'habitude de noter une petite victoire chaque soir, en buvant ta Serenitea. en quelques semaines, tu auras une liste qui prouve, les jours de doute, que tu avances.",
observes:["aujourd'hui : un peu de fierté, souvent de la surprise","dans quelques jours : tu repères le positif plus spontanément","dans 2 semaines : une charge mentale un peu plus légère"],
victoire:"tu rééduques ton cerveau à voir ce qui va mieux — un anti-stress en soi."},

  {day:22,emoji:"👩‍⚕️",theme:"préparer ton rendez-vous",
mission:"prépare 3 questions pour ton médecin, dont celle-ci : « peut-on explorer la piste surrénalienne / le cortisol ? »",
msg:"ton profil est souvent le grand oublié des consultations.\n\nsurtout si tu es mince.\n\naujourd'hui, tu prépares de quoi être entendue.",
pourquoi:"le SMOP surrénalien passe souvent sous le radar : beaucoup de médecins cherchent surpoids + ovaires polykystiques, et ne pensent pas au cortisol — surtout chez une femme mince. du coup, tu peux repartir sans réponse alors que ta piste n'a pas été regardée.\n\narriver avec des questions précises change tout. tu guides la consultation vers ton tableau réel, tu montres que tu connais ton corps, et tu obtiens un suivi qui te correspond.\n\ntu n'as pas à « déranger » ton médecin avec tes questions. c'est exactement ton rôle, et le sien d'y répondre.",
comment:["écris 3 questions claires, courtes","inclus : « peut-on explorer la piste surrénalienne / doser le cortisol ? »","ajoute les marqueurs du J15 (cortisol matinal, DHEA-S, 17-OHP)","joins tes observations (sommeil, réveils de 3h, lien stress-symptômes)","garde le tout sur ton téléphone pour le jour J"],
pieges:["arriver sans rien préparer et « oublier » la moitié une fois sur place","te laisser décourager par « c'est juste du stress » — justement, demande à l'explorer","accepter un « c'est normal » sans que tes marqueurs aient été regardés"],
plus:"si tu sens que la piste n'est pas prise au sérieux, tu as le droit de demander un second avis, idéalement à un médecin sensibilisé au SMOP. ce n'est pas remettre en cause — c'est prendre soin de toi.",
observes:["au rendez-vous : une consultation plus précise, plus à ton écoute","ensuite : un suivi qui tient compte de ton profil","à terme : des décisions basées sur TON tableau, pas un modèle standard"],
victoire:"tu entres en consultation en actrice de ta santé — pas en simple patiente qui espère être entendue."},

  {day:23,emoji:"⏸️",theme:"les micro-pauses",
mission:"pose 2 micro-pauses de 2 minutes dans ta journée, avant le pic de stress que tu as repéré au J6.",
msg:"attendre d'être à bout pour souffler, c'est trop tard.\n\naujourd'hui, on désamorce avant.\n\ndeux minutes, deux fois. c'est tout.",
pourquoi:"rattraper un pic de cortisol une fois qu'il est au sommet coûte beaucoup d'énergie. le prévenir, juste avant, coûte deux minutes. c'est toute la différence entre subir ta journée et la piloter.\n\nen plaçant une micro-pause juste avant le moment où tu sais que tu craques (celui repéré au J6), tu empêches le pic de monter aussi haut. yeux fermés, trois respirations lentes, et ton système nerveux reste dans une zone gérable.\n\ntu n'as pas besoin de longues pauses. tu as besoin des bonnes, au bon moment.",
comment:["repère ton créneau « à bout » (J6)","programme 2 pauses de 2 min AVANT ce créneau","ferme les yeux, respire lentement (5s/5s)","pas de téléphone pendant la pause","reviens ensuite à ta journée"],
pieges:["attendre d'être débordée pour la prendre : trop tard, le pic est là","juger que « 2 minutes ne servent à rien » : testées au bon moment, elles changent la courbe","les transformer en pause téléphone : ça occupe, ça n'apaise pas"],
plus:"mets une alarme discrète aux deux horaires choisis, avec un mot doux en libellé (« souffle », « tu peux t'arrêter »). au début, le rappel aide ; ensuite, ça devient un réflexe.",
observes:["aujourd'hui : un pic de stress un peu moins haut","dans quelques jours : des fins de journée moins « explosées »","dans 2 semaines : tu anticipes au lieu de subir"],
victoire:"tu passes de « j'encaisse puis je craque » à « je désamorce avant » — un vrai changement de pilotage."},

  {day:24,emoji:"🎯",theme:"le perfectionnisme qui t'épuise",
mission:"aujourd'hui, fais UNE chose « assez bien » au lieu de parfaite. volontairement.",
msg:"tu mets la barre très haut.\n\npour les autres, c'est une qualité.\n\npour tes surrénales, c'est un cortisol qui ne redescend jamais.",
pourquoi:"le perfectionnisme maintient ton système en tension permanente : rien n'est jamais assez bien, donc l'alarme ne s'éteint jamais, donc le cortisol reste haut. dans le profil surrénalien, cette exigence constante est un carburant discret mais puissant de ton moteur.\n\nfaire volontairement une chose « assez bien » — l'envoyer sans la relire dix fois, laisser une tâche à 90% — c'est un entraînement. tu apprends à ton corps qu'on peut relâcher sans que le ciel tombe. et le ciel ne tombe pas.\n\nbaisser la barre une fois, ce n'est pas se négliger. c'est desserrer l'étau.",
comment:["choisis une tâche aujourd'hui que tu peux faire « assez bien »","fixe-toi une limite (temps, nombre de relectures) et tiens-la","livre / termine sans chercher la perfection","observe : le résultat est-il vraiment moins bon ? (souvent non)","remarque le soulagement"],
pieges:["choisir une tâche à vrai enjeu pour « tester » : commence par du sans conséquence","transformer « assez bien » en nouveau standard à atteindre parfaitement (ironie du perfectionnisme)","culpabiliser du relâchement : c'est l'ancien réflexe, laisse-le passer"],
plus:"demande-toi : « dans une semaine, est-ce que la différence entre parfait et assez-bien comptera ? » la plupart du temps, la réponse est non — et ton cortisol, lui, s'en souviendra.",
observes:["aujourd'hui : de l'inconfort, puis du soulagement","dans quelques jours : tu lâches plus facilement sur le non-essentiel","dans 2 semaines : une tension de fond plus basse"],
victoire:"tu identifies un carburant caché de ton stress — et tu apprends à le couper, un peu."},

  {day:25,emoji:"😴",theme:"ta nuit, priorité n°1",
mission:"fixe une heure de coucher et tiens-la ce soir (à 15 minutes près).",
msg:"on t'a vendu mille astuces santé.\n\npour ton profil, la plus puissante est la plus simple.\n\nune heure de coucher régulière.",
pourquoi:"pour le profil surrénalien, le sommeil n'est pas un bonus : c'est le cœur du traitement. et ce qui rééduque le mieux ton cortisol, ce n'est pas tant la durée que la RÉGULARITÉ — te coucher et te lever à des heures stables.\n\nun horaire de coucher régulier recale ton horloge interne, stabilise le pic matinal et le creux du soir de ton cortisol, et réduit les réveils nocturnes. c'est le levier le plus rentable de tout ton parcours.\n\ntout ce que tu as mis en place (écrans, Serenitea, chambre sombre, téléphone dehors) converge ici : vers une nuit qui, enfin, répare.",
comment:["choisis une heure de coucher réaliste","tiens-la ce soir à 15 min près","garde la même heure de lever, même le week-end si possible","enchaîne avec ton rituel Serenitea (J18)","note ton sommeil demain matin"],
pieges:["viser une heure trop ambitieuse d'un coup : recule par paliers de 15 min","« rattraper » le week-end en décalant tout : ça redérègle l'horloge","se coucher à heure fixe mais sur écran : garde les 30 min sans écran (J5)"],
plus:"la régularité de l'heure de LEVER compte encore plus que celle du coucher. un lever stable, lumière du matin incluse (J2), tire tout le reste dans le bon sens.",
observes:["cette semaine : un endormissement plus prévisible","dans quelques jours : un réveil moins pénible","dans 2 semaines : un rythme qui se cale presque tout seul"],
victoire:"tu fais de ton sommeil ce qu'il est pour toi — la pièce maîtresse, pas un détail.",
tisane:{nom:"Serenitea",timing:"le soir, au coucher",lien:"https://sopklife.com/products/serenitea",texte:"ta Serenitea prend tout son sens ce soir : une heure de coucher fixe + le rituel, c'est ce duo qui rééduque ton cortisol du soir."}},

  {day:26,emoji:"♻️",theme:"soutenir sans fouetter",
mission:"refais le point : café après 14h ? sport à jeun ? repas sautés ? corrige-en un aujourd'hui.",
msg:"les vieilles habitudes reviennent en douce.\n\nsans que tu t'en rendes compte, elles refouettent tes surrénales.\n\naujourd'hui, petit contrôle technique.",
pourquoi:"au fil des semaines chargées, les anciens réflexes reviennent : le café qui glisse vers 16h, le petit-déj sauté un matin pressé, la séance intense à jeun « pour compenser ». chacun, isolément, refouette tes surrénales et relance en silence le cercle du cortisol.\n\nfaire un point régulier, ce n'est pas se fliquer — c'est entretenir. tu repères l'habitude qui est revenue et tu la recorriges avant qu'elle ne s'installe. une à la fois suffit.\n\ntu as appris à soutenir tes surrénales. ici, tu vérifies simplement que tu ne les fouettes plus sans le voir.",
comment:["passe en revue : café après 14h ? sport à jeun ? repas sautés ? nuits raccourcies ?","repère celle qui est revenue en premier","corrige-en UNE aujourd'hui","note pourquoi elle était revenue (fatigue ? rush ? oubli ?)","prévois comment l'éviter la prochaine fois"],
pieges:["vouloir tout recorriger d'un coup : une habitude à la fois","te juger d'avoir « rechuté » : c'est normal, on entretient, on ne se punit pas","croire que c'est acquis « pour toujours » : ces réflexes reviennent, c'est humain"],
plus:"garde une petite liste de tes « fouets » personnels (ceux qui refont flamber TON cortisol). la relire une fois par semaine suffit à les tenir à distance.",
observes:["aujourd'hui : une habitude recorrigée, une pression en moins","dans quelques jours : tu repères les retours plus vite","à terme : un terrain qui reste stable malgré les semaines chargées"],
victoire:"tu apprends à entretenir ton équilibre, pas seulement à l'installer."},

  {day:27,emoji:"💬",theme:"bilan honnête",
mission:"réponds à deux questions : qu'est-ce qui a été le plus dur à tenir ? qu'est-ce qui est devenu naturel ?",
msg:"presque un mois.\n\npas de bilan tout rose, pas d'auto-flagellation.\n\njuste la vérité, qui est bien plus utile.",
pourquoi:"savoir ce qui a été le plus dur t'évite de te juger : si quelque chose résiste, ce n'est pas un défaut de volonté, c'est une info sur ce qui demande plus de temps ou un autre angle. et savoir ce qui est devenu naturel te montre, noir sur blanc, le chemin parcouru.\n\nun bilan honnête vaut mille résolutions. il te dit où mettre ton énergie ensuite, et il te rappelle que tu as déjà installé des choses qui, il y a un mois, te semblaient impossibles.\n\nla lucidité, ici, est une forme de douceur envers toi-même.",
comment:["note ce qui a été le plus difficile à tenir (et sans te juger)","note ce qui est devenu presque automatique","demande-toi pourquoi, pour chacun","garde le difficile pour plus tard, sans pression","célèbre ce qui est acquis"],
pieges:["ne voir que ce qui a coincé : regarde aussi ce qui est devenu naturel","te reprocher ce qui a été dur : la difficulté est une donnée, pas une faute","croire qu'un mois suffit à tout ancrer : certaines choses demandent plusieurs mois"],
plus:"ce qui a été le plus dur à tenir est souvent ce qui touche le plus à ton moteur (le perfectionnisme, dire non, lâcher le contrôle). ce n'est pas un hasard — et c'est là que les prochains mois travailleront.",
observes:["aujourd'hui : une vision claire, apaisée, de ton mois","dans quelques jours : tu sais où concentrer tes efforts","ensuite : tu avances sur du solide, pas sur de la culpabilité"],
victoire:"tu fais un bilan qui te sert vraiment — lucide et bienveillant à la fois."},

  {day:28,emoji:"🧰",theme:"ta boîte à outils anti-cortisol",
mission:"liste les 3 outils qui marchent le mieux pour TOI : respiration ? marche ? Serenitea ? dire non ? lumière du matin ?",
msg:"je t'ai donné beaucoup d'outils ce mois-ci.\n\ntu n'as pas besoin de tous les garder.\n\naujourd'hui, tu choisis les tiens.",
pourquoi:"à la fin de la Fondation, le but n'est pas que tu suives mes consignes à vie — c'est que tu reparts avec TES leviers à toi, ceux que tu as testés et qui marchent sur ton corps. c'est ça, l'autonomie.\n\ntrois outils bien ancrés valent mieux que dix à moitié suivis. en les nommant, tu te construis une boîte à outils personnelle, prête à sortir les jours où le stress revient — et il reviendra, c'est la vie.\n\ntu n'es plus dépendante d'un programme. tu sais ce qui te calme, et tu sais y aller.",
comment:["repense à tout ce que tu as testé ce mois-ci","garde les 3 qui t'ont fait le plus de bien","écris-les, garde-les visibles","décide d'un « réflexe d'urgence » parmi eux (souvent la respiration)","promets-toi d'y revenir dès que le stress remonte"],
pieges:["vouloir tout garder : tu te disperses, tu ne tiens rien","choisir ce qui « devrait » marcher plutôt que ce qui marche VRAIMENT pour toi","ranger la liste et l'oublier : garde-la à portée (fond d'écran, carnet, frigo)"],
plus:"colle ta boîte à outils là où tu la verras dans les moments durs (miroir, fond d'écran, porte du frigo). le stress brouille la mémoire : avoir tes 3 réflexes sous les yeux, c'est t'assurer d'y penser quand tu en as le plus besoin.",
observes:["aujourd'hui : un sentiment de « je sais quoi faire »","dans quelques jours : tu y vas plus vite quand ça monte","à terme : une vraie autonomie face au stress"],
victoire:"tu repars avec TES outils, pas les miens — c'est la définition d'un accompagnement réussi."},

  {day:29,emoji:"📏",theme:"mesurer le chemin",
mission:"compare, point par point : tes nuits, ton anxiété, ton énergie au J1 vs aujourd'hui.",
msg:"tu as tendance à oublier d'où tu pars.\n\naujourd'hui, on met les deux photos côte à côte.\n\net souvent, la différence surprend.",
pourquoi:"30 jours, c'est assez pour que ton terrain bouge — pas pour tout régler, et c'est normal : le SMOP est chronique, ton moteur surrénalien ne s'éteint pas en un mois. mais la direction, elle, se voit déjà.\n\ncomparer concrètement le J1 et aujourd'hui, c'est te donner la preuve que ce que tu fais marche. et cette preuve, pour un cerveau sous stress qui efface les progrès, c'est le meilleur carburant pour continuer.\n\ntu ne mesures pas pour te noter. tu mesures pour voir que la route est la bonne.",
comment:["reprends tes notes des J6, J14, J21","compare tes nuits : endormissement, réveils, réveil de 3h","compare ton anxiété, ton énergie, ta peau","note les différences, même petites","garde ce bilan pour ton médecin (J22)"],
pieges:["exiger un « avant/après » spectaculaire : on cherche une tendance, pas un miracle","ne retenir que ce qui n'a pas encore bougé","oublier que certaines choses (peau, cheveux) ont un décalage de plusieurs mois"],
plus:"si certains marqueurs n'ont pas bougé, ce n'est pas un échec : ce sont souvent ceux qui demandent le plus de temps (sommeil très ancré, hyperandrogénie). la Fondation a posé les bases ; la suite, au long cours, continue le travail.",
observes:["aujourd'hui : la mesure de ton chemin, souvent plus grand que ressenti","demain : de quoi aborder la suite avec confiance","ensuite : l'envie de continuer, parce que ça marche"],
victoire:"tu vois enfin, chiffres et faits à l'appui, que ton corps répond — et ça change tout."},

  {day:30,emoji:"🤍",theme:"ce que tu emportes",
mission:"garde trois choses au-delà d'aujourd'hui : ton rituel du soir, tes micro-pauses, ta Serenitea.",
msg:"tu sais maintenant quelque chose que presque personne ne t'avait dit.\n\nton SMOP parle le langage du stress.\n\net tu as appris à lui répondre.",
pourquoi:"tu arrives au bout de la Fondation. tu n'es pas « guérie » — le SMOP est chronique, et ton moteur surrénalien fait partie de toi. mais tu as repris la main sur ton levier numéro un : le stress et le cortisol.\n\ntu as compris pourquoi tes nuits, ta peau, ton énergie sont reliées à ton axe du stress. tu as une tisane pensée pour ce mécanisme, un rituel du soir, des outils anti-cortisol, et de quoi parler vrai à ton médecin. c'est énorme.\n\nà partir de demain, tu n'es plus seule avec tout ça : l'app t'accompagne au quotidien, dans la durée. la Fondation est posée — place à la vie au long cours.",
comment:["garde ton rituel Serenitea du soir","garde tes 2 micro-pauses et ta respiration 5s/5s","garde la lumière du matin et le téléphone hors de la chambre","reviens à ta boîte à outils (J28) dès que le stress remonte","à partir de demain, laisse l'app te guider jour après jour"],
pieges:["croire que tout est acquis et tout lâcher : ton terrain demande de l'entretien","attendre d'être « parfaitement calme » pour te féliciter — regarde le chemin","te retrouver seule face au stress : tu as des outils, et l'app continue avec toi"],
plus:"les jours où tout remonte — et il y en aura — ne repars pas de zéro. reprends juste un outil de ta boîte, ce soir, avec ta Serenitea. c'est comme ça qu'on tient dans la durée : pas en étant parfaite, en revenant.",
observes:["aujourd'hui : de la fierté, et une base solide sous les pieds","dans les semaines qui viennent : un terrain qui continue de s'apaiser","au long cours : un SMOP de moins en moins réactif au stress"],
victoire:"tu as transformé un stress qui te pilotait en quelque chose que tu sais, maintenant, accompagner. c'est ça, reprendre le pouvoir.",
tisane:{nom:"Serenitea",timing:"le soir, au coucher",lien:"https://sopklife.com/products/serenitea",texte:"ta Serenitea reste ton alliée au long cours, avec la Détox et l'Équilibre Féminin. garde le rituel : c'est lui qui tient ton cortisol du soir."}},
];

const MISSIONS_BY_PROFILE = { metabolique: MISSIONS_META, inflammatoire: MISSIONS_INFLA, androgenique: MISSIONS_ANDRO, surrenalien: MISSIONS_SURRENALIEN, mixte_ma: MISSIONS_MIXTE_MA, mixte_mi: MISSIONS_MIXTE_MI, mixte_ai: MISSIONS_MIXTE_AI };

// ─── RITUELS AU LONG COURS (après la Fondation des 30 jours) ───────────────────
const RITUELS = [
  {emoji:"🌬️",theme:"ton souffle",mission:"3 minutes de respiration lente (5s / 5s) avant un moment que tu sais stressant.",msg:"la Fondation est posée. maintenant, on entretient — un petit geste à la fois.",pourquoi:"ta respiration est le seul bouton qui calme ton stress en temps réel. c'est ton outil de base, à garder à vie.",victoire:"tu sais revenir au calme, à volonté."},
  {emoji:"🥗",theme:"l'ordre de l'assiette",mission:"au prochain repas : fibres et légumes d'abord, protéines ensuite, féculents en dernier.",msg:"le geste le plus simple, et l'un des plus puissants. sans rien peser.",pourquoi:"tu lisses ton pic de glycémie juste en changeant l'ordre. même assiette, réponse hormonale différente.",victoire:"un réflexe qui protège tes hormones, pour la vie."},
  {emoji:"🚶‍♀️",theme:"marcher après le repas",mission:"10 minutes de marche après ton plus gros repas aujourd'hui.",msg:"pas de performance. juste bouger un peu, au bon moment.",pourquoi:"tes muscles captent le sucre du repas, le pic retombe. l'exercice le plus rentable pour ta glycémie.",victoire:"tu as transformé une marche banale en soin."},
  {emoji:"💧",theme:"l'eau avant le repas",mission:"un grand verre d'eau 10 minutes avant chaque repas.",msg:"gratuit, invisible, et presque personne ne le fait.",pourquoi:"tu ralentis l'arrivée du sucre et tu sépares la vraie faim de la soif.",victoire:"un petit geste, zéro effort, vrai effet."},
  {emoji:"🌙",theme:"protéger ta nuit",mission:"pas d'écran 30 minutes avant le lit ce soir.",msg:"ton sommeil n'est pas un bonus. pour ton SMOP, c'est un soin.",pourquoi:"tu protèges ta mélatonine et la descente de ton cortisol du soir.",victoire:"tu offres à ton corps une vraie nuit de réparation."},
  {emoji:"🧲",theme:"ton magnésium",mission:"une source de magnésium aujourd'hui : amandes, chocolat noir 70%+, légumes verts.",msg:"un socle qu'on oublie, et que le stress vide en silence.",pourquoi:"le stress épuise ton magnésium, et le manque te rend plus réactive au stress. on casse le cercle par l'assiette.",victoire:"tu recharges une réserve précieuse."},
  {emoji:"🛑",theme:"dire non",mission:"dis non à une seule sollicitation de trop aujourd'hui.",msg:"protéger ton énergie, ce n'est pas de l'égoïsme. c'est un soin.",pourquoi:"chaque oui de trop maintient ton cortisol en alerte. ton corps a une vraie limite.",victoire:"tu as préservé ton énergie sans culpabiliser."},
  {emoji:"☀️",theme:"la lumière du matin",mission:"5 à 10 minutes de lumière du jour au réveil, avant de toucher ton téléphone.",msg:"le signal le plus simple pour remettre ton horloge à l'endroit.",pourquoi:"la lumière du matin recale ton rythme de cortisol : haut le matin, bas le soir.",victoire:"un réveil plus clair, sans rien dépenser."},
  {emoji:"🍳",theme:"le petit-déj qui tient",mission:"des protéines au petit-déjeuner, pas du sucre rapide.",msg:"le repas qui donne le ton de toute ta journée.",pourquoi:"les protéines stabilisent ta glycémie sur 4-5h : tu tiens jusqu'au déjeuner sans craquer.",victoire:"tu ouvres ta journée du bon pied."},
  {emoji:"⏸️",theme:"la micro-pause",mission:"2 minutes les yeux fermés, juste avant ton coup de barre habituel.",msg:"prévenir le pic coûte dix fois moins que le rattraper.",pourquoi:"une pause posée avant le moment difficile empêche le stress de monter trop haut.",victoire:"tu pilotes ta journée au lieu de la subir."},
  {emoji:"🤍",theme:"la douceur envers toi",mission:"aujourd'hui, parle-toi comme tu parlerais à ta meilleure amie.",msg:"ton discours intérieur, c'est aussi de la biologie.",pourquoi:"un dialogue intérieur dur nourrit le stress, donc le SMOP. la bienveillance apaise le terrain.",victoire:"être douce avec toi, c'est un soin à part entière."},
  {emoji:"🌿",theme:"ton rituel du soir",mission:"ta tisane du soir en vrai rituel : assise, téléphone posé, lumières baissées.",msg:"ce n'est pas qu'une infusion. c'est un repère pour ton corps.",pourquoi:"le rituel régulier, à heure fixe, rééduque ton horloge interne autant que les plantes.",victoire:"tu transformes un geste en ancre."},
  {emoji:"🐟",theme:"tes oméga-3",mission:"une source d'oméga-3 aujourd'hui : poisson gras, noix, graines de lin.",msg:"on nourrit le terrain, pas juste l'assiette.",pourquoi:"les oméga-3 aident à apaiser l'inflammation de fond, souvent présente dans le SMOP.",victoire:"un choix qui travaille en profondeur."},
  {emoji:"😴",theme:"l'heure de coucher",mission:"couche-toi à la même heure que les autres soirs (à 15 min près).",msg:"la régularité vaut plus que la durée.",pourquoi:"un horaire de coucher stable recale ton horloge et tes hormones mieux que n'importe quoi.",victoire:"ton corps apprend à compter sur un rythme."},
  {emoji:"🍋",theme:"l'astuce de secours",mission:"une cuillère de vinaigre de cidre dans un verre d'eau, avant un repas riche en féculents.",msg:"ton joker les jours à l'arrache.",pourquoi:"le vinaigre avant le repas aide à lisser le pic glycémique, comme les légumes en premier.",victoire:"tu as une astuce dans ta poche pour les jours pressés."},
  {emoji:"🧘‍♀️",theme:"bouger doux",mission:"10 minutes de yoga, d'étirements ou de marche lente.",msg:"pour toi, moins fort = plus efficace.",pourquoi:"le mouvement doux fait baisser le cortisol ; l'intense, surtout à jeun, le fait monter.",victoire:"tu bouges sans te vider."},
  {emoji:"📵",theme:"le téléphone hors de la chambre",mission:"ce soir, mets ton téléphone à charger dans une autre pièce.",msg:"un petit déplacement, une grande nuit.",pourquoi:"tu coupes la lumière tardive et la tentation de scroller au moindre réveil nocturne.",victoire:"tu reprends le contrôle de ta nuit."},
  {emoji:"🌳",theme:"un temps dans le vert",mission:"15 minutes dehors aujourd'hui, idéalement près d'arbres ou de verdure.",msg:"rien à atteindre. juste y être.",pourquoi:"le temps passé dans la nature fait baisser le cortisol, de façon mesurable.",victoire:"un anti-stress gratuit, sans aucune performance."},
  {emoji:"📝",theme:"une victoire notée",mission:"note une chose qui va mieux qu'il y a un mois.",msg:"ton cerveau sous stress efface les progrès. on les remet en lumière.",pourquoi:"écrire ce qui s'améliore contre le biais négatif, et allège la charge mentale.",victoire:"tu rééduques ton regard vers ce qui avance."},
  {emoji:"🍵",theme:"une pincée de cannelle",mission:"une pincée de cannelle de Ceylan sur ton petit-déjeuner ou ton yaourt.",msg:"un geste minuscule, un effet documenté.",pourquoi:"la cannelle de Ceylan soutient ta sensibilité à l'insuline (toujours Ceylan, jamais Cassia).",victoire:"tu ajoutes un petit allié à ta journée."},
];


const VOCAUX = [
  {id:"bienvenue",titre:"Bienvenue Cyster",when:"J0",unlockDay:1,desc:"Le message de départ",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262265/Nouvel_enregistrement_2_dzgugj.mp3"},
  {id:"miParcours",titre:"Mi-parcours",when:"J14",unlockDay:14,desc:"Pour la deuxième moitié",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262394/Nouvel_enregistrement_3_oktybp.mp3"},
  {id:"difficile",titre:"Pour les jours difficiles",when:"SOS",unlockDay:1,desc:"Quand c'est dur",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262416/Nouvel_enregistrement_4_ngzb7h.mp3"},
  {id:"rdv",titre:"Avant ton rendez-vous",when:"RDV",unlockDay:1,desc:"Pour entrer préparée",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262416/Nouvel_enregistrement_5_zyqlh5.mp3"},
  {id:"fin",titre:"30 jours — le cap franchi",when:"J30",unlockDay:30,desc:"ta Fondation est posée, on continue ensemble",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262415/Nouvel_enregistrement_6_t0wubb.mp3"},
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
  {t:"Insuline + HOMA-IR",s:"j'ai un SMOP (SOPK) avec des symptômes d'insulinorésistance — fringales, fatigue après les repas. est-ce qu'on peut ajouter l'insuline à jeun pour calculer le HOMA-IR ?",r:"est-ce que je peux le faire sans ordonnance pour avoir une mesure de départ ?"},
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
  "j'ai pris soin de moi autrement","j'ai parlé de mon SMOP (SOPK)",
];

// ── MOUVEMENT ADAPTÉ (pilier bien-être, jamais esthétique) ──────────────────
// Contenu de départ, doux et non prescriptif. À remplacer par les routines du planner de Ghiz.
const MOUVEMENT = [
  { id:"matin", nom:"Routine douce du matin", duree:"8 min", niveau:"tous niveaux", ic:"coffee",
    intro:"de quoi réveiller ton corps en douceur, sans forcer. parfaite les jours de petite énergie.",
    exercices:[
      {n:"Respiration profonde",d:"5 respirations lentes, mains sur le ventre, pour réveiller le système nerveux."},
      {n:"Étirement des bras vers le ciel",d:"debout, étire-toi vers le haut, puis relâche. 5 fois, sans à-coups."},
      {n:"Rotations douces des épaules",d:"10 rotations en arrière, pour dénouer le haut du dos."},
      {n:"Flexion avant relâchée",d:"penche-toi doucement vers l'avant, genoux souples, laisse pendre la tête. respire."},
      {n:"Marche sur place",d:"1 à 2 minutes, à ton rythme, pour activer la circulation."},
    ]},
  { id:"bas", nom:"Bas du corps", duree:"15 min", niveau:"doux", ic:"pulse",
    intro:"renforce jambes et fessiers sans impact. le bas du corps est un grand consommateur de sucre — bouger ici soutient ta sensibilité à l'insuline.",
    exercices:[
      {n:"Squats lents contre un mur",d:"dos au mur, descends comme pour t'asseoir, remonte. 2 séries de 10, à ton rythme."},
      {n:"Fentes appuyées",d:"une main sur une chaise pour l'équilibre, un pas en avant, descends doucement. 8 de chaque côté."},
      {n:"Montées sur la pointe des pieds",d:"debout, monte sur les pointes, redescends lentement. 15 fois."},
      {n:"Pont fessier au sol",d:"allongée, genoux pliés, soulève le bassin et redescends. 2 séries de 12."},
    ]},
  { id:"gainage", nom:"Gainage & posture", duree:"12 min", niveau:"doux", ic:"heart",
    intro:"renforce ta ceinture abdominale et ton dos pour une meilleure posture au quotidien. jamais pour « un ventre plat » — pour te sentir solide.",
    exercices:[
      {n:"Gainage sur les genoux",d:"en planche, appuyée sur les avant-bras et les genoux. tiens 15-20 secondes, respire. 3 fois."},
      {n:"Respiration abdominale engagée",d:"assise bien droite, inspire en gonflant le ventre, expire en le rentrant doucement. 10 fois."},
      {n:"Superman au sol",d:"à plat ventre, soulève doucement bras et jambes opposés. 8 alternances."},
      {n:"Étirement du dos (posture de l'enfant)",d:"à genoux, buste penché en avant, bras tendus. respire 30 secondes."},
    ]},
  { id:"cardio", nom:"Cardio court & doux", duree:"10 min", niveau:"tous niveaux", ic:"leaf",
    intro:"une activation cardio courte, sans épuisement. l'idée n'est pas de « brûler », mais de faire du bien à ton cœur et à ton moral.",
    exercices:[
      {n:"Marche rapide",d:"sur place ou dehors, accélère un peu le pas pendant 3-4 minutes."},
      {n:"Pas chassés doux",d:"d'un côté puis de l'autre, bras relâchés. 1 minute."},
      {n:"Montées de genoux tranquilles",d:"alterne les genoux vers le haut, à un rythme confortable. 1 minute."},
      {n:"Retour au calme",d:"ralentis progressivement, puis 5 respirations profondes pour redescendre."},
    ]},
];

// ── BANQUE DE CONNAISSANCES SMOP (contenu original, voix SOPK Life, cadrage prudent) ──
const SAVOIRS = [
  { t:"Pourquoi suivre ton cycle, même irrégulier", em:"🌙", couleur:"#A89AB8",
    corps:["avec un SMOP, l'ovulation peut se décaler ou ne pas avoir lieu certains mois — c'est fréquent, et ce n'est pas un échec de ton corps.","noter tes règles, même en désordre, révèle des schémas : la longueur de tes cycles, les moments où ton corps « répond » mieux, l'effet de ton assiette ou de ton stress.","c'est aussi une mine d'or pour ton médecin : des cycles notés valent mille fois mieux qu'un « je sais plus trop »."] },
  { t:"L'intestin et ton SMOP", em:"🌱", couleur:"#A9BC8E",
    corps:["70 % de ton système immunitaire vit dans ton intestin. un microbiote déséquilibré peut entretenir l'inflammation de bas grade, qui elle-même pèse sur tes hormones et ta sensibilité à l'insuline.","concrètement : des fibres variées (légumes, légumineuses), des aliments fermentés si tu les tolères, et le moins d'ultra-transformé possible soutiennent ton terrain digestif.","un ventre qui gonfle, des digestions difficiles ne sont pas « dans ta tête » — c'est une piste à explorer, en douceur."] },
  { t:"Peau, poils et cheveux : pourquoi, et quoi faire", em:"✨", couleur:"#CB9A79",
    corps:["acné sur la mâchoire et le bas du visage, poils plus drus, cheveux qui s'affinent : ce sont des signes d'hyperandrogénie, pas un manque d'hygiène ou de volonté.","le travail de fond passe par ton terrain (insuline, inflammation, stress) — c'est lui qui nourrit ces signes.","la peau et les poils bougent lentement : compte plusieurs semaines pour l'acné, plusieurs mois pour les poils et les cheveux. la patience fait partie du traitement."] },
  { t:"SMOP et fertilité : ce qu'on oublie de te dire", em:"🤍", couleur:"#D4A5A5",
    corps:["« vous devrez passer par la PMA » est une phrase trop vite lâchée. beaucoup de femmes avec un SMOP conçoivent, parfois naturellement — souvent en travaillant le terrain (insuline, poids si besoin, stress, cycle).","le SMOP est l'une des causes d'infertilité les plus *réversibles* : l'ovulation peut revenir.","si un projet bébé est là, un suivi médical spécialisé en parallèle est précieux. ici, on t'aide à comprendre et à préparer le terrain, jamais à promettre."] },
  { t:"La pilule et le SMOP : ce qu'elle fait (et ne fait pas)", em:"💊", couleur:"#9FB3C9",
    corps:["la pilule apporte des hormones de synthèse : elle régularise les saignements, peut améliorer l'acné et la pilosité tant qu'on la prend. c'est un choix valable pour certaines, à décider avec ton médecin.","ce qu'elle ne fait pas : elle ne « soigne » pas le SMOP et n'agit pas sur la résistance à l'insuline. les symptômes reviennent souvent à l'arrêt, car le terrain n'a pas changé.","la connaître pour ce qu'elle est — un outil, pas une fatalité ni une solution unique — te permet de choisir en conscience."] },
  { t:"Le poids et le SMOP : sortir de la culpabilité", em:"🌾", couleur:"#B8A98E",
    corps:["« perdez du poids » est le conseil le plus donné et le moins expliqué. or avec un SMOP, la résistance à l'insuline rend la perte de poids plus difficile — ce n'est pas un manque de volonté.","l'objectif n'est pas un chiffre : c'est d'apaiser ton terrain (glycémie stable, moins d'inflammation, meilleur sommeil). le reste suit, à son rythme.","ton corps n'est pas ton ennemi. il réagit à un déséquilibre — et il répond quand on lui donne les bons signaux."] },
];

// ── COMPRENDRE MON SMOP : les mécanismes expliqués simplement ───────────────
const MECANISMES = [
  { nom:"La résistance à l'insuline", em:"⚡", couleur:"#CB9A79", court:"le moteur central, chez beaucoup de Cysters",
    texte:"ton corps produit de l'insuline pour faire entrer le sucre dans les cellules. Quand elles y répondent mal, le pancréas en produit encore plus. Cette insuline haute pousse les ovaires à fabriquer plus d'androgènes, favorise le stockage au niveau du ventre et déclenche les fringales. C'est souvent le premier levier sur lequel agir — par l'assiette, le mouvement et le sommeil.",
    signes:"fringales de 15h, coup de barre après les repas, prise de poids abdominale malgré les efforts." },
  { nom:"L'hyperandrogénie", em:"🌙", couleur:"#A89AB8", court:"l'excès d'androgènes et ses signes visibles",
    texte:"les androgènes (dont la testostérone) sont normaux en petite quantité. En excès, ils agissent sur la peau et les poils. Une enzyme, la 5-alpha-réductase, convertit la testostérone en DHT, une forme plus active responsable de l'acné de la mâchoire et de la chute de cheveux. Agir sur cette conversion, et sur ce qui neutralise les androgènes, fait partie de l'accompagnement.",
    signes:"acné sur le bas du visage, pilosité, cheveux qui s'affinent ou tombent." },
  { nom:"Le foie et la SHBG", em:"🌿", couleur:"#A9BC8E", court:"l'angle que personne n'explique",
    texte:"le foie produit la SHBG, une protéine qui attrape et neutralise les hormones actives en excès. Il aide aussi à éliminer le surplus d'androgènes. Quand le foie est surchargé, il fabrique moins de SHBG : plus d'androgènes circulent librement. C'est pourquoi soutenir le foie est souvent le point de départ d'une routine.",
    signes:"digestion lourde, teint terne, sensation d'être « encrassée »." },
  { nom:"L'axe stress-cortisol", em:"🌾", couleur:"#9FB3C9", court:"le SMOP surrénalien, souvent oublié",
    texte:"le stress chronique maintient le cortisol élevé. Ce cortisol aggrave la résistance à l'insuline ET pousse les surrénales à produire des androgènes (DHEA). Résultat : un SMOP qui flambe sous stress. C'est un cercle vicieux — mais aussi un vrai levier, par le sommeil, la respiration et la récupération.",
    signes:"réveils à 3h du matin, SMOP qui empire dans les périodes difficiles, épuisement nerveux." },
  { nom:"L'inflammation de bas grade", em:"🔥", couleur:"#CB7E6B", court:"le feu silencieux",
    texte:"une inflammation chronique et discrète, invisible sur la plupart des bilans standards, qui sollicite le système immunitaire en continu. Elle perturbe les hormones, aggrave la résistance à l'insuline et peut gêner l'ovulation. C'est souvent ce qui explique une fatigue profonde malgré un bon sommeil.",
    signes:"fatigue qui ne passe pas, douleurs diffuses, intestin sensible." },
];

// ── TISANES SMOP (SOPK) LIFE (compléments alimentaires à base de plantes — cadrage : soutient/accompagne, jamais traite) ──
const TISANES = [
  { nom:"Cure Détox — Organisme Clean", em:"🌿", role:"Le point de départ universel", couleur:"#A9BC8E",
    soutient:"soutient les fonctions du foie et le drainage naturel — le foie est le premier maillon du SMOP (il aide à éliminer l'excès d'androgènes et à produire la SHBG).",
    plantes:"pissenlit, chardon-marie, ortie piquante, menthe poivrée, prêle des champs.",
    quand:"1 tasse à jeun le matin, 10 min d'infusion. Cure de 7, 14 ou 21 jours (21 j recommandé).",
    profil:"tous les profils, en tout début de routine.",
    prudence:"déconseillée pendant la grossesse (chardon-marie, prêle) ; allaitement, anticoagulants ou pathologie hépatique : demande l'avis de ton médecin ; allergie aux Astéracées." },
  { nom:"Équilibre Féminin — La fondation", em:"🌸", role:"La tisane centrale, pour tous les profils", couleur:"#A89AB8",
    soutient:"accompagne l'équilibre hormonal global : cycle, glycémie, androgènes et système nerveux. 8 plantes bio qui agissent en synergie.",
    plantes:"luzerne, menthe poivrée, gingembre, ortie, mélisse, cannelle de Ceylan, framboisier, alchémille.",
    quand:"en milieu de journée, après la phase de Détox (à partir de J8).",
    profil:"tous les profils — idéale aussi quand le profil n'est pas encore identifié.",
    prudence:"déconseillée en grossesse (alchémille, framboisier) ; allaitement (la menthe poivrée réduit la lactation), traitement hormonal, maladie auto-immune (luzerne) : demande l'avis de ton médecin." },
  { nom:"Andro Tea", em:"🌙", role:"Profil androgénique", couleur:"#C2AEBA",
    soutient:"accompagne l'équilibre des androgènes (acné de la mâchoire, pilosité, chute de cheveux) en agissant sur deux voies : production et neutralisation.",
    plantes:"menthe verte, réglisse, ortie, thé vert, romarin.",
    quand:"le soir, 1 h après le dîner. En duo avec l'Équilibre Féminin en journée.",
    profil:"androgénique (ou mixte avec cette composante).",
    prudence:"déconseillée en grossesse/allaitement ; la réglisse est contre-indiquée en cas d'hypertension, d'hypokaliémie ou de corticoïdes — demande l'avis de ton médecin." },
  { nom:"Stabilitea", em:"⚡", role:"Profil métabolique", couleur:"#CB9A79",
    soutient:"aide à soutenir une glycémie plus stable et la sensibilité à l'insuline (fringales de 15h, coup de barre après les repas).",
    plantes:"eucalyptus, cannelle de Ceylan, gingembre, feuilles de mûrier, menthe douce.",
    quand:"après les repas principaux, 1 à 2 tasses/jour.",
    profil:"métabolique (ou mixte avec cette composante).",
    prudence:"diabète traité, grossesse, anticoagulants : demande l'avis de ton médecin (cannelle)." },
  { nom:"Serenitea", em:"🌾", role:"Stress, cortisol, sommeil", couleur:"#9FB3C9",
    soutient:"accompagne l'axe stress-cortisol : le stress chronique peut aggraver l'insulinorésistance et stimuler les surrénales. Aide à l'endormissement et à un sommeil plus réparateur.",
    plantes:"ashwagandha, passiflore, aubépine, elsholtzia, coquelicot des champs.",
    quand:"le soir, 30 à 45 min avant le coucher, comme un rituel.",
    profil:"inflammatoire et mixte, ou dès que le SMOP réagit fortement au stress.",
    prudence:"déconseillée en grossesse (ashwagandha) ; hypothyroïdie traitée, sédatifs/anxiolytiques : demande l'avis de ton médecin." },
  { nom:"Inflamma Tea", em:"🔥", role:"Profil inflammatoire", couleur:"#CB7E6B",
    soutient:"accompagne la réponse inflammatoire de bas grade — ce « feu silencieux » qui épuise et peut perturber l'ovulation.",
    plantes:"curcuma, gingembre, menthe poivrée, ortie, églantier.",
    quand:"en milieu de journée, entre les repas.",
    profil:"inflammatoire (ou mixte avec cette composante).",
    prudence:"grossesse, anticoagulants, calculs biliaires (curcuma) : demande l'avis de ton médecin ; allergie aux Astéracées." },
  { nom:"FertiliTea — Pack 3 mois", em:"🤍", role:"Accompagnement fertilité", couleur:"#D4A5A5",
    soutient:"accompagne la préparation à la conception sur un cycle complet, en approche phasée (une infusion par phase). N'est pas un traitement de fertilité.",
    plantes:"3 infusions (folliculaire, ovulatoire, lutéale) + e-book d'accompagnement.",
    quand:"selon les phases du cycle, sur 3 mois.",
    profil:"préparation grossesse, cycles irréguliers — toujours en parallèle d'un suivi médical.",
    prudence:"à arrêter dès confirmation de grossesse ; traitement de fertilité en cours : demande l'avis de ton médecin. On ne promet jamais de résultat sur la fertilité." },
];

// ── RESSOURCES : rangées en familles (navigation à 2 niveaux) ───────────────
const OUTIL_CATS = {
  alimentation: { label:"Mon alimentation", em:"🍽️", dotBg:"#F6ECE2", hero:"de quoi manger pour ton SMOP sans te prendre la tête — on planifie, on pioche, on cuisine.",
    tools:[
      {id:"planif", em:"🗓️", nm:"Planifier ma semaine", td:"compose tes repas, ta liste de courses se remplit toute seule", star:true},
      {id:"repas", em:"🍲", nm:"Idées repas", td:"inspiration classée par moment"},
      {id:"recettes", em:"📖", nm:"Recettes", td:"pas à pas, SMOP-friendly"},
      {id:"aliments", em:"🍽️", nm:"Chercher un aliment", td:"index glycémique, protéines"},
      {id:"sucres", em:"🔍", nm:"Sucres cachés", td:"repérer les pièges"},
      {id:"assiette", em:"🍴", nm:"L'assiette SMOP", td:"la bonne proportion dans ton assiette"},
    ]},
  complements: { label:"Mes compléments & tisanes", em:"🌿", dotBg:"#EFF3E8", hero:"ce qui soutient ton terrain, en complément de ton assiette.",
    tools:[ {id:"complements", em:"🌿", nm:"Compléments & tisanes", td:"ce qui peut t'aider, et comment"} ]},
  comprendre: { label:"Comprendre mon SMOP", em:"🎓", dotBg:"#F2EEF6", hero:"le pourquoi des choses, en clair — pour avancer en confiance.",
    tools:[
      {id:"diag", em:"🤍", nm:"Je viens d'être diagnostiquée", td:"l'accueil qu'on t'a pas donné", goTab:"diag"},
      {id:"comprendre", em:"🎓", nm:"Comprendre", td:"les mécanismes, expliqués simplement"},
      {id:"fiches", em:"📚", nm:"Fiches SMOP", td:"les repères essentiels à garder"},
    ]},
  quotidien: { label:"Au quotidien", em:"📍", dotBg:"#F6ECE2", hero:"les situations de la vraie vie : resto, voyage, fatigue, imprévus.",
    tools:[ {id:"situations", em:"📍", nm:"Au quotidien", td:"gérer les moments pas évidents"} ]},
  fiches_imp: { label:"Mes fiches à imprimer", em:"📥", dotBg:"#EDE7F0", hero:"à imprimer et garder sous la main.",
    tools:[ {id:"telechargements", em:"📥", nm:"Mes fiches à imprimer", td:"tes documents prêts à imprimer"} ]},
};
const OUTIL_CAT_OF = (oid)=>Object.keys(OUTIL_CATS).find(ck=>OUTIL_CATS[ck].tools.some(t=>t.id===oid));

// ── PLANIFICATEUR DE REPAS ──────────────────────────────────────────────────
const JOURS = [["lun","Lundi"],["mar","Mardi"],["mer","Mercredi"],["jeu","Jeudi"],["ven","Vendredi"],["sam","Samedi"],["dim","Dimanche"]];
const SLOTS = [["matin","Petit-déj"],["midi","Déjeuner"],["soir","Dîner"]];

const callAPI = async (prompt) => {
  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})
  });
  const d = await r.json();
  return d.content?.[0]?.text||"";
};

// ─── PICTOGRAMMES (trait fin, cohérents) ─────────────────────────────────────
const ICON_PATHS = {
  // navigation
  home:'M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5',
  map:'M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 7 9 4Zm0 0v13m6-10v13',
  chart:'M4 20V6m0 14h16M8 20v-6m4 6V9m4 11v-4',
  book:'M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5V4.5Zm0 15A1.5 1.5 0 0 0 6.5 21H19',
  health:'M12 5.5C9 1.5 3 3.5 3 9c0 4 4.5 7.5 9 11 4.5-3.5 9-7 9-11 0-5.5-6-7.5-9-3.5Z',
  alert:'M12 4 2.5 20h19L12 4Zm0 6v5m0 3h.01',
  gear:'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8 3a8 8 0 0 0-.14-1.5l2-1.6-2-3.4-2.4 1a8 8 0 0 0-2.6-1.5L14.5 2h-5l-.76 2.5a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.6A8 8 0 0 0 4 12c0 .5.05 1 .14 1.5l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 2.6 1.5L9.5 22h5l.76-2.5a8 8 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.6c.09-.5.14-1 .14-1.5Z',
  // profils / dimensions
  moon:'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z',
  bolt:'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  brain:'M9 4.5A2.5 2.5 0 0 0 6.5 7 2.5 2.5 0 0 0 5 11.5 2.5 2.5 0 0 0 6.5 16 2.5 2.5 0 0 0 9 19V4.5Zm6 0A2.5 2.5 0 0 1 17.5 7 2.5 2.5 0 0 1 19 11.5 2.5 2.5 0 0 1 17.5 16 2.5 2.5 0 0 1 15 19V4.5Z',
  leaf:'M4 20C4 11 11 4 20 4c0 9-7 16-16 16Zm3-3 9-9',
  flame:'M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-1.5.7-2.8 1.5-3.5.3 1 .8 1.5 1.5 1.5 0-3 1-5 1-7Z',
  // suivi / métriques
  drop:'M12 3C9 7 6 10.5 6 14a6 6 0 0 0 12 0c0-3.5-3-7-6-11Z',
  bed:'M3 7v12m0-5h18v5m0-5V9a2 2 0 0 0-2-2h-9v7M7 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  steps:'M7 20c-1.5 0-2.5-1-2.5-3 0-2 1-3 1-5.5C5.5 9 6.5 8 8 8s2 1.3 2 3c0 3-1 4-1 6 0 2-.5 3-2 3Zm9-8c-1.5 0-2.5-1-2.5-3 0-2 1-3.5 1-5.5 0 0 1-1.5 2.5-1.5S20 3.3 20 5c0 3-1 4-1 6 0 2-.5 3-2 3Z',
  heart:'M12 5.5C9 1.5 3 3.5 3 9c0 4 4.5 7.5 9 11 4.5-3.5 9-7 9-11 0-5.5-6-7.5-9-3.5Z',
  pulse:'M3 12h4l2-6 4 12 2-6h6',
  smile:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8.5 10h.01M15.5 10h.01M8 14.5s1.5 2 4 2 4-2 4-2',
  // ressources / santé
  tools:'M14 6a3.5 3.5 0 0 1 4.6 4.6l-9 9-4.6-4.6 9-9ZM4 20l2.5-2.5',
  flask:'M9 3h6m-5 0v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3',
  doctor:'M6 3v5a6 6 0 0 0 12 0V3M9 20a3 3 0 0 1 6 0M15 14v3a3 3 0 0 0 3 3 2 2 0 1 0 0-4',
  calendar:'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V6.5ZM4 9.5h16M8 3v4m8-4v4',
  // utilitaires
  arrowR:'M5 12h14m-6-6 6 6-6 6',
  arrowL:'M19 12H5m6 6-6-6 6-6',
  check:'M5 12.5 10 17 19 7',
  chevron:'M6 9l6 6 6-6',
  coffee:'M4 8h12v5a5 5 0 0 1-10 0V8Zm12 1h2.5a2.5 2.5 0 0 1 0 5H16M6 3v2m4-2v2',
  sparkle:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z',
};
function Icon({name,size=20,color="currentColor",stroke=1.6,fill="none",style}){
  const d=ICON_PATHS[name]; if(!d) return null;
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,...style}}>
    <path d={d}/></svg>);
}
// icône associée à chaque profil/dimension
const PROFIL_ICON={metabolique:"bolt",androgenique:"leaf",inflammatoire:"flame",surrenalien:"brain",mixte_ma:"bolt",mixte_mi:"bolt",mixte_ai:"leaf"};
// retrouve la clé de profil à partir d'un libellé de dimension (dominant/secondaire/trace)
const labelToProfil=(label="")=>{const l=label.toLowerCase();
  if(l.includes("surrén")||l.includes("surren"))return "surrenalien";
  if(l.includes("métabol")||l.includes("metabol"))return "metabolique";
  if(l.includes("inflamm"))return "inflammatoire";
  if(l.includes("androg"))return "androgenique";
  return null;};

// ─── APP PRINCIPALE ──────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState(() => load("screen","name"));
  const [prenom, setPrenom] = useState(() => load("prenom",""));
  const [profil, setProfil] = useState(() => load("profil","metabolique"));
  const [tab, setTab] = useState("kamila");
  const [day, setDay] = useState(() => load("day",1));
  const [fatigueOpen, setFatigueOpen] = useState(false);
  const [fatigueStep, setFatigueStep] = useState(0);
  const [checked, setChecked] = useState(() => load("checked",{}));
  const [energie, setEnergie] = useState(() => load("energie",null));
  const [regles, setRegles] = useState(() => load("regles",[]));
  const [victories, setVictories] = useState(() => load("victories",{}));
  const [notes, setNotes] = useState(() => load("notes",{}));
  const [symptoms, setSymptoms] = useState(() => load("symptoms",{}));
  const [journalWeek, setJournalWeek] = useState(() => load("journalWeek",1));
  const [toast, setToast] = useState(null);
  const [mindsetOpen, setMindsetOpen] = useState(null);
  useEffect(()=>{ setMindsetOpen(null); }, [day]); // l'humeur du jour se réinitialise quand on change de jour
  const prevDayRef = useRef(day);
  useEffect(()=>{ if(prevDayRef.current!==day){ setEnergie(null); prevDayRef.current=day; } }, [day]); // l'énergie se vide quand on change de jour (gardée au rechargement du même jour)

  // ─── AUTH + SYNCHRO CLOUD ───────────────────────────────────────────────────
  const [sb, setSb] = useState(null);
  const [session, setSession] = useState(undefined); // undefined=chargement · null=déconnectée · objet=connectée
  const [sbError, setSbError] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPw, setAuthPw] = useState("");
  const [authPw2, setAuthPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const pulledRef = useRef(false);
  const [hydrated, setHydrated] = useState(false); // true quand les données cloud sont chargées (sécurité : on n'affiche pas l'app avant)
  const [showAccount, setShowAccount] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [accMsg, setAccMsg] = useState("");
  const [accErr, setAccErr] = useState("");
  const [accBusy, setAccBusy] = useState(false);
  const [accPrenom, setAccPrenom] = useState("");
  const [accNewEmail, setAccNewEmail] = useState("");
  const [dossierInner, setDossierInner] = useState("");
  // ─── INSTALLATION (PWA) + RAPPELS ───────────────────────────────────────────
  const [showInstall, setShowInstall] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(()=>{ try{return localStorage.getItem("sopklife_installDismissed")==="1";}catch(e){return false;} });
  const [canInstallAndroid, setCanInstallAndroid] = useState(false);
  const deferredPromptRef = useRef(null);
  const [notifPerm, setNotifPerm] = useState(()=>{ try{return (typeof Notification!=="undefined")?Notification.permission:"unavailable";}catch(e){return "unavailable";} });
  const isIOS = /iphone|ipad|ipod/i.test(typeof navigator!=="undefined"?navigator.userAgent:"");
  const isStandalone = (()=>{ try{ return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone===true; }catch(e){ return false; } })();
  useEffect(()=>{ const onBIP=(e)=>{ e.preventDefault(); deferredPromptRef.current=e; setCanInstallAndroid(true); };
    window.addEventListener("beforeinstallprompt",onBIP); return ()=>window.removeEventListener("beforeinstallprompt",onBIP); },[]);
  const triggerInstall=async()=>{ const d=deferredPromptRef.current; if(d){ d.prompt(); try{await d.userChoice;}catch(e){} deferredPromptRef.current=null; setCanInstallAndroid(false); setShowInstall(false);} };
  const dismissInstall=()=>{ setInstallDismissed(true); try{localStorage.setItem("sopklife_installDismissed","1");}catch(e){} };
  const enableNotif=async()=>{
    if(isIOS && !isStandalone){ setShowInstall(true); return; } // iOS : il faut d'abord l'ajouter à l'écran d'accueil
    try{
      if(typeof Notification==="undefined"){ showToast("Notifications indisponibles ici"); return; }
      const perm=await Notification.requestPermission(); setNotifPerm(perm);
      if(perm==="granted"){ save("notif","yes"); showToast("Rappels activés","tu recevras un petit rappel chaque jour.");
        try{ new Notification("SMOP Map",{body:"C'est tout bon, tes rappels sont en place.",icon:"/icon-192.png"}); }catch(e){}
        subscribePush();
      } else { showToast("Rappels non activés","tu peux les activer plus tard dans Mon compte."); }
    }catch(e){ showToast("Impossible d'activer les rappels ici"); }
  };
  const subscribePush=async()=>{
    try{
      if(!("serviceWorker" in navigator)||!("PushManager" in window)) return;
      const reg=await navigator.serviceWorker.ready;
      let sub=await reg.pushManager.getSubscription();
      if(!sub){ sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlB64ToUint8(VAPID_PUBLIC)}); }
      if(sb&&session&&sub){
        await sb.from("push_subscriptions").upsert({
          user_id: session.user.id,
          endpoint: sub.endpoint,
          subscription: sub.toJSON(),
          updated_at: new Date().toISOString()
        }, { onConflict:"endpoint" });
      }
    }catch(e){}
  };

  useEffect(()=>{ let subref;
    getSupabase().then(client=>{
      setSb(client);
      client.auth.getSession().then(({data})=>setSession(data.session||null)).catch(()=>setSession(null));
      const r=client.auth.onAuthStateChange((evt,s)=>{ setSession(s||null); if(evt==="PASSWORD_RECOVERY"){ setShowAccount(true); setAccMsg("Choisis ton nouveau mot de passe ci-dessous"); } });
      subref=r.data?.subscription;
    }).catch(()=>{ setSbError(true); });
    return ()=>{ try{ subref&&subref.unsubscribe(); }catch(e){} };
  },[]);

  // à la connexion : le LOCAL fait foi sur un appareil déjà utilisé (on n'écrase jamais tes changements récents).
  // on ne charge le cloud QUE sur un appareil vierge (pas encore de données ici).
  useEffect(()=>{ if(!sb||!session||pulledRef.current) return; pulledRef.current=true;
    const finish=()=>setHydrated(true);
    const safety=setTimeout(finish, 9000); // si le réseau traîne, on ne reste pas bloquée sur le splash
    const ms=(s)=>{ const t=Date.parse(s); return isNaN(t)?0:t; };
    const localOnb = (()=>{ try{ return !!localStorage.getItem("sopklife_onboardingDone"); }catch(e){ return false; } })();
    const seenTs = (()=>{ try{ return localStorage.getItem("smop_seenTs")||""; }catch(e){ return ""; } })();
    // restaure le cloud sur ce device puis recharge une fois pour que l'app relise tout
    const restore=(cloud,ts)=>{ applyLocal(cloud); try{ if(ts) localStorage.setItem("smop_seenTs",ts); }catch(e){}
      if(!sessionStorage.getItem("sopklife_hydrated")){ try{ sessionStorage.setItem("sopklife_hydrated","1"); }catch(e){} window.location.reload(); return true; }
      return false; };
    const pushLocal=(ts)=>{ sb.from("user_data").upsert({user_id:session.user.id,data:collectLocal(),updated_at:ts})
      .then(()=>{ try{ localStorage.setItem("smop_seenTs",ts); }catch(e){} finish(); }, finish); };
    sb.from("user_data").select("data, updated_at").eq("user_id",session.user.id).maybeSingle().then(({data,error})=>{
      clearTimeout(safety);
      if(error){ finish(); return; }
      const cloud = (data && data.data && Object.keys(data.data).length) ? data.data : null;
      const cloudOnb = !!(cloud && cloud["sopklife_onboardingDone"]);
      const cloudTs = (data && data.updated_at) ? String(data.updated_at) : "";
      const now = new Date().toISOString();
      // 1) appareil vidé (iOS a effacé le local) mais le cloud a de vraies données → on restaure
      if(cloudOnb && !localOnb){ if(restore(cloud,cloudTs)) return; finish(); return; }
      // 2) le local a les données, le cloud est vide → on pousse (jamais d'écrasement de cloud riche par un local vide)
      if(localOnb && !cloudOnb){ pushLocal(now); return; }
      // 3) les deux ont des données → le plus récent gagne
      if(localOnb && cloudOnb){
        if(cloudTs && (!seenTs || ms(cloudTs) > ms(seenTs))){ if(restore(cloud,cloudTs)) return; finish(); return; }
        pushLocal(now); return;
      }
      // 4) aucun des deux n'a de vraies données (nouvelle utilisatrice)
      pushLocal(now);
    }, ()=>{ clearTimeout(safety); finish(); });
  },[sb,session]);

  // synchro continue : on pousse le local vers le cloud dès qu'il change — SEULEMENT une fois hydratée
  useEffect(()=>{ if(!sb||!session||!hydrated) return; let last=JSON.stringify(collectLocal()); let alive=true;
    const push=()=>{ try{ const cur=JSON.stringify(collectLocal()); if(cur!==last){ last=cur; const ts=new Date().toISOString(); sb.from("user_data").upsert({user_id:session.user.id,data:JSON.parse(cur),updated_at:ts}); try{ localStorage.setItem("smop_seenTs",ts); }catch(e){} } }catch(e){} };
    const iv=setInterval(()=>{ if(alive) push(); }, 6000);
    const onHide=()=>push();
    window.addEventListener("beforeunload",onHide); document.addEventListener("visibilitychange",onHide);
    return ()=>{ alive=false; clearInterval(iv); window.removeEventListener("beforeunload",onHide); document.removeEventListener("visibilitychange",onHide); push(); };
  },[sb,session,hydrated]);

  const doAuth = async () => {
    if(!sb||authBusy) return; setAuthErr(""); setAuthMsg("");
    if(authMode==="signup" && authPw!==authPw2){ setAuthErr("Les deux mots de passe ne correspondent pas."); return; }
    setAuthBusy(true);
    try{
      const email=authEmail.trim().toLowerCase();
      const { data, error } = authMode==="signup"
        ? await sb.auth.signUp({ email, password:authPw })
        : await sb.auth.signInWithPassword({ email, password:authPw });
      if(error){ setAuthErr(authErrFr(error.message)); }
      else if(authMode==="signup" && !data.session){ setAuthMsg("Compte créé vérifie ta boîte mail pour le confirmer, puis connecte-toi."); setAuthMode("login"); }
    }catch(e){ setAuthErr("Une erreur est survenue, réessaie."); }
    setAuthBusy(false);
  };
  const forgotPw = async () => {
    if(!sb) return; const email=authEmail.trim().toLowerCase();
    if(!email){ setAuthErr("Entre d'abord ton email, puis clique sur « mot de passe oublié »."); return; }
    setAuthErr(""); setAuthMsg(""); setAuthBusy(true);
    try{ await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      setAuthMsg("Si un compte existe avec cet email, tu vas recevoir un lien pour réinitialiser ton mot de passe");
    }catch(e){ setAuthErr("Impossible d'envoyer l'email, réessaie."); }
    setAuthBusy(false);
  };
  const changePw = async () => {
    if(!sb||accBusy) return; setAccErr(""); setAccMsg("");
    if(newPw.length<6){ setAccErr("Ton mot de passe doit faire au moins 6 caractères."); return; }
    setAccBusy(true);
    try{ const { error } = await sb.auth.updateUser({ password:newPw });
      if(error){ setAccErr(authErrFr(error.message)); } else { setAccMsg("Mot de passe mis à jour"); setNewPw(""); }
    }catch(e){ setAccErr("Une erreur est survenue, réessaie."); }
    setAccBusy(false);
  };
  const savePrenom = () => { const v=accPrenom.trim(); setAccErr(""); setPrenom(v); save("prenom",v); setAccMsg("Prénom enregistré"); };
  const changeEmail = async () => {
    if(!sb||accBusy) return; setAccErr(""); setAccMsg(""); const email=accNewEmail.trim().toLowerCase();
    if(!email||!email.includes("@")){ setAccErr("Entre un email valide."); return; }
    setAccBusy(true);
    try{ const { error } = await sb.auth.updateUser({ email });
      if(error){ setAccErr(authErrFr(error.message)); } else { setAccMsg("Un email de confirmation t'a été envoyé — clique le lien pour valider ta nouvelle adresse."); setAccNewEmail(""); }
    }catch(e){ setAccErr("Une erreur est survenue, réessaie."); }
    setAccBusy(false);
  };
  const logout = async () => { try{ sessionStorage.removeItem("sopklife_hydrated"); pulledRef.current=false; setShowAccount(false); await sb?.auth.signOut(); }catch(e){} };
  useEffect(()=>{ if(showAccount){ setAccPrenom(prenom||""); setAccErr(""); setAccMsg(""); setNewPw(""); setAccNewEmail(""); } },[showAccount]);
  const showToast = (titre, sousTitre) => { setToast({titre,sousTitre}); setTimeout(()=>setToast(null), 3400); };
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
  const [showOnboarding, setShowOnboarding] = useState(() => load("onboardingDone","no")==="no");
  const [foodSearch, setFoodSearch] = useState("");
  const [outilOpen, setOutilOpen] = useState(null);
  const [outilCat, setOutilCat] = useState(null);
  const [mouvOpen, setMouvOpen] = useState(null);
  const [tisaneOpen, setTisaneOpen] = useState(null);
  const [mecaOpen, setMecaOpen] = useState(null);
  const [savoirOpen, setSavoirOpen] = useState(null);
  const [recFiltreMoment, setRecFiltreMoment] = useState("tous");
  const [recFiltreTag, setRecFiltreTag] = useState("tous");
  const [recetteFiche, setRecetteFiche] = useState(null);
  const [situationOpen, setSituationOpen] = useState(null);
  const [ficheOpen, setFicheOpen] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [repasMoment, setRepasMoment] = useState("matin");
  const [recetteOpen, setRecetteOpen] = useState(null);
  const [repasPlan, setRepasPlan] = useState(() => load("repasPlan",{}));
  const [planTab, setPlanTab] = useState("semaine"); // semaine / idees / courses
  const [planPicker, setPlanPicker] = useState(null); // {jour, moment} slot à remplir
  const [planCustom, setPlanCustom] = useState(""); // saisie repas libre dans le sélecteur
  const [coursesChecked, setCoursesChecked] = useState({});
  const [coursesCustom, setCoursesCustom] = useState(() => load("coursesCustom",[])); // articles ajoutés à la main
  const [coursesRemoved, setCoursesRemoved] = useState(() => load("coursesRemoved",{})); // articles auto retirés
  const [coursesInput, setCoursesInput] = useState("");
  const [quizAns, setQuizAns] = useState(() => load("quizAns",{}));
  const [quizResult, setQuizResult] = useState(() => load("quizResult",null));
  const [showManualProfils, setShowManualProfils] = useState(false);
  const [profilSwitch, setProfilSwitch] = useState(null); // {key,label} dimension qu'on envisage d'explorer
  const [journal, setJournal] = useState(() => load("journalQuotidien",{}));
  const [journalMoment, setJournalMoment] = useState("matin"); // rituel guidé : matin / soir
  const [dayOffset, setDayOffset] = useState(0); // navigation jour par jour dans « Ta journée »
  const [apercuPeriode, setApercuPeriode] = useState("mois");
  const [apercuMetric, setApercuMetric] = useState("symptomes");
  const [mesures, setMesures] = useState(() => load("mesures",{actif:false,poids:[]}));
  const [poidsInput, setPoidsInput] = useState("");
  const [reglesInput, setReglesInput] = useState("");
  const [vocauxOpen, setVocauxOpen] = useState(false);
  const inputRef = useRef(null);

  const pc = C.profils[profil];

  useEffect(()=>{
    const s=document.createElement("style");
    s.innerHTML=`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}body{background:#FBF8F3;}@keyframes toastUp{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}@keyframes spin{to{transform:rotate(360deg);}}@keyframes breathe{0%,100%{opacity:1;}50%{opacity:0.92;}}.fu{animation:fadeUp 0.35s ease forwards;}.breathe{animation:breathe 5s ease-in-out infinite;}input:focus,textarea:focus{outline:none;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#E8DDD3;border-radius:99px;}.app-shell{max-width:430px;margin:0 auto;}.sop-sidebar{display:none;}@media(min-width:900px){.app-shell{max-width:960px;display:flex;align-items:flex-start;}.sop-sidebar{display:flex!important;}.sop-main{flex:1;min-width:0;max-width:100%;}.mobile-tabs{display:none!important;}.bottom-nav-wrap{display:none!important;}}#sopk-dossier-content{color:#3D2B1F;line-height:1.5;font-family:Arial,sans-serif;}#sopk-dossier-content h1{font-size:20px;color:#3D2B1F;margin-bottom:8px;}#sopk-dossier-content h2{font-size:15px;color:#B07D4F;margin-top:20px;border-bottom:2px solid #E8DDD3;padding-bottom:4px;}#sopk-dossier-content table{border-collapse:collapse;width:100%;font-size:13px;margin-top:6px;}#sopk-dossier-content ul{font-size:13px;margin:6px 0 0 18px;}#sopk-dossier-content li{margin-bottom:4px;}#sopk-dossier-content .note{font-size:11px;color:#9A8578;font-style:italic;margin-top:24px;display:block;}@media print{body>*{visibility:hidden;}#sopk-dossier,#sopk-dossier *{visibility:visible;}#sopk-dossier{position:absolute;inset:0;overflow:visible;background:#fff;padding:0;}#sopk-dossier-content{max-width:100%;padding:0 10px;}.sopk-noprint{display:none!important;}}.hscroll::-webkit-scrollbar{display:none;}.hscroll{scrollbar-width:none;-ms-overflow-style:none;}`;
    document.head.appendChild(s);
    return()=>document.head.removeChild(s);
  },[]);

  useEffect(()=>{ save("screen",screen); },[screen]);
  useEffect(()=>{ save("prenom",prenom); },[prenom]);
  useEffect(()=>{ save("profil",profil); },[profil]);
  useEffect(()=>{ save("day",day); },[day]);
  useEffect(()=>{ window.scrollTo({top:0,behavior:"smooth"}); }, [day, tab]);
  useEffect(()=>{ save("checked",checked); },[checked]);
  useEffect(()=>{ save("energie",energie); },[energie]);
  useEffect(()=>{ save("regles",regles); },[regles]);
  useEffect(()=>{ save("victories",victories); },[victories]);
  useEffect(()=>{ save("notes",notes); },[notes]);
  useEffect(()=>{ save("symptoms",symptoms); },[symptoms]);
  useEffect(()=>{ save("journalWeek",journalWeek); },[journalWeek]);
  useEffect(()=>{ setJournalWeek(Math.ceil(day/7)); },[day]);
  useEffect(()=>{ save("markers",markers); },[markers]);
  useEffect(()=>{ save("journalQuotidien",journal); },[journal]);
  useEffect(()=>{ save("repasPlan",repasPlan); },[repasPlan]);
  useEffect(()=>{ save("coursesCustom",coursesCustom); },[coursesCustom]);
  useEffect(()=>{ save("coursesRemoved",coursesRemoved); },[coursesRemoved]);
  useEffect(()=>{ try{ window.scrollTo(0,0); }catch(e){} },[tab,outilOpen,outilCat]);
  useEffect(()=>{ save("mesures",mesures); },[mesures]);
  useEffect(()=>{ save("quizAns",quizAns); },[quizAns]);
  useEffect(()=>{ save("quizResult",quizResult); },[quizResult]);

  const completedCount = Object.values(checked).filter(Boolean).length;
  const baseScore = 76;
  const score = Math.max(8, baseScore - completedCount * 1.5);
  const week = Math.ceil(day/7);
  const weekWins = victories[journalWeek]||[];
  const activeMissions = MISSIONS_BY_PROFILE[profil] || MISSIONS_META;
  const todayData = day<=30 ? (activeMissions[day-1] || MISSIONS_META[day-1] || MISSIONS_META[0]) : {...RITUELS[((day-31)%RITUELS.length)], day};
  const todayKey = new Date().toISOString().slice(0,10);
  const jToday = journal[todayKey] || {};
  const todayLabel = new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const setJ = (field,value)=> setJournal(p=>({...p,[todayKey]:{...(p[todayKey]||{}),[field]:value}}));
  const setSymp = (key,value)=> setJournal(p=>({...p,[todayKey]:{...(p[todayKey]||{}),symptomes:{...((p[todayKey]||{}).symptomes||{}),[key]:value}}}));
  const setJArr = (field,idx,value)=>{ const a=[...((journal[todayKey]||{})[field]||["","",""])]; a[idx]=value; setJ(field,a); };
  const toggleAction = (idx)=>{ const a=[...((journal[todayKey]||{}).actionsDone||[false,false,false])]; a[idx]=!a[idx]; setJ("actionsDone",a); };
  // « Ta journée » : navigation jour par jour (0 = aujourd'hui, négatif = jours passés)
  const viewDate = new Date(); viewDate.setDate(viewDate.getDate()+dayOffset);
  const viewKey = viewDate.toISOString().slice(0,10);
  const viewLabel = viewDate.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const jView = journal[viewKey] || {};
  const setJV = (field,value)=> setJournal(p=>({...p,[viewKey]:{...(p[viewKey]||{}),[field]:value}}));
  const setSympV = (key,value)=> setJournal(p=>({...p,[viewKey]:{...(p[viewKey]||{}),symptomes:{...((p[viewKey]||{}).symptomes||{}),[key]:value}}}));
  const periodBuckets = (period)=>{
    const out=[]; const now=new Date();
    if(period==="annee"){
      for(let i=11;i>=0;i--){ const d=new Date(now.getFullYear(), now.getMonth()-i, 1); out.push({key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`, label:d.toLocaleDateString("fr-FR",{month:"short"}).replace(".",""), type:"month"}); }
    } else {
      const n = period==="semaine"?7:30;
      for(let i=n-1;i>=0;i--){ const d=new Date(now); d.setDate(now.getDate()-i); out.push({key:d.toISOString().slice(0,10), label:String(d.getDate()), type:"day"}); }
    }
    return out;
  };
  const metricForDay = (dd,metric)=>{
    if(!dd) return null;
    if(metric==="symptomes"){ const sy=dd.symptomes||{}; const vals=Object.values(sy).filter(v=>typeof v==="number"); return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null; }
    return typeof dd[metric]==="number"?dd[metric]:null;
  };
  const bucketValue = (bk,metric)=>{
    if(bk.type==="day") return metricForDay(journal[bk.key],metric);
    const days=Object.keys(journal).filter(k=>k.startsWith(bk.key));
    const vals=days.map(k=>metricForDay(journal[k],metric)).filter(v=>v!=null);
    return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  };
  const sympForBucket = (bk,symKey)=>{
    if(bk.type==="day"){ const d=journal[bk.key]; return d&&d.symptomes&&typeof d.symptomes[symKey]==="number"?d.symptomes[symKey]:null; }
    const days=Object.keys(journal).filter(k=>k.startsWith(bk.key));
    const vals=days.map(k=>journal[k]&&journal[k].symptomes&&journal[k].symptomes[symKey]).filter(v=>typeof v==="number");
    return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  };
  const heatColor = (v)=> v==null?"#EFE7DC": v===0?"#E4EBD8": v<1.5?"#E9D9C0": v<2.5?"#E0B98A": v<3.5?"#D49A5F": v<4.5?"#C67A45":"#B4542E";
  const computeTrends = ()=>{
    const days=Object.keys(journal).map(k=>journal[k]);
    const out=[];
    const sympLoad=(d)=>{ const sy=(d&&d.symptomes)||{}; const v=Object.values(sy).filter(x=>typeof x==="number"); return v.length?v.reduce((a,b)=>a+b,0)/v.length:null; };
    const avg=(arr)=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
    // 1. sommeil → symptômes
    { const less=[],more=[]; days.forEach(d=>{ const s=sympLoad(d); if(s==null||typeof d.sommeil!=="number")return; (d.sommeil<7?less:more).push(s); });
      if(less.length>=3&&more.length>=3){ const a=avg(less),b=avg(more); if(a-b>=0.6) out.push({tag:`${less.length+more.length} jours`,text:`Tes symptômes sont en moyenne de ${a.toFixed(1)}/5 les nuits où tu dors moins de 7h, contre ${b.toFixed(1)}/5 les nuits où tu dors plus.`,kamila:"ton sommeil n'est pas un bonus, c'est un soin. chaque heure gagnée allège ta journée du lendemain — et là, ce ne sont pas mes mots, ce sont tes données."}); } }
    // 2. stress → symptômes
    { const hi=[],lo=[]; days.forEach(d=>{ const s=sympLoad(d); if(s==null||typeof d.stress!=="number")return; if(d.stress>=4)hi.push(s); else if(d.stress<=2)lo.push(s); });
      if(hi.length>=3&&lo.length>=3){ const a=avg(hi),b=avg(lo); if(a-b>=0.6) out.push({tag:`${hi.length+lo.length} jours`,text:`Tes symptômes sont en moyenne de ${a.toFixed(1)}/5 les jours les plus stressés, contre ${b.toFixed(1)}/5 les jours calmes.`,kamila:"ton corps traduit le stress en symptômes — ce n'est pas dans ta tête. et c'est une bonne nouvelle : apaiser ton stress agit directement sur ton SMOP."}); } }
    // 3. mouvement → énergie
    { const act=[],sed=[]; days.forEach(d=>{ if(typeof d.energie!=="number"||typeof d.mouvement!=="number")return; (d.mouvement>=20?act:sed).push(d.energie); });
      if(act.length>=3&&sed.length>=3){ const a=avg(act),b=avg(sed); if(a-b>=0.6) out.push({tag:`${act.length+sed.length} jours`,text:`Ton énergie est en moyenne de ${a.toFixed(1)}/5 les jours où tu bouges un peu, contre ${b.toFixed(1)}/5 les jours sans.`,kamila:"pas besoin de te vider : un peu de mouvement doux suffit à relancer ton énergie. ton corps te remercie d'y aller en douceur."}); } }
    // 4. évolution dans le temps
    { const keys=Object.keys(journal).sort(); const withS=keys.map(k=>sympLoad(journal[k])).filter(s=>s!=null);
      if(withS.length>=8){ const h=Math.floor(withS.length/2); const first=avg(withS.slice(0,h)); const last=avg(withS.slice(-h)); if(first-last>=0.5) out.push({tag:`${withS.length} jours suivis`,text:`Ta charge de symptômes est passée de ${first.toFixed(1)}/5 au début à ${last.toFixed(1)}/5 récemment.`,kamila:"regarde ce chemin. ton corps enregistre tout ce que tu mets en place, et il répond. les jours de doute, reviens lire cette ligne."}); } }
    return out;
  };

  const translate = async () => {
    const filled = Object.entries(markers).filter(([,v])=>v&&v.trim());
    if(!filled.length) return;
    setTranslating(true); setTranslation(null); setTransErr(null);
    const lines = filled.map(([k,v])=>{const m=MARKERS.find(x=>x.id===k);return`${m?.label||k}: ${v} ${m?.unit||""}`;}).join("\n");
    try {
      const res = await callAPI(`Tu es Kamila, fondatrice de SOPK Life. Grande sœur. Voix orale directe. Ton : proche, "Cyster".\n\nAnalyses de ${prenom||"cette Cyster"} :\n${lines}\n\nRéponds en 4 parties séparées par une ligne vide :\n\nCE QUE ÇA DIT EN LANGAGE HUMAIN\nChaque valeur avec normes fonctionnelles (insuline idéal < 8 µUI/mL, vitamine D idéal > 40 ng/mL, SHBG idéal > 60 nmol/L). Direct. Pas de jargon.\n\nCE QUI MÉRITE TON ATTENTION MAINTENANT\nMax 3 priorités concrètes.\n\nCE QUI EST RASSURANT\nCe qui est dans des zones satisfaisantes.\n\nLES QUESTIONS À POSER À TON MÉDECIN\n2-3 formulations exactes. Inclus HGPO si insuline ou glycémie limites.`);
      setTranslation(res);
    } catch(e) { setTransErr("réessaie dans quelques secondes Cyster"); }
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

  const TABS=[{id:"kamila",icon:"home",label:"Accueil"},{id:"carte",icon:"map",label:"Ma carte"},{id:"suivi",icon:"chart",label:"Suivi"},{id:"outils",icon:"book",label:"Ressources"},{id:"medecin",icon:"health",label:"Santé"}];

  // ── PORTAIL CONNEXION (Supabase) ────────────────────────────────────────────
  if(sbError) return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",textAlign:"center"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:C.brown,marginBottom:10}}>Connexion impossible</div>
      <div style={{fontSize:12.5,color:C.mid,lineHeight:1.6,marginBottom:20}}>on n'arrive pas à joindre le serveur. vérifie ta connexion internet et réessaie.</div>
      <button onClick={()=>window.location.reload()} style={{background:C.brown,color:"#fff",border:"none",borderRadius:12,padding:"12px 22px",fontFamily:"inherit",fontSize:12.5,fontWeight:600,cursor:"pointer"}}>réessayer</button>
    </div>
  );
  if(session===undefined) return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",color:C.light,fontStyle:"italic"}}>un instant</div>
    </div>
  );
  if(session===null) return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:"2.2rem 1.6rem"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{width:54,height:54,borderRadius:"50%",background:`linear-gradient(135deg,${C.mauve},${C.terra})`,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="leaf" size={26} color="#fff"/></div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.6rem",color:C.brown,fontWeight:600}}>SMOP Map</div>
        <div style={{fontSize:12,color:C.light,marginTop:4}}>{authMode==="signup"?"crée ton compte pour commencer":"contente de te revoir"}</div>
      </div>
      <div style={{display:"flex",gap:6,background:C.bubble,borderRadius:13,padding:4,marginBottom:14}}>
        <button onClick={()=>{setAuthMode("login");setAuthErr("");setAuthMsg("");setAuthPw2("");}}
          style={{flex:1,textAlign:"center",padding:"10px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:authMode==="login"?700:500,background:authMode==="login"?C.white:"transparent",color:authMode==="login"?C.brown:C.mid,boxShadow:authMode==="login"?"0 2px 6px rgba(0,0,0,.05)":"none"}}>Me connecter</button>
        <button onClick={()=>{setAuthMode("signup");setAuthErr("");setAuthMsg("");setAuthPw2("");}}
          style={{flex:1,textAlign:"center",padding:"10px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:authMode==="signup"?700:500,background:authMode==="signup"?C.white:"transparent",color:authMode==="signup"?C.brown:C.mid,boxShadow:authMode==="signup"?"0 2px 6px rgba(0,0,0,.05)":"none"}}>Créer un compte</button>
      </div>
      <div style={{background:C.white,borderRadius:18,padding:"1.3rem",border:`1px solid ${C.border}`}}>
        {authMode==="signup" && <div style={{fontSize:11,color:C.mid,background:C.mauveSoft,borderRadius:10,padding:"9px 12px",marginBottom:14,lineHeight:1.5}}>première visite ? crée ton compte ici c'est lui qui gardera ton suivi.</div>}
        <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.light,marginBottom:6}}>Email</div>
        <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} autoComplete="email" placeholder="ton@email.fr"
          style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:11,padding:"12px",fontSize:14,fontFamily:"inherit",color:C.brown,marginBottom:14,outline:"none",background:C.cream}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.light}}>Mot de passe</div>
          <button onClick={()=>setShowPw(v=>!v)} style={{background:"none",border:"none",color:C.mid,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{showPw?"masquer":"👁 afficher"}</button>
        </div>
        <input type={showPw?"text":"password"} value={authPw} onChange={e=>setAuthPw(e.target.value)} autoComplete={authMode==="signup"?"new-password":"current-password"} placeholder={showPw?"ton mot de passe":"••••••••"}
          onKeyDown={e=>{ if(e.key==="Enter"&&authMode!=="signup") doAuth(); }}
          style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:11,padding:"12px",fontSize:14,fontFamily:"inherit",color:C.brown,marginBottom:6,outline:"none",background:C.cream}}/>
        {authMode==="signup" && <div style={{fontSize:9.5,color:C.light,marginBottom:12}}>au moins 6 caractères</div>}
        {authMode==="signup" && <>
          <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.light,marginBottom:6}}>Confirme ton mot de passe</div>
          <input type={showPw?"text":"password"} value={authPw2} onChange={e=>setAuthPw2(e.target.value)} autoComplete="new-password" placeholder={showPw?"retape ton mot de passe":"••••••••"}
            onKeyDown={e=>{ if(e.key==="Enter") doAuth(); }}
            style={{width:"100%",border:`1px solid ${authPw2&&authPw2!==authPw?"#E3B8AC":C.border}`,borderRadius:11,padding:"12px",fontSize:14,fontFamily:"inherit",color:C.brown,marginBottom:6,outline:"none",background:C.cream}}/>
          {authPw2&&authPw2!==authPw && <div style={{fontSize:9.5,color:"#B5553F",marginBottom:10}}>les deux mots de passe ne correspondent pas</div>}
        </>}
        {authErr && <div style={{fontSize:11,color:"#B5553F",background:"#FDF0E8",borderRadius:9,padding:"8px 11px",margin:"8px 0",lineHeight:1.5}}>{authErr}</div>}
        {authMsg && <div style={{fontSize:11,color:"#4A7A52",background:"#EAF3EA",borderRadius:9,padding:"8px 11px",margin:"8px 0",lineHeight:1.5}}>{authMsg}</div>}
        {(()=>{ const bad=authBusy||!authEmail||!authPw||(authMode==="signup"&&(!authPw2||authPw!==authPw2)); return (
        <button onClick={doAuth} disabled={bad}
          style={{width:"100%",marginTop:10,background:bad?C.light:C.brown,color:"#fff",border:"none",borderRadius:12,padding:"13px",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:bad?"default":"pointer"}}>
          {authBusy?"un instant…":(authMode==="signup"?"créer mon compte":"me connecter")}
        </button>
        ); })()}
      </div>
      {authMode==="login" && <button onClick={forgotPw} disabled={authBusy}
        style={{marginTop:6,background:"none",border:"none",color:C.light,fontSize:11,cursor:"pointer",fontFamily:"inherit",textAlign:"center",textDecoration:"underline"}}>
        mot de passe oublié ?
      </button>}
      <div style={{fontSize:9.5,color:C.light,textAlign:"center",marginTop:22,lineHeight:1.6}}>tes données sont enregistrées et te suivent sur tous tes appareils.</div>
    </div>
  );
  // on attend que les données du cloud soient chargées avant d'afficher l'app (sécurité anti-écrasement)
  if(session && !hydrated) return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
      <Icon name="leaf" size={28} color={C.mauve}/>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",color:C.light,fontStyle:"italic"}}>on récupère tes données…</div>
    </div>
  );

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
  if(screen==="quiz") return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:560,margin:"0 auto",paddingBottom:92}}>
      <div style={{background:"linear-gradient(135deg,#7A5C45,#5E4636)",padding:"1.4rem 1.5rem",color:"white"}}>
        <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",opacity:.6}}>Ton type de SMOP (SOPK)</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",marginTop:3}}>Trouvons ton profil</div>
        <div style={{fontSize:11.5,opacity:.85,marginTop:6,lineHeight:1.55}}>réponds honnêtement — pas comme tu voudrais être. ce n'est pas un diagnostic médical, c'est un raccourci pour décider par où commencer.</div>
      </div>
      <div style={{padding:"1.2rem 1.3rem"}}>
        {["m","i","a","s","pp"].map(ax=>(
          <div key={ax} style={{marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:ax==="pp"?4:10}}>
              <span style={{fontSize:16}}>{QUIZ_AXES[ax].emoji}</span>
              <span style={{fontSize:13,fontWeight:700,color:C.brown,textTransform:"capitalize"}}>{ax==="pp"?"Contexte — après la pilule":QUIZ_AXES[ax].label}</span>
            </div>
            {ax==="pp"&&<div style={{fontSize:10.5,color:C.light,marginBottom:10,lineHeight:1.5}}>ces deux-là ne changent pas ton profil — elles ajoutent une note si ton SMOP (SOPK) a une composante post-pilule.</div>}
            {QUIZ_SOPK.map((qq,idx)=> qq.ax===ax ? (
              <div key={idx} style={{background:C.white,borderRadius:14,padding:"12px 14px",marginBottom:8,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:12.5,color:C.brown,lineHeight:1.45,marginBottom:9}}>{qq.q}</div>
                <div style={{display:"flex",gap:6}}>
                  {QUIZ_CHOICES.map(ch=>{
                    const sel=quizAns[idx]===ch.v;
                    return (
                      <button key={ch.v} onClick={()=>setQuizAns(p=>({...p,[idx]:ch.v}))}
                        style={{flex:1,padding:"8px 4px",borderRadius:10,border:`1.5px solid ${sel?QUIZ_AXES[ax].col:C.border}`,background:sel?QUIZ_AXES[ax].col:C.white,color:sel?"white":C.mid,fontSize:10.5,fontWeight:sel?700:500,cursor:"pointer",fontFamily:"inherit"}}>
                        {ch.l}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null)}
          </div>
        ))}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:560,background:C.white,borderTop:`1px solid ${C.border}`,padding:"12px 16px"}}>
        {(() => {
          const n=QUIZ_SOPK.filter((_,i)=>typeof quizAns[i]==="number").length;
          const done=n===QUIZ_SOPK.length;
          return (
            <button disabled={!done} onClick={()=>{ const r=computeProfilQuiz(quizAns); setQuizResult(r); setProfil(r.profil); setScreen("quiz-result"); }}
              style={{width:"100%",padding:"14px",borderRadius:13,border:"none",background:done?"#7A5C45":C.border,color:"white",fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:done?"pointer":"default"}}>
              {done?"Voir mon profil →":`réponds à tout (${n}/${QUIZ_SOPK.length})`}
            </button>
          );
        })()}
      </div>
    </div>
  );

  if(screen==="quiz-result" && quizResult) return (() => {
    const r=quizResult; const prof=C.profils[r.profil]||C.profils.metabolique;
    return (
      <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:480,margin:"0 auto",padding:"2.2rem 1.5rem",textAlign:"center"}}>
        <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.light,marginBottom:10}}>Ton type de SMOP (SOPK)</div>
        <div style={{width:72,height:72,borderRadius:"50%",background:`${prof.p}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 14px"}}>{prof.emoji}</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.7rem",color:C.brown,lineHeight:1.2}}>{prof.label}</div>
        {r.mixte && <div style={{fontSize:13,color:prof.p,fontWeight:600,marginTop:6}}>à dominante {QUIZ_AXES[r.dominant].label} · {r.pct[r.dominant]}%</div>}
        <div style={{background:C.white,borderRadius:16,padding:"16px",margin:"20px 0",border:`1px solid ${C.border}`,textAlign:"left"}}>
          <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.light,marginBottom:10}}>ta répartition</div>
          {["m","i","a","s"].map(ax=>(
            <div key={ax} style={{marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,color:C.brown,marginBottom:3}}>
                <span>{QUIZ_AXES[ax].emoji} {QUIZ_AXES[ax].label}</span><span style={{fontWeight:600}}>{r.pct[ax]}%</span>
              </div>
              <div style={{height:8,borderRadius:99,background:C.bubble,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${r.pct[ax]}%`,background:QUIZ_AXES[ax].col,borderRadius:99}}/>
              </div>
            </div>
          ))}
        </div>
        {r.surrenal && <div style={{background:"#F1EEF6",border:"1px solid #C9BFD6",borderRadius:14,padding:"13px 15px",textAlign:"left",marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:"#8B7BA0",marginBottom:4}}>🧠 forte composante surrénalienne</div>
          <div style={{fontSize:11.5,color:C.mid,lineHeight:1.6}}>ton stress et ton sommeil pèsent lourd dans ton tableau, et les prendre en compte fait partie d'une approche globale de ton SMOP. ça ne veut pas dire que tous tes symptômes viennent du stress — ton corps est plus complexe que ça. mais c'est un levier sur lequel on peut vraiment agir ensemble.</div>
        </div>}
        {r.postpill && <div style={{background:"#EEF2F7",border:"1px solid #C4D0DE",borderRadius:14,padding:"13px 15px",textAlign:"left",marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:"#5B7FA6",marginBottom:4}}>💊 composante post-pilule</div>
          <div style={{fontSize:11.5,color:C.mid,lineHeight:1.6}}>si tes symptômes semblent liés à l'arrêt de la pilule : souvent, le corps a juste besoin de temps pour relancer ses hormones — ton profil ci-dessus reste ta base de travail, et beaucoup de choses se rééquilibrent sur 3 à 12 mois. parles-en à ton médecin.</div>
        </div>}
        <div style={{background:C.white,borderRadius:16,padding:"16px",marginBottom:16,border:`1px solid ${C.border}`,textAlign:"left"}}>
          <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.light,marginBottom:4}}>ce qu'il faut faire mesurer</div>
          <div style={{fontSize:11.5,color:C.mid,lineHeight:1.5,marginBottom:10}}>un bilan complet vaut mieux qu'un bilan ciblé. à demander à ton médecin :</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
            {(MARKERS_BY_PROFIL[r.profil]||MARKERS_BY_PROFIL.metabolique).map((mk,i)=>(
              <span key={i} style={{fontSize:11,background:C.bubble,color:C.brown,borderRadius:99,padding:"4px 11px"}}>{mk}</span>
            ))}
          </div>
          <button onClick={()=>{setTab("analyses");setScreen("app");}} style={{width:"100%",padding:"11px",borderRadius:11,border:`1.5px solid ${prof.p}`,background:"transparent",color:prof.p,fontFamily:"inherit",fontSize:12.5,fontWeight:600,cursor:"pointer"}}>Ouvrir mes analyses →</button>
        </div>
        <div style={{fontSize:11,color:C.mid,lineHeight:1.6,fontStyle:"italic",marginBottom:20}}>ce n'est pas un diagnostic — c'est un point de départ pour décider par où commencer. ton parcours s'adapte à ce profil, et tu pourras toujours le refaire.</div>
        <button onClick={()=>setScreen("priorites")} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:prof.p,color:"white",fontFamily:"inherit",fontSize:15,fontWeight:600,cursor:"pointer"}}>Commencer mon parcours →</button>
        <button onClick={()=>{setQuizAns({});setQuizResult(null);setScreen("quiz");}} style={{width:"100%",marginTop:10,background:"none",border:"none",color:C.light,fontFamily:"inherit",fontSize:11,textDecoration:"underline",cursor:"pointer"}}>refaire le quiz</button>
      </div>
    );
  })();

  if(screen==="profil-select") return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:430,margin:"0 auto",padding:"2.4rem 1.5rem"}}>
      <div style={{textAlign:"center",marginBottom:28,marginTop:12}}>
        <div style={{fontSize:42,marginBottom:14}}>✨</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.7rem",color:C.brown,marginBottom:10,lineHeight:1.25}}>
          {prenom}, trouvons ton profil
        </div>
        <div style={{fontSize:13,color:C.mid,lineHeight:1.65}}>
          le SMOP n'est pas le même pour toutes. en 2 minutes, on identifie <strong>ton</strong> type — et tout ton parcours s'adapte à lui.
        </div>
      </div>

      <button onClick={()=>setScreen("quiz")} style={{width:"100%",padding:"18px",border:"none",borderRadius:16,background:"linear-gradient(135deg,#7A5C45,#5E4636)",color:"white",cursor:"pointer",fontFamily:"inherit",fontSize:16,fontWeight:700,boxShadow:"0 6px 20px rgba(94,70,54,.22)"}}>
        Faire le test →
      </button>
      <div style={{textAlign:"center",fontSize:11,color:C.light,marginTop:14,lineHeight:1.5}}>
        26 questions simples · pas moi / un peu / assez / beaucoup
      </div>

      {!showManualProfils ? (
        <div style={{textAlign:"center",marginTop:44}}>
          <button onClick={()=>setShowManualProfils(true)} style={{background:"none",border:"none",color:C.light,fontSize:11,textDecoration:"underline",cursor:"pointer",fontFamily:"inherit"}}>
            je connais déjà mon profil
          </button>
        </div>
      ) : (
        <div style={{marginTop:30}}>
          <div style={{textAlign:"center",fontSize:11,color:C.mid,marginBottom:14}}>choisis ton profil</div>
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
                    {key==="surrenalien"&&"cortisol · stress · sommeil"}
                    {key==="mixte_ma"&&"métabolique + androgénique"}
                    {key==="mixte_mi"&&"métabolique + inflammatoire"}
                    {key==="mixte_ai"&&"androgénique + inflammatoire"}
                  </div>
                </div>
                <div style={{fontSize:18,color:p.p}}>→</div>
              </button>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:16}}>
            <button onClick={()=>setShowManualProfils(false)} style={{background:"none",border:"none",color:C.light,fontSize:11,textDecoration:"underline",cursor:"pointer",fontFamily:"inherit"}}>
              ← plutôt faire le test
            </button>
          </div>
        </div>
      )}
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
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.light}}>Ton profil SMOP (SOPK)</div>
              <div style={{fontSize:8.5,color:C.light,fontStyle:"italic"}}>appuie pour explorer une dimension</div>
            </div>
            {[
              {niveau:"DOMINANT",data:h.dominant,size:14,bold:true},
              {niveau:"SECONDAIRE",data:h.secondaire,size:12,bold:false},
              {niveau:"TRACE",data:h.trace,size:11,bold:false,opacity:0.7},
            ].map((row,i)=>{
              const target=labelToProfil(row.data.label);
              const isActive=target===profil;
              return (
              <button key={i} onClick={()=>{ if(target && !isActive) setProfilSwitch({key:target,label:row.data.label}); }}
                style={{width:"100%",textAlign:"left",display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<2?`1px solid ${C.border}`:"none",opacity:row.opacity||1,background:"none",border:"none",borderRadius:0,cursor:target&&!isActive?"pointer":"default",fontFamily:"inherit"}}>
                <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.light,width:70,flexShrink:0}}>{row.niveau}</div>
                <div style={{width:28,height:28,borderRadius:"50%",background:`${row.data.col}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{target?<Icon name={PROFIL_ICON[target]||"leaf"} size={14} color={row.data.col}/>:<span style={{fontSize:13}}>{row.data.em}</span>}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:row.size,fontWeight:row.bold?700:500,color:C.brown}}>{row.data.label}</div>
                  <div style={{fontSize:9,color:C.light}}>{row.data.desc}</div>
                </div>
                {isActive
                  ? <div style={{background:`${row.data.col}20`,border:`1px solid ${row.data.col}`,borderRadius:99,padding:"2px 8px",fontSize:8,color:row.data.col}}>actif</div>
                  : target && <div style={{fontSize:13,color:C.light}}>›</div>}
              </button>
            );})}

            {profilSwitch && (
              <div style={{marginTop:12,background:C.mauveSoft,borderRadius:12,padding:"12px 13px"}}>
                <div style={{fontSize:11,color:C.brown,lineHeight:1.6,marginBottom:10}}>
                  Tu veux faire du <b>profil {profilSwitch.label}</b> ton parcours principal ? tu peux revenir au surrénalien quand tu veux.
                  <div style={{fontSize:9.5,color:C.mid,marginTop:5,fontStyle:"italic"}}>on travaille un terrain à la fois — le plus présent d'abord, les autres suivent.</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{const k=profilSwitch.key;setProfil(k);save("profil",k);setProfilSwitch(null);}}
                    style={{flex:1,background:pc.p,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>en faire mon parcours</button>
                  <button onClick={()=>setProfilSwitch(null)}
                    style={{background:"none",border:`1px solid ${C.border}`,color:C.mid,borderRadius:10,padding:"10px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>annuler</button>
                </div>
              </div>
            )}
          </div>
        )})()}

        <div style={{background:C.bubble,borderRadius:16,padding:"12px 14px",marginBottom:16,border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:C.brown,lineHeight:1.7,fontStyle:"italic"}}>
            "j'ai construit ce protocole parce que j'aurais eu besoin de quelque chose comme ça quand j'ai reçu mon diagnostic. voilà tes 3 priorités du quotidien, de la plus importante à la moins urgente — celles-là, tu les fais ensemble, chaque jour. tes dimensions de fond, elles, on les explore une à la fois."
          </div>
          <div style={{fontSize:10,color:C.light,marginTop:6}}>— Kamila</div>
        </div>

        <div style={{background:C.bubble,borderRadius:12,padding:"10px 14px",marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.mid,lineHeight:1.6}}>Ces 3 <strong>priorités</strong> sont des gestes quotidiens — tu les fais <strong>ensemble</strong>, pas l'une après l'autre. La <strong>01</strong> est la plus prioritaire. Le délai sur chaque carte = quand tu commences à <strong>ressentir les premiers effets</strong>. <span style={{color:C.light}}>(à ne pas confondre avec tes dimensions de fond plus haut, qu'on travaille une à la fois.)</span></div>
        </div>

        {(PRIORITES_PROFIL[profil]||PRIORITES_PROFIL.metabolique).map((p,i)=>(
          <div key={i} style={{border:`1.5px solid ${i===0?p.col:C.border}`,borderRadius:16,padding:"14px",marginBottom:10,background:i===0?`${p.col}06`:C.white}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:600,color:C.brown,flex:1}}>{p.n} · {p.em} {p.t}</div>
              <div style={{background:`${p.col}15`,borderRadius:99,padding:"3px 9px",fontSize:8.5,color:p.col,flexShrink:0,marginLeft:6}}>⏱ effets : {p.quand}</div>
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
        "c'est tout pour maintenant.<br/>demain on reprend." — Kamila
      </div>
      <button onClick={()=>{setCriseMode(false);setTab("sos");}} style={{marginTop:"2.2rem",background:pc.p,border:"none",borderRadius:12,padding:"12px 20px",fontFamily:"inherit",fontSize:12.5,fontWeight:600,color:"#fff",cursor:"pointer"}}>
        voir toutes mes fiches SOS →
      </button>
      <button onClick={()=>setCriseMode(false)} style={{marginTop:"0.8rem",background:"none",border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 20px",fontFamily:"inherit",fontSize:12,color:C.light,cursor:"pointer"}}>
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
          {sos.secret&&(
            <div style={{background:"#2D2640",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:"#E8C97A",marginBottom:5,letterSpacing:0.5}}>🔑 ce qu'on ne te dit jamais</div>
              <div style={{fontSize:11.5,color:"#F5EFE0",lineHeight:1.7}}>{sos.secret}</div>
            </div>
          )}
          {sos.monMot&&(
            <div style={{background:`${sos.couleur}15`,borderRadius:12,padding:"12px 14px",marginBottom:10,borderLeft:`3px solid ${sos.couleur}`}}>
              <div style={{fontSize:10,fontWeight:700,color:sos.couleur,marginBottom:5}}>le mot de ta grande sœur</div>
              <div style={{fontSize:12,color:C.brown,lineHeight:1.7,fontStyle:"italic"}}>{sos.monMot}</div>
            </div>
          )}
          {sos.liens&&sos.liens.length>0&&(
            <div style={{background:C.white,borderRadius:12,padding:"12px 14px",marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,fontWeight:700,color:C.brown,marginBottom:7}}>pour aller plus loin dans l'app</div>
              {sos.liens.map((l,i)=>(
                <div key={i} style={{fontSize:11,color:sos.couleur,lineHeight:1.8,fontWeight:500}}>→ {l}</div>
              ))}
            </div>
          )}
          <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.border}`}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:12,color:C.brown,lineHeight:1.7,fontStyle:"italic"}}>"{sos.kamila}"</div>
          </div>
        </div>
      </div>
    );
  }

  // ── APP PRINCIPALE ─────────────────────────────────────────────────────────
  return (
    <div className="app-shell" style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",paddingBottom:80}}>

      {/* PARCOURS FATIGUE / ÉNERGIE */}
      {fatigueOpen&&(()=>{
        const ETAPES=[
          {
            titre:"Pourquoi tu es si fatiguée",
            emoji:"🔍",
            intro:"tu peux dormir 10h et te réveiller épuisée. ce n'est pas dans ta tête, et ce n'est pas de la paresse. avec un SMOP, la fatigue ne vient pas d'UN endroit — elle vient de plusieurs à la fois.",
            blocs:[
              {t:"Les 6 sources de ta fatigue",lignes:[
                "l'insuline — les montagnes russes de glycémie épuisent",
                "l'inflammation de bas grade — le corps lutte en permanence",
                "le cortisol — le stress chronique vide les batteries",
                "la thyroïde — souvent ralentie, souvent sous-diagnostiquée",
                "les carences — fer et vitamine D en tête",
                "le rythme circadien — sommeil haché, réveils nocturnes",
              ]},
            ],
            kamila:"le jour où j'ai compris que ma fatigue avait 6 causes possibles et pas une seule, j'ai arrêté de chercher LA solution magique. on s'attaque à chaque source, une par une.",
          },
          {
            titre:"Les 2 choses à vérifier d'abord",
            emoji:"🩸",
            intro:"avant tout le reste, il y a deux analyses qui expliquent une énorme partie des fatigues SMOP. et elles passent souvent à la trappe.",
            blocs:[
              {t:"À demander à ton médecin",lignes:[
                "la FERRITINE — tes réserves de fer. en dessous de 70, la fatigue et la chute de cheveux s'installent, même si on te dit « normale »",
                "la VITAMINE D — très souvent insuffisante, elle joue directement sur ton énergie et ton moral",
              ]},
              {t:"Le réflexe",lignes:[
                "exige le CHIFFRE exact, pas un « c'est bon »",
                "utilise tes scripts médecin et l'onglet Analyses pour les comprendre",
              ]},
            ],
            kamila:"ces deux chiffres ont changé ma vie. pendant des années on m'a dit que tout était normal. ma ferritine était au sol. demande-les.",
          },
          {
            titre:"Ce que tu peux faire dès aujourd'hui",
            emoji:"⚡",
            intro:"pas besoin d'attendre tes résultats pour agir. voici les leviers qui rechargent vraiment, sans te forcer.",
            blocs:[
              {t:"Côté assiette",lignes:[
                "des protéines dès le petit-déj — ça évite le coup de barre de 11h",
                "l'ordre des aliments : légumes, protéines, féculents en dernier",
                "des aliments riches en fer : lentilles, épinards, saumon",
              ]},
              {t:"Côté corps",lignes:[
                "le magnésium bisglycinate le soir — sommeil + énergie",
                "une marche douce, même 10 min — le mouvement recharge",
                "la cohérence cardiaque pour apaiser le cortisol du soir",
              ]},
              {t:"Côté rythme",lignes:[
                "respecte ton énergie selon ton cycle (basse en phase lutéale)",
                "couche-toi avant 23h quand tu peux — le sommeil d'avant minuit compte double",
              ]},
            ],
            kamila:"tu n'as pas à tout faire d'un coup. choisis UN levier cette semaine. l'énergie revient par petites marches, pas d'un coup de baguette.",
          },
          {
            titre:"Tes SOS fatigue, toujours là",
            emoji:"🤍",
            intro:"les jours où c'est trop dur, tu n'es jamais seule. tes fiches SOS sont là pour le moment précis où ça ne va pas.",
            blocs:[
              {t:"À ouvrir selon le moment",lignes:[
                "Fatigue profonde — quand tu es vidée sans raison",
                "Réveil nocturne — quand tu te réveilles à 3h",
                "Fatigue après le repas — le coup de barre digestif",
                "Brouillard mental — quand ta tête tourne au ralenti",
              ]},
            ],
            kamila:"garde ces fiches à portée de main. elles ne te jugent jamais, elles te tendent juste la main au bon moment.",
          },
        ];
        const e=ETAPES[fatigueStep];
        return(
          <div style={{position:"fixed",inset:0,background:C.cream,zIndex:120,maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column"}}>
            {/* header */}
            <div style={{background:"linear-gradient(135deg,#7A5C45,#5E4636)",padding:"16px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
              <button onClick={()=>setFatigueOpen(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:32,height:32,color:"white",fontSize:16,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{"✕"}</button>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"white"}}>Retrouver mon énergie</div>
                <div style={{fontSize:10.5,color:"#E8DDD5"}}>étape {fatigueStep+1} sur {ETAPES.length}</div>
              </div>
            </div>
            {/* barre progression */}
            <div style={{height:4,background:"#E8DDD5",flexShrink:0}}>
              <div style={{height:"100%",width:`${((fatigueStep+1)/ETAPES.length)*100}%`,background:"#7A5C45",transition:"width 0.3s"}}/>
            </div>
            {/* contenu scrollable */}
            <div style={{flex:1,overflowY:"auto",padding:"20px 18px"}}>
              <div style={{fontSize:38,textAlign:"center",marginBottom:8}}>{e.emoji}</div>
              <h2 style={{fontSize:21,fontWeight:800,color:C.brown,textAlign:"center",marginBottom:10,lineHeight:1.2}}>{e.titre}</h2>
              <p style={{fontSize:13,color:C.mid,lineHeight:1.7,textAlign:"center",marginBottom:18}}>{e.intro}</p>
              {e.blocs.map((b,i)=>(
                <div key={i} style={{background:C.white,borderRadius:14,padding:"14px 16px",marginBottom:11,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#7A5C45",textTransform:"uppercase",letterSpacing:0.5,marginBottom:9}}>{b.t}</div>
                  {b.lignes.map((l,j)=>(
                    <div key={j} style={{display:"flex",gap:9,marginBottom:7,alignItems:"flex-start"}}>
                      <div style={{color:"#7A5C45",fontSize:12,flexShrink:0,marginTop:1}}>{"•"}</div>
                      <div style={{fontSize:12.5,color:C.brown,lineHeight:1.5}}>{l}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{background:"#7A5C4515",borderRadius:14,padding:"13px 15px",borderLeft:"3px solid #7A5C45",marginTop:6,marginBottom:8}}>
                <div style={{fontSize:10,fontWeight:700,color:"#7A5C45",marginBottom:4}}>le mot de Kamila</div>
                <div style={{fontSize:12.5,color:C.brown,lineHeight:1.7,fontStyle:"italic"}}>{e.kamila}</div>
              </div>
            </div>
            {/* navigation bas */}
            <div style={{padding:"12px 18px",display:"flex",gap:10,flexShrink:0,borderTop:`1px solid ${C.border}`,background:C.white}}>
              {fatigueStep>0&&(
                <button onClick={()=>setFatigueStep(s=>s-1)} style={{flex:1,padding:"13px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.white,color:C.brown,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Précédent</button>
              )}
              {fatigueStep<ETAPES.length-1?(
                <button onClick={()=>setFatigueStep(s=>s+1)} style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:"#7A5C45",color:"white",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Continuer</button>
              ):(
                <button onClick={()=>setFatigueOpen(false)} style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:"#7A5C45",color:"white",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Terminer</button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ONBOARDING — bienvenue (s'affiche une seule fois) */}
      {showOnboarding&&(
        <div style={{position:"fixed",inset:0,background:"rgba(61,43,31,0.55)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20,maxWidth:430,margin:"0 auto"}}>
          <div style={{background:C.white,borderRadius:22,padding:"1.6rem 1.4rem",maxWidth:360,width:"100%",boxShadow:"0 12px 40px rgba(0,0,0,0.25)"}}>
            <div style={{fontSize:34,textAlign:"center",marginBottom:8}}>🌿</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.35rem",color:C.brown,textAlign:"center",marginBottom:6,lineHeight:1.25}}>Bienvenue {prenom} 💛</div>
            <div style={{fontSize:12.5,color:C.mid,lineHeight:1.6,textAlign:"center",marginBottom:18}}>
              avant de te lancer, juste l'essentiel pour ne pas te sentir perdue :
            </div>

            {[
              {n:"1",t:"Commence par ta mission du jour",d:"chaque jour, une seule action concrète t'attend dans l'onglet Kamila. fais-la, c'est tout. le reste viendra naturellement."},
              {n:"2",t:"Explore les autres onglets quand tu veux",d:"SOS ⚡ quand ça ne va pas, Outils 🧰 pour chercher un aliment ou une idée repas, Analyses 🔬 pour comprendre tes prises de sang."},
              {n:"3",t:"Avance à ton rythme",d:"pas de pression, pas de perfection. un petit geste par jour suffit. je suis là pour t'accompagner, pas pour te juger."},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:11,marginBottom:13,alignItems:"flex-start"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:pc.p,color:"white",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.n}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12.5,fontWeight:700,color:C.brown,marginBottom:2}}>{s.t}</div>
                  <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{s.d}</div>
                </div>
              </div>
            ))}

            <button onClick={()=>{setShowOnboarding(false);save("onboardingDone","yes");}}
              style={{width:"100%",background:pc.p,border:"none",padding:"14px",borderRadius:14,color:"white",fontFamily:"inherit",fontSize:14,fontWeight:600,cursor:"pointer",marginTop:6}}>
              C'est parti, montre-moi le Jour 1 →
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR (ordinateur) */}
      <aside className="sop-sidebar" style={{width:240,flexShrink:0,background:"#2B2723",color:"white",minHeight:"100vh",maxHeight:"100vh",position:"sticky",top:0,flexDirection:"column",padding:"18px 0",overflowY:"auto"}}>
        <div style={{padding:"0 18px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid rgba(255,255,255,.08)",marginBottom:12}}>
          <div style={{width:38,height:38,borderRadius:12,background:pc.p,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="leaf" size={20} color="#fff"/></div>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600}}>SOPK Life</div>
            <div style={{fontSize:8.5,letterSpacing:1.5,textTransform:"uppercase",opacity:.5}}>SMOP Map</div>
          </div>
        </div>
        {[
          {g:"Où j'en suis",items:[{id:"kamila",ic:"home",l:"Mon accueil"},{id:"carte",ic:"map",l:"Ma carte SMOP"}]},
          {g:"Mon suivi",items:[{id:"suivi",ic:"chart",l:"Ta journée"},{id:"cycle",ic:"moon",l:"Mon cycle"},{id:"apercu",ic:"calendar",l:"Vue d'ensemble"},{id:"tendances",ic:"pulse",l:"Mes tendances"},{id:"journal",ic:"calendar",l:"Mon journal"},{id:"mouvement",ic:"steps",l:"Mes mouvements"},{id:"mesures",ic:"heart",l:"Mes mesures"}]},
          {g:"Mes ressources",items:[{id:"outils",ic:"book",l:"Outils & aliments"}]},
          {g:"Mon dossier santé",items:[{id:"medecin",ic:"health",l:"Résumé médecin"},{id:"analyses",ic:"flask",l:"Analyses de sang"}]},
        ].map((grp,gi)=>(
          <div key={gi} style={{marginBottom:14}}>
            <div style={{fontSize:8.5,letterSpacing:1.5,textTransform:"uppercase",opacity:.38,padding:"0 18px",marginBottom:6}}>{grp.g}</div>
            {grp.items.map(it=>(
              <button key={it.id} onClick={()=>setTab(it.id)}
                style={{width:"100%",display:"flex",alignItems:"center",gap:11,padding:"9px 18px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,textAlign:"left",background:tab===it.id?pc.p:"transparent",color:tab===it.id?"white":"rgba(255,255,255,.72)",borderLeft:tab===it.id?"3px solid white":"3px solid transparent"}}>
                <Icon name={it.ic} size={16} color={tab===it.id?"#fff":"rgba(255,255,255,.6)"}/>{it.l}
              </button>
            ))}
          </div>
        ))}
        <div style={{marginTop:"auto",padding:"12px 18px 0",borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <button onClick={()=>setCriseMode(true)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:10,padding:"9px",color:"white",fontFamily:"inherit",fontSize:11.5,fontWeight:600,cursor:"pointer"}}><Icon name="alert" size={14} color="#fff"/>mode crise</button>
          {session && <button onClick={logout} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"rgba(255,255,255,.5)",fontFamily:"inherit",fontSize:10.5,cursor:"pointer"}}>se déconnecter</button>}
          <div style={{fontSize:9,opacity:.4,marginTop:8,textAlign:"center"}}>Bonjour {prenom}</div>
        </div>
      </aside>

      {/* COLONNE PRINCIPALE */}
      <div className="sop-main">

      {/* HEADER premium */}
      <div style={{background:C.cream,padding:"1.1rem 1.25rem 0.5rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={()=>setShowAccount(true)} aria-label="mon compte" style={{display:"flex",alignItems:"center",gap:11,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left",padding:0}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${pc.p},${C.terra})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:15,fontFamily:"'Playfair Display',serif",flexShrink:0}}>{(prenom||"·").slice(0,1).toUpperCase()}</div>
            <div>
              <div style={{fontSize:10,color:C.light}}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:C.brown,fontWeight:600,lineHeight:1.05}}>Bonjour {prenom||"Cyster"}</div>
            </div>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setSearchOpen(true)} aria-label="rechercher"
              style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:"50%",width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.mid,fontSize:17,lineHeight:1,fontFamily:"inherit"}}>⌕</button>
            <button onClick={()=>setShowAccount(true)} aria-label="mon compte"
              style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:"50%",width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.mid,fontFamily:"inherit"}}><Icon name="gear" size={17} color={C.mid}/></button>
          </div>
        </div>
      </div>

      <div style={{padding:"0.75rem 1.25rem 1.25rem"}}>

        {/* Bannière : ajouter à l'écran d'accueil */}
        {!isStandalone && !installDismissed && (
          <div style={{background:C.mauveSoft,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.mauve},${C.terra})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="leaf" size={18} color="#fff"/></div>
            <div style={{flex:1}}>
              <div style={{fontSize:11.5,fontWeight:700,color:C.brown}}>Ajoute SMOP Map à ton écran d'accueil</div>
              <div style={{fontSize:9.5,color:C.mid,marginTop:1}}>pour l'ouvrir comme une app et recevoir tes rappels</div>
            </div>
            <button onClick={()=>canInstallAndroid?triggerInstall():setShowInstall(true)} style={{background:C.brown,color:"#fff",border:"none",borderRadius:9,padding:"8px 12px",fontSize:10.5,fontWeight:700,fontFamily:"inherit",cursor:"pointer",flexShrink:0}}>Installer</button>
            <button onClick={dismissInstall} aria-label="fermer" style={{background:"none",border:"none",color:C.light,fontSize:15,cursor:"pointer",fontFamily:"inherit",padding:"0 2px"}}>✕</button>
          </div>
        )}

        {/* Bouton retour sur les sous-écrans */}
        {(()=>{
          const SUB={cycle:"suivi",apercu:"suivi",tendances:"suivi",mesures:"suivi",journal:"suivi",mouvement:"suivi",sos:"outils"};
          const parent=SUB[tab]; if(!parent) return null;
          const labels={suivi:"Suivi",outils:"Ressources"};
          return(
            <button onClick={()=>setTab(parent)}
              style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",color:C.mid,fontSize:12,fontWeight:600,padding:"2px 0",marginBottom:12}}>
              <Icon name="arrowL" size={16} color={C.mid}/> retour · {labels[parent]}
            </button>
          );
        })()}

        {/* ── MA CARTE SMOP ── */}
        {tab==="carte"&&(()=>{
          const h=PROFIL_HIERARCHIE[profil];
          const prios=PRIORITES_PROFIL[profil]||PRIORITES_PROFIL.metabolique;
          return (
          <div className="fu">
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,color:C.brown,fontWeight:600}}>Ma carte SMOP</div>
              <div style={{fontSize:10.5,color:C.light,marginTop:3}}>tes dimensions, du plus présent au moins urgent · <span style={{fontStyle:"italic"}}>appuie pour explorer</span></div>
            </div>

            {h&&[
              {data:h.dominant},
              {data:h.secondaire},
              {data:h.trace},
            ].map((row,i)=>{
              const target=labelToProfil(row.data.label);
              const isActive=target===profil;
              return (
              <button key={i} onClick={()=>{ if(target && !isActive) setProfilSwitch({key:target,label:row.data.label}); }}
                style={{width:"100%",textAlign:"left",background:C.white,border:`1px solid ${isActive?row.data.col:C.border}`,borderRadius:17,padding:15,marginBottom:11,cursor:target&&!isActive?"pointer":"default",fontFamily:"inherit"}}>
                <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:10}}>
                  <div style={{width:38,height:38,borderRadius:12,background:`${row.data.col}1E`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Icon name={target?(PROFIL_ICON[target]||"leaf"):"leaf"} size={17} color={row.data.col}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.brown}}>{row.data.label}</div>
                    <div style={{fontSize:9.5,color:C.light,marginTop:1}}>{row.data.desc}</div>
                  </div>
                  {isActive
                    ? <div style={{fontSize:8,fontWeight:700,padding:"3px 9px",borderRadius:99,background:`${row.data.col}1E`,color:row.data.col}}>actif</div>
                    : target && <div style={{fontSize:14,color:C.light}}>›</div>}
                </div>
                <div style={{height:6,borderRadius:99,background:C.bubble,overflow:"hidden"}}>
                  <div style={{height:"100%",width:i===0?"72%":i===1?"48%":"26%",background:row.data.col,borderRadius:99}}/>
                </div>
              </button>
            );})}

            {profilSwitch && (
              <div style={{background:C.mauveSoft,borderRadius:14,padding:"13px 15px",margin:"2px 0 14px"}}>
                <div style={{fontSize:11,color:C.brown,lineHeight:1.6,marginBottom:10}}>
                  Tu veux faire du <b>profil {profilSwitch.label}</b> ton parcours principal ? tu pourras revenir quand tu veux.
                  <div style={{fontSize:9.5,color:C.mid,marginTop:5,fontStyle:"italic"}}>on travaille un terrain à la fois — le plus présent d'abord, les autres suivent.</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{const k=profilSwitch.key;setProfil(k);save("profil",k);setProfilSwitch(null);}}
                    style={{flex:1,background:pc.p,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>en faire mon parcours</button>
                  <button onClick={()=>setProfilSwitch(null)}
                    style={{background:"none",border:`1px solid ${C.border}`,color:C.mid,borderRadius:10,padding:"10px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>annuler</button>
                </div>
              </div>
            )}

            <div style={{background:C.mauveSoft,borderRadius:14,padding:"13px 15px",fontSize:11,color:C.mid,lineHeight:1.6,margin:"4px 0 18px"}}>
              ces dimensions t'aident à comprendre ton terrain. <b style={{color:C.brown}}>ce n'est pas une étiquette figée</b> — c'est une carte qui évolue avec toi.
            </div>

            <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.light,marginBottom:10}}>Tes 3 priorités en ce moment</div>
            {prios.map((p,i)=>(
              <button key={i} onClick={()=>setModePrio(true)} style={{width:"100%",textAlign:"left",background:C.white,border:`1px solid ${i===0?p.col:C.border}`,borderRadius:15,padding:14,marginBottom:9,cursor:"pointer",fontFamily:"inherit"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,gap:8}}>
                  <div style={{fontSize:12.5,fontWeight:600,color:C.brown}}>{p.n} · {p.t}</div>
                  <div style={{fontSize:8,color:p.col,background:`${p.col}15`,borderRadius:99,padding:"2px 8px",flexShrink:0}}>effets : {p.quand}</div>
                </div>
                <div style={{fontSize:10,color:p.col,fontWeight:500}}>→ {p.geste}</div>
              </button>
            ))}

            <button onClick={()=>{setTab("medecin");}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:C.bubble,border:`1px solid ${C.border}`,borderRadius:13,padding:13,marginTop:6,cursor:"pointer",fontFamily:"inherit",fontSize:11.5,fontWeight:600,color:C.mid}}>
              <Icon name="flask" size={15} color={C.mid}/>ce qu'il faut faire mesurer
            </button>
          </div>
          );
        })()}

        {/* ── KAMILA ── */}
        {tab==="kamila"&&(
          <div className="fu">
            {/* CARTE ENTRÉE PARCOURS FATIGUE */}
            <button onClick={()=>{setFatigueOpen(true);setFatigueStep(0);}}
              style={{width:"100%",textAlign:"left",border:"none",cursor:"pointer",fontFamily:"inherit",
              background:"linear-gradient(135deg,#7A5C45,#5E4636)",borderRadius:16,padding:"15px 16px",marginBottom:14,
              display:"flex",alignItems:"center",gap:13,boxShadow:"0 6px 20px rgba(122,92,69,0.3)"}}>
              <span style={{fontSize:30,flexShrink:0}}>😴</span>
              <span style={{flex:1}}>
                <span style={{display:"block",fontSize:14,fontWeight:700,color:"white",marginBottom:2}}>Épuisée ? Commence ici.</span>
                <span style={{display:"block",fontSize:11,color:"#E8DDD5",lineHeight:1.4}}>le parcours complet pour comprendre et retrouver ton énergie</span>
              </span>
              <span style={{fontSize:18,color:"#E8DDD5",flexShrink:0}}>→</span>
            </button>

            {/* Compteur de progression */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:700,color:C.brown}}>Jour {day} <span style={{color:C.light,fontWeight:500}}>· {day<=30?"Fondation":"au long cours"}</span></div>
              <div style={{fontSize:10,color:C.light}}>{Object.values(checked).filter(Boolean).length} missions accomplies</div>
            </div>
            {/* Barre de progression */}
            <div style={{height:6,background:C.border,borderRadius:99,marginBottom:12,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min(100,(Object.values(checked).filter(Boolean).length/30)*100)}%`,background:`linear-gradient(90deg,${pc.p},${pc.p}CC)`,borderRadius:99,transition:"width 0.4s"}}/>
            </div>

            {/* Sélecteur jours */}
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14}}>
              <button onClick={()=>setDay(d=>Math.max(1,d-1))} disabled={day<=1}
                style={{flexShrink:0,width:30,height:30,borderRadius:"50%",border:`1.5px solid ${C.border}`,background:C.white,color:day<=1?C.border:pc.p,fontSize:15,cursor:day<=1?"default":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>{"‹"}</button>
              <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2,flex:1}}>
                {Array.from({length:Math.max(30,day+5)},(_,i)=>i+1).slice(Math.max(0,day-4),day+5).map(d=>(
                  <button key={d} onClick={()=>setDay(d)}
                    style={{flexShrink:0,width:32,height:32,borderRadius:"50%",border:`2px solid ${d===day?pc.p:checked[d]?pc.p:C.border}`,background:d===day?pc.p:checked[d]?`${pc.p}20`:C.white,color:d===day?"white":C.brown,fontSize:10,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                    {checked[d]&&d!==day?"✓":d}
                  </button>
                ))}
              </div>
              <button onClick={()=>setDay(d=>Math.min(400,d+1))} disabled={day>=400}
                style={{flexShrink:0,width:30,height:30,borderRadius:"50%",border:`1.5px solid ${day>=400?C.border:pc.p}`,background:day>=400?C.white:pc.p,color:day>=400?C.border:"white",fontSize:15,cursor:day>=400?"default":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:day>=400?"none":`0 2px 8px ${pc.p}50`}}>{"›"}</button>
            </div>

            {/* ── TON PARCOURS, FAIT POUR TOI (personnalisation) ── */}
            {(()=>{
              const prios=PRIORITES_PROFIL[profil]||PRIORITES_PROFIL.metabolique;
              const prio1=prios[0];
              const profLabel=pc;
              return(
                <div style={{background:`linear-gradient(135deg,${pc.l},${C.white})`,border:`1.5px solid ${pc.p}`,borderRadius:14,padding:"12px 14px",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                    <Icon name={PROFIL_ICON[profil]||"leaf"} size={15} color={pc.p}/>
                    <span style={{fontSize:11.5,fontWeight:700,color:C.brown}}>Ton parcours, fait pour toi</span>
                  </div>
                  <div style={{fontSize:11,color:C.mid,lineHeight:1.6,marginBottom:9}}>
                    tu es <strong style={{color:pc.p}}>{profLabel.label}</strong>. ta priorité n°1 en ce moment : <strong style={{color:pc.p}}>{prio1.t.toLowerCase()}</strong>.
                  </div>
                  <div style={{background:C.white,borderRadius:10,padding:"9px 11px",border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:10,color:C.mid,lineHeight:1.5}}>c'est pour ça que ton protocole insiste sur « {prio1.geste.toLowerCase()} ». rien n'est au hasard : chaque mission sert <em>ta</em> priorité.</div>
                  </div>
                  <button onClick={()=>setModePrio(true)}
                    style={{width:"100%",marginTop:9,background:"none",border:`1px solid ${pc.p}`,borderRadius:9,padding:"8px",cursor:"pointer",fontFamily:"inherit",fontSize:10.5,fontWeight:600,color:pc.p}}>
                    voir mes 3 priorités →
                  </button>
                  <button onClick={()=>setScreen("profil-select")}
                    style={{width:"100%",marginTop:6,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:10,color:C.light,textDecoration:"underline"}}>
                    changer de profil
                  </button>
                </div>
              );
            })()}

            {/* ── AUJOURD'HUI TON CORPS ── */}
            {(()=>{
              const OPTS=[{k:"basse",l:"Basse",tip:"sois douce avec toi — vise des missions légères, du repos actif, et pas de culpabilité."},{k:"moyenne",l:"Moyenne",tip:"rythme normal, écoute ton corps au fil de la journée."},{k:"haute",l:"Haute",tip:"profites-en pour bouger un peu plus et avancer sur ta mission."}];
              const sel=OPTS.find(o=>o.k===energie);
              return(
              <div style={{background:C.bubble,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px",marginBottom:10}}>
                <div style={{fontSize:10.5,fontWeight:600,color:C.brown,marginBottom:8,display:"flex",alignItems:"center",gap:6}}><Icon name="bolt" size={13} color={pc.p}/>Comment est ton énergie aujourd'hui ?</div>
                <div style={{display:"flex",gap:6,marginBottom:sel?9:8}}>
                  {OPTS.map(o=>(
                    <button key={o.k} onClick={()=>setEnergie(energie===o.k?null:o.k)}
                      style={{flex:1,padding:"8px 4px",borderRadius:9,border:`1.5px solid ${energie===o.k?pc.p:C.border}`,background:energie===o.k?`${pc.p}15`:C.white,color:energie===o.k?pc.p:C.mid,fontFamily:"inherit",fontSize:11,fontWeight:600,cursor:"pointer"}}>{o.l}</button>
                  ))}
                </div>
                {sel&&(<div style={{fontSize:10.5,color:C.mid,lineHeight:1.5,marginBottom:9}}>{sel.tip}</div>)}
                <button onClick={()=>setTab("cycle")}
                  style={{width:"100%",background:"none",border:`1px solid ${pc.p}`,borderRadius:9,padding:"8px",cursor:"pointer",fontFamily:"inherit",fontSize:10.5,fontWeight:600,color:pc.p,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <Icon name="moon" size={13} color={pc.p}/>suivre mon cycle{regles.length>0?` · dernières règles le ${new Date([...regles].sort().reverse()[0]).toLocaleDateString("fr-FR")}`:""} →
                </button>
              </div>
              );
            })()}

            {/* Entrée — Je viens d'être diagnostiquée */}
            {!load("diagSeen",false)&&(
              <div style={{display:"flex",alignItems:"center",gap:12,background:`${C.mauve}12`,border:`1px solid ${C.mauve}55`,borderRadius:16,padding:"13px 14px",marginBottom:12}}>
                <button onClick={()=>setTab("diag")} style={{flex:1,display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left",padding:0}}>
                  <div style={{width:40,height:40,borderRadius:12,background:C.mauve,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="heart" size={18} color="#fff"/></div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:C.brown}}>Tu viens d'être diagnostiquée ?</div>
                    <div style={{fontSize:10,color:C.mid,marginTop:1,lineHeight:1.4}}>commence ici — l'explication et l'accompagnement qu'on t'a pas donnés</div>
                  </div>
                </button>
                <button onClick={()=>{ save("diagSeen",true); setJournal(p=>({...p})); showToast&&showToast("c'est noté"); }} aria-label="masquer" style={{background:"none",border:"none",color:C.light,fontSize:14,cursor:"pointer",fontFamily:"inherit",padding:"0 2px",flexShrink:0}}>✕</button>
              </div>
            )}

            {/* Mission — hero action du jour */}
            <div style={{background:C.white,borderRadius:20,padding:"1.3rem",marginBottom:12,border:`1.5px solid ${checked[day]?pc.p:C.border}`,transition:"border-color 0.3s",boxShadow:`0 8px 24px ${pc.p}14`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{flex:1,paddingRight:10}}>
                  <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:pc.p,fontWeight:700,marginBottom:9,display:"flex",alignItems:"center",gap:6}}><Icon name="sparkle" size={12} color={pc.p}/>ton action du jour</div>
                  <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.light,marginBottom:6}}>{todayData.theme}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.25rem",fontWeight:600,color:C.brown,lineHeight:1.3,whiteSpace:"pre-line"}}>{todayData.mission}</div>
                </div>
                <button onClick={()=>{
                  const wasChecked=checked[day];
                  setChecked(p=>({...p,[day]:!p[day]}));
                  if(!wasChecked){
                    // mission validée — calcule les jalons
                    const newCount=Object.values({...checked,[day]:true}).filter(Boolean).length;
                    if(day===7) showToast("Première semaine complète","sept jours de cohérence — c'est énorme, bravo.");
                    else if(day===14) showToast("Mi-parcours atteint","la moitié du chemin. ton corps enregistre déjà les changements.");
                    else if(day===21) showToast("Trois semaines","tu tiens le rythme. la plupart abandonnent avant. pas toi.");
                    else if(day===30) showToast("Protocole terminé 🎉","30 jours. tu n'es plus la même qu'au départ. fière de toi.");
                    else if(day%7===0) showToast(`Semaine ${Math.ceil(day/7)} complète`,"une semaine de plus dans la cohérence.");
                    else showToast(`Jour ${day} validé`, todayData.victoire);
                  }
                }}
                  style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${checked[day]?pc.p:C.border}`,background:checked[day]?pc.p:"transparent",cursor:"pointer",fontSize:15,color:"white",flexShrink:0,transition:"all 0.25s",fontFamily:"inherit"}}>
                  {checked[day]?"✓":""}
                </button>
              </div>

              {/* BOUTON VALIDER — bien visible */}
              <button onClick={()=>{
                  const wasChecked=checked[day];
                  setChecked(p=>({...p,[day]:!p[day]}));
                  if(!wasChecked){
                    if(day===7) showToast("Première semaine complète","sept jours de cohérence — c'est énorme, bravo.");
                    else if(day===14) showToast("Mi-parcours atteint","la moitié du chemin. ton corps enregistre déjà les changements.");
                    else if(day===21) showToast("Trois semaines","tu tiens le rythme. la plupart abandonnent avant. pas toi.");
                    else if(day===30) showToast("Protocole terminé 🎉","30 jours. tu n'es plus la même qu'au départ. fière de toi.");
                    else if(day%7===0) showToast(`Semaine ${Math.ceil(day/7)} complète`,"une semaine de plus dans la cohérence.");
                    else showToast(`Jour ${day} validé`, todayData.victoire);
                  }
                }}
                style={{width:"100%",padding:"12px",borderRadius:12,border:`2px solid ${pc.p}`,background:checked[day]?pc.p:"transparent",color:checked[day]?"white":pc.p,fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:4,transition:"all 0.25s"}}>
                {checked[day]?"✓ Mission validée — bravo !":"Valider ma mission du jour"}
              </button>

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
                  <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"#5A7040",fontWeight:600,marginBottom:5}}>le + de Kamila</div>
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

            {/* Message Kamila — compact, sous la mission */}
            {todayData.msg&&(
            <div style={{background:C.bubble,borderRadius:16,padding:"0.95rem 1.05rem",marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:pc.p,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="leaf" size={13} color="#fff"/></div>
                <div style={{fontSize:11,fontWeight:600,color:C.brown}}>Le mot de Kamila</div>
              </div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"0.95rem",color:C.mid,lineHeight:1.55,whiteSpace:"pre-line",fontStyle:"italic"}}>
                {String(todayData.msg).replace(/\n{2,}/g,"\n")}
              </div>
            </div>
            )}

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
                <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:pc.p,marginBottom:5}}>option recommandée — {todayData.tisane.nom}</div>
                <div style={{fontSize:11,color:C.mid,lineHeight:1.6,marginBottom:8}}>{todayData.tisane.texte}</div>
                <div style={{fontSize:9,color:C.light,marginBottom:8}}>timing : {todayData.tisane.timing}</div>
                <a href={todayData.tisane.lien} target="_blank" rel="noreferrer"
                  style={{display:"block",background:pc.p,borderRadius:9,padding:"9px",textAlign:"center",fontSize:11,color:"white",textDecoration:"none",fontWeight:600}}>
                  Commander {todayData.tisane.nom} →
                </a>
              </div>
            )}

            {/* Vocaux Kamila — repliable */}
            {(()=>{ const dispo=VOCAUX.filter(v=>day>=v.unlockDay).length; return (
            <div style={{background:C.white,borderRadius:14,padding:"1rem",marginBottom:10,border:`1px solid ${C.border}`}}>
              <button onClick={()=>setVocauxOpen(o=>!o)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:11,fontWeight:600,color:C.brown}}>🎙️ Messages de Kamila</div>
                  <div style={{fontSize:8.5,color:C.light,marginTop:1}}>tu es au Jour {day} · {dispo} message{dispo>1?"s":""} à écouter</div>
                </div>
                <div style={{fontSize:13,color:pc.p,transform:vocauxOpen?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</div>
              </button>
              {vocauxOpen && (<div style={{marginTop:10}}>
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
                      <div style={{padding:"0 10px 8px"}}>
                        <audio controls preload="none" style={{width:"100%",height:32,marginTop:2}}
                          controlsList="nodownload"
                          src={v.file}>
                        </audio>
                        <a href={v.file} target="_blank" rel="noreferrer"
                          style={{display:"block",textAlign:"center",fontSize:9,color:C.light,textDecoration:"underline",marginTop:4}}>
                          le son ne démarre pas ? ouvre l'audio ici
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{fontSize:9,color:C.light,textAlign:"center",marginTop:4}}>certains messages se débloquent au fil de ton protocole</div>
              </div>)}
            </div>
            ); })()}

            {/* ── COACH MINDSET ── */}
            <div style={{background:`linear-gradient(135deg,${pc.l},${C.cream})`,borderRadius:16,padding:"1rem",marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:12,fontWeight:700,color:C.brown,marginBottom:3}}>Comment tu te sens, là ?</div>
              <div style={{fontSize:10.5,color:C.mid,marginBottom:11,lineHeight:1.5}}>dis-moi ton humeur du moment, et je te réponds.</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {MINDSET.map(m=>{
                  const sel=mindsetOpen===m.id;
                  return(
                    <button key={m.id} onClick={()=>setMindsetOpen(sel?null:m.id)}
                      style={{padding:"8px 12px",borderRadius:99,border:`1.5px solid ${sel?pc.p:C.border}`,background:sel?pc.p:C.white,color:sel?"white":C.brown,fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                      {m.emoji} {m.label}
                    </button>
                  );
                })}
              </div>
              {mindsetOpen&&(()=>{
                const m=MINDSET.find(x=>x.id===mindsetOpen);
                return(
                  <div style={{marginTop:12,background:C.white,borderRadius:12,padding:"13px",border:`1px solid ${pc.p}`,animation:"fadeUp 0.3s ease"}}>
                    <div style={{fontSize:12,color:C.brown,lineHeight:1.7,whiteSpace:"pre-line",marginBottom:10}}>{m.message}</div>
                    <div style={{background:`${pc.p}10`,borderRadius:10,padding:"9px 11px",display:"flex",gap:8,alignItems:"flex-start"}}>
                      <div style={{fontSize:13,flexShrink:0}}></div>
                      <div style={{fontSize:11,color:C.mid,lineHeight:1.5,fontWeight:500}}>{m.geste}</div>
                    </div>
                    <div style={{fontSize:9.5,color:C.light,textAlign:"right",marginTop:7,fontStyle:"italic"}}>— Kamila</div>
                  </div>
                );
              })()}
            </div>

            {/* Navigation */}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setDay(d=>Math.max(1,d-1))} disabled={day<=1}
                style={{flex:1,padding:"9px",border:`1.5px solid ${C.border}`,borderRadius:12,background:C.white,fontFamily:"inherit",fontSize:11,color:day<=1?C.light:C.mid,cursor:day<=1?"not-allowed":"pointer"}}>
                ← précédent
              </button>
              <button onClick={()=>setDay(d=>Math.min(400,d+1))} disabled={day>=400}
                style={{flex:1,padding:"9px",border:`1.5px solid ${checked[day]?pc.p:C.border}`,borderRadius:12,background:checked[day]?`${pc.p}10`:C.white,fontFamily:"inherit",fontSize:11,color:day>=400?C.light:pc.p,cursor:day>=400?"not-allowed":"pointer",fontWeight:500}}>
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
              "t'as pas à gérer ça seule. chaque fiche SOS est là pour le moment exact où tu en as besoin." — Kamila
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
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",color:C.brown,marginBottom:4}}>Mes ressources</div>
            <div style={{fontSize:12,color:C.light,marginBottom:14}}>tout ce dont tu as besoin, bien rangé.</div>

            {/* Accès fiches SOS (toujours visible, au niveau hub) */}
            {!outilOpen && !outilCat && (
            <button onClick={()=>setTab("sos")} style={{width:"100%",display:"flex",alignItems:"center",gap:11,background:"#FDF0E8",border:"1px solid #F0D5C5",borderRadius:14,padding:"13px 14px",marginBottom:14,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              <div style={{width:34,height:34,borderRadius:10,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="alert" size={16} color="#B5553F"/></div>
              <div style={{flex:1}}>
                <div style={{fontSize:12.5,fontWeight:700,color:"#8A4430"}}>Mode crise</div>
                <div style={{fontSize:10,color:"#A86B55",marginTop:1}}>fringale, fatigue, stress, mauvaise nuit… le bon geste sur le moment</div>
              </div>
              <div style={{fontSize:14,color:"#C98B6E"}}>›</div>
            </button>
            )}

            {/* NIVEAU 1 — les familles */}
            {!outilOpen && !outilCat && Object.keys(OUTIL_CATS).map(ck=>{
              const cat=OUTIL_CATS[ck];
              return(
                <button key={ck} onClick={()=>setOutilCat(ck)}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:13,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"15px",marginBottom:11,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  <div style={{width:46,height:46,borderRadius:13,background:cat.dotBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0}}>{cat.em}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.brown}}>{cat.label}</div>
                    <div style={{fontSize:10,color:C.light,marginTop:2,lineHeight:1.4}}>{cat.tools.map(t=>t.nm).join(" · ")}</div>
                  </div>
                  <div style={{fontSize:17,color:C.light}}>›</div>
                </button>
              );
            })}

            {/* NIVEAU 2 — la famille ouverte (liste d'outils) */}
            {!outilOpen && outilCat && OUTIL_CATS[outilCat] && (()=>{
              const cat=OUTIL_CATS[outilCat];
              return(
                <div className="fu">
                  <button onClick={()=>setOutilCat(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",color:C.mid,fontSize:12,fontWeight:600,padding:"2px 0",marginBottom:12}}>
                    <Icon name="arrowL" size={16} color={C.mid}/> retour · Ressources
                  </button>
                  <div style={{background:`linear-gradient(135deg,${C.terra},#B07C55)`,borderRadius:16,padding:"16px 17px",color:"#fff",marginBottom:16}}>
                    <div style={{fontSize:8.5,letterSpacing:2,textTransform:"uppercase",opacity:.8}}>Famille</div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:600,marginTop:4}}>{cat.label}</div>
                    <div style={{fontSize:10.5,opacity:.95,marginTop:5,lineHeight:1.5}}>{cat.hero}</div>
                  </div>
                  {cat.tools.map(t=>(
                    <button key={t.id} onClick={()=>{ if(t.goTab) setTab(t.goTab); else setOutilOpen(t.id); }}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:C.white,border:`1px solid ${C.border}`,borderRadius:13,padding:"13px 14px",marginBottom:9,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                      <div style={{width:36,height:36,borderRadius:10,background:C.mauveSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{t.em}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12.5,fontWeight:600,color:C.brown}}>{t.nm}{t.star&&<span style={{fontSize:8,fontWeight:700,color:"#fff",background:C.terra,borderRadius:99,padding:"2px 7px",marginLeft:6}}>le cœur</span>}</div>
                        <div style={{fontSize:9.5,color:C.light,marginTop:1}}>{t.td}</div>
                      </div>
                      <div style={{fontSize:14,color:C.light}}>›</div>
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* NIVEAU 3 — un outil ouvert : bouton retour vers sa famille */}
            {outilOpen && (()=>{
              const ck=OUTIL_CAT_OF(outilOpen); const lbl=ck?OUTIL_CATS[ck].label:"Ressources";
              return(
                <button onClick={()=>{ setOutilOpen(null); setOutilCat(ck||null); }}
                  style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",color:C.mid,fontSize:12,fontWeight:600,padding:"2px 0",marginBottom:12}}>
                  <Icon name="arrowL" size={16} color={C.mid}/> retour · {lbl}
                </button>
              );
            })()}

            {/* OUTIL : PLANIFICATEUR DE REPAS */}
            {outilOpen==="planif"&&(
              <div className="fu">
                <div style={{display:"flex",gap:6,background:C.bubble,borderRadius:12,padding:4,marginBottom:14}}>
                  {[["semaine","Ma semaine"],["idees","Idées"],["courses","Mes courses"]].map(([id,l])=>{
                    const on=planTab===id;
                    return <button key={id} onClick={()=>setPlanTab(id)}
                      style={{flex:1,padding:"9px 4px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11.5,fontWeight:on?700:500,color:on?C.brown:C.mid,background:on?C.white:"transparent",boxShadow:on?"0 2px 6px rgba(0,0,0,.05)":"none"}}>{l}</button>;
                  })}
                </div>

                {/* MA SEMAINE */}
                {planTab==="semaine"&&(
                  <div>
                    <div style={{fontSize:11,color:C.mid,lineHeight:1.6,background:C.bubble,borderRadius:11,padding:"10px 12px",marginBottom:14}}>compose ta semaine : touche « + » pour piocher un repas. ta liste de courses se remplit toute seule.</div>
                    {JOURS.map(([jk,jl])=>{
                      const d=repasPlan[jk]||{};
                      return(
                        <div key={jk} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 13px",marginBottom:10}}>
                          <div style={{fontSize:12,fontWeight:700,color:pc.p,marginBottom:9,letterSpacing:.3}}>{jl}</div>
                          {SLOTS.map(([sk,sl])=>{
                            const meal=d[sk];
                            return(
                              <div key={sk} style={{display:"flex",alignItems:"center",gap:9,marginBottom:sk!=="soir"?8:0}}>
                                <div style={{width:62,fontSize:9,color:C.light,textTransform:"uppercase",letterSpacing:.5,flexShrink:0}}>{sl}</div>
                                {meal?(
                                  <div style={{flex:1,display:"flex",alignItems:"center",gap:6,background:C.bubble,borderRadius:9,padding:"8px 10px"}}>
                                    <span style={{flex:1,fontSize:11,color:C.brown,lineHeight:1.3}}>{meal}</span>
                                    <button onClick={()=>setRepasPlan(p=>({...p,[jk]:{...(p[jk]||{}),[sk]:null}}))} aria-label="retirer" style={{background:"none",border:"none",color:C.light,fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:"0 2px",flexShrink:0}}>✕</button>
                                  </div>
                                ):(
                                  <button onClick={()=>setPlanPicker({jour:jk,moment:sk})} style={{flex:1,textAlign:"left",background:"none",border:`1px dashed ${C.border}`,borderRadius:9,padding:"8px 10px",fontSize:11,color:C.light,cursor:"pointer",fontFamily:"inherit"}}>+ ajouter</button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* IDÉES */}
                {planTab==="idees"&&(
                  <div>
                    <div style={{fontSize:11,color:C.mid,lineHeight:1.6,background:C.bubble,borderRadius:11,padding:"10px 12px",marginBottom:14}}>de l'inspiration SMOP, classée par moment. pour planifier, va dans « Ma semaine » et touche « + ».</div>
                    {SLOTS.map(([sk,sl])=>(
                      <div key={sk} style={{marginBottom:16}}>
                        <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.light,fontWeight:600,marginBottom:8}}>{sl}</div>
                        {REPAS.filter(r=>r.moment===sk).map((r,i)=>(
                          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 12px",marginBottom:7}}>
                            <div style={{fontSize:12,fontWeight:600,color:C.brown}}>{r.nom}</div>
                            <div style={{fontSize:10,color:C.mid,marginTop:2,lineHeight:1.5}}>{r.compo}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* COURSES */}
                {planTab==="courses"&&(()=>{
                  const auto=[]; const seen={};
                  JOURS.forEach(([jk])=>{ const d=repasPlan[jk]||{}; SLOTS.forEach(([sk])=>{ const nom=d[sk]; if(!nom) return; const r=REPAS.find(x=>x.nom===nom); let ings=[]; if(r&&r.recette&&r.recette.ingredients) ings=r.recette.ingredients; else if(r&&r.compo) ings=r.compo.split("+").map(s=>s.trim()).filter(Boolean); ings.forEach(ing=>{ const key=ing.toLowerCase().replace(/\s+/g," ").trim(); if(!seen[key]){ seen[key]=true; auto.push(ing); } }); }); });
                  const autoVisible=auto.filter(ing=>!coursesRemoved[ing.toLowerCase()]);
                  const rows=[...autoVisible.map(ing=>({ing,custom:false})), ...coursesCustom.map(ing=>({ing,custom:true}))];
                  const nbChecked=rows.filter(r=>coursesChecked[r.ing.toLowerCase()]).length;
                  const addItem=()=>{ const v=coursesInput.trim(); if(!v) return; if(!coursesCustom.some(x=>x.toLowerCase()===v.toLowerCase())&&!autoVisible.some(x=>x.toLowerCase()===v.toLowerCase())) setCoursesCustom(p=>[...p,v]); setCoursesInput(""); };
                  return(
                    <div>
                      <div style={{display:"flex",gap:8,marginBottom:12}}>
                        <input value={coursesInput} onChange={e=>setCoursesInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") addItem(); }} placeholder="ajouter un article à ma liste…"
                          style={{flex:1,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",fontSize:12.5,fontFamily:"inherit",color:C.brown,background:C.white,outline:"none"}}/>
                        <button onClick={addItem} style={{background:pc.p,color:"#fff",border:"none",borderRadius:10,padding:"0 16px",fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:"pointer"}}>+</button>
                      </div>

                      {rows.length===0?(
                        <div style={{background:C.bubble,borderRadius:14,padding:"1.4rem 1rem",textAlign:"center",border:`1px dashed ${C.border}`}}>
                          <div style={{fontSize:26,marginBottom:8}}>🛒</div>
                          <div style={{fontSize:12,color:C.mid,lineHeight:1.6}}>planifie des repas dans « Ma semaine » pour remplir ta liste automatiquement — ou ajoute tes articles à la main ci-dessus.</div>
                        </div>
                      ):(
                        <div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                            <div style={{fontSize:11,color:C.mid}}>{rows.length} article{rows.length>1?"s":""} · {nbChecked} coché{nbChecked>1?"s":""}</div>
                            <button onClick={()=>setCoursesChecked({})} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px",fontSize:10,color:C.mid,cursor:"pointer",fontFamily:"inherit"}}>tout décocher</button>
                          </div>
                          <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"4px 6px"}}>
                            {rows.map((row,i)=>{
                              const ing=row.ing; const key=ing.toLowerCase(); const ch=coursesChecked[key];
                              return(
                                <div key={key+i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 6px",borderBottom:i<rows.length-1?`1px solid ${C.border}`:"none"}}>
                                  <button onClick={()=>setCoursesChecked(p=>({...p,[key]:!p[key]}))} aria-label="coché" style={{background:"none",border:"none",cursor:"pointer",padding:0,flexShrink:0}}>
                                    <div style={{width:19,height:19,borderRadius:6,border:`1.5px solid ${ch?C.sage:C.border}`,background:ch?C.sage:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{ch&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>✓</span>}</div>
                                  </button>
                                  <span style={{flex:1,fontSize:12,color:ch?C.light:C.brown,textDecoration:ch?"line-through":"none"}}>{ing}{row.custom&&<span style={{fontSize:8.5,color:C.terra,marginLeft:6}}>ajouté</span>}</span>
                                  <button onClick={()=>{ if(row.custom) setCoursesCustom(p=>p.filter(x=>x!==ing)); else setCoursesRemoved(p=>({...p,[key]:true})); }} aria-label="retirer" style={{background:"none",border:"none",color:C.light,fontSize:14,cursor:"pointer",fontFamily:"inherit",padding:"0 4px",flexShrink:0}}>✕</button>
                                </div>
                              );
                            })}
                          </div>
                          {Object.keys(coursesRemoved).length>0&&<button onClick={()=>setCoursesRemoved({})} style={{background:"none",border:"none",color:C.light,fontSize:10,cursor:"pointer",fontFamily:"inherit",marginTop:8,textDecoration:"underline"}}>remettre les articles retirés</button>}
                          <div style={{fontSize:9.5,color:C.light,marginTop:10,lineHeight:1.5,textAlign:"center"}}>liste générée depuis tes repas — retire d'un ✕ ce dont tu n'as pas besoin, ajoute tes articles. les quantités sont indicatives.</div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* SÉLECTEUR DE REPAS (overlay) */}
                {planPicker&&(
                  <div onClick={()=>setPlanPicker(null)} style={{position:"fixed",inset:0,zIndex:310,background:"rgba(58,42,32,.45)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                    <div onClick={e=>e.stopPropagation()} style={{background:C.cream,width:"100%",maxWidth:430,borderRadius:"22px 22px 0 0",padding:"1.3rem 1.2rem 1.8rem",maxHeight:"80vh",overflowY:"auto"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.15rem",color:C.brown,fontWeight:600}}>{SLOTS.find(s=>s[0]===planPicker.moment)?.[1]} · {JOURS.find(j=>j[0]===planPicker.jour)?.[1]}</div>
                        <button onClick={()=>{setPlanPicker(null);setPlanCustom("");}} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:"50%",width:30,height:30,cursor:"pointer",color:C.mid,fontSize:14,fontFamily:"inherit"}}>✕</button>
                      </div>

                      {/* Repas libre */}
                      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 12px",marginBottom:14}}>
                        <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:8}}>Mon propre repas</div>
                        <div style={{display:"flex",gap:8}}>
                          <input value={planCustom} onChange={e=>setPlanCustom(e.target.value)} placeholder="ex: mon petit-déj maison…"
                            onKeyDown={e=>{ if(e.key==="Enter"&&planCustom.trim()){ setRepasPlan(p=>({...p,[planPicker.jour]:{...(p[planPicker.jour]||{}),[planPicker.moment]:planCustom.trim()}})); setPlanPicker(null); setPlanCustom(""); showToast("repas ajouté"); } }}
                            style={{flex:1,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",fontSize:12,fontFamily:"inherit",color:C.brown,background:C.cream,outline:"none"}}/>
                          <button onClick={()=>{ if(planCustom.trim()){ setRepasPlan(p=>({...p,[planPicker.jour]:{...(p[planPicker.jour]||{}),[planPicker.moment]:planCustom.trim()}})); setPlanPicker(null); setPlanCustom(""); showToast("repas ajouté"); } }}
                            style={{background:pc.p,color:"#fff",border:"none",borderRadius:10,padding:"0 15px",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer"}}>ok</button>
                        </div>
                      </div>

                      <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.light,fontWeight:600,marginBottom:9}}>ou pioche une idée</div>
                      {REPAS.filter(r=>r.moment===planPicker.moment).map((r,i)=>(
                        <button key={i} onClick={()=>{ setRepasPlan(p=>({...p,[planPicker.jour]:{...(p[planPicker.jour]||{}),[planPicker.moment]:r.nom}})); setPlanPicker(null); showToast("repas ajouté","ta liste de courses se met à jour."); }}
                          style={{width:"100%",textAlign:"left",background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 12px",marginBottom:8,cursor:"pointer",fontFamily:"inherit"}}>
                          <div style={{fontSize:12.5,fontWeight:600,color:C.brown}}>{r.nom}</div>
                          <div style={{fontSize:10,color:C.mid,marginTop:2,lineHeight:1.5}}>{r.compo}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OUTIL : RECHERCHE D'ALIMENTS */}
            {outilOpen==="aliments"&&(
              <div className="fu">
                <div style={{background:C.bubble,borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                  tape un aliment pour voir son index glycémique, ses protéines, et s'il est bon pour ton SMOP.
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
                      aucun aliment trouvé pour "{foodSearch}".<br/>essaie un autre mot
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
                  des idées de repas concrets, pensés pour le SMOP. tous conviennent à toutes les Cysters — l'étoile ⭐ signale un atout spécifique pour ton profil.
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
                      {RECETTES[r.nom]&&(
                        <div style={{marginTop:9}}>
                          <button onClick={()=>setRecetteOpen(recetteOpen===r.nom?null:r.nom)}
                            style={{width:"100%",background:recetteOpen===r.nom?pc.p:`${pc.p}12`,border:`1px solid ${pc.p}`,borderRadius:10,padding:"9px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,color:recetteOpen===r.nom?"white":pc.p,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <span>📖 {recetteOpen===r.nom?"masquer la recette":"voir la recette détaillée"}</span>
                            <span>{recetteOpen===r.nom?"✕":"→"}</span>
                          </button>
                          {recetteOpen===r.nom&&(()=>{
                            const rec=RECETTES[r.nom];
                            return(
                              <div style={{marginTop:8,background:C.cream,borderRadius:12,padding:"13px",animation:"fadeUp 0.3s ease"}}>
                                <div style={{display:"flex",gap:10,marginBottom:10}}>
                                  <div style={{fontSize:9,color:C.mid,background:C.white,borderRadius:99,padding:"3px 9px"}}>⏱️ {rec.temps}</div>
                                  <div style={{fontSize:9,color:C.mid,background:C.white,borderRadius:99,padding:"3px 9px"}}>👥 {rec.pour}</div>
                                </div>
                                <div style={{fontSize:10,fontWeight:700,color:C.brown,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Ingrédients</div>
                                <div style={{marginBottom:12}}>
                                  {rec.ingredients.map((ing,k)=>(
                                    <div key={k} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start"}}>
                                      <div style={{color:pc.p,fontSize:11,flexShrink:0}}>•</div>
                                      <div style={{fontSize:11,color:C.mid,lineHeight:1.4}}>{ing}</div>
                                    </div>
                                  ))}
                                </div>
                                <div style={{fontSize:10,fontWeight:700,color:C.brown,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Préparation</div>
                                <div style={{marginBottom:10}}>
                                  {rec.etapes.map((et,k)=>(
                                    <div key={k} style={{display:"flex",gap:9,marginBottom:7,alignItems:"flex-start"}}>
                                      <div style={{width:18,height:18,borderRadius:"50%",background:pc.p,color:"white",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{k+1}</div>
                                      <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{et}</div>
                                    </div>
                                  ))}
                                </div>
                                {rec.astuce&&(
                                  <div style={{background:`${C.sage}22`,borderRadius:9,padding:"8px 10px",border:`1px solid ${C.sage}`}}>
                                    <div style={{fontSize:10.5,color:"#4F6038",lineHeight:1.5}}>{rec.astuce}</div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* OUTIL : RECETTES */}
            {outilOpen==="recettes"&&(()=>{
              const moments=[{id:"tous",label:"tous"},{id:"matin",label:"🌅 matin"},{id:"midi",label:"☀️ midi"},{id:"soir",label:"🌙 soir"},{id:"collation",label:"🍎 collation"}];
              const tagsCles=[{id:"tous",label:"tout"},{id:"nomade",label:"🎒 nomade"},{id:"rapide",label:"⚡ rapide"},{id:"végé",label:"🌱 végé"},{id:"batch-cookable",label:"🥣 batch"},{id:"anti-fringale",label:"🛡️ anti-fringale"}];
              const noms=Object.keys(RECETTES);
              const filtrees=noms.filter(n=>{
                const r=RECETTES[n];
                const okM=recFiltreMoment==="tous"||r.moment===recFiltreMoment;
                const okT=recFiltreTag==="tous"||(r.tags&&r.tags.includes(recFiltreTag));
                return okM&&okT;
              });
              return(
                <div className="fu">
                  <div style={{background:C.bubble,borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                    {filtrees.length} recettes pensées SMOP — filtre par moment ou par besoin. en déplacement ? choisis 🎒 nomade.
                  </div>
                  {/* Filtres moment */}
                  <div style={{display:"flex",gap:6,marginBottom:8,overflowX:"auto",paddingBottom:2}}>
                    {moments.map(m=>(
                      <button key={m.id} onClick={()=>setRecFiltreMoment(m.id)}
                        style={{flexShrink:0,padding:"6px 11px",borderRadius:99,border:`1.5px solid ${recFiltreMoment===m.id?pc.p:C.border}`,background:recFiltreMoment===m.id?pc.p:C.white,color:recFiltreMoment===m.id?"white":C.mid,fontSize:10.5,fontWeight:500,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {/* Filtres tag */}
                  <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}}>
                    {tagsCles.map(t=>(
                      <button key={t.id} onClick={()=>setRecFiltreTag(t.id)}
                        style={{flexShrink:0,padding:"6px 11px",borderRadius:99,border:`1.5px solid ${recFiltreTag===t.id?C.sage:C.border}`,background:recFiltreTag===t.id?`${C.sage}25`:C.white,color:recFiltreTag===t.id?"#4F6038":C.mid,fontSize:10.5,fontWeight:500,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {/* Liste recettes */}
                  {filtrees.length===0&&(
                    <div style={{textAlign:"center",padding:"30px 20px",color:C.light,fontSize:12}}>aucune recette avec ces filtres. essaie une autre combinaison.</div>
                  )}
                  {filtrees.map(nom=>{
                    const r=RECETTES[nom];
                    const ouverte=recetteFiche===nom;
                    return(
                      <div key={nom} style={{background:C.white,borderRadius:13,marginBottom:9,border:`1px solid ${ouverte?pc.p:C.border}`,overflow:"hidden"}}>
                        <button onClick={()=>setRecetteFiche(ouverte?null:nom)}
                          style={{width:"100%",padding:"12px 14px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12.5,fontWeight:600,color:C.brown,marginBottom:3}}>{nom}</div>
                            <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                              <span style={{fontSize:9,color:C.mid,background:C.cream,borderRadius:99,padding:"2px 7px"}}>⏱️ {r.temps}</span>
                              {r.tags&&r.tags.slice(0,2).map((t,k)=>(
                                <span key={k} style={{fontSize:9,color:"#4F6038",background:`${C.sage}22`,borderRadius:99,padding:"2px 7px"}}>{t}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{fontSize:16,color:pc.p,flexShrink:0}}>{ouverte?"−":"+"}</div>
                        </button>
                        {ouverte&&(
                          <div style={{padding:"0 14px 14px"}}>
                            <div style={{fontSize:10,fontWeight:700,color:C.brown,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Ingrédients</div>
                            <div style={{marginBottom:12}}>
                              {r.ingredients.map((ing,k)=>(
                                <div key={k} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start"}}>
                                  <div style={{color:pc.p,fontSize:11,flexShrink:0}}>•</div>
                                  <div style={{fontSize:11,color:C.mid,lineHeight:1.4}}>{ing}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{fontSize:10,fontWeight:700,color:C.brown,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Préparation</div>
                            <div style={{marginBottom:10}}>
                              {r.etapes.map((et,k)=>(
                                <div key={k} style={{display:"flex",gap:9,marginBottom:7,alignItems:"flex-start"}}>
                                  <div style={{width:18,height:18,borderRadius:"50%",background:pc.p,color:"white",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{k+1}</div>
                                  <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{et}</div>
                                </div>
                              ))}
                            </div>
                            {r.astuce&&(
                              <div style={{background:`${C.sage}22`,borderRadius:9,padding:"8px 10px",border:`1px solid ${C.sage}`}}>
                                <div style={{fontSize:10.5,color:"#4F6038",lineHeight:1.5}}>{r.astuce}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* OUTIL : SUCRES CACHÉS */}
            {outilOpen==="sucres"&&(
              <div className="fu">
                <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                  le sucre se cache sous des dizaines de noms sur les étiquettes. si tu vois l'un de ces mots dans les premiers ingrédients — méfie-toi.
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
                {/* ── TES TISANES SMOP (SOPK) LIFE ── */}
                <div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:4}}>Mes tisanes SOPK Life</div>
                <div style={{fontSize:11,color:C.mid,lineHeight:1.6,marginBottom:12}}>des compléments à base de plantes qui accompagnent ton terrain — elles ne remplacent pas un suivi médical. la séquence : Détox, puis Équilibre Féminin, puis ta tisane de profil.</div>
                {TISANES.map((t,i)=>{
                  const open=tisaneOpen===t.nom;
                  return(
                    <div key={i} style={{background:C.white,border:`1.5px solid ${open?t.couleur:C.border}`,borderRadius:14,marginBottom:9,overflow:"hidden"}}>
                      <button onClick={()=>setTisaneOpen(open?null:t.nom)}
                        style={{width:"100%",display:"flex",alignItems:"center",gap:11,padding:"12px 13px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                        <div style={{width:38,height:38,borderRadius:11,background:`${t.couleur}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{t.em}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12.5,fontWeight:700,color:C.brown}}>{t.nom}</div>
                          <div style={{fontSize:9.5,color:C.light,marginTop:1}}>{t.role}</div>
                        </div>
                        <div style={{fontSize:15,color:C.light,transform:open?"rotate(90deg)":"none",transition:"transform .2s"}}>›</div>
                      </button>
                      {open&&(
                        <div style={{padding:"0 13px 13px"}}>
                          <div style={{fontSize:11,color:C.mid,lineHeight:1.6,marginBottom:10}}>{t.soutient}</div>
                          {[["Plantes",t.plantes],["Quand la boire",t.quand],["Pour qui",t.profil]].map(([k,v],j)=>(
                            <div key={j} style={{marginBottom:8}}>
                              <div style={{fontSize:8.5,letterSpacing:1,textTransform:"uppercase",color:t.couleur,fontWeight:700,marginBottom:2}}>{k}</div>
                              <div style={{fontSize:10.5,color:C.brown,lineHeight:1.5}}>{v}</div>
                            </div>
                          ))}
                          <div style={{background:"#FEF9E7",borderRadius:9,padding:"8px 10px",marginTop:4}}>
                            <div style={{fontSize:9.5,color:"#8A6D2A",lineHeight:1.55}}><b>Précautions</b> — {t.prudence}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div style={{height:1,background:C.border,margin:"16px 0"}}/>
                <div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:4}}>Les compléments utiles</div>
                <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                  les compléments les plus étudiés dans le SMOP. ceux marqués <span style={{color:pc.p,fontWeight:700}}>pour ton profil</span> ({pc.label}) sont prioritaires pour toi. dosage et timing indicatifs — à valider avec ton médecin.
                </div>
                {[...COMPLEMENTS].sort((a,b)=>(b.pour.includes(profil)?1:0)-(a.pour.includes(profil)?1:0)).map((c,i)=>(
                  <div key={i} style={{background:C.white,borderRadius:14,padding:"13px",marginBottom:8,border:`1px solid ${c.pour.includes(profil)?pc.p:C.border}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6,flexWrap:"wrap"}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.brown}}>💊 {c.nom}</div>
                      {c.pour.includes(profil)&&<span style={{fontSize:8,fontWeight:700,color:"#fff",background:pc.p,borderRadius:99,padding:"2px 8px"}}>pour ton profil</span>}
                    </div>
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

            {/* OUTIL : L'ASSIETTE SMOP (SOPK) */}
            {outilOpen==="assiette"&&(
              <div className="fu">
                <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                  le modèle de l'assiette SMOP (SOPK) — pour composer un repas qui stabilise ta glycémie, sans rien peser.
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

                {/* L'ORDRE DES ALIMENTS — le geste qui change tout */}
                <div style={{marginTop:18,marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.brown,marginBottom:4}}>🔢 L'ordre des aliments</div>
                  <div style={{fontSize:11,color:C.light,lineHeight:1.5,marginBottom:10}}>le même repas, mangé dans le bon ordre, fait monter ta glycémie bien moins fort. c'est gratuit, c'est immédiat, et ça change tout.</div>
                  {[
                    {n:"1",t:"Les légumes et les fibres",d:"ils tapissent ton estomac et ralentissent l'absorption du sucre du repas entier",c:"#7A9A5A"},
                    {n:"2",t:"Les protéines et les bons gras",d:"ils prolongent la satiété et continuent de lisser la courbe",c:"#CB9A79"},
                    {n:"3",t:"Les féculents en dernier",d:"arrivés sur un estomac déjà rempli, leur sucre est absorbé bien plus doucement",c:"#D4A56A"},
                  ].map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:11,alignItems:"flex-start",marginBottom:9}}>
                      <div style={{width:26,height:26,borderRadius:"50%",background:s.c,color:"white",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.n}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:C.brown}}>{s.t}</div>
                        <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* LES ASSOCIATIONS MALINES */}
                <div style={{background:C.white,borderRadius:14,padding:"13px",marginBottom:10,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.brown,marginBottom:8}}>🤝 Les associations qui lissent la glycémie</div>
                  {[
                    {bon:"un fruit + une poignée d'amandes",pourquoi:"le gras des amandes ralentit le sucre du fruit"},
                    {bon:"du pain + de l'avocat ou un œuf",pourquoi:"jamais de glucide seul — toujours avec protéine ou gras"},
                    {bon:"des féculents + une grosse portion de légumes",pourquoi:"les fibres atténuent le pic du féculent"},
                    {bon:"un carré de chocolat APRÈS le repas, pas seul",pourquoi:"sur un estomac plein, le pic est bien moindre"},
                  ].map((a,i)=>(
                    <div key={i} style={{marginBottom:9,paddingBottom:9,borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
                      <div style={{fontSize:11.5,fontWeight:600,color:"#4F6038",marginBottom:2}}>✓ {a.bon}</div>
                      <div style={{fontSize:10.5,color:C.mid,lineHeight:1.4}}>{a.pourquoi}</div>
                    </div>
                  ))}
                </div>

                {/* LES ERREURS COURANTES */}
                <div style={{background:"#FBEEE9",borderRadius:14,padding:"13px",marginBottom:10,border:"1px solid #E5C4B5"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#A85A3C",marginBottom:8}}>⚠️ Les pièges fréquents</div>
                  {[
                    "le jus de fruits le matin — même « pur jus », c'est un pic de sucre direct, sans les fibres du fruit entier",
                    "le « petit-déj healthy » granola + fruits + miel — souvent une bombe de sucre déguisée",
                    "sauter un repas — ça provoque la fringale et le craquage plus tard",
                    "manger les féculents en premier quand on a très faim — le pic est maximal",
                  ].map((e,i)=>(
                    <div key={i} style={{display:"flex",gap:7,marginBottom:7,alignItems:"flex-start"}}>
                      <div style={{color:"#C77B5A",fontSize:11,flexShrink:0}}>✗</div>
                      <div style={{fontSize:11,color:"#8A5440",lineHeight:1.5}}>{e}</div>
                    </div>
                  ))}
                </div>

                <button onClick={()=>{ setOutilCat("fiches_imp"); setOutilOpen("telechargements"); }}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:11,background:`${C.terra}14`,border:`1px solid ${C.terra}`,borderRadius:14,padding:"13px 14px",marginTop:4,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  <div style={{width:34,height:34,borderRadius:10,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>📥</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:C.brown}}>Imprime ta fiche « Composer mon assiette »</div>
                    <div style={{fontSize:10,color:C.mid,marginTop:1}}>à garder sur le frigo</div>
                  </div>
                  <div style={{fontSize:14,color:C.terra}}>›</div>
                </button>
              </div>
            )}

            {/* OUTIL : AU QUOTIDIEN (guides par situation) */}
            {outilOpen==="situations"&&(()=>{
              const guides=[
                {id:"petitdej",emoji:"🌅",titre:"Réussir son petit-déj",intro:"le petit-déj programme ta glycémie de toute la journée. un matin trop sucré = fringale assurée à 16h.",points:["vise des PROTÉINES dès le matin : œufs, skyr, fromage blanc, tofu brouillé.","évite le sucre seul : pas de jus, pas de céréales sucrées, pas de tartines de confiture seules.","si tu manges du pain : au levain ou complet, avec de l'avocat ou un œuf.","le porridge OK s'il est accompagné de protéines (skyr, graines) et pas noyé de miel.","pas faim le matin ? une option protéinée légère vaut mieux que rien — ça coupe le grignotage."]},
                {id:"alternatives",emoji:"🔄",titre:"Les échanges malins",intro:"manger SMOP (SOPK)-friendly, ce n'est pas se priver : c'est remplacer intelligemment.",points:["jus de fruits → fruit entier (les fibres changent tout)","céréales sucrées → flocons d'avoine + skyr + fruits rouges","pain blanc → pain au levain ou complet","bonbons → carré de chocolat 85% + amandes","soda → eau pétillante + citron ou thé glacé maison","yaourt aux fruits → yaourt nature + fruits frais"]},
                {id:"dehors",emoji:"🍽️",titre:"Manger dehors sans stress",intro:"resto, cantine, invitation : tu peux profiter ET prendre soin de toi. pas besoin d'être parfaite.",points:["commence toujours par les légumes/la salade présents dans le plat.","choisis une protéine simple : grillée, au four, vapeur.","garde le féculent pour la fin du repas, en quantité raisonnable.","l'alcool : un verre, accompagné de nourriture, jamais l'estomac vide.","le dessert : partage-le, ou prends-le APRÈS un repas complet (le pic est moindre).","un repas ne défait rien. c'est ce que tu fais 95% du temps qui compte."]},
                {id:"urgence",emoji:"⏱️",titre:"Quand t'as pas le temps",intro:"les jours pressés, garde des réflexes simples pour ne pas tomber dans l'ultra-transformé.",points:["aie toujours des œufs : 5 min, protéiné, rassasiant.","une boîte de thon ou sardines + crudités = repas express complet.","des légumes surgelés nature : aussi bons que frais, prêts en 5 min.","prépare en grande quantité le week-end (batch-cooking) : quinoa, légumes rôtis, protéines.","une poignée d'amandes + un fruit dépanne mieux qu'un paquet de biscuits."]},
              ];
              return(
                <div className="fu">
                  <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                    des guides concrets pour les vraies situations de ta vie — pas de la théorie, du réel.
                  </div>
                  {guides.map((g,i)=>{
                    const ouvert=situationOpen===g.id;
                    return(
                      <div key={i} style={{background:C.white,borderRadius:13,marginBottom:9,border:`1px solid ${ouvert?pc.p:C.border}`,overflow:"hidden"}}>
                        <button onClick={()=>setSituationOpen(ouvert?null:g.id)}
                          style={{width:"100%",padding:"13px 14px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:20}}>{g.emoji}</span>
                          <span style={{flex:1,fontSize:13,fontWeight:600,color:C.brown}}>{g.titre}</span>
                          <span style={{fontSize:16,color:pc.p}}>{ouvert?"−":"+"}</span>
                        </button>
                        {ouvert&&(
                          <div style={{padding:"0 14px 14px"}}>
                            <div style={{fontSize:11,color:C.mid,lineHeight:1.6,fontStyle:"italic",marginBottom:10}}>{g.intro}</div>
                            {g.points.map((p,j)=>(
                              <div key={j} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                                <div style={{color:pc.p,fontSize:12,flexShrink:0}}>→</div>
                                <div style={{fontSize:11.5,color:C.brown,lineHeight:1.5}}>{p}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* OUTIL : MES FICHES À IMPRIMER (téléchargements) */}
            {outilOpen==="telechargements"&&(()=>{
              const FICHES_DL=[
                {cat:"🍴 Composer mes repas"},
                {emoji:"🍴",titre:"Composer mon assiette",desc:"l'assiette SMOP en un coup d'œil",url:"https://drive.google.com/file/d/1v7xtHXUcvUU4WT9k5Aw2BE9Xfyn8Z44e/view"},
                {emoji:"🌿",titre:"Le régime méditerranéen",desc:"les aliments piliers d'une alimentation équilibrée",url:"https://drive.google.com/file/d/1IPND_YQTaWnQkUANiTJ-QEdH_B5w0kIL/view"},
                {cat:"🔢 Mes repères"},
                {emoji:"🌾",titre:"L'index glycémique",desc:"le repère ultime : quels aliments privilégier, lesquels limiter",url:"https://drive.google.com/file/d/1VF84PNxas-UFbrU8rEAq5QGi2X3g6pot/view"},
                {emoji:"🥑",titre:"Les bons gras",desc:"oméga-3, gras protecteurs : où les trouver et pourquoi",url:"https://drive.google.com/file/d/1OmLtvVjJ3BiIFgUa3VBs8W_zSOm7YOIS/view"},
                {cat:"💪 Par besoin"},
                {emoji:"💪",titre:"Anti-fatigue & anti-chute",desc:"les aliments riches en fer et magnésium pour ton énergie et tes cheveux",url:"https://drive.google.com/file/d/1eFGMypI7UWVWgzfBNp39A0xscYufYue9/view"},
                {emoji:"🔥",titre:"Anti-inflammatoire",desc:"les aliments qui apaisent ton terrain",url:"https://drive.google.com/file/d/1_ScPK8lCIYwteZBDUHjm7ikojQ2sc6fI/view"},
                {emoji:"✨",titre:"Peau, cheveux & ongles",desc:"les nutriments pour une beauté qui vient de l'intérieur",url:"https://drive.google.com/file/d/1QhSxIhjvULkCmZ4ZGqCDf4Kd19QUpXOf/view"},
                {cat:"🥦 Les nutriments"},
                {emoji:"🍗",titre:"Les protéines",desc:"les meilleures sources et leur index glycémique",url:"https://drive.google.com/file/d/1V4oe--yWJLMTvgDceX9YGyvDXsuNo-hL/view"},
                {emoji:"🌱",titre:"Les protéines végétales",desc:"les meilleures sources végétales de protéines",url:"https://drive.google.com/file/d/1Rxm5uMlnIP-JYZh0BLDUTmF4iNQH6A2Y/view"},
                {emoji:"🌾",titre:"Les fibres",desc:"les meilleures sources d'aliments riches en fibres",url:"https://drive.google.com/file/d/16X0xjDL88ZGBsXJe67QigfA1euKyYAsP/view"},
                {emoji:"💊",titre:"Les vitamines",desc:"guide complet des vitamines et de leurs sources",url:"https://drive.google.com/file/d/1UwuFI4pBrABhQquCbDUN8EXA2C_SXXju/view"},
                {emoji:"💊",titre:"Les vitamines (suite)",desc:"vitamines A, B et leurs sources alimentaires",url:"https://drive.google.com/file/d/1MfIANYfEuGZZXLy3qjC4plKlrsitKH2s/view"},
                {emoji:"⭐",titre:"Les super-aliments",desc:"les aliments d'exception et leurs bienfaits",url:"https://drive.google.com/file/d/1E3_30E4cNKAiVpvh-GwwRL3vY497OX2X/view"},
                {cat:"🩸 Mes analyses"},
                {emoji:"🩸",titre:"Le guide des analyses SMOP",desc:"comprendre tes prises de sang : chaque marqueur expliqué simplement",url:"https://drive.google.com/file/d/1tjAtk8V0PGOP6SyZuPXowx0znSQfBTj-/view"},
              ];
              return(
                <div className="fu">
                  <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                    tes fiches à télécharger, imprimer et afficher sur ton frigo. elles sont à toi, pour toujours.
                  </div>
                  {FICHES_DL.map((f,i)=>(
                    f.cat?(
                      <div key={i} style={{fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:0.8,margin:"16px 0 7px 2px"}}>{f.cat}</div>
                    ):(
                    <div key={i} style={{background:C.white,borderRadius:13,padding:"13px 14px",marginBottom:9,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:26,flexShrink:0}}>{f.emoji}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.brown}}>{f.titre}</div>
                        <div style={{fontSize:10.5,color:C.light,lineHeight:1.4,marginTop:2}}>{f.desc}</div>
                      </div>
                      {f.url?(
                        <a href={f.url} target="_blank" rel="noopener noreferrer"
                          style={{background:C.gold,color:"white",fontSize:11,fontWeight:600,padding:"8px 14px",borderRadius:20,textDecoration:"none",flexShrink:0,whiteSpace:"nowrap"}}>
                          Télécharger
                        </a>
                      ):(
                        <span style={{background:C.cream,color:C.light,fontSize:10.5,fontWeight:500,padding:"8px 12px",borderRadius:20,flexShrink:0,whiteSpace:"nowrap"}}>
                          bientôt
                        </span>
                      )}
                    </div>
                    )
                  ))}
                </div>
              );
            })()}

            {/* OUTIL : FICHES THÉMATIQUES */}
            {outilOpen==="fiches"&&(()=>{
              const FICHES=[
                {id:"proteines",emoji:"🍗",titre:"Les protéines",sous:"ton meilleur allié anti-fringale",
                 intro:"si tu ne devais retenir qu'une chose côté alimentation SMOP (SOPK) : mange assez de protéines, à chaque repas. c'est le levier numéro un pour stabiliser ta glycémie et couper les fringales.",
                 sections:[
                   {t:"pourquoi c'est central",c:["les protéines ralentissent l'absorption du sucre du repas — donc moins de pics, moins de fringales.","elles prolongent la satiété : tu tiens entre les repas sans grignoter.","elles soutiennent la masse musculaire, qui aide ton corps à mieux gérer la glycémie."]},
                   {t:"où les trouver",c:["animales : œufs, poulet, dinde, poisson, fruits de mer, viande maigre.","végétales : légumineuses (lentilles, pois chiches), tofu, tempeh, edamame.","laitières : skyr, fromage blanc, yaourt grec (plus protéinés que les classiques)."]},
                   {t:"le réflexe à prendre",c:["pose-toi une question à chaque repas : « où est ma protéine ? »","vise une source de protéine dès le petit-déjeuner — c'est ce qui change tout sur la journée.","une collation qui cale = toujours une protéine ou un bon gras (skyr, œuf dur, amandes)."]},
                 ]},
                {id:"antiinflammatoire",emoji:"🔥",titre:"L'anti-inflammatoire",sous:"apaiser le terrain",
                 intro:"le SMOP s'accompagne souvent d'une inflammation de bas grade. certains aliments l'apaisent, d'autres l'entretiennent. l'idée n'est pas la perfection, mais d'orienter la balance.",
                 sections:[
                   {t:"à mettre dans ton assiette",c:["poissons gras (saumon, sardines, maquereau) : riches en oméga-3.","légumes colorés et verts : antioxydants et fibres.","épices : curcuma, gingembre, cannelle de Ceylan.","huile d'olive, oléagineux, graines (lin, chia)."]},
                   {t:"à limiter",c:["sucres rapides et produits ultra-transformés.","graisses de mauvaise qualité (fritures, plats industriels).","excès de produits raffinés."]},
                   {t:"bon à savoir",c:["l'alimentation à index glycémique bas a montré des effets bénéfiques sur les marqueurs du SMOP (Marsh et al., 2010).","ce n'est pas un régime à suivre à 100% : c'est une direction à prendre, repas après repas."]},
                 ]},
                {id:"mineraux",emoji:"✨",titre:"Minéraux & vitamines",sous:"les piliers à surveiller",
                 intro:"certaines carences sont fréquentes avec le SMOP et aggravent les symptômes (fatigue, chute de cheveux). les connaître, c'est savoir quoi faire vérifier par ton médecin.",
                 sections:[
                   {t:"à faire surveiller en priorité",c:["la ferritine (réserves de fer) : une ferritine basse épuise et fait tomber les cheveux, même quand on te dit « normale ».","la vitamine D : très souvent insuffisante, elle joue sur l'énergie et l'humeur.","le magnésium : impliqué dans la gestion du stress et du sommeil."]},
                   {t:"où les trouver dans l'assiette",c:["fer : viande rouge maigre, lentilles, épinards (avec de la vitamine C pour mieux l'absorber).","magnésium : oléagineux, chocolat noir, légumes verts, légumineuses.","vitamine D : poissons gras, œufs — mais l'alimentation seule suffit rarement, d'où l'intérêt de la doser."]},
                   {t:"important",c:["ne te supplémente jamais à l'aveugle : fais d'abord doser par une prise de sang.","un complément ne remplace pas une alimentation équilibrée — il la complète."]},
                 ]},
                {id:"microbiote",emoji:"🌱",titre:"Le microbiote",sous:"ton ventre, ton allié",
                 intro:"un microbiote intestinal équilibré participe à la régulation de l'inflammation et du métabolisme. en prendre soin, c'est soutenir tout le terrain SMOP.",
                 sections:[
                   {t:"ce qui le nourrit",c:["les fibres : légumes, légumineuses, fruits entiers, céréales complètes.","les aliments fermentés : yaourt nature, kéfir, choucroute.","la diversité : varie les végétaux dans la semaine."]},
                   {t:"ce qui le malmène",c:["l'excès de sucre et d'ultra-transformé.","le manque de fibres.","les régimes très restrictifs et répétés."]},
                   {t:"le réflexe",c:["vise de la variété végétale : l'objectif n'est pas un aliment miracle, mais la diversité.","ajoute progressivement les fibres si tu n'y es pas habituée, pour laisser ton ventre s'adapter."]},
                 ]},
              ];
              return(
                <div className="fu">
                  <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                    tes fiches SMOP pour comprendre ton corps en profondeur — chaque thème expliqué simplement, sans jargon.
                  </div>
                  {FICHES.map((f,i)=>{
                    const ouvert=ficheOpen===f.id;
                    return(
                      <div key={i} style={{background:C.white,borderRadius:13,marginBottom:9,border:`1px solid ${ouvert?pc.p:C.border}`,overflow:"hidden"}}>
                        <button onClick={()=>setFicheOpen(ouvert?null:f.id)}
                          style={{width:"100%",padding:"13px 14px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:11}}>
                          <span style={{fontSize:22}}>{f.emoji}</span>
                          <span style={{flex:1}}>
                            <span style={{display:"block",fontSize:13,fontWeight:600,color:C.brown}}>{f.titre}</span>
                            <span style={{display:"block",fontSize:10.5,color:C.light}}>{f.sous}</span>
                          </span>
                          <span style={{fontSize:16,color:pc.p}}>{ouvert?"−":"+"}</span>
                        </button>
                        {ouvert&&(
                          <div style={{padding:"0 14px 14px"}}>
                            <div style={{fontSize:11.5,color:C.mid,lineHeight:1.7,fontStyle:"italic",marginBottom:12,background:C.cream,borderRadius:10,padding:"10px 12px"}}>{f.intro}</div>
                            {f.sections.map((s,j)=>(
                              <div key={j} style={{marginBottom:12}}>
                                <div style={{fontSize:11,fontWeight:700,color:pc.p,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{s.t}</div>
                                {s.c.map((line,k)=>(
                                  <div key={k} style={{display:"flex",gap:8,marginBottom:5,alignItems:"flex-start"}}>
                                    <div style={{color:pc.p,fontSize:11,flexShrink:0}}>•</div>
                                    <div style={{fontSize:11.5,color:C.brown,lineHeight:1.5}}>{line}</div>
                                  </div>
                                ))}
                              </div>
                            ))}
                            <div style={{fontSize:9.5,color:C.light,fontStyle:"italic",marginTop:4,lineHeight:1.5}}>information éducative, ne remplace pas un avis médical. parles-en à ton professionnel de santé.</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* OUTIL : COMPRENDRE LES ALIMENTS */}
            {outilOpen==="comprendre"&&(
              <div className="fu">
                {/* ── LES MÉCANISMES DU SMOP ── */}
                <div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:4}}>Comment marche ton SMOP</div>
                <div style={{fontSize:11,color:C.mid,lineHeight:1.6,marginBottom:12}}>pas pour te faire peur — pour que tu comprennes ce qui se joue dans ton corps, et pourquoi chaque geste compte. touche un mécanisme pour l'ouvrir.</div>
                {MECANISMES.map((m,i)=>{
                  const open=mecaOpen===m.nom;
                  return(
                    <div key={i} style={{background:C.white,border:`1.5px solid ${open?m.couleur:C.border}`,borderRadius:14,marginBottom:9,overflow:"hidden"}}>
                      <button onClick={()=>setMecaOpen(open?null:m.nom)}
                        style={{width:"100%",display:"flex",alignItems:"center",gap:11,padding:"12px 13px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                        <div style={{width:38,height:38,borderRadius:11,background:`${m.couleur}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{m.em}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12.5,fontWeight:700,color:C.brown}}>{m.nom}</div>
                          <div style={{fontSize:9.5,color:C.light,marginTop:1}}>{m.court}</div>
                        </div>
                        <div style={{fontSize:15,color:C.light,transform:open?"rotate(90deg)":"none",transition:"transform .2s"}}>›</div>
                      </button>
                      {open&&(
                        <div style={{padding:"0 13px 13px"}}>
                          <div style={{fontSize:11.5,color:C.brown,lineHeight:1.65,marginBottom:10}}>{m.texte}</div>
                          <div style={{background:`${m.couleur}18`,borderRadius:9,padding:"8px 11px"}}>
                            <div style={{fontSize:8.5,letterSpacing:1,textTransform:"uppercase",color:m.couleur,fontWeight:700,marginBottom:2}}>ce que ça donne au quotidien</div>
                            <div style={{fontSize:10.5,color:C.mid,lineHeight:1.5}}>{m.signes}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div style={{height:1,background:C.border,margin:"16px 0"}}/>
                <div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:8}}>Bien manger pour ton SMOP</div>
                <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                  comprendre POURQUOI certains aliments t'aident et d'autres t'épuisent — pour choisir en connaissance de cause, pas par règles aveugles.
                </div>
                {[
                  {emoji:"🟢",titre:"À privilégier",coul:"#7A9A5A",items:[
                    {nom:"Légumes verts & crucifères",pourquoi:"brocoli, chou, épinards : riches en fibres, ils lissent la glycémie et soutiennent l'élimination des hormones par le foie."},
                    {nom:"Protéines de qualité",pourquoi:"œufs, poisson, volaille, légumineuses : elles stabilisent la glycémie et coupent les fringales."},
                    {nom:"Bons gras",pourquoi:"avocat, huile d'olive, oléagineux, poissons gras : ils ralentissent l'absorption du sucre et apaisent l'inflammation."},
                    {nom:"Féculents à index bas",pourquoi:"quinoa, légumineuses, patate douce, pain au levain : de l'énergie qui ne fait pas flamber l'insuline."},
                  ]},
                  {emoji:"🟠",titre:"À limiter",coul:"#D4A56A",items:[
                    {nom:"Sucres rapides",pourquoi:"sodas, jus, pâtisseries, bonbons : pics de glycémie qui aggravent la résistance à l'insuline."},
                    {nom:"Produits ultra-transformés",pourquoi:"plats industriels, snacks : sucres et graisses cachés, additifs pro-inflammatoires."},
                    {nom:"Féculents raffinés",pourquoi:"pain blanc, riz blanc, pâtes blanches : index élevé, pic rapide. préfère les versions complètes."},
                  ]},
                ].map((cat,i)=>(
                  <div key={i} style={{marginBottom:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:cat.coul,marginBottom:8}}>{cat.emoji} {cat.titre}</div>
                    {cat.items.map((it,j)=>(
                      <div key={j} style={{background:C.white,borderRadius:12,padding:"11px 13px",marginBottom:7,border:`1px solid ${C.border}`,borderLeft:`3px solid ${cat.coul}`}}>
                        <div style={{fontSize:12,fontWeight:600,color:C.brown,marginBottom:3}}>{it.nom}</div>
                        <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{it.pourquoi}</div>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{background:`${C.sage}22`,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.sage}`}}>
                  <div style={{fontSize:11,color:"#4F6038",lineHeight:1.6}}>
                    <strong>l'esprit, pas les règles :</strong> il n'y a pas d'aliment « interdit ». il y a des choix qui apaisent ton corps et d'autres qui le sollicitent. tu apprends à doser, pas à te priver.
                  </div>
                </div>

                {/* ── BANQUE DE CONNAISSANCES ── */}
                <div style={{height:1,background:C.border,margin:"18px 0"}}/>
                <div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:4}}>Ta banque de connaissances</div>
                <div style={{fontSize:11,color:C.mid,lineHeight:1.6,marginBottom:12}}>les sujets qu'on ne t'a jamais vraiment expliqués. ouvre celui qui te parle, à ton rythme.</div>
                {SAVOIRS.map((s,i)=>{
                  const open=savoirOpen===s.t;
                  return(
                    <div key={i} style={{background:C.white,border:`1.5px solid ${open?s.couleur:C.border}`,borderRadius:14,marginBottom:9,overflow:"hidden"}}>
                      <button onClick={()=>setSavoirOpen(open?null:s.t)}
                        style={{width:"100%",display:"flex",alignItems:"center",gap:11,padding:"12px 13px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                        <div style={{width:36,height:36,borderRadius:10,background:`${s.couleur}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{s.em}</div>
                        <div style={{flex:1,fontSize:12.5,fontWeight:700,color:C.brown,lineHeight:1.25}}>{s.t}</div>
                        <div style={{fontSize:15,color:C.light,transform:open?"rotate(90deg)":"none",transition:"transform .2s"}}>›</div>
                      </button>
                      {open&&(
                        <div style={{padding:"0 14px 14px"}}>
                          {s.corps.map((p,j)=>(
                            <div key={j} style={{fontSize:11.5,color:C.brown,lineHeight:1.65,marginBottom:j<s.corps.length-1?9:0}}>{p}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div style={{fontSize:9.5,color:C.light,lineHeight:1.5,marginTop:6,textAlign:"center"}}>ces repères t'aident à comprendre — ils ne remplacent pas l'avis de ton médecin.</div>
              </div>
            )}

            {/* OUTIL : MES COURSES */}
            {outilOpen==="courses"&&(
              <div className="fu">
                <div style={{background:C.bubble,borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:C.mid,lineHeight:1.6,border:`1px solid ${C.border}`}}>
                  ta liste de courses SMOP (SOPK) : remplis ton caddie avec les bons réflexes, et apprends à déjouer les pièges du supermarché.
                </div>

                {/* Liste de courses type */}
                <div style={{fontSize:13,fontWeight:700,color:C.brown,marginBottom:8}}>🛒 Ta liste type</div>
                {[
                  {cat:"Légumes",c:"#7A9A5A",ex:"brocoli, épinards, courgette, poivron, salade, chou-fleur, haricots verts"},
                  {cat:"Protéines",c:"#CB9A79",ex:"œufs, poulet, saumon, sardines, thon, tofu, lentilles, pois chiches"},
                  {cat:"Bons gras",c:"#B8C5A0",ex:"avocat, huile d'olive, amandes, noix, graines de courge, graines de chia"},
                  {cat:"Féculents malins",c:"#D4A56A",ex:"quinoa, riz complet, patate douce, pain au levain, flocons d'avoine"},
                  {cat:"Épicerie",c:"#A88BAE",ex:"cannelle de Ceylan, curcuma, lait de coco, tahini, chocolat 85%, thé vert"},
                ].map((g,i)=>(
                  <div key={i} style={{background:C.white,borderRadius:12,padding:"11px 13px",marginBottom:7,border:`1px solid ${C.border}`,borderLeft:`3px solid ${g.c}`}}>
                    <div style={{fontSize:12,fontWeight:600,color:g.c,marginBottom:3}}>{g.cat}</div>
                    <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{g.ex}</div>
                  </div>
                ))}

                {/* Lire les étiquettes */}
                <div style={{fontSize:13,fontWeight:700,color:C.brown,marginTop:16,marginBottom:8}}>🔍 Lire une étiquette en 10 secondes</div>
                <div style={{background:C.white,borderRadius:14,padding:"13px",marginBottom:10,border:`1px solid ${C.border}`}}>
                  {[
                    {t:"Regarde les sucres pour 100g",d:"sous 5g = ok, au-delà de 15-20g pour un produit salé = méfiance."},
                    {t:"Lis la liste des ingrédients",d:"plus elle est courte, mieux c'est. si le sucre est dans les 3 premiers — repose-le."},
                    {t:"Traque les sucres déguisés",d:"sirop de glucose, dextrose, maltodextrine, jus de canne… ce sont tous des sucres."},
                    {t:"« sans sucres ajoutés » ≠ sans sucre",d:"le produit peut contenir naturellement beaucoup de sucre. vérifie quand même."},
                  ].map((it,i)=>(
                    <div key={i} style={{marginBottom:9,paddingBottom:9,borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
                      <div style={{fontSize:11.5,fontWeight:600,color:C.brown,marginBottom:2}}>{it.t}</div>
                      <div style={{fontSize:10.5,color:C.mid,lineHeight:1.4}}>{it.d}</div>
                    </div>
                  ))}
                </div>

                {/* Pièges du supermarché */}
                <div style={{background:"#FBEEE9",borderRadius:14,padding:"13px",border:"1px solid #E5C4B5"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#A85A3C",marginBottom:8}}>⚠️ Les pièges du supermarché</div>
                  {[
                    "les produits « minceur » ou « light » : souvent plus sucrés pour compenser le goût.",
                    "les céréales du petit-déj « équilibre » : presque toujours très sucrées.",
                    "les yaourts aux fruits : préfère un yaourt nature + des fruits frais que tu ajoutes.",
                    "faire ses courses le ventre vide : tu achètes plus de sucre. mange avant d'y aller.",
                  ].map((e,i)=>(
                    <div key={i} style={{display:"flex",gap:7,marginBottom:7,alignItems:"flex-start"}}>
                      <div style={{color:"#C77B5A",fontSize:11,flexShrink:0}}>✗</div>
                      <div style={{fontSize:11,color:"#8A5440",lineHeight:1.5}}>{e}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="cycle"&&(()=>{
          const asDate=(s)=>new Date(s+"T00:00:00");
          const dayDiff=(a,b)=>Math.round((asDate(b)-asDate(a))/86400000);
          const dates=[...new Set(regles)].sort();
          const gaps=[]; for(let i=1;i<dates.length;i++) gaps.push(dayDiff(dates[i-1],dates[i]));
          const typique = gaps.length? Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length) : null;
          const minG=gaps.length?Math.min(...gaps):null, maxG=gaps.length?Math.max(...gaps):null;
          const last = dates.length?dates[dates.length-1]:null;
          const todayISO = new Date().toISOString().slice(0,10);
          const cycleDay = last? dayDiff(last,todayISO)+1 : null;
          let phase=null, phaseCol="#C2AEBA", phaseNote=null;
          if(cycleDay){
            if(cycleDay<=5){ phase="Règles"; phaseCol="#C98B86"; }
            else if(typique){
              const ovu=Math.max(10, typique-14);
              if(cycleDay < ovu-2){ phase="Phase folliculaire"; phaseCol="#B8C5A0"; }
              else if(cycleDay<=ovu+2){ phase="Fenêtre fertile estimée"; phaseCol="#D4A56A"; }
              else if(cycleDay<=typique+3){ phase="Phase lutéale"; phaseCol="#A89AB8"; }
              else { phase="Cycle qui s'allonge"; phaseCol="#B07D4F"; phaseNote="ton cycle dépasse ta durée habituelle — l'ovulation a pu se décaler, ou ne pas avoir lieu ce mois-ci. c'est fréquent avec un SMOP (SOPK), et ce n'est pas un échec de ton corps."; }
            } else { phase="Phase folliculaire"; phaseCol="#B8C5A0"; phaseNote="note une 2e période de règles et j'estimerai mieux tes phases."; }
          }
          const nextRange = (last&&gaps.length)? (()=>{ const f=(off)=>{const d=asDate(last);d.setDate(d.getDate()+off);return d.toLocaleDateString("fr-FR",{day:"numeric",month:"short"});}; return minG===maxG? f(minG) : `${f(minG)} – ${f(maxG)}`; })() : null;
          const tresIrregulier = (minG!=null && maxG-minG>20);
          const fmtD=(s)=>asDate(s).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"});
          return (
          <div className="fu">
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:C.brown,marginBottom:2}}>Ton cycle</div>
            <div style={{fontSize:12,color:C.light,marginBottom:14,lineHeight:1.5}}>compté depuis tes vraies règles — jamais sur un modèle de 28 jours.</div>

            {cycleDay ? (
              <div style={{background:`linear-gradient(135deg,${phaseCol},${phaseCol}CC)`,borderRadius:18,padding:"20px",color:"white",marginBottom:14}}>
                <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",opacity:.8}}>Aujourd'hui</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"2rem",lineHeight:1.1,margin:"2px 0 4px"}}>Jour {cycleDay}</div>
                <div style={{fontSize:14,fontWeight:600}}>{phase}</div>
                {phaseNote&&<div style={{fontSize:11,opacity:.9,lineHeight:1.5,marginTop:8}}>{phaseNote}</div>}
              </div>
            ) : (
              <div style={{background:C.white,border:`1px dashed ${C.border}`,borderRadius:16,padding:"24px 18px",textAlign:"center",color:C.light,fontSize:12.5,lineHeight:1.6,marginBottom:14}}>
                🌙 note le <b style={{color:C.mid}}>1er jour de tes dernières règles</b> pour voir ton jour de cycle et ta phase.
              </div>
            )}

            {dates.length>0 && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px"}}><div style={{fontSize:9,letterSpacing:.5,textTransform:"uppercase",color:C.light}}>Cycles enregistrés</div><div style={{fontSize:17,fontWeight:600,color:C.brown}}>{gaps.length}</div></div>
                <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px"}}><div style={{fontSize:9,letterSpacing:.5,textTransform:"uppercase",color:C.light}}>Durée typique</div><div style={{fontSize:17,fontWeight:600,color:C.brown}}>{typique?`${typique} j`:"—"}</div></div>
                <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px"}}><div style={{fontSize:9,letterSpacing:.5,textTransform:"uppercase",color:C.light}}>Du plus court au plus long</div><div style={{fontSize:15,fontWeight:600,color:C.brown}}>{minG!=null?`${minG}–${maxG} j`:"—"}</div></div>
                <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px"}}><div style={{fontSize:9,letterSpacing:.5,textTransform:"uppercase",color:C.light}}>Prochaines règles · fourchette</div><div style={{fontSize:13,fontWeight:600,color:C.brown}}>{nextRange||"—"}</div></div>
              </div>
            )}

            {tresIrregulier && <div style={{fontSize:10.5,color:C.mid,marginBottom:14,lineHeight:1.5,fontStyle:"italic"}}>tes cycles vont de {minG} à {maxG} jours — c'est pour ça que la fourchette est large. c'est normal avec un SMOP (SOPK) : on ne peut pas prédire une date précise, juste une période probable.</div>}

            <div style={{background:C.white,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",color:pc.p,fontWeight:600,marginBottom:10}}>Noter mes règles</div>
              <button onClick={()=>{ setRegles(r=> r.includes(todayISO)?r:[todayISO,...r].slice(0,36)); showToast("règles notées 📅","tes données de cycle se construisent — précieux pour ton médecin."); }}
                style={{width:"100%",background:pc.p,border:"none",borderRadius:11,padding:"12px",color:"white",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:10}}>mes règles ont commencé aujourd'hui</button>
              <div style={{fontSize:10,color:C.light,marginBottom:6}}>ou une autre date :</div>
              <div style={{display:"flex",gap:8}}>
                <input type="date" value={reglesInput} max={todayISO} onChange={e=>setReglesInput(e.target.value)} style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:11,padding:"10px 12px",fontFamily:"inherit",fontSize:13,color:C.brown,background:C.cream,outline:"none"}}/>
                <button onClick={()=>{ if(reglesInput){ setRegles(r=> r.includes(reglesInput)?r:[reglesInput,...r].slice(0,36)); setReglesInput(""); showToast("règles notées 📅"); } }} style={{background:C.bubble,border:`1px solid ${C.border}`,borderRadius:11,padding:"0 16px",color:C.brown,fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer"}}>ajouter</button>
              </div>
            </div>

            {dates.length>0 && (
              <div style={{background:C.white,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",color:C.light,marginBottom:10}}>Historique</div>
                {[...dates].reverse().map((d,i,arr)=>{ const nextD=arr[i-1]; const len=nextD?dayDiff(d,nextD):null; return (
                  <div key={d} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
                    <span style={{fontSize:12,color:C.brown}}>{fmtD(d)}{len!=null?<span style={{color:C.light,fontSize:10.5}}> · cycle de {len} j</span>:<span style={{color:C.light,fontSize:10.5}}> · en cours</span>}</span>
                    <button onClick={()=>setRegles(r=>r.filter(x=>x!==d))} style={{background:"none",border:"none",color:C.light,fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:"0 4px"}}>✕</button>
                  </div>
                ); })}
              </div>
            )}

            <div style={{fontSize:10.5,color:C.mid,background:`${C.sage}22`,borderRadius:10,padding:"11px 13px",lineHeight:1.6}}>avec un SMOP (SOPK), ces repères sont des estimations — l'ovulation peut se décaler, et un cycle long (même 60 jours ou plus) est une info, pas une faute. c'est ton ressenti et tes vraies règles qui comptent. noter tes cycles, même irréguliers, est une mine d'or pour ton médecin.</div>
          </div>
          );
        })()}

        {tab==="suivi"&&(
          <div className="fu">
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:C.brown,marginBottom:10}}>Ta journée</div>

            {/* Navigation jour par jour */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"8px 10px",marginBottom:6}}>
              <button onClick={()=>setDayOffset(o=>o-1)} aria-label="jour précédent" style={{width:30,height:30,borderRadius:9,border:`1px solid ${C.border}`,background:C.cream,color:C.brown,cursor:"pointer",fontFamily:"inherit",fontSize:15,lineHeight:1,flexShrink:0}}>‹</button>
              <div style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:12.5,fontWeight:700,color:C.brown,textTransform:"capitalize"}}>{dayOffset===0?"Aujourd'hui":viewLabel}</div>
                {dayOffset!==0&&<div style={{fontSize:9.5,color:C.light,textTransform:"capitalize"}}>{viewLabel}</div>}
              </div>
              <button onClick={()=>setDayOffset(o=>Math.min(0,o+1))} disabled={dayOffset>=0} aria-label="jour suivant" style={{width:30,height:30,borderRadius:9,border:`1px solid ${C.border}`,background:dayOffset>=0?C.bubble:C.cream,color:dayOffset>=0?C.light:C.brown,cursor:dayOffset>=0?"default":"pointer",fontFamily:"inherit",fontSize:15,lineHeight:1,flexShrink:0}}>›</button>
            </div>
            <div style={{fontSize:9.5,color:C.light,textAlign:"center",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:4}}><Icon name="check" size={11} color={C.sage}/> enregistré automatiquement — chaque jour a sa page</span>
              {dayOffset!==0&&<button onClick={()=>setDayOffset(0)} style={{background:"none",border:"none",color:pc.p,fontSize:9.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>revenir à aujourd'hui</button>}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {[
                {id:"apercu",ic:"chart",l:"Vue d'ensemble"},
                {id:"tendances",ic:"pulse",l:"Mes tendances"},
                {id:"cycle",ic:"moon",l:"Mon cycle"},
                {id:"journal",ic:"calendar",l:"Mon journal"},
                {id:"mouvement",ic:"steps",l:"Mes mouvements"},
                {id:"mesures",ic:"heart",l:"Mes mesures"},
              ].map(x=>(
                <button key={x.id} onClick={()=>setTab(x.id)} style={{display:"flex",alignItems:"center",gap:8,background:C.bubble,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 12px",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  <Icon name={x.ic} size={15} color={pc.p}/><span style={{fontSize:11.5,fontWeight:600,color:C.brown}}>{x.l}</span>
                </button>
              ))}
            </div>

            <div style={{background:C.white,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",color:pc.p,fontWeight:600,marginBottom:12}}>Comment s'est passée ta journée</div>
              {Object.entries(SUIVI_SCALES).map(([key,sc])=>(
                <div key={key} style={{marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:500,color:C.brown,marginBottom:6}}>{sc.label}</div>
                  <div style={{display:"flex",gap:5}}>
                    {sc.opts.map((opt,i)=>{
                      const val=i+1; const sel=jView[key]===val;
                      return (
                        <button key={i} onClick={()=>setJV(key, sel?null:val)}
                          style={{flex:1,padding:"8px 2px",borderRadius:9,border:`1.5px solid ${sel?sc.col:C.border}`,background:sel?sc.col:C.white,color:sel?"white":C.mid,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                          <span style={{fontSize:12,fontWeight:sel?700:500}}>{val}</span>
                          <span style={{fontSize:7.5,opacity:.85}}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
                {[{k:"sommeil",lab:"Heures dormies",unit:"h",step:0.5},{k:"eau",lab:"Verres d'eau",unit:"",step:1},{k:"mouvement",lab:"Mouvement",unit:"min",step:5},{k:"pas",lab:"Pas",unit:"",step:500}].map(m=>(
                  <div key={m.k} style={{background:C.bubble,borderRadius:11,padding:"9px 11px"}}>
                    <div style={{fontSize:9,letterSpacing:.5,textTransform:"uppercase",color:C.light,marginBottom:4}}>{m.lab}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button onClick={()=>setJV(m.k, Math.max(0,Math.round(((jView[m.k]||0)-m.step)*10)/10))} style={{width:24,height:24,borderRadius:7,border:`1px solid ${C.border}`,background:C.white,color:C.mid,cursor:"pointer",fontSize:15,lineHeight:1,fontFamily:"inherit",flexShrink:0}}>−</button>
                      <span style={{flex:1,textAlign:"center",fontSize:14,fontWeight:600,color:C.brown}}>{jView[m.k]!==undefined?`${jView[m.k]}${m.unit?" "+m.unit:""}`:"—"}</span>
                      <button onClick={()=>setJV(m.k, Math.round(((jView[m.k]||0)+m.step)*10)/10)} style={{width:24,height:24,borderRadius:7,border:`1px solid ${C.border}`,background:C.white,color:C.mid,cursor:"pointer",fontSize:15,lineHeight:1,fontFamily:"inherit",flexShrink:0}}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:10.5,color:C.mid,background:`${C.sage}22`,borderRadius:9,padding:"8px 11px",marginTop:12,lineHeight:1.5}}>💛 une journée sans tout remplir compte quand même. tu notes ce que tu veux, quand tu veux.</div>
            </div>

            <div style={{background:C.white,borderRadius:16,padding:"16px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",color:pc.p,fontWeight:600,marginBottom:3}}>Tes symptômes du jour</div>
              <div style={{fontSize:11,color:C.light,marginBottom:12,lineHeight:1.5}}>zéro est une vraie réponse — et une bonne : tu as vérifié, ce n'était pas là.</div>
              {SUIVI_SYMPTOMES.map(grp=>(
                <div key={grp.g} style={{marginBottom:12}}>
                  <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.light,marginBottom:7}}>{grp.g}</div>
                  {grp.items.map(sy=>(
                    <div key={sy.k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:9}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12.5,fontWeight:500,color:C.brown}}>{sy.n}</div>
                        {sy.d&&<div style={{fontSize:9.5,color:C.light}}>{sy.d}</div>}
                      </div>
                      <div style={{display:"flex",gap:3,flexShrink:0}}>
                        {[0,1,2,3,4,5].map(v=>{
                          const sym=jView.symptomes||{}; const sel=sym[sy.k]===v;
                          const col = v===0?"#2E7D4F":v<=2?"#D9A066":"#C0603F";
                          return (
                            <button key={v} onClick={()=>setSympV(sy.k, sel?null:v)}
                              style={{width:26,height:26,borderRadius:7,border:`1px solid ${sel?col:C.border}`,background:sel?col:C.white,color:sel?"white":C.mid,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{v}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="apercu"&&(()=>{
          const buckets=periodBuckets(apercuPeriode);
          const vals=buckets.map(b=>bucketValue(b,apercuMetric));
          const mc=APERCU_METRICS[apercuMetric];
          const hasData=vals.some(v=>v!=null);
          const n=buckets.length, W=300, H=96, x0=14, y0=8;
          const px=(i)=> x0 + (n>1 ? (i/(n-1))*W : W/2);
          const py=(v)=> y0 + (1 - Math.max(0,Math.min(1, v/mc.yMax)))*H;
          const pts=vals.map((v,i)=> v==null?null:`${px(i).toFixed(1)},${py(v).toFixed(1)}`).filter(Boolean).join(" ");
          const allSymp=SUIVI_SYMPTOMES.flatMap(g=>g.items);
          return (
          <div className="fu">
            <button onClick={()=>setTab("suivi")} style={{background:"none",border:"none",color:C.light,fontSize:12,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:12,display:"flex",alignItems:"center",gap:5}}>← retour au suivi</button>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:C.brown,marginBottom:2}}>Ta vue d'ensemble</div>
            <div style={{fontSize:12,color:C.light,marginBottom:14}}>comment ça évolue, dans le temps.</div>

            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {[["semaine","Semaine"],["mois","Mois"],["annee","Année"]].map(([k,l])=>(
                <button key={k} onClick={()=>setApercuPeriode(k)} style={{flex:1,padding:"8px",borderRadius:99,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:apercuPeriode===k?700:500,background:apercuPeriode===k?C.brown:C.bubble,color:apercuPeriode===k?"white":C.mid}}>{l}</button>
              ))}
            </div>

            <button onClick={()=>setTab("tendances")} style={{width:"100%",background:`${pc.p}10`,border:`1px solid ${pc.p}40`,borderRadius:12,padding:"11px 14px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontFamily:"inherit"}}>
              <span style={{fontSize:12.5,fontWeight:600,color:C.brown}}>Mes tendances, expliquées par Kamila</span>
              <span style={{fontSize:13,color:pc.p}}>→</span>
            </button>

            {!hasData ? (
              <div style={{background:C.white,border:`1px dashed ${C.border}`,borderRadius:16,padding:"28px 18px",textAlign:"center",color:C.light,fontSize:12.5,lineHeight:1.65}}>
                🌱 commence à remplir ton <b style={{color:C.mid}}>Suivi</b> chaque jour.<br/>au fil des jours, ta courbe et ton évolution apparaîtront ici.
              </div>
            ) : (<>
              <div style={{background:C.white,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.brown}}>{mc.label}</div>
                  <div style={{fontSize:9.5,color:C.light}}>{mc.help}</div>
                </div>
                <svg viewBox="0 0 328 120" style={{width:"100%",height:"auto",marginTop:6}}>
                  {[0,0.25,0.5,0.75,1].map((g,i)=>(<line key={i} x1="14" x2="314" y1={8+g*96} y2={8+g*96} stroke={C.border} strokeWidth="0.5"/>))}
                  {pts && <polyline points={pts} fill="none" stroke={mc.col} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>}
                  {vals.map((v,i)=> v==null?null:(<circle key={i} cx={px(i)} cy={py(v)} r="2.6" fill={mc.col}/>))}
                </svg>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:8.5,color:C.light,marginTop:2,padding:"0 8px"}}>
                  <span>{buckets[0].label}</span>
                  {n>2 && <span>{buckets[Math.floor(n/2)].label}</span>}
                  <span>{buckets[n-1].label}</span>
                </div>
              </div>

              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
                {Object.entries(APERCU_METRICS).map(([k,m])=>(
                  <button key={k} onClick={()=>setApercuMetric(k)} style={{padding:"6px 12px",borderRadius:99,border:`1px solid ${apercuMetric===k?m.col:C.border}`,background:apercuMetric===k?m.col:C.white,color:apercuMetric===k?"white":C.mid,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{m.label}</button>
                ))}
              </div>

              <div style={{background:C.white,borderRadius:16,padding:"16px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:13,fontWeight:600,color:C.brown,marginBottom:3}}>Tes symptômes, {apercuPeriode==="annee"?"mois par mois":"jour par jour"}</div>
                <div style={{fontSize:10,color:C.light,marginBottom:12}}>chaque case = un {apercuPeriode==="annee"?"mois":"jour"}. plus c'est foncé, plus c'était fort.</div>
                <div style={{overflowX:"auto"}}>
                  <div style={{minWidth:n*13+94}}>
                    {allSymp.map(sy=>(
                      <div key={sy.k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <div style={{width:88,flexShrink:0,fontSize:10,color:C.mid,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sy.n}</div>
                        <div style={{display:"flex",gap:2}}>
                          {buckets.map((b,i)=>{ const v=sympForBucket(b,sy.k); return <div key={i} title={v==null?"":`${sy.n} : ${v.toFixed(0)}/5`} style={{width:11,height:11,borderRadius:3,background:heatColor(v),flexShrink:0}}/>; })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:C.light,marginTop:12}}>
                  moins&nbsp;
                  {[null,0,1,2,3,4,5].map((v,i)=><div key={i} style={{width:11,height:11,borderRadius:3,background:heatColor(v)}}/>)}
                  &nbsp;plus
                </div>
              </div>
            </>)}
          </div>
          );
        })()}

        {tab==="tendances"&&(()=>{
          const trends=computeTrends();
          return (
          <div className="fu">
            <button onClick={()=>setTab("apercu")} style={{background:"none",border:"none",color:C.light,fontSize:12,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:12,display:"flex",alignItems:"center",gap:5}}>← vue d'ensemble</button>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:C.brown,marginBottom:2}}>Tes tendances</div>
            <div style={{fontSize:12,color:C.light,marginBottom:16,lineHeight:1.5}}>ce que tes données racontent — et ce que ça veut dire pour toi.</div>
            {trends.length===0 ? (
              <div style={{background:C.white,border:`1px dashed ${C.border}`,borderRadius:16,padding:"28px 18px",textAlign:"center",color:C.light,fontSize:12.5,lineHeight:1.65}}>
                ✨ continue ton <b style={{color:C.mid}}>Suivi</b> quelques jours.<br/>dès qu'une tendance se dessine dans tes données, je te l'explique ici — jamais avant, pour ne rien inventer.
              </div>
            ) : trends.map((t,i)=>(
              <div key={i} style={{background:C.white,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${C.border}`}}>
                <span style={{display:"inline-block",fontSize:9,letterSpacing:.5,background:`${pc.p}18`,color:pc.p,borderRadius:99,padding:"3px 10px",marginBottom:8}}>tendance · {t.tag}</span>
                <div style={{fontSize:14,color:C.brown,lineHeight:1.45,marginBottom:10}}>{t.text}</div>
                <div style={{background:"#F7EFE6",borderLeft:`3px solid ${pc.p}`,borderRadius:"0 10px 10px 0",padding:"11px 13px"}}>
                  <div style={{fontSize:9,fontWeight:700,color:pc.p,marginBottom:3}}>le mot de Kamila</div>
                  <div style={{fontSize:12.5,fontStyle:"italic",fontFamily:"'Playfair Display',serif",color:C.mid,lineHeight:1.6}}>« {t.kamila} »</div>
                </div>
              </div>
            ))}
          </div>
          );
        })()}

        {tab==="mesures"&&(()=>{
          const poids=(mesures.poids||[]).slice().sort((a,b)=> a.d<b.d?-1:1);
          const vals=poids.map(p=>p.v);
          const minV=vals.length?Math.min(...vals):0, maxV=vals.length?Math.max(...vals):1;
          const range=(maxV-minV)||1;
          const n=poids.length, W=300,H=72,x0=14,y0=12;
          const px=(i)=> x0 + (n>1?(i/(n-1))*W:W/2);
          const py=(v)=> y0 + (1-((v-minV)/range))*H;
          const pts=poids.map((p,i)=>`${px(i).toFixed(1)},${py(p.v).toFixed(1)}`).join(" ");
          return (
          <div className="fu">
            <button onClick={()=>setTab("suivi")} style={{background:"none",border:"none",color:C.light,fontSize:12,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:12,display:"flex",alignItems:"center",gap:5}}>← retour au suivi</button>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:C.brown,marginBottom:2}}>Mes mesures</div>
            <div style={{fontSize:12,color:C.light,marginBottom:14}}>optionnel — seulement si ça t'aide.</div>

            <div style={{background:"#F1EEF6",borderLeft:"3px solid #A89AB8",borderRadius:"0 12px 12px 0",padding:"12px 14px",marginBottom:14}}>
              <div style={{fontSize:9,fontWeight:700,color:"#8B7BA0",marginBottom:4}}>le mot de Kamila</div>
              <div style={{fontSize:12,color:C.mid,lineHeight:1.6,fontStyle:"italic"}}>le poids n'est qu'un indicateur parmi beaucoup d'autres — jamais un juge. ton énergie, tes symptômes, tes cycles racontent bien plus sur ta santé. si le chiffre te fait du mal, tu as le droit de ne pas le suivre du tout.</div>
            </div>

            {!mesures.actif ? (
              <div style={{background:C.white,borderRadius:16,padding:"18px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                <div style={{fontSize:12.5,color:C.mid,lineHeight:1.6,marginBottom:14}}>le suivi du poids est <b style={{color:C.brown}}>désactivé par défaut</b>. active-le seulement si tu le vis sereinement — rien ne t'y oblige.</div>
                <button onClick={()=>setMesures(m=>({...m,actif:true}))} style={{background:C.brown,border:"none",borderRadius:12,padding:"12px 20px",color:"white",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer"}}>activer le suivi du poids</button>
              </div>
            ) : (<>
              <div style={{background:C.white,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",color:pc.p,fontWeight:600,marginBottom:10}}>Ton poids aujourd'hui</div>
                <div style={{display:"flex",gap:8}}>
                  <input value={poidsInput} onChange={e=>setPoidsInput(e.target.value)} type="number" inputMode="decimal" placeholder="kg" style={{flex:1,border:`1.5px solid ${C.border}`,borderRadius:11,padding:"11px 14px",fontFamily:"inherit",fontSize:15,color:C.brown,background:C.cream,outline:"none"}}/>
                  <button onClick={()=>{ const v=parseFloat(String(poidsInput).replace(",",".")); if(!isNaN(v)&&v>0){ setMesures(m=>{ const arr=(m.poids||[]).filter(p=>p.d!==todayKey); return {...m,poids:[...arr,{d:todayKey,v:Math.round(v*10)/10}]}; }); setPoidsInput(""); showToast("poids enregistré"); } }} style={{background:pc.p,border:"none",borderRadius:11,padding:"0 18px",color:"white",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer"}}>enregistrer</button>
                </div>
              </div>

              {poids.length>=2 && (
                <div style={{background:C.white,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.brown,marginBottom:2}}>Ton évolution</div>
                  <div style={{fontSize:9.5,color:C.light,marginBottom:6}}>{poids.length} mesures · de {minV} à {maxV} kg</div>
                  <svg viewBox="0 0 328 100" style={{width:"100%",height:"auto"}}>
                    <polyline points={pts} fill="none" stroke={pc.p} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                    {poids.map((p,i)=>(<circle key={i} cx={px(i)} cy={py(p.v)} r="2.6" fill={pc.p}/>))}
                  </svg>
                </div>
              )}
              {poids.length>0 && <div style={{fontSize:11,color:C.mid,textAlign:"center",marginBottom:12}}>dernier : <b>{poids[poids.length-1].v} kg</b></div>}

              <button onClick={()=>setMesures(m=>({...m,actif:false}))} style={{width:"100%",background:"none",border:"none",color:C.light,fontSize:11,textDecoration:"underline",cursor:"pointer",fontFamily:"inherit"}}>désactiver le suivi du poids</button>
            </>)}
          </div>
          );
        })()}

        {tab==="analyses"&&(
          <div className="fu">
            <button onClick={()=>setTab("kamila")} style={{background:"none",border:"none",color:C.light,fontSize:12,cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:12,display:"flex",alignItems:"center",gap:5}}>← retour à mon parcours</button>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",color:C.brown,marginBottom:4}}>Tes analyses</div>
            <div style={{fontSize:12,color:C.light,marginBottom:14}}>en langage humain — pas en normes de laboratoire.</div>

            {/* LIAISON → guide analyses à télécharger */}
            <button onClick={()=>{setTab("outils");setOutilOpen("telechargements");}}
              style={{width:"100%",textAlign:"left",border:`1px solid ${pc.p}`,cursor:"pointer",fontFamily:"inherit",
              background:C.bubble,borderRadius:14,padding:"13px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:26,flexShrink:0}}>🩸</span>
              <span style={{flex:1}}>
                <span style={{display:"block",fontSize:12.5,fontWeight:700,color:C.brown,marginBottom:2}}>Le guide des analyses SMOP</span>
                <span style={{display:"block",fontSize:10.5,color:C.mid,lineHeight:1.4}}>chaque marqueur expliqué simplement, à télécharger et garder</span>
              </span>
              <span style={{fontSize:16,color:pc.p,flexShrink:0}}>→</span>
            </button>

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
                  <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.light,marginBottom:6}}>Kamila te répond</div>
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
              "tu n'attends plus qu'on te sauve. tu collabores avec ton médecin. c'est très différent." — Kamila
            </div>

            <button onClick={()=>setTab("analyses")} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:`${pc.p}10`,border:`1.5px solid ${pc.p}`,borderRadius:14,padding:"14px 15px",marginBottom:14,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              <div style={{width:38,height:38,borderRadius:11,background:C.white,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="flask" size={18} color={pc.p}/></div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.brown}}>Mes analyses de sang</div>
                <div style={{fontSize:10,color:C.mid,marginTop:1}}>noter et suivre tes bilans dans le temps</div>
              </div>
              <div style={{fontSize:16,color:pc.p}}>›</div>
            </button>

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
profil · 3 priorités · analyses à demander · ton suivi & tes tendances · scripts préparés · progression
              </div>
              <button onClick={()=>{
                  const prios=(PRIORITES_PROFIL[profil]||PRIORITES_PROFIL.metabolique);
                  const esc=(s)=>String(s).replace(/</g,"&lt;");
                  const last30=periodBuckets("mois");
                  const avgM=(m)=>{ const v=last30.map(b=>bucketValue(b,m)).filter(x=>x!=null); return v.length?(v.reduce((a,b)=>a+b,0)/v.length):null; };
                  const fmt=(x)=> x==null?"—":x.toFixed(1);
                  const nbJours=Object.keys(journal).length;
                  const trends=computeTrends();
                  const poidsArr=(mesures.poids||[]).slice().sort((a,b)=> a.d<b.d?-1:1);
                  const suiviSection = nbJours>0 ? `<h2>Mon suivi quotidien (30 derniers jours)</h2><ul><li>Charge moyenne des sympt&ocirc;mes : ${fmt(avgM("symptomes"))}/5</li><li>Humeur : ${fmt(avgM("humeur"))}/5 &middot; &Eacute;nergie : ${fmt(avgM("energie"))}/5 &middot; Stress : ${fmt(avgM("stress"))}/5</li><li>Sommeil moyen : ${fmt(avgM("sommeil"))} h/nuit</li><li>Jours suivis : ${nbJours}</li></ul>` : "";
                  const trendsSection = trends.length ? `<h2>Tendances rep&eacute;r&eacute;es dans mon suivi</h2><ul>${trends.map(t=>`<li>${esc(t.text)}</li>`).join("")}</ul>` : "";
                  const poidsSection = (mesures.actif && poidsArr.length) ? `<h2>Poids</h2><p>Dernier : ${poidsArr[poidsArr.length-1].v} kg &middot; ${poidsArr.length} mesures sur la p&eacute;riode.</p>` : "";
                  const rows=prios.map((p,i)=>`<tr><td style="padding:6px 10px;border:1px solid #E8DDD3;font-weight:600">${i+1}. ${esc(p.t)}</td><td style="padding:6px 10px;border:1px solid #E8DDD3">${esc(p.geste)}</td></tr>`).join("");
                  const inner=`
                  <h1>Mon dossier SMOP (SOPK) — à présenter à mon médecin</h1>
                  <div><strong>${esc(prenom||"")}</strong> · ${esc(pc.label)} · progression : jour ${day}, ${completedCount} missions validées</div>
                  <h2>Mes 3 priorités en ce moment</h2>
                  <table><tr><th style="padding:6px 10px;border:1px solid #E8DDD3;text-align:left">Priorité</th><th style="padding:6px 10px;border:1px solid #E8DDD3;text-align:left">Premier geste</th></tr>${rows}</table>
                  <h2>Analyses que je souhaite demander</h2>
                  <ul>
                    <li>Bilan hormonal : testostérone totale et libre, SHBG, delta-4 androstènedione</li>
                    <li>Versant surrénalien : DHEA-S, cortisol, et 17-OH-progestérone (pour écarter une hyperplasie congénitale des surrénales)</li>
                    <li>Métabolique : glycémie à jeun, insuline à jeun (HOMA-IR)</li>
                    <li>Inflammation : CRP ultra-sensible</li>
                    <li>Carences : ferritine, vitamine D, B12</li>
                    <li>Thyroïde : TSH (+ T4L, anti-TPO si besoin)</li>
                  </ul>
                  ${suiviSection}${trendsSection}${poidsSection}
                  <h2>Mes questions</h2>
                  <ul>
                    <li>Mes résultats sont-ils dans la norme optimale, ou juste dans la norme du labo ?</li>
                    <li>Y a-t-il un signe de résistance à l'insuline ?</li>
                    <li>Quelles pistes au-delà de la pilule ?</li>
                    <li>Vers quel spécialiste m'orienter si besoin ?</li>
                  </ul>
                  <span class="note">Document personnel d'aide à la consultation — ne remplace pas un avis médical. Les analyses pertinentes et leur interprétation relèvent de ton médecin.</span>`;
                  setDossierInner(inner);
                }}
                style={{width:"100%",background:pc.p,border:"none",padding:"10px",borderRadius:10,color:"white",fontFamily:"inherit",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                Générer mon dossier PDF →
              </button>
            </div>
          </div>
        )}

        {/* ── JE VIENS D'ÊTRE DIAGNOSTIQUÉE ── */}
        {tab==="diag"&&(
          <div className="fu">
            <button onClick={()=>setTab("kamila")} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",color:C.mid,fontSize:12,fontWeight:600,padding:"2px 0",marginBottom:12}}>
              <Icon name="arrowL" size={16} color={C.mid}/> retour · Accueil
            </button>

            <div style={{background:`linear-gradient(135deg,${C.mauve},#8B7BA0)`,borderRadius:18,padding:"22px 20px",color:"#fff",marginBottom:18}}>
              <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",opacity:.8,marginBottom:6}}>Tu viens d'être diagnostiquée</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",fontWeight:600,lineHeight:1.25,marginBottom:8}}>Souffle. Tu es au bon endroit.</div>
              <div style={{fontSize:12,opacity:.95,lineHeight:1.6}}>on t'a peut-être lâché un mot et laissée repartir seule. ici, on prend le temps que personne n'a pris avec toi.</div>
            </div>

            {/* 1 — accueil émotionnel */}
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"1rem 1.1rem",marginBottom:12}}>
              <div style={{fontSize:13.5,fontWeight:700,color:C.brown,marginBottom:7}}>D'abord, respire</div>
              <div style={{fontSize:12,color:C.mid,lineHeight:1.65}}>c'est normal d'être sous le choc, en colère ou perdue — surtout si on t'a expédiée en deux minutes. ce que tu ressens est légitime. mais retiens une chose : tu n'es pas seule, et ce diagnostic n'est pas une fatalité.</div>
            </div>

            {/* 2 — l'explication */}
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"1rem 1.1rem",marginBottom:12}}>
              <div style={{fontSize:13.5,fontWeight:700,color:C.brown,marginBottom:7}}>Ce que c'est vraiment</div>
              <div style={{fontSize:12,color:C.mid,lineHeight:1.65,marginBottom:12}}>le SMOP, ce n'est pas « juste des kystes sur les ovaires ». c'est un déséquilibre hormonal et métabolique — un tout. ta fatigue, tes fringales, ton acné, tes cycles, ton moral : tout est lié, et tout a une explication. comprendre ces liens, c'est déjà reprendre du pouvoir.</div>
              <button onClick={()=>{ setTab("outils"); setOutilCat("comprendre"); setOutilOpen("comprendre"); }}
                style={{width:"100%",background:`${C.mauve}15`,color:C.mauve,border:`1px solid ${C.mauve}`,borderRadius:11,padding:"11px",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer"}}>Comprendre mon SMOP →</button>
            </div>

            {/* 3 — l'espoir / démonter les phrases qui blessent */}
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"1rem 1.1rem",marginBottom:12}}>
              <div style={{fontSize:13.5,fontWeight:700,color:C.brown,marginBottom:10}}>Ce qu'on a peut-être oublié de te dire</div>
              {[
                {faux:"« vous devrez passer par la PMA »",vrai:"beaucoup de femmes avec un SMOP conçoivent, parfois naturellement. le terrain se travaille."},
                {faux:"« on vous met sous pilule, point »",vrai:"la pilule peut aider, mais ce n'est pas la seule voie. alimentation, mouvement, stress, plantes : il existe d'autres leviers."},
                {faux:"« c'est comme ça, vivez avec »",vrai:"non. ton corps répond quand on lui donne le bon terrain. tu as des cartes en main."},
              ].map((m,i)=>(
                <div key={i} style={{marginBottom:i<2?12:0,paddingLeft:12,borderLeft:`3px solid ${C.sage}`}}>
                  <div style={{fontSize:11,color:C.light,fontStyle:"italic",marginBottom:3}}>{m.faux}</div>
                  <div style={{fontSize:11.5,color:C.brown,lineHeight:1.55,fontWeight:500}}>{m.vrai}</div>
                </div>
              ))}
            </div>

            {/* 4 — premiers pas */}
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"1rem 1.1rem",marginBottom:12}}>
              <div style={{fontSize:13.5,fontWeight:700,color:C.brown,marginBottom:3}}>Par où commencer, sans te noyer</div>
              <div style={{fontSize:11,color:C.light,marginBottom:12}}>on ne change pas tout d'un coup. trois petits pas, à ton rythme.</div>
              {[
                {n:"1",t:"Découvre ton profil",d:"chaque SMOP est différent. ta carte te montre le tien.",go:()=>setTab("carte")},
                {n:"2",t:"Un geste dans l'assiette",d:"commence par les légumes et les protéines à chaque repas.",go:()=>{ setTab("outils"); setOutilCat("alimentation"); setOutilOpen("assiette"); }},
                {n:"3",t:"Un geste pour ton stress",d:"le stress nourrit le SMOP. un vrai temps calme chaque jour change déjà les choses.",go:()=>{ setTab("outils"); setOutilCat("comprendre"); setOutilOpen("comprendre"); }},
              ].map((s,i)=>(
                <button key={i} onClick={s.go} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:C.cream,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 12px",marginBottom:i<2?8:0,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:C.mauve,color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.n}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12.5,fontWeight:600,color:C.brown}}>{s.t}</div>
                    <div style={{fontSize:10.5,color:C.mid,marginTop:1,lineHeight:1.45}}>{s.d}</div>
                  </div>
                  <div style={{fontSize:14,color:C.light}}>›</div>
                </button>
              ))}
            </div>

            {/* 5 — légitimité + CTA */}
            <div style={{background:`${C.sage}1F`,border:`1px solid ${C.sage}`,borderRadius:16,padding:"1.1rem 1.1rem",marginBottom:4}}>
              <div style={{fontSize:13.5,fontWeight:700,color:"#4F6038",marginBottom:7}}>Tu es légitime</div>
              <div style={{fontSize:12,color:"#4F6038",lineHeight:1.65,marginBottom:14}}>tes douleurs, ta fatigue, tes questions sont réelles. tu as le droit de vouloir mieux comprendre et mieux vivre ton corps. ici, tu n'es jamais pressée, jamais jugée. on avance ensemble.</div>
              <button onClick={()=>setTab("kamila")} style={{width:"100%",background:C.brown,color:"#fff",border:"none",borderRadius:12,padding:"13px",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer"}}>Commencer mon chemin</button>
            </div>
          </div>
        )}

        {/* ── MOUVEMENT ADAPTÉ ── */}
        {tab==="mouvement"&&(
          <div className="fu">
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:C.brown,marginBottom:2}}>Mes mouvements</div>
            <div style={{fontSize:12,color:C.light,marginBottom:14}}>bouger pour toi, à ton rythme.</div>

            <div style={{background:`linear-gradient(135deg,${pc.p},${pc.p}CC)`,borderRadius:16,padding:"1.1rem 1.2rem",marginBottom:14,color:"#fff"}}>
              <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",opacity:.8,marginBottom:4}}>Pilier bien-être</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.15rem",fontWeight:600,marginBottom:6}}>Mouvement adapté</div>
              <div style={{fontSize:11,lineHeight:1.6,opacity:.95}}>bouger pour ta sensibilité à l'insuline, ton énergie, ton moral — et pour te sentir bien dans ton corps, comme tu l'entends. ton objectif t'appartient : tu choisis, tu adaptes, tu écoutes ton corps.</div>
            </div>

            {MOUVEMENT.map(r=>{
              const open=mouvOpen===r.id;
              return(
                <div key={r.id} style={{background:C.white,border:`1.5px solid ${open?pc.p:C.border}`,borderRadius:16,marginBottom:10,overflow:"hidden"}}>
                  <button onClick={()=>setMouvOpen(open?null:r.id)}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                    <div style={{width:42,height:42,borderRadius:12,background:`${pc.p}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Icon name={r.ic} size={19} color={pc.p}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.brown}}>{r.nom}</div>
                      <div style={{display:"flex",gap:6,marginTop:3}}>
                        <span style={{fontSize:9,fontWeight:600,color:pc.p,background:`${pc.p}12`,borderRadius:99,padding:"2px 8px"}}>{r.duree}</span>
                        <span style={{fontSize:9,fontWeight:600,color:C.sage,background:`${C.sage}22`,borderRadius:99,padding:"2px 8px"}}>{r.niveau}</span>
                      </div>
                    </div>
                    <div style={{fontSize:15,color:C.light,transform:open?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</div>
                  </button>
                  {open&&(
                    <div style={{padding:"0 14px 14px"}}>
                      <div style={{fontSize:11,color:C.mid,lineHeight:1.6,background:C.bubble,borderRadius:11,padding:"10px 12px",marginBottom:12}}>{r.intro}</div>
                      {r.exercices.map((ex,i)=>(
                        <div key={i} style={{display:"flex",gap:11,marginBottom:i<r.exercices.length-1?12:0}}>
                          <div style={{width:24,height:24,borderRadius:"50%",background:`${pc.p}12`,color:pc.p,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12.5,fontWeight:600,color:C.brown}}>{ex.n}</div>
                            <div style={{fontSize:11,color:C.mid,marginTop:2,lineHeight:1.5}}>{ex.d}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{background:C.mauveSoft,borderRadius:14,padding:"12px 14px",marginTop:4}}>
              <div style={{fontSize:11,color:C.mid,lineHeight:1.6}}>le mouvement régulier et doux améliore la sensibilité à l'insuline et l'humeur. on écoute son corps : la fatigue normale n'est pas la douleur. en cas de doute médical, demande l'avis de ton médecin avant de commencer.</div>
            </div>
          </div>
        )}

        {/* ── JOURNAL ── */}
        {tab==="journal"&&(
          <div className="fu">
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",color:C.brown,marginBottom:3}}>Mon journal</div>
            <div style={{fontSize:10,color:C.light,marginBottom:14}}>{todayLabel} · ton rituel du jour</div>

            {/* ── RITUEL GUIDÉ (matin / soir) ── */}
            <div style={{marginBottom:18}}>
              <div style={{display:"flex",gap:6,background:C.bubble,borderRadius:12,padding:4,marginBottom:14}}>
                {[{id:"matin",l:"Le matin"},{id:"soir",l:"Le soir"}].map(m=>{
                  const on=journalMoment===m.id;
                  return <button key={m.id} onClick={()=>setJournalMoment(m.id)}
                    style={{flex:1,padding:"9px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:on?700:500,color:on?C.brown:C.mid,background:on?C.white:"transparent",boxShadow:on?"0 2px 6px rgba(0,0,0,.05)":"none"}}>{m.l}</button>;
                })}
              </div>

              {journalMoment==="matin"?(
                <div>
                  <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"1rem",marginBottom:11}}>
                    <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:9}}>Comment je me sens ce matin</div>
                    <textarea value={jToday.matinRessenti||""} onChange={e=>setJ("matinRessenti",e.target.value)} placeholder="mes premières pensées…" rows={2}
                      style={{width:"100%",border:"none",outline:"none",resize:"vertical",fontFamily:"inherit",fontSize:12.5,color:C.brown,background:"transparent",lineHeight:1.6}}/>
                  </div>

                  <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"1rem",marginBottom:11}}>
                    <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:11}}>3 gratitudes</div>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?10:0}}>
                        <div style={{width:22,height:22,borderRadius:"50%",background:C.mauveSoft,color:C.mauve,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                        <input value={(jToday.gratitudes||[])[i]||""} onChange={e=>setJArr("gratitudes",i,e.target.value)} placeholder="ce qui va bien, même tout petit…"
                          style={{flex:1,border:"none",borderBottom:`1.5px dotted ${C.border}`,outline:"none",fontFamily:"inherit",fontSize:12,color:C.brown,background:"transparent",padding:"3px 0"}}/>
                      </div>
                    ))}
                  </div>

                  <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"1rem"}}>
                    <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:11}}>Mes 3 actions pour aujourd'hui</div>
                    {[0,1,2].map(i=>{
                      const done=(jToday.actionsDone||[])[i];
                      return(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?10:0}}>
                          <button onClick={()=>toggleAction(i)} aria-label="fait"
                            style={{width:22,height:22,borderRadius:7,border:`1.5px solid ${done?C.sage:C.border}`,background:done?C.sage:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
                            {done&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}
                          </button>
                          <input value={(jToday.actions||[])[i]||""} onChange={e=>setJArr("actions",i,e.target.value)} placeholder={i===0?"mon action la plus importante…":"une action pour moi…"}
                            style={{flex:1,border:"none",borderBottom:`1.5px dotted ${C.border}`,outline:"none",fontFamily:"inherit",fontSize:12,color:done?C.light:C.brown,textDecoration:done?"line-through":"none",background:"transparent",padding:"3px 0"}}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ):(
                <div>
                  <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"1rem",marginBottom:11}}>
                    <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:9}}>Comment s'est passée ma journée</div>
                    <textarea value={jToday.soirBilan||""} onChange={e=>setJ("soirBilan",e.target.value)} placeholder="sans filtre, comme ça vient…" rows={2}
                      style={{width:"100%",border:"none",outline:"none",resize:"vertical",fontFamily:"inherit",fontSize:12.5,color:C.brown,background:"transparent",lineHeight:1.6}}/>
                  </div>

                  <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"1rem",marginBottom:11}}>
                    <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:9}}>Ma petite victoire du jour</div>
                    <input value={jToday.soirVictoire||""} onChange={e=>setJ("soirVictoire",e.target.value)} placeholder="une chose dont je suis fière, même minuscule…"
                      style={{width:"100%",border:"none",borderBottom:`1.5px dotted ${C.border}`,outline:"none",fontFamily:"inherit",fontSize:12.5,color:C.brown,background:"transparent",padding:"3px 0"}}/>
                  </div>

                  <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"1rem"}}>
                    <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.terra,fontWeight:700,marginBottom:9}}>Ce que je pose pour la nuit</div>
                    <textarea value={jToday.soirLacher||""} onChange={e=>setJ("soirLacher",e.target.value)} placeholder="dépose ici ce qui tourne en boucle. une fois écrit, tu peux le laisser partir." rows={2}
                      style={{width:"100%",border:"none",outline:"none",resize:"vertical",fontFamily:"inherit",fontSize:12.5,color:C.brown,background:"transparent",lineHeight:1.6}}/>
                  </div>
                </div>
              )}

              <div style={{fontSize:10,color:C.light,textAlign:"center",marginTop:12,lineHeight:1.6}}>ton journal se remplit à ton rythme — rien n'est obligatoire.</div>
            </div>

            <div style={{height:1,background:C.border,margin:"4px 0 18px"}}/>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.light,marginBottom:12}}>Mon suivi semaine après semaine</div>

            {/* Sélecteur de semaine */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.light,marginBottom:6}}>quelle semaine veux-tu remplir ?</div>
              <div className="hscroll" style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2,WebkitOverflowScrolling:"touch"}}>
                {Array.from({length:Math.max(52,Math.ceil(day/7))},(_,k)=>k+1).map(w=>{
                  const cur=journalWeek===w;
                  const isNow=Math.ceil(day/7)===w;
                  return(
                    <button key={w} onClick={()=>setJournalWeek(w)}
                      style={{flex:"0 0 auto",minWidth:46,padding:"9px 8px",borderRadius:11,border:`1.5px solid ${cur?pc.p:C.border}`,background:cur?pc.p:C.white,color:cur?"white":C.brown,fontSize:11,fontWeight:cur?700:500,cursor:"pointer",fontFamily:"inherit",position:"relative"}}>
                      S{w}
                      {isNow&&!cur&&<div style={{position:"absolute",top:3,right:5,width:5,height:5,borderRadius:"50%",background:pc.p}}/>}
                    </button>
                  );
                })}
              </div>
              <div style={{fontSize:9,color:C.light,marginTop:10,fontStyle:"italic"}}>fais défiler pour choisir ta semaine (une année complète) — le point coloré indique ta semaine en cours.</div>
            </div>

            {/* ── TON CHEMIN (honnête, sans score) ── */}
            <div style={{background:C.white,borderRadius:16,padding:"1.1rem",marginBottom:14,border:`1.5px solid ${C.border}`}}>
              <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.light,marginBottom:12}}>Ton chemin</div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:`${pc.p}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Icon name={PROFIL_ICON[profil]||"leaf"} size={20} color={pc.p}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.brown}}>{completedCount} mission{completedCount>1?"s":""} accomplie{completedCount>1?"s":""}</div>
                  <div style={{fontSize:10,color:C.light,marginTop:1}}>{day<=30?`Fondation · jour ${day}`:"au long cours"} · semaine {week}</div>
                </div>
              </div>
              <div style={{fontSize:11,color:C.mid,lineHeight:1.6,background:C.bubble,borderRadius:12,padding:"11px 13px"}}>
                {completedCount===0
                  ? "ton chemin commence ici. une seule action aujourd'hui, et c'est déjà un pas."
                  : "chaque mission que tu tiens travaille ton terrain en profondeur. ce n'est pas une note — c'est un repère de ce que tu as déjà construit, à ton rythme."}
              </div>
            </div>

            {/* Victoires */}
            <div style={{background:`linear-gradient(135deg,${C.bubble},${C.sage}33)`,borderRadius:16,padding:"1rem",marginBottom:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.light,marginBottom:3}}>semaine {journalWeek} — mes victoires</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"0.9rem",color:C.brown,marginBottom:10,fontStyle:"italic"}}>"le but n'est pas d'être parfaite. c'est de remarquer ce qui change."</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {VICTORIES_LIST.map((v,i)=>{
                  const sel=weekWins.includes(i);
                  return(
                    <button key={i} onClick={()=>{if(!sel)showToast("Victoire notée","chaque petit pas compte. continue.");setVictories(p=>{const c=p[journalWeek]||[];return{...p,[journalWeek]:sel?c.filter(x=>x!==i):[...c,i]};});}}
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
              <div style={{fontSize:11,fontWeight:600,color:C.brown,marginBottom:8}}>suivi — semaine {journalWeek}</div>
              {["Énergie le matin","Fringales","Fatigue après repas","Humeur","Sommeil","Brouillard"].map((sym,i)=>{
                const val=symptoms[`${journalWeek}_${i}`]||0;
                const col=val>=4?"#7A9A5A":val>=3?pc.p:C.border;
                return(
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <div style={{fontSize:11,color:C.brown}}>{sym}</div>
                      <div style={{fontSize:11,fontWeight:600,color:val>0?col:C.light}}>{val>0?`${val}/5`:"—"}</div>
                    </div>
                    <div style={{display:"flex",gap:5}}>
                      {[1,2,3,4,5].map(n=>(
                        <button key={n} onClick={()=>setSymptoms(p=>({...p,[`${journalWeek}_${i}`]:n}))}
                          style={{flex:1,height:7,borderRadius:99,border:"none",background:n<=val?col:C.border,cursor:"pointer",transition:"all 0.2s"}}/>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── ÉVOLUTION DANS LE TEMPS ── */}
            {(()=>{
              const symNoms=["Énergie le matin","Fringales","Fatigue après repas","Humeur","Sommeil","Brouillard"];
              const hasData=symNoms.some((_,i)=>[1,2,3,4].some(w=>symptoms[`${w}_${i}`]>0));
              if(!hasData) return(
                <div style={{background:C.bubble,borderRadius:14,padding:"1rem",marginBottom:10,border:`1px dashed ${C.border}`,textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:6}}>{"📈"}</div>
                  <div style={{fontSize:11,color:C.mid,lineHeight:1.6}}>note tes symptômes chaque semaine — et tu verras ici, noir sur blanc, ton évolution dans le temps. {"🌿"}</div>
                </div>
              );
              return(
                <div style={{background:C.white,borderRadius:14,padding:"1rem",marginBottom:10,border:`1.5px solid ${pc.p}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.brown,marginBottom:3}}>{"📈"} Ton évolution dans le temps</div>
                  <div style={{fontSize:10,color:C.light,marginBottom:12,lineHeight:1.5}}>chaque barre = une semaine de ton suivi. « S1 » c'est ta 1re semaine, « S2 » la 2e, et ainsi de suite — pas des jours.</div>
                  {symNoms.map((sym,i)=>{
                    const vals=[1,2,3,4].map(w=>symptoms[`${w}_${i}`]||0);
                    const filled=vals.filter(v=>v>0);
                    if(filled.length===0) return null;
                    const first=filled[0], last=filled[filled.length-1];
                    const inverse=[1,2,5].includes(i);
                    const diff=last-first;
                    const positif=inverse?diff<0:diff>0;
                    const stable=diff===0;
                    return(
                      <div key={i} style={{marginBottom:13}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                          <div style={{fontSize:10,color:C.brown,fontWeight:500}}>{sym}</div>
                          {filled.length>1&&!stable&&(
                            <div style={{fontSize:9,fontWeight:700,color:positif?"#5A7040":"#B07050",background:positif?"#7A9A5A20":"#D0877020",borderRadius:99,padding:"1px 7px"}}>
                              {positif?"↗ s'améliore":"↘ à surveiller"}
                            </div>
                          )}
                        </div>
                        <div style={{display:"flex",gap:5,alignItems:"flex-end",height:40}}>
                          {[1,2,3,4].map(w=>{
                            const v=symptoms[`${w}_${i}`]||0;
                            const h=v>0?Math.max(8,(v/5)*40):3;
                            const isCur=w===week;
                            const barCol=v>0?(inverse?(v<=2?"#7A9A5A":v<=3?pc.p:"#D08770"):(v>=4?"#7A9A5A":v>=3?pc.p:"#D08770")):C.border;
                            return(
                              <div key={w} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                                <div style={{width:"100%",height:h,background:barCol,borderRadius:6,opacity:v>0?1:0.4,transition:"height 0.4s",border:isCur?`2px solid ${C.brown}`:"none"}}/>
                                <div style={{fontSize:8,color:isCur?C.brown:C.light,fontWeight:isCur?700:400}}>S{w}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{fontSize:9,color:C.light,fontStyle:"italic",marginTop:4,lineHeight:1.5}}>les changements de ton corps sont souvent progressifs — ce graphique les rend visibles. c'est ta preuve que ça avance. {"🌿"}</div>
                </div>
              );
            })()}

            {/* Notes */}
            <div style={{background:C.white,borderRadius:12,padding:"10px",marginBottom:7,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,fontWeight:500,color:C.brown,marginBottom:5}}>mes notes — semaine {journalWeek}</div>
              <textarea placeholder="ce que j'ai vécu, ressenti, compris cette semaine…" value={notes[journalWeek]||""} onChange={e=>setNotes(p=>({...p,[journalWeek]:e.target.value}))}
                style={{width:"100%",padding:"8px 10px",border:`1.5px solid ${C.border}`,borderRadius:9,fontFamily:"inherit",fontSize:11,color:C.brown,background:C.cream,resize:"vertical",minHeight:55}}/>
            </div>
          </div>
        )}

      </div>

      {/* TOAST DE CÉLÉBRATION */}
      {toast&&(
        <div style={{position:"fixed",bottom:88,left:"50%",transform:"translateX(-50%)",zIndex:200,width:"calc(100% - 32px)",maxWidth:398,animation:"toastUp 0.35s ease"}}>
          <div style={{background:`linear-gradient(135deg,${pc.p},#9A6040)`,borderRadius:16,padding:"13px 16px",boxShadow:"0 8px 28px rgba(0,0,0,0.28)",display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"white",lineHeight:1.3}}>{toast.titre}</div>
            <div style={{flex:1,fontSize:11,color:"rgba(255,255,255,0.9)",lineHeight:1.4}}>{toast.sousTitre}</div>
          </div>
        </div>
      )}

      {/* PANNEAU MON COMPTE */}
      {showAccount&&(
        <div onClick={()=>setShowAccount(false)} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(58,42,32,.45)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.cream,width:"100%",maxWidth:430,borderRadius:"22px 22px 0 0",padding:"1.4rem 1.3rem 1.8rem",maxHeight:"88vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:C.brown,fontWeight:600}}>Mon compte</div>
              <button onClick={()=>setShowAccount(false)} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:"50%",width:32,height:32,cursor:"pointer",color:C.mid,fontSize:15,fontFamily:"inherit"}}>✕</button>
            </div>

            <div style={{background:C.white,borderRadius:14,padding:"13px 15px",border:`1px solid ${C.border}`,marginBottom:14}}>
              <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.light,marginBottom:3}}>Connectée en tant que</div>
              <div style={{fontSize:13,color:C.brown,fontWeight:600,wordBreak:"break-all"}}>{session?.user?.email||"—"}</div>
            </div>

            {(accErr||accMsg)&&<div style={{fontSize:11,color:accErr?"#B5553F":"#4A7A52",background:accErr?"#FDF0E8":"#EAF3EA",borderRadius:9,padding:"8px 11px",marginBottom:12,lineHeight:1.5}}>{accErr||accMsg}</div>}

            <div style={{background:C.white,borderRadius:14,padding:"14px 15px",border:`1px solid ${C.border}`,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.brown,marginBottom:10}}>Mon prénom</div>
              <div style={{display:"flex",gap:8}}>
                <input value={accPrenom} onChange={e=>setAccPrenom(e.target.value)} placeholder="ton prénom"
                  style={{flex:1,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",fontSize:13,fontFamily:"inherit",color:C.brown,background:C.cream,outline:"none"}}/>
                <button onClick={savePrenom} style={{background:pc.p,color:"#fff",border:"none",borderRadius:10,padding:"0 16px",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer"}}>ok</button>
              </div>
            </div>

            <div style={{background:C.white,borderRadius:14,padding:"14px 15px",border:`1px solid ${C.border}`,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.brown,marginBottom:10}}>Changer mon email</div>
              <input type="email" value={accNewEmail} onChange={e=>setAccNewEmail(e.target.value)} autoComplete="email" placeholder="nouvel email"
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",fontSize:13,fontFamily:"inherit",color:C.brown,background:C.cream,outline:"none",marginBottom:8}}/>
              <button onClick={changeEmail} disabled={accBusy||!accNewEmail}
                style={{width:"100%",background:(accBusy||!accNewEmail)?C.light:pc.p,color:"#fff",border:"none",borderRadius:10,padding:"11px",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:(accBusy||!accNewEmail)?"default":"pointer"}}>
                {accBusy?"un instant…":"mettre à jour mon email"}
              </button>
              <div style={{fontSize:9,color:C.light,marginTop:7,lineHeight:1.5}}>un email de confirmation sera envoyé à la nouvelle adresse pour valider le changement.</div>
            </div>

            <div style={{background:C.white,borderRadius:14,padding:"14px 15px",border:`1px solid ${C.border}`,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.brown,marginBottom:10}}>Changer mon mot de passe</div>
              <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} autoComplete="new-password" placeholder="nouveau mot de passe (6 caractères min.)"
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",fontSize:13,fontFamily:"inherit",color:C.brown,background:C.cream,outline:"none",marginBottom:8}}/>
              <button onClick={changePw} disabled={accBusy||newPw.length<6}
                style={{width:"100%",background:(accBusy||newPw.length<6)?C.light:pc.p,color:"#fff",border:"none",borderRadius:10,padding:"11px",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:(accBusy||newPw.length<6)?"default":"pointer"}}>
                {accBusy?"un instant…":"mettre à jour mon mot de passe"}
              </button>
            </div>

            <div style={{background:C.white,borderRadius:14,padding:"14px 15px",border:`1px solid ${C.border}`,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.brown,marginBottom:4}}>Mes rappels</div>
              <div style={{fontSize:10.5,color:C.mid,lineHeight:1.55,marginBottom:11}}>reçois un petit rappel doux chaque jour pour prendre soin de toi.</div>
              {notifPerm==="granted"?(
                <div style={{display:"flex",alignItems:"center",gap:8,background:"#EAF3EA",borderRadius:10,padding:"11px 13px",fontSize:12,color:"#4A7A52",fontWeight:600}}>
                  <Icon name="check" size={16} color="#4A7A52"/> rappels activés
                </div>
              ):notifPerm==="denied"?(
                <div style={{fontSize:10.5,color:C.mid,lineHeight:1.55,background:C.bubble,borderRadius:10,padding:"11px 13px"}}>les notifications sont bloquées sur ce téléphone. tu peux les réactiver dans les réglages de ton navigateur ou de ton téléphone.</div>
              ):(
                <button onClick={enableNotif} style={{width:"100%",background:pc.p,color:"#fff",border:"none",borderRadius:10,padding:"12px",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer"}}>activer mes rappels</button>
              )}
              {(isIOS&&!isStandalone)&&<div style={{fontSize:9.5,color:C.light,marginTop:8,lineHeight:1.55}}>sur iPhone, ajoute d'abord l'app à ton écran d'accueil pour recevoir les rappels. <button onClick={()=>{setShowAccount(false);setShowInstall(true);}} style={{background:"none",border:"none",color:pc.p,fontFamily:"inherit",fontSize:9.5,fontWeight:700,cursor:"pointer",padding:0,textDecoration:"underline"}}>voir comment</button></div>}
            </div>

            <button onClick={logout} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px",fontFamily:"inherit",fontSize:12.5,fontWeight:600,color:"#B5553F",cursor:"pointer"}}>
              se déconnecter
            </button>
            <div style={{fontSize:9.5,color:C.light,textAlign:"center",marginTop:14,lineHeight:1.6}}>tes données sont sauvegardées automatiquement sur ton compte.</div>
          </div>
        </div>
      )}

      {/* PAGE D'INSTRUCTIONS — AJOUTER À L'ÉCRAN D'ACCUEIL */}
      {showInstall&&(
        <div onClick={()=>setShowInstall(false)} style={{position:"fixed",inset:0,zIndex:320,background:"rgba(58,42,32,.45)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.cream,width:"100%",maxWidth:430,borderRadius:"22px 22px 0 0",padding:"1.4rem 1.3rem 1.9rem",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:C.brown,fontWeight:600}}>Installe l'app</div>
              <button onClick={()=>setShowInstall(false)} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:"50%",width:32,height:32,cursor:"pointer",color:C.mid,fontSize:15,fontFamily:"inherit"}}>✕</button>
            </div>
            <div style={{fontSize:11.5,color:C.mid,lineHeight:1.6,marginBottom:16}}>ajoute SMOP Map à ton écran d'accueil : tu l'ouvres comme une vraie app, et tu peux recevoir un petit rappel chaque jour. Pas besoin d'App Store.</div>

            {canInstallAndroid && (
              <button onClick={triggerInstall} style={{width:"100%",background:C.brown,color:"#fff",border:"none",borderRadius:12,padding:"13px",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:16}}>Installer maintenant</button>
            )}

            <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:C.light,marginBottom:10}}>{isIOS?"Sur iPhone / iPad (Safari)":"Sur ton téléphone"}</div>
            {(isIOS?[
              {n:"1",t:"Appuie sur le bouton Partager",d:"l'icône carrée avec une flèche vers le haut, en bas de Safari."},
              {n:"2",t:"Choisis « Sur l'écran d'accueil »",d:"fais défiler le menu si besoin pour la trouver."},
              {n:"3",t:"Appuie sur « Ajouter »",d:"l'icône SMOP Map apparaît sur ton écran, comme une app."},
              {n:"4",t:"Ouvre l'app depuis cette icône",d:"et active tes rappels dans Mon compte."},
            ]:[
              {n:"1",t:"Ouvre le menu de ton navigateur",d:"les trois points en haut à droite (Chrome)."},
              {n:"2",t:"Choisis « Installer l'application »",d:"ou « Ajouter à l'écran d'accueil »."},
              {n:"3",t:"Confirme",d:"l'icône SMOP Map apparaît sur ton écran d'accueil."},
              {n:"4",t:"Ouvre l'app depuis cette icône",d:"et active tes rappels dans Mon compte."},
            ]).map((s,i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:14}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:pc.p,color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.n}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12.5,fontWeight:600,color:C.brown}}>{s.t}</div>
                  <div style={{fontSize:10.5,color:C.mid,marginTop:2,lineHeight:1.5}}>{s.d}</div>
                </div>
              </div>
            ))}
            <div style={{fontSize:9.5,color:C.light,textAlign:"center",marginTop:8,lineHeight:1.6}}>sur iPhone, les rappels ne fonctionnent qu'une fois l'app ajoutée à l'écran d'accueil.</div>
          </div>
        </div>
      )}

      {/* APERÇU DOSSIER MÉDECIN (impression / PDF, marche sur mobile) */}
      {dossierInner&&(
        <div id="sopk-dossier" style={{position:"fixed",inset:0,zIndex:400,background:"#fff",overflowY:"auto"}}>
          <div className="sopk-noprint" style={{position:"sticky",top:0,background:C.cream,borderBottom:`1px solid ${C.border}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
            <button onClick={()=>setDossierInner("")} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 14px",fontFamily:"inherit",fontSize:12,color:C.mid,cursor:"pointer"}}>← fermer</button>
            <button onClick={()=>window.print()} style={{background:pc.p,color:"#fff",border:"none",borderRadius:10,padding:"9px 16px",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer"}}>Imprimer / Enregistrer en PDF</button>
          </div>
          <div className="sopk-noprint" style={{fontSize:10.5,color:C.light,padding:"10px 20px 0",lineHeight:1.5,maxWidth:720,margin:"0 auto"}}>sur téléphone : appuie sur « Imprimer », puis en bas choisis « Enregistrer au format PDF » ou « Partager ».</div>
          <div id="sopk-dossier-content" style={{maxWidth:720,margin:"0 auto",padding:"18px 20px 40px"}} dangerouslySetInnerHTML={{__html:dossierInner}}/>
        </div>
      )}

      {/* OVERLAY RECHERCHE GLOBALE */}
      {searchOpen&&(()=>{
        const q=searchQ.trim().toLowerCase();
        const norm=s=>(s||"").toLowerCase();
        let rSos=[], rRec=[], rAli=[], rJours=[];
        if(q.length>=2){
          rSos=SOS_DATA.filter(s=>norm(s.titre).includes(q)||norm(s.validation).includes(q)||norm(s.mecanisme).includes(q)).slice(0,6);
          rRec=Object.keys(RECETTES).filter(n=>norm(n).includes(q)||(RECETTES[n].tags||[]).some(t=>norm(t).includes(q))).slice(0,6);
          rAli=ALIMENTS.filter(a=>norm(a.nom).includes(q)||norm(a.note).includes(q)).slice(0,6);
          rJours=MISSIONS_META.filter(m=>norm(m.theme).includes(q)||norm(m.mission).includes(q)).slice(0,5);
        }
        const total=rSos.length+rRec.length+rAli.length+rJours.length;
        return(
          <div style={{position:"fixed",inset:0,background:C.cream,zIndex:300,maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column"}}>
            {/* Barre de recherche */}
            <div style={{background:`linear-gradient(135deg,${pc.p},#9A6040)`,padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:10}}>
              <input autoFocus type="text" placeholder="cherche un symptôme, une recette, un aliment…" value={searchQ}
                onChange={e=>setSearchQ(e.target.value)}
                style={{flex:1,padding:"11px 14px",border:"none",borderRadius:12,fontFamily:"inherit",fontSize:14,color:C.brown,background:"white"}}/>
              <button onClick={()=>{setSearchOpen(false);setSearchQ("");}}
                style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:10,color:"white",fontSize:13,fontWeight:600,padding:"9px 12px",cursor:"pointer",fontFamily:"inherit"}}>Fermer</button>
            </div>
            {/* Résultats */}
            <div style={{flex:1,overflowY:"auto",padding:"1rem 1.25rem"}}>
              {q.length<2&&(
                <div style={{textAlign:"center",padding:"40px 20px",color:C.light}}>
                  <div style={{fontSize:30,marginBottom:10}}>🔍</div>
                  <div style={{fontSize:12.5,lineHeight:1.6}}>tape un mot pour chercher partout dans l'app :<br/>tes fiches SOS, tes recettes, les aliments, les jours du protocole.</div>
                </div>
              )}
              {q.length>=2&&total===0&&(
                <div style={{textAlign:"center",padding:"40px 20px",color:C.light,fontSize:12.5,lineHeight:1.6}}>aucun résultat pour « {searchQ} ».<br/>essaie un autre mot (ex : fatigue, fringale, saumon, sommeil).</div>
              )}
              {/* SOS */}
              {rSos.length>0&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:pc.p,marginBottom:8}}>⚡ Fiches SOS</div>
                  {rSos.map((s,k)=>(
                    <button key={k} onClick={()=>{setTab("sos");setSearchOpen(false);setSearchQ("");}}
                      style={{width:"100%",textAlign:"left",background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px",marginBottom:7,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:18}}>{s.emoji}</span>
                      <span style={{flex:1}}>
                        <span style={{display:"block",fontSize:12.5,fontWeight:600,color:C.brown}}>{s.titre}</span>
                        <span style={{display:"block",fontSize:10,color:C.light}}>ouvrir cette fiche SOS</span>
                      </span>
                      <span style={{color:pc.p,fontSize:14}}>→</span>
                    </button>
                  ))}
                </div>
              )}
              {/* Recettes */}
              {rRec.length>0&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:pc.p,marginBottom:8}}>📖 Recettes</div>
                  {rRec.map((n,k)=>(
                    <button key={k} onClick={()=>{setTab("outils");setOutilOpen("recettes");setRecetteFiche(n);setSearchOpen(false);setSearchQ("");}}
                      style={{width:"100%",textAlign:"left",background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px",marginBottom:7,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:16}}>🍲</span>
                      <span style={{flex:1}}>
                        <span style={{display:"block",fontSize:12.5,fontWeight:600,color:C.brown}}>{n}</span>
                        <span style={{display:"block",fontSize:10,color:C.light}}>{RECETTES[n].temps}{RECETTES[n].tags&&RECETTES[n].tags[0]?" · "+RECETTES[n].tags[0]:""}</span>
                      </span>
                      <span style={{color:pc.p,fontSize:14}}>→</span>
                    </button>
                  ))}
                </div>
              )}
              {/* Aliments */}
              {rAli.length>0&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:pc.p,marginBottom:8}}>🍽️ Aliments</div>
                  {rAli.map((a,k)=>(
                    <button key={k} onClick={()=>{setTab("outils");setOutilOpen("aliments");setFoodSearch(a.nom);setSearchOpen(false);setSearchQ("");}}
                      style={{width:"100%",textAlign:"left",background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px",marginBottom:7,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{flex:1}}>
                        <span style={{display:"block",fontSize:12.5,fontWeight:600,color:C.brown}}>{a.nom}</span>
                        <span style={{display:"block",fontSize:10,color:C.light}}>IG {a.ig} · {a.sopk}</span>
                      </span>
                      <span style={{color:pc.p,fontSize:14}}>→</span>
                    </button>
                  ))}
                </div>
              )}
              {/* Jours du protocole */}
              {rJours.length>0&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:pc.p,marginBottom:8}}>Jours du protocole</div>
                  {rJours.map((m,k)=>(
                    <button key={k} onClick={()=>{setDay(m.day);setTab("kamila");setSearchOpen(false);setSearchQ("");}}
                      style={{width:"100%",textAlign:"left",background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px",marginBottom:7,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:16}}>{m.emoji}</span>
                      <span style={{flex:1}}>
                        <span style={{display:"block",fontSize:12.5,fontWeight:600,color:C.brown}}>Jour {m.day} — {m.theme}</span>
                        <span style={{display:"block",fontSize:10,color:C.light}}>aller à cette journée</span>
                      </span>
                      <span style={{color:pc.p,fontSize:14}}>→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* BOUTON MODE CRISE flottant (mobile) */}
      <button className="bottom-nav-wrap" onClick={()=>setCriseMode(true)}
        style={{position:"fixed",bottom:78,right:16,zIndex:31,background:C.white,border:"1.5px solid #E3B8AC",color:"#B5553F",borderRadius:99,padding:"10px 15px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 16px rgba(181,85,63,.22)",display:"flex",alignItems:"center",gap:6}}>
        <Icon name="alert" size={14} color="#B5553F"/>mode crise
      </button>

      {/* BOTTOM NAV (mobile) */}
      <div className="bottom-nav-wrap" style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.white,borderTop:`1px solid ${C.border}`,padding:"9px 4px 12px",display:"flex",justifyContent:"space-around",zIndex:30}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"3px 4px",fontFamily:"inherit",flex:1}}>
            <Icon name={t.icon} size={21} color={tab===t.id?C.mauve:C.light} stroke={tab===t.id?1.9:1.6}/>
            <span style={{fontSize:8.5,color:tab===t.id?C.mauve:C.light,fontWeight:tab===t.id?700:500}}>{t.label}</span>
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}
