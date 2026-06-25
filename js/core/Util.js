/**
 * Util — helpers pequenos: vibração (mobile), voz (Web Speech) e
 * transição com fade entre cenas. Tudo opcional/defensivo.
 */
const Util = (() => {
  return {
    /** Vibra o aparelho (se suportado). */
    vibrar(ms) {
      if (navigator.vibrate) {
        try {
          navigator.vibrate(ms);
        } catch (e) {}
      }
    },

    /** Lê um texto em voz alta (Web Speech), se a configuração "voz" estiver ligada. */
    falar(texto) {
      if (!Storage.getConfig().voz) return;
      if (!("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = "pt-BR";
        u.rate = 1.0;
        u.pitch = 1.1;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    },

    pararVoz() {
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
    },

    /** Troca de cena com fade out/in suave. */
    trocarCena(scene, key, data) {
      scene.cameras.main.fadeOut(180, 13, 13, 18);
      scene.cameras.main.once("camerafadeoutcomplete", () => {
        scene.scene.start(key, data);
      });
    },
  };
})();
