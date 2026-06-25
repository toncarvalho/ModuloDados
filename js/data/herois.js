/**
 * Heróis jogáveis (cosméticos — todos jogam igual; muda só avatar, cor e nome).
 * Avatares em emoji + cor de tema, sem assets externos.
 * Para adicionar/editar um herói, mexa em HEROIS.
 */
const HEROIS = [
  {
    id: 1,
    nome: "Lyra",
    emoji: "🎤",
    cor: 0xff3ea5,
    descricao: "Vocalista neon",
  },
  {
    id: 2,
    nome: "Ravena",
    emoji: "🎸",
    cor: 0x7b2ff7,
    descricao: "Guitarrista metal",
  },
  {
    id: 3,
    nome: "Nova",
    emoji: "🥁",
    cor: 0x2ff7e6,
    descricao: "Baterista elétrica",
  },
];

function getHeroi(id) {
  return HEROIS.find((h) => h.id === id) || HEROIS[0];
}
