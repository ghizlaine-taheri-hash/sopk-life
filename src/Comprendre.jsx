import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// COMPRENDRE MON SMOP — la bibliothèque
// Une seule bibliothèque de fiches. Les entrées par besoin, les collections et les parcours
// ne sont que des portes d'entrée vers ces fiches : aucun contenu n'est recopié.
// Chaque fiche : Ça te parle ? · Ce qui se passe (avec son étiquette de preuve) · Ce que tu peux faire ·
// Quand en parler à ton médecin · (Mon vécu, séparé) · ses sources, avec leur statut de vérification.
// Information éducative : ne remplace pas un avis médical. Jamais « traite », « guérit », « régule ».
// ═══════════════════════════════════════════════════════════════════════════

// ── le registre des sources : « consultée » seulement si la source a vraiment été ouverte ──
export const SOURCES = {
  jcem2023: { ref:"Teede H.J. et al. Recommendations from the 2023 International Evidence-based Guideline for the Assessment and Management of Polycystic Ovary Syndrome. The Journal of Clinical Endocrinology & Metabolism, 2023 ; 108(10) : 2447-2469. doi : 10.1210/clinem/dgad463",
    url:"https://academic.oup.com/jcem/article/108/10/2447/7242360", type:"Recommandations internationales",
    niveau:"Le plus solide disponible : 77 recommandations fondées sur les preuves, 54 de consensus et 123 points pratiques, gradués selon GRADE.",
    limites:"Ce sont des recommandations générales, pas un avis pour une personne. Certaines reposent sur un consensus faute de preuves suffisantes.",
    statut:"consultee", le:"2026-11-28", note:"Consultée en partie : le début de l'article en texte intégral, la suite par un résumé. Les points repris ici sont à relire sur le texte complet avant la version finale." },
  yale2026: { ref:"MacMillan C. PCOS is renamed PMOS. Yale Medicine, 23 juin 2026.", url:"https://www.yalemedicine.org/news/pcos-is-renamed-pmos", type:"Article de vulgarisation",
    niveau:"Résume le consensus du Lancet, sans le remplacer.", limites:"Source secondaire. Précise que le nouveau nom ne change pas tout de suite les critères de diagnostic ni les traitements.",
    statut:"consultee", le:"2026-11-28", note:"Lue en entier." },
  lancet2026: { ref:"Consensus international : Polyendocrine metabolic ovarian syndrome, the new name for polycystic ovary syndrome. The Lancet, mai 2026.", url:"https://www.thelancet.com/journals/lancet/article/PIIS0140-67362600717-8/fulltext", type:"Consensus international",
    niveau:"La source du nouveau nom PMOS.", limites:"Ne fixe pas de traduction française officielle (à notre connaissance).", statut:"a_verifier", note:"Pas encore ouverte (accès refusé) : à lire avant la version finale." },
  diamanti2012: { ref:"Diamanti-Kandarakis E., Dunaif A. Insulin resistance and the polycystic ovary syndrome revisited. Endocrine Reviews, 2012.", url:"", type:"Revue de la littérature",
    niveau:"Revue de référence sur l'insuline et le SMOP.", limites:"Revue narrative, pas une méta-analyse.", statut:"a_verifier", note:"Référence connue, pas encore rouverte." },
  selva2007: { ref:"Selva D.M., Hammond G.L. et al. Monosaccharide-induced lipogenesis regulates the human hepatic sex hormone-binding globulin gene. Journal of Clinical Investigation, 2007.", url:"", type:"Étude expérimentale",
    niveau:"Explique pourquoi la SHBG baisse quand l'insuline et la graisse du foie augmentent.", limites:"Étude de mécanisme, pas d'essai chez des femmes SMOP.", statut:"a_verifier", note:"Référence connue, pas encore rouverte." },
  escobar2011: { ref:"Escobar-Morreale H.F. et al. Circulating inflammatory markers in polycystic ovary syndrome : a systematic review and meta-analysis. Fertility and Sterility, 2011.", url:"", type:"Méta-analyse",
    niveau:"Montre des marqueurs inflammatoires (dont la CRP) un peu plus élevés en moyenne.", limites:"Liés en partie au poids et à l'insuline ; ne dit rien du rôle exact pour chaque femme.", statut:"a_verifier", note:"Référence connue, pas encore rouverte." },
  romitti2018: { ref:"Romitti M. et al. Association between PCOS and autoimmune thyroid disease : a systematic review and meta-analysis, 2018.", url:"", type:"Méta-analyse",
    niveau:"Association entre SMOP et thyroïdite auto-immune.", limites:"Revue à confirmer (titre et journal).", statut:"a_verifier", note:"À retrouver et à rouvrir." },
  spiegel1999: { ref:"Spiegel K., Leproult R., Van Cauter E. Impact of sleep debt on metabolic and endocrine function. The Lancet, 1999.", url:"", type:"Étude expérimentale",
    niveau:"Le manque de sommeil perturbe le métabolisme du sucre.", limites:"Petit nombre de participants, hommes jeunes : pas spécifique au SMOP.", statut:"a_verifier", note:"Référence connue, pas encore rouverte." },
  shukla2015: { ref:"Shukla A.P. et al. Food order has a significant impact on postprandial glucose and insulin levels. Diabetes Care, 2015.", url:"", type:"Petite étude",
    niveau:"L'ordre des aliments a changé la glycémie après le repas.", limites:"Très petite étude, chez des personnes diabétiques : pas encore démontré dans le SMOP.", statut:"a_verifier", note:"Référence connue, pas encore rouverte." },
  pasquali: { ref:"Pasquali R. et al. Travaux sur l'axe hypothalamo-hypophyso-surrénalien dans le SMOP.", url:"", type:"Études",
    niveau:"Rôle des surrénales et du cortisol chez certaines femmes.", limites:"Référence précise à retrouver.", statut:"a_verifier", note:"Référence à retrouver." },
  dermato: { ref:"Revue de dermatologie sur le rôle de la DHT dans l'acné et la chute de cheveux.", url:"", type:"À trouver",
    niveau:"—", limites:"—", statut:"a_trouver", note:"Aucune source choisie pour l'instant : la phrase reste prudente en attendant." },
};
// les sources et les étiquettes de preuve sont prêtes mais masquées pour l'instant : passer à true pour les afficher
const AFFICHER_SOURCES = false;
const STATUTS = { consultee:["consultée","#4A7A52","#EAF3EA"], a_verifier:["à vérifier","#9A5B2E","#FBEEDD"], a_trouver:["à trouver","#9A5B2E","#FBEEDD"] };
const ETIQ = { etabli:["Bien établi","recommandation internationale ou relation solidement documentée"], observe:["Observé chez certaines","constaté chez une partie des femmes, pas chez toutes"], recherche:["En recherche","données encore limitées ou contradictoires"] };

export const CATEGORIES = [
  ["comprendre","Mon corps, mes hormones","book","ce qui se passe dans ton corps, sans jargon","#C17855"],
  ["cycle","Mon cycle","moon","tes règles, ton ovulation, ce qui est normal ou pas","#A0607A"],
  ["symptomes","Ce que je ressens","pulse","fatigue, peau, poils, cheveux : pourquoi, et quoi faire","#B07C55"],
  ["nourrir","Nourrir mon corps","leaf","manger pour ton SMOP, sans régime ni culpabilité","#6E8A55"],
  ["bouger","Bouger et récupérer","steps","le mouvement, le sommeil, la récupération","#8E80A3"],
  ["medical","Mon parcours médical","doctor","diagnostic, traitements, thyroïde, fertilité","#5B7FA6"],
  ["soin","Prendre soin de moi","heart","le poids, la culpabilité, le moral","#C0707A"],
];
// une icône par fiche, toutes du même jeu (même trait, mêmes proportions), dans la couleur de son thème
const FICHE_IC = { cestquoi:"book", hormones:"chart", insuline:"bolt", androgenes:"flask", shbg:"drop", stress:"brain", inflammation:"flame", cercle:"gear",
  cycle:"moon", suivre:"calendar", fatigue:"coffee", peau:"sparkle", manger:"leaf", intestin:"health", bouger:"steps", sommeil:"bed",
  thyroide:"pulse", pilule:"doctor", fertilite:"heart", poids:"heart", moral:"smile" };

// ── les fiches ──
// passe : paragraphes ; ressenti : « ce que certaines Cysters ressentent » ; actions : [cible, libellé] (cible « fiche:ID » ou un lien de l'espace)
export const FICHES = [
  { id:"cestquoi", cat:"comprendre", em:"🧭", titre:"C'est quoi le SMOP", court:"tout reprendre depuis le début, diagnostic compris", etiq:"etabli",
    parle:"on t'a dit « vous avez des ovaires polykystiques » en deux minutes, et tu es repartie avec plus de questions qu'avant. on reprend depuis le début.",
    passe:["le SMOP (anciennement SOPK, PMOS dans le nouveau nom international) est un trouble hormonal et métabolique fréquent : il concerne environ 10 à 13 % des femmes. il ne se résume pas aux ovaires : il peut toucher le cycle, la peau, le métabolisme et le moral.",
      "les « kystes » n'en sont pas : ce sont de petits follicules qui ont commencé à mûrir sans aller au bout. c'est une des raisons du changement de nom.",
      "chez l'adulte, le diagnostic repose sur au moins 2 de ces 3 éléments : des cycles irréguliers ou une ovulation perturbée, un excès d'androgènes (visible sur la peau et les poils, ou dans une prise de sang), et un aspect particulier des ovaires à l'échographie, ou une AMH élevée à la place.",
      "et seulement après avoir écarté d'autres causes qui donnent des signes proches : un problème de thyroïde, une prolactine trop haute, ou un trouble des surrénales. c'est pour ça qu'une prise de sang fait partie du diagnostic.",
      "chez les adolescentes, c'est différent : dans les premières années après les premières règles, des cycles irréguliers sont souvent normaux, et l'échographie n'est pas recommandée pour poser le diagnostic.",
      "si ton diagnostic a mis des années à arriver, tu n'es pas seule : c'est le cas de beaucoup de femmes, souvent après plusieurs médecins. ce n'était pas « dans ta tête ».",
      "deux Cysters peuvent avoir des SMOP très différents, avec ou sans surpoids. c'est normal que ton vécu ne ressemble pas à celui de ta copine.",
      "le SMOP ne se guérit pas, mais ses symptômes s'accompagnent, et beaucoup de choses peuvent les apaiser."],
    faire:["noter tes cycles et tes symptômes : c'est ce qui aidera le plus ton médecin, et ce qui te permettra de voir ce qui change.",
      "si tu as un doute sur ton diagnostic, tu as le droit de demander sur quoi il repose, et un deuxième avis."],
    actions:[["tab:carte","ouvrir ma carte"],["tab:cycle","noter mon cycle"]],
    medecin:"si tu as des symptômes mais pas de diagnostic, ou si on t'a diagnostiquée sur une seule échographie, sans bilan sanguin.",
    question:"Sur quels éléments mon diagnostic de SMOP a-t-il été posé, et a-t-on écarté les autres causes ?", sources:["jcem2023","yale2026","lancet2026"] },
  { id:"hormones", cat:"comprendre", em:"🔎", titre:"Les hormones en 1 coup d'œil", court:"le résumé avant le détail", etiq:"observe",
    parle:"insuline, androgènes, cortisol, SHBG : tu entends ces mots partout. voilà ce qu'ils font, en une minute.",
    passe:["chez beaucoup de Cysters, quatre acteurs se répondent. chacun a sa fiche détaillée."],
    liste:[["Insuline","souvent trop haute","peut pousser les ovaires à fabriquer plus d'androgènes, et participer aux fringales","ce qui aide : l'assiette, bouger après les repas, le sommeil","insuline"],
      ["Androgènes","en excès","agissent sur la peau, les poils et les cheveux","ce qui aide ton insuline, et un dermatologue ou ton médecin si besoin","androgenes"],
      ["Cortisol","emballé par le stress","peut aggraver la résistance à l'insuline","ce qui aide : le sommeil, la respiration, un vrai temps calme","stress"],
      ["SHBG","souvent trop basse","quand elle baisse, plus de testostérone circule librement","ce qui aide ton insuline : l'assiette, le mouvement, le sommeil","shbg"]],
    faire:["ouvre la fiche de l'hormone qui te parle le plus."], actions:[["fiche:insuline","l'insuline"],["fiche:androgenes","les androgènes"]],
    medecin:"si tu veux savoir où en sont tes propres hormones : ton médecin décide quelles analyses sont utiles pour toi.",
    question:"Quelles analyses hormonales sont utiles dans mon cas ?", sources:["jcem2023"] },
  { id:"insuline", cat:"comprendre", em:"⚡", titre:"La résistance à l'insuline", court:"un des leviers les plus importants", etiq:"etabli", etiqNote:"Bien établi pour le lien insuline–androgènes ; observé chez certaines pour les fringales et le ventre.",
    parle:"des fringales l'après-midi, un coup de barre après les repas, l'impression que ton corps stocke malgré tes efforts ?",
    passe:["ton corps fabrique de l'insuline pour faire entrer le sucre dans tes cellules. quand elles répondent moins bien, ton pancréas en produit plus pour compenser : c'est la résistance à l'insuline.",
      "elle touche la grande majorité des femmes avec un SMOP, y compris beaucoup de femmes minces. le poids peut l'accentuer, mais il n'en est pas la cause unique.",
      "cette insuline en excès pousse les ovaires à fabriquer plus d'androgènes, et fait baisser la SHBG : c'est un des moteurs de l'acné, des poils et des cycles perturbés. elle peut aussi participer aux fringales, et elle est souvent associée à une prise de poids au niveau du ventre.",
      "sur le long terme, elle augmente le risque de diabète de type 2. ce n'est pas une fatalité : c'est justement pour ça qu'on recommande de vérifier ta glycémie, pour agir tôt si besoin.",
      "aucune prise de sang simple ne mesure bien la résistance à l'insuline au quotidien : les dosages d'insuline sont jugés peu utiles en routine. on regarde plutôt ta glycémie."],
    ressenti:"fringales de 15h, coup de barre après les repas, prise de poids au niveau du ventre malgré les efforts, parfois une peau plus foncée au cou ou aux aisselles.",
    faire:["c'est un des leviers les plus importants, et il répond à tes habitudes : une assiette avec des fibres et des protéines, quelques minutes de marche après les repas, un sommeil suffisant, un stress apaisé. chaque geste compte, même sans perte de poids.",
      "il existe aussi un médicament, la metformine, que ton médecin peut te proposer selon ta situation.",
      "les compléments comme l'inositol sont encore à l'étude : parles-en avant d'en prendre, surtout si tu as un traitement."],
    actions:[["outil:alimentation/assiette","l'assiette SMOP"],["bouger:marche","marcher après un repas"],["sos:fringale","fiche SOS fringale"]],
    medecin:"les recommandations conseillent de vérifier ta glycémie au moment du diagnostic, puis tous les 1 à 3 ans selon ta situation.",
    question:"Est-ce qu'on peut vérifier ma glycémie (à jeun, HbA1c ou hyperglycémie provoquée) ?", sources:["jcem2023","diamanti2012"] },
  { id:"androgenes", cat:"comprendre", em:"🌙", titre:"Les androgènes", court:"testostérone, DHT et signes visibles", etiq:"etabli",
    parle:"une acné sur le bas du visage, des poils plus drus, des cheveux qui s'affinent ?",
    passe:["les androgènes (dont la testostérone) sont normaux en petite quantité. en excès, ils agissent sur la peau et les poils.",
      "une enzyme, la 5-alpha-réductase, convertit la testostérone en DHT, une forme plus active qui joue sur l'acné et la chute de cheveux.",
      "la chute de cheveux peut aussi avoir d'autres causes (fer, thyroïde, stress, accouchement)."],
    ressenti:"acné sur le bas du visage, pilosité, cheveux qui s'affinent ou tombent.",
    faire:["ce qui aide ton insuline aide aussi. et des traitements existent : un dermatologue ou ton médecin peuvent t'en parler."],
    actions:[["fiche:peau","peau, poils et cheveux"],["sos:acne","fiche SOS acné"]],
    medecin:"si une acné dure, ou si la pilosité ou la chute de cheveux te pèsent.",
    question:"Quelles options existent pour mon acné, ma pilosité ou mes cheveux ?", sources:["jcem2023","dermato"] },
  { id:"shbg", cat:"comprendre", em:"🌿", titre:"La SHBG et le rôle du foie", court:"la protéine qui transporte tes hormones", etiq:"etabli", etiqNote:"Bien établi pour le rôle du foie ; observé chez certaines pour la SHBG basse.",
    parle:"tu as vu « SHBG » sur une prise de sang sans savoir ce que c'est ?",
    passe:["ton foie fabrique la SHBG, une protéine qui transporte tes hormones. quand il y en a moins, plus de testostérone circule librement.",
      "ce qui la fait baisser, c'est surtout l'insuline en excès."],
    ressenti:"rien que tu puisses sentir : la SHBG se mesure par une prise de sang, si ton médecin la juge utile.",
    faire:["les leviers sont donc les mêmes que pour l'insuline : ton assiette, le mouvement, le sommeil."], actions:[["fiche:insuline","la fiche insuline"],["outil:alimentation/assiette","l'assiette SMOP"]],
    medecin:"si elle figure sur ton bilan et que tu veux comprendre ton chiffre.",
    question:"Que veut dire mon taux de SHBG ?", sources:["selva2007","jcem2023"] },
  { id:"stress", cat:"comprendre", em:"🌾", titre:"Stress, cortisol et surrénales", court:"le stress et tes hormones", etiq:"observe",
    parle:"tes symptômes empirent quand ta vie s'accélère ?",
    passe:["le stress chronique maintient le cortisol élevé, ce qui peut aggraver la résistance à l'insuline.",
      "chez certaines Cysters, les surrénales participent aussi à l'excès d'androgènes (DHEA).",
      "beaucoup de Cysters voient leurs symptômes empirer dans les périodes difficiles."],
    ressenti:"symptômes qui empirent dans les périodes difficiles, sommeil plus léger, épuisement nerveux.",
    faire:["c'est aussi un vrai levier : le sommeil, la respiration et la récupération."], actions:[["bouger:apaiser","respirer et relâcher"],["sos:stress","fiche SOS stress"]],
    medecin:"les recommandations demandent de rechercher l'anxiété et la déprime chez toutes les femmes avec un SMOP. parles-en, même si ça te semble « normal ».",
    question:"Est-ce qu'on peut parler de mon moral et de mon anxiété ?", sources:["jcem2023","pasquali"] },
  { id:"inflammation", cat:"comprendre", em:"🔥", titre:"L'inflammation de bas grade", court:"une piste encore étudiée", etiq:"observe", etiqNote:"Observé chez certaines ; en recherche pour son effet sur l'ovulation.",
    parle:"tu as lu que « tout vient de l'inflammation » ? on fait le point.",
    passe:["chez certaines Cysters, on retrouve une inflammation légère mais continue.","elle est liée à l'insuline et au mode de vie, et on cherche encore à comprendre son rôle exact."],
    ressenti:"rien de spécifique : une fatigue qui dure doit d'abord faire vérifier le fer, la thyroïde et le sommeil.",
    faire:["ce qui l'apaise, c'est ce qui aide aussi le reste : bouger, bien dormir, une assiette variée."], actions:[["bouger:mobilite","une séance douce"],["fiche:fatigue","la fatigue qui ne passe pas"]],
    medecin:"si tu es fatiguée depuis longtemps : un bilan (fer, thyroïde, sommeil) passe avant toute autre explication.",
    question:"Ma fatigue mérite-t-elle un bilan (fer, thyroïde, sommeil) ?", sources:["escobar2011"] },
  { id:"cercle", cat:"comprendre", em:"♻️", titre:"Le cercle vicieux hormonal", court:"et comment le desserrer", etiq:"observe",
    parle:"l'impression de tourner en rond, malgré tous tes efforts ?",
    passe:["chez beaucoup de Cysters (pas chez toutes), le SMOP fonctionne en boucle, et chaque pièce entretient la suivante.",
      "ta glycémie fait des montagnes russes → ton corps produit beaucoup d'insuline → cette insuline pousse les ovaires à fabriquer plus d'androgènes → ces androgènes perturbent l'ovulation. de son côté, une glycémie instable peut entretenir les fringales, qui te ramènent au sucre. le stress se greffe dessus : le cortisol peut aggraver la résistance à l'insuline."],
    faire:["une boucle se desserre par n'importe quel maillon : tu n'as pas à tout faire en même temps. stabiliser ta glycémie, bouger un peu après les repas, soigner ton sommeil, apaiser ton stress : chaque geste compte.",
      "c'est pour ça qu'ici on avance un geste à la fois, dans la durée."],
    actions:[["outil:alimentation/assiette","l'assiette SMOP"],["bouger:marche","marcher après un repas"]],
    medecin:"si tu as l'impression que rien ne bouge depuis des mois : il existe aussi des traitements, à côté de l'hygiène de vie.",
    question:"Quelles options médicales existent en plus de l'hygiène de vie ?", sources:["diamanti2012"] },
  { id:"cycle", cat:"cycle", em:"🌙", titre:"Ton cycle, pour de vrai", court:"un cycle classique et un cycle SMOP, côte à côte", etiq:"etabli",
    parle:"on t'a sûrement dit « tes cycles sont irréguliers » sans jamais t'expliquer pourquoi. voilà la différence, côte à côte.",
    tableau:[["Un cycle « classique »","#A9BC8E",[["Durée","21 à 35 jours, assez régulier"],["Ovulation","une douzaine de jours avant les règles, pas forcément pile au milieu"],["Déroulé","l'ovule mûrit, est libéré, puis les règles arrivent"],["Règles","reviennent à un rythme prévisible"]]],
      ["Un cycle avec SMOP","#A89AB8",[["Durée","souvent long (> 35 j), irrégulier ou absent"],["Ovulation","retardée, aléatoire, ou absente certains mois"],["Déroulé","certains mois, les follicules commencent à mûrir sans aller jusqu'à l'ovulation"],["Règles","espacées, imprévisibles : ce n'est pas « dans ta tête »"]]]],
    passe:["chez l'adulte, un cycle est dit irrégulier s'il dure moins de 21 jours ou plus de 35, ou s'il y a moins de 8 cycles par an.",
      "un cycle irrégulier n'est pas un corps « cassé » : c'est un corps dont l'ovulation est gênée par le déséquilibre hormonal. bon à savoir : avoir des règles ne veut pas forcément dire avoir ovulé."],
    faire:["les habitudes de vie peuvent aider l'ovulation chez certaines femmes, et il existe aussi des solutions médicales à voir avec ton médecin. noter tes règles, même en désordre, t'aide à voir ce qui change."],
    actions:[["tab:cycle","noter mon cycle"],["sos:regles","fiche SOS règles absentes"],["fiche:suivre","pourquoi suivre ton cycle"]],
    medecin:"si tes règles ne viennent plus depuis plus de 3 mois, ou si tes cycles changent beaucoup.",
    question:"Mes règles ne viennent plus depuis plus de 3 mois : que faut-il vérifier ?", sources:["jcem2023"] },
  { id:"suivre", cat:"cycle", em:"🗓️", titre:"Pourquoi suivre ton cycle", court:"même irrégulier", etiq:"etabli",
    parle:"à quoi bon noter des règles qui arrivent n'importe quand ?",
    passe:["avec un SMOP, l'ovulation peut se décaler ou ne pas avoir lieu certains mois. c'est fréquent, et ce n'est pas un échec de ton corps.",
      "noter tes règles, même en désordre, révèle des schémas : la longueur de tes cycles, les moments où ton corps « répond » mieux.",
      "si tu prends une contraception hormonale, tes saignements ne reflètent pas ton cycle naturel."],
    faire:["noter tes règles et tes signes, quelques secondes par jour."], actions:[["tab:cycle","noter mon cycle"]],
    medecin:"apporte ton historique de cycles à ton rendez-vous : des cycles notés valent bien mieux qu'un « je ne sais plus trop ».",
    question:"Voici mes cycles notés : qu'en pensez-vous ?", sources:["jcem2023"] },
  { id:"fatigue", cat:"symptomes", em:"🔋", titre:"La fatigue qui ne passe pas", court:"même en dormant", etiq:"observe",
    parle:"tu te réveilles déjà épuisée après une nuit complète, le corps en plomb dès le matin ?",
    passe:["c'est une plainte très fréquente, et ce n'est pas de la paresse. cette fatigue est réelle, même si le SMOP n'en est pas toujours la seule cause.",
      "plusieurs choses peuvent tirer dessus en même temps, et c'est souvent leur addition qui épuise :"],
    liste2:[["ce qui peut peser","#B07C55",[["Ta glycémie","des montagnes russes de sucre donnent des coups de barre, surtout après les repas."],
      ["Ton sommeil","un sommeil léger ou haché, et parfois une apnée du sommeil, plus fréquente avec un SMOP."],
      ["Des carences","fer, vitamine D, et vitamine B12 si tu prends de la metformine."],
      ["Ta thyroïde","une thyroïde au ralenti fatigue, et passe facilement inaperçue."],
      ["Ton moral","l'anxiété et la déprime fatiguent autant que le manque de sommeil."]]]],
    ressenti:"le corps lourd dès le matin, le besoin de sieste, l'impression de tirer sur la corde toute la journée.",
    faire:["par petits bouts : des repas avec des protéines pour éviter les coups de barre, de la lumière du jour le matin, un vrai sas calme le soir, bouger un peu en journée, même 10 minutes.",
      "les jours sans énergie, baisse la barre : dis-le à ton espace en début de journée, il allège ce qu'il te propose.",
      "et arrête de te culpabiliser : ton épuisement est un signal, pas un défaut."],
    actions:[["sos:fatigue","fiche SOS fatigue"],["tab:sommeil","mon sommeil"],["fiche:moral","le moral et le SMOP"]],
    medecin:"pour vérifier ton fer, ta vitamine D, ta thyroïde et ta glycémie. et si tu ronfles ou te réveilles épuisée : les recommandations demandent de rechercher les signes d'apnée du sommeil.",
    question:"Peut-on vérifier mon fer, ma vitamine D, ma thyroïde, ma glycémie et mon sommeil ?", sources:["jcem2023"] },
  { id:"peau", cat:"symptomes", em:"✨", titre:"Peau, poils et cheveux", court:"pourquoi, et quoi faire", etiq:"etabli",
    parle:"une acné sur la mâchoire qui ne part pas, des poils plus drus sur le menton, des cheveux qui s'affinent ? et l'impression que personne ne prend ça au sérieux ?",
    passe:["ces signes viennent le plus souvent d'un excès d'androgènes, les hormones dites « masculines » que toutes les femmes fabriquent en petite quantité. ce n'est ni un manque d'hygiène, ni un manque de volonté.",
      "chez beaucoup de Cysters, l'insuline en excès pousse les ovaires à en fabriquer davantage, et la SHBG, la protéine qui les transporte, baisse : plus d'androgènes circulent librement jusqu'à ta peau et à tes poils.",
      "ta peau ne réagit pas forcément comme celle d'une autre : à taux égal, certaines ont beaucoup de signes, d'autres presque pas. tu peux donc avoir des signes bien visibles avec une prise de sang « normale »."],
    liste2:[["les signes, un par un","#B07C55",[["Acné","plutôt sur le bas du visage, la mâchoire, le cou ou le dos. elle dure après l'adolescence, ou s'aggrave avant les règles."],
      ["Poils","plus épais et plus foncés là où les hommes en ont : menton, lèvre, cou, poitrine, ligne du ventre, dos."],
      ["Cheveux","ils s'affinent surtout sur le dessus de la tête et la raie s'élargit, sans plaque chauve. les androgènes font rétrécir les racines petit à petit."],
      ["Taches plus foncées","une peau plus sombre et veloutée au cou, aux aisselles ou à l'aine. ce signe-là vient plutôt de l'insuline que des androgènes, et vaut la peine d'en parler."]]]],
    ressenti:"le regard dans le miroir, le temps passé à cacher, épiler, camoufler. ça pèse sur le moral, et c'est légitime d'en parler.",
    faire:["pour l'acné et les poils, la pilule est souvent proposée en premier, mais ce n'est pas la seule option : soins de la peau, épilation laser ou électrique, autres traitements. un dermatologue ou ton médecin peuvent t'aider à choisir.",
      "pour les cheveux, avant de tout mettre sur le compte du SMOP, fais vérifier ton fer et ta thyroïde. et pense aux chutes après un gros stress ou un accouchement : elles arrivent souvent 2 à 3 mois plus tard.",
      "ce qui aide ton insuline (l'assiette, le mouvement, le sommeil) aide aussi, sur la durée.",
      "sois patiente avec toi : compte plusieurs semaines pour l'acné, et au moins 6 mois pour juger d'un changement sur les poils ou les cheveux, parce qu'ils poussent lentement."],
    actions:[["sos:acne","fiche SOS acné"],["sos:cheveux","fiche SOS cheveux"],["fiche:androgenes","les androgènes"]],
    medecin:"si l'acné dure ou laisse des marques, si la pilosité ou la chute de cheveux te pèsent, ou si tu vois ces taches plus foncées.",
    question:"Quelles options existent pour ma peau, mes poils ou mes cheveux ?", sources:["jcem2023"] },
  { id:"manger", cat:"nourrir", em:"🥗", titre:"Il n'y a pas un régime SMOP", court:"bien manger, sans règles aveugles", etiq:"etabli",
    parle:"tu as lu tout et son contraire sur ce qu'il faut manger avec un SMOP ?",
    passe:["il n'existe pas un régime SMOP meilleur que tous les autres. ce qui compte, c'est une alimentation que tu peux tenir, qui te nourrit et qui te va."],
    liste2:[["À privilégier","#7FA86F",[["Légumes verts & crucifères","brocoli, chou, épinards : riches en fibres, ils aident à lisser la glycémie."],["Protéines de qualité","œufs, poisson, volaille, légumineuses : elles aident à tenir jusqu'au repas suivant."],["Bons gras","avocat, huile d'olive, oléagineux, poissons gras : ils ralentissent l'absorption du sucre."],["Féculents à index bas","quinoa, légumineuses, patate douce, pain au levain : de l'énergie plus régulière."]]],
      ["À limiter","#D4A56A",[["Sucres rapides","sodas, jus, pâtisseries, bonbons : à limiter, surtout seuls et en dehors des repas, car ils font monter vite la glycémie."],["Produits ultra-transformés","plats industriels, snacks : souvent riches en sucres et en graisses cachés."],["Féculents raffinés","pain blanc, riz blanc, pâtes blanches : préfère les versions complètes."]]]],
    faire:["l'esprit, pas les règles : il n'y a pas d'aliment « interdit ». tu apprends à doser, pas à te priver.",
      "l'ordre des aliments (légumes, puis protéines, puis féculents) a montré un effet sur la glycémie dans de petites études, surtout chez des personnes diabétiques : une piste, pas une règle."],
    actions:[["outil:alimentation/assiette","l'assiette SMOP"],["outil:alimentation/planif","planifier ma semaine"]],
    medecin:"si manger devient une source d'angoisse, de restriction ou de craquages : c'est fréquent, et ça se dit.",
    question:"Pouvez-vous m'orienter vers un ou une diététicienne ?", sources:["jcem2023","shukla2015"] },
  { id:"intestin", cat:"nourrir", em:"🌱", titre:"L'intestin et ton SMOP", court:"une piste de recherche", etiq:"recherche",
    parle:"un ventre qui gonfle, des digestions difficiles ?",
    passe:["le lien entre ton intestin et le SMOP est une piste de recherche : on ne sait pas encore exactement ce qu'il change.",
      "un ventre qui gonfle, des digestions difficiles ne sont pas « dans ta tête »."],
    faire:["des fibres variées (légumes, légumineuses), des aliments fermentés si tu les tolères, et le moins d'ultra-transformé possible font du bien à ta digestion, quoi qu'il en soit."],
    actions:[["sos:ventre","fiche SOS ventre gonflé"],["outil:alimentation/aliments","chercher un aliment"]],
    medecin:"si ton ventre te gêne souvent (douleurs, transit) : d'autres causes existent et méritent d'être regardées.",
    question:"Mes troubles digestifs méritent-ils un bilan ?", sources:[] },
  { id:"bouger", cat:"bouger", em:"🚶‍♀️", titre:"Bouger avec un SMOP", court:"ce qui compte vraiment, sans te forcer", etiq:"etabli",
    parle:"on t'a dit « faites du sport » sans plus de détail ? ou tu n'as ni le temps ni l'énergie ?",
    passe:["bouger aide ton corps à mieux utiliser l'insuline, et ça joue aussi sur le moral et le sommeil. c'est utile même quand la balance ne bouge pas.",
      "les recommandations internationales conseillent, chez l'adulte, au moins 150 minutes d'activité modérée par semaine (ou 75 minutes plus intense), du renforcement musculaire 2 jours par semaine, et moins de temps assis.",
      "aucun sport n'est meilleur qu'un autre pour le SMOP : le meilleur, c'est celui que tu peux tenir."],
    faire:["commence petit : 10 minutes de marche après un repas, ça compte déjà. les jours sans énergie, une séance douce vaut mieux que de forcer, et le repos fait partie du programme."],
    actions:[["bouger:marche","marcher après un repas"],["bouger:mobilite","une séance douce"],["tab:bouger","toutes mes séances"]],
    medecin:"si tu as des douleurs, un essoufflement inhabituel, ou si tu reprends après une longue pause.",
    question:"Y a-t-il des précautions à prendre avant que je reprenne une activité ?", sources:["jcem2023"] },
  { id:"sommeil", cat:"bouger", em:"🌙", titre:"Ma routine de sommeil", court:"le levier que personne ne te prescrit", etiq:"etabli",
    parle:"tu dors tes heures, mais tu te réveilles fatiguée, avec des fringales le lendemain ?",
    passe:["quand tu dors mal, ta glycémie du lendemain est plus instable et les hormones de la faim se dérèglent. ce n'est pas « dans ta tête »."],
    vecu:["ce qui m'aide, et que je te partage comme mon expérience, pas comme une ordonnance : de la lumière du jour le matin, tôt, pour caler mon horloge interne. un dîner qui ne fait pas flamber ma glycémie, pas trop tard. couper les écrans au moins 30 minutes avant le lit : c'est le geste le plus dur et le plus payant. et des horaires réguliers, même le week-end.",
      "un vrai sas le soir, même court : lumière tamisée, une tisane, quelques respirations lentes. on n'apaise pas son SMOP en se forçant à dormir : on crée les conditions, et le sommeil vient."],
    faire:["choisis un seul geste du soir et teste-le une semaine."], actions:[["tab:sommeil","mon sommeil"],["sos:reveil3h","fiche SOS réveil à 3h"]],
    medecin:"si tu ronfles ou te réveilles épuisée : les recommandations demandent de rechercher les signes d'apnée du sommeil.",
    question:"Est-ce que je devrais faire vérifier mon sommeil (apnée) ?", sources:["spiegel1999","jcem2023"] },
  { id:"thyroide", cat:"medical", em:"🦋", titre:"La thyroïde et le SMOP", court:"le duo qu'on oublie", etiq:"observe",
    parle:"fatiguée, frileuse, des cycles perturbés, le moral en berne… et si ce n'était pas que le SMOP ?",
    passe:["l'hypothyroïdie, souvent la thyroïdite de Hashimoto, accompagne fréquemment le SMOP.",
      "le piège : leurs symptômes se ressemblent (fatigue, prise de poids, cycles perturbés, frilosité, moral en berne). une thyroïde au ralenti peut donc passer inaperçue."],
    faire:["traiter une thyroïde qui tourne au ralenti peut soulager des symptômes que tu mettais sur le compte du SMOP. ce n'est pas à toi de poser le diagnostic, mais c'est à toi de poser la question."],
    actions:[["tab:analyses","mes analyses"]],
    medecin:"pour demander un dosage de la TSH, et si besoin de la T4 libre et des anticorps anti-TPO.",
    question:"Pouvez-vous doser ma TSH (et si besoin la T4 libre et les anticorps anti-TPO) ?", sources:["romitti2018"] },
  { id:"pilule", cat:"medical", em:"💊", titre:"La pilule et le SMOP", court:"ce qu'elle fait, et ce qu'elle ne fait pas", etiq:"etabli",
    parle:"on t'a proposé la pilule « et c'est tout », comme réponse à tout ? ou tu hésites à l'arrêter ?",
    passe:["la pilule apporte des hormones de synthèse qui mettent ton cycle naturel au repos. les saignements que tu as sous pilule ne sont pas de vraies règles : ce sont des saignements provoqués par la pause.",
      "elle peut améliorer l'acné et la pilosité tant que tu la prends. les recommandations internationales la proposent chez l'adulte pour les cycles irréguliers et la pilosité : c'est un outil reconnu, pas la seule réponse.",
      "ce qu'elle ne fait pas : elle n'agit pas sur la résistance à l'insuline, ni sur ce qui dérègle ton cycle. elle met les symptômes en sourdine, et ils reviennent souvent à l'arrêt.",
      "elle ne convient pas à toutes : il y a des contre-indications (par exemple fumer après 35 ans, des migraines avec aura, un risque de caillots), et certaines la supportent mal (moral, libido)."],
    ressenti:"l'impression qu'on t'a donné la pilule comme seule réponse, sans t'expliquer ton SMOP. et parfois, des symptômes qui reviennent plus forts à l'arrêt.",
    vecu:["ce que j'en pense : la pilule, on la donne un peu à tout le monde, comme une réponse unique. pour moi, c'est un pansement sur une plaie béante. elle masque les symptômes sans toucher à ce qui se passe dessous, et parfois, à l'arrêt, ça revient en pire.",
      "je ne te dis pas de la refuser ni de l'arrêter. je te dis de comprendre ce qu'elle fait, et de demander quelles autres options existent pour toi."],
    faire:["tu as le droit de demander pourquoi on te la propose, ce qu'elle va changer pour toi, et quelles autres options existent. et ce qui aide ton terrain (l'assiette, le mouvement, le sommeil, le stress) reste utile, avec ou sans pilule.",
      "si tu veux l'arrêter, parles-en d'abord à ton médecin : pour ta contraception, et pour suivre tes cycles ensuite (quand les règles restent absentes longtemps, l'utérus a besoin d'être protégé)."],
    actions:[["fiche:insuline","ce qui agit sur ton terrain"],["fiche:cycle","ton cycle, pour de vrai"]],
    medecin:"avant de la commencer, pour savoir si elle te convient, et avant de l'arrêter.",
    question:"Pourquoi me proposez-vous la pilule, et quelles autres options existent pour moi ?", sources:["jcem2023"] },
  { id:"fertilite", cat:"medical", em:"🤍", titre:"SMOP et fertilité", court:"ce qu'on oublie de te dire", etiq:"etabli",
    parle:"« ce sera compliqué », « il faudra passer par la PMA » : on te l'a dit trop vite ?",
    passe:["c'est souvent la première peur après le diagnostic, et la phrase la plus mal dite en consultation. alors on remet les choses à leur place.",
      "beaucoup de femmes avec un SMOP ont des enfants, et souvent naturellement. des études qui ont suivi des femmes pendant des années montrent qu'au final, elles ont en moyenne à peu près autant d'enfants que les autres. ça peut simplement prendre plus de temps.",
      "ce qui complique les choses, c'est l'ovulation : quand elle est irrégulière ou absente certains mois, il y a moins d'occasions de concevoir, et c'est plus dur de savoir quand elles arrivent. ce n'est pas la même chose qu'être stérile.",
      "et quand l'ovulation ne vient pas seule, il existe des traitements pour la déclencher, en comprimés pour commencer, qui marchent chez beaucoup de femmes avec un SMOP. la PMA n'est pas un passage obligé : les recommandations la placent après ces premières étapes."],
    ressenti:"la peur d'entendre « ce sera compliqué », la pression à chaque cycle, l'impression d'être en retard sur les autres.",
    vecu:["à moi aussi, on l'a dit dès le début : ce serait très compliqué. ma gynécologue m'a parlé de PMA avant même que j'essaie. j'ai eu deux enfants, naturellement, sans PMA.",
      "je ne te le raconte pas comme une promesse : chaque histoire est différente. je te le raconte parce qu'une phrase dite trop vite en consultation n'est pas une sentence."],
    faire:["noter tes règles et tes signes t'aide à repérer tes ovulations, et donne des informations précieuses à ton médecin.",
      "prendre soin de ton terrain (l'assiette, le mouvement, le sommeil, le stress) peut aider l'ovulation chez certaines femmes.",
      "avant d'essayer, les recommandations conseillent de faire le point avec ton médecin, notamment sur ta glycémie, et de commencer l'acide folique."],
    actions:[["tab:cycle","noter mon cycle"],["fiche:cycle","ton cycle, pour de vrai"]],
    medecin:"dès qu'un projet bébé est là, surtout si tes cycles sont très irréguliers ou absents : tu n'as pas besoin d'attendre un an d'essais pour demander un bilan.",
    question:"J'ai un projet bébé : quel bilan faire, et quand ?", sources:["jcem2023"] },
  { id:"poids", cat:"soin", em:"🌾", titre:"Le poids et la culpabilité", court:"sortir de la culpabilité", etiq:"observe",
    parle:"« perdez du poids » : le conseil le plus donné, et le moins expliqué ?",
    passe:["avec un SMOP, la résistance à l'insuline peut rendre la perte de poids plus difficile, et favoriser la prise de poids au niveau du ventre. ce n'est pas un manque de volonté.",
      "il existe aussi des SMOP chez des femmes minces : le poids n'est ni la cause unique du SMOP, ni la preuve que tu en as un.",
      "bonne nouvelle : bouger, mieux dormir, manger de façon plus stable améliore ta santé même quand la balance ne bouge pas. chez certaines, une petite baisse de poids aide les cycles, mais ce n'est ni une condition, ni le seul levier.",
      "les régimes très stricts ont tendance à se retourner contre toi : faim, craquages, culpabilité. et les femmes avec un SMOP sont plus exposées aux troubles du comportement alimentaire.",
      "beaucoup vivent une stigmatisation liée au poids, y compris chez les soignants. les recommandations internationales demandent d'ailleurs aux soignants de te demander ton accord avant de te peser, et de t'expliquer pourquoi."],
    ressenti:"la honte en consultation, les régimes enchaînés, l'impression d'être jugée avant d'être écoutée.",
    faire:["l'objectif n'est pas un chiffre : c'est d'apaiser ton terrain (une glycémie stable, un meilleur sommeil, moins de stress).",
      "tu as le droit de refuser d'être pesée, ou de demander à ne pas voir le chiffre.",
      "ton corps n'est pas ton ennemi. il réagit à un déséquilibre."],
    actions:[["fiche:insuline","la résistance à l'insuline"],["fiche:manger","manger sans régime"],["sos:decouragement","fiche SOS découragement"]],
    medecin:"si on ne te parle que de ton poids, ou si manger devient une source d'angoisse : tu as le droit de demander qu'on regarde aussi tes autres symptômes.",
    question:"En dehors du poids, que pouvons-nous faire pour mes symptômes ?", sources:["jcem2023"] },
  { id:"moral", cat:"soin", em:"🤍", titre:"Le moral, l'anxiété et le SMOP", court:"ce n'est pas dans ta tête, et ça se soigne", etiq:"etabli",
    parle:"des jours où tout pèse, une anxiété qui ne te lâche pas, l'impression que ton corps t'échappe ?",
    passe:["l'anxiété et la déprime sont plus fréquentes chez les femmes avec un SMOP. ce n'est pas une faiblesse : c'est tellement reconnu que les recommandations internationales demandent aux soignants d'en parler avec toutes les femmes qui ont un SMOP.",
      "plusieurs choses s'additionnent : les hormones et l'insuline, les symptômes visibles qui touchent l'image de soi, les années d'attente avant un diagnostic, les inquiétudes sur la fertilité, et parfois des remarques blessantes.",
      "le rapport à la nourriture et à son corps peut aussi devenir compliqué : les troubles du comportement alimentaire sont plus fréquents avec un SMOP.",
      "et ça marche dans les deux sens : le stress et le manque de sommeil peuvent renforcer certains symptômes. prendre soin de ton moral fait partie de prendre soin de ton SMOP."],
    ressenti:"l'irritabilité, les larmes faciles, les ruminations le soir, l'envie de tout lâcher, la honte de son corps.",
    faire:["en parler, à quelqu'un de confiance ou à un professionnel. une psychologue ou ton médecin peuvent vraiment t'aider.",
      "garder les petits gestes qui portent : bouger un peu, dormir, respirer, écrire ce que tu ressens dans ton journal, sans te juger.",
      "si ça va vraiment mal, n'attends pas : prends rendez-vous avec une psychologue, ou parles-en à ton médecin, qui peut t'orienter. et le bouton « mode crise » est toujours là pour les moments difficiles."],
    actions:[["tab:journal","mon journal"],["sos:decouragement","fiche SOS découragement"],["bouger:apaiser","respirer et relâcher"]],
    medecin:"si ton moral est bas depuis plus de deux semaines, si l'anxiété t'empêche de vivre, ou si manger devient une source d'angoisse.",
    question:"Est-ce qu'on peut parler de mon moral, et pouvez-vous m'orienter vers un ou une psychologue ?", sources:["jcem2023"] },
];
const parId = (id) => FICHES.find(f=>f.id===id);

// ── portes d'entrée (aucun contenu recopié : seulement des liens vers les fiches) ──
const BESOINS = [["C'est quoi exactement, le SMOP ?","cestquoi"],["Pourquoi mes règles sont irrégulières ?","cycle"],["Pourquoi je suis tout le temps épuisée ?","fatigue"],["Pourquoi j'ai des fringales ?","insuline"],
  ["Acné, poils, cheveux : pourquoi ?","peau"],["Est-ce que je pourrai avoir un enfant ?","fertilite"],["Pourquoi on me parle tout le temps de mon poids ?","poids"],["La pilule, c'est la seule solution ?","pilule"],["Pourquoi j'ai le moral à zéro ?","moral"]];
const COLLECTIONS = [
  { titre:"Les liens que tu n'avais jamais faits", sous:"une question de ta vie, la fiche qui l'explique",
    liens:[["tu ronfles et tu te réveilles épuisée ?","sommeil"],["fatiguée, frileuse, des cycles perturbés ?","thyroide"],["tes symptômes empirent quand tu es stressée ?","stress"],["des fringales l'après-midi, même en mangeant bien ?","insuline"],["des cheveux qui tombent ?","androgenes"]] },
  { titre:"Ce qu'on aurait aimé nous expliquer", sous:"les questions qu'on n'ose pas toujours poser",
    liens:[["un SMOP avec un poids normal, c'est possible ?","insuline"],["mes analyses sont normales, mais je vais mal","fatigue"],["pourquoi mon médecin ne parle que de mon poids ?","poids"],["je suis à fleur de peau, et je ne sais pas pourquoi","moral"]] },
];
const PARCOURS = [["Comprendre l'insuline en 10 minutes",["insuline","cercle","manger","bouger","sommeil"]],["Comprendre pourquoi ton cycle est irrégulier",["cycle","suivre","pilule","fertilite"]],["Comprendre l'acné et la chute de cheveux",["androgenes","peau","thyroide"]]];

// ── découvertes suggérées : selon son profil, ses priorités et son objectif ──
const PAR_PROFIL = { metabolique:"insuline", androgenique:"androgenes", inflammatoire:"inflammation", surrenalien:"stress", mixte_ma:"insuline", mixte_mi:"insuline", mixte_ai:"androgenes" };
const PAR_PRIO = { fringales:"insuline", douleurs:"cycle", peau:"peau", stress:"stress", cycle:"cycle", comprendre:"cestquoi" };
const PAR_OBJ = { energie:"fatigue", sommeil:"sommeil", cycle:"cycle", alimentation:"manger", mouvement:"bouger", profil:"insuline", quotidien:"cercle", besoins:"cestquoi" };
const suggestions = ({profil,perso,evo}) => { const out=[]; const add=(id,pq)=>{ if(id&&parId(id)&&!out.some(x=>x.id===id)) out.push({id,pq}); };
  const obj=evo&&Array.isArray(evo.objectifs)?evo.objectifs.find(o=>o.priorite==="principal"&&o.statut!=="pause"):null;
  if(obj) add(PAR_OBJ[obj.cle],"pour ton objectif : "+String(obj.titre).toLowerCase());
  ((perso&&perso.priorites)||[]).forEach(p=>add(PAR_PRIO[p],"parce que c'est ta priorité"));
  add(PAR_PROFIL[profil],"d'après ton profil");
  add("cestquoi","pour bien démarrer"); return out.slice(0,3); };

// ── trouver la fiche qui correspond à un lien d'une mission ou d'une fiche SOS ──
export const ficheDeTexte = (t) => { t=String(t||"").toLowerCase();
  const m=[[/routine de sommeil|sommeil/,"sommeil"],[/pilule|contraception/,"pilule"],[/intestin|microbiote/,"intestin"],[/fertilité/,"fertilite"],[/androgènes|dht|peau|poils|cheveux/,"androgenes"],[/cycle|ovulation|règles|lh|fsh|œstrogènes|progestérone/,"cycle"],
    [/foie|shbg/,"shbg"],[/stress|cortisol|surrénal/,"stress"],[/moral|anxiété|déprime|humeur/,"moral"],[/inflammation/,"inflammation"],[/mouvement|bouger|sport|activité physique/,"bouger"],[/insuline/,"insuline"],[/thyroïde/,"thyroide"],[/poids/,"poids"],[/fatigue/,"fatigue"],[/ovaires|bases|clichés|origines|diagnostic/,"cestquoi"],[/mécanismes|hormones/,"hormones"]].find(x=>x[0].test(t));
  return m?m[1]:null; };

const majus = (t) => String(t||"").replace(/^./,c=>c.toUpperCase());
const dateFr = (iso) => { try { return new Date(iso+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}); } catch(e){ return iso; } };

export function Bibliotheque({C,Icon,profil,perso,evo,fiche,setFiche,questions,ajouterQuestion,aller,sortir,ressources}){
  const [vue,setVue]=useState(null); // null | "cat:<id>" | "sources"
  const [parcours,setParcours]=useState(null); // [titre, ids]
  const [pile,setPile]=useState([]); // le chemin parcouru, pour que « retour » ramène vraiment d'où on vient
  const avancer=(p)=>{ setPile(x=>[...x,{fiche,vue,parcours}]); if("vue" in p) setVue(p.vue); if("parcours" in p) setParcours(p.parcours); if("fiche" in p) setFiche(p.fiche); };
  const ouvrirFiche=(id)=>avancer({fiche:id});
  const accueil=()=>{ setPile([]); setVue(null); setParcours(null); setFiche(null); };
  const reculer=()=>{ if(pile.length){ const p=pile[pile.length-1]; setPile(pile.slice(0,-1)); setVue(p.vue); setParcours(p.parcours); setFiche(p.fiche); }
    else if(fiche) setFiche(null); else if(vue) setVue(null); else if(sortir) sortir(); };
  const catDe=(id)=>CATEGORIES.find(c=>c[0]===id);
  const pastille=(ic,col,t=34,ti=17)=><span style={{width:t,height:t,borderRadius:10,background:col+"1F",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name={ic} size={ti} color={col} stroke={1.7}/></span>;
  useEffect(()=>{ try{ window.scrollTo(0,0); }catch(e){} },[fiche,vue]);
  const f=fiche?parId(fiche):null;
  const carte={background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px",marginBottom:12};
  const lbl=(t,col)=><div style={{fontSize:9.5,letterSpacing:1.2,textTransform:"uppercase",color:col||C.terra,fontWeight:700,marginBottom:6}}>{t}</div>;
  // en haut de chaque écran : un seul bouton retour, puis le fil d'Ariane (chaque étape est cliquable, sauf l'écran où l'on est)
  const nav=(ici)=>{ const c=vue&&vue.startsWith("cat:")?catDe(vue.slice(4)):null; const enParcours=fiche&&parcours&&parcours[1].includes(fiche);
    const fil=[["Mes ressources",ressources],["Comprendre mon SMOP",sortir],["La bibliothèque",ici?accueil:null]];
    if(c&&fiche) fil.push([c[1],()=>avancer({fiche:null,parcours:null})]);
    if(enParcours) fil.push(["Parcours : "+parcours[0].toLowerCase(),null]);
    if(ici) fil.push([ici,null]);
    const sep=<span style={{color:C.light,margin:"0 5px"}}>›</span>;
    return (<div style={{marginBottom:14}}>
      <button onClick={reculer} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",color:C.mid,fontSize:12,fontWeight:600,padding:"2px 0",marginBottom:4}}><Icon name="arrowL" size={16} color={C.mid}/> retour</button>
      <div style={{fontSize:10.5,color:C.light,lineHeight:1.6}}>{fil.map(([t,go],i)=>{ const dernier=i===fil.length-1; return (<span key={i}>{i>0&&sep}
        {go&&!dernier?<button onClick={go} style={{background:"none",border:"none",padding:0,fontFamily:"inherit",fontSize:10.5,color:C.mid,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}>{t}</button>
          :<span style={{color:dernier?C.brown:C.light,fontWeight:dernier?700:400}}>{t}</span>}</span>); })}</div>
    </div>); };
  const ligneFiche=(x,sous,key)=>(<button key={key||x.id} onClick={()=>ouvrirFiche(x.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:11,background:C.white,border:`1px solid ${C.border}`,borderRadius:13,padding:"11px 12px",marginBottom:8,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
    {pastille(FICHE_IC[x.id]||"book",(catDe(x.cat)||[])[4]||C.terra)}
    <span style={{flex:1,minWidth:0}}><span style={{display:"block",fontSize:12.5,fontWeight:700,color:C.brown}}>{x.titre}</span><span style={{display:"block",fontSize:10.5,color:C.mid,lineHeight:1.4}}>{sous||x.court}</span></span>
    <span style={{color:C.light}}>›</span></button>);
  const bandeau=<div style={{background:C.bubble,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 12px",marginBottom:14,fontSize:10.5,color:C.mid,lineHeight:1.6}}>
    <strong style={{color:C.brown}}>SMOP, PMOS, SOPK :</strong> en 2026, un consensus international a renommé le SOPK en <i>polyendocrine metabolic ovarian syndrome</i> (PMOS). « SMOP » est le nom qu'on utilise ici en français : la traduction officielle n'est pas encore fixée. ces fiches sont éducatives et ne remplacent pas l'avis de ton médecin.</div>;

  // ── une fiche ──
  if(f){
    const cat=CATEGORIES.find(c=>c[0]===f.cat); const e=ETIQ[f.etiq]; const deja=(questions||[]).includes(f.question);
    const iP=parcours?parcours[1].indexOf(f.id):-1; const suivante=iP>=0&&iP<parcours[1].length-1?parId(parcours[1][iP+1]):null;
    const bouton=(a,i)=>{ const [cible,l]=a; const interne=cible.startsWith("fiche:"); return <button key={i} onClick={()=>interne?ouvrirFiche(cible.slice(6)):aller(cible)} style={{padding:"8px 12px",borderRadius:99,border:`1.5px solid ${C.terra}`,background:interne?C.white:C.terra,color:interne?C.terra:"#fff",fontFamily:"inherit",fontSize:11.5,fontWeight:700,cursor:"pointer"}}>{l}{interne?"":" →"}</button>; };
    return (<div className="fu">
      {nav(f.titre)}
      {parcours&&iP>=0&&<div style={{fontSize:10.5,color:C.mauve,fontWeight:700,marginBottom:6}}>parcours · {iP+1} sur {parcours[1].length}</div>}
      <div style={{display:"flex",gap:11,alignItems:"center",marginBottom:4}}>{pastille(FICHE_IC[f.id]||"book",cat?cat[4]:C.terra,42,21)}<div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.35rem",fontWeight:600,color:C.brown,lineHeight:1.2}}>{f.titre}</div></div>
      {AFFICHER_SOURCES?<div style={{display:"inline-block",fontSize:10,fontWeight:700,color:C.mauve,background:C.mauveSoft,borderRadius:99,padding:"3px 9px",margin:"4px 0 12px"}} title={e[1]}>{e[0]}</div>:<div style={{height:10}}/>}
      <div style={{...carte,background:C.cream}}>{lbl("ça te parle ?")}<div style={{fontSize:13,color:C.brown,lineHeight:1.6,fontStyle:"italic"}}>{f.parle}</div></div>
      <div style={carte}>{lbl("ce qui se passe")}
        {f.tableau&&<div style={{display:"flex",gap:8,marginBottom:10}}>{f.tableau.map(([t,coul,rows],i)=>(
          <div key={i} style={{flex:1,minWidth:0,background:C.cream,borderRadius:12,padding:"10px",borderTop:`3px solid ${coul}`}}>
            <div style={{fontSize:11,fontWeight:700,color:C.brown,marginBottom:6}}>{t}</div>
            {rows.map(([k,v],j)=><div key={j} style={{marginBottom:6}}><div style={{fontSize:8,letterSpacing:.8,textTransform:"uppercase",color:coul,fontWeight:700}}>{k}</div><div style={{fontSize:10.5,color:C.brown,lineHeight:1.4}}>{v}</div></div>)}
          </div>))}</div>}
        {f.passe.map((p,i)=><p key={i} style={{fontSize:12.5,color:C.brown,lineHeight:1.65,margin:"0 0 9px"}}>{p}</p>)}
        {f.liste&&f.liste.map(([h,etat,role,aide,id],i)=>(<button key={i} onClick={()=>ouvrirFiche(id)} style={{width:"100%",textAlign:"left",background:C.cream,border:"none",borderRadius:11,padding:"9px 11px",marginBottom:7,cursor:"pointer",fontFamily:"inherit"}}>
          <span style={{display:"block",fontSize:12,fontWeight:700,color:C.brown}}>{h} <span style={{fontWeight:500,color:C.mid,fontSize:10.5}}>· {etat}</span></span>
          <span style={{display:"block",fontSize:11,color:C.brown,lineHeight:1.45,marginTop:2}}>{role}</span><span style={{display:"block",fontSize:10.5,color:"#4F6038",marginTop:2}}>{aide} ›</span></button>))}
        {f.liste2&&f.liste2.map(([t,coul,items],i)=>(<div key={i} style={{marginTop:8}}><div style={{fontSize:11.5,fontWeight:700,color:coul,marginBottom:6}}>{t}</div>
          {items.map(([n,p],j)=><div key={j} style={{borderLeft:`3px solid ${coul}`,background:C.cream,borderRadius:10,padding:"8px 10px",marginBottom:6}}><div style={{fontSize:11.5,fontWeight:700,color:C.brown}}>{n}</div><div style={{fontSize:11,color:C.mid,lineHeight:1.45}}>{p}</div></div>)}</div>))}
        {f.ressenti&&<div style={{marginTop:6,background:C.cream,borderRadius:10,padding:"9px 11px"}}><div style={{fontSize:8.5,letterSpacing:1,textTransform:"uppercase",color:C.mauve,fontWeight:700,marginBottom:2}}>ce que certaines Cysters ressentent</div><div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{f.ressenti}</div></div>}
        {AFFICHER_SOURCES&&<div style={{fontSize:10,color:C.light,lineHeight:1.5,marginTop:8}}>{f.etiqNote||e[0]+" : "+e[1]+"."}</div>}
      </div>
      <div style={carte}>{lbl("ce que tu peux faire","#4F6038")}
        {f.faire.map((p,i)=><p key={i} style={{fontSize:12.5,color:C.brown,lineHeight:1.65,margin:"0 0 9px"}}>{p}</p>)}
        {f.actions&&f.actions.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:4}}>{f.actions.map(bouton)}</div>}
      </div>
      <div style={{...carte,border:`1.5px solid ${C.mauve}`}}>{lbl("quand en parler à ton médecin",C.mauve)}
        <p style={{fontSize:12.5,color:C.brown,lineHeight:1.65,margin:"0 0 10px"}}>{f.medecin}</p>
        <div style={{background:C.mauveSoft,borderRadius:10,padding:"9px 11px",fontSize:11.5,color:C.brown,fontStyle:"italic",marginBottom:9}}>« {f.question} »</div>
        <button disabled={deja} onClick={()=>ajouterQuestion(f.question)} style={{width:"100%",padding:"10px",borderRadius:11,border:"none",background:deja?"#EAF3EA":C.mauve,color:deja?"#4A7A52":"#fff",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:deja?"default":"pointer"}}>{deja?"✓ dans mes questions pour le médecin":"ajouter à mes questions pour le médecin"}</button>
        {deja&&<button onClick={()=>aller("tab:medecin")} style={{display:"block",margin:"8px auto 0",background:"none",border:"none",padding:0,color:C.mid,fontFamily:"inherit",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>voir mon dossier santé</button>}
      </div>
      {f.vecu&&<div style={{...carte,background:`linear-gradient(150deg,#FDF4EE,${C.white})`,border:`1px dashed ${C.terra}`}}>{lbl("mon vécu · Kamila")}
        <div style={{fontSize:10,color:C.light,marginBottom:8}}>mon expérience personnelle, pas une explication scientifique.</div>
        {f.vecu.map((p,i)=><p key={i} style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:C.brown,lineHeight:1.65,fontStyle:"italic",margin:"0 0 9px"}}>{p}</p>)}</div>}
      {AFFICHER_SOURCES&&<div style={{...carte,background:"transparent"}}>{lbl("sources",C.light)}
        {f.sources.length===0&&<div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>aucune source solide pour l'instant : cette fiche est présentée comme une piste de recherche.</div>}
        {f.sources.map(id=>{ const s=SOURCES[id]; if(!s) return null; const st=STATUTS[s.statut]; return (<div key={id} style={{fontSize:10.5,color:C.mid,lineHeight:1.5,marginBottom:7}}>
          <span style={{fontSize:9,fontWeight:700,color:st[1],background:st[2],borderRadius:99,padding:"1px 7px",marginRight:6}}>{st[0]}{s.statut==="consultee"&&s.le?" le "+dateFr(s.le):""}</span>{s.ref}</div>); })}
        <button onClick={()=>{ setFiche(null); setVue("sources"); }} style={{background:"none",border:"none",padding:0,color:C.mid,fontFamily:"inherit",fontSize:10.5,cursor:"pointer",textDecoration:"underline"}}>comment on vérifie nos sources</button>
      </div>}
      {suivante&&<button onClick={()=>ouvrirFiche(suivante.id)} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:C.terra,color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:12}}>fiche suivante : {suivante.titre} →</button>}
      {parcours&&iP===parcours[1].length-1&&<div style={{...carte,textAlign:"center",fontSize:12,color:C.brown}}>parcours terminé. <button onClick={accueil} style={{background:"none",border:"none",color:C.terra,fontWeight:700,fontFamily:"inherit",cursor:"pointer"}}>revenir à la bibliothèque</button></div>}
    </div>);
  }

  // ── le registre des sources ──
  if(AFFICHER_SOURCES&&vue==="sources") return (<div className="fu">
    {nav("Nos sources")}
    <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",fontWeight:600,color:C.brown,marginBottom:4}}>Nos sources</div>
    <div style={{fontSize:11.5,color:C.mid,lineHeight:1.6,marginBottom:12}}>chaque fiche dit d'où vient ce qu'elle affirme. une source n'est marquée « consultée » que si on l'a vraiment ouverte et lue. les autres sont « à vérifier » : on les relit avant la version finale.</div>
    {Object.entries(ETIQ).map(([k,[t,d]])=><div key={k} style={{fontSize:11,color:C.brown,marginBottom:4}}><b>{t}</b> : {d}.</div>)}
    <div style={{height:10}}/>
    {Object.entries(SOURCES).map(([id,s])=>{ const st=STATUTS[s.statut]; return (<div key={id} style={carte}>
      <span style={{fontSize:9,fontWeight:700,color:st[1],background:st[2],borderRadius:99,padding:"2px 8px"}}>{st[0]}{s.statut==="consultee"&&s.le?" le "+dateFr(s.le):""}</span>
      <div style={{fontSize:11.5,color:C.brown,lineHeight:1.5,margin:"7px 0 5px"}}>{s.ref}</div>
      <div style={{fontSize:10.5,color:C.mid,lineHeight:1.5}}><b>{s.type}.</b> {s.niveau}</div>
      <div style={{fontSize:10.5,color:C.mid,lineHeight:1.5,marginTop:3}}><b>limites :</b> {s.limites}</div>
      {s.note&&<div style={{fontSize:10,color:C.light,lineHeight:1.5,marginTop:3}}>{s.note}</div>}
      {s.url&&<a href={s.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:6,fontSize:10.5,color:C.terra,fontWeight:700}}>ouvrir la source</a>}
    </div>); })}
  </div>);

  // ── une catégorie ──
  if(vue&&vue.startsWith("cat:")){ const c=CATEGORIES.find(x=>x[0]===vue.slice(4)); const liste=FICHES.filter(x=>x.cat===c[0]); return (<div className="fu">
    {nav(c[1])}
    <div style={{display:"flex",alignItems:"center",gap:10}}>{pastille(c[2],c[4])}<div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",fontWeight:600,color:C.brown}}>{c[1]}</div></div>
    <div style={{fontSize:11.5,color:C.mid,marginBottom:12}}>{c[3]}</div>
    {liste.map(x=>ligneFiche(x))}
    <div style={{fontSize:10.5,color:C.light,lineHeight:1.5,textAlign:"center",marginTop:6}}>d'autres fiches arrivent au fil de la bêta, selon ce que vous cherchez.</div>
  </div>); }

  // ── l'accueil de la bibliothèque : par besoin, suggestions, collections, catégories ──
  const sug=suggestions({profil,perso,evo});
  return (<div className="fu">
    {nav(null)}
    {bandeau}
    <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",fontWeight:600,color:C.brown,marginBottom:8}}>Qu'est-ce que tu aimerais comprendre aujourd'hui ?</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:16}}>{BESOINS.map(([q,id])=><button key={q} onClick={()=>ouvrirFiche(id)} style={{padding:"8px 12px",borderRadius:99,border:`1px solid ${C.border}`,background:C.white,color:C.brown,fontFamily:"inherit",fontSize:11.5,fontWeight:600,cursor:"pointer",textAlign:"left"}}>{q}</button>)}</div>
    {sug.length>0&&<div style={{...carte,background:`linear-gradient(150deg,${C.mauveSoft},${C.white})`,border:`1.5px solid ${C.mauve}`}}>{lbl("pour toi, en ce moment",C.mauve)}
      {sug.map(s=>ligneFiche(parId(s.id),s.pq,"s"+s.id))}</div>}
    {COLLECTIONS.map(col=>(<div key={col.titre} style={carte}>{lbl(col.titre)}<div style={{fontSize:10.5,color:C.mid,marginTop:-3,marginBottom:9}}>{col.sous}</div>
      {col.liens.map(([q,id],i)=><button key={i} onClick={()=>ouvrirFiche(id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,background:"none",border:"none",borderTop:i?`1px solid ${C.border}`:"none",padding:"9px 2px",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
        <span style={{flex:1,fontSize:12,color:C.brown,fontStyle:"italic"}}>« {q} »</span><span style={{fontSize:10.5,color:C.terra,fontWeight:700,flexShrink:0}}>{parId(id).titre.toLowerCase()} ›</span></button>)}</div>))}
    <div style={carte}>{lbl("les parcours de découverte")}
      {PARCOURS.map(([t,ids])=><button key={t} onClick={()=>avancer({parcours:[t,ids],fiche:ids[0]})} style={{width:"100%",display:"flex",alignItems:"center",gap:10,background:C.cream,border:"none",borderRadius:11,padding:"10px 12px",marginBottom:7,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
        <span style={{flex:1,fontSize:12.5,fontWeight:700,color:C.brown}}>{t}</span><span style={{fontSize:10.5,color:C.mid}}>{ids.length} fiches ›</span></button>)}</div>
    {lbl("explorer par thème",C.brown)}
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8,marginBottom:12}}>{CATEGORIES.map(([id,t,ic,d,col])=>{ const n=FICHES.filter(x=>x.cat===id).length; return (
      <button key={id} onClick={()=>avancer({vue:"cat:"+id})} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
        {pastille(ic,col,32,16)}<div style={{fontSize:12,fontWeight:700,color:C.brown,marginTop:7,lineHeight:1.25}}>{t}</div><div style={{fontSize:10,color:C.light,marginTop:2}}>{n} fiche{n>1?"s":""}</div></button>); })}</div>
    {AFFICHER_SOURCES&&<button onClick={()=>setVue("sources")} style={{display:"block",margin:"4px auto 0",background:"none",border:"none",color:C.mid,fontFamily:"inherit",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>nos sources, et comment on les vérifie</button>}
  </div>);
}
