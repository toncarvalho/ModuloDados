/**
 * Storage — persistência simples via localStorage.
 * Guarda progresso (fase máxima desbloqueada), melhor pontuação e mudo.
 */
const Storage = (() => {
  const KEY = "idolmath.save.v2";

  const defaults = () => ({
    melhorPontuacao: 0,
    muted: false,
    // fase máxima desbloqueada (1-based) — única progressão
    faseDesbloqueada: 1,
    // herói selecionado (1-based)
    heroiId: 1,
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
    /** Desbloqueia a fase `faseId` (se for maior que a atual). */
    desbloquearFase(faseId) {
      if (faseId > (state.faseDesbloqueada || 1)) {
        state.faseDesbloqueada = faseId;
        save(state);
      }
    },
    /** Maior fase desbloqueada (1-based). */
    faseMax() {
      return state.faseDesbloqueada || 1;
    },
    setHeroi(id) {
      state.heroiId = id;
      save(state);
    },
    getHeroiId() {
      return state.heroiId || 1;
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
