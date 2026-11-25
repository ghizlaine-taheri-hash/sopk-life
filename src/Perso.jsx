import { useState } from "react";
import { createPortal } from "react-dom";

// ═══════════════════════════════════════════════════════════════════════════
// PERSONNALISATION — étape 1
// Six questions, trois longueurs de lecture, réponses aux missions, « pourquoi toi ».
// Règles simples et prévisibles : pas d'IA, pas de score, pas de diagnostic, aucun texte santé modifié.
// Tant qu'elle n'a pas répondu, son espace s'affiche exactement comme avant.
// ═══════════════════════════════════════════════════════════════════════════

export const STADES = [
  ["cherche","je cherche encore un diagnostic"],
  ["vient","je viens de l'apprendre"],
  ["perdue","je le sais, mais je suis perdue"],
  ["place","j'ai déjà mis des choses en place"],
];
export const PRIOS = [
  ["fringales","les fringales et l'énergie",["N","M"]],
  ["douleurs","les douleurs et la digestion",["N","C","A"]],
  ["peau","la peau, les poils ou les cheveux",["P","N"]],
  ["stress","le stress et le sommeil",["A","S"]],
  ["cycle","mon cycle",["C","D"]],
  ["comprendre","comprendre et préparer mes rendez-vous",["K","D","B"]],
];
export const TEMPS = [[2,"2 minutes"],[10,"10 minutes"],[20,"20 minutes"]];
export const MASQUES = [
  ["fertilite","la fertilité et la grossesse",[86,309,310,311,312,313,314,315,316,323,324,325]],
  ["intime","la libido et l'intimité",[139,192,318]],
  ["corps","l'image du corps et les remarques",[156,170,182,332,333]],
];
export const QUOTIDIEN = [["enfants","j'ai des enfants"],["horaires","mes horaires sont décalés"],["assise","je travaille assise"],["dehors","je mange souvent dehors"]];
export const NIVEAUX = [["express","express"],["classique","classique"],["approfondi","complète"]];

export const ETAT_VIDE = {niv:{},remplace:{},deCote:[],express:null,legerJusqu:"",msg:{},avis:{},reponses:[]};

const jourLocal = (plus=0) => { const d=new Date(); d.setDate(d.getDate()+plus); const z=(n)=>String(n).padStart(2,"0"); return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); };
const nomDe = (liste,k) => { const x=liste.find(y=>y[0]===k); return x?x[1]:""; };
export const estMasque = (d,perso) => !!perso && (perso.masques||[]).some(k=>{ const m=MASQUES.find(x=>x[0]===k); return m && m[2].includes(d); });

// ── quelle longueur afficher pour ce jour ──
export const niveauPour = ({d,perso,etat,energie}) => {
  if(etat.niv[d]) return etat.niv[d];
  if(!perso) return "approfondi";
  if(etat.legerJusqu && jourLocal()<=etat.legerJusqu) return "express";
  if(etat.express && d>=etat.express.de && d<=etat.express.a) return "express";
  if(energie==="basse") return "express";
  return perso.temps===2?"express":perso.temps===20?"approfondi":"classique";
};

// ── la mission affichée : celle du parcours, sauf sujet masqué ou mission mise de côté ──
const MOTIFS = {
  masque:"ce sujet, tu as choisi de ne pas le voir pour l'instant. voici un petit geste à la place.",
  faite:"la mission prévue aujourd'hui, tu l'as déjà eue. voici un petit geste à la place.",
  fatigue:"aujourd'hui, un tout petit geste suffit. le reste attendra.",
  autre:"voici un petit geste à la place de la mission prévue.",
};
const DOUX = ["ton souffle","la micro-pause","la douceur envers toi","protéger ta nuit","ton rituel du soir"];
const PAS_ICI = ["l'astuce de secours","ton magnésium","une pincée de cannelle"]; // gestes qui ne conviennent pas à tout le monde
const enGeste = (m0,tous,i,motif) => { const rituels=tous.filter(x=>motif==="fatigue"?DOUX.includes(x.theme):!PAS_ICI.includes(x.theme)); const r=rituels[((i%rituels.length)+rituels.length)%rituels.length]; return {...r, msg:MOTIFS[motif]||MOTIFS.autre, tisane:m0.tisane||null, _geste:true, _motif:motif}; };
export const adapterMission = ({d,base,codeDe,perso,etat,rituels}) => {
  const m0=base(d); if(d>365) return m0;
  const r=etat.remplace[d];
  if(r){
    if(r.j) return {...base(r.j), tisane:m0.tisane||null, day:d, _pil:codeDe(r.j), _depuis:r.j};
    const g=enGeste(m0,rituels,d+(r.rit||0),r.motif); return {...g, day:d, _pil:codeDe(400,g.theme)};
  }
  if(estMasque(d,perso)){ const g=enGeste(m0,rituels,d,"masque"); return {...g, day:d, _pil:codeDe(400,g.theme)}; }
  return m0;
};

// ── trouver une autre mission du même chapitre ──
const LIEE = /\b[Jj](our)?s? ?\d|bilan|demain|hier\b|deuxième|troisième|semaine (dernière|passée)|mois (dernier|passé)/; // renvoie à un moment précis : on ne la déplace pas
export const trouverAutre = ({d,fin,base,codeDe,perso,etat,checked,raison}) => {
  const pris=new Set(Object.values(etat.remplace).map(x=>x.j).filter(Boolean));
  const ok=[]; for(let k=d+1;k<=fin;k++){
    if(etat.remplace[k]||pris.has(k)||checked[k]||estMasque(k,perso)||codeDe(k)==="B") continue;
    const m=base(k); if(LIEE.test(JSON.stringify([m.theme,m.mission,m.msg,m.pourquoi,m.comment,m.pieges,m.plus]))) continue;
    ok.push(k);
  }
  if(!ok.length) return null;
  const c0=codeDe(d); const voulus=new Set(((perso&&perso.priorites)||[]).flatMap(p=>(PRIOS.find(x=>x[0]===p)||[0,0,[]])[2]));
  const note=(k)=>{ const c=codeDe(k); return (raison==="deja"?(c===c0?3:0):(c!==c0?2:0))+(voulus.has(c)?2:0); };
  return ok.sort((a,b)=>note(b)-note(a)||a-b)[0];
};

// ── « pourquoi toi » : une phrase qui cite ce qu'elle a dit ──
const LIEN = {
  fringales:{N:"ton assiette est un bon endroit pour commencer.",M:"bouger un peu, au bon moment, fait partie des gestes simples à tester."},
  douleurs:{N:"ce que tu manges peut compter dans ton confort au quotidien.",C:"mieux connaître ton cycle aide à mieux vivre ces jours-là.",A:"relâcher la pression compte aussi."},
  peau:{P:"cette mission parle directement de ta peau et de tes cheveux.",N:"ta peau suit aussi ce qui se passe dans ton assiette."},
  stress:{A:"cette mission est là pour faire redescendre la pression.",S:"cette mission prend soin de tes nuits."},
  cycle:{C:"cette mission t'aide à lire ton cycle.",D:"de quoi préparer ce que tu veux demander à ton médecin."},
  comprendre:{K:"cette mission t'explique, sans jargon.",D:"de quoi arriver préparée à ton rendez-vous.",B:"faire le point t'aide à savoir quoi dire."},
};
const PARSTADE = {
  cherche:"tu cherches encore un diagnostic : chaque chose que tu comprends t'aidera à en parler.",
  vient:"tu viens de l'apprendre : on avance une seule chose à la fois.",
  perdue:"tu as dit être un peu perdue : ici, une seule chose par jour suffit.",
  place:"tu as déjà mis des choses en place : prends ce qui te sert, laisse le reste.",
};
export const pourquoiToi = ({code,perso,mission}) => {
  if(!perso||(mission&&mission._geste)) return "";
  for(const p of (perso.priorites||[])){ const l=LIEN[p]&&LIEN[p][code]; if(l) return "tu as choisi « "+nomDe(PRIOS,p)+" » : "+l; }
  return PARSTADE[perso.stade]||"";
};
// petite astuce selon son quotidien (facultative)
const ASTUCES = {
  enfants:{N:"avec des enfants : un seul repas pour tout le monde, tu adaptes juste ton assiette.",M:"avec des enfants : jouer dehors avec eux compte aussi.",S:"avec des enfants : vise une chose que tu maîtrises, même petite.",A:"avec des enfants : deux minutes seule dans la salle de bain, ça compte."},
  horaires:{N:"horaires décalés : garde l'ordre des repas, pas l'heure.",S:"horaires décalés : le rituel compte plus que l'heure.",M:"horaires décalés : choisis le moment qui t'arrange, il n'y a pas de bonne heure."},
  assise:{M:"tu travailles assise : te lever quelques minutes entre deux tâches, c'est déjà ça.",A:"tu travailles assise : relâche les épaules et la mâchoire une fois par heure."},
  dehors:{N:"tu manges souvent dehors : commence par les légumes ou la protéine, le reste suit."},
};
export const astuceDuQuotidien = ({code,perso}) => { if(!perso) return ""; for(const q of (perso.quotidien||[])){ const a=ASTUCES[q]&&ASTUCES[q][code]; if(a) return a; } return ""; };

// ── styles communs ──
const puce = (C,on) => ({padding:"9px 14px",borderRadius:99,border:`1.5px solid ${on?C.terra:C.border}`,background:on?C.terra:C.white,color:on?"#fff":C.brown,fontFamily:"inherit",fontSize:12.5,fontWeight:600,cursor:"pointer",textAlign:"left"});
const plein = (C) => ({width:"100%",background:C.terra,border:"none",borderRadius:12,padding:"12px",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer"});
const lien = (C) => ({background:"none",border:"none",padding:0,color:C.mid,fontFamily:"inherit",fontSize:11,cursor:"pointer",textDecoration:"underline"});

function Feuille({C,titre,onClose,children}){
  return createPortal(
    <div style={{fontFamily:"'DM Sans',sans-serif"}}>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:340,background:"rgba(58,42,32,.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:14}}>
        <div onClick={e=>e.stopPropagation()} role="dialog" aria-label={titre} style={{background:C.cream,borderRadius:22,width:"100%",maxWidth:430,maxHeight:"88vh",overflowY:"auto",padding:"18px 18px 22px",boxSizing:"border-box"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{flex:1,fontFamily:"'Playfair Display',serif",fontSize:"1.25rem",fontWeight:600,color:C.brown}}>{titre}</div>
            <button onClick={onClose} aria-label="fermer" style={{background:"none",border:"none",fontSize:17,color:C.light,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
          </div>
          {children}
        </div>
      </div>
    </div>, document.body);
}

// ── LES SIX QUESTIONS, puis le récapitulatif modifiable ──
export function FeuillePerso({C,perso,setPerso,etat,setEtat,onClose,titreDuJour,jour}){
  const [brouillon,setBrouillon]=useState(()=>perso?{...perso}:{stade:"",priorites:[],temps:0,masques:[],quotidien:[],phrase:""});
  const [etape,setEtape]=useState(perso?"recap":0);
  const [accord,setAccord]=useState(false);
  const [unique,setUnique]=useState(false); // modification d'une seule réponse
  const [effacer,setEffacer]=useState(false);
  const maj=(k,v)=>setBrouillon(b=>({...b,[k]:v}));
  const bascule=(k,v,max)=>setBrouillon(b=>{ const a=b[k]||[]; if(a.includes(v)) return {...b,[k]:a.filter(x=>x!==v)}; return {...b,[k]:max&&a.length>=max?[...a.slice(1),v]:[...a,v]}; });
  const enregistrer=()=>{ setPerso({...brouillon,phrase:String(brouillon.phrase||"").trim().slice(0,200),accord:brouillon.accord||{le:jourLocal(),version:1},maj:jourLocal()}); setUnique(false); setEtape("recap"); };
  const Q=[null,
    {k:"stade",t:"Où tu en es ?",s:"choisis ce qui te ressemble le plus.",ok:!!brouillon.stade},
    {k:"priorites",t:"Qu'est-ce qui pèse le plus en ce moment ?",s:"deux choix au plus.",ok:(brouillon.priorites||[]).length>0},
    {k:"temps",t:"Combien de temps tu as vraiment, par jour ?",s:"sois honnête, il n'y a pas de mauvaise réponse.",ok:!!brouillon.temps},
    {k:"masques",t:"Des sujets que tu préfères ne pas voir pour l'instant ?",s:"facultatif. tu pourras les remettre quand tu veux. le mot peut apparaître ailleurs, mais les missions sur ce sujet seront remplacées.",ok:true},
    {k:"quotidien",t:"Ton quotidien",s:"facultatif. ça sert à te donner une petite astuce adaptée.",ok:true},
    {k:"phrase",t:"Dans trois mois, j'aimerais…",s:"facultatif. une phrase à toi, que ton espace te rendra plus tard.",ok:true},
  ];
  const champ=(k)=>{
    const col={display:"flex",flexDirection:"column",gap:8};
    if(k==="stade") return <div style={col}>{STADES.map(([v,l])=><button key={v} aria-pressed={brouillon.stade===v} onClick={()=>maj("stade",v)} style={puce(C,brouillon.stade===v)}>{l}</button>)}</div>;
    if(k==="priorites") return <div style={col}>{PRIOS.map(([v,l])=>{ const on=brouillon.priorites.includes(v); return <button key={v} aria-pressed={on} onClick={()=>bascule("priorites",v,2)} style={puce(C,on)}>{l}</button>; })}</div>;
    if(k==="temps") return <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{TEMPS.map(([v,l])=><button key={v} aria-pressed={brouillon.temps===v} onClick={()=>maj("temps",v)} style={puce(C,brouillon.temps===v)}>{l}</button>)}</div>;
    if(k==="masques") return <div style={col}>{MASQUES.map(([v,l])=>{ const on=brouillon.masques.includes(v); return <button key={v} aria-pressed={on} onClick={()=>bascule("masques",v)} style={puce(C,on)}>{l}</button>; })}</div>;
    if(k==="quotidien") return <div style={col}>{QUOTIDIEN.map(([v,l])=>{ const on=brouillon.quotidien.includes(v); return <button key={v} aria-pressed={on} onClick={()=>bascule("quotidien",v)} style={puce(C,on)}>{l}</button>; })}</div>;
    return <textarea value={brouillon.phrase} maxLength={200} onChange={e=>maj("phrase",e.target.value)} placeholder="par exemple : ne plus m'écrouler à 15h" rows={3} style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${C.border}`,borderRadius:12,padding:"11px",fontFamily:"inherit",fontSize:16,color:C.brown,background:C.white,resize:"vertical"}}/>;
  };
  const dit={stade:nomDe(STADES,brouillon.stade),priorites:(brouillon.priorites||[]).map(p=>nomDe(PRIOS,p)).join(" · "),temps:nomDe(TEMPS,brouillon.temps),masques:(brouillon.masques||[]).map(p=>nomDe(MASQUES,p)).join(" · ")||"aucun",quotidien:(brouillon.quotidien||[]).map(p=>nomDe(QUOTIDIEN,p)).join(" · ")||"rien de précisé",phrase:brouillon.phrase?"« "+brouillon.phrase+" »":"pas de phrase"};
  const NOMS={stade:"où j'en suis",priorites:"mes priorités",temps:"mon temps par jour",masques:"sujets masqués",quotidien:"mon quotidien",phrase:"dans trois mois"};

  if(etape===0) return (
    <Feuille C={C} titre="Un parcours plus à toi" onClose={onClose}>
      <div style={{fontSize:12.5,color:C.mid,lineHeight:1.65,marginBottom:12}}>six questions, environ 90 secondes. elles servent à adapter tes missions : leur longueur, ce qu'on te propose, et ce qu'on évite.</div>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 14px",marginBottom:12,fontSize:11.5,color:C.mid,lineHeight:1.65}}>
        <div style={{fontWeight:700,color:C.brown,marginBottom:4}}>avant de commencer</div>
        tes réponses parlent de ta santé. elles sont enregistrées sur ton compte, chez notre hébergeur, et servent seulement à adapter ton espace. elles ne posent aucun diagnostic et ne remplacent pas un médecin. tu peux les modifier, les récupérer ou les effacer quand tu veux.
      </div>
      <label style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:12,color:C.brown,lineHeight:1.5,marginBottom:14,cursor:"pointer"}}>
        <input type="checkbox" checked={accord} onChange={e=>setAccord(e.target.checked)} style={{marginTop:2,width:18,height:18,flexShrink:0}}/>
        <span>je suis d'accord pour que mes réponses soient enregistrées et utilisées pour adapter mon espace.</span>
      </label>
      <button disabled={!accord} onClick={()=>{ maj("accord",{le:jourLocal(),version:1}); setEtape(1); }} style={{...plein(C),opacity:accord?1:.45,cursor:accord?"pointer":"default"}}>commencer</button>
      <div style={{textAlign:"center",marginTop:12}}><button onClick={onClose} style={lien(C)}>plus tard, mon espace marche très bien sans</button></div>
    </Feuille>);

  if(etape!=="recap"){ const q=Q[etape]; return (
    <Feuille C={C} titre={q.t} onClose={onClose}>
      {!unique&&<div style={{fontSize:10,color:C.light,marginBottom:4}}>question {etape} sur 6</div>}
      <div style={{fontSize:12,color:C.mid,lineHeight:1.55,marginBottom:12}}>{q.s}</div>
      {champ(q.k)}
      <button disabled={!q.ok} onClick={()=>{ if(unique||etape===6) enregistrer(); else setEtape(etape+1); }} style={{...plein(C),marginTop:16,opacity:q.ok?1:.45}}>{unique?"enregistrer":etape===6?"c'est bon":"continuer"}</button>
      <div style={{textAlign:"center",marginTop:12}}><button onClick={()=>{ if(unique){ setBrouillon({...perso}); setUnique(false); setEtape("recap"); } else setEtape(etape-1); }} style={lien(C)}>revenir</button></div>
    </Feuille>); }

  return (
    <Feuille C={C} titre="Mon parcours à moi" onClose={onClose}>
      <div style={{fontSize:12,color:C.mid,lineHeight:1.6,marginBottom:12}}>voilà ce que ton espace sait, et ce dont il se sert. tu changes ce que tu veux, quand tu veux.</div>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"4px 14px",marginBottom:12}}>
        {[1,2,3,4,5,6].map(i=>{ const k=Q[i].k; return (
          <div key={k} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 0",borderBottom:i<6?`1px solid ${C.border}`:"none"}}>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:10,color:C.light}}>{NOMS[k]}</div><div style={{fontSize:12.5,color:C.brown,lineHeight:1.45,overflowWrap:"anywhere"}}>{dit[k]}</div></div>
            <button onClick={()=>{ setUnique(true); setEtape(i); }} style={lien(C)}>modifier</button>
          </div>); })}
      </div>
      {(etat.legerJusqu&&jourLocal()<=etat.legerJusqu)&&(
        <div style={{background:C.mauveSoft,borderRadius:14,padding:"11px 14px",marginBottom:12,fontSize:12,color:C.brown,lineHeight:1.55}}>période légère en cours : des missions courtes pendant quelques jours. <button onClick={()=>setEtat(e=>({...e,legerJusqu:""}))} style={lien(C)}>reprendre le rythme normal</button></div>)}
      {etat.deCote.length>0&&(
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:12.5,fontWeight:700,color:C.brown,marginBottom:6}}>mes missions mises de côté</div>
          {etat.deCote.slice(-12).reverse().map((x,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"6px 0"}}>
              <span style={{fontSize:10,color:C.light,width:34,flexShrink:0}}>J{x.d}</span>
              <span style={{flex:1,fontSize:12,color:C.brown,lineHeight:1.4}}>{titreDuJour(x.d)}</span>
              {x.raison!=="deja"?<button onClick={()=>setEtat(e=>remettre(e,x.d))} style={lien(C)}>remettre</button>:<span style={{fontSize:10.5,color:C.light}}>acquise</span>}
            </div>))}
        </div>)}
      <button onClick={onClose} style={plein(C)}>fermer</button>
      <div style={{textAlign:"center",marginTop:14}}>
        {!effacer?<button onClick={()=>setEffacer(true)} style={lien(C)}>effacer mes réponses</button>
        :<div style={{fontSize:12,color:C.brown,lineHeight:1.6}}>tes six réponses et tes missions mises de côté seront effacées. tes missions cochées et tes notes restent.<div style={{display:"flex",gap:14,justifyContent:"center",marginTop:8}}><button onClick={()=>{ setPerso(null); setEtat(()=>ETAT_VIDE); onClose(); }} style={{...lien(C),color:"#B5553F",fontWeight:700}}>oui, effacer</button><button onClick={()=>setEffacer(false)} style={lien(C)}>non, garder</button></div></div>}
      </div>
    </Feuille>);
}

// ── remettre la mission d'origine d'un jour ──
export const remettre = (e,d) => {
  const rem={...e.remplace}; const r=rem[d]; delete rem[d];
  if(r&&r.j&&rem[r.j]&&(rem[r.j].motif==="faite"||rem[r.j].j===d)) delete rem[r.j];
  const msg={...e.msg}; delete msg[d];
  return {...e,remplace:rem,msg,deCote:e.deCote.filter(x=>x.d!==d)};
};

// ── SOUS LA MISSION : pourquoi toi, longueur, réponses ──
const RAISONS = {
  aujourdhui:[["temps","pas le temps"],["fatigue","trop fatiguée"]],
  moi:[["compris","je n'ai pas compris"],["vie","pas adapté à ma vie"],["deja","je le fais déjà"]],
};
export function SousMission({part,C,pc,d,jour,code,perso,etat,setEtat,mission,niveau,fait,autre,ouvrir,ouvrirDetail}){
  const [quoi,setQuoi]=useState(null);
  const pt=pourquoiToi({code,perso,mission}); const as=astuceDuQuotidien({code,perso});
  const note=(e,type,raison)=>({...e,reponses:[...e.reponses,{d,type,raison,le:jourLocal()}].slice(-200)});
  const cote=(e,raison)=>e.deCote.some(x=>x.d===d)?e.deCote:[...e.deCote,{d,raison,le:jourLocal()}];
  const repondre=(type,raison)=>{ setQuoi(null); setEtat(e0=>{
    let e=note(e0,type,raison); const dire=(t)=>{ e={...e,msg:{...e.msg,[d]:t}}; };
    if(raison==="temps"){ e={...e,express:{de:d,a:d+3},niv:{...e.niv,[d]:"express"}}; dire("je te garde des formats courts pour aujourd'hui et les 3 prochaines missions."); }
    else if(raison==="fatigue"){ e={...e,legerJusqu:jourLocal(7),deCote:cote(e,raison),remplace:{...e.remplace,[d]:{rit:0,motif:"fatigue"}}}; dire("on allège pendant 7 jours. rien n'est perdu, rien n'est à rattraper."); }
    else if(raison==="compris"){ e={...e,niv:{...e.niv,[d]:"approfondi"}}; dire("voilà la version expliquée pas à pas, avec les pièges et les détails."); }
    else { const k=autre(raison); e={...e,deCote:cote(e,raison)};
      if(k) e={...e,remplace:{...e.remplace,[d]:{j:k},[k]:raison==="rien"?{j:d,motif:"retour"}:{rit:0,motif:"faite"}}}; else e={...e,remplace:{...e.remplace,[d]:{rit:0,motif:"autre"}}};
      dire(raison==="deja"?"acquis. on passe à la suite.":raison==="rien"?"c'est noté. elle reviendra plus tard, voilà autre chose.":"c'est noté. essaie plutôt celle-ci."); }
    return e; });
    if(raison==="compris") ouvrirDetail(true); };
  const r=etat.remplace[d]; const possible=d===jour&&d<=365&&!fait;
  if(part==="haut") return (
    <div>
      {etat.msg[d]&&<div style={{marginTop:10,background:C.mauveSoft,borderRadius:10,padding:"9px 11px",fontSize:11.5,color:C.brown,lineHeight:1.5}}>{etat.msg[d]}</div>}
      {pt&&<div style={{marginTop:10,borderLeft:`3px solid ${C.mauve}`,padding:"2px 0 2px 10px"}}><div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.mauve,fontWeight:700}}>pourquoi toi</div><div style={{fontSize:11.5,color:C.brown,lineHeight:1.5}}>{pt}</div></div>}
      {as&&!mission._geste&&<div style={{marginTop:8,fontSize:11,color:C.mid,lineHeight:1.5}}>{as}</div>}
      {!mission._geste&&d<=365&&perso&&(
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10,flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:C.light}}>version</span>
          {NIVEAUX.map(([k,l])=>{ const on=niveau===k; return <button key={k} aria-pressed={on} onClick={()=>{ setEtat(e=>({...e,niv:{...e.niv,[d]:k}})); if(k!=="express") ouvrirDetail(true); }} style={{padding:"5px 11px",borderRadius:99,border:`1px solid ${on?pc.p:C.border}`,background:on?`${pc.p}18`:C.white,color:on?pc.p:C.mid,fontFamily:"inherit",fontSize:10.5,fontWeight:600,cursor:"pointer"}}>{l}</button>; })}
        </div>)}
    </div>);
  return (
    <div>
      {possible&&perso&&!r&&!quoi&&(
        <div style={{display:"flex",gap:8,marginTop:12}}>
          {[["aujourdhui","pas aujourd'hui"],["moi","pas pour moi"]].map(([k,l])=><button key={k} onClick={()=>setQuoi(k)} style={{flex:1,padding:"9px 6px",borderRadius:11,border:`1px solid ${C.border}`,background:C.white,color:C.mid,fontFamily:"inherit",fontSize:11.5,fontWeight:600,cursor:"pointer"}}>{l}</button>)}
        </div>)}
      {possible&&quoi&&(
        <div style={{marginTop:12,background:C.cream,borderRadius:12,padding:"11px 12px"}}>
          <div style={{fontSize:11.5,color:C.mid,marginBottom:8}}>pas de souci. tu veux dire pourquoi ?</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {RAISONS[quoi].map(([k,l])=><button key={k} onClick={()=>repondre(quoi,k)} style={puce(C,false)}>{l}</button>)}
            {quoi==="moi"&&<button onClick={()=>repondre(quoi,"vie")} style={{...puce(C,false),color:C.light}}>sans raison</button>}
            {quoi==="aujourdhui"&&<button onClick={()=>repondre(quoi,"rien")} style={{...puce(C,false),color:C.light}}>sans raison</button>}
          </div>
          <div style={{marginTop:9}}><button onClick={()=>setQuoi(null)} style={lien(C)}>finalement, je la garde</button></div>
        </div>)}
      {r&&!fait&&etat.deCote.some(x=>x.d===d)&&<div style={{marginTop:10}}><button onClick={()=>setEtat(e=>remettre(e,d))} style={lien(C)}>revenir à la mission prévue</button></div>}
      {mission._motif==="masque"&&<div style={{marginTop:10}}><button onClick={ouvrir} style={lien(C)}>gérer mes sujets masqués</button></div>}
    </div>);
}

// ── SUR L'ACCUEIL : l'invitation, sa phrase, et le petit avis ──
export function CartePerso({C,Icon,perso,jour,etat,setEtat,ouvrir,setTab}){
  const carte={background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:"12px 14px",marginBottom:12};
  if(!perso) return (
    <button onClick={ouvrir} style={{...carte,width:"100%",display:"flex",alignItems:"center",gap:12,background:`linear-gradient(135deg,${C.mauveSoft},#fff)`,border:`1.5px solid ${C.mauve}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
      <div style={{width:40,height:40,borderRadius:12,background:C.mauve,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="sparkle" size={18} color="#fff"/></div>
      <span style={{flex:1}}><span style={{display:"block",fontSize:13,fontWeight:700,color:C.brown}}>Un parcours plus à toi</span><span style={{display:"block",fontSize:11,color:C.mid,lineHeight:1.45}}>six questions, 90 secondes, et tes missions s'adaptent</span></span>
      <span style={{fontSize:14,color:C.light}}>›</span>
    </button>);
  const rendez=[30,90].find(x=>jour>=x&&jour<=x+3&&perso.phrase&&!etat.avis["phrase"+x]);
  const avisA=[7,21].find(x=>jour>=x&&jour<=x+2&&etat.avis[x]==null);
  return (<>
    {rendez&&<div style={carte}>
      <div style={{fontSize:11,color:C.mid,marginBottom:4}}>au début, tu as écrit que dans trois mois, tu aimerais :</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",color:C.brown,lineHeight:1.4,marginBottom:8,overflowWrap:"anywhere"}}>« {perso.phrase} »</div>
      <div style={{display:"flex",gap:14}}><button onClick={()=>{ setEtat(e=>({...e,avis:{...e.avis,["phrase"+rendez]:1}})); setTab("journal"); }} style={{...lien(C),color:C.terra,fontWeight:700}}>écrire où j'en suis</button><button onClick={()=>setEtat(e=>({...e,avis:{...e.avis,["phrase"+rendez]:1}}))} style={lien(C)}>plus tard</button></div>
    </div>}
    {avisA&&<div style={carte}>
      <div style={{fontSize:12.5,color:C.brown,marginBottom:8}}>est-ce que ce parcours te ressemble ?</div>
      <div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:10,color:C.light}}>pas du tout</span>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setEtat(e=>({...e,avis:{...e.avis,[avisA]:n}}))} style={{width:34,height:34,borderRadius:"50%",border:`1.5px solid ${C.border}`,background:C.white,color:C.brown,fontFamily:"inherit",fontSize:12.5,fontWeight:600,cursor:"pointer"}}>{n}</button>)}<span style={{fontSize:10,color:C.light}}>tout à fait</span></div>
    </div>}
    <button onClick={ouvrir} style={{...carte,width:"100%",display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
      <Icon name="sparkle" size={16} color={C.mauve}/>
      <span style={{flex:1,fontSize:12.5,fontWeight:700,color:C.brown}}>Mon parcours à moi</span>
      <span style={{fontSize:11,color:C.mid}}>voir et modifier</span><span style={{fontSize:14,color:C.light}}>›</span>
    </button>
  </>);
}

// ── MON COMPTE : récupérer ou effacer ses données ──
export function MesDonnees({C,exporter,toutEffacer}){
  const [ouvert,setOuvert]=useState(false); const [mot,setMot]=useState(""); const [etat,setEtat]=useState("");
  return (
    <div style={{background:C.white,borderRadius:14,padding:"14px 15px",border:`1px solid ${C.border}`,marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:C.brown,marginBottom:4}}>Mes données</div>
      <div style={{fontSize:10.5,color:C.mid,lineHeight:1.55,marginBottom:11}}>tout ce que tu as noté ici est à toi. tu peux le récupérer, ou l'effacer.</div>
      <button onClick={async()=>{ setEtat(""); const r=await exporter(); if(r===false) setEtat("le fichier n'a pas pu être créé ici. essaie depuis un ordinateur."); }} style={{width:"100%",background:C.bubble,border:"none",borderRadius:10,padding:"11px",fontFamily:"inherit",fontSize:12,fontWeight:700,color:C.brown,cursor:"pointer",marginBottom:8}}>récupérer mes données</button>
      {!ouvert?<button onClick={()=>setOuvert(true)} style={{...lien(C),width:"100%",textAlign:"center",padding:"4px 0"}}>effacer toutes mes données</button>
      :<div style={{background:"#FDF0E8",border:"1px solid #F0D5C5",borderRadius:12,padding:"12px",marginTop:4}}>
        <div style={{fontSize:11.5,color:"#8A4430",lineHeight:1.6,marginBottom:8}}>tes notes, tes suivis, tes missions cochées et tes réponses seront effacés de cet appareil et de ton compte. <strong>c'est définitif.</strong> pense à les récupérer avant, et ferme ton espace sur tes autres appareils. pour continuer, écris <strong>EFFACER</strong>.</div>
        <input value={mot} onChange={e=>setMot(e.target.value)} aria-label="écris EFFACER pour confirmer" autoCapitalize="characters" autoComplete="off" style={{width:"100%",boxSizing:"border-box",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",fontFamily:"inherit",fontSize:16,marginBottom:8}}/>
        <button disabled={mot.trim().toUpperCase()!=="EFFACER"||etat==="..."} onClick={async()=>{ setEtat("..."); const ok=await toutEffacer(); if(!ok) setEtat("l'effacement n'a pas marché. vérifie ta connexion, rien n'a été supprimé de ton appareil."); }} style={{width:"100%",background:"#B5553F",opacity:mot.trim().toUpperCase()==="EFFACER"?1:.4,border:"none",borderRadius:10,padding:"11px",color:"#fff",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer"}}>{etat==="..."?"un instant…":"effacer définitivement"}</button>
        <div style={{textAlign:"center",marginTop:9}}><button onClick={()=>{ setOuvert(false); setMot(""); setEtat(""); }} style={lien(C)}>annuler</button></div>
      </div>}
      {etat&&etat!=="..."&&<div style={{fontSize:11,color:"#B5553F",marginTop:8,lineHeight:1.5}}>{etat}</div>}
      <div style={{fontSize:9.5,color:C.light,marginTop:9,lineHeight:1.5}}>pour supprimer aussi ton compte, écris à contact@sopklife.com.</div>
    </div>);
}
