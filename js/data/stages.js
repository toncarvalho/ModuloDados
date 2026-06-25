/**
 * Dados do jogo (data-driven).
 * Para adicionar uma nova fase, basta acrescentar um objeto em STAGES.
 * Para ajustar dificuldade, edite DIFICULDADES.
 */

/** Graus de dificuldade. tempoResposta em segundos (null = sem timer). */
const DIFICULDADES = {
  facil: {
    id: "facil",
    nome: "Fácil",
    emoji: "🌸",
    faixaFator: { min: 1, max: 5 }, // tabuadas 1..5
    tempoResposta: null,
    bossHpMult: 1,
    cor: 0x2ff7e6,
  },
  medio: {
    id: "medio",
    nome: "Médio",
    emoji: "⚡",
    faixaFator: { min: 1, max: 10 },
    tempoResposta: 8,
    bossHpMult: 1.4,
    cor: 0xff3ea5,
  },
  dificil: {
    id: "dificil",
    nome: "Difícil",
    emoji: "🔥",
    faixaFator: { min: 1, max: 12 },
    tempoResposta: 5,
    bossHpMult: 1.9,
    cor: 0xffd23e,
  },
};

/**
 * Fases. Cada inimigo comum precisa de 1 acerto; o chefão tem HP (acertos).
 * corTema é usada no fundo/HUD da fase.
 */
const STAGES = [
  {
    id: 1,
    nome: "Palco Neon",
    descricao: "As luzes acendem. Aqueça a plateia!",
    tabuadas: [2, 3, 4, 5],
    numInimigos: 6,
    corTema: 0x7b2ff7,
    inimigoEmoji: "👾",
    boss: {
      nome: "Diva do Trovão",
      emoji: "⛈️",
      hp: 6,
      frase: "Mostre se você merece o palco principal!",
    },
  },
  {
    id: 2,
    nome: "Mosh da Galáxia",
    descricao: "A plateia está em chamas. Não desafine!",
    tabuadas: [6, 7, 8],
    numInimigos: 7,
    corTema: 0xff3ea5,
    inimigoEmoji: "💀",
    boss: {
      nome: "Rainha Riff",
      emoji: "🎸",
      hp: 8,
      frase: "Meus solos quebram qualquer ritmo. Aguenta?",
    },
  },
  {
    id: 3,
    nome: "Final do Estádio",
    descricao: "Última fase! O mundo todo está assistindo.",
    tabuadas: [7, 8, 9, 12],
    numInimigos: 8,
    corTema: 0xffd23e,
    inimigoEmoji: "🤘",
    boss: {
      nome: "Imperatriz Sônica",
      emoji: "👑",
      hp: 10,
      frase: "Só uma lenda passa por mim. Prove!",
    },
  },
];

function getStage(id) {
  return STAGES.find((s) => s.id === id) || STAGES[0];
}
