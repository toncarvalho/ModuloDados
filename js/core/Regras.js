/**
 * Regras — fórmulas puras de pontuação, estrelas e moedas da partida.
 * Sem dependência do Phaser (usa só a config global JOGO), fácil de testar
 * isoladamente — mexa aqui para rebalancear o jogo com segurança.
 */
const Regras = (() => {
  return {
    /** Pontos de um acerto: base (ou chefão) multiplicada pelo combo atual. */
    pontosAcerto(isBoss, combo) {
      const base = isBoss ? JOGO.pontos.chefao : JOGO.pontos.base;
      return base * combo;
    },

    /** Bônus de pontuação ao vencer: vidas restantes + combo máximo. */
    bonusVitoria(vidas, maxCombo) {
      return vidas * JOGO.pontos.bonusVida + maxCombo * JOGO.pontos.bonusCombo;
    },

    /** Estrelas da fase (1–3 = vidas restantes; Boss Rush vale sempre 3). */
    calcularEstrelas(vidas, bossRush) {
      if (bossRush) return 3;
      return Math.max(1, Math.min(3, vidas));
    },

    /** Moedas ao vencer: acertos da partida + bônus fixo + bônus por estrela. */
    moedasVitoria(moedasPartida, estrelas) {
      return moedasPartida + JOGO.moedas.bonusVitoria + estrelas * JOGO.moedas.porEstrela;
    },

    /** HP do chefão conforme a mecânica ("blindado" tem menos HP — exige acertos seguidos). */
    hpChefao(mecanicaId) {
      if (mecanicaId === "blindado") {
        return Math.max(1, Math.round(JOGO.bossHp * JOGO.mecanicas.blindadoFatorHp));
      }
      return JOGO.bossHp;
    },

    /**
     * Power-up ganho AO ATINGIR este combo: "raio" (⚡ golpe duplo) nos múltiplos
     * de comboRaio, senão "escudo" (🛡️) nos múltiplos de comboEscudo. Máximo de
     * 1 guardado de cada; null se nenhum.
     */
    powerupPorCombo(combo, temEscudo, temRaio) {
      const p = JOGO.powerups;
      if (combo > 0 && combo % p.comboRaio === 0 && !temRaio) return "raio";
      if (combo > 0 && combo % p.comboEscudo === 0 && !temEscudo) return "escudo";
      return null;
    },
  };
})();
