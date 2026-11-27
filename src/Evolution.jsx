import { useState } from "react";
import { Feuille, puce, plein, lien, jourLocal } from "./Perso.jsx";

// ═══════════════════════════════════════════════════════════════════════════
// MON ÉVOLUTION — étape 1 : le point de départ
// Ses objectifs, et un bilan de départ facultatif, daté, jamais écrasé.
// Tout est rangé dans une seule clé du bloc de l'utilisatrice (sopklife_evo), sauvegardée comme le reste.
// Ce qu'elle note est son ressenti, pas une mesure médicale. Aucune recommandation médicale.
// ═══════════════════════════════════════════════════════════════════════════

export const EVO_VIDE = { accord: null, objectifs: [], bilans: [], cap: null, brouillon: null };

// [clé, titre, repères proposés, première action (lien), première action (texte)]
export const OBJECTIFS = [
  ["energie", "Retrouver davantage d'énergie", ["energie", "sommeil"], "bouger:marche", "une marche de 10 minutes, après un repas"],
  ["sommeil", "Améliorer mon sommeil", ["sommeil", "energie"], "tab:sommeil", "noter tes nuits quelques jours"],
  ["cycle", "Mieux comprendre mon cycle", ["cycle", "regles"], "tab:cycle", "noter tes règles et tes signes du jour"],
  ["alimentation", "Construire des habitudes alimentaires adaptées", ["habitudes", "organisation"], "outil:alimentation/assiette", "découvrir l'assiette SMOP"],
  ["mouvement", "Développer une activité physique régulière", ["habitudes", "energie"], "bouger:mobilite", "une première séance douce dans Bouger"],
  ["profil", "Mieux comprendre mon profil métabolique", ["comprehension"], "outil:comprendre/comprendre", "lire les mécanismes du SMOP"],
  ["quotidien", "Mieux vivre mon quotidien avec le SMOP", ["organisation", "energie"], "outil:quotidien/situations", "un guide pour les situations du quotidien"],
  ["besoins", "Mieux comprendre mon fonctionnement et mes besoins", ["comprehension", "energie"], "tab:journal", "écrire ce soir dans ton journal"],
];
export const INDICATEURS = [
  ["energie", "Énergie ressentie"], ["sommeil", "Qualité du sommeil"], ["organisation", "Organisation au quotidien"],
  ["comprehension", "Compréhension de mon SMOP"], ["habitudes", "Régularité de mes habitudes"],
  ["cycle", "Compréhension de mon cycle"], ["regles", "Confort pendant les règles"],
];
const HORIZONS = [[1, "dans 1 mois"], [3, "dans 3 mois"], [6, "dans 6 mois"], [0, "sans horizon"]];
// ses priorités (les six questions) pré-cochent des objectifs
const DEPUIS_PRIO = { fringales: ["energie", "alimentation"], douleurs: ["quotidien"], peau: ["besoins"], stress: ["sommeil"], cycle: ["cycle"], comprendre: ["profil"] };
const ACTION_LIBRE = ["tab:kamila", "ta mission du jour, sur l'accueil"];

const nouvelId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const nomObj = (k) => (OBJECTIFS.find(o => o[0] === k) || [])[1] || "";
const nomInd = (k) => (INDICATEURS.find(i => i[0] === k) || [])[1] || k;
const dateFr = (iso, an) => { try { return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", an ? { day: "numeric", month: "long", year: "numeric" } : { day: "numeric", month: "long" }); } catch (e) { return iso; } };
const moisFr = (iso) => { try { return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { month: "long", year: "numeric" }); } catch (e) { return iso; } };
const plusMois = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10); };
const propre = (t, n) => String(t || "").trim().slice(0, n);

// ── lecture ──
export const evoValide = (e) => ({ ...EVO_VIDE, ...(e && typeof e === "object" ? e : {}), objectifs: Array.isArray(e && e.objectifs) ? e.objectifs : [], bilans: Array.isArray(e && e.bilans) ? e.bilans : [] });
export const objectifsActifs = (e) => evoValide(e).objectifs.filter(o => o.statut !== "pause").sort((a, b) => (a.priorite === "principal" ? -1 : 0) - (b.priorite === "principal" ? -1 : 0));
export const objectifPrincipal = (e) => objectifsActifs(e).find(o => o.priorite === "principal") || objectifsActifs(e)[0] || null;
// le point de départ : la dernière version du bilan de départ (les versions précédentes restent dans l'historique)
export const departs = (e) => evoValide(e).bilans.filter(b => b.type === "depart").sort((a, b) => (a.version || 1) - (b.version || 1));
export const depart = (e) => { const d = departs(e); return d.length ? d[d.length - 1] : null; };
const actionDe = (o) => { if (!o) return null; const x = OBJECTIFS.find(y => y[0] === o.cle); return x ? { cible: x[3], titre: x[4] } : { cible: ACTION_LIBRE[0], titre: ACTION_LIBRE[1] }; };

// ── deux appareils : on fusionne au lieu d'écraser (rien de ce qui a été noté ne se perd) ──
export const fusionEvo = (a, b) => {
  const x = evoValide(a), y = evoValide(b);
  const parId = (l1, l2) => { const m = {}; [...l1, ...l2].forEach(o => { if (!o || !o.id) return; const p = m[o.id]; if (!p || String(o.maj || o.ts || "") > String(p.maj || p.ts || "")) m[o.id] = o; }); return Object.values(m); };
  const cap = [x.cap, y.cap].filter(Boolean).sort((p, q) => String(q.le || "").localeCompare(String(p.le || "")))[0] || null;
  const accord = [x.accord, y.accord].filter(Boolean).sort((p, q) => String(p.le || "").localeCompare(String(q.le || "")))[0] || null;
  return { ...x, accord, cap, objectifs: parId(x.objectifs, y.objectifs), bilans: parId(x.bilans, y.bilans), brouillon: x.brouillon || y.brouillon || null };
};

// ═══ le premier passage : accord, objectifs, détails, bilan, première action ═══
export function DepartEvolution({ C, evo, setEvo, perso, onClose, aller, corriger }) {
  const e = evoValide(evo);
  const dejaObj = e.objectifs.length > 0;
  const prio = (perso && perso.priorites) || [];
  const proposes = [...new Set(prio.flatMap(p => DEPUIS_PRIO[p] || []))];
  const [b, setB] = useState(() => (corriger && depart(e)) ? { principal: "", libre: "", secondaires: [], description: "", motivation: "", voir: "", horizon: null, valeurs: { ...(depart(e).valeurs || {}) }, difficulte: depart(e).difficulte || "", jaimerais: depart(e).jaimerais || "", tous: false } : e.brouillon || {
    principal: dejaObj ? "" : (proposes[0] || ""), libre: "", secondaires: dejaObj ? [] : proposes.slice(1, 3),
    description: "", motivation: "", voir: "", horizon: null, valeurs: {}, difficulte: "", jaimerais: (perso && perso.phrase) || "", tous: false,
  });
  const [etape, setEtape] = useState(() => corriger ? 3 : !e.accord ? 0 : dejaObj ? 3 : (e.brouillon && e.brouillon.etape) || 1);
  const [accord, setAccord] = useState(false);
  const [erreur, setErreur] = useState("");
  const maj = (k, v) => setB(x => ({ ...x, [k]: v }));
  const garder = (et) => setEvo(z => ({ ...evoValide(z), brouillon: { ...b, etape: et } }));
  const fermer = () => { if (etape > 0 && etape < 4 && !corriger) garder(etape); onClose(); };
  const auj = jourLocal();
  const dep = depart(e);

  // enregistre les objectifs choisis (étapes 1-2)
  const enregistrerObjectifs = () => {
    const cle = b.principal === "libre" ? "libre" : b.principal;
    const titre = cle === "libre" ? propre(b.libre, 80) : nomObj(cle);
    if (!titre) { setErreur("choisis un objectif, ou écris le tien."); return false; }
    const ts = new Date().toISOString();
    const hz = b.horizon ? plusMois(auj, b.horizon) : "";
    const principalO = { id: nouvelId(), cle, titre, description: propre(b.description, 300), motivation: propre(b.motivation, 300), voir: propre(b.voir, 300),
      horizon: b.horizon || 0, horizonLe: hz, priorite: "principal", statut: "actif", cree: auj, maj: ts, histo: [{ le: auj, t: "objectif posé" }] };
    const sec = b.secondaires.filter(k => k !== cle).map(k => ({ id: nouvelId(), cle: k, titre: nomObj(k), description: "", motivation: "", voir: "", horizon: 0, horizonLe: "",
      priorite: "secondaire", statut: "actif", cree: auj, maj: ts, histo: [{ le: auj, t: "objectif posé" }] }));
    setEvo(z => { const y = evoValide(z); const a = actionDe(principalO);
      return { ...y, objectifs: [...y.objectifs.map(o => o.priorite === "principal" ? { ...o, priorite: "secondaire", maj: ts } : o), principalO, ...sec],
        cap: { objectifId: principalO.id, action: a, le: ts }, brouillon: { ...b, etape: 3 } }; });
    setErreur(""); return true;
  };
  // enregistre le bilan de départ (ou une nouvelle version, sans effacer l'ancienne)
  const enregistrerBilan = () => {
    const valeurs = Object.fromEntries(Object.entries(b.valeurs).filter(([, v]) => typeof v === "number" && v >= 1 && v <= 10));
    const ts = new Date().toISOString();
    const version = dep ? (dep.version || 1) + 1 : 1;
    const bilan = { id: nouvelId(), type: "depart", version, remplace: dep ? dep.id : null, le: auj, ts, maj: ts, valeurs,
      difficulte: propre(b.difficulte, 300), jaimerais: propre(b.jaimerais, 300), objectifs: objectifsActifs(e).map(o => o.id) };
    setEvo(z => { const y = evoValide(z); return { ...y, bilans: [...y.bilans, bilan], brouillon: null }; });
  };

  const champTexte = (k, ph, n = 300) => <textarea value={b[k]} maxLength={n} onChange={ev => maj(k, ev.target.value)} placeholder={ph} rows={2}
    style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 11px", fontFamily: "inherit", fontSize: 16, color: C.brown, background: C.white, resize: "vertical" }} />;
  const etiquette = (t, s) => <div style={{ margin: "14px 0 6px" }}><div style={{ fontSize: 12.5, fontWeight: 700, color: C.brown }}>{t}</div>{s && <div style={{ fontSize: 10.5, color: C.light, marginTop: 1 }}>{s}</div>}</div>;

  if (etape === 0) return (
    <Feuille C={C} titre="Mon évolution" onClose={fermer}>
      <div style={{ fontSize: 12.5, color: C.mid, lineHeight: 1.65, marginBottom: 12 }}>
        un espace pour voir ton chemin : d'où tu pars, ce que tu fais, où tu veux aller. on commence par ton point de départ, en trois minutes. tu peux passer chaque question et revenir plus tard.
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 12, fontSize: 11.5, color: C.mid, lineHeight: 1.65 }}>
        <div style={{ fontWeight: 700, color: C.brown, marginBottom: 4 }}>avant de commencer</div>
        tes objectifs et ton ressenti parlent de ta santé. ils sont enregistrés sur ton compte, chez notre hébergeur, et servent seulement à te montrer ton évolution. ce que tu notes est ton ressenti, pas une mesure médicale. tu peux tout modifier, récupérer ou effacer depuis Mon compte.
      </div>
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12, color: C.brown, lineHeight: 1.5, marginBottom: 14, cursor: "pointer" }}>
        <input type="checkbox" checked={accord} onChange={ev => setAccord(ev.target.checked)} style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0 }} />
        <span>je suis d'accord pour que mes objectifs et mes bilans soient enregistrés pour suivre mon évolution.</span>
      </label>
      <button disabled={!accord} onClick={() => { setEvo(z => ({ ...evoValide(z), accord: { le: auj, version: 1 } })); setEtape(dejaObj ? 3 : 1); }} style={{ ...plein(C), opacity: accord ? 1 : .45, cursor: accord ? "pointer" : "default" }}>commencer</button>
      <div style={{ textAlign: "center", marginTop: 12 }}><button onClick={onClose} style={lien(C)}>plus tard</button></div>
    </Feuille>);

  if (etape === 1) return (
    <Feuille C={C} titre="Ton objectif" onClose={fermer}>
      <div style={{ fontSize: 10, color: C.light, marginBottom: 4 }}>1 sur 3</div>
      <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.55 }}>vers quoi tu as envie d'avancer en premier ?{proposes.length > 0 && " on a pré-coché d'après tes priorités : change ce que tu veux."}</div>
      {etiquette("Mon objectif principal")}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {OBJECTIFS.map(([k, t]) => <button key={k} aria-pressed={b.principal === k} onClick={() => { maj("principal", k); setB(x => ({ ...x, principal: k, secondaires: x.secondaires.filter(s => s !== k) })); }} style={{ ...puce(C, b.principal === k), textAlign: "left", borderRadius: 14 }}>{t}</button>)}
        <button aria-pressed={b.principal === "libre"} onClick={() => maj("principal", "libre")} style={{ ...puce(C, b.principal === "libre"), textAlign: "left", borderRadius: 14 }}>mon objectif à moi</button>
        {b.principal === "libre" && <input value={b.libre} maxLength={80} onChange={ev => maj("libre", ev.target.value)} placeholder="par exemple : tenir mes journées de travail sans m'écrouler" aria-label="mon objectif à moi"
          style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.terra}`, borderRadius: 12, padding: "10px 11px", fontFamily: "inherit", fontSize: 16, color: C.brown, background: C.white }} />}
      </div>
      {etiquette("D'autres objectifs, à côté ?", "facultatif, trois au plus.")}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {OBJECTIFS.filter(([k]) => k !== b.principal).map(([k, t]) => { const on = b.secondaires.includes(k); return <button key={k} aria-pressed={on} onClick={() => setB(x => ({ ...x, secondaires: on ? x.secondaires.filter(s => s !== k) : [...x.secondaires, k].slice(-3) }))} style={{ ...puce(C, on), fontSize: 11.5, padding: "7px 11px" }}>{t}</button>; })}
      </div>
      {erreur && <div role="alert" style={{ fontSize: 11.5, color: "#B5553F", marginTop: 10 }}>{erreur}</div>}
      <button onClick={() => { const ok = b.principal && (b.principal !== "libre" || propre(b.libre, 80)); if (!ok) { setErreur("choisis un objectif, ou écris le tien."); return; } setErreur(""); garder(2); setEtape(2); }} style={{ ...plein(C), marginTop: 16, opacity: b.principal ? 1 : .45 }}>continuer</button>
    </Feuille>);

  if (etape === 2) return (
    <Feuille C={C} titre="Pour toi, ça veut dire quoi ?" onClose={fermer}>
      <div style={{ fontSize: 10, color: C.light, marginBottom: 4 }}>2 sur 3 · tout est facultatif</div>
      <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.55 }}>{b.principal === "libre" ? propre(b.libre, 80) : nomObj(b.principal)}</div>
      {etiquette("Avec tes mots")}{champTexte("description", "ce que ça veut dire pour toi, concrètement")}
      {etiquette("Pourquoi c'est important pour toi")}{champTexte("motivation", "par exemple : ne plus m'écrouler à 15h au travail")}
      {etiquette("Ce que tu aimerais voir changer")}{champTexte("voir", "par exemple : finir mes journées sans être vidée")}
      {etiquette("Un horizon ?")}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{HORIZONS.map(([n, t]) => <button key={n} aria-pressed={b.horizon === n} onClick={() => maj("horizon", n)} style={{ ...puce(C, b.horizon === n), fontSize: 11.5, padding: "7px 11px" }}>{t}</button>)}</div>
      <button onClick={() => { if (enregistrerObjectifs()) setEtape(3); }} style={{ ...plein(C), marginTop: 16 }}>continuer</button>
      <div style={{ textAlign: "center", marginTop: 12 }}><button onClick={() => setEtape(1)} style={lien(C)}>revenir</button></div>
    </Feuille>);

  if (etape === 3) {
    const choisis = corriger || dejaObj ? objectifsActifs(e).map(o => o.cle) : [b.principal, ...b.secondaires];
    const proposesI = [...new Set(choisis.flatMap(k => (OBJECTIFS.find(o => o[0] === k) || [null, null, ["energie", "organisation"]])[2]))];
    const liste = b.tous ? INDICATEURS.map(i => i[0]) : INDICATEURS.map(i => i[0]).filter(k => proposesI.includes(k) || b.valeurs[k]);
    const note = (k, v) => setB(x => ({ ...x, valeurs: { ...x.valeurs, [k]: x.valeurs[k] === v ? undefined : v } }));
    return (
      <Feuille C={C} titre={corriger ? "Corriger mon point de départ" : "Où tu en es aujourd'hui"} onClose={fermer}>
        {!corriger && <div style={{ fontSize: 10, color: C.light, marginBottom: 4 }}>3 sur 3 · facultatif</div>}
        <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.55 }}>{corriger ? "ton départ du " + dateFr(dep ? dep.le : auj) + " reste dans ton historique. ta correction devient ta référence." : "ton ressenti, de 1 à 10. ce n'est pas une note, juste un repère pour voir, plus tard, ce qui a bougé. passe ce que tu ne sais pas."}</div>
        {liste.map(k => (
          <div key={k} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: "10px 11px", marginTop: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 12.5, fontWeight: 700, color: C.brown }}>{nomInd(k)}</span><span style={{ fontSize: 11, color: b.valeurs[k] ? C.terra : C.light, fontWeight: 700 }}>{b.valeurs[k] ? b.valeurs[k] + "/10" : "pas noté"}</span></div>
            <div role="group" aria-label={nomInd(k)} style={{ display: "grid", gridTemplateColumns: "repeat(10,minmax(0,1fr))", gap: 3, marginTop: 7 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => { const on = b.valeurs[k] === n; return <button key={n} aria-pressed={on} aria-label={nomInd(k) + " " + n + " sur 10"} onClick={() => note(k, n)}
                style={{ height: 30, borderRadius: 8, border: `1px solid ${on ? C.terra : C.border}`, background: on ? C.terra : (b.valeurs[k] && n < b.valeurs[k] ? C.bubble : C.cream), color: on ? "#fff" : C.mid, fontFamily: "inherit", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0 }}>{n}</button>; })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.light, marginTop: 3 }}><span>très bas</span><span>très bien</span></div>
          </div>))}
        {!b.tous && <div style={{ marginTop: 8 }}><button onClick={() => maj("tous", true)} style={lien(C)}>voir d'autres repères</button></div>}
        {etiquette("Aujourd'hui, ce qui me pose le plus de difficultés, c'est…")}{champTexte("difficulte", "par exemple : le coup de barre de l'après-midi")}
        {etiquette("Dans quelques mois, j'aimerais pouvoir dire que…")}{champTexte("jaimerais", "par exemple : j'ai retrouvé de l'énergie pour mes soirées")}
        <button onClick={() => { enregistrerBilan(); setEtape(corriger ? 5 : 4); }} style={{ ...plein(C), marginTop: 16 }}>{corriger ? "enregistrer ma correction" : "enregistrer mon point de départ"}</button>
        {!corriger && <div style={{ textAlign: "center", marginTop: 12 }}><button onClick={() => { setEvo(z => ({ ...evoValide(z), brouillon: { ...b, etape: 3 } })); setEtape(4); }} style={lien(C)}>passer le bilan pour l'instant</button></div>}
      </Feuille>);
  }

  if (etape === 5) return (
    <Feuille C={C} titre="C'est corrigé" onClose={onClose}>
      <div style={{ fontSize: 12.5, color: C.mid, lineHeight: 1.6 }}>ta correction est enregistrée. ton départ d'origine reste visible dans l'historique de Mon évolution.</div>
      <button onClick={onClose} style={{ ...plein(C), marginTop: 14 }}>revenir à mon évolution</button>
    </Feuille>);

  // 4 : récapitulatif et première action
  const p = objectifPrincipal(e); const a = (e.cap && e.cap.action) || actionDe(p); const d = depart(e);
  return (
    <Feuille C={C} titre={d ? "Ton point de départ est posé" : "Ton objectif est posé"} onClose={onClose}>
      <div style={{ background: `linear-gradient(150deg,${C.mauveSoft},${C.white})`, border: `1.5px solid ${C.mauve}`, borderRadius: 16, padding: "14px", marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.mauve, fontWeight: 700 }}>ton cap</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 600, color: C.brown, margin: "2px 0 4px" }}>{p ? p.titre : ""}</div>
        <div style={{ fontSize: 11.5, color: C.mid, lineHeight: 1.55 }}>{d ? "ton départ est enregistré, le " + dateFr(d.le) + "." : "ton bilan de départ t'attend dans Mon évolution, quand tu veux."}</div>
      </div>
      {a && <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px" }}>
        <div style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.terra, fontWeight: 700 }}>ta première petite action</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.brown, margin: "3px 0 10px" }}>{a.titre}</div>
        <button onClick={() => { onClose(); aller(a.cible); }} style={plein(C)}>y aller</button>
      </div>}
      <div style={{ textAlign: "center", marginTop: 12 }}><button onClick={onClose} style={lien(C)}>plus tard</button></div>
    </Feuille>);
}

// ═══ sur l'accueil ═══
export function CarteEvolution({ C, Icon, evo, ouvrirDepart, ouvrirPage }) {
  const e = evoValide(evo); const p = objectifPrincipal(e); const d = depart(e);
  const boite = { background: C.white, border: `1.5px solid ${p ? C.border : C.terra}`, borderRadius: 16, padding: "13px 14px", marginBottom: 12 };
  const tete = <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.terra, fontWeight: 700 }}><Icon name="pulse" size={13} color={C.terra} />mon évolution</div>;
  if (!p) return (
    <div style={boite}>{tete}
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.05rem", fontWeight: 600, color: C.brown, margin: "4px 0 3px" }}>Pose ton point de départ</div>
      <div style={{ fontSize: 11.5, color: C.mid, lineHeight: 1.55 }}>ton objectif, et où tu en es aujourd'hui. trois minutes, pour pouvoir voir plus tard le chemin parcouru.</div>
      <button onClick={ouvrirDepart} style={{ width: "100%", marginTop: 10, background: C.terra, border: "none", borderRadius: 11, padding: "10px", color: "#fff", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{e.brouillon ? "reprendre" : "commencer"}</button>
    </div>);
  const a = e.cap && e.cap.action;
  return (
    <button onClick={ouvrirPage} style={{ ...boite, width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit", display: "block" }}>{tete}
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.05rem", fontWeight: 600, color: C.brown, margin: "4px 0 3px" }}>{p.titre}</div>
      <div style={{ fontSize: 11, color: C.mid, lineHeight: 1.55 }}>{d ? "départ posé le " + dateFr(d.le) : "ton bilan de départ t'attend"}{a ? " · prochaine action : " + a.titre : ""}</div>
      <div style={{ fontSize: 11, color: C.terra, fontWeight: 700, marginTop: 6 }}>ouvrir mon évolution ›</div>
    </button>);
}

// ═══ la page Mon évolution ═══
export function MonEvolution({ C, Icon, evo, setEvo, ouvrirDepart, aller }) {
  const e = evoValide(evo);
  const [edite, setEdite] = useState(null);      // objectif en cours de modification
  const [ajout, setAjout] = useState(false);
  const [histo, setHisto] = useState(false);
  const p = objectifPrincipal(e); const d = depart(e); const vers = departs(e);
  const actifs = objectifsActifs(e); const pauses = e.objectifs.filter(o => o.statut === "pause");
  const carte = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px", marginBottom: 12 };
  const lbl = (t, col) => <div style={{ fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: col || C.terra, fontWeight: 700, marginBottom: 5 }}>{t}</div>;
  const majObj = (id, ch, t) => { const ts = new Date().toISOString(); setEvo(z => { const y = evoValide(z); return { ...y, objectifs: y.objectifs.map(o => o.id === id ? { ...o, ...ch, maj: ts, histo: [...(o.histo || []), { le: jourLocal(), t }].slice(-30) } : o) }; }); };
  const devientPrincipal = (id) => { const ts = new Date().toISOString(); setEvo(z => { const y = evoValide(z); const o2 = y.objectifs.find(o => o.id === id);
    return { ...y, objectifs: y.objectifs.map(o => o.id === id ? { ...o, priorite: "principal", statut: "actif", maj: ts, histo: [...(o.histo || []), { le: jourLocal(), t: "devenu l'objectif principal" }] } : o.priorite === "principal" ? { ...o, priorite: "secondaire", maj: ts } : o),
      cap: { objectifId: id, action: actionDe(o2), le: ts } }; }); };

  if (!p) return (
    <div className="fu">
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.35rem", color: C.brown, marginBottom: 2 }}>Mon évolution</div>
      <div style={{ fontSize: 12, color: C.light, marginBottom: 14 }}>d'où tu pars, ce que tu fais, où tu veux aller.</div>
      <div style={{ ...carte, textAlign: "center", padding: "22px 16px" }}>
        <Icon name="pulse" size={26} color={C.terra} />
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 600, color: C.brown, margin: "8px 0 4px" }}>Tout commence par ton point de départ</div>
        <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.6, marginBottom: 12 }}>choisis ton objectif et note où tu en es aujourd'hui. plus tard, tu pourras voir ce qui a changé depuis.</div>
        <button onClick={ouvrirDepart} style={plein(C)}>{e.brouillon ? "reprendre" : "poser mon point de départ"}</button>
      </div>
    </div>);

  const a = (e.cap && e.cap.action) || actionDe(p);
  return (
    <div className="fu">
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.35rem", color: C.brown, marginBottom: 2 }}>Mon évolution</div>
      <div style={{ fontSize: 12, color: C.light, marginBottom: 14 }}>d'où tu pars, ce que tu fais, où tu veux aller.</div>

      {/* MON DÉPART */}
      <div style={carte}>
        {lbl(d ? "mon départ · " + dateFr(d.le, true) : "mon départ")}
        {!d ? (<>
          <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.6, marginBottom: 10 }}>tu n'as pas encore noté où tu en es. c'est facultatif, mais c'est ce qui te permettra de voir, plus tard, ce qui a bougé.</div>
          <button onClick={ouvrirDepart} style={plein(C)}>faire mon bilan de départ</button>
        </>) : (<>
          {Object.keys(d.valeurs || {}).length === 0 && <div style={{ fontSize: 12, color: C.mid }}>tu n'as noté aucun repère chiffré, et c'est très bien.</div>}
          {INDICATEURS.filter(([k]) => d.valeurs && d.valeurs[k]).map(([k, t]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
              <span style={{ flex: 1, fontSize: 12.5, color: C.brown }}>{t}</span>
              <span style={{ width: 90, height: 6, borderRadius: 99, background: C.bubble, overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: d.valeurs[k] * 10 + "%", background: C.terra, borderRadius: 99 }} /></span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.brown, width: 36, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{d.valeurs[k]}/10</span>
            </div>))}
          {d.difficulte && <div style={{ fontSize: 11.5, color: C.mid, lineHeight: 1.55, marginTop: 8 }}>ce qui était le plus difficile : <i>« {d.difficulte} »</i></div>}
          {d.jaimerais && <div style={{ fontSize: 11.5, color: C.mid, lineHeight: 1.55, marginTop: 4 }}>dans quelques mois, tu aimerais dire que <i>« {d.jaimerais} »</i></div>}
          <div style={{ fontSize: 10, color: C.light, marginTop: 8 }}>ton ressenti déclaré, pas une mesure médicale.</div>
          <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
            <button onClick={() => ouvrirDepart(true)} style={lien(C)}>corriger mon point de départ</button>
            {vers.length > 1 && <button onClick={() => setHisto(h => !h)} style={lien(C)}>{histo ? "masquer l'historique" : "voir l'historique (" + vers.length + " versions)"}</button>}
          </div>
          {histo && <div style={{ marginTop: 8, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>{vers.slice().reverse().map((v, i) => (
            <div key={v.id} style={{ fontSize: 11, color: C.mid, padding: "3px 0" }}><b style={{ color: C.brown }}>{i === 0 ? "en vigueur" : v.version === 1 ? "départ d'origine" : "version " + v.version}</b> · {dateFr(v.le, true)} · {INDICATEURS.filter(([k]) => v.valeurs && v.valeurs[k]).map(([k, t]) => t.toLowerCase() + " " + v.valeurs[k] + "/10").join(", ") || "sans repère chiffré"}</div>))}</div>}
        </>)}
      </div>

      {/* MON PROCHAIN CAP */}
      <div style={{ ...carte, background: `linear-gradient(150deg,${C.mauveSoft},${C.white})`, border: `1.5px solid ${C.mauve}` }}>
        {lbl("mon prochain cap", C.mauve)}
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 600, color: C.brown }}>{p.titre}</div>
        {p.motivation && <div style={{ fontSize: 11.5, color: C.mid, lineHeight: 1.55, marginTop: 3 }}>parce que <i>« {p.motivation} »</i></div>}
        {p.horizonLe && <div style={{ fontSize: 11, color: C.mid, marginTop: 3 }}>horizon : {moisFr(p.horizonLe)}</div>}
        {a && <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", marginTop: 10 }}>
          <div style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.terra, fontWeight: 700 }}>ta prochaine petite action</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.brown, margin: "2px 0 8px" }}>{a.titre}</div>
          <button onClick={() => aller(a.cible)} style={{ ...plein(C), padding: "10px" }}>y aller</button>
        </div>}
      </div>

      {/* MES OBJECTIFS */}
      <div style={carte}>
        {lbl("mes objectifs")}
        {actifs.map(o => (
          <div key={o.id} style={{ padding: "9px 0", borderTop: o === actifs[0] ? "none" : `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}><span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: C.brown }}>{o.titre}</span>{o.priorite === "principal" && <span style={{ fontSize: 9, fontWeight: 700, color: C.mauve, background: C.mauveSoft, borderRadius: 99, padding: "2px 7px" }}>principal</span>}</div>
            {o.description && <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>{o.description}</div>}
            <div style={{ display: "flex", gap: 12, marginTop: 5, flexWrap: "wrap" }}>
              <button onClick={() => setEdite({ ...o })} style={lien(C)}>modifier</button>
              {o.priorite !== "principal" && <button onClick={() => devientPrincipal(o.id)} style={lien(C)}>en faire mon objectif principal</button>}
              {actifs.length > 1 && <button onClick={() => { majObj(o.id, { statut: "pause", priorite: "secondaire" }, "mis en pause"); if (o.priorite === "principal") { const s = actifs.find(x => x.id !== o.id); if (s) devientPrincipal(s.id); } }} style={lien(C)}>mettre en pause</button>}
            </div>
          </div>))}
        {pauses.length > 0 && <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10.5, color: C.light, marginBottom: 4 }}>en pause, sans rien perdre</div>
          {pauses.map(o => <div key={o.id} style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "3px 0" }}><span style={{ flex: 1, fontSize: 12, color: C.mid }}>{o.titre}</span><button onClick={() => majObj(o.id, { statut: "actif" }, "repris")} style={lien(C)}>reprendre</button></div>)}
        </div>}
        <button onClick={() => setAjout(true)} style={{ ...lien(C), marginTop: 10, color: C.terra, fontWeight: 700 }}>+ ajouter un objectif</button>
      </div>
      <div style={{ fontSize: 10, color: C.light, lineHeight: 1.6, textAlign: "center", padding: "0 10px" }}>ce que tu notes ici reste dans ton espace. tu peux le récupérer ou l'effacer depuis Mon compte.</div>

      {edite && <Feuille C={C} titre="Mon objectif" onClose={() => setEdite(null)}>
        {edite.cle === "libre" ? <input value={edite.titre} maxLength={80} aria-label="titre de l'objectif" onChange={ev => setEdite(x => ({ ...x, titre: ev.target.value }))} style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 11px", fontFamily: "inherit", fontSize: 16, color: C.brown, background: C.white }} />
          : <div style={{ fontSize: 13, fontWeight: 700, color: C.brown }}>{edite.titre}</div>}
        {[["description", "Avec tes mots"], ["motivation", "Pourquoi c'est important pour toi"], ["voir", "Ce que tu aimerais voir changer"]].map(([k, t]) => (
          <div key={k}><div style={{ fontSize: 12, fontWeight: 700, color: C.brown, margin: "12px 0 5px" }}>{t}</div>
            <textarea value={edite[k] || ""} maxLength={300} rows={2} aria-label={t} onChange={ev => setEdite(x => ({ ...x, [k]: ev.target.value }))} style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 11px", fontFamily: "inherit", fontSize: 16, color: C.brown, background: C.white, resize: "vertical" }} /></div>))}
        <div style={{ fontSize: 12, fontWeight: 700, color: C.brown, margin: "12px 0 5px" }}>Horizon</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{HORIZONS.map(([n, t]) => <button key={n} aria-pressed={(edite.horizon || 0) === n} onClick={() => setEdite(x => ({ ...x, horizon: n, horizonLe: n ? plusMois(jourLocal(), n) : "" }))} style={{ ...puce(C, (edite.horizon || 0) === n), fontSize: 11.5, padding: "7px 11px" }}>{t}</button>)}</div>
        <button disabled={!propre(edite.titre, 80)} onClick={() => { majObj(edite.id, { titre: propre(edite.titre, 80), description: propre(edite.description, 300), motivation: propre(edite.motivation, 300), voir: propre(edite.voir, 300), horizon: edite.horizon || 0, horizonLe: edite.horizonLe || "" }, "modifié"); setEdite(null); }} style={{ ...plein(C), marginTop: 16 }}>enregistrer</button>
      </Feuille>}

      {ajout && <Feuille C={C} titre="Ajouter un objectif" onClose={() => setAjout(false)}>
        <AjoutObjectif C={C} deja={e.objectifs.map(o => o.cle)} onAjout={(cle, titre) => { const ts = new Date().toISOString(); const auj = jourLocal();
          setEvo(z => { const y = evoValide(z); return { ...y, objectifs: [...y.objectifs, { id: nouvelId(), cle, titre, description: "", motivation: "", voir: "", horizon: 0, horizonLe: "", priorite: "secondaire", statut: "actif", cree: auj, maj: ts, histo: [{ le: auj, t: "objectif ajouté" }] }] }; }); setAjout(false); }} />
      </Feuille>}
    </div>);
}

function AjoutObjectif({ C, deja, onAjout }) {
  const [libre, setLibre] = useState("");
  const libres = OBJECTIFS.filter(([k]) => !deja.includes(k));
  return (<div>
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{libres.map(([k, t]) => <button key={k} onClick={() => onAjout(k, t)} style={{ ...puce(C, false), textAlign: "left", borderRadius: 14 }}>{t}</button>)}</div>
    <div style={{ fontSize: 12, fontWeight: 700, color: C.brown, margin: "14px 0 5px" }}>ou le tien</div>
    <input value={libre} maxLength={80} aria-label="mon objectif à moi" onChange={ev => setLibre(ev.target.value)} placeholder="écris ton objectif" style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 11px", fontFamily: "inherit", fontSize: 16, color: C.brown, background: C.white }} />
    <button disabled={!propre(libre, 80)} onClick={() => onAjout("libre", propre(libre, 80))} style={{ ...plein(C), marginTop: 12, opacity: propre(libre, 80) ? 1 : .45 }}>ajouter</button>
  </div>);
}
