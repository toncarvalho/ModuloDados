/**
 * Roupas (cosméticos "de verdade") por personagem. Cada roupa é uma variante
 * da figura do herói (mesma identidade, roupa diferente), carregada como
 * textura no BootScene. A 1ª de cada herói é a "Padrão" (grátis, já possuída).
 *
 * `id` é a chave de textura (a base usa a chave do próprio herói, "heroiN").
 * `file` é o nome do SVG em assets/herois/.
 */
const ROUPAS = {
  1: [
    { id: "heroi1", nome: "Padrão", preco: 0, file: "rubi" },
    { id: "rubi-festa", nome: "Festa", preco: 60, file: "rubi-festa" },
    { id: "rubi-inverno", nome: "Inverno", preco: 100, file: "rubi-inverno" },
  ],
  2: [
    { id: "heroi2", nome: "Padrão", preco: 0, file: "lorena" },
    { id: "lorena-rock", nome: "Rock", preco: 60, file: "lorena-rock" },
    { id: "lorena-esporte", nome: "Esporte", preco: 100, file: "lorena-esporte" },
  ],
  3: [
    { id: "heroi3", nome: "Padrão", preco: 0, file: "mel" },
    { id: "mel-diva", nome: "Diva", preco: 60, file: "mel-diva" },
    { id: "mel-verao", nome: "Verão", preco: 100, file: "mel-verao" },
  ],
  4: [
    { id: "heroi4", nome: "Padrão", preco: 0, file: "leo" },
    { id: "leo-aventura", nome: "Aventura", preco: 60, file: "leo-aventura" },
    { id: "leo-gamer", nome: "Gamer", preco: 100, file: "leo-gamer" },
  ],
  5: [
    { id: "heroi5", nome: "Padrão", preco: 0, file: "priya" },
    { id: "priya-festival", nome: "Festival", preco: 60, file: "priya-festival" },
    { id: "priya-esporte", nome: "Esporte", preco: 100, file: "priya-esporte" },
  ],
};

/** Lista de roupas de um herói. */
function roupasDoHeroi(heroId) {
  return ROUPAS[heroId] || ROUPAS[1];
}

/** Procura uma roupa pelo id de textura (em todos os heróis). */
function getRoupa(roupaId) {
  for (const k in ROUPAS) {
    const r = ROUPAS[k].find((x) => x.id === roupaId);
    if (r) return r;
  }
  return null;
}

/** Roupa "Padrão" (grátis) de um herói. */
function roupaBase(heroId) {
  return roupasDoHeroi(heroId)[0];
}
