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
  {day:1,emoji:"🌱",theme:"l'ordre dans l'assiette",mission:"mange ton prochain repas dans le bon ordre — légumes d'abord, protéines, féculents en dernier.",biologie:"les fibres des légumes forment un gel dans l'intestin qui ralentit l'absorption des glucides. ton pic de glycémie chute jusqu'à 30%. ton pancréas produit moins d'insuline.",msg:"la plupart des médecins ne t'ont jamais dit ça.\n\npourtant c'est l'un des gestes les plus puissants pour ton insuline — sans régime, sans privation.\n\nl'ordre dans l'assiette change la réponse de ton corps.",victoire:"tu viens de faire quelque chose que la plupart des médecins n'ont jamais pris le temps de t'expliquer.",tisane:{nom:"Cure Détox",timing:"matin à jeun",lien:"https://sopklife.com/products/cure-detox-organisme-clean",texte:"avant tout le reste — on prépare ton foie. c'est lui qui élimine l'excès d'androgènes. la Cure Détox commence aujourd'hui."}},
  {day:2,emoji:"🥚",theme:"le petit-déjeuner qui change tout",mission:"remplace ton petit-déjeuner par une version protéinée — et note comment tu te sens à 11h.",biologie:"un petit-déjeuner glucidique crée un pic d'insuline dès le matin. ensuite c'est les montagnes russes toute la journée. les protéines stabilisent la glycémie sur 4 à 5 heures.",msg:"tu n'aimes pas le salé le matin ? \n\nouvre 'Pourquoi moi' → 'Mes options petit-déjeuner' — il y en a pour toutes les Cysters.",victoire:"si tu te sens différente à 11h — tu viens de trouver une cause directe de ta fatigue."},
  {day:3,emoji:"📋",theme:"lire ses fringales comme des données",mission:"note tes fringales aujourd'hui — heure, contexte, ressenti.",biologie:"tes fringales ne disent pas que t'as pas de volonté. elles disent que ton insuline vient de chuter. ton cerveau envoie une alarme biologique. c'est automatique.",msg:"tu ne subis plus tes fringales.\n\ntu commences à les comprendre.",victoire:"passer de 'je manque de volonté' à 'je comprends mon mécanisme' — c'est la vraie victoire."},
  {day:4,emoji:"💧",theme:"le geste le plus sous-estimé",mission:"bois 300ml d'eau 10 à 15 minutes avant chaque repas.",biologie:"l'eau avant le repas ralentit la digestion. les glucides arrivent moins brutalement. le pic glycémique est plus doux. l'insuline monte moins vite.",msg:"gratuit. immédiat. et presque personne ne le fait.",victoire:"tu agis sur ton insuline sans changer ce que tu manges."},
  {day:5,emoji:"🚶‍♀️",theme:"le mouvement qui change la glycémie",mission:"marche activement 15 minutes après le dîner ce soir.",biologie:"pendant l'exercice, tes muscles activent des transporteurs de glucose directement — sans que ton pancréas ait besoin de produire plus d'insuline. 15 minutes de marche peut réduire le pic glycémique de 20 à 30%.",msg:"c'est l'outil le plus puissant et le moins prescrit du profil Métabolique.",victoire:"tu viens d'utiliser ton corps comme outil thérapeutique. sans ordonnance."},
  {day:6,emoji:"🔍",theme:"trouver le sucre caché",mission:"lis les étiquettes de 3 produits — cherche sirop de glucose-fructose, dextrose, maltose.",biologie:"le sucre a 56 noms sur les étiquettes. il se cache dans le pain complet, la sauce tomate, le yaourt nature. le fructose est traité directement par le foie et aggrave la résistance à l'insuline sans déclencher la satiété.",msg:"beaucoup de Cysters pensent manger correctement.\n\net découvrent aujourd'hui où se cachent les sucres qui entretiennent leurs fringales.",victoire:"tu viens peut-être de trouver une pièce importante de ton puzzle."},
  {day:7,emoji:"🎯",theme:"bilan de semaine 1",mission:"note 3 choses qui ont changé cette semaine — même imperceptibles.",biologie:"ton pancréas produit moins d'insuline à chaque repas. la Cure Détox a préparé ton foie. les changements sont souvent invisibles dans le miroir à J7 — mais réels dans ta biologie.",msg:"une semaine entière. tu l'as fait.\n\nmême les jours difficiles.",victoire:"une semaine de cohérence. c'est déjà infiniment plus que rien."},
  {day:8,emoji:"💪",theme:"les protéines et tes hormones",mission:"une source de protéines à chacun de tes repas aujourd'hui.",biologie:"l'insuline élevée envoie un signal direct à tes ovaires : produisez plus d'androgènes. stabiliser ton insuline avec des protéines commence à interrompre ce signal.",msg:"semaine 2.\n\nle cap le plus difficile est derrière toi.",victoire:"chaque repas avec des protéines est un repas où ton insuline travaille pour toi.",tisane:{nom:"Équilibre Féminin",timing:"milieu de journée",lien:"https://sopklife.com/products/cure-sopk-equilibre-feminin",texte:"aujourd'hui la fondation hormonale entre dans ton protocole. 8 plantes certifiées bio. laisse 2h avec la Cure Détox du matin."}},
  {day:9,emoji:"✨",theme:"le magnésium",mission:"commence le magnésium bisglycinate ce soir — 200 à 400mg au coucher.",biologie:"le magnésium est carencé chez la majorité des femmes SOPK. il améliore la sensibilité à l'insuline, réduit le cortisol, et améliore la qualité du sommeil profond.",msg:"trois problèmes du SOPK Métabolique. un seul complément.",victoire:"tu viens de commencer quelque chose qui travaille pour toi même quand tu dors."},
  {day:10,emoji:"🥦",theme:"le foie dans le SOPK",mission:"légumes crucifères crus à un repas — chou rouge, roquette, radis, brocoli.",biologie:"les crucifères contiennent du DIM qui active la phase 2 hépatique — celle qui élimine définitivement les androgènes en excès. ton foie est l'organe le plus sous-estimé du SOPK.",msg:"personne ne t'avait parlé du foie dans ton cabinet médical.\n\npourtant c'est lui qui élimine l'excès d'androgènes.",victoire:"dix jours. ton foie commence à travailler différemment."},
  {day:11,emoji:"🏋️‍♀️",theme:"le renforcement musculaire",mission:"20 minutes — Squats 3×15 · Fentes 3×12 · Pompes 3×10 · Gainage 3×30s",biologie:"le muscle représente 70 à 80% de la captation du glucose dans ton corps. plus tu as de masse musculaire, plus tu as de réservoirs pour stocker le glucose sans insuline supplémentaire.",msg:"tu ne fais pas du sport pour brûler des calories.\n\ntu construis un muscle qui travaille pour toi 24h/24.",victoire:"première séance. c'est la plus difficile. tu l'as faite."},
  {day:12,emoji:"🌿",theme:"la cannelle de Ceylan",mission:"½ cuillère à café de cannelle de Ceylan sur ton petit-déjeuner. Ceylan — pas Cassia.",biologie:"la cannelle de Ceylan améliore la façon dont tes cellules entendent le signal de l'insuline. des études ont mesuré une réduction de la glycémie à jeun de 18 à 29% après 40 jours.",msg:"c'est un des secrets les plus documentés du profil Métabolique.\n\net presque personne ne le sait.",victoire:"un allié puissant. sans effort. sans coût. sans ordonnance."},
  {day:13,emoji:"🌙",theme:"le sommeil est médecine",mission:"couche-toi 30 minutes plus tôt. écrans off 30 min avant. chambre fraîche.",biologie:"chaque heure de sommeil en moins augmente la résistance à l'insuline du lendemain. le cortisol de privation de sommeil aggrave directement l'insulinorésistance.",msg:"dormir c'est agir.\n\nton corps guérit la nuit. pas pendant que tu scrolles.",victoire:"tu viens de prescrire à ton corps une dose de rééquilibrage hormonal."},
  {day:14,emoji:"🏆",theme:"mi-parcours",mission:"compare ton score de brouillard avec le Jour 1. note la différence.",biologie:"deux semaines de décisions quotidiennes. ton pancréas produit moins d'insuline. tes ovaires reçoivent un signal androgénique moins fort. les changements précèdent toujours ce qu'on voit dans le miroir.",msg:"à J14 la plupart des Cysters ne voient pas encore.\n\nc'est normal. la biologie précède toujours le visible.",victoire:"ce que tu vois aujourd'hui c'est la preuve que la constance produit des résultats.",tisane:{nom:"Stabilitea",timing:"après les repas",lien:"https://sopklife.com/products/stabili-tea",texte:"le terrain est préparé. aujourd'hui la Stabilitea entre — feuilles de mûrier, cannelle de Ceylan, eucalyptus. glycémie ciblée directement."}},
  {day:15,emoji:"🏥",theme:"préparer ton rendez-vous",mission:"ouvre l'onglet Médecin. prépare ton dossier. note tes analyses à demander.",biologie:"les analyses prioritaires pour ton profil : insuline à jeun, HOMA-IR, HGPO (Hyperglycémie Provoquée par voie Orale), testostérone libre + SHBG, vitamine D.",msg:"tu n'attends plus qu'on te sauve.\n\ntu collabores avec ton médecin.\n\nc'est différent.",victoire:"préparer son rendez-vous c'est reprendre le contrôle de sa santé."},
  {day:16,emoji:"💊",theme:"l'inositol",mission:"commence l'inositol — 2g myo-inositol + 50mg D-chiro-inositol, 2x/jour. Ratio 40:1.",biologie:"le myo-inositol amplifie le signal insulinique dans les cellules. le D-chiro-inositol réduit directement la production d'androgènes ovariens. délai d'action : 8 à 12 semaines.",msg:"les vraies transformations prennent le temps de la biologie.\n\ncontinue.",victoire:"tu viens de commencer quelque chose que beaucoup abandonnent trop tôt."},
  {day:17,emoji:"🥑",theme:"les graisses contre les sucres",mission:"fais un échange : pain blanc → avocat, ou céréales → noix, ou biscuit → chocolat 85%.",biologie:"les graisses ne stimulent pas significativement l'insuline. elles ralentissent la digestion et lissent la réponse glycémique. l'ennemi du profil Métabolique n'est pas le gras — c'est le sucre raffiné.",msg:"ce que tu fais aujourd'hui contredit tout ce qu'on t'a appris sur les régimes.",victoire:"tu viens de désactiver une croyance nutritionnelle qui t'a freinée pendant des années."},
  {day:18,emoji:"🔥",theme:"deuxième séance de renforcement",mission:"Rowing bouteilles 3×15 · Élévations 3×15 · Squat+press 3×12 · Superman 3×15",biologie:"le haut du corps a un impact spécifique sur la sensibilité à l'insuline hépatique. à 2 séances par semaine les fenêtres d'amélioration commencent à se chevaucher.",msg:"deux séances. tu atteins le seuil qui fait la différence.",victoire:"ce n'est plus un essai. c'est un rythme."},
  {day:19,emoji:"⚡",theme:"le zinc",mission:"commence le zinc — 15 à 25mg avec le repas. jamais à jeun.",biologie:"le zinc inhibe la 5-alpha-réductase — l'enzyme qui active la DHT. il régule aussi la sécrétion de sébum et est anti-inflammatoire systémique.",msg:"un complément. trois mécanismes SOPK.\n\nc'est pour ça qu'il est prioritaire.",victoire:"protocole compléments en place : magnésium + inositol + zinc."},
  {day:20,emoji:"👣",theme:"marche double",mission:"marche 15 minutes après le déjeuner ET après le dîner.",biologie:"les deux repas principaux créent les deux pics glycémiques les plus importants de la journée. intervenir après les deux réduit l'exposition à l'insuline de façon significative sur toute la journée.",msg:"vingt jours. ce n'est plus un effort.\n\nc'est ce que tu fais.",victoire:"20 jours de cohérence. c'est ce que tu as construit."},
  {day:21,emoji:"📈",theme:"rendre visible ce qui a changé",mission:"note ce qui a changé depuis J14 — cherche les micro-victoires.",biologie:"la semaine 3 est souvent celle où les premières modifications commencent à se sentir. pas spectaculairement — subtilement. énergie plus stable. fringales moins intenses.",msg:"regarde déjà tout ce que tu comprends aujourd'hui\nque tu ne comprenais pas il y a 3 semaines.",victoire:"la progression se mesure en compréhension autant qu'en symptômes."},
  {day:22,emoji:"🔬",theme:"relire tes analyses",mission:"si tu as des analyses, ouvre le Traducteur dans l'application.",biologie:"une insuline à 22 µUI/mL sera dite 'normale' par ton laboratoire. la norme fonctionnelle idéale est < 8 µUI/mL. c'est pour ça que ton médecin peut dire 'tout va bien' pendant que toi tu ne vas pas bien.",msg:"tu n'as plus besoin d'attendre qu'on t'explique.\n\ntu lis ton propre corps.",victoire:"relire ses analyses sans panique — c'est une des plus grandes victoires du protocole."},
  {day:23,emoji:"☀️",theme:"vitamine D",mission:"commence la vitamine D3 + K2 — 2000 à 4000 UI avec un repas contenant des graisses.",biologie:"les récepteurs à la vitamine D sont présents sur les cellules du pancréas. une carence réduit leur fonction et aggrave directement la résistance à l'insuline. toujours D3 + K2 ensemble.",msg:"quatre compléments en place.\nmagnésium · inositol · zinc · vitamine D.",victoire:"tu construis des fondations que tu porteras longtemps après ces 30 jours."},
  {day:24,emoji:"💥",theme:"troisième séance",mission:"même programme qu'à J18. 3 séances cette semaine.",biologie:"à 3 séances hebdomadaires l'amélioration de la sensibilité à l'insuline est quasi continue. le muscle produit aussi des myokines — molécules anti-inflammatoires sécrétées pendant l'exercice.",msg:"trois séances. tu atteins la fréquence optimale.",victoire:"trois séances. c'est là où l'impact devient durable."},
  {day:25,emoji:"🌅",theme:"ancrer l'habitude",mission:"5 petits-déjeuners protéinés consécutifs — jusqu'à ce que ça devienne automatique.",biologie:"une habitude se consolide entre 21 et 66 jours. la répétition crée des circuits neuronaux automatiques. c'est de la neuroplasticité — pas de la volonté.",msg:"la différence entre 'j'essaie de changer' et\n'c'est comme ça que je mange' — tu y es.",victoire:"ce n'est plus un effort. c'est une identité."},
  {day:26,emoji:"📁",theme:"prendre rendez-vous",mission:"prends rendez-vous chez ton médecin avec ton dossier préparé.",biologie:"tu entres dans ce cabinet avec 26 jours de compréhension de ton propre corps. tu sais quoi demander. tu sais quoi dire si on résiste.",msg:"tu n'attends plus que quelqu'un te sauve.\n\ntu collabores. c'est différent.",victoire:"transformer une consultation en collaboration — c'est énorme."},
  {day:27,emoji:"🎯",theme:"bilan honnête",mission:"identifie l'obstacle principal de ces 4 semaines — sans jugement.",biologie:"l'obstacle le plus récurrent n'est pas le manque de volonté. c'est la praticité — manger protéiné à l'extérieur, trouver le temps pour le renforcement.",msg:"tu ne fais pas le bilan pour te juger.\n\ntu le fais pour ne plus jamais repartir de zéro.",victoire:"nommer ses obstacles honnêtement — c'est déjà les réduire."},
  {day:28,emoji:"⚡",theme:"tout ensemble",mission:"renforcement + marche après le dîner + tes 3 tisanes.",biologie:"le renforcement améliore la sensibilité à l'insuline sur 24-48h. la marche post-repas l'amplifie immédiatement. les tisanes agissent en couches simultanément.",msg:"tu n'es plus en train d'essayer de te soigner.\n\ntu sais comment prendre soin de toi.",victoire:"les deux leviers ensemble. c'est ton jour le plus puissant."},
  {day:29,emoji:"📊",theme:"mesurer le chemin parcouru",mission:"compare tes symptômes d'aujourd'hui avec ceux du Jour 1.",biologie:"ton insuline à jeun a probablement baissé. tes ovaires reçoivent un signal androgénique réduit. la Stabilitea ralentit l'absorption des glucides depuis 2 semaines.",msg:"les améliorations sont souvent plus grandes\nqu'on ne les perçoit de l'intérieur.",victoire:"tu n'es plus la même femme qu'au Jour 1."},
  {day:30,emoji:"🌸",theme:"ce que tu emmènes",mission:"écris deux choses : ce que tu emmènes de ces 30 jours. ce que tu laisses derrière.",biologie:"tu as construit : une alimentation qui soutient ton insuline, un foie qui travaille mieux, un muscle qui gère ta glycémie, un protocole tisane en 3 couches, des mots pour ton médecin.",msg:"tu avances peut-être plus lentement que tu le voudrais.\n\nmais tu avances.\n\net c'est tout ce qui compte.\n\nKamila 🌿",victoire:"ce ne sont pas 30 jours terminés. c'est une baseline."},
];

const VOCAUX = [
  {id:"bienvenue",titre:"Bienvenue Cyster",when:"J0",desc:"Le message de départ",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262265/Nouvel_enregistrement_2_dzgugj.mp3"},
  {id:"miParcours",titre:"Mi-parcours",when:"J14",desc:"Pour la deuxième moitié",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262394/Nouvel_enregistrement_3_oktybp.mp3"},
  {id:"difficile",titre:"Pour les jours difficiles",when:"SOS",desc:"Quand c'est dur",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262416/Nouvel_enregistrement_4_ngzb7h.mp3"},
  {id:"rdv",titre:"Avant ton rendez-vous",when:"RDV",desc:"Pour entrer préparée",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262416/Nouvel_enregistrement_5_zyqlh5.mp3"},
  {id:"fin",titre:"30 jours — La fin",when:"J30",desc:"Ce que tu as construit",file:"https://res.cloudinary.com/drfu1c1u2/video/upload/f_mp3/v1781262415/Nouvel_enregistrement_6_t0wubb.mp3"},
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
  const [profil] = useState("metabolique");
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
  useEffect(()=>{ save("day",day); },[day]);
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

  const TABS=[{id:"kamila",icon:"🌿",label:"Kamila"},{id:"sos",icon:"⚡",label:"SOS"},{id:"analyses",icon:"🔬",label:"Analyses"},{id:"medecin",icon:"👩‍⚕️",label:"Médecin"},{id:"journal",icon:"📒",label:"Journal"}];

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
          onKeyDown={e=>e.key==="Enter"&&prenomInput.trim()&&(setPrenom(prenomInput.trim()),setScreen("priorites"))}
          style={{width:"100%",padding:"14px 16px",border:`2px solid ${C.border}`,borderRadius:14,fontFamily:"inherit",fontSize:16,color:C.brown,background:C.cream,textAlign:"center",transition:"border-color 0.2s"}}
          autoFocus
        />
        <button
          onClick={()=>prenomInput.trim()&&(setPrenom(prenomInput.trim()),setScreen("priorites"))}
          style={{width:"100%",background:prenomInput.trim()?pc.p:C.border,border:"none",padding:"14px",borderRadius:14,color:"white",fontFamily:"inherit",fontSize:15,fontWeight:600,cursor:prenomInput.trim()?"pointer":"not-allowed",marginTop:12,transition:"background 0.2s"}}>
          Commencer mon Protocole →
        </button>
      </div>
      <div style={{textAlign:"center",marginTop:16,fontSize:11,color:C.light,lineHeight:1.6}}>
        Protocole SOPK Life · Profil Métabolique
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

        {[
          {n:"01",em:"⚡",t:"Stabiliser ta glycémie",col:pc.p,res:["Moins de fringales","Plus d'énergie entre les repas","Moins de stockage abdominal"],quand:"2 à 4 semaines",geste:"L'ordre des aliments — dès aujourd'hui"},
          {n:"02",em:"✨",t:"Corriger les carences silencieuses",col:C.gold,res:["Énergie au réveil","Meilleur sommeil","Moins de fatigue profonde"],quand:"1 à 3 semaines",geste:"Magnésium bisglycinate ce soir"},
          {n:"03",em:"🌱",t:"Soutenir ton foie",col:C.sage,res:["Moins de gonflements","Peau qui s'améliore","Androgènes mieux éliminés"],quand:"3 à 6 semaines",geste:"Cure Détox demain matin à jeun"},
        ].map((p,i)=>(
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
            style={{flex:1,padding:"8px 2px 6px",border:"none",background:"none",cursor:"pointer",fontSize:9,color:tab===t.id?pc.p:C.light,borderBottom:tab===t.id?`2px solid ${pc.p}`:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontFamily:"inherit"}}>
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
                  <div style={{fontSize:13,fontWeight:600,color:C.brown,lineHeight:1.35,marginBottom:8,whiteSpace:"pre-line"}}>{todayData.mission}</div>
                  <div style={{fontSize:11,color:C.mid,lineHeight:1.7,background:C.cream,borderRadius:10,padding:"9px 11px",whiteSpace:"pre-line"}}>
                    💡 {todayData.biologie}
                  </div>
                </div>
                <button onClick={()=>setChecked(p=>({...p,[day]:!p[day]}))}
                  style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${checked[day]?pc.p:C.border}`,background:checked[day]?pc.p:"transparent",cursor:"pointer",fontSize:15,color:"white",flexShrink:0,transition:"all 0.25s",fontFamily:"inherit"}}>
                  {checked[day]?"✓":""}
                </button>
              </div>
              {checked[day]&&<div style={{marginTop:8,fontSize:11,color:pc.p,fontWeight:500,textAlign:"center",padding:"6px",background:`${pc.p}08`,borderRadius:8}}>✓ {todayData.victoire}</div>}
            </div>

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
              {VOCAUX.map((v,i)=>(
                <div key={i} style={{background:C.cream,borderRadius:10,marginBottom:6,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px"}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:`${pc.p}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🎙️</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:500,color:C.brown}}>{v.titre}</div>
                      <div style={{fontSize:9,color:C.light}}>{v.desc}</div>
                    </div>
                    <div style={{fontSize:9,color:C.light,background:C.border,borderRadius:99,padding:"2px 7px"}}>{v.when}</div>
                  </div>
                  {v.file&&(
                    <audio controls style={{width:"100%",height:32,marginTop:2}}
                      controlsList="nodownload"
                      src={v.file}>
                    </audio>
                  )}
                </div>
              ))}
              <div style={{fontSize:9,color:C.light,textAlign:"center",marginTop:4}}>appuie sur ▶ pour écouter</div>
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
            style={{background:tab===t.id?`${pc.p}10`:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 8px",borderRadius:10,fontFamily:"inherit"}}>
            <span style={{fontSize:15}}>{t.icon}</span>
            <span style={{fontSize:9,color:tab===t.id?pc.p:C.light,fontWeight:tab===t.id?600:400}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
