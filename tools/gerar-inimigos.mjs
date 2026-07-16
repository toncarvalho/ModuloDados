/**
 * Gera os SVGs dos inimigos e chefões (assets/inimigos/) num estilo único:
 * flat kawaii-neon, contorno escuro grosso, olhos grandes com brilho,
 * gradiente radial no corpo e sombra no chão. Coerente com os avatares
 * DiceBear dos heróis e com a paleta neon do jogo.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "assets", "inimigos");
const OUT = "#1a0f2e"; // contorno padrão
const SW = 7;

const svg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">\n${inner}\n</svg>\n`;
const grad = (id, c1, c2) =>
  `<radialGradient id="${id}" cx="38%" cy="32%" r="80%">` +
  `<stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></radialGradient>`;
const defs = (...g) => `<defs>${g.join("")}</defs>`;
const chao = (cor, ry = 10) =>
  `<ellipse cx="128" cy="236" rx="66" ry="${ry}" fill="${cor}" opacity="0.35"/>`;
const aura = (r, cor, op = 0.22) =>
  `<circle cx="128" cy="138" r="${r}" fill="${cor}" opacity="${op}"/>`;

// ---------- rosto ----------
function olho(x, y, r, o = {}) {
  const pr = o.pr || Math.round(r * 0.5);
  const px = x + (o.dx ?? 2), py = y + (o.dy ?? 2);
  let s = `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${Math.round(r * 1.12)}" fill="#fff" stroke="${OUT}" stroke-width="5"/>`;
  s += `<circle cx="${px}" cy="${py}" r="${pr}" fill="${o.pupila || OUT}"/>`;
  s += `<circle cx="${(px - pr * 0.35).toFixed(1)}" cy="${(py - pr * 0.4).toFixed(1)}" r="${Math.max(2.4, pr * 0.32).toFixed(1)}" fill="#fff"/>`;
  return s;
}
const olhos = (y, dist, r, o) => olho(128 - dist, y, r, o) + olho(128 + dist, y, r, o);
// olhos que brilham (sem esclera) — morcegos, gatos…
function olhoBrilho(x, y, r, cor) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${cor}"/>` +
    `<circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${(r * 0.3).toFixed(1)}" fill="#fff"/>`;
}
function bravas(y, dist, len = 26, cor = OUT, w = 9) {
  const l = 128 - dist, r = 128 + dist;
  return `<path d="M${l - len / 2} ${y - 8} L${l + len / 2} ${y + 7}" stroke="${cor}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<path d="M${r + len / 2} ${y - 8} L${r - len / 2} ${y + 7}" stroke="${cor}" stroke-width="${w}" stroke-linecap="round"/>`;
}
const sorriso = (y, w, cor = OUT) =>
  `<path d="M${128 - w} ${y} Q128 ${y + Math.round(w * 0.95)} ${128 + w} ${y}" fill="none" stroke="${cor}" stroke-width="6" stroke-linecap="round"/>`;
const sorrisoAberto = (y, w, cor = "#5a1030") =>
  `<path d="M${128 - w} ${y} Q128 ${y + w * 1.4} ${128 + w} ${y} Q128 ${y + 4} ${128 - w} ${y} Z" fill="${cor}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>`;
const zigueMouth = (y, w) =>
  `<path d="M${128 - w} ${y} l${w * 0.5} 10 l${w * 0.5} -10 l${w * 0.5} 10 l${w * 0.5} -10" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
function presas(y, dist = 13) {
  const f = (x) => `<path d="M${x - 6} ${y} l6 13 l6 -13 z" fill="#fff" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>`;
  return f(128 - dist) + f(128 + dist);
}
const bochechas = (y, dist, cor = "#ff9ad2") =>
  `<circle cx="${128 - dist}" cy="${y}" r="9" fill="${cor}" opacity="0.5"/>` +
  `<circle cx="${128 + dist}" cy="${y}" r="9" fill="${cor}" opacity="0.5"/>`;

// ---------- adereços ----------
function estrela5(cx, cy, ro, ri, fill, extra = "") {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? ro : ri;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round" ${extra}/>`;
}
const raioIcone = (cx, cy, esc = 1, fill = "#ffd23e") =>
  `<path transform="translate(${cx} ${cy}) scale(${esc})" d="M3 -24 L-11 4 L-3 4 L-7 24 L11 -5 L3 -5 Z" fill="${fill}" stroke="${OUT}" stroke-width="${(5 / esc).toFixed(1)}" stroke-linejoin="round"/>`;
function coroa(cx, cy, w, cor = "#ffd23e", gema = "#ff3ea5") {
  const h = w * 0.52;
  return `<path d="M${cx - w / 2} ${cy} l${w * 0.11} ${-h} l${w * 0.17} ${h * 0.62} l${w * 0.22} ${-h * 0.95} l${w * 0.22} ${h * 0.95} l${w * 0.17} ${-h * 0.62} l${w * 0.11} ${h} z" fill="${cor}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>` +
    `<circle cx="${cx}" cy="${cy - h * 0.2}" r="${Math.max(4, w * 0.08)}" fill="${gema}" stroke="${OUT}" stroke-width="3"/>`;
}

// união visual: contorna o conjunto, sem traços internos
function uniao(shapes, fill) {
  const st = shapes.map((s) => s.replace("/>", ` fill="${fill}" stroke="${OUT}" stroke-width="${SW}"/>`)).join("");
  const fl = shapes.map((s) => s.replace("/>", ` fill="${fill}"/>`)).join("");
  return st + fl;
}
function nuvem(fill, esc = 1, cy = 132) {
  const shapes = [
    `<circle cx="${128 - 44 * esc}" cy="${cy + 8 * esc}" r="${33 * esc}"/>`,
    `<circle cx="${128 + 4 * esc}" cy="${cy - 16 * esc}" r="${42 * esc}"/>`,
    `<circle cx="${128 + 48 * esc}" cy="${cy + 10 * esc}" r="${29 * esc}"/>`,
    `<rect x="${128 - 62 * esc}" y="${cy + 4 * esc}" width="${124 * esc}" height="${38 * esc}" rx="${19 * esc}"/>`,
  ];
  return uniao(shapes, fill);
}
const blob = (r, fill, cy = 140) =>
  `<circle cx="128" cy="${cy}" r="${r}" fill="${fill}" stroke="${OUT}" stroke-width="${SW}"/>`;
// brilho glossy no topo do corpo
const gloss = (cy, r) =>
  `<ellipse cx="${128 - r * 0.35}" cy="${cy - r * 0.55}" rx="${r * 0.36}" ry="${r * 0.2}" fill="#fff" opacity="0.25" transform="rotate(-24 ${128 - r * 0.35} ${cy - r * 0.55})"/>`;

const A = {}; // builders por arquivo

// ============ FASE 1 — Fada (roxo) ============
function asaFada(x, y, rot, w, h, cor) {
  return `<g transform="rotate(${rot} ${x} ${y})">` +
    `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="${cor}" stroke="${OUT}" stroke-width="6" opacity="0.95"/>` +
    `<ellipse cx="${x}" cy="${y + h * 0.15}" rx="${w * 0.45}" ry="${h * 0.5}" fill="#fff" opacity="0.35"/></g>`;
}
A["inimigo-1"] = () => svg(
  defs(grad("g", "#c793ff", "#7b2ff7")) + chao("#7b2ff7") +
  asaFada(70, 118, -28, 26, 44, "#e3ccff") + asaFada(186, 118, 28, 26, 44, "#e3ccff") +
  asaFada(78, 160, -50, 18, 30, "#d7b8ff") + asaFada(178, 160, 50, 18, 30, "#d7b8ff") +
  `<path d="M128 84 Q120 60 128 46" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>` +
  estrela5(128, 40, 13, 5.5, "#ffd23e") +
  blob(58, "url(#g)") + gloss(140, 58) +
  olhos(130, 24, 15) + sorriso(162, 13) + presas(158, 20) + bochechas(154, 42)
);
A["boss-1"] = () => svg(
  defs(grad("g", "#a75dff", "#5a18c9")) + aura(104, "#c793ff") + chao("#7b2ff7", 12) +
  asaFada(56, 108, -30, 32, 56, "#e3ccff") + asaFada(200, 108, 30, 32, 56, "#e3ccff") +
  asaFada(62, 164, -55, 24, 40, "#d7b8ff") + asaFada(194, 164, 55, 24, 40, "#d7b8ff") +
  `<path d="M108 76 Q100 52 106 38" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>` +
  `<path d="M148 76 Q156 52 150 38" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>` +
  estrela5(104, 32, 11, 4.5, "#ffd23e") + estrela5(152, 32, 11, 4.5, "#2ff7e6") +
  blob(70, "url(#g)") + gloss(140, 70) + coroa(128, 78, 52) +
  bravas(112, 26, 26, "#3d1470") + olhos(132, 27, 16) +
  sorriso(166, 15) + presas(162, 24) + bochechas(158, 48, "#ff6ec0")
);

// ============ FASE 2 — Nuvem trovão (roxo-claro) ============
A["inimigo-2"] = () => svg(
  defs(grad("g", "#cf9bff", "#9b3ff7")) + chao("#9b3ff7") +
  nuvem("url(#g)") +
  raioIcone(128, 206, 0.9) +
  olhos(132, 26, 14, { dy: 3 }) + sorriso(158, 12) + bochechas(152, 46, "#e3ccff")
);
A["boss-2"] = () => svg(
  defs(grad("g", "#a75dff", "#6b1fd8")) + aura(102, "#cf9bff") + chao("#9b3ff7", 12) +
  nuvem("url(#g)", 1.25, 126) +
  raioIcone(86, 212, 0.95) + raioIcone(128, 220, 1.15) + raioIcone(170, 212, 0.95) +
  bravas(112, 28, 28, "#3d1470") + olhos(134, 28, 16) + zigueMouth(166, 22)
);

// ============ FASE 3 — DJ (rosa) ============
function fones(y, r, corCopo = "#2ff7e6") {
  return `<path d="M${128 - r} ${y} A${r} ${r} 0 0 1 ${128 + r} ${y}" fill="none" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/>` +
    `<rect x="${128 - r - 13}" y="${y - 8}" width="24" height="38" rx="9" fill="${corCopo}" stroke="${OUT}" stroke-width="6"/>` +
    `<rect x="${128 + r - 11}" y="${y - 8}" width="24" height="38" rx="9" fill="${corCopo}" stroke="${OUT}" stroke-width="6"/>`;
}
function notaMusical(x, y, cor = "#2ff7e6") {
  return `<g stroke="${OUT}" stroke-width="4"><ellipse cx="${x}" cy="${y}" rx="8" ry="6.5" fill="${cor}"/>` +
    `<path d="M${x + 7} ${y} V${y - 26} q10 2 14 10" fill="none" stroke-linecap="round"/></g>`;
}
A["inimigo-3"] = () => svg(
  defs(grad("g", "#ff8ccb", "#ff3ea5")) + chao("#ff3ea5") +
  blob(58, "url(#g)") + gloss(140, 58) + fones(118, 62) +
  notaMusical(200, 84) +
  olhos(132, 24, 15) + sorrisoAberto(162, 14) + bochechas(156, 44, "#ffd23e")
);
A["boss-3"] = () => svg(
  defs(grad("g", "#ff5cb4", "#c9186f"), grad("v", "#7cf9ec", "#188fa8")) +
  aura(104, "#ff8ccb") + chao("#ff3ea5", 12) +
  blob(70, "url(#g)") + gloss(140, 70) + fones(112, 74, "#ffd23e") +
  notaMusical(206, 76) + notaMusical(52, 96, "#ffd23e") +
  `<rect x="84" y="116" width="88" height="32" rx="12" fill="url(#v)" stroke="${OUT}" stroke-width="6"/>` +
  `<path d="M96 132 l20 -8 M140 124 l20 8" stroke="#fff" stroke-width="6" stroke-linecap="round"/>` +
  `<polygon points="128,168 114,190 142,190" fill="#ffd23e" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>` +
  sorriso(196, 0) // nada — triângulo é o emblema; boca abaixo do visor:
  + presas(160, 18)
);

// ============ FASE 4 — Tambor (laranja) ============
function baqueta(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/>` +
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffd9a1" stroke-width="7" stroke-linecap="round"/>` +
    `<circle cx="${x2}" cy="${y2}" r="9" fill="#ffd9a1" stroke="${OUT}" stroke-width="5"/>`;
}
function tambor(cx, topo, w, h, corLado) {
  const rx = w / 2, ry = rx * 0.3;
  let s = `<rect x="${cx - rx}" y="${topo}" width="${w}" height="${h}" fill="${corLado}" stroke="${OUT}" stroke-width="${SW}"/>`;
  s += `<ellipse cx="${cx}" cy="${topo + h}" rx="${rx}" ry="${ry}" fill="${corLado}" stroke="${OUT}" stroke-width="${SW}"/>`;
  s += `<rect x="${cx - rx}" y="${topo}" width="${w}" height="${h * 0.6}" fill="${corLado}"/>`;
  s += `<ellipse cx="${cx}" cy="${topo}" rx="${rx}" ry="${ry}" fill="#ffe8c8" stroke="${OUT}" stroke-width="${SW}"/>`;
  // laçado em zigue-zague
  const n = 4, seg = w / n;
  let zig = `M${cx - rx} ${topo + 6}`;
  for (let i = 0; i < n; i++) zig += ` l${seg / 2} ${h - 12} l${seg / 2} ${-(h - 12)}`;
  s += `<path d="${zig}" fill="none" stroke="#ffd23e" stroke-width="5" stroke-linejoin="round"/>`;
  return s;
}
A["inimigo-4"] = () => svg(
  defs(grad("g", "#ff8a5e", "#e0421f")) + chao("#ff5a3e") +
  baqueta(88, 104, 52, 64) + baqueta(168, 104, 204, 64) +
  tambor(128, 112, 108, 78, "url(#g)") +
  olhos(148, 22, 13) + sorrisoAberto(174, 12) + bochechas(168, 40, "#ffd23e")
);
A["boss-4"] = () => svg(
  defs(grad("g", "#ff6a3e", "#b32a0e")) + aura(104, "#ff9a6e") + chao("#ff5a3e", 12) +
  baqueta(74, 100, 34, 52) + baqueta(182, 100, 222, 52) +
  baqueta(90, 96, 66, 40) + baqueta(166, 96, 190, 40) +
  `<path d="M96 96 q6 -20 16 -24 q-2 14 4 18 q8 -10 14 -8 q-4 10 2 14 z" fill="#ffd23e" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>` +
  tambor(128, 106, 128, 92, "url(#g)") +
  bravas(136, 26, 26, "#701e08") + olhos(152, 24, 14) + zigueMouth(184, 20)
);

// ============ FASE 5 — Estrela (ouro) ============
A["inimigo-5"] = () => svg(
  defs(grad("g", "#ffe98f", "#ffb61e")) + chao("#ffd23e") +
  estrela5(128, 140, 84, 40, "url(#g)").replace('stroke-width="6"', `stroke-width="${SW}"`) +
  olhos(134, 20, 13) + sorriso(160, 11) + bochechas(154, 36, "#ff9ad2")
);
A["boss-5"] = () => svg(
  defs(grad("g", "#ffdd66", "#ff9d1a")) + aura(106, "#ffe98f") + chao("#ffd23e", 12) +
  estrela5(128, 142, 98, 46, "url(#g)").replace('stroke-width="6"', `stroke-width="${SW}"`) +
  coroa(128, 66, 44) +
  // óculos escuros de diva
  `<rect x="88" y="122" width="34" height="24" rx="9" fill="${OUT}"/>` +
  `<rect x="134" y="122" width="34" height="24" rx="9" fill="${OUT}"/>` +
  `<path d="M122 130 h12" stroke="${OUT}" stroke-width="6"/>` +
  `<path d="M94 128 l10 6 M140 128 l10 6" stroke="#b98cff" stroke-width="4" stroke-linecap="round"/>` +
  sorriso(164, 13) + presas(160, 0).slice(0, 0) + bochechas(158, 40, "#ff9ad2") +
  estrela5(196, 96, 10, 4, "#ff3ea5") + estrela5(60, 100, 8, 3.4, "#2ff7e6")
);

// ============ FASE 6 — Morcego (ciano/sombrio) ============
function asaMorcego(lado, x, y, esc = 1) {
  const s = lado === "e" ? -1 : 1;
  const d = `M${x} ${y} q${s * 34 * esc} ${-30 * esc} ${s * 58 * esc} ${-12 * esc} q${s * 6 * esc} ${22 * esc} ${-s * 2 * esc} ${34 * esc} q${-s * 12 * esc} ${-8 * esc} ${-s * 18 * esc} ${2 * esc} q${-s * 4 * esc} ${14 * esc} ${-s * 14 * esc} ${16 * esc} q${-s * 10 * esc} ${-6 * esc} ${-s * 24 * esc} ${-4 * esc} z`;
  return `<path d="${d}" fill="#2a1550" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>`;
}
A["inimigo-6"] = () => svg(
  defs(grad("g", "#4a2a80", "#241040")) + chao("#2ff7e6") +
  asaMorcego("e", 96, 142, 1.25) + asaMorcego("d", 160, 142, 1.25) +
  `<polygon points="98,102 108,66 124,96" fill="#2a1550" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>` +
  `<polygon points="158,102 148,66 132,96" fill="#2a1550" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>` +
  blob(50, "url(#g)", 138) + gloss(138, 50) +
  olhoBrilho(108, 132, 11, "#2ff7e6") + olhoBrilho(148, 132, 11, "#2ff7e6") +
  sorriso(160, 10, "#2ff7e6") + presas(156, 12)
);
A["boss-6"] = () => svg(
  defs(grad("g", "#3a1f68", "#160a2e")) + aura(106, "#2ff7e6", 0.14) + chao("#2ff7e6", 12) +
  [0, 1, 2, 3, 4, 5].map((i) => {
    const a = -Math.PI * 0.92 + (i * Math.PI * 0.84) / 5;
    return `<circle cx="${(128 + Math.cos(a) * 96).toFixed(0)}" cy="${(120 + Math.sin(a) * 74).toFixed(0)}" r="6.5" fill="#2ff7e6" opacity="0.85"/>`;
  }).join("") +
  asaMorcego("e", 86, 130, 1.35) + asaMorcego("d", 170, 130, 1.35) +
  `<polygon points="92,98 102,52 122,90" fill="#241040" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>` +
  `<polygon points="164,98 154,52 134,90" fill="#241040" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>` +
  blob(62, "url(#g)", 140) + gloss(140, 62) +
  `<path d="M96 118 l24 12 M160 118 l-24 12" stroke="#2ff7e6" stroke-width="7" stroke-linecap="round"/>` +
  olhoBrilho(106, 140, 12, "#2ff7e6") + olhoBrilho(150, 140, 12, "#2ff7e6") +
  sorriso(166, 12, "#2ff7e6") + presas(162, 16)
);

// ============ FASE 7 — Nuvem de raio (azul) ============
A["inimigo-7"] = () => svg(
  defs(grad("g", "#8fc9ff", "#3ea5ff")) + chao("#3ea5ff") +
  nuvem("url(#g)") +
  raioIcone(128, 208, 1.15) +
  bravas(116, 26, 22, "#134a80", 7) + olhos(134, 26, 14) + zigueMouth(160, 18)
);
A["boss-7"] = () => svg(
  defs(grad("g", "#3f80c8", "#123a6b")) + aura(102, "#8fc9ff") + chao("#3ea5ff", 12) +
  nuvem("url(#g)", 1.25, 124) +
  [-3, -2, -1, 0, 1, 2, 3].map((i) =>
    raioIcone(128 + i * 30, 206 + (i % 2 === 0 ? 10 : -4), i === 0 ? 1.1 : 0.7)
  ).join("") +
  bravas(108, 28, 30, "#0c2c52") + olhoBrilho(102, 132, 12, "#fff") + olhoBrilho(154, 132, 12, "#fff") +
  zigueMouth(164, 24)
);

// ============ FASE 8 — Aranha (roxo) ============
function pernasAranha(cy, r, esc = 1, ang = 0) {
  let s = "";
  for (const lado of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const y0 = cy - 18 + i * 14 * esc;
      const x0 = 128 + lado * (r - 6);
      const x1 = 128 + lado * (r + 34 * esc);
      const y1 = y0 - 18 * esc + ang * i;
      const x2 = x1 + lado * 10 * esc;
      const y2 = y1 + 34 * esc;
      const d = `M${x0} ${y0} Q${x1} ${y1} ${x2} ${y2}`;
      s += `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="11" stroke-linecap="round"/>` +
        `<path d="${d}" fill="none" stroke="#8a5cf0" stroke-width="5.5" stroke-linecap="round"/>`;
    }
  }
  return s;
}
A["inimigo-8"] = () => svg(
  defs(grad("g", "#a05cff", "#5c15c4")) + chao("#7b2ff7") +
  `<line x1="128" y1="6" x2="128" y2="86" stroke="#cbb3ff" stroke-width="4"/>` +
  pernasAranha(140, 54) +
  blob(54, "url(#g)", 142) + gloss(142, 54) +
  `<circle cx="106" cy="118" r="7" fill="#ffd23e" stroke="${OUT}" stroke-width="3.5"/>` +
  `<circle cx="150" cy="118" r="7" fill="#ffd23e" stroke="${OUT}" stroke-width="3.5"/>` +
  olhos(140, 22, 13) + sorriso(166, 10) + presas(163, 13)
);
A["boss-8"] = () => svg(
  defs(grad("g", "#8a3af0", "#3d0d85")) + aura(106, "#a05cff") + chao("#7b2ff7", 12) +
  `<g stroke="#cbb3ff" stroke-width="3" opacity="0.6" fill="none">` +
  `<path d="M8 8 Q70 30 96 74"/><path d="M8 60 Q56 66 88 96"/><path d="M56 6 Q80 40 108 62"/></g>` +
  pernasAranha(142, 66, 1.25, -4) +
  blob(66, "url(#g)", 144) + gloss(144, 66) + coroa(128, 84, 48) +
  `<circle cx="98" cy="116" r="7" fill="#ff3ea5" stroke="${OUT}" stroke-width="3.5"/>` +
  `<circle cx="158" cy="116" r="7" fill="#ff3ea5" stroke="${OUT}" stroke-width="3.5"/>` +
  `<circle cx="112" cy="106" r="5" fill="#ff3ea5" stroke="${OUT}" stroke-width="3"/>` +
  `<circle cx="144" cy="106" r="5" fill="#ff3ea5" stroke="${OUT}" stroke-width="3"/>` +
  bravas(126, 24, 22, "#2a0655", 7) + olhos(144, 24, 14) + presas(172, 16) + sorriso(170, 11)
);

// ============ FASE 9 — Gato preto (rosa) ============
function gato(esc, olhosSvg, extras = "") {
  const cy = 140;
  return (
    `<path d="M${128 - 44 * esc} ${cy + 40 * esc} q${-30 * esc} ${28 * esc} ${-6 * esc} ${38 * esc} q${20 * esc} ${8 * esc} ${26 * esc} ${-10 * esc}" fill="none" stroke="${OUT}" stroke-width="11" stroke-linecap="round"/>` +
    `<path d="M${128 - 44 * esc} ${cy + 40 * esc} q${-30 * esc} ${28 * esc} ${-6 * esc} ${38 * esc} q${20 * esc} ${8 * esc} ${26 * esc} ${-10 * esc}" fill="none" stroke="#2e2440" stroke-width="6" stroke-linecap="round"/>` +
    `<polygon points="${128 - 42 * esc},${cy - 34 * esc} ${128 - 46 * esc},${cy - 74 * esc} ${128 - 12 * esc},${cy - 50 * esc}" fill="#2e2440" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>` +
    `<polygon points="${128 + 42 * esc},${cy - 34 * esc} ${128 + 46 * esc},${cy - 74 * esc} ${128 + 12 * esc},${cy - 50 * esc}" fill="#2e2440" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>` +
    `<polygon points="${128 - 37 * esc},${cy - 40 * esc} ${128 - 40 * esc},${cy - 64 * esc} ${128 - 20 * esc},${cy - 49 * esc}" fill="#ff3ea5"/>` +
    `<polygon points="${128 + 37 * esc},${cy - 40 * esc} ${128 + 40 * esc},${cy - 64 * esc} ${128 + 20 * esc},${cy - 49 * esc}" fill="#ff3ea5"/>` +
    `<circle cx="128" cy="${cy}" r="${52 * esc}" fill="#2e2440" stroke="${OUT}" stroke-width="${SW}"/>` +
    gloss(cy, 52 * esc) + olhosSvg +
    `<path d="M128 ${cy + 14 * esc} l-6 8 h12 z" fill="#ff3ea5" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M128 ${cy + 22 * esc} q-8 10 -18 6 M128 ${cy + 22 * esc} q8 10 18 6" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>` +
    `<g stroke="#cbb3ff" stroke-width="3.5" stroke-linecap="round" opacity="0.9">` +
    `<path d="M${128 - 52 * esc} ${cy + 6} h-26 M${128 - 52 * esc} ${cy + 18} l-24 8"/>` +
    `<path d="M${128 + 52 * esc} ${cy + 6} h26 M${128 + 52 * esc} ${cy + 18} l24 8"/></g>` +
    extras
  );
}
function olhoGato(x, y, r, cor = "#ffd23e", bravo = false) {
  return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.05}" fill="${cor}" stroke="${OUT}" stroke-width="4"/>` +
    (bravo ? `<path d="M${x - r} ${y - r * 0.9} L${x + r} ${y - r * 0.2}" stroke="${OUT}" stroke-width="6" stroke-linecap="round" transform="scale(${x < 128 ? 1 : -1},1) translate(${x < 128 ? 0 : -2 * x},0)"/>` : "") +
    `<ellipse cx="${x}" cy="${y}" rx="${r * 0.28}" ry="${r * 0.8}" fill="${OUT}"/>` +
    `<circle cx="${x - r * 0.25}" cy="${y - r * 0.35}" r="2.6" fill="#fff"/>`;
}
A["inimigo-9"] = () => svg(
  defs() + chao("#ff3ea5") +
  gato(1, olhoGato(106, 134, 13) + olhoGato(150, 134, 13))
);
A["boss-9"] = () => svg(
  defs() + aura(108, "#ff3ea5", 0.16) + chao("#ff3ea5", 12) +
  [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
    const a = Math.PI + (i * Math.PI) / 8;
    const x = 128 + Math.cos(a) * 100, y = 128 + Math.sin(a) * 86;
    const cor = i % 2 ? "#2ff7e6" : "#ffd23e";
    return `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q-6 -14 0 -22 q6 8 0 22" fill="${cor}" stroke="${OUT}" stroke-width="3" opacity="0.9"/>`;
  }).join("") +
  gato(1.22, olhoGato(102, 132, 15, "#ffd23e", true) + olhoGato(154, 132, 15, "#ffd23e", true),
    presas(178, 14))
);

// ============ FASE 10 — Realeza (ouro) ============
function capa(w, topo, alt, cor) {
  return `<path d="M${128 - w / 2} ${topo} Q128 ${topo - 18} ${128 + w / 2} ${topo} L${128 + w / 2 + 14} ${topo + alt} Q128 ${topo + alt + 16} ${128 - w / 2 - 14} ${topo + alt} Z" fill="${cor}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>`;
}
A["inimigo-10"] = () => svg(
  defs(grad("g", "#ffe98f", "#ffb020")) + chao("#ffd23e") +
  capa(96, 116, 96, "#ff3ea5") +
  blob(56, "url(#g)", 142) + gloss(142, 56) + coroa(128, 92, 40) +
  olhos(134, 22, 14) + sorriso(162, 11) + bochechas(156, 40)
);
A["boss-10"] = () => svg(
  defs(grad("g", "#ffdd66", "#ff9d1a")) + aura(106, "#ffe98f") + chao("#ffd23e", 12) +
  capa(124, 112, 112, "#7b2ff7") +
  `<line x1="196" y1="88" x2="212" y2="176" stroke="${OUT}" stroke-width="11" stroke-linecap="round"/>` +
  `<line x1="196" y1="88" x2="212" y2="176" stroke="#ffd23e" stroke-width="6" stroke-linecap="round"/>` +
  `<circle cx="194" cy="80" r="12" fill="#ff3ea5" stroke="${OUT}" stroke-width="5"/>` +
  blob(68, "url(#g)", 144) + gloss(144, 68) + coroa(128, 84, 60) +
  `<circle cx="106" cy="196" r="5" fill="#ff3ea5" stroke="${OUT}" stroke-width="3"/>` +
  `<circle cx="128" cy="202" r="5" fill="#2ff7e6" stroke="${OUT}" stroke-width="3"/>` +
  `<circle cx="150" cy="196" r="5" fill="#ff3ea5" stroke="${OUT}" stroke-width="3"/>` +
  `<path d="M96 124 q10 -10 22 -2 M138 122 q12 -8 22 2" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/>` +
  olhos(138, 24, 14, { dy: 1 }) + sorriso(168, 13) + bochechas(162, 44)
);

// ============ FASE 11 — Vórtice (laranja) ============
function espiral(cy, r1, cor, w = 8) {
  let s = "";
  const rs = [r1 * 0.35, r1 * 0.62, r1 * 0.88];
  rs.forEach((r, i) => {
    const c = 2 * Math.PI * r;
    s += `<circle cx="128" cy="${cy}" r="${r.toFixed(0)}" fill="none" stroke="${cor}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${(c * 0.62).toFixed(0)} ${(c * 0.38).toFixed(0)}" transform="rotate(${i * 130} 128 ${cy})" opacity="${0.9 - i * 0.25}"/>`;
  });
  return s;
}
A["inimigo-11"] = () => svg(
  defs(grad("g", "#ff9a6e", "#e0421f")) + chao("#ff5a3e") +
  blob(60, "url(#g)", 140) + espiral(140, 60, "#ffd9a1") +
  olho(104, 128, 15, { dy: 3 }) + olho(152, 134, 11, { dy: -2 }) +
  `<path d="M112 166 q8 8 16 0 q8 -8 16 0" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/>`
);
A["boss-11"] = () => svg(
  defs(grad("g", "#ff7a3e", "#a82408")) + aura(106, "#ff9a6e") + chao("#ff5a3e", 12) +
  raioIcone(52, 92, 0.7, "#2ff7e6") + raioIcone(206, 108, 0.7, "#ffd23e") + raioIcone(190, 44, 0.6, "#ff3ea5") +
  blob(72, "url(#g)", 142) + espiral(142, 72, "#ffd9a1", 9) +
  bravas(112, 30, 26, "#701e08") +
  olho(100, 132, 15, { dy: 2 }) + olho(156, 132, 15, { dy: 2 }) + olho(128, 112, 10, { dy: 1 }) +
  sorrisoAberto(168, 18) + presas(166, 14)
);

// ============ FASE 12 — Rocker / Imperatriz (ouro/rosa) ============
function moicano(cy, r, cor = "#ffd23e") {
  let s = "";
  const n = 4;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * 0.78 + (i * Math.PI * 0.56) / (n - 1);
    const x0 = 128 + Math.cos(a) * (r - 4), y0 = cy + Math.sin(a) * (r - 4);
    const x1 = 128 + Math.cos(a) * (r + 30), y1 = cy + Math.sin(a) * (r + 30);
    const perp = a + Math.PI / 2;
    const dx = Math.cos(perp) * 11, dy = Math.sin(perp) * 11;
    s += `<polygon points="${(x0 - dx).toFixed(0)},${(y0 - dy).toFixed(0)} ${x1.toFixed(0)},${y1.toFixed(0)} ${(x0 + dx).toFixed(0)},${(y0 + dy).toFixed(0)}" fill="${cor}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>`;
  }
  return s;
}
function maoRock(x, y, cor) {
  return `<g stroke="${OUT}" stroke-width="5" stroke-linejoin="round">` +
    `<line x1="${x + 18}" y1="${y + 42}" x2="${x + 6}" y2="${y + 14}" stroke-width="14" stroke-linecap="round"/>` +
    `<line x1="${x + 18}" y1="${y + 42}" x2="${x + 6}" y2="${y + 14}" stroke="${cor}" stroke-width="9" stroke-linecap="round"/>` +
    `<rect x="${x - 8}" y="${y - 4}" width="26" height="24" rx="9" fill="${cor}"/>` +
    `<rect x="${x - 8}" y="${y - 26}" width="9" height="28" rx="4.5" fill="${cor}"/>` +
    `<rect x="${x + 10}" y="${y - 26}" width="9" height="28" rx="4.5" fill="${cor}"/>` +
    `</g>`;
}
A["inimigo-12"] = () => svg(
  defs(grad("g", "#a75dff", "#5c15c4")) + chao("#ffd23e") +
  moicano(140, 58) +
  maoRock(46, 106, "#a75dff") +
  blob(58, "url(#g)", 140) + gloss(140, 58) +
  estrela5(150, 128, 17, 7, "#ffd23e", 'opacity="0.95"') +
  olho(106, 130, 14) + `<circle cx="150" cy="128" r="5" fill="${OUT}"/>` +
  sorrisoAberto(162, 14) + presas(158, 0).slice(0, 0) + bochechas(158, 42, "#ff6ec0")
);
A["boss-12"] = () => svg(
  defs(grad("g", "#ff6ec0", "#d61a7f")) + aura(108, "#ff8ccb") + chao("#ff3ea5", 12) +
  // ondas sonoras
  `<g fill="none" stroke="#2ff7e6" stroke-width="6" stroke-linecap="round" opacity="0.85">` +
  `<path d="M36 116 q-14 24 0 48"/><path d="M20 104 q-22 36 0 72"/>` +
  `<path d="M220 116 q14 24 0 48"/><path d="M236 104 q22 36 0 72"/></g>` +
  raioIcone(38, 74, 0.6, "#ffd23e") + raioIcone(218, 74, 0.6, "#ffd23e") +
  blob(70, "url(#g)", 144) + gloss(144, 70) + coroa(128, 82, 62, "#ffd23e", "#2ff7e6") +
  // cílios de diva
  `<g stroke="${OUT}" stroke-width="4" stroke-linecap="round">` +
  `<path d="M88 122 l-10 -7 M96 116 l-8 -9 M160 116 l8 -9 M168 122 l10 -7"/></g>` +
  `<path d="M96 126 q10 -8 22 -2 M138 124 q12 -6 22 2" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/>` +
  olhos(140, 26, 15, { dy: 1 }) +
  estrela5(88, 168, 8, 3.4, "#ffd23e") + estrela5(168, 168, 8, 3.4, "#ffd23e") +
  `<path d="M114 170 Q128 184 142 170" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/>` +
  presas(168, 18)
);

// ---------- emitir ----------
fs.mkdirSync(DIR, { recursive: true });
let n = 0;
for (const [nome, fn] of Object.entries(A)) {
  // ids de gradiente únicos por arquivo (evita colisão se os SVGs forem
  // inline no mesmo documento — ex.: numa página de divulgação)
  const conteudo = fn()
    .replaceAll('id="g"', `id="g-${nome}"`).replaceAll("url(#g)", `url(#g-${nome})`)
    .replaceAll('id="v"', `id="v-${nome}"`).replaceAll("url(#v)", `url(#v-${nome})`);
  fs.writeFileSync(`${DIR}/${nome}.svg`, conteudo);
  n++;
}
console.log(`✅ ${n} SVGs gerados em ${DIR}`);
