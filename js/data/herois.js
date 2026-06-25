/**
 * Heróis jogáveis (cosméticos — todas jogam igual; muda só figura, cor e nome).
 * Figuras: avatares ilustrados gerados com DiceBear (estilo Lorelei, CC0),
 * embutidos como SVG em assets/herois/ e carregados como textura no BootScene.
 * `img` é a chave da textura; `emoji` fica como fallback se a textura faltar.
 */
const HEROIS = [
  {
    id: 1,
    nome: "Rubi",
    img: "heroi1",
    file: "rubi",
    emoji: "🎤",
    cor: 0xff3ea5,
    descricao: "Ruiva ágil e genial, 10 anos",
  },
  {
    id: 2,
    nome: "Lorena",
    img: "heroi2",
    file: "lorena",
    emoji: "🎸",
    cor: 0x7b2ff7,
    descricao: "Estilo Branca de Neve, forte e esperta",
  },
  {
    id: 3,
    nome: "Mel",
    img: "heroi3",
    file: "mel",
    emoji: "🥁",
    cor: 0xffd23e,
    descricao: "Cheia de ritmo e energia",
  },
];

function getHeroi(id) {
  return HEROIS.find((h) => h.id === id) || HEROIS[0];
}
