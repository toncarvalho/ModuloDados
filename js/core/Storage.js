/**
 * Storage — persistência via localStorage.
 * Guarda: progresso (fase máxima), recorde, herói, estrelas por fase,
 * configurações (música/efeitos/timer/voz) e "fatos fracos" (repetição inteligente).
 */
const Storage = (() => {
  const KEY = "idolmath.save.v2";

  const defaults = () => ({
    melhorPontuacao: 0,
    faseDesbloqueada: 1, // maior fase desbloqueada (1-based)
    heroiId: 1,
    estrelas: {}, // { faseId: 0..3 } melhor estrela por fase
    fatos: {}, // { "min x max": peso }  peso alto = errou mais (repetir mais)
    config: { musica: true, efeitos: true, timer: true, voz: false },
    bossRush: false, // desbloqueado ao zerar a última fase
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? Object.assign(defaults(), JSON.parse(raw)) : defaults();
      // compat: campo antigo "muted" → efeitos
      if (typeof data.muted === "boolean") {
        data.config = data.config || {};
        if (data.config.efeitos === undefined) data.config.efeitos = !data.muted;
        delete data.muted;
      }
      data.config = Object.assign(defaults().config, data.config || {});
      return data;
    } catch (e) {
      return defaults();
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* armazenamento indisponível — segue sem persistir */
    }
  }

  function chaveFato(a, b) {
    return `${Math.min(a, b)}x${Math.max(a, b)}`;
  }

  let state = load();

  return {
    get() {
      return state;
    },

    // ---- progresso / pontuação ----
    setMelhorPontuacao(pontos) {
      if (pontos > state.melhorPontuacao) {
        state.melhorPontuacao = pontos;
        save();
      }
    },
    desbloquearFase(faseId) {
      if (faseId > (state.faseDesbloqueada || 1)) {
        state.faseDesbloqueada = faseId;
        save();
      }
    },
    faseMax() {
      return state.faseDesbloqueada || 1;
    },

    // ---- herói ----
    setHeroi(id) {
      state.heroiId = id;
      save();
    },
    getHeroiId() {
      return state.heroiId || 1;
    },

    // ---- estrelas por fase ----
    setEstrelas(faseId, estrelas) {
      const atual = state.estrelas[faseId] || 0;
      if (estrelas > atual) {
        state.estrelas[faseId] = estrelas;
        save();
      }
    },
    getEstrelas(faseId) {
      return state.estrelas[faseId] || 0;
    },
    totalEstrelas() {
      return Object.values(state.estrelas).reduce((s, n) => s + n, 0);
    },

    // ---- repetição inteligente (fatos fracos) ----
    registrarResposta(a, b, acertou) {
      const k = chaveFato(a, b);
      let p = state.fatos[k] || 0;
      p = acertou ? Math.max(0, p * 0.5 - 0.2) : Math.min(8, p + 2);
      if (p <= 0.01) delete state.fatos[k];
      else state.fatos[k] = p;
      save();
    },
    getFatos() {
      return state.fatos;
    },

    // ---- Boss Rush ----
    desbloquearBossRush() {
      if (!state.bossRush) {
        state.bossRush = true;
        save();
      }
    },
    bossRushDesbloqueado() {
      return !!state.bossRush;
    },

    // ---- configurações ----
    getConfig() {
      return state.config;
    },
    setConfig(chave, valor) {
      state.config[chave] = !!valor;
      save();
    },
  };
})();
