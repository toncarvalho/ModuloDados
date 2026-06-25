/**
 * Storage — persistência simples via localStorage.
 * Guarda progresso (fase máxima desbloqueada por dificuldade),
 * melhor pontuação e preferência de áudio.
 */
const Storage = (() => {
  const KEY = "idolmath.save.v1";

  const defaults = () => ({
    melhorPontuacao: 0,
    muted: false,
    // fase máxima desbloqueada por dificuldade (1-based)
    desbloqueado: { facil: 1, medio: 1, dificil: 1 },
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      return Object.assign(defaults(), JSON.parse(raw));
    } catch (e) {
      return defaults();
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      /* armazenamento indisponível — segue sem persistir */
    }
  }

  let state = load();

  return {
    get() {
      return state;
    },
    setMelhorPontuacao(pontos) {
      if (pontos > state.melhorPontuacao) {
        state.melhorPontuacao = pontos;
        save(state);
      }
    },
    desbloquearFase(dificuldade, faseId) {
      const atual = state.desbloqueado[dificuldade] || 1;
      if (faseId > atual) {
        state.desbloqueado[dificuldade] = faseId;
        save(state);
      }
    },
    faseDesbloqueada(dificuldade) {
      return state.desbloqueado[dificuldade] || 1;
    },
    setMuted(muted) {
      state.muted = !!muted;
      save(state);
    },
    isMuted() {
      return !!state.muted;
    },
  };
})();
