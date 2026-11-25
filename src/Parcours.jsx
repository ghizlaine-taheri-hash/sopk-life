// ═══════════════════════════════════════════════════════════════════════════
// ORDRE DES CHAPITRES — étape 2 de la personnalisation
// Fondation (J1-30) reste au début, Autonomie (J330-365) à la fin.
// Entre les deux, 10 chapitres peuvent changer d'ordre. Un chapitre commencé ne bouge plus.
// ═══════════════════════════════════════════════════════════════════════════

export const ORDRE_BASE = [2,3,4,5,6,7,8,9,10,11];
export const RESUMES = {1:"les bases, pas à pas",2:"fringales, énergie, coups de barre",3:"douleurs, digestion, feu de fond",4:"charge mentale, pression, nuits",5:"comprendre tes phases",6:"acné, pilosité, chute",7:"ce qu'on relie rarement au SMOP",8:"bouger sans t'épuiser",9:"le soutenir, sans détox miracle",10:"analyses, rendez-vous, tes droits",11:"ovulation, projet bébé ou pas",12:"garder ce qui marche pour toi"};

export const ordreValide = (o) => Array.isArray(o) && o.length===10 && ORDRE_BASE.every(n=>o.includes(n)) ? o : ORDRE_BASE;
export const estBase = (o) => ordreValide(o).every((n,i)=>n===ORDRE_BASE[i]);

// les 12 mois dans l'ordre de cette personne : n = rang, c = chapitre, a/b = jours, src = premier jour d'origine
export const moisSelon = (ordre,mois0) => { let a=31; const de=(n)=>mois0.find(x=>x.n===n);
  const milieu=ordreValide(ordre).map((c,i)=>{ const m=de(c); const x={n:i+2,c,label:m.label,a,b:a+m.b-m.a,src:m.a}; a=x.b+1; return x; });
  return [{...de(1),c:1,src:1},...milieu,{...de(12),c:12,src:de(12).a}]; };
export const moisDe = (d,mois) => mois.find(x=>d>=x.a&&d<=x.b)||mois[0];
export const idDuJour = (d,mois) => { const m=moisDe(d,mois); return m.src+(d-m.a); };           // jour → mission d'origine
export const jourDeId = (k,mois) => { const m=mois.find(x=>k>=x.src&&k<=x.src+(x.b-x.a)); return m?m.a+(k-m.src):k; }; // mission → jour

// les chapitres déjà commencés restent à leur place
const figes = (ordre,jour,mois0) => moisSelon(ordre,mois0).filter(x=>x.c>1&&x.c<12&&x.a<=jour).map(x=>x.c);
export const nbFiges = (ordre,jour,mois0) => figes(ordre,jour,mois0).length;

const PAR_PRIO = {fringales:[2,8,9],douleurs:[3,5],peau:[6],stress:[4],cycle:[5,11],comprendre:[10,7]};
const PAR_STADE = {cherche:[10,7],vient:[10],perdue:[],place:[]};
export const ordrePropose = ({perso,ordre,jour,mois0}) => {
  const deb=figes(ordre,jour,mois0); const p=(perso&&perso.priorites)||[];
  const listes=p.map(x=>PAR_PRIO[x]||[]); const souhaits=[];
  listes.forEach(l=>{ if(l[0]) souhaits.push(l[0]); });
  listes.forEach(l=>souhaits.push(...l.slice(1)));
  souhaits.push(...(PAR_STADE[perso&&perso.stade]||[]));
  let reste=[...new Set([...souhaits,...ORDRE_BASE])].filter(c=>!deb.includes(c));
  return placerFertilite([...deb,...reste],deb,perso);
};
// « Cycle & fertilité » s'appuie sur « Cycle » : jamais avant. Et tout à la fin si la fertilité est masquée.
export const placerFertilite = (o,deb,perso) => {
  if(deb.includes(11)) return o;
  const sans=o.filter(c=>c!==11); const pos=o.indexOf(11);
  if(perso&&(perso.masques||[]).includes("fertilite")) return [...sans,11];
  const min=sans.indexOf(5)+1; const i=Math.max(pos,min); return [...sans.slice(0,i),11,...sans.slice(i)];
};
export const ordreDeBase = ({ordre,jour,mois0}) => { const deb=figes(ordre,jour,mois0); return placerFertilite([...deb,...ORDRE_BASE.filter(c=>!deb.includes(c))],deb,null); };
// déplacer un chapitre à venir d'un cran
export const deplacer = ({ordre,c,sens,jour,mois0}) => { const o=[...ordreValide(ordre)]; const deb=figes(o,jour,mois0); const i=o.indexOf(c), j=i+sens;
  if(i<deb.length||j<deb.length||j>9) return o; [o[i],o[j]]=[o[j],o[i]];
  return o.indexOf(11)<o.indexOf(5)&&!deb.includes(11) ? ordreValide(ordre) : o; };

// ── phrases qui supposaient l'ordre d'origine : version qui reste juste dans n'importe quel ordre ──
const SUITE = "la suite du parcours";
const LIBRES = {
  37:[["première semaine du mois 2, consacré à ta glycémie : depuis le jour 31, qu'est-ce","première semaine consacrée à ta glycémie : qu'est-ce"]],
  60:[["le mois prochain, on pourra creuser ton terrain inflammatoire.","c'est un appui pour ton terrain inflammatoire."],["avant d'explorer ton versant inflammatoire le mois prochain.","pour ton versant inflammatoire."]],
  89:[["deux mois : ton terrain se transforme","bilan du chapitre : ton terrain se transforme"],["regarde deux mois de chemin (glycémie puis inflammation), et","regarde ton chemin, et"],["deux mois.\n\ntu as travaillé ta glycémie, puis apaisé ton inflammation.","tu as travaillé ton inflammation."],
    ["ces deux mois ne sont pas des parenthèses : ce sont deux fondations qui se cumulent. le socle glycémie du mois dernier et l'apaisement du feu de ce mois-ci travaillent ensemble, parce que glycémie et inflammation sont liées. ton terrain n'est plus le même qu'il y a deux mois.","ce mois n'est pas une parenthèse : c'est une fondation de plus. l'apaisement du feu travaille avec tout le reste, parce que glycémie et inflammation sont liées."],
    ["regarde tes deux mois de chemin","regarde ton chemin"],["regarde tes deux mois","regarde ton chemin"],["célébrer deux mois de travail de fond","célébrer ce travail de fond"],["glycémie et inflammation resteront en fond toute l'année.","ce travail restera en fond toute l'année."],["la fierté de deux mois de fondations","la fierté d'une fondation de plus"],["ta deuxième fondation","une fondation de plus"],
    ["glycémie puis inflammation : tu as travaillé les deux moteurs liés de ton terrain.","tu as travaillé un moteur lié à ta glycémie."],["tu as apaisé l'insuline ET l'inflammation qui amplifiaient tes androgènes : double fondation.","tu as travaillé l'inflammation, qui amplifie tes androgènes."],["glycémie et inflammation apaisées : exactement les fondations de ton profil mixte.","un travail de fond utile à ton profil mixte."],["c'est le cœur de ton profil : tes deux terrains, glycémie et feu, sont désormais travaillés.","c'est au cœur de ton profil : le feu, l'un de tes deux terrains."]],
  119:[["trois mois : tu habites ton corps","bilan du chapitre : tu habites ton corps"],["regarde trois mois de chemin (glycémie, inflammation, stress), et","regarde ton chemin, et"],["trois mois.\n\ntu as appris à parler à ta glycémie, apaiser ton inflammation, calmer ton stress.","tu as appris à calmer ton stress."],
    ["trois mois, c'est le temps qu'il faut aux plantes et au mode de vie pour commencer à transformer un terrain en profondeur — et le temps qu'il te fallait pour changer, toi, de regard. tu","le mode de vie transforme un terrain petit à petit. et toi, tu changes de regard : tu"],["glycémie, inflammation, stress : trois moteurs liés, que tu sais maintenant reconnaître et apaiser.","le stress est lié à tout le reste, et tu sais maintenant mieux le reconnaître et l'apaiser."],[", et tu n'es plus la même qu'il y a trois mois.","."],
    ["regarde tes trois mois de chemin","regarde ton chemin"],["regarde tes trois mois","regarde ton chemin"],["célébrer trois mois de travail de fond","célébrer ce travail de fond"],["glycémie, inflammation, stress resteront en fond toute l'année.","ce travail restera en fond toute l'année."],["la fierté de trois mois de fondations","la fierté d'une fondation de plus"],["ta troisième fondation","une fondation de plus"],
    ["glycémie, inflammation, stress : tu as travaillé les trois moteurs liés de ton terrain.","tu as travaillé le stress, un moteur lié à ta glycémie."],["insuline, inflammation et cortisol : tu as apaisé les trois voies qui nourrissent tes androgènes.","tu as travaillé le cortisol, une des voies qui nourrissent tes androgènes."],["tu as posé le socle anti-feu ET appris à calmer le stress qui l'attise.","tu as appris à calmer le stress qui attise ton feu."],["glycémie, androgènes et stress : tu tiens les leviers de ton profil mixte.","le stress : un levier de plus pour ton profil mixte."],["glycémie, inflammation et stress : tes terrains sont désormais travaillés ensemble.","le stress relie tes terrains : tu l'as travaillé."],["androgènes, inflammation et stress : tu as désamorcé leur cercle, étage par étage.","androgènes, inflammation et stress : tu as travaillé leur point commun."]],
  149:[["glycémie, inflammation, stress — tes mois précédents soutiennent, en profondeur,","ce que tu as déjà mis en place soutient, en profondeur,"],[" — glycémie, inflammation, stress, cycle — et",", et"]],
  179:[["depuis le début : près de six mois de travail de fond. ta peau est le dernier domaine à répondre, après ton énergie, ton cycle, ton métabolisme.","depuis le début. ta peau est souvent longue à répondre."]],
  185:[["qu'on a vues ensemble",""]],
  208:[["sept mois de travail, et maintenant","tout ce travail, et maintenant"],["mois 7 bouclé","chapitre bouclé"]],
  237:[["mois 8 bouclé","chapitre bouclé"]],
  259:[["neuf mois de travail de fond, et maintenant","tout ce travail de fond, et maintenant"],["mois 9 bouclé","chapitre bouclé"]],
  268:[[" (tu l'as découverte au mois 3)"," (plus de détails dans le chapitre Inflammation)"]],
  269:[["tout ce que tu as fait au mois 2 (ordre des aliments, marche après les repas, muscle)","tout ce que tu fais pour ta glycémie (ordre des aliments, marche après les repas, muscle)"]],
  281:[["tu as appris à reconnaître ce discours depuis le mois 2.","tu apprends à reconnaître ce discours."]],
  290:[["tout ce que tu as fait au mois 5 pour ton sommeil reste précieux.","tout ce que tu fais pour ton sommeil reste précieux."]],
  291:[[" (tu l'as vu au mois 7)"," (chapitre Signes cachés)"]],
  294:[["le mois prochain, on explore ton cycle, ton ovulation et ta fertilité, avec ce même regard : comprendre pour mieux décider.",SUITE+" t'attend, avec ce même regard : comprendre pour mieux décider."],["mois 10 bouclé","chapitre bouclé"]],
  302:[["tu le sais depuis le mois 2 : des pics","des pics"]],
  304:[["tu as déjà travaillé ton sommeil au mois 5 ; aujourd'hui, tu sais qu'il parle aussi à ton cycle.","ton sommeil parle aussi à ton cycle."]],
  329:[["le mois prochain, le dernier de ton parcours de l'année, est consacré à ton autonomie et à ta relation à ton corps : tout ce que tu as construit, tu vas apprendre à le porter seule, en confiance.",SUITE+" t'aidera à porter tout ça, en confiance."],[" il te reste un mois pour tout rassembler.",""],["mois 11 bouclé","chapitre bouclé"]],
  349:[["que tu as construit au mois 10,","construit au chapitre Suivi médical,"]],
};
const partout = (x,paires) => typeof x==="string" ? paires.reduce((s,[a,b])=>s.split(a).join(b),x) : Array.isArray(x) ? x.map(y=>partout(y,paires)) : x&&typeof x==="object" ? Object.fromEntries(Object.entries(x).map(([k,v])=>[k,partout(v,paires)])) : x;
export const texteLibre = (m,k,base) => base||!LIBRES[k] ? m : partout(m,LIBRES[k]);
export const JOURS_LIBRES = LIBRES;

// ── ce qui est rangé par jour suit sa mission quand un chapitre se déplace ──
export const convertir = ({avant,apres,mois0}) => { const A=moisSelon(avant,mois0), B=moisSelon(apres,mois0); return (p)=>{ p=+p; return p<31||p>329?p:jourDeId(idDuJour(p,A),B); }; };
export const convertirCles = (o,f) => Object.fromEntries(Object.entries(o||{}).map(([p,v])=>[f(p),v]));
