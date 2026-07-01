/**
 * Dados do jogo (data-driven).
 *
 * Progressão por TABUADA: a dificuldade vem da fase (qual tabuada é treinada).
 * A mecânica (velocidade, intervalo do fator, força do chefão) é CONSTANTE em
 * todas as fases — só a tabuada muda. Ajuste tudo isso em JOGO.
 *
 * Para adicionar/editar uma fase, mexa em FASES.
 */

/** Config global (mecânica constante entre as fases). */
const JOGO = {
  faixaFator: { min: 1, max: 10 }, // segundo fator das contas (ex.: 7 × n, n de 1..10)
  tempoResposta: 10, // segundos por pergunta (null = sem timer)
  numInimigos: 6, // inimigos comuns antes do chefão
  bossHp: 8, // acertos para derrotar o chefão
  vidas: 3, // vidas na fase normal e no Desafio do Dia
  vidasBossRush: 5, // vidas no Boss Rush (12 chefões seguidos)
  inimigosDesafio: 10, // inimigos do Desafio do Dia (sem chefão)
  pontos: {
    base: 10, // pontos por acerto (× combo)
    chefao: 20, // pontos por acerto no chefão (× combo)
    bonusVida: 50, // bônus de vitória por vida restante
    bonusCombo: 5, // bônus de vitória por ponto de combo máximo
  },
  moedas: {
    acerto: 2, // moedas por acerto em partida
    treinoAcerto: 1, // moedas por acerto no Treino
    bonusVitoria: 20, // bônus fixo ao vencer
    porEstrela: 10, // bônus por estrela conquistada
    desafioBase: 30, // recompensa base do Desafio do Dia
    desafioPorDia: 5, // extra por dia de ofensiva...
    desafioTetoDias: 7, // ...até este teto de dias
  },
};

/**
 * 12 fases. Cada inimigo comum precisa de 1 acerto; o chefão tem JOGO.bossHp.
 * corTema é usada no fundo/HUD da fase. `tabuadas` define o foco da fase.
 */
const FASES = [
  {
    id: 1,
    nome: "Palco Neon",
    descricao: "Aqueça a plateia com as tabuadas 1 e 2!",
    tabuadas: [1, 2],
    corTema: 0x7b2ff7,
    inimigoEmoji: "🧚",
    boss: { nome: "Fadinha do Beat", emoji: "🧚", frase: "Mostre seu brilho!" },
  },
  {
    id: 2,
    nome: "Trio Trovão",
    descricao: "Revisão geral: tabuadas do 1 ao 3.",
    tabuadas: [1, 2, 3],
    corTema: 0x9b3ff7,
    inimigoEmoji: "⛈️",
    boss: { nome: "Trio Trovão", emoji: "⛈️", frase: "Três relâmpagos contra você!" },
  },
  {
    id: 3,
    nome: "Batida do Três",
    descricao: "Foco total na tabuada do 3.",
    tabuadas: [3],
    corTema: 0xff3ea5,
    inimigoEmoji: "🎧",
    boss: { nome: "DJ Tríade", emoji: "🎧", frase: "Sente o ritmo do três!" },
  },
  {
    id: 4,
    nome: "Quarteto do Caos",
    descricao: "Foco total na tabuada do 4.",
    tabuadas: [4],
    corTema: 0xff5a3e,
    inimigoEmoji: "🥁",
    boss: { nome: "Quarteto do Caos", emoji: "🥁", frase: "Quatro batidas, sem erro!" },
  },
  {
    id: 5,
    nome: "Penta Diva",
    descricao: "Foco total na tabuada do 5.",
    tabuadas: [5],
    corTema: 0xffd23e,
    inimigoEmoji: "⭐",
    boss: { nome: "Penta Diva", emoji: "⭐", frase: "Cinco estrelas no palco!" },
  },
  {
    id: 6,
    nome: "Sexteto Sombrio",
    descricao: "Foco total na tabuada do 6.",
    tabuadas: [6],
    corTema: 0x2ff7e6,
    inimigoEmoji: "🦇",
    boss: { nome: "Sexteto Sombrio", emoji: "🦇", frase: "Seis sombras te cercam!" },
  },
  {
    id: 7,
    nome: "Sete Trovões",
    descricao: "Foco total na tabuada do 7.",
    tabuadas: [7],
    corTema: 0x3ea5ff,
    inimigoEmoji: "🌩️",
    boss: { nome: "Sete Trovões", emoji: "🌩️", frase: "O sete ribomba!" },
  },
  {
    id: 8,
    nome: "Aranha do Oito",
    descricao: "Foco total na tabuada do 8.",
    tabuadas: [8],
    corTema: 0x7b2ff7,
    inimigoEmoji: "🕷️",
    boss: { nome: "Aranha do Oito", emoji: "🕷️", frase: "Caia na minha teia!" },
  },
  {
    id: 9,
    nome: "Nove Vidas",
    descricao: "Foco total na tabuada do 9.",
    tabuadas: [9],
    corTema: 0xff3ea5,
    inimigoEmoji: "🐈‍⬛",
    boss: { nome: "Nove Vidas", emoji: "🐈‍⬛", frase: "Nenhuma das minhas vidas perde!" },
  },
  {
    id: 10,
    nome: "Deca Rainha",
    descricao: "Foco total na tabuada do 10.",
    tabuadas: [10],
    corTema: 0xffd23e,
    inimigoEmoji: "👑",
    boss: { nome: "Deca Rainha", emoji: "👑", frase: "O dez é meu reino!" },
  },
  {
    id: 11,
    nome: "Caos Total",
    descricao: "Misturão! Todas as tabuadas de 1 a 10.",
    tabuadas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    corTema: 0xff5a3e,
    inimigoEmoji: "🌀",
    boss: { nome: "Caos Total", emoji: "🌀", frase: "Tudo ao mesmo tempo agora!" },
  },
  {
    id: 12,
    nome: "Estádio Final",
    descricao: "A grande final! Todas as tabuadas, o mundo assistindo.",
    tabuadas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    corTema: 0xffd23e,
    inimigoEmoji: "🤘",
    boss: { nome: "Imperatriz Sônica", emoji: "👑", frase: "Só uma lenda me vence. Prove!" },
  },
];

function getFase(id) {
  return FASES.find((f) => f.id === id) || FASES[0];
}

/** Existe uma fase com este id? (usado para "próxima fase"). */
function existeFase(id) {
  return FASES.some((f) => f.id === id);
}
