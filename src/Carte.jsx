import { useState } from "react";
import { PRIOS, TEMPS, MASQUES, QUOTIDIEN, compris, pasMoi } from "./Perso.jsx";
import { RESUMES, nbFiges, ordreValide, placerFertilite } from "./Parcours.jsx";

// ═══════════════════════════════════════════════════════════════════════════
// MA CARTE SMOP et AUJOURD'HUI, POUR TOI — étape 3 de la personnalisation
// Tout est composé à partir de ses réponses et de ce qu'elle fait, par des règles simples.
// Rien ici ne laisse croire qu'une personne écrit en direct.
// ═══════════════════════════════════════════════════════════════════════════

const nomDe = (l,k) => { const x=l.find(y=>y[0]===k); return x?x[1]:""; };
const majus = (t) => String(t||"").replace(/^./,c=>c.toUpperCase());
const lien = (C) => ({background:"none",border:"none",padding:0,color:C.mid,fontFamily:"inherit",fontSize:11,cursor:"pointer",textDecoration:"underline"});

// ce qu'elle peut ouvrir tout de suite, selon ce qui compte pour elle
const EXPLORER = {
  fringales:[["sos:fringale","Quand la fringale monte","le bon geste, tout de suite","alert"],["outil:alimentation/assiette","L'assiette SMOP","composer sans peser","leaf"],["outil:alimentation/planif","Planifier ma semaine","moins de décisions le soir","calendar"],["outil:alimentation/sucres","Sucres cachés","repérer les pièges","leaf"]],
  douleurs:[["sos:douleurs","Quand ça fait mal","des gestes doux","alert"],["sos:ventre","Ventre gonflé","comprendre et soulager","alert"],["bouger:mobilite","Délier ton corps","une séance douce","steps"],["tab:cycle","Mon cycle","repérer quand ça revient","moon"]],
  peau:[["sos:acne","Poussée d'acné","quoi faire, quoi éviter","alert"],["sos:cheveux","Cheveux","comprendre la chute","alert"],["tab:tendances","Mes tendances","ce qui change avec le temps","pulse"],["outil:comprendre/fiches","Fiches SMOP","les repères à garder","book"]],
  stress:[["sos:stress","Faire redescendre","une respiration guidée","alert"],["tab:sommeil","Mon sommeil","tes nuits et ton rituel","bed"],["tab:ancrage","Mon ancrage","vider ta tête","heart"],["sos:reveil3h","Réveil à 3h","comprendre ces nuits-là","alert"]],
  cycle:[["tab:cycle","Mon cycle","tes règles et tes signes","moon"],["sos:regles","Règles absentes","ce que ça peut dire","alert"],["sos:spm","Avant les règles","des gestes pour ces jours-là","alert"],["tab:tendances","Mes tendances","ce que ton cycle raconte","pulse"]],
  comprendre:[["outil:comprendre/comprendre","Comprendre","les mécanismes, sans jargon","book"],["tab:medecin","Mon dossier médecin","préparer ton rendez-vous","doctor"],["tab:analyses","Mes analyses","lire tes résultats","flask"],["tab:diag","Tu viens d'être diagnostiquée","par où commencer","heart"]],
};
const ICONES = {1:"leaf",2:"bolt",3:"flame",4:"brain",5:"moon",6:"sparkle",7:"pulse",8:"steps",9:"drop",10:"doctor",11:"heart",12:"home"};
const PRIO_DE = {2:["fringales"],8:["fringales"],9:["fringales"],3:["douleurs"],5:["douleurs","cycle"],6:["peau"],4:["stress"],11:["cycle"],10:["comprendre"],7:["comprendre"]};
const pourquoiLa = (c,perso) => { const p=((perso&&perso.priorites)||[]).find(x=>(PRIO_DE[c]||[]).includes(x));
  if(p) return "parce que tu as choisi « "+nomDe(PRIOS,p)+" ».";
  if(c===1) return "la base commune à tout le monde, pour démarrer solide.";
  if(c===12) return "pour finir : garder ce qui marche pour toi.";
  if(c===10&&perso&&(perso.stade==="cherche"||perso.stade==="vient")) return "parce que tu es en plein dans les rendez-vous.";
  return "il vient compléter le reste, quand tes priorités auront été travaillées."; };

// ── LA CARTE ──
export function CarteVivante({C,pc,Icon,prenom,perso,etat,setEtat,jour,ordre,mois,mois0,changerOrdre,checked,missionPour,estBilan,ouvrir,voirJour,aller}){
  const [sel,setSel]=useState(null);
  const prios=(perso&&perso.priorites)||[]; const choisis=mois.filter(m=>(PRIO_DE[m.c]||[]).some(p=>prios.includes(p))).map(m=>m.c);
  const etatDe=(m)=>jour>m.b?"fait":jour>=m.a?"ici":"avenir"; const faits=(m)=>{ let n=0; for(let d=m.a;d<=m.b;d++) if(checked[d]) n++; return n; };
  const W=100, X=[16,50,84], H=112; const pos=mois.map((m,i)=>{ const r=Math.floor(i/3), k=i%3; return {x:X[r%2?2-k:k],y:46+r*H}; });
  let chemin="M"+pos[0].x+" "+pos[0].y; for(let i=1;i<pos.length;i++){ const a=pos[i-1],b=pos[i]; chemin+= a.y===b.y ? " L"+b.x+" "+b.y : " C"+(a.x>50?100:0)+" "+a.y+" "+(b.x>50?100:0)+" "+b.y+" "+b.x+" "+b.y; }
  const iIci=mois.findIndex(m=>etatDe(m)==="ici"); const ici=mois[iIci]; const suite=mois.filter(m=>etatDe(m)==="avenir").slice(0,3);
  const carte={background:C.white,border:`1px solid ${C.border}`,borderRadius:18,padding:"14px",marginBottom:12};
  const titre={fontFamily:"'Playfair Display',serif",fontSize:"1.08rem",fontWeight:600,color:C.brown,marginBottom:3};
  const sous={fontSize:11,color:C.mid,lineHeight:1.55,marginBottom:10};
  const deb=nbFiges(ordre,jour,mois0);
  const enPremier=(c)=>{ const o=ordreValide(ordre).filter(x=>x!==c); const n=[...o.slice(0,deb),c,...o.slice(deb)]; changerOrdre(placerFertilite(n,ordre.slice(0,deb),perso),true); };
  const m=sel&&mois.find(x=>x.c===sel);
  const apercu=(x)=>{ const t=[]; for(let d=x.a;d<=x.b&&t.length<4;d++){ if(estBilan(d)) continue; const mi=missionPour(d); if(mi._geste) continue; t.push({d,theme:mi.theme}); if(t.length===1) d+=3; else d+=5; } return t; };
  const tuile=(t,k)=>(<button key={k} onClick={()=>aller(t[0])} style={{display:"flex",alignItems:"center",gap:10,background:C.cream,border:`1px solid ${C.border}`,borderRadius:13,padding:"10px 11px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",minWidth:0}}>
    <Icon name={t[3]} size={17} color={C.terra}/><span style={{minWidth:0}}><span style={{display:"block",fontSize:11.5,fontWeight:700,color:C.brown,lineHeight:1.25}}>{t[1]}</span><span style={{display:"block",fontSize:10,color:C.mid,lineHeight:1.35}}>{t[2]}</span></span></button>);
  const tuiles=[]; const vus=new Set(); const listes=prios.map(p=>EXPLORER[p]||[]); for(let i=0;i<4;i++) listes.forEach(l=>{ if(l[i]&&!vus.has(l[i][0])){ vus.add(l[i][0]); tuiles.push(l[i]); } });
  const histo=(etat.histo||[]).slice(-5).reverse(); const masques=((perso&&perso.masques)||[]);
  return (
    <div>
      <div style={{marginBottom:12}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,color:C.brown,fontWeight:600}}>Ma carte SMOP</div>
        <div style={{fontSize:11.5,color:C.mid,marginTop:3,lineHeight:1.55}}>{perso?(prenom?prenom+", ":"")+"ce chemin est composé à partir de tes réponses, et il change avec toi.":"ton chemin sur l'année. réponds à six questions et il se dessine selon ce qui compte pour toi."}</div>
      </div>

      {!perso&&<button onClick={ouvrir} style={{...carte,width:"100%",background:`linear-gradient(135deg,${C.mauveSoft},#fff)`,border:`1.5px solid ${C.mauve}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}><span style={{display:"block",fontSize:13,fontWeight:700,color:C.brown}}>Dessiner ma carte</span><span style={{display:"block",fontSize:11,color:C.mid,lineHeight:1.45}}>six questions, 90 secondes</span></button>}

      {/* le chemin */}
      <div style={{...carte,padding:"10px 6px 6px",background:`linear-gradient(180deg,${C.white},${C.mauveSoft})`}}>
        <div style={{position:"relative",height:46+3*H+74}}>
          <svg viewBox={"0 0 "+W+" "+(46+3*H+74)} preserveAspectRatio="none" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} aria-hidden="true">
            <path d={chemin} fill="none" stroke={C.border} strokeWidth="3" strokeDasharray="5 6" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
          </svg>
          {mois.map((x,i)=>{ const e=etatDe(x), fav=choisis.includes(x.c), pause=x.c===11&&masques.includes("fertilite"); const on=sel===x.c;
            return (
            <button key={x.c} onClick={()=>setSel(on?null:x.c)} aria-pressed={on} aria-label={x.label+(e==="ici"?", tu es ici":e==="fait"?", traversé":", à venir")} style={{position:"absolute",left:pos[i].x+"%",top:pos[i].y,transform:"translate(-50%,-28px)",width:104,background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
              <span style={{position:"relative",display:"inline-flex",width:54,height:54,borderRadius:"50%",alignItems:"center",justifyContent:"center",background:e==="ici"?C.terra:e==="fait"?"#F4E8DE":C.white,border:`2.5px ${e==="avenir"&&!fav?"dashed":"solid"} ${on?C.brown:e==="ici"||e==="fait"?C.terra:fav?C.mauve:C.border}`,boxShadow:e==="ici"?`0 0 0 6px ${C.terra}2B`:"none"}}>
                <Icon name={ICONES[x.c]} size={21} color={e==="ici"?"#fff":e==="fait"?C.terra:fav?C.mauve:C.light}/>
                {fav&&<span style={{position:"absolute",right:-4,top:-4,width:19,height:19,borderRadius:"50%",background:C.mauve,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"}}><Icon name="heart" size={9} color="#fff"/></span>}
                {e==="fait"&&<span style={{position:"absolute",right:-3,bottom:-3,width:18,height:18,borderRadius:"50%",background:C.terra,color:"#fff",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"}}>✓</span>}
              </span>
              <span style={{display:"block",fontSize:11,fontWeight:e==="ici"||fav?700:500,color:e==="avenir"&&!fav?C.mid:C.brown,lineHeight:1.2,marginTop:5}}>{x.label}</span>
              {e==="ici"&&<span style={{display:"block",fontSize:9.5,color:C.terra,fontWeight:700}}>tu es ici</span>}
              {pause&&<span style={{display:"block",fontSize:9.5,color:C.light}}>en partie en pause</span>}
            </button>); })}
        </div>
        {perso&&<div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",fontSize:10,color:C.mid,padding:"2px 0 8px"}}><span><span style={{color:C.mauve}}>●</span> ce que tu as choisi</span><span><span style={{color:C.terra}}>●</span> traversé ou en cours</span><span>○ à venir</span></div>}
      </div>

      {/* le détail d'une étape */}
      {m&&<div style={{...carte,border:`1.5px solid ${C.terra}`}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}><div style={{flex:1}}><div style={titre}>{m.label}</div><div style={{fontSize:11,color:C.light}}>{RESUMES[m.c]}</div></div><button onClick={()=>setSel(null)} aria-label="fermer" style={{background:"none",border:"none",color:C.light,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>✕</button></div>
        <div style={{borderLeft:`3px solid ${C.mauve}`,padding:"2px 0 2px 10px",margin:"9px 0"}}><div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:C.mauve,fontWeight:700}}>pourquoi ici</div><div style={{fontSize:11.5,color:C.brown,lineHeight:1.5}}>{pourquoiLa(m.c,perso)}</div></div>
        {etatDe(m)!=="avenir"&&<div style={{fontSize:11,color:C.mid,marginBottom:8}}>{faits(m)} mission{faits(m)>1?"s":""} validée{faits(m)>1?"s":""} dans ce chapitre. il n'y a rien à rattraper.</div>}
        <div style={{fontSize:11,fontWeight:700,color:C.brown,marginBottom:4}}>ce que tu vas y explorer</div>
        {apercu(m).map(t=><button key={t.d} onClick={()=>voirJour(t.d)} style={{display:"block",width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:`1px solid ${C.border}`,padding:"7px 0",fontFamily:"inherit",fontSize:11.5,color:C.brown,cursor:"pointer"}}>{majus(t.theme)} <span style={{color:C.light}}>›</span></button>)}
        {m.c>1&&m.c<12&&etatDe(m)==="avenir"&&perso&&ordre.indexOf(m.c)>deb&&!(m.c===11&&ordre.indexOf(5)>=deb)&&!(m.c===11&&masques.includes("fertilite"))&&<button onClick={()=>enPremier(m.c)} style={{width:"100%",marginTop:11,background:C.terra,border:"none",borderRadius:12,padding:"11px",color:"#fff",fontFamily:"inherit",fontSize:12.5,fontWeight:700,cursor:"pointer"}}>commencer par ce chapitre</button>}
      </div>}

      {perso&&<div style={carte}>
        <div style={titre}>Ce que tu as choisi</div>
        <div style={sous}>tes priorités du moment, et où elles t'emmènent.</div>
        {prios.map(p=>{ const ch=mois.filter(x=>(PRIO_DE[x.c]||[]).includes(p)); return (
          <div key={p} style={{background:C.mauveSoft,borderRadius:13,padding:"11px 12px",marginBottom:8}}><div style={{fontSize:12.5,fontWeight:700,color:C.brown}}>{majus(nomDe(PRIOS,p))}</div><div style={{fontSize:11,color:C.mid,lineHeight:1.5,marginTop:2}}>{ch.length?ch.map(x=>x.label).join(" · "):"présente dans toute ta Fondation"}</div></div>); })}
        <button onClick={ouvrir} style={lien(C)}>changer mes priorités</button>
      </div>}

      {tuiles.length>0&&<div style={carte}>
        <div style={titre}>À explorer dès maintenant</div>
        <div style={sous}>sans attendre ton jour, quand tu en as envie.</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}}>{tuiles.slice(0,6).map(tuile)}</div>
      </div>}

      {suite.length>0&&<div style={carte}>
        <div style={titre}>Ce qui pourra venir ensuite</div>
        <div style={sous}>{ici?"après "+ici.label+". rien n'est figé, tu peux changer l'ordre.":"rien n'est figé, tu peux changer l'ordre."}</div>
        {suite.map((x,i)=><button key={x.c} onClick={()=>{ setSel(x.c); try{ window.scrollTo({top:0,behavior:"smooth"}); }catch(e){} }} style={{width:"100%",display:"flex",gap:11,alignItems:"center",background:"none",border:"none",borderTop:i?`1px solid ${C.border}`:"none",padding:"9px 0",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}><Icon name={ICONES[x.c]} size={18} color={choisis.includes(x.c)?C.mauve:C.light}/><span style={{flex:1}}><span style={{display:"block",fontSize:12.5,fontWeight:700,color:C.brown}}>{x.label}</span><span style={{display:"block",fontSize:10.5,color:C.mid,lineHeight:1.45}}>{perso?pourquoiLa(x.c,perso):RESUMES[x.c]}</span></span><span style={{color:C.light}}>›</span></button>)}
      </div>}

      {masques.length>0&&<div style={carte}><div style={titre}>En pause, à ta demande</div><div style={{...sous,marginBottom:6}}>{masques.map(k=>nomDe(MASQUES,k)).join(" · ")}. tu peux les rouvrir quand tu veux.</div><button onClick={ouvrir} style={lien(C)}>modifier</button></div>}

      {perso&&<div style={carte}>
        <div style={titre}>Comment ton programme s'est adapté</div>
        {histo.length?histo.map((h,i)=><div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderTop:i?`1px solid ${C.border}`:"none"}}><span style={{fontSize:10,color:C.light,width:54,flexShrink:0}}>{new Date(h.le+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span><span style={{fontSize:11.5,color:C.brown,lineHeight:1.45}}>{h.t}</span></div>):<div style={{fontSize:11.5,color:C.mid,lineHeight:1.55}}>chaque fois que tu réponds à une mission ou que tu changes un choix, l'ajustement apparaît ici.</div>}
      </div>}
    </div>);
}

// ── AUJOURD'HUI, POUR TOI : « bon, je fais quoi aujourd'hui ? » ──
const IDEES = {
  fringales:{matin:["recette:matin","un petit-déj qui te cale","une idée rapide, prête à suivre"],midi:["tab:bouger","marcher un peu après ton repas","10 minutes, sans objectif"],soir:["recette:soir","une idée de dîner rapide","une seule recette, pas de choix à faire"]},
  stress:{matin:["tab:ancrage","deux minutes pour toi avant de commencer","une phrase, un souffle"],midi:["sos:stress","faire redescendre la pression","une respiration guidée"],soir:["tab:sommeil","préparer une nuit plus calme","ton petit rituel du soir"]},
  peau:{matin:["recette:matin","un petit-déj simple","une idée rapide, prête à suivre"],midi:["outil:comprendre/fiches","lire une fiche courte","deux minutes pour comprendre"],soir:["tab:suivi","noter ta peau","20 secondes, pour voir ce qui change"]},
  douleurs:{matin:["bouger:mobilite","délier ton corps en douceur","une séance à ton énergie"],midi:["sos:ventre","si ton ventre te gêne","des gestes doux"],soir:["bouger:mobilite","relâcher avant la nuit","une séance douce"]},
  cycle:{matin:["tab:cycle","noter où tu en es","règles, signes, température"],midi:["tab:tendances","regarder ce que ton cycle raconte","tes dernières semaines"],soir:["tab:cycle","noter tes signes du jour","20 secondes"]},
  comprendre:{matin:["outil:comprendre/comprendre","une explication courte","un mécanisme, sans jargon"],midi:["tab:medecin","ajouter une question pour ton médecin","elle t'attendra dans ton dossier"],soir:["outil:comprendre/fiches","lire une fiche courte","deux minutes pour comprendre"]},
};
const DUREE = {express:"2 min",classique:"10 min",approfondi:"20 min"};
export function AujourdhuiPourToi({C,pc,Icon,perso,etat,setEtat,energie,niveau,mission,fait,tisane,prendreTisane,journeeNotee,aller,ouvrirMission,dateJour}){
  const a=etat.auj&&etat.auj.le===dateJour?etat.auj:{le:dateJour,n:0,fait2:false};
  const majA=(x)=>setEtat(e=>({...e,auj:{...a,...x}}));
  const h=new Date().getHours(); const moment=h<11?"matin":h<17?"midi":"soir"; const basse=energie==="basse";
  const p=perso.priorites||[]; const idees=[...p.map(k=>({k,i:(IDEES[k]||{})[moment]})),...p.map(k=>({k,i:(IDEES[k]||{})[moment==="matin"?"soir":moment==="midi"?"matin":"midi"]}))].filter(x=>x.i).filter((x,i,l)=>l.findIndex(y=>y.i[0]===x.i[0]&&y.i[1]===x.i[1])===i);
  const idee=idees.length?idees[a.n%idees.length]:null;
  const etapes=[{t:majus(mission.theme),d:mission._geste?"un petit geste":"ta mission du jour · "+DUREE[niveau],fait,go:ouvrirMission,q:"l'essentiel"}];
  if(!basse&&idee) etapes.push({t:majus(idee.i[1]),d:idee.i[2],fait:a.fait2,go:()=>{ majA({fait2:true}); aller(idee.i[0]); },q:"si tu peux",autre:idees.length>1&&!a.fait2?()=>majA({n:a.n+1}):null});
  if(tisane) etapes.push({t:"Ta tisane : "+tisane,d:"touche pour la noter comme prise",fait:false,go:prendreTisane,q:"pour toi"});
  else if(!basse&&!journeeNotee) etapes.push({t:"Noter ta journée",d:"20 secondes, pour que ton espace te connaisse mieux",fait:false,go:()=>aller("tab:suivi"),q:"pour toi"});
  const base=[p.length?"ta priorité ("+nomDe(PRIOS,p[0])+")":"",perso.temps?"tes "+nomDe(TEMPS,perso.temps):"",energie?"ton énergie "+({haute:"plutôt bonne",moyenne:"moyenne",basse:"basse"})[energie]:"",(etat.legerJusqu&&dateJour<=etat.legerJusqu)?"ta période légère":""].filter(Boolean);
  const dit=base.length>1?base.slice(0,-1).join(", ")+" et "+base[base.length-1]:base[0]||"";
  const n=etapes.filter(x=>x.fait).length;
  return (
    <div style={{background:`linear-gradient(150deg,${C.mauveSoft},${C.white})`,border:`1.5px solid ${C.mauve}`,borderRadius:20,padding:"15px 14px",marginBottom:12}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",fontWeight:600,color:C.brown,lineHeight:1.2}}>Aujourd'hui, pour toi</div>
      {dit&&<div style={{fontSize:11,color:C.mid,lineHeight:1.5,margin:"3px 0 10px"}}>choisi d'après {dit}.</div>}
      {etapes.map((x,i)=>(
        <div key={i} style={{background:C.white,border:`1px solid ${x.fait?C.mauve:C.border}`,borderRadius:14,marginBottom:8,opacity:x.fait?.7:1}}>
          <button onClick={x.go} style={{width:"100%",display:"flex",alignItems:"center",gap:11,background:"none",border:"none",padding:"11px 12px",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
            <span style={{width:26,height:26,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:x.fait?C.mauve:i===0?C.terra:C.cream,color:x.fait||i===0?"#fff":C.mid,border:x.fait||i===0?"none":`1px solid ${C.border}`}}>{x.fait?"✓":i+1}</span>
            <span style={{flex:1,minWidth:0}}><span style={{display:"block",fontSize:9,letterSpacing:1,textTransform:"uppercase",color:i===0?C.terra:C.light,fontWeight:700}}>{x.q}</span><span style={{display:"block",fontSize:13,fontWeight:700,color:C.brown,lineHeight:1.3}}>{x.t}</span><span style={{display:"block",fontSize:10.5,color:C.mid,lineHeight:1.4}}>{x.d}</span></span>
            <span style={{color:C.light}}>›</span>
          </button>
          {x.autre&&<div style={{padding:"0 12px 9px 49px"}}><button onClick={x.autre} style={lien(C)}>une autre idée</button></div>}
        </div>))}
      <div style={{fontSize:11,color:C.mid,lineHeight:1.5}}>{fait?(n===etapes.length?"c'est bon pour aujourd'hui. tu peux souffler.":"l'essentiel est fait. le reste est en plus."):basse?"journée fatiguée : une seule chose, en petit. et si tu ne fais rien, c'est ok aussi.":"l'essentiel suffit. le reste, c'est si tu en as envie."}</div>
    </div>);
}
