import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// BOUGER — espace mouvement de SMOP Map
// Programme de 8 semaines, planning de la semaine, séances guidées, fiches exercices.
// Contenu éducatif et bien-être : ne traite pas et ne guérit pas le SMOP.
// Les fiches doivent être relues par une kiné avant la mise en ligne.
// Images : déposer /public/bouger/<id>.webp (une image par exercice, personnage récurrent).
// Tant qu'une image manque, le pictogramme existant s'affiche à la place.
// ═══════════════════════════════════════════════════════════════════════════

const save = (key, val) => { try { localStorage.setItem("sopklife_"+key, JSON.stringify(val)); } catch(e) {} };
const load = (key, def) => { try { const v = localStorage.getItem("sopklife_"+key); return v ? JSON.parse(v) : def; } catch(e) { return def; } };

const L  = "#8E80A3";   // lavande foncée (boutons)
const LB = "#EEE9F4";   // lavande très claire (fonds)
const T  = "#CB9A79";   // terracotta (accents)

// ─── BIBLIOTHÈQUE D'EXERCICES ───────────────────────────────────────────────
// cat : mobilite | renfo | cardio | calme
const EXOS = {
  respiration:{ nom:"Respiration diaphragmatique", cat:"mobilite", pose:"breath", zone:"respiration", niveau:"tous niveaux", materiel:"aucun",
    etapes:["assise ou allongée, pose une main sur ton ventre, l'autre sur ta poitrine.","inspire par le nez en laissant le ventre se gonfler sous ta main.","expire lentement par la bouche, le ventre redescend. la poitrine bouge peu."],
    respiration:"inspire sur 4 temps, expire sur 6 temps.",
    bienfaits:"t'aide à te poser avant et après l'effort, et à retrouver un souffle calme.", muscles:"diaphragme, muscles respiratoires",
    erreurs:["hausser les épaules en inspirant","forcer l'inspiration"], facile:"allongée sur le dos, genoux pliés.", avance:"debout, en gardant le même rythme lent.",
    precautions:"si la tête tourne, reprends une respiration normale." },
  epaules:{ nom:"Rotations douces des épaules", cat:"mobilite", pose:"shoulderRoll", zone:"épaules, haut du dos", niveau:"tous niveaux", materiel:"aucun",
    etapes:["debout ou assise, bras relâchés le long du corps.","monte les épaules vers les oreilles, ramène-les en arrière puis vers le bas.","fais de grands cercles lents, puis change de sens."],
    respiration:"inspire en montant, expire en descendant.",
    bienfaits:"dénoue le haut du dos et la nuque, utile après une journée assise.", muscles:"trapèzes, muscles autour de l'omoplate",
    erreurs:["aller trop vite","crisper la mâchoire"], facile:"une épaule à la fois.", avance:"ajoute un cercle de bras complet.",
    precautions:"reste dans une amplitude sans douleur." },
  cerclesBras:{ nom:"Cercles de bras", cat:"mobilite", pose:"reachUp", zone:"épaules", niveau:"tous niveaux", materiel:"aucun",
    etapes:["debout, pieds largeur de hanches, bras tendus sur les côtés.","dessine de petits cercles vers l'avant.","agrandis peu à peu, puis change de sens."],
    respiration:"respire tranquillement, sans bloquer.",
    bienfaits:"réveille les épaules avant le renforcement.", muscles:"deltoïdes, coiffe des épaules",
    erreurs:["cambrer le bas du dos","lever les épaules"], facile:"bras pliés, mains sur les épaules.", avance:"cercles plus grands et plus lents.",
    precautions:"si l'épaule pince, réduis la taille des cercles." },
  chatVache:{ nom:"Cat-Cow (dos rond, dos creux)", cat:"mobilite", pose:"childPose", zone:"colonne, dos", niveau:"tous niveaux", materiel:"tapis",
    etapes:["à quatre pattes, mains sous les épaules, genoux sous les hanches.","expire en arrondissant le dos, regard vers le nombril.","inspire en creusant doucement le dos, regard devant."],
    respiration:"expire en dos rond, inspire en dos creux.",
    bienfaits:"assouplit le dos et aide à relâcher les tensions.", muscles:"muscles du dos, abdominaux profonds",
    erreurs:["creuser trop fort le bas du dos","aller vite"], facile:"assise sur une chaise, mains sur les genoux.", avance:"ralentis encore et marque une pause dans chaque position.",
    precautions:"si les poignets sont sensibles, pose-toi sur les poings ou fais la version assise." },
  hanches:{ nom:"Mobilité des hanches", cat:"mobilite", pose:"march", zone:"hanches", niveau:"tous niveaux", materiel:"aucun (appui possible)",
    etapes:["debout, une main sur un mur ou une chaise.","lève un genou devant toi, ouvre-le sur le côté, puis repose le pied.","fais quelques cercles, puis change de jambe."],
    respiration:"respire calmement tout du long.",
    bienfaits:"rend les hanches plus mobiles pour marcher, monter les escaliers, s'accroupir.", muscles:"fléchisseurs et rotateurs de hanche",
    erreurs:["pencher le buste","bloquer la respiration"], facile:"petits cercles, genou plus bas.", avance:"sans appui, si l'équilibre le permet.",
    precautions:"garde un appui si tu manques d'équilibre." },
  marcheSurPlace:{ nom:"Marche sur place", cat:"cardio", pose:"march", zone:"corps entier", niveau:"tous niveaux", materiel:"aucun",
    etapes:["debout, marche sur place à ton rythme.","balance les bras naturellement.","accélère un peu si tu te sens bien."],
    respiration:"tu dois pouvoir parler en marchant.",
    bienfaits:"réchauffe le corps en douceur et prépare à l'effort.", muscles:"jambes, mollets",
    erreurs:["taper les pieds","retenir son souffle"], facile:"plus lentement, une main sur un appui.", avance:"monte un peu plus les genoux.",
    precautions:"aucune particulière : écoute ton souffle." },
  squatChaise:{ nom:"Squat vers une chaise", cat:"renfo", pose:"wallSquat", zone:"bas du corps", niveau:"débutante", materiel:"chaise",
    etapes:["place-toi devant une chaise stable, pieds largeur des hanches.","recule les hanches et plie les genoux pour t'asseoir légèrement.","remonte en poussant dans tes pieds."],
    respiration:"inspire en descendant, expire en remontant.",
    bienfaits:"renforce cuisses et fessiers : se lever, s'asseoir, monter les escaliers devient plus facile.", muscles:"quadriceps, fessiers, ischio-jambiers",
    erreurs:["genoux qui rentrent vers l'intérieur","talons qui décollent","dos qui s'arrondit"], facile:"assieds-toi complètement sur la chaise à chaque répétition.", avance:"effleure la chaise sans t'asseoir, ou tiens une charge légère contre toi.",
    precautions:"si un genou fait mal, descends moins bas." },
  assisDebout:{ nom:"Assis-debout", cat:"renfo", pose:"wallSquat", zone:"bas du corps", niveau:"débutante", materiel:"chaise",
    etapes:["assise au bord d'une chaise, pieds bien à plat.","penche légèrement le buste en avant.","lève-toi sans t'aider des mains, puis rassieds-toi lentement."],
    respiration:"expire en te levant.",
    bienfaits:"travaille un geste du quotidien : se lever facilement.", muscles:"quadriceps, fessiers",
    erreurs:["se laisser tomber sur la chaise","s'aider des mains"], facile:"aide-toi des mains sur les cuisses.", avance:"rassieds-toi sur 3 secondes.",
    precautions:"chaise stable, calée contre un mur." },
  pontFessier:{ nom:"Pont fessier", cat:"renfo", pose:"bridge", zone:"fessiers, arrière des cuisses", niveau:"débutante", materiel:"tapis",
    etapes:["allongée sur le dos, genoux pliés, pieds à plat.","pousse dans les talons pour soulever le bassin.","redescends lentement, vertèbre par vertèbre."],
    respiration:"expire en montant, inspire en descendant.",
    bienfaits:"renforce les fessiers, qui soutiennent le bas du dos et la marche.", muscles:"fessiers, ischio-jambiers",
    erreurs:["cambrer en haut du mouvement","écarter les genoux"], facile:"monte moins haut.", avance:"tiens 3 secondes en haut, ou une jambe tendue.",
    precautions:"si ta nuque est gênée, glisse un coussin fin sous la tête." },
  mollets:{ nom:"Élévations des mollets", cat:"renfo", pose:"calfRaise", zone:"mollets", niveau:"débutante", materiel:"appui (mur, chaise)",
    etapes:["debout, une main sur un appui.","monte sur la pointe des pieds.","redescends lentement."],
    respiration:"respire sans bloquer.",
    bienfaits:"renforce les mollets et l'équilibre, utile pour la marche.", muscles:"mollets, pieds",
    erreurs:["redescendre d'un coup","rouler sur les bords du pied"], facile:"monte moins haut.", avance:"sur une jambe, avec appui.",
    precautions:"garde toujours un appui." },
  abduction:{ nom:"Abduction de hanche debout", cat:"renfo", pose:"sideStep", zone:"côté des hanches", niveau:"débutante", materiel:"appui",
    etapes:["debout, une main sur une chaise.","écarte une jambe tendue sur le côté, sans pencher le buste.","reviens lentement."],
    respiration:"expire en écartant.",
    bienfaits:"stabilise le bassin à la marche.", muscles:"moyen fessier",
    erreurs:["pencher le buste","tourner le pied vers le haut"], facile:"plus petit mouvement.", avance:"avec un élastique autour des chevilles.",
    precautions:"mouvement lent, sans élan." },
  pompesMur:{ nom:"Pompes contre un mur", cat:"renfo", pose:"plankKnee", zone:"haut du corps", niveau:"débutante", materiel:"mur",
    etapes:["face au mur, mains à hauteur d'épaules, un peu plus larges.","plie les coudes pour approcher la poitrine du mur.","repousse le mur, corps bien aligné."],
    respiration:"inspire en approchant, expire en repoussant.",
    bienfaits:"renforce bras, épaules et poitrine pour porter, pousser, se relever.", muscles:"pectoraux, triceps, épaules",
    erreurs:["fesses en arrière","coudes trop écartés"], facile:"rapproche les pieds du mur.", avance:"éloigne les pieds, ou appuie-toi sur un plan de travail.",
    precautions:"si un poignet gêne, garde les mains plus basses." },
  birdDog:{ nom:"Bird-Dog", cat:"renfo", pose:"superman", zone:"dos, sangle abdominale", niveau:"débutante", materiel:"tapis", cote:true,
    etapes:["à quatre pattes, dos neutre.","tends un bras devant et la jambe opposée derrière.","reviens, puis change de côté."],
    respiration:"expire en tendant.",
    bienfaits:"stabilise le dos et améliore la coordination.", muscles:"muscles du dos, abdominaux profonds, fessiers",
    erreurs:["creuser le dos","lever trop haut la jambe"], facile:"tends seulement la jambe, ou seulement le bras.", avance:"tiens 3 secondes en extension.",
    precautions:"sur les poings si les poignets gênent." },
  deadBug:{ nom:"Dead Bug simplifié", cat:"renfo", pose:"bridge", zone:"sangle abdominale", niveau:"débutante", materiel:"tapis", cote:true,
    etapes:["allongée sur le dos, genoux pliés au-dessus des hanches, bras vers le plafond.","descends doucement un talon vers le sol.","reviens, puis change de jambe. le bas du dos reste posé."],
    respiration:"expire en descendant la jambe.",
    bienfaits:"renforce la sangle abdominale en protégeant le dos.", muscles:"transverse, abdominaux",
    erreurs:["décoller le bas du dos","aller vite"], facile:"garde les pieds au sol et fais glisser un pied.", avance:"descends en même temps le bras opposé.",
    precautions:"en post-partum, demande l'avis de ta kiné ou sage-femme." },
  gainageMur:{ nom:"Gainage au mur", cat:"renfo", pose:"plankKnee", zone:"sangle abdominale", niveau:"débutante", materiel:"mur",
    etapes:["face au mur, avant-bras posés dessus.","recule les pieds, corps aligné de la tête aux talons.","tiens la position en respirant."],
    respiration:"respire lentement, ne bloque pas.",
    bienfaits:"construit un gainage solide, sans charge sur le sol.", muscles:"abdominaux, épaules",
    erreurs:["fesses en arrière","bloquer la respiration"], facile:"pieds plus près du mur.", avance:"gainage sur les genoux au sol.",
    precautions:"arrête si le bas du dos tire." },
  tirageElastique:{ nom:"Tirage avec élastique", cat:"renfo", pose:"shoulderRoll", zone:"haut du dos", niveau:"débutante", materiel:"élastique",
    etapes:["accroche l'élastique à une poignée de porte fermée, ou tiens-le devant toi.","tire les coudes vers l'arrière en serrant les omoplates.","reviens lentement."],
    respiration:"expire en tirant.",
    bienfaits:"renforce le haut du dos et la posture.", muscles:"rhomboïdes, dorsaux, arrière des épaules",
    erreurs:["hausser les épaules","tirer avec les mains plutôt qu'avec les coudes"], facile:"élastique plus souple.", avance:"recule d'un pas pour plus de tension.",
    precautions:"vérifie que l'élastique est bien fixé." },
  charniere:{ nom:"Charnière de hanche", cat:"renfo", pose:"forwardFold", zone:"arrière des cuisses, fessiers", niveau:"débutante", materiel:"aucun (bâton possible)",
    etapes:["debout, genoux légèrement fléchis, mains sur les hanches.","pousse les fesses en arrière, buste qui s'incline, dos droit.","remonte en serrant les fessiers."],
    respiration:"inspire en descendant, expire en remontant.",
    bienfaits:"apprend à se pencher en protégeant son dos, pour ramasser et porter.", muscles:"ischio-jambiers, fessiers, dos",
    erreurs:["arrondir le dos","plier trop les genoux"], facile:"descends moins bas, fesses vers un mur derrière toi.", avance:"tiens une charge légère.",
    precautions:"amplitude réduite si le dos est sensible." },
  fenteAppui:{ nom:"Fente avec appui", cat:"renfo", pose:"lunge", zone:"bas du corps", niveau:"débutante", materiel:"chaise", cote:true,
    etapes:["une main sur une chaise, fais un pas en arrière.","descends doucement, les deux genoux pliés.","remonte en poussant dans le pied avant."],
    respiration:"inspire en descendant, expire en remontant.",
    bienfaits:"renforce chaque jambe séparément et l'équilibre.", muscles:"quadriceps, fessiers",
    erreurs:["genou avant qui part vers l'intérieur","buste penché"], facile:"remplace par l'assis-debout.", avance:"sans appui, ou avec une charge légère.",
    precautions:"si le genou fait mal, réduis la profondeur." },
  marcheCharge:{ nom:"Marche avec charge légère", cat:"renfo", pose:"march", zone:"corps entier", niveau:"débutante", materiel:"2 sacs ou bouteilles",
    etapes:["prends une charge légère dans chaque main.","marche dans la pièce, épaules basses, buste droit.","respire calmement."],
    respiration:"respiration régulière.",
    bienfaits:"renforce la tenue du corps pour porter les courses.", muscles:"avant-bras, épaules, abdominaux",
    erreurs:["hausser les épaules","se pencher d'un côté"], facile:"sans charge.", avance:"charges un peu plus lourdes.",
    precautions:"charge que tu portes sans effort de dos." },
  pasLateraux:{ nom:"Pas latéraux", cat:"cardio", pose:"sideStep", zone:"corps entier", niveau:"tous niveaux", materiel:"aucun",
    etapes:["fais deux pas sur le côté, puis deux pas de l'autre côté.","genoux souples.","balance les bras."],
    respiration:"tu dois pouvoir parler.",
    bienfaits:"active le cœur en douceur, sans saut.", muscles:"jambes",
    erreurs:["croiser les pieds"], facile:"un seul pas de chaque côté.", avance:"descends un peu plus bas sur les jambes.",
    precautions:"sol dégagé." },
  stepTouch:{ nom:"Step touch", cat:"cardio", pose:"sideStep", zone:"corps entier", niveau:"tous niveaux", materiel:"aucun",
    etapes:["un pas sur le côté, l'autre pied vient toucher.","repars de l'autre côté.","ajoute les bras si tu veux."],
    respiration:"respire régulièrement.",
    bienfaits:"cardio doux et ludique.", muscles:"jambes",
    erreurs:["aller trop vite au début"], facile:"sans les bras.", avance:"bras au-dessus de la tête.",
    precautions:"aucune particulière." },
  talonsFesses:{ nom:"Talons-fesses sans saut", cat:"cardio", pose:"march", zone:"jambes", niveau:"tous niveaux", materiel:"aucun",
    etapes:["sur place, ramène un talon vers la fesse.","alterne les jambes, sans sauter.","garde le buste droit."],
    respiration:"respire régulièrement.",
    bienfaits:"fait monter le rythme cardiaque sans impact.", muscles:"ischio-jambiers",
    erreurs:["se pencher en avant"], facile:"plus lentement.", avance:"un peu plus vite.",
    precautions:"appui possible." },
  genoux:{ nom:"Montées de genoux modérées", cat:"cardio", pose:"kneeLift", zone:"jambes, abdominaux", niveau:"tous niveaux", materiel:"aucun",
    etapes:["sur place, lève un genou à hauteur confortable.","alterne, sans sauter.","garde le dos droit."],
    respiration:"respire régulièrement.",
    bienfaits:"active le cœur et les abdominaux.", muscles:"fléchisseurs de hanche, abdominaux",
    erreurs:["se pencher en arrière"], facile:"genoux moins hauts.", avance:"un peu plus vite.",
    precautions:"appui si besoin." },
  flexionAvant:{ nom:"Flexion avant relâchée", cat:"calme", pose:"forwardFold", zone:"dos, arrière des cuisses", niveau:"tous niveaux", materiel:"aucun",
    etapes:["debout, genoux souples.","enroule doucement le dos vers l'avant.","laisse pendre la tête et les bras, respire, remonte lentement."],
    respiration:"expire en descendant.",
    bienfaits:"relâche le dos après l'effort.", muscles:"dos, ischio-jambiers",
    erreurs:["tendre les genoux","remonter vite"], facile:"mains sur les cuisses.", avance:"reste plus longtemps.",
    precautions:"remonte lentement pour éviter la tête qui tourne." },
  enfant:{ nom:"Posture de l'enfant", cat:"calme", pose:"childPose", zone:"dos", niveau:"tous niveaux", materiel:"tapis",
    etapes:["à genoux, assieds-toi sur les talons.","penche le buste vers l'avant, bras devant toi.","respire dans le dos."],
    respiration:"respiration lente.",
    bienfaits:"moment de retour au calme.", muscles:"dos, hanches",
    erreurs:["forcer sur les genoux"], facile:"coussin entre fesses et talons.", avance:"bras allongés plus loin.",
    precautions:"évite si les genoux sont douloureux." },
};

const CATS = [["mobilite","Mobilité"],["renfo","Renforcement"],["cardio","Cardio doux"],["calme","Retour au calme"]];

// ─── PHASES ─────────────────────────────────────────────────────────────────
const PHASES = [
  { n:1, sem:"1 – 2", titre:"Réveiller le mouvement", tours:2, reps:"8 à 10", tenue:20, repos:45, renfoMin:20, cardioMin:15,
    texte:"on installe l'habitude, sans forcer. l'objectif : apprendre les mouvements et finir chaque séance en te sentant bien." },
  { n:2, sem:"3 – 4", titre:"Construire sa force", tours:3, reps:"10 à 12", tenue:25, repos:45, renfoMin:25, cardioMin:15,
    texte:"un tour de plus, quelques répétitions en plus. tu peux tester la variante avancée d'un exercice qui te semble facile." },
  { n:3, sem:"5 – 6", titre:"Développer son endurance", tours:3, reps:"12", tenue:30, repos:30, renfoMin:25, cardioMin:20,
    texte:"des pauses un peu plus courtes et un cardio un peu plus long. toujours à un rythme où tu peux parler." },
  { n:4, sem:"7 – 8", titre:"Gagner en autonomie", tours:3, reps:"12 à 15", tenue:35, repos:30, renfoMin:30, cardioMin:20,
    texte:"tu choisis tes variantes et tu ajustes toi-même. le but : repartir avec une routine que tu sais faire seule." },
];
const phaseDe = (sem) => PHASES[Math.min(3, Math.floor((Math.max(1,sem)-1)/2))];

// ─── SÉANCES ────────────────────────────────────────────────────────────────
// item : {id, r:true} = répétitions selon la phase ; {id, s:N} = durée en secondes ; {id, t:true} = tenue selon la phase
const ECHAUF = [{id:"marcheSurPlace",s:60},{id:"epaules",s:30},{id:"hanches",s:40}];
const CALME  = [{id:"respiration",s:60},{id:"flexionAvant",s:30}];
const SEANCES = {
  A:{ titre:"Renforcement A", sous:"corps entier", type:"renfo", materiel:"chaise", ic:"heart",
      intro:"5 mouvements simples pour tout le corps. prends ton temps, la qualité compte plus que la vitesse.",
      echauf:ECHAUF, circuit:[{id:"squatChaise",r:true},{id:"pompesMur",r:true},{id:"pontFessier",r:true},{id:"birdDog",r:true},{id:"mollets",r:true}], calme:CALME },
  B:{ titre:"Renforcement B", sous:"corps entier", type:"renfo", materiel:"élastique, chaise, charge légère", ic:"heart",
      intro:"la séance complémentaire de la A : le dos, l'arrière des jambes et la sangle abdominale.",
      echauf:ECHAUF, circuit:[{id:"charniere",r:true},{id:"tirageElastique",r:true},{id:"assisDebout",r:true},{id:"deadBug",r:true},{id:"marcheCharge",s:60}], calme:CALME },
  mobilite:{ titre:"Mobilité & récupération", sous:"en douceur", type:"mobilite", materiel:"tapis", ic:"leaf", min:10,
      intro:"10 minutes pour délier le corps. parfaite les jours de petite énergie ou le lendemain d'une séance.",
      echauf:[], circuit:[{id:"respiration",s:60},{id:"epaules",s:40},{id:"cerclesBras",s:40},{id:"chatVache",s:60},{id:"hanches",s:60},{id:"enfant",s:60}], calme:[], tours:1 },
  cardio:{ titre:"Cardio doux", sous:"sans saut", type:"cardio", materiel:"aucun", ic:"pulse",
      intro:"du cardio sans impact. tu dois pouvoir parler pendant l'effort : c'est le bon rythme.",
      echauf:[{id:"marcheSurPlace",s:90}], circuit:[{id:"pasLateraux",s:60},{id:"stepTouch",s:60},{id:"talonsFesses",s:45},{id:"genoux",s:45},{id:"marcheSurPlace",s:60}], calme:CALME },
  marche:{ titre:"Marche active", sous:"dehors ou sur place", type:"marche", materiel:"aucun", ic:"steps",
      intro:"une marche d'un bon pas, dehors si possible. après un repas, c'est encore mieux pour ta digestion et ton énergie.",
      echauf:[], circuit:[{id:"marcheSurPlace",s:900}], calme:[{id:"respiration",s:60}], tours:1 },
  gainage:{ titre:"Gainage & posture", sous:"dos et sangle abdominale", type:"renfo", materiel:"tapis, mur", ic:"heart",
      intro:"pour une sangle abdominale solide et un dos qui te porte mieux au quotidien. jamais pour « un ventre plat » : pour te sentir solide.",
      echauf:[{id:"marcheSurPlace",s:60},{id:"chatVache",s:45},{id:"epaules",s:30}], circuit:[{id:"gainageMur",t:true},{id:"birdDog",r:true},{id:"deadBug",r:true},{id:"pontFessier",r:true}], calme:[{id:"enfant",s:60},{id:"respiration",s:60}] },
};
// semaine type : 0 = lundi
const SEMAINE_TYPE = ["A","marche","mobilite","B","cardio","plaisir","repos"];
const JOURS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const LIBRES = { plaisir:{ titre:"Activité plaisir", sous:"danse, vélo, piscine, balade…", min:"20 – 30" }, repos:{ titre:"Repos ou mobilité libre", sous:"au choix", min:"au choix" } };

const toursDe = (sid, ph, energie) => { const s=SEANCES[sid]; if(!s) return 1; const base=s.tours||ph.tours; return energie==="basse"?Math.max(1,base-1):base; };
const dureeDe = (sid, ph, energie) => {
  if(sid==="mobilite") return 10;
  if(sid==="marche") return ph.n>=3?20:15;
  if(sid==="cardio") return energie==="basse"?Math.max(10,ph.cardioMin-5):ph.cardioMin;
  if(SEANCES[sid]) return energie==="basse"?Math.max(12,ph.renfoMin-7):ph.renfoMin;
  return null;
};

// ─── DATES ──────────────────────────────────────────────────────────────────
const dkey = (d) => { const x=new Date(d); x.setMinutes(x.getMinutes()-x.getTimezoneOffset()); return x.toISOString().slice(0,10); };
const lundiDe = (d) => { const x=new Date(d); x.setHours(12,0,0,0); const j=(x.getDay()+6)%7; x.setDate(x.getDate()-j); return x; };
const ajout = (d,n) => { const x=new Date(d); x.setDate(x.getDate()+n); return x; };

// ─── IMAGE D'EXERCICE (image de l'avatar si présente, sinon pictogramme) ────
const _imgKo = new Set();
function ExImg({ id, ExIllus, h=170, rond=18 }) {
  const ex = EXOS[id] || {};
  const [ko, setKo] = useState(_imgKo.has(id));
  return (
    <div style={{width:"100%",height:h,borderRadius:rond,background:LB,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      {!ko ? (
        <img src={"/bouger/"+id+".webp"} alt={ex.nom||""} loading="lazy" onError={()=>{ _imgKo.add(id); setKo(true); }}
          style={{width:"100%",height:"100%",objectFit:"contain"}}/>
      ) : (
        <div style={{width:Math.min(h*0.75,130),height:Math.min(h*0.75,130)}}><ExIllus pose={ex.pose} color={L}/></div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function Bouger({ C, Icon, ExIllus, energie, setEnergie, setTab, depart, departLu, anciennesRoutines }) {
  const [vue, setVue] = useState(() => depart && SEANCES[depart] ? { v:"seance", sid:depart } : { v:"accueil" });
  useEffect(()=>{ if(depart&&departLu) departLu(); },[]);
  const [sportsOpen, setSportsOpen] = useState(false);
  const [pile, setPile] = useState([]);
  const [debut, setDebut] = useState(() => load("bougerDebut", null));
  const [fait, setFait] = useState(() => load("bougerFait", {}));       // { "2026-11-23": [{s,min,diff,en,res,note,nom}] }
  const [moves, setMoves] = useState(() => load("bougerMoves", {}));    // { "2026-11-24": "A" | "repos" }
  const [toast, setToast] = useState(null);
  useEffect(()=>{ save("bougerFait", fait); },[fait]);
  useEffect(()=>{ save("bougerMoves", moves); },[moves]);
  useEffect(()=>{ if(debut) save("bougerDebut", debut); },[debut]);
  useEffect(()=>{ try{ window.scrollTo(0,0); }catch(e){} },[vue]);
  useEffect(()=>{ if(!toast) return; const t=setTimeout(()=>setToast(null),3200); return ()=>clearTimeout(t); },[toast]);

  const aller = (v) => { setPile(p=>[...p,vue]); setVue(v); };
  const retour = () => { setPile(p=>{ if(!p.length){ setVue({v:"accueil"}); return p; } const q=[...p]; const prev=q.pop(); setVue(prev); return q; }); };
  const accueil = () => { setPile([]); setVue({v:"accueil"}); };

  const auj = new Date(); const aujK = dkey(auj);
  const lundi = lundiDe(auj);
  const semProg = debut ? Math.min(8, Math.max(1, Math.floor((lundi - lundiDe(new Date(debut+"T12:00:00")))/(7*86400000))+1)) : 1;
  const ph = phaseDe(semProg);
  const prevuLe = (d) => { const k=dkey(d); return moves[k] || SEMAINE_TYPE[(d.getDay()+6)%7]; };
  const faitLe = (k) => (fait[k]||[]);
  const semaine = Array.from({length:7},(_,i)=>{ const d=ajout(lundi,i); const k=dkey(d); return {i,d,k,sid:prevuLe(d),done:faitLe(k).length>0}; });
  const duJour = semaine.find(x=>x.k===aujK);
  const nbFaites = semaine.reduce((a,x)=>a+faitLe(x.k).length,0);
  const toutes = Object.entries(fait).flatMap(([k,arr])=>(arr||[]).map(x=>({...x,k}))).sort((a,b)=>a.k<b.k?1:-1);
  const pctProg = Math.round(((semProg-1)/8)*100 + (nbFaites/7)*(100/8));

  const demarrer = () => { if(!debut) setDebut(dkey(lundi)); };
  const enregistrer = (k, entree) => { setFait(f=>{ const arr=(f[k]||[]).filter(x=>entree.s==="libre"||x.s!==entree.s); return {...f,[k]:[...arr,{...entree,t:Date.now()}]}; }); };
  const defaire = (k) => setFait(f=>{ const n={...f}; delete n[k]; return n; });

  // ── petits composants ─────────────────────────────────────────────────────
  const carte = {background:C.white,border:`1px solid ${C.border}`,borderRadius:18,padding:"14px",marginBottom:12};
  const btn = {width:"100%",background:L,border:"none",borderRadius:14,padding:"13px",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer"};
  const btn2 = {width:"100%",background:"none",border:`1.5px solid ${C.border}`,borderRadius:14,padding:"12px",color:C.brown,fontFamily:"inherit",fontSize:12.5,fontWeight:600,cursor:"pointer"};
  const chip = (on)=>({padding:"8px 13px",borderRadius:99,border:`1.5px solid ${on?L:C.border}`,background:on?LB:C.white,color:on?L:C.brown,fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer"});
  const tag = (txt,ic)=>(<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10.5,fontWeight:600,color:C.mid,background:C.cream,border:`1px solid ${C.border}`,borderRadius:99,padding:"4px 10px"}}>{ic&&<Icon name={ic} size={12} color={L}/>}{txt}</span>);
  const Haut = ({titre}) => (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
      <button onClick={retour} aria-label="retour" style={{width:36,height:36,borderRadius:"50%",border:`1px solid ${C.border}`,background:C.white,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><Icon name="arrowL" size={17} color={C.brown}/></button>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",fontWeight:600,color:C.brown}}>{titre}</div>
    </div>
  );
  const titreDe = (sid) => SEANCES[sid] ? SEANCES[sid].titre+" – "+SEANCES[sid].sous : (LIBRES[sid]||{}).titre;
  const minDe = (sid) => { const m=dureeDe(sid,ph,energie); return m? m+" min" : (LIBRES[sid]||{}).min; };
  const Toast = () => toast ? (<div style={{position:"fixed",left:"50%",bottom:90,transform:"translateX(-50%)",background:C.brown,color:"#fff",borderRadius:14,padding:"11px 16px",fontSize:12,zIndex:400,maxWidth:340,textAlign:"center",boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>{toast}</div>) : null;

  // ══ ACCUEIL BOUGER ═════════════════════════════════════════════════════════
  if(vue.v==="accueil"){
    const sid = duJour ? duJour.sid : "repos";
    return (
    <div className="fu">
      <div style={{position:"relative",overflow:"hidden",background:`linear-gradient(135deg,#F6EFE8,${LB})`,borderRadius:22,padding:"20px 18px",marginBottom:14,minHeight:150}}>
        <div style={{position:"absolute",right:-14,bottom:-18,opacity:.25}}><Icon name="steps" size={130} color={L}/></div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"2rem",fontWeight:600,color:T,letterSpacing:1,lineHeight:1}}>BOUGER</div>
        <div style={{fontSize:13,color:C.brown,fontWeight:600,margin:"6px 0 8px"}}>Ton corps. Ton rythme. Ta progression.</div>
        <div style={{fontSize:11.5,color:C.mid,lineHeight:1.55,maxWidth:"80%"}}>un programme progressif et adaptable pour renforcer ton corps, gagner en énergie et prendre soin de toi.</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8,marginBottom:14}}>
        {[["calendar","Programme 8 semaines",()=>aller({v:"programme"})],["steps","Séances à la carte",()=>aller({v:"seances"})],["book","Bibliothèque d'exercices",()=>aller({v:"biblio"})],["chart","Mon évolution",()=>aller({v:"evolution"})]].map(([ic,l,go])=>(
          <button key={l} onClick={go} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"12px 4px",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:6,minWidth:0}}>
            <span style={{width:40,height:40,borderRadius:"50%",background:LB,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={ic} size={19} color={L}/></span>
            <span style={{fontSize:10.5,fontWeight:600,color:C.brown,textAlign:"center",lineHeight:1.2}}>{l}</span>
          </button>
        ))}
      </div>

      <div style={{fontSize:12,color:C.mid,marginBottom:8}}>Mon énergie aujourd'hui</div>
      <div style={{display:"flex",gap:7,marginBottom:6}}>
        {[["basse","Basse"],["moyenne","Moyenne"],["haute","Haute"]].map(([k,l])=>(<button key={k} onClick={()=>setEnergie(energie===k?null:k)} aria-pressed={energie===k} style={{...chip(energie===k),flex:1}}>{l}</button>))}
      </div>
      <div style={{fontSize:10.5,color:C.light,lineHeight:1.5,marginBottom:14}}>{energie==="basse"?"jour plus calme : tes séances passent en version courte, avec un tour de moins.":energie==="haute"?"belle énergie : tu peux tester la variante avancée d'un exercice.":"c'est la même énergie que sur ton accueil. elle ajuste la durée de tes séances."}</div>

      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",fontWeight:600,color:C.brown,marginBottom:8}}>Ta séance du jour</div>
      <button onClick={()=>{ demarrer(); SEANCES[sid]?aller({v:"seance",sid,k:aujK}):aller({v:"semaine",ph:ph.n}); }} style={{...carte,width:"100%",display:"flex",alignItems:"center",gap:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
        <div style={{width:64,height:64,flexShrink:0}}>{SEANCES[sid]?<ExImg id={SEANCES[sid].circuit[0].id} ExIllus={ExIllus} h={64} rond={14}/>:<div style={{width:64,height:64,borderRadius:14,background:LB,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={sid==="repos"?"moon":"smile"} size={26} color={L}/></div>}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:C.brown}}>{titreDe(sid)}</div>
          <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>{tag(minDe(sid),"calendar")}{duJour&&duJour.done&&tag("faite","check")}</div>
        </div>
        <span style={{width:36,height:36,borderRadius:"50%",background:L,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="arrowR" size={16} color="#fff"/></span>
      </button>

      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",fontWeight:600,color:C.brown,marginBottom:8}}>Mon programme en cours</div>
      <div style={carte}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{width:44,height:44,borderRadius:12,background:LB,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="calendar" size={20} color={L}/></span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:C.brown}}>{debut?"Semaine "+semProg+" sur 8":"Prête à commencer ?"}</div>
            <div style={{fontSize:11,color:C.mid}}>{ph.titre}</div>
          </div>
          <span style={{fontSize:11,color:C.mid}}>{debut?pctProg+" %":""}</span>
        </div>
        {debut&&<div style={{height:6,background:C.cream,borderRadius:99,marginTop:10,overflow:"hidden"}}><div style={{height:"100%",width:pctProg+"%",background:L,borderRadius:99}}/></div>}
        <div style={{fontSize:10.5,color:C.mid,marginTop:8}}>{nbFaites} activité{nbFaites>1?"s":""} cette semaine. chaque mouvement compte, même petit.</div>
      </div>
      <button onClick={()=>{ demarrer(); aller({v:"semaine",ph:ph.n}); }} style={{...btn,marginBottom:14}}>{debut?"Continuer mon parcours":"Commencer mon programme"} →</button>

      <div style={{...carte,padding:0,overflow:"hidden"}}>
        <button onClick={()=>setSportsOpen(o=>!o)} aria-expanded={sportsOpen} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",padding:"13px 14px",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
          <span style={{width:40,height:40,borderRadius:12,background:LB,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="leaf" size={18} color={L}/></span>
          <span style={{flex:1}}><span style={{display:"block",fontSize:13,fontWeight:700,color:C.brown}}>Bien bouger avec un SMOP</span><span style={{display:"block",fontSize:10.5,color:C.mid}}>quels sports privilégier, lesquels doser</span></span>
          <span style={{fontSize:15,color:C.light,transform:sportsOpen?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
        </button>
        {sportsOpen&&(
        <div style={{padding:"0 14px 14px"}}>
          <div style={{fontSize:11,color:C.mid,lineHeight:1.6,marginBottom:12}}>on te dit « fais du sport », jamais lequel ni comment. avec un SMOP, ce n'est pas l'intensité qui compte, c'est le bon dosage pour ton terrain.</div>
          {[
            {coul:"#7A9A5A",bg:"#EFF3E8",tag:"à privilégier",items:[
              {n:"Le renforcement musculaire doux",d:"le muscle est un grand consommateur de sucre : plus tu en as, mieux ton corps gère sa glycémie. c'est le levier n°1 pour l'insuline."},
              {n:"La marche, surtout après les repas",d:"10-15 min après manger lissent le pic de glycémie. simple, gratuit, redoutable."},
              {n:"Le yoga, le pilates, les étirements",d:"ils apaisent le système nerveux et le cortisol — précieux quand ton SMOP réagit au stress."},
            ]},
            {coul:"#D4A56A",bg:"#FBF3E8",tag:"à doser, à l'écoute",items:[
              {n:"Le cardio intense / HIIT",d:"pas interdit, mais à manier avec prudence : poussé trop fort quand tu es déjà fatiguée ou stressée, il peut faire grimper le cortisol et aller contre toi. en forme et ça te fait du bien ? vas-y. épuisée ? allège."},
            ]},
          ].map((cat,i)=>(
            <div key={i} style={{marginBottom:i===0?12:0}}>
              <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:cat.coul,fontWeight:700,marginBottom:7}}>{cat.tag}</div>
              {cat.items.map((it,j)=>(
                <div key={j} style={{background:cat.bg,borderRadius:11,padding:"10px 12px",marginBottom:7,borderLeft:`3px solid ${cat.coul}`}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.brown,marginBottom:2}}>{it.n}</div>
                  <div style={{fontSize:10.5,color:C.mid,lineHeight:1.5}}>{it.d}</div>
                </div>
              ))}
            </div>
          ))}
          <div style={{background:`${L}10`,borderRadius:11,padding:"10px 12px",marginTop:4}}>
            <div style={{fontSize:10.5,color:C.brown,lineHeight:1.6}}><strong>la règle d'or :</strong> régularité douce &gt; intensité. 20 min la plupart des jours valent mieux qu'une séance qui te met à terre une fois par semaine. tu construis dans la durée, pas dans la performance.</div>
          </div>
        </div>)}
      </div>

      <div style={{fontSize:10.5,color:C.mid,lineHeight:1.55,background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"11px 13px",marginBottom:10}}>
        <strong style={{color:C.brown}}>avant de commencer :</strong> si tu es enceinte, en post-partum, blessée, si tu as une douleur qui dure ou une restriction médicale, demande l'avis d'un professionnel de santé. pendant les séances, la douleur n'est jamais un objectif : adapte ou arrête.
      </div>
      <button onClick={()=>anciennesRoutines?anciennesRoutines():setTab("mouvement")} style={{background:"none",border:"none",padding:"4px 0",color:L,fontFamily:"inherit",fontSize:11.5,fontWeight:700,cursor:"pointer"}}>retrouver mes anciennes routines →</button>
      <Toast/>
    </div>);
  }

  // ══ PROGRAMME 8 SEMAINES ═══════════════════════════════════════════════════
  if(vue.v==="programme"){
    return (
    <div className="fu">
      <Haut titre="Mon programme"/>
      <div style={{...carte,background:`linear-gradient(135deg,#F6EFE8,${LB})`,border:"none",display:"flex",gap:12,alignItems:"center"}}>
        <span style={{width:50,height:50,borderRadius:"50%",background:C.white,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="sparkle" size={22} color={T}/></span>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.15rem",fontWeight:600,color:C.brown}}>Programme SMOP · 8 semaines</div>
          <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>installer des bases solides, progresser et bouger durablement. tout est consultable, rien n'est verrouillé.</div>
        </div>
      </div>
      {PHASES.map(p=>{ const enCours=p.n===ph.n; const passe=p.n<ph.n;
        return (
        <button key={p.n} onClick={()=>aller({v:"semaine",ph:p.n})} style={{...carte,width:"100%",display:"flex",alignItems:"center",gap:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",border:`1.5px solid ${enCours?L:C.border}`}}>
          <div style={{width:64,height:64,flexShrink:0}}><ExImg id={["hanches","squatChaise","pasLateraux","fenteAppui"][p.n-1]} ExIllus={ExIllus} h={64} rond={14}/></div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:C.brown}}>Semaines {p.sem}</div>
            <div style={{fontSize:11.5,color:C.mid}}>{p.titre}</div>
            <div style={{marginTop:5}}>{enCours?tag("en cours","check"):passe?tag("parcourue"):tag("à venir")}</div>
          </div>
          <span style={{fontSize:16,color:C.light}}>›</span>
        </button>); })}
      <Toast/>
    </div>);
  }

  // ══ SEMAINE (planning + détails de la phase) ═══════════════════════════════
  if(vue.v==="semaine"){
    const p = PHASES[(vue.ph||ph.n)-1];
    const actuelle = p.n===ph.n;
    const onglet = vue.onglet||"planning";
    const choix = vue.choix; // jour sélectionné pour les actions
    const lignes = actuelle ? semaine : SEMAINE_TYPE.map((sid,i)=>({i,sid,k:null,done:false}));
    return (
    <div className="fu">
      <Haut titre={"Semaines "+p.sem}/>
      <div style={{display:"flex",background:C.white,border:`1px solid ${C.border}`,borderRadius:99,padding:3,marginBottom:12}}>
        {[["planning","Mon planning"],["details","Détails de la phase"]].map(([k,l])=>(<button key={k} onClick={()=>setVue({...vue,onglet:k,choix:null})} style={{flex:1,background:onglet===k?L:"none",color:onglet===k?"#fff":C.mid,border:"none",borderRadius:99,padding:"9px",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer"}}>{l}</button>))}
      </div>
      {onglet==="details"?(
        <div style={carte}>
          <div style={{fontSize:13,fontWeight:700,color:C.brown,marginBottom:6}}>{p.titre}</div>
          <div style={{fontSize:11.5,color:C.mid,lineHeight:1.6,marginBottom:10}}>{p.texte}</div>
          {[["tours de circuit",p.tours],["répétitions",p.reps],["tenue (gainage)",p.tenue+" s"],["pause entre deux tours",p.repos+" s"],["séance de renforcement","environ "+p.renfoMin+" min"]].map(([a,b])=>(<div key={a} style={{display:"flex",justifyContent:"space-between",fontSize:11.5,padding:"7px 0",borderTop:`1px solid ${C.border}`}}><span style={{color:C.mid}}>{a}</span><strong style={{color:C.brown}}>{b}</strong></div>))}
          <div style={{fontSize:10.5,color:C.light,marginTop:10,lineHeight:1.5}}>la semaine type : 2 séances de renforcement, une marche, une mobilité, un cardio doux, une activité plaisir et un jour de repos. tu peux tout déplacer.</div>
        </div>
      ):(<>
        {!actuelle&&<div style={{fontSize:11,color:C.mid,background:LB,borderRadius:12,padding:"9px 12px",marginBottom:10,lineHeight:1.5}}>{p.n>ph.n?"un aperçu de ce qui t'attend. tu peux ouvrir les séances pour les découvrir.":"une phase déjà parcourue. tu peux refaire ses séances quand tu veux."}</div>}
        <div style={{...carte,padding:"6px 12px"}}>
          <div style={{fontSize:12.5,fontWeight:700,color:C.brown,padding:"8px 0"}}>{actuelle?"Semaine "+semProg+" · "+p.titre:p.titre}</div>
          {lignes.map(x=>{ const sel=choix===x.i;
            return (
            <div key={x.i} style={{borderTop:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0"}}>
                <span style={{width:40,textAlign:"center",fontSize:11,fontWeight:700,color:x.k===aujK?"#fff":L,background:x.k===aujK?L:LB,borderRadius:10,padding:"6px 0",flexShrink:0}}>{JOURS[x.i]}</span>
                <button onClick={()=>SEANCES[x.sid]?aller({v:"seance",sid:x.sid,k:x.k,ph:p.n}):actuelle&&setVue({...vue,choix:sel?null:x.i})} style={{flex:1,minWidth:0,background:"none",border:"none",padding:0,textAlign:"left",cursor:"pointer",fontFamily:"inherit"}}>
                  <div style={{fontSize:12.5,fontWeight:600,color:C.brown}}>{titreDe(x.sid)}</div>
                  <div style={{fontSize:10.5,color:C.mid}}>{SEANCES[x.sid]?(dureeDe(x.sid,p,energie)+" min"):(LIBRES[x.sid]||{}).sous}</div>
                </button>
                {actuelle&&<button onClick={()=>setVue({...vue,choix:sel?null:x.i})} aria-label="options" style={{background:"none",border:"none",color:C.light,fontSize:18,cursor:"pointer",padding:"0 4px",fontFamily:"inherit"}}>⋯</button>}
                {actuelle&&<button onClick={()=>{ if(x.done) defaire(x.k); else { enregistrer(x.k,{s:x.sid,min:dureeDe(x.sid,p,energie)||20}); setToast("c'est noté. bravo d'avoir pris ce temps pour toi."); } }} aria-label={x.done?"marquer comme non faite":"marquer comme faite"} aria-pressed={x.done}
                  style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${x.done?L:C.border}`,background:x.done?L:"transparent",color:"#fff",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>{x.done&&<Icon name="check" size={14} color="#fff" stroke={2.4}/>}</button>}
              </div>
              {sel&&actuelle&&(
                <div style={{background:C.cream,borderRadius:12,padding:"10px",marginBottom:10}}>
                  <div style={{fontSize:11,color:C.mid,marginBottom:7}}>déplacer à :</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                    {semaine.filter(y=>y.i!==x.i).map(y=>(<button key={y.i} onClick={()=>{ setMoves(m=>({...m,[y.k]:x.sid,[x.k]:y.sid})); setVue({...vue,choix:null}); setToast(titreDe(x.sid)+" déplacée à "+JOURS[y.i].toLowerCase()+"."); }} style={{...chip(false),padding:"6px 10px",fontSize:11}}>{JOURS[y.i]}</button>))}
                  </div>
                  <div style={{fontSize:11,color:C.mid,marginBottom:7}}>remplacer par :</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {["A","B","gainage","marche","mobilite","cardio","plaisir","repos"].filter(s=>s!==x.sid).map(s=>(<button key={s} onClick={()=>{ setMoves(m=>({...m,[x.k]:s})); setVue({...vue,choix:null}); }} style={{...chip(false),padding:"6px 10px",fontSize:11}}>{SEANCES[s]?SEANCES[s].titre:LIBRES[s].titre}</button>))}
                  </div>
                </div>
              )}
            </div>); })}
        </div>
        {actuelle&&<button onClick={()=>aller({v:"libre"})} style={{...btn2,marginBottom:10}}>+ ajouter une activité libre</button>}
        {actuelle&&Object.keys(moves).length>0&&<button onClick={()=>{ const n={...moves}; semaine.forEach(y=>delete n[y.k]); setMoves(n); }} style={{background:"none",border:"none",color:C.light,fontFamily:"inherit",fontSize:11,cursor:"pointer",textDecoration:"underline",display:"block",margin:"0 auto 10px"}}>revenir à la semaine type</button>}
      </>)}
      <Toast/>
    </div>);
  }

  // ══ ACTIVITÉ LIBRE ═════════════════════════════════════════════════════════
  if(vue.v==="libre"){
    const nom=vue.nom||""; const min=vue.min||20;
    return (
    <div className="fu">
      <Haut titre="Activité libre"/>
      <div style={carte}>
        <div style={{fontSize:12,color:C.mid,marginBottom:8}}>qu'as-tu fait ?</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {["Marche","Danse","Vélo","Natation","Yoga","Jardinage","Ménage actif"].map(n=>(<button key={n} onClick={()=>setVue({...vue,nom:n})} style={chip(nom===n)}>{n}</button>))}
        </div>
        <input value={nom} onChange={e=>setVue({...vue,nom:e.target.value})} placeholder="ou écris-la ici" style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",fontFamily:"inherit",fontSize:12.5,color:C.brown,background:C.white,boxSizing:"border-box",marginBottom:12}}/>
        <div style={{fontSize:12,color:C.mid,marginBottom:8}}>combien de temps ?</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[10,20,30,45,60].map(m=>(<button key={m} onClick={()=>setVue({...vue,min:m})} style={chip(min===m)}>{m} min</button>))}</div>
      </div>
      <button disabled={!nom.trim()} onClick={()=>{ enregistrer(aujK,{s:"libre",nom:nom.trim(),min}); setToast("c'est noté : "+nom.trim()+", "+min+" min."); retour(); }} style={{...btn,opacity:nom.trim()?1:.5}}>enregistrer</button>
      <Toast/>
    </div>);
  }

  // ══ SÉANCES À LA CARTE ═════════════════════════════════════════════════════
  if(vue.v==="seances"){
    return (
    <div className="fu">
      <Haut titre="Séances à la carte"/>
      <div style={{fontSize:11.5,color:C.mid,lineHeight:1.55,marginBottom:12}}>envie de bouger en dehors de ton planning ? choisis une séance, elle s'adapte à ta phase et à ton énergie.</div>
      {Object.entries(SEANCES).map(([sid,s])=>(
        <button key={sid} onClick={()=>aller({v:"seance",sid,k:aujK})} style={{...carte,width:"100%",display:"flex",alignItems:"center",gap:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
          <div style={{width:58,height:58,flexShrink:0}}><ExImg id={s.circuit[0].id} ExIllus={ExIllus} h={58} rond={14}/></div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:C.brown}}>{s.titre}</div>
            <div style={{fontSize:11,color:C.mid}}>{s.sous} · {dureeDe(sid,ph,energie)} min</div>
          </div>
          <span style={{fontSize:16,color:C.light}}>›</span>
        </button>))}
      <Toast/>
    </div>);
  }

  // ══ DÉTAIL D'UNE SÉANCE ════════════════════════════════════════════════════
  if(vue.v==="seance"){
    const s = SEANCES[vue.sid]; const p = PHASES[(vue.ph||ph.n)-1];
    const tours = toursDe(vue.sid,p,energie);
    const ouvert = vue.ouvert;
    const bloc = (cle,titre,ic,items,sousTitre) => items.length ? (
      <div key={cle} style={{borderTop:`1px solid ${C.border}`}}>
        <button onClick={()=>setVue({...vue,ouvert:ouvert===cle?null:cle})} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",padding:"12px 0",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
          <span style={{width:38,height:38,borderRadius:12,background:LB,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name={ic} size={18} color={L}/></span>
          <span style={{flex:1}}><span style={{display:"block",fontSize:13,fontWeight:700,color:C.brown}}>{titre}</span><span style={{display:"block",fontSize:10.5,color:C.mid}}>{sousTitre}</span></span>
          <span style={{fontSize:15,color:C.light,transform:ouvert===cle?"rotate(90deg)":"none"}}>›</span>
        </button>
        {ouvert===cle&&items.map((it,i)=>(
          <button key={i} onClick={()=>aller({v:"exo",id:it.id,ph:p.n})} style={{width:"100%",display:"flex",alignItems:"center",gap:10,background:C.cream,border:"none",borderRadius:12,padding:"8px 10px",marginBottom:6,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
            <div style={{width:40,height:40,flexShrink:0}}><ExImg id={it.id} ExIllus={ExIllus} h={40} rond={10}/></div>
            <span style={{flex:1,fontSize:12,color:C.brown}}>{EXOS[it.id].nom}</span>
            <span style={{fontSize:10.5,color:C.mid}}>{consigne(it,p)}</span>
          </button>))}
      </div>) : null;
    const minBloc = (items)=>Math.max(1,Math.round(items.reduce((a,it)=>a+(it.s||45),0)/60));
    return (
    <div className="fu">
      <Haut titre="Ta séance"/>
      <ExImg id={s.circuit[0].id} ExIllus={ExIllus} h={190}/>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.35rem",fontWeight:600,color:C.brown,margin:"12px 0 8px"}}>{s.titre} – {s.sous}</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{tag(dureeDe(vue.sid,p,energie)+" min","calendar")}{tag("phase "+p.n+" · "+p.titre.toLowerCase())}{tag(s.materiel==="aucun"?"sans matériel":s.materiel)}</div>
      <div style={{fontSize:11.5,color:C.mid,lineHeight:1.55,marginBottom:10}}>{s.intro}</div>
      {energie==="basse"&&tours>0&&s.type!=="mobilite"&&s.type!=="marche"&&<div style={{fontSize:11,color:C.brown,background:LB,borderRadius:12,padding:"9px 12px",marginBottom:10,lineHeight:1.5}}>énergie basse : version courte, avec un tour de moins. si même ça c'est trop, la mobilité est là pour toi.</div>}
      <div style={{...carte,padding:"0 14px"}}>
        {bloc("e","Échauffement","sparkle",s.echauf,minBloc(s.echauf)+" min")}
        {bloc("c",s.type==="marche"?"Marche":s.type==="mobilite"?"Enchaînement":"Circuit ("+tours+" tour"+(tours>1?"s":"")+")","heart",s.circuit,s.type==="marche"?(dureeDe(vue.sid,p,energie)+" min"):(s.circuit.length+" exercices"))}
        {bloc("r","Retour au calme","leaf",s.calme,minBloc(s.calme)+" min")}
      </div>
      <button onClick={()=>{ demarrer(); aller({v:"guide",sid:vue.sid,k:vue.k||aujK,ph:p.n,i:0}); }} style={btn}>Commencer la séance →</button>
      <Toast/>
    </div>);
  }

  // ══ FICHE EXERCICE ═════════════════════════════════════════════════════════
  if(vue.v==="exo"){
    const ex = EXOS[vue.id]; const p = PHASES[(vue.ph||ph.n)-1]; const onglet=vue.onglet||"comment";
    const liste = (titre,arr)=>(<div style={{marginBottom:12}}><div style={{fontSize:12,fontWeight:700,color:C.brown,marginBottom:5}}>{titre}</div>{arr.map((a,i)=>(<div key={i} style={{fontSize:11.5,color:C.mid,lineHeight:1.55,paddingLeft:12,position:"relative",marginBottom:3}}><span style={{position:"absolute",left:0,color:T}}>·</span>{a}</div>))}</div>);
    const repsTxt = ex.cat==="renfo" ? (["gainageMur"].includes(vue.id) ? p.tours+" × "+p.tenue+" secondes" : p.tours+" séries de "+p.reps+" répétitions"+(ex.cote?" par côté":"")) : "30 à 60 secondes, à ton rythme";
    return (
    <div className="fu">
      <Haut titre="Exercice"/>
      <ExImg id={vue.id} ExIllus={ExIllus} h={210}/>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.35rem",fontWeight:600,color:C.brown,margin:"12px 0 8px"}}>{ex.nom}</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{tag(ex.zone)}{tag(ex.niveau)}{tag(ex.materiel==="aucun"?"sans matériel":ex.materiel)}</div>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:12}}>
        {[["comment","Comment faire ?"],["bienfaits","Bienfaits"],["variantes","Variantes"]].map(([k,l])=>(<button key={k} onClick={()=>setVue({...vue,onglet:k})} style={{flex:1,background:"none",border:"none",borderBottom:`2.5px solid ${onglet===k?T:"transparent"}`,padding:"9px 0",color:onglet===k?C.brown:C.light,fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>))}
      </div>
      {onglet==="comment"&&(<>
        {ex.etapes.map((e,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:10}}><span style={{width:24,height:24,borderRadius:"50%",background:LB,color:L,fontSize:11.5,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span><span style={{fontSize:12,color:C.brown,lineHeight:1.55}}>{e}</span></div>))}
        <div style={{...carte,display:"flex",gap:10,alignItems:"center",marginTop:4}}><Icon name="pulse" size={18} color={L}/><div><div style={{fontSize:12,fontWeight:700,color:C.brown}}>Séries & répétitions</div><div style={{fontSize:11.5,color:C.mid}}>{repsTxt}</div></div></div>
        <div style={{...carte,display:"flex",gap:10,alignItems:"center"}}><Icon name="drop" size={18} color={L}/><div><div style={{fontSize:12,fontWeight:700,color:C.brown}}>Respiration</div><div style={{fontSize:11.5,color:C.mid}}>{ex.respiration}</div></div></div>
      </>)}
      {onglet==="bienfaits"&&(<div style={carte}>
        <div style={{fontSize:12,fontWeight:700,color:C.brown,marginBottom:4}}>À quoi ça sert</div>
        <div style={{fontSize:11.5,color:C.mid,lineHeight:1.6,marginBottom:10}}>{ex.bienfaits}</div>
        <div style={{fontSize:12,fontWeight:700,color:C.brown,marginBottom:4}}>Muscles sollicités</div>
        <div style={{fontSize:11.5,color:C.mid,lineHeight:1.6}}>{ex.muscles}</div>
      </div>)}
      {onglet==="variantes"&&(<div style={carte}>
        <div style={{fontSize:12,fontWeight:700,color:C.brown,marginBottom:4}}>Plus facile</div>
        <div style={{fontSize:11.5,color:C.mid,lineHeight:1.6,marginBottom:10}}>{ex.facile}</div>
        <div style={{fontSize:12,fontWeight:700,color:C.brown,marginBottom:4}}>Plus avancée</div>
        <div style={{fontSize:11.5,color:C.mid,lineHeight:1.6,marginBottom:12}}>{ex.avance}</div>
        {liste("Erreurs fréquentes",ex.erreurs)}
        <div style={{fontSize:11,color:C.brown,background:C.cream,borderRadius:10,padding:"9px 11px",lineHeight:1.5}}><strong>précaution :</strong> {ex.precautions}</div>
      </div>)}
      <Toast/>
    </div>);
  }

  // ══ BIBLIOTHÈQUE ═══════════════════════════════════════════════════════════
  if(vue.v==="biblio"){
    return (
    <div className="fu">
      <Haut titre="Bibliothèque d'exercices"/>
      {CATS.map(([c,l])=>(
        <div key={c} style={{marginBottom:14}}>
          <div style={{fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:L,fontWeight:700,marginBottom:8}}>{l}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}}>
            {Object.entries(EXOS).filter(([,e])=>e.cat===c).map(([id,e])=>(
              <button key={id} onClick={()=>aller({v:"exo",id})} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:8,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                <ExImg id={id} ExIllus={ExIllus} h={90} rond={12}/>
                <div style={{fontSize:11.5,fontWeight:600,color:C.brown,marginTop:6,lineHeight:1.3}}>{e.nom}</div>
                <div style={{fontSize:10,color:C.mid}}>{e.zone}</div>
              </button>))}
          </div>
        </div>))}
      <Toast/>
    </div>);
  }

  // ══ MON ÉVOLUTION ══════════════════════════════════════════════════════════
  if(vue.v==="evolution"){
    const semMin = semaine.reduce((a,x)=>a+faitLe(x.k).reduce((b,y)=>b+(y.min||0),0),0);
    const totMin = toutes.reduce((a,x)=>a+(x.min||0),0);
    const nbRenfo = toutes.filter(x=>x.s==="A"||x.s==="B").length;
    const victoires = [
      toutes.length>=1&&"ta première activité enregistrée",
      toutes.length>=5&&"5 activités : l'habitude s'installe",
      nbRenfo>=4&&"4 séances de renforcement réalisées",
      totMin>=120&&"plus de 2 heures de mouvement au total",
      toutes.some(x=>x.s==="libre")&&"tu as bougé aussi en dehors du programme",
      toutes.some(x=>x.en==="haute")&&"tu as fini une séance pleine d'énergie",
    ].filter(Boolean);
    const ressentis = toutes.flatMap(x=>x.res||[]); const compte = {}; ressentis.forEach(r=>compte[r]=(compte[r]||0)+1);
    return (
    <div className="fu">
      <Haut titre="Mon évolution"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8,marginBottom:12}}>
        {[["cette semaine",nbFaites+" activité"+(nbFaites>1?"s":""),"calendar"],["mouvement",semMin+" min","pulse"],["depuis le début",toutes.length+" au total","chart"]].map(([a,b,ic])=>(
          <div key={a} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"12px 6px",textAlign:"center"}}>
            <Icon name={ic} size={18} color={L}/><div style={{fontSize:10,color:C.mid,margin:"4px 0 2px"}}>{a}</div><div style={{fontSize:13.5,fontWeight:700,color:C.brown}}>{b}</div>
          </div>))}
      </div>
      <div style={carte}>
        <div style={{fontSize:12.5,fontWeight:700,color:C.brown,marginBottom:8}}>Mes petites victoires</div>
        {victoires.length?victoires.map(v=>(<div key={v} style={{display:"flex",gap:8,alignItems:"center",fontSize:11.5,color:C.mid,marginBottom:6}}><Icon name="sparkle" size={14} color={T}/>{v}</div>)):<div style={{fontSize:11.5,color:C.mid}}>elles apparaîtront ici dès ta première séance.</div>}
      </div>
      {Object.keys(compte).length>0&&<div style={carte}>
        <div style={{fontSize:12.5,fontWeight:700,color:C.brown,marginBottom:8}}>Comment je me sens après</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{Object.entries(compte).sort((a,b)=>b[1]-a[1]).map(([r,n])=>(<span key={r} style={{fontSize:11,color:L,background:LB,borderRadius:99,padding:"6px 11px"}}>{r} · {n}</span>))}</div>
      </div>}
      <div style={carte}>
        <div style={{fontSize:12.5,fontWeight:700,color:C.brown,marginBottom:6}}>Historique</div>
        {toutes.length?toutes.slice(0,15).map((x,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",gap:8,fontSize:11.5,padding:"8px 0",borderTop:i?`1px solid ${C.border}`:"none"}}>
          <span style={{color:C.brown}}>{x.s==="libre"?x.nom:(SEANCES[x.s]?SEANCES[x.s].titre:(LIBRES[x.s]||{}).titre)}{x.note?<span style={{display:"block",fontSize:10.5,color:C.light,fontStyle:"italic"}}>{x.note}</span>:null}</span>
          <span style={{color:C.mid,flexShrink:0}}>{new Date(x.k+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} · {x.min||"–"} min</span>
        </div>)):<div style={{fontSize:11.5,color:C.mid}}>ton historique apparaîtra ici.</div>}
      </div>
      <div style={{fontSize:10.5,color:C.light,textAlign:"center",lineHeight:1.5}}>pas de classement, pas de série à tenir. juste ce que tu as fait pour toi.</div>
      <Toast/>
    </div>);
  }

  // ══ SÉANCE GUIDÉE ══════════════════════════════════════════════════════════
  if(vue.v==="guide") return <Guide C={C} Icon={Icon} ExIllus={ExIllus} vue={vue} energie={energie} retour={retour}
      onFin={(entree)=>{ enregistrer(vue.k||aujK,entree); setToast("séance enregistrée. bravo d'avoir pris ce temps pour toi."); accueil(); }}/>;

  return null;
}

// consigne courte d'un item selon la phase
function consigne(it, p){
  const ex = EXOS[it.id]||{};
  if(it.s) return it.s>=120 ? Math.round(it.s/60)+" min" : it.s+" s";
  if(it.id==="gainageMur") return p.tenue+" s";
  return p.reps+(ex.cote?" / côté":"");
}

// ─── LECTEUR DE SÉANCE ──────────────────────────────────────────────────────
function Guide({ C, Icon, ExIllus, vue, energie, retour, onFin }){
  const s = SEANCES[vue.sid]; const p = PHASES[(vue.ph||1)-1];
  const tours = toursDe(vue.sid,p,energie);
  const etapes = useRef(null);
  if(!etapes.current){
    const e=[]; s.echauf.forEach(it=>e.push({...it,bloc:"Échauffement"}));
    for(let t=1;t<=tours;t++){ s.circuit.forEach(it=>e.push({...it,bloc:tours>1?"Tour "+t+" sur "+tours:(s.type==="marche"?"Marche":"Enchaînement")})); if(t<tours) e.push({pause:true,s:p.repos,bloc:"Pause"}); }
    s.calme.forEach(it=>e.push({...it,bloc:"Retour au calme"}));
    etapes.current=e;
  }
  const E = etapes.current;
  const [i, setI] = useState(0);
  const [fin, setFin] = useState(false);
  const [reste, setReste] = useState(null);
  const [marche, setMarche] = useState(false);
  const [aide, setAide] = useState(false);
  const [bilan, setBilan] = useState({});
  const t0 = useRef(Date.now());
  const cur = E[i]||{}; const ex = cur.pause?null:EXOS[cur.id];
  const duree = cur.s || (cur.id==="gainageMur"?p.tenue:null);

  useEffect(()=>{ setReste(duree||null); setMarche(false); setAide(false); try{ window.scrollTo(0,0); }catch(e){} },[i]);
  useEffect(()=>{ if(!marche) return; const t=setInterval(()=>setReste(r=>{ if(r<=1){ clearInterval(t); setMarche(false); try{ navigator.vibrate&&navigator.vibrate(200); }catch(e){} return 0; } return r-1; }),1000); return ()=>clearInterval(t); },[marche]);

  const L2="#8E80A3", LB2="#EEE9F4";
  const btnRond = {flex:1,background:C.white,border:`1.5px solid ${C.border}`,borderRadius:14,padding:"12px 6px",color:C.brown,fontFamily:"inherit",fontSize:12.5,fontWeight:700,cursor:"pointer"};
  const chip = (on)=>({padding:"8px 12px",borderRadius:99,border:`1.5px solid ${on?L2:C.border}`,background:on?LB2:C.white,color:on?L2:C.brown,fontFamily:"inherit",fontSize:11.5,fontWeight:600,cursor:"pointer"});
  const fmt = (n)=>Math.floor(n/60)+":"+String(n%60).padStart(2,"0");

  if(fin){
    const min = dureeDe(vue.sid,p,energie) || Math.max(1,Math.round((Date.now()-t0.current)/60000));
    const tog = (r)=>setBilan(b=>{ const a=b.res||[]; return {...b,res:a.includes(r)?a.filter(x=>x!==r):[...a,r]}; });
    return (
    <div className="fu">
      <div style={{textAlign:"center",padding:"10px 0 14px"}}>
        <div style={{width:60,height:60,borderRadius:"50%",background:LB2,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}><Icon name="sparkle" size={26} color={L2}/></div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",fontWeight:600,color:C.brown}}>Séance terminée</div>
        <div style={{fontSize:12,color:C.mid,marginTop:4}}>tu as pris ce temps pour toi. c'est ça qui compte.</div>
      </div>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:18,padding:14,marginBottom:12}}>
        <div style={{fontSize:11,color:C.light,marginBottom:10}}>petit bilan, facultatif</div>
        <div style={{fontSize:12,fontWeight:700,color:C.brown,marginBottom:7}}>c'était comment ?</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{["facile","ça allait","difficile"].map(d=>(<button key={d} onClick={()=>setBilan(b=>({...b,diff:b.diff===d?null:d}))} style={chip(bilan.diff===d)}>{d}</button>))}</div>
        <div style={{fontSize:12,fontWeight:700,color:C.brown,marginBottom:7}}>ton énergie maintenant</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{[["basse","basse"],["moyenne","moyenne"],["haute","haute"]].map(([k,l])=>(<button key={k} onClick={()=>setBilan(b=>({...b,en:b.en===k?null:k}))} style={chip(bilan.en===k)}>{l}</button>))}</div>
        <div style={{fontSize:12,fontWeight:700,color:C.brown,marginBottom:7}}>comment je me sens</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{["plus d'énergie","moins de tensions","meilleure humeur","plus de force","fatiguée mais fière"].map(r=>(<button key={r} onClick={()=>tog(r)} style={chip((bilan.res||[]).includes(r))}>{r}</button>))}</div>
        <textarea value={bilan.note||""} onChange={e=>setBilan(b=>({...b,note:e.target.value}))} rows={2} placeholder="un mot pour toi (facultatif)" style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 10px",fontFamily:"inherit",fontSize:12,color:C.brown,background:C.white,boxSizing:"border-box",resize:"vertical"}}/>
      </div>
      <button onClick={()=>onFin({s:vue.sid,min,...bilan})} style={{width:"100%",background:L2,border:"none",borderRadius:14,padding:"13px",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:8}}>enregistrer ma séance</button>
      <button onClick={()=>onFin({s:vue.sid,min})} style={{width:"100%",background:"none",border:"none",color:C.light,fontFamily:"inherit",fontSize:11.5,cursor:"pointer",textDecoration:"underline"}}>enregistrer sans bilan</button>
    </div>);
  }

  return (
  <div className="fu">
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
      <button onClick={retour} aria-label="quitter la séance" style={{width:36,height:36,borderRadius:"50%",border:`1px solid ${C.border}`,background:C.white,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><Icon name="arrowL" size={17} color={C.brown}/></button>
      <div style={{flex:1}}>
        <div style={{fontSize:10,letterSpacing:1.3,textTransform:"uppercase",color:L2,fontWeight:700}}>{cur.bloc}</div>
        <div style={{height:5,background:C.white,borderRadius:99,marginTop:5,overflow:"hidden"}}><div style={{height:"100%",width:((i+1)/E.length*100)+"%",background:L2,borderRadius:99,transition:"width .3s"}}/></div>
      </div>
      <span style={{fontSize:11,color:C.mid}}>{i+1} / {E.length}</span>
      <button onClick={()=>setFin(true)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:99,padding:"6px 11px",color:C.brown,fontFamily:"inherit",fontSize:11,fontWeight:700,cursor:"pointer"}}>Terminer</button>
    </div>

    {cur.pause?(
      <div style={{textAlign:"center",background:LB2,borderRadius:20,padding:"34px 16px",marginBottom:12}}>
        <Icon name="leaf" size={34} color={L2}/>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",fontWeight:600,color:C.brown,margin:"8px 0 4px"}}>Pause, souffle</div>
        <div style={{fontSize:12,color:C.mid}}>bois une gorgée d'eau. le prochain tour arrive.</div>
      </div>
    ):(
      <ExImg id={cur.id} ExIllus={ExIllus} h={220}/>
    )}

    {ex&&<div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",fontWeight:600,color:C.brown,margin:"12px 0 6px"}}>{ex.nom}</div>}

    {duree?(
      <div style={{textAlign:"center",background:C.white,border:`1px solid ${C.border}`,borderRadius:18,padding:"14px",marginBottom:12}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"2.6rem",fontWeight:600,color:reste===0?T:C.brown,lineHeight:1}}>{fmt(reste==null?duree:reste)}</div>
        <div style={{fontSize:11,color:C.mid,marginTop:4}}>{reste===0?"c'est fait. passe à la suite quand tu es prête.":cur.id==="gainageMur"?"tiens la position, "+p.tours+" fois au total":"à ton rythme"}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:10}}>
          <button onClick={()=>{ if(reste===0) setReste(duree); setMarche(m=>!m); }} style={{background:L2,border:"none",borderRadius:99,padding:"9px 20px",color:"#fff",fontFamily:"inherit",fontSize:12.5,fontWeight:700,cursor:"pointer"}}>{marche?"Pause":reste===0?"Recommencer":reste===duree||reste==null?"Démarrer":"Reprendre"}</button>
        </div>
      </div>
    ):ex&&(
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:18,padding:"12px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
        <Icon name="pulse" size={18} color={L2}/>
        <div><div style={{fontSize:15,fontWeight:700,color:C.brown}}>{p.reps} répétitions{ex.cote?" par côté":""}</div><div style={{fontSize:10.5,color:C.mid}}>lentement, en contrôlant le mouvement</div></div>
      </div>
    )}

    {ex&&(<>
      {ex.etapes.map((e,k)=>(<div key={k} style={{display:"flex",gap:9,marginBottom:8}}><span style={{width:22,height:22,borderRadius:"50%",background:LB2,color:L2,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{k+1}</span><span style={{fontSize:12,color:C.brown,lineHeight:1.5}}>{e}</span></div>))}
      <div style={{fontSize:11,color:C.mid,margin:"4px 0 8px"}}><strong style={{color:C.brown}}>respiration :</strong> {ex.respiration}</div>
      <button onClick={()=>setAide(a=>!a)} style={{background:"none",border:"none",padding:0,color:L2,fontFamily:"inherit",fontSize:11.5,fontWeight:700,cursor:"pointer",marginBottom:aide?8:12}}>{aide?"masquer":"trop difficile ? voir la version facile"}</button>
      {aide&&<div style={{fontSize:11.5,color:C.brown,background:LB2,borderRadius:12,padding:"10px 12px",marginBottom:12,lineHeight:1.55}}><strong>version facile :</strong> {ex.facile}<br/><span style={{color:C.mid}}>{ex.precautions}</span></div>}
    </>)}

    <div style={{display:"flex",gap:8,position:"sticky",bottom:76,background:C.cream,paddingTop:6}}>
      <button onClick={()=>setI(k=>Math.max(0,k-1))} disabled={i===0} style={{...btnRond,opacity:i===0?.45:1}}>‹ Précédent</button>
      {i<E.length-1
        ? <button onClick={()=>setI(k=>k+1)} style={{...btnRond,background:L2,border:"none",color:"#fff"}}>Suivant ›</button>
        : <button onClick={()=>setFin(true)} style={{...btnRond,background:L2,border:"none",color:"#fff"}}>Terminer</button>}
    </div>
  </div>);
}
